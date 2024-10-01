import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  LogBox, RefreshControl, Platform, ActivityIndicator, Text, View
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { Chat } from "@/services/shared/Chat";
import { getChats } from "@/services/chats";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import {SquarePen} from "lucide-react-native";
import {getProfileColorByName} from "@/services/local/default-personalization";
import {animPapillon} from "@/utils/ui/animations";
import Reanimated, {FadeIn, FadeInDown, FadeOut} from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import { AccountService } from "@/stores/account/types";

// Voir la documentation de `react-navigation`.
//
// Nous sommes dans un cas particulier où l'on a le droit
// de faire transmettre des objets non-sérialisables dans
// le state de navigation.
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const Messages: Screen<"Messages"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(state => state.account!);
  const [chats, setChats] = useState<Chat[] | null>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useLayoutEffect(() => {
    if (showNewMessage) {
      navigation.setOptions({
        ...TabAnimatedTitle({ theme, route, navigation }),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("ChatCreate")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginRight: 16,
            }}
          >
            <NativeText
              variant={"overtitle"}
              style={{color: colors.primary}}
            >
              Nouvelle discussion
            </NativeText>
            <SquarePen color={colors.primary} size={22} />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        ...TabAnimatedTitle({ theme, route, navigation }),});
    }

  }, [navigation, route.params, theme.colors.text, showNewMessage]);

  async function refreshChats () {
    const chats = await getChats(account);
    setChats(chats);
    if (account.service === AccountService.EcoleDirecte) {
      setShowNewMessage(account.abilities.canReplyChats);
    }
  }

  useEffect(() => {
    refreshChats();
    navigation.addListener("focus", refreshChats);
  }, [account?.instance]);

  // useEffect(() => {
  //   if (account.service  === AccountService.EcoleDirecte) setShowNewMessage(false);
  // }, [account.service]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          refreshChats()
            .then(() => setRefreshing(false));
        }}/>
      }
    >
      {!chats ? (
        <Reanimated.View
          entering={FadeIn.springify().mass(1).damping(20).stiffness(300)}
          exiting={Platform.OS === "ios" ? FadeOut.springify().mass(1).damping(20).stiffness(300) : undefined}
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 26
          }}
        >
          <ActivityIndicator size={"large"} />

          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              textAlign: "center",
              fontFamily: "semibold",
              marginTop: 10,
            }}
          >
            Chargement des discussions...
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              textAlign: "center",
              fontFamily: "medium",
              marginTop: 4,
              opacity: 0.5,
            }}
          >
            Vos conversations arrivent...
          </Text>
        </Reanimated.View>
      ) : chats.length === 0 ? (
        <MissingItem
          emoji="💬"
          title="Aucune discussion"
          description="Commencez une nouvelle discussion pour les afficher ici."
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOut)}
          style={{paddingVertical: 26}}
        />
      ) : (
        <NativeList style={{marginBottom: 20}}>
          {chats.map((chat) => (
            <NativeItem
              key={chat.id}
              onPress={() => navigation.navigate("Chat", { handle: chat })}
              leading={
                <InitialIndicator
                  initial={chat.isGroup ? "group":parse_initials(chat.recipient)}
                  color={getProfileColorByName(chat.recipient).bright}
                  textColor={getProfileColorByName(chat.recipient).dark}
                />
              }
            >
              <NativeText variant={"subtitle"}>
                {chat.recipient}
              </NativeText>
              <View style={{flexDirection: "row", alignItems: "center", gap: 5}}>
                {chat.unreadMessages > 0 && (
                  <View
                    style={{
                      backgroundColor: getProfileColorByName(chat.recipient).dark,
                      borderRadius: 5,
                      height: 10,
                      width: 10,
                    }}
                  />
                )}
                <NativeText>
                  {chat.subject || "Aucun sujet"}
                </NativeText>
              </View>
            </NativeItem>
          ))}
        </NativeList>
      )}
    </ScrollView>
  );
};


export default Messages;
