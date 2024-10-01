import {ThemesMeta} from "@/utils/chat/themes/Themes.types";

async function GetAvailableThemes (): Promise<ThemesMeta[]> {
  let f = await fetch("https://raw.githubusercontent.com/PapillonApp/chat-themes/refs/heads/main/themes.json");
  let r = await f.json();
  return r.map((theme) => {
    return {
      name: theme.name,
      author: theme.author,
      lightIcon: "https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.path + "/" + theme.icon,
      darkIcon: theme.darkIcon ?
        "https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.path + "/" + theme.darkIcon
        :
        "https://raw.githubusercontent.com/PapillonApp/chat-themes/main/" + theme.path + "/" + theme.icon,
      githubPath: theme.path,
      version: theme.version,
    };
  });
}

export default GetAvailableThemes;