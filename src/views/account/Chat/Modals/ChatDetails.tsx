import type {Screen} from "@/router/helpers/types";
import {Alert, Animated, Image, ScrollView, TouchableOpacity, View} from "react-native";
import {useCurrentAccount} from "@/stores/account";
import {useTheme} from "@react-navigation/native";
import {Trash} from "lucide-react-native";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import {getProfileColorByName} from "@/services/local/default-personalization";
import {NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import React, {useEffect} from "react";
import {deleteDiscussion, getDiscussionParticipants} from "@/services/pronote/chats";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";

const ChatDetails: Screen<"ChatDetails"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  const [scrollY] = React.useState(new Animated.Value(0));

  const account = useCurrentAccount(state => state.account!);

  const [participants, setParticipants] = React.useState([]);

  useEffect(() => {
    getDiscussionParticipants(account, route.params.handle)
      .then((participants) => {
        setParticipants(participants);
      });
  }, [route.params.handle]);

  return (
    <View style={{flex: 1}}>
      <PapillonModernHeader outsideNav={true}>
        <Animated.View style={{
          opacity: scrollY.interpolate({
            inputRange: [150, 250],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [150, 250],
                outputRange: [20, 0],
                extrapolate: "clamp",
              }),
            },
          ],
          zIndex: 100,
        }}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <TouchableOpacity onPress={() => navigation.navigate("ChatDetails")} style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
              <InitialIndicator
                initial={route.params.handle.isGroup ? "group":parse_initials(route.params.handle.recipient)}
                color={getProfileColorByName(route.params.handle.recipient).bright}
                textColor={getProfileColorByName(route.params.handle.recipient).dark}
                size={38}
              />
              <View style={{flex: 1}}>
                <NativeText variant="subtitle" numberOfLines={1}>{route.params.handle.subject ? route.params.handle.recipient: "Conversation avec"}</NativeText>
                <NativeText variant="title" numberOfLines={1}>{route.params.handle.subject || route.params.handle.recipient}</NativeText>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PapillonModernHeader>
      <ScrollView
        contentContainerStyle={{padding: 20, paddingTop: 70}}
        onScroll={(event) => {
          scrollY.setValue(event.nativeEvent.contentOffset.y);
        }}
      >
        <View style={{alignItems: "center"}}>
          <InitialIndicator
            initial={route.params.handle.isGroup ? "group":parse_initials(route.params.handle.recipient)}
            color={getProfileColorByName(route.params.handle.recipient).bright}
            textColor={getProfileColorByName(route.params.handle.recipient).dark}
            size={80}
          />
          <NativeText variant="subtitle" style={{marginTop: 16}}>{route.params.handle.recipient}</NativeText>
          <NativeText variant="titleLarge">{route.params.handle.subject || "Aucun sujet"}</NativeText>
        </View>
        <NativeList>
          <NativeItem
            onPress={() => {
              navigation.navigate("ChatThemes", route.params);
            }}
            leading={
              <Image
                source={{uri: theme.dark ? route.params.theme.meta.darkIcon:route.params.theme.meta.lightIcon}}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            }
          >
            <NativeText variant="title">Thème</NativeText>
            <NativeText>{route.params.theme.meta.name}</NativeText>
          </NativeItem>
        </NativeList>
        <NativeListHeader label={"Destinataires (" + participants.length + ")"}/>
        <NativeList>
          {participants.map((participant, index) => (
            <NativeItem
              leading={participant.name.includes(account.studentName.first) && participant.name.includes(account.studentName.last) ? (
                <Image
                  source={(account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== "") ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service)}
                  style={{
                    height: 42,
                    width: 42,
                    borderRadius: 42 / 2,
                  }}
                />
              ):(
                <InitialIndicator
                  initial={parse_initials(participant.name)}
                  color={getProfileColorByName(participant.name).bright}
                  textColor={getProfileColorByName(participant.name).dark}
                />
              )
              }
              key={index}
            >
              <NativeText variant="title">{participant.name}</NativeText>
              <NativeText variant="subtitle">{participant.name.includes(account.studentName.first) && participant.name.includes(account.studentName.last) ? "Vous":participant.kind}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
        <NativeListHeader label={"Paramètres"}/>
        <NativeList>
          <NativeItem
            leading={
              <View style={{width: 30, height: 30, justifyContent: "center", alignItems: "center"}}>
                <Trash size={24} color={"#D10000"}/>
              </View>
            }
            chevron={false}
            onPress={() => {
              Alert.alert(
                "Supprimer la conversation",
                "Êtes-vous sûr de vouloir supprimer cette conversation ?",
                [
                  {
                    text: "Annuler",
                    style: "cancel",
                  },
                  {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                      deleteDiscussion(account, route.params.handle)
                        .then(() => {
                          navigation.goBack();
                          navigation.goBack();
                        });
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <NativeText variant="title" style={{color: "#D10000"}}>Supprimer la conversation</NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </View>
  );
};

export default ChatDetails;