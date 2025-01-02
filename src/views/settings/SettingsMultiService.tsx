import React, {useRef, useState} from "react";
import {Alert, Image, ScrollView, Switch, TextInput, View} from "react-native";
import {useTheme} from "@react-navigation/native";
import type {Screen} from "@/router/helpers/types";
import MultiServiceContainerCard from "@/components/Settings/MultiServiceContainerCard";
import {NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {ImageIcon, PlugZap, Plus, Type, Trash2} from "lucide-react-native";
import {useAccounts} from "@/stores/account";
import {useMultiService} from "@/stores/multiService";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import * as ImagePicker from "expo-image-picker";
import {animPapillon} from "@/utils/ui/animations";
import {ZoomIn, ZoomOut} from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import {MultiServiceSpace} from "@/stores/multiService/types";
import {AccountService, PapillonMultiServiceSpace} from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";

const SettingsMultiService: Screen<"SettingsMultiService"> = ({ navigation }) => {
  const theme = useTheme();
  const toggleMultiService = useMultiService(store => store.toggleEnabledState);
  const multiServiceEnabled = useMultiService(store => store.enabled);
  const multiServiceSpaces = useMultiService(store => store.spaces);
  const createMultiServiceSpace = useMultiService(store => store.create);
  const deleteMultiServiceSpace = useMultiService(store => store.remove);
  const accounts = useAccounts();

  const [spaceCreationSheetOpened, setSpaceCreationSheetOpened] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const spaceNameRef = useRef<TextInput>(null);

  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const selectPicture = async () => {
    setLoadingImage(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const img = "data:image/jpeg;base64," + result.assets[0].base64;
      setSelectedImage(img);
    }

    setLoadingImage(false);
  };

  const [loadingCreation, setLoading] = useState(false);
  const createSpace = () => {
    setLoading(true);
    if (spaceName == "") {
      Alert.alert("Aucun titre défini", "Vous devez définir un titre à l'environnement multi service pour pouvoir le créer.");
      setLoading(false);
      return;
    }

    const localID = uuid();

    const linkedAccount: PapillonMultiServiceSpace = {
      isExternal: false,
      linkedExternalLocalIDs: [],
      authentication: null,
      identity: {},
      identityProvider: {
        name: "Environnement multiservice Papillon"
      },
      instance: null,
      localID: localID,
      name: spaceName,
      personalization: {
        profilePictureB64: selectedImage || undefined
      },
      service: AccountService.PapillonMultiService,
      studentName: { // TODO
        first: spaceName,
        last: ""
      }
    };

    const space: MultiServiceSpace = {
      accountLocalID: localID,
      featuresServices: {
        Grades: null,
        Timetable: null,
        Homeworks: null,
        Attendance: null,
        News: null
      },
      name: spaceName,
      image: selectedImage || undefined
    };
    createMultiServiceSpace(space, linkedAccount);
    accounts.create(linkedAccount);
    setSpaceCreationSheetOpened(false);
    setLoading(false);
    setSelectedImage(null);
    setSpaceName("");
  };
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingBottom: 25
      }}
    >
      <MultiServiceContainerCard theme={theme} />

      <NativeListHeader label="Options" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={multiServiceEnabled ?? false}
              onValueChange={() => toggleMultiService()}
            />
          }
          leading={
            <NativeIcon
              icon={<PlugZap />}
              color="#cb7712"
            />
          }
        >
          <NativeText variant="title">
            Multiservice
          </NativeText>
          <NativeText variant="subtitle">
            Activer le multiservice te permet de créer ton premier espace virtuel.
          </NativeText>
        </NativeItem>
      </NativeList>

      {multiServiceEnabled && (
        <>
          <NativeListHeader label="Mes Espaces"/>
          <NativeList>
            {multiServiceSpaces.map(space => (
              <NativeItem
                key={multiServiceSpaces.indexOf(space)}
                leading={
                  <Image
                    source={space.image ? { uri: space.image }: defaultProfilePicture(AccountService.PapillonMultiService, "") }
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 3,
                      // @ts-expect-error : borderCurve is not in the Image style
                      borderCurve: "continuous",
                    }}
                  />
                }
                trailing={
                  <Trash2
                    onPress={() => {
                      accounts.remove(space.accountLocalID);
                      deleteMultiServiceSpace(space.accountLocalID);
                    }}
                    color="#CF0029"
                  />
                }
              >
                <NativeText variant="title">
                  {space.name}
                </NativeText>
              </NativeItem>
            ))}
            <NativeItem
              onPress={() => setSpaceCreationSheetOpened(true)}
              icon={<Plus/>}
            >
              <NativeText>
                Nouvel espace
              </NativeText>
              <NativeText variant="subtitle">
                Créer un nouvel environnement multi service
              </NativeText>
            </NativeItem>
          </NativeList>
          <BottomSheet setOpened={(opened) => opened} opened={spaceCreationSheetOpened} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <NativeListHeader label="Créer un espace"/>
            <NativeList>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  gap: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <NativeItem
                    onPress={() => spaceNameRef.current?.focus()}
                    chevron={false}
                    icon={<Type/>}
                  >
                    <NativeText>
                      Titre de l'espace
                    </NativeText>
                    <TextInput
                      style={{
                        fontSize: 16,
                        fontFamily: "semibold",
                        color: theme.colors.text,
                      }}
                      placeholder="Mon espace multi service"
                      placeholderTextColor={theme.colors.text + "80"}
                      value={spaceName}
                      onChangeText={setSpaceName}
                      ref={spaceNameRef}
                    />
                  </NativeItem>
                  <NativeItem
                    onPress={() => selectPicture()}
                    icon={loadingImage ? <PapillonSpinner
                      size={18}
                      color="white"
                      strokeWidth={2.8}
                      entering={animPapillon(ZoomIn)}
                      exiting={animPapillon(ZoomOut)}
                    />: <ImageIcon/>}
                    trailing={selectedImage && <Image
                      source={{ uri: selectedImage }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 90,
                        // @ts-expect-error : borderCurve is not in the Image style
                        borderCurve: "continuous",
                      }}
                    />}
                  >
                    <NativeText>
                      Image
                    </NativeText>
                    <NativeText
                      style={{
                        fontSize: 16,
                        fontFamily: "semibold",
                        color: theme.colors.text + "80",
                      }}
                    >
                      Définir une image
                    </NativeText>
                  </NativeItem>
                </View>
              </View>
            </NativeList>
            <NativeList>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  gap: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <NativeItem
                    onPress={() => createSpace()}
                    trailing={loadingCreation && <PapillonSpinner
                      size={18}
                      color="white"
                      strokeWidth={2.8}
                      entering={animPapillon(ZoomIn)}
                      exiting={animPapillon(ZoomOut)}
                    />}
                  >
                    <NativeText>
                      Créer l'espace
                    </NativeText>
                  </NativeItem>
                  <NativeItem
                    onPress={() => setSpaceCreationSheetOpened(false)}
                  >
                    <NativeText>
                      Annuler
                    </NativeText>
                  </NativeItem>
                </View>
              </View>
            </NativeList>
          </BottomSheet>
        </>
      )}
    </ScrollView>
  );
};



export default SettingsMultiService;