import {ThemesMeta} from "@/utils/chat/themes/Themes.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function isThemeDownloaded (theme: ThemesMeta): Promise<boolean> {
  let result = await AsyncStorage.getItem("theme_" + theme.name + "_@" + theme.author);
  return result !== null;
}

export default isThemeDownloaded;