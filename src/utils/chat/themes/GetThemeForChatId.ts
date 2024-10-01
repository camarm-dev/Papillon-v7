import {Theme} from "@/utils/chat/themes/Themes.types";
import {DefaultTheme} from "@/consts/DefaultTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function GetThemeForChatId (chatId: string): Promise<Theme> {
  //Just a stupid way to clone an object
  let theme: Theme = JSON.parse(JSON.stringify(DefaultTheme));

  //Get theme from AsyncStorage
  let themeName = await AsyncStorage.getItem("chat_theme_" + chatId);
  if (themeName === null) return theme;

  //Get theme.json from AsyncStorage
  let theme_json_str = await AsyncStorage.getItem(themeName);
  if (theme_json_str === null) return theme;

  //Parse theme.json
  let theme_json = JSON.parse(theme_json_str);

  //Set theme metadata
  theme.meta.name = theme_json.name;
  theme.meta.author = theme_json.author;
  theme.meta.lightIcon = theme_json.lightIcon;
  theme.meta.darkIcon = theme_json.darkIcon;
  theme.meta.version = theme_json.version;

  //Set theme light mode
  theme.lightModifier.headerBackgroundColor = theme_json.lightMode.headerBackgroundColor || theme.lightModifier.headerBackgroundColor;
  theme.lightModifier.headerTextColor = theme_json.lightMode.headerTextColor || theme.lightModifier.headerTextColor;

  theme.lightModifier.chatBackgroundColor = theme_json.lightMode.chatBackgroundColor || theme.lightModifier.chatBackgroundColor;

  if (theme_json.lightMode.chatBackgroundImage) {
    let image = await AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.lightMode.chatBackgroundImage);
    if (image !== null) {
      theme.lightModifier.chatBackgroundImage = image;
    }
  }

  theme.lightModifier.sentMessageBackgroundColor = theme_json.lightMode.sentMessageBackgroundColor || theme.lightModifier.sentMessageBackgroundColor;
  theme.lightModifier.sentMessageTextColor = theme_json.lightMode.sentMessageTextColor || theme.lightModifier.sentMessageTextColor;
  theme.lightModifier.sentMessageBorderColor = theme_json.lightMode.sentMessageBorderColor || theme.lightModifier.sentMessageBorderColor;
  theme.lightModifier.sentMessageBorderSize = theme_json.lightMode.sentMessageBorderSize || theme.lightModifier.sentMessageBorderSize;
  theme.lightModifier.sentMessageborderRadiusDefault = theme_json.lightMode.sentMessageborderRadiusDefault || theme.lightModifier.sentMessageborderRadiusDefault;
  theme.lightModifier.sentMessageBorderRadiusLinked = theme_json.lightMode.sentMessageBorderRadiusLinked || theme.lightModifier.sentMessageBorderRadiusLinked;

  theme.lightModifier.receivedMessageBackgroundColor = theme_json.lightMode.receivedMessageBackgroundColor || theme.lightModifier.receivedMessageBackgroundColor;
  theme.lightModifier.receivedMessageTextColor = theme_json.lightMode.receivedMessageTextColor || theme.lightModifier.receivedMessageTextColor;
  theme.lightModifier.receivedMessageBorderColor = theme_json.lightMode.receivedMessageBorderColor || theme.lightModifier.receivedMessageBorderColor;
  theme.lightModifier.receivedMessageBorderSize = theme_json.lightMode.receivedMessageBorderSize || theme.lightModifier.receivedMessageBorderSize;
  theme.lightModifier.receivedMessageborderRadiusDefault = theme_json.lightMode.receivedMessageborderRadiusDefault || theme.lightModifier.receivedMessageborderRadiusDefault;
  theme.lightModifier.receivedMessageBorderRadiusLinked = theme_json.lightMode.receivedMessageBorderRadiusLinked || theme.lightModifier.receivedMessageBorderRadiusLinked;

  theme.lightModifier.inputBarBackgroundColor = theme_json.lightMode.inputBarBackgroundColor || theme.lightModifier.inputBarBackgroundColor;
  theme.lightModifier.sendButtonBackgroundColor = theme_json.lightMode.sendButtonBackgroundColor || theme.lightModifier.sendButtonBackgroundColor;

  //Set theme dark mode
  theme.darkModifier.headerBackgroundColor = theme_json.darkMode.headerBackgroundColor || theme_json.lightMode.headerBackgroundColor || theme.darkModifier.headerBackgroundColor;
  theme.darkModifier.headerTextColor = theme_json.darkMode.headerTextColor || theme_json.lightMode.headerTextColor || theme.darkModifier.headerTextColor;

  theme.darkModifier.chatBackgroundColor = theme_json.darkMode.chatBackgroundColor || theme_json.lightMode.chatBackgroundColor || theme.darkModifier.chatBackgroundColor;
  if (theme_json.darkMode.chatBackgroundImage) {
    let image = await AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.darkMode.chatBackgroundImage);
    if (image !== null) {
      theme.darkModifier.chatBackgroundImage = image;
    }
  } else if (theme_json.lightMode.chatBackgroundImage) {
    theme.darkModifier.chatBackgroundImage = theme_json.lightMode.chatBackgroundImage;
  }

  theme.darkModifier.sentMessageBackgroundColor = theme_json.darkMode.sentMessageBackgroundColor || theme_json.lightMode.sentMessageBackgroundColor || theme.darkModifier.sentMessageBackgroundColor;
  theme.darkModifier.sentMessageTextColor = theme_json.darkMode.sentMessageTextColor || theme_json.lightMode.sentMessageTextColor || theme.darkModifier.sentMessageTextColor;
  theme.darkModifier.sentMessageBorderColor = theme_json.darkMode.sentMessageBorderColor || theme_json.lightMode.sentMessageBorderColor || theme.darkModifier.sentMessageBorderColor;
  theme.darkModifier.sentMessageBorderSize = theme_json.darkMode.sentMessageBorderSize || theme_json.lightMode.sentMessageBorderSize || theme.darkModifier.sentMessageBorderSize;
  theme.darkModifier.sentMessageborderRadiusDefault = theme_json.darkMode.sentMessageborderRadiusDefault || theme_json.lightMode.sentMessageborderRadiusDefault || theme.darkModifier.sentMessageborderRadiusDefault;
  theme.darkModifier.sentMessageBorderRadiusLinked = theme_json.darkMode.sentMessageBorderRadiusLinked || theme_json.lightMode.sentMessageBorderRadiusLinked || theme.darkModifier.sentMessageBorderRadiusLinked;

  theme.darkModifier.receivedMessageBackgroundColor = theme_json.darkMode.receivedMessageBackgroundColor || theme_json.lightMode.receivedMessageBackgroundColor || theme.darkModifier.receivedMessageBackgroundColor;
  theme.darkModifier.receivedMessageTextColor = theme_json.darkMode.receivedMessageTextColor || theme_json.lightMode.receivedMessageTextColor || theme.darkModifier.receivedMessageTextColor;
  theme.darkModifier.receivedMessageBorderColor = theme_json.darkMode.receivedMessageBorderColor || theme_json.lightMode.receivedMessageBorderColor || theme.darkModifier.receivedMessageBorderColor;
  theme.darkModifier.receivedMessageBorderSize = theme_json.darkMode.receivedMessageBorderSize || theme_json.lightMode.receivedMessageBorderSize || theme.darkModifier.receivedMessageBorderSize;
  theme.darkModifier.receivedMessageborderRadiusDefault = theme_json.darkMode.receivedMessageborderRadiusDefault || theme_json.lightMode.receivedMessageborderRadiusDefault || theme.darkModifier.receivedMessageborderRadiusDefault;
  theme.darkModifier.receivedMessageBorderRadiusLinked = theme_json.darkMode.receivedMessageBorderRadiusLinked || theme_json.lightMode.receivedMessageBorderRadiusLinked || theme.darkModifier.receivedMessageBorderRadiusLinked;

  theme.darkModifier.inputBarBackgroundColor = theme_json.darkMode.inputBarBackgroundColor || theme_json.lightMode.inputBarBackgroundColor || theme.darkModifier.inputBarBackgroundColor;
  theme.darkModifier.sendButtonBackgroundColor = theme_json.darkMode.sendButtonBackgroundColor || theme_json.lightMode.sendButtonBackgroundColor || theme.darkModifier.sendButtonBackgroundColor;

  return theme;
}

export default GetThemeForChatId;