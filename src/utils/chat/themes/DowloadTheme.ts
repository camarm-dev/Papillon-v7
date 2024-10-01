import {ThemesMeta} from "@/utils/chat/themes/Themes.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function DowloadTheme (theme: ThemesMeta): Promise<boolean> {
  //theme.json
  console.log("https://raw.githubusercontent.com/PapillonApp/chat-themes/refs/heads/main/" + theme.githubPath + "/theme.json");
  let f_theme = await fetch("https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.githubPath + "/theme.json");
  let r_theme = await f_theme.json();
  r_theme.icon = "https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.githubPath + "/" + r_theme.icon;
  r_theme.darkIcon = r_theme.darkIcon ? "https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.githubPath + "/" + r_theme.darkIcon : r_theme.icon;

  //Download images as base64
  let to_download = [];
  if (r_theme.darkMode.chatBackgroundImage)
    to_download.push(r_theme.darkMode.chatBackgroundImage);
  if (r_theme.lightMode.chatBackgroundImage)
    to_download.push(r_theme.lightMode.chatBackgroundImage);

  for (let i = 0; i < to_download.length; i++) {
    let f = await fetch("https://raw.githubusercontent.com/PapillonApp/chat-themes/refs/heads/main/" + theme.githubPath + "/" + to_download[i]);
    let r = await f.blob();
    let reader = new FileReader();
    reader.readAsDataURL(r);
    reader.onloadend = function () {
      let base64data = reader.result;
      AsyncStorage.setItem("theme_" + theme.name + "_@" + theme.author + "_" + to_download[i], base64data);
    };
  }

  //Save theme.json
  await AsyncStorage.setItem("theme_" + theme.name + "_@" + theme.author, JSON.stringify(r_theme));
  return true;
}

export default DowloadTheme;