import type {Screen} from "@/router/helpers/types";
import {View, ScrollView, Image, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
import GetAvailableThemes from "@/utils/chat/themes/GetAvailableThemes";
import {NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {useTheme} from "@react-navigation/native";
import {ThemesMeta} from "@/utils/chat/themes/Themes.types";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {ChevronLeft} from "lucide-react-native";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import DowloadTheme from "@/utils/chat/themes/DowloadTheme";
import isThemeDownloaded from "@/utils/chat/themes/IsThemeDownloaded";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChatId";

const ChatThemes: Screen<"ChatThemes"> = ({
  navigation,
  route,
}) => {
  const uiTheme = useTheme();
  const [themes, setThemes] = useState<ThemesMeta[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemesMeta | null>(null);
  const [downloadingThemes, setDownloadingThemes] = useState<number[]>([]);

  useEffect(() => {
    GetAvailableThemes().then(themes => {
      setThemes(themes);
    });
    GetThemeForChatId(route.params.handle.id)
      .then(theme => {
        setSelectedTheme(theme.meta.name + "_" + theme.meta.author);
      });
  }, []);
  return (
    <View>
      <PapillonModernHeader outsideNav={true}>
        <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color={uiTheme.colors.text + "80"} size={26}  />
          </TouchableOpacity>
          <NativeText variant={"title"}>Thèmes</NativeText>
        </View>
      </PapillonModernHeader>
      <ScrollView
        style={{height: "100%"}}
        contentContainerStyle={{
          paddingTop: 70,
          padding: 16,
        }}
      >
        <NativeListHeader label={"Thèmes disponibles"}/>
        <NativeList>
          <NativeItem
            leading={
              <Image
                source={require("../../../../../assets/images/icon_app_papillon.png")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: uiTheme.colors.border,
                }}
              />
            }
            title={"Par défaut"}
            subtitle={"@PapillonApp"}
            endPadding={12}
            trailing={
              <PapillonCheckbox
                checked={selectedTheme === "Default_PapillonApp"}
                color={uiTheme.colors.primary}
                onPress={async () => {
                  await AsyncStorage.removeItem("chat_theme_" + route.params.handle.id);
                  setSelectedTheme("Default_PapillonApp");
                }}
              />
            }
          />
          {themes.map((theme,index) => (
            <NativeItem
              key={index}
              leading={
                <Image
                  source={{uri: uiTheme.dark ? theme.darkIcon : theme.lightIcon}}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: uiTheme.colors.border,
                  }}
                />
              }
              title={theme.name}
              subtitle={"@" + theme.author}
              endPadding={12}
              trailing={
                <PapillonCheckbox
                  checked={selectedTheme === theme.name + "_" + theme.author}
                  color={uiTheme.colors.primary}
                  loading={downloadingThemes.includes(index)}
                  onPress={async () => {
                    let isDownloaded: Boolean = await isThemeDownloaded(theme);
                    if (!isDownloaded) {
                      setDownloadingThemes([...downloadingThemes, index]);
                      await DowloadTheme(theme);
                      setDownloadingThemes(downloadingThemes.filter((i) => i !== index));
                    }
                    await AsyncStorage.setItem("chat_theme_" + route.params.handle.id, "theme_" + theme.name + "_@" + theme.author);
                    setSelectedTheme(theme.name + "_" + theme.author);
                  }}
                />
              }
            />
          ))}
        </NativeList>
      </ScrollView>
    </View>
  );
};

export default ChatThemes;