import React, {useEffect, useRef, useState} from "react";
import {
  FlatList, Image, KeyboardAvoidingView,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import type { ChatMessage } from "@/services/shared/Chat";
import {createDiscussion, getChatMessages, getChats} from "@/services/chats";
import {ChevronLeft, Send} from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import {getProfileColorByName} from "@/services/local/default-personalization";
import InitialIndicator from "@/components/News/InitialIndicator";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import RenderHTML from "react-native-render-html";
import {markDiscussionAsRead, sendDiscussionMessage} from "@/services/pronote/chats";
import Animated, {FadeIn, FadeInDown, FadeOut} from "react-native-reanimated";
import {animPapillon} from "@/utils/ui/animations";
import MissingItem from "@/components/Global/MissingItem";
import {DefaultTheme} from "@/consts/DefaultTheme";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChatId";

const Chat: Screen<"Chat"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const account = useCurrentAccount(state => state.account!);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [chatTheme, setChatTheme] = useState(DefaultTheme);

  async function refreshMessages (handlerRefresh = false) {
    if (route.params.handle.id === "new") return;

    console.log(route.params.handle.id);
    if (handlerRefresh) {
      let chats = await getChats(account);
      let chat = chats.find(chat => chat.id === route.params.handle.id);
      if (chat) {
        let messages = await getChatMessages(account, chat);
        setMessages(messages.reverse());
        return;
      }
    }
    const messages = await getChatMessages(account, route.params.handle);
    setMessages(messages.reverse());
    setLoading(false);
  }

  useEffect(() => {
    if (route.params.newData) {
      setLoading(false);
      setMessages([]);
      return;
    }
    GetThemeForChatId(route.params.handle.id)
      .then(theme => {
        setChatTheme(theme);
      });
    var timeout: any;
    refreshMessages()
      .then(() => {
        setIsFirstLoad(false);
        markDiscussionAsRead(account, route.params.handle);
        timeout = setTimeout(() => {
          refreshMessages(true)
            .then(() => {
              timeout = setTimeout(() => {
                refreshMessages(true);
              }, 5000);
            });
        }, 5000);
      });
    return () => clearTimeout(timeout);
  }, [route.params.handle]);

  return (
    <View style={{
      flex: 1,
      paddingBottom: insets.bottom,
      backgroundColor: theme.dark ? chatTheme.darkModifier.inputBarBackgroundColor : chatTheme.lightModifier.inputBarBackgroundColor,
    }}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="padding"
      >
        <PapillonModernHeader outsideNav={false} color={theme.dark ? chatTheme.darkModifier.headerBackgroundColor: chatTheme.lightModifier.headerBackgroundColor}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft color={
                (theme.dark ? chatTheme.darkModifier.headerTextColor: chatTheme.lightModifier.headerTextColor) + "80"
              } size={26}  />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ChatModal", {handle: route.params.handle, theme: chatTheme})} style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
              <InitialIndicator
                initial={route.params.handle.isGroup ? "group":parse_initials(route.params.handle.recipient)}
                color={getProfileColorByName(route.params.handle.recipient).bright}
                textColor={getProfileColorByName(route.params.handle.recipient).dark}
                size={38}
              />
              <View style={{flex: 1}}>
                <NativeText
                  variant="subtitle"
                  numberOfLines={1}
                  style={{
                    color: theme.dark ? chatTheme.darkModifier.headerTextColor : chatTheme.lightModifier.headerTextColor,
                  }}
                >
                  {route.params.handle.subject ? route.params.handle.recipient: "Conversation avec"}
                </NativeText>
                <NativeText
                  variant="title"
                  numberOfLines={1}
                  style={{
                    color: theme.dark ? chatTheme.darkModifier.headerTextColor : chatTheme.lightModifier.headerTextColor,
                  }}
                >
                  {route.params.handle.subject || route.params.handle.recipient}
                </NativeText>
              </View>
            </TouchableOpacity>
          </View>
        </PapillonModernHeader>
        {theme.dark ?
          chatTheme.darkModifier.chatBackgroundImage && (
            <Image
              source={{uri: chatTheme.darkModifier.chatBackgroundImage}}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
              }}
            />
          )
          : chatTheme.lightModifier.chatBackgroundImage && (
            <Image
              source={{uri: chatTheme.lightModifier.chatBackgroundImage}}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
              }}
            />
          )
        }
        {!loading ? messages.length > 0 ? (
          <FlatList
            data={messages}
            ref={flatListRef}
            contentContainerStyle={{
              padding: 20,
              paddingTop: insets.top + 70,
            }}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToOffset({
                animated: false,
                offset: 1000 * (messages?.length || 0),
              });
            }}
            renderItem={item  => (
              <Animated.View
                entering={isFirstLoad ? null:animPapillon(FadeInDown)}
                style={{
                  marginTop: messages[item.index - 1] ?
                    (messages[item.index - 1].isAuthor === item.item.isAuthor ? -6 : 10)
                    : 0,
                }}
              >
                <View style={{
                  width: "85%",
                  marginLeft: item.item.isAuthor ? "auto":0,
                  alignItems: item.item.isAuthor ? "flex-end": "flex-start",
                  gap: 6,
                  marginTop: 10,
                }}>
                  {
                    (
                      item.index === 0 ||
                                      (
                                        messages[item.index - 1] &&
                                          messages[item.index - 1].isAuthor !== item.item.isAuthor
                                      )
                    )
                                  && (
                                    <View
                                      style={{
                                        flexDirection: item.item.isAuthor ? "row" : "row-reverse",
                                        alignItems: "center",
                                        gap: 7
                                      }}
                                    >
                                      <NativeText variant={"subtitle"}>
                                        {
                                          item.item.date.toLocaleString("fr-FR", {
                                            month: "numeric",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                          })
                                        }
                                      </NativeText>
                                      <View style={{height: 5, width: 5, backgroundColor: colors.text, borderRadius: 5, opacity: 0.6}} />
                                      <NativeText variant={"subtitle"}>
                                        {item.item.isAuthor ? "Vous": item.item.author.replaceAll("Mme ", "").replaceAll("M. ", "")}
                                      </NativeText>
                                      {item.item.isAuthor ? (
                                        <Image
                                          source={(account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== "") ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service)}
                                          style={{
                                            height: 25,
                                            width: 25,
                                            borderRadius: 25 / 2,
                                          }}
                                        />
                                      ) : (
                                        <InitialIndicator
                                          initial={parse_initials(item.item.author)}
                                          color={getProfileColorByName(item.item.author).bright}
                                          textColor={getProfileColorByName(item.item.author).dark}
                                          size={25}
                                        />
                                      )}
                                    </View>
                                  )}
                  <View
                    style={{
                      backgroundColor: item.item.isAuthor ?
                        theme.dark ? chatTheme.darkModifier.sentMessageBackgroundColor : chatTheme.lightModifier.sentMessageBackgroundColor
                        :
                        theme.dark ? chatTheme.darkModifier.receivedMessageBackgroundColor : chatTheme.lightModifier.receivedMessageBackgroundColor,
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      borderWidth: item.item.isAuthor ?
                        theme.dark ? chatTheme.darkModifier.sentMessageBorderSize : chatTheme.lightModifier.sentMessageBorderSize
                        :
                        theme.dark ? chatTheme.darkModifier.receivedMessageBorderSize : chatTheme.lightModifier.receivedMessageBorderSize
                      ,
                      borderColor: item.item.isAuthor ?
                        theme.dark ? chatTheme.darkModifier.sentMessageBorderColor : chatTheme.lightModifier.sentMessageBorderColor
                        :
                        theme.dark ? chatTheme.darkModifier.receivedMessageBorderColor : chatTheme.lightModifier.receivedMessageBorderColor
                      ,
                      shadowRadius: 6,
                      shadowColor: "#000",
                      shadowOffset: {width: 0, height: 5},
                      shadowOpacity: item.item.isAuthor ? 0 : 0.04,
                      //FOR RECIPIENT
                      borderTopStartRadius: !item.item.isAuthor ?
                        (
                          messages[item.index - 1] ?
                            (messages[item.index - 1].isAuthor ?
                              theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault
                              :
                              theme.dark ? chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme.lightModifier.receivedMessageBorderRadiusLinked
                            )
                            :
                            theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault
                        )
                        : theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault,
                      borderBottomStartRadius: !item.item.isAuthor ?
                        (
                          messages[item.index + 1] ?
                            (messages[item.index + 1].isAuthor ?
                              theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault
                              :
                              theme.dark ? chatTheme.darkModifier.receivedMessageBorderRadiusLinked : chatTheme.lightModifier.receivedMessageBorderRadiusLinked
                            )
                            :
                            theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault
                        )
                        : theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault,
                      //FOR AUTHOR
                      borderTopEndRadius: item.item.isAuthor ?
                        (
                          messages[item.index - 1] ?
                            (messages[item.index - 1].isAuthor ?
                              theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault
                              :
                              theme.dark ? chatTheme.darkModifier.sentMessageBorderRadiusLinked : chatTheme.lightModifier.sentMessageBorderRadiusLinked
                            )
                            : theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault
                        )
                        : theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                      borderBottomEndRadius: item.item.isAuthor ?
                        (
                          messages[item.index + 1] ?
                            (messages[item.index + 1].isAuthor ?
                              theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault
                              :
                              theme.dark ? chatTheme.darkModifier.sentMessageBorderRadiusLinked : chatTheme.lightModifier.sentMessageBorderRadiusLinked
                            )
                            : theme.dark ? chatTheme.darkModifier.sentMessageborderRadiusDefault : chatTheme.lightModifier.sentMessageborderRadiusDefault
                        )
                        : theme.dark ? chatTheme.darkModifier.receivedMessageborderRadiusDefault : chatTheme.lightModifier.receivedMessageborderRadiusDefault,
                    }}
                  >
                    <RenderHTML
                      source={{html: item.item.content ?? "<div></div>"}}
                      contentWidth={300}
                      defaultTextProps={{
                        style: {
                          color: item.item.isAuthor ?
                            theme.dark ? chatTheme.darkModifier.sentMessageTextColor : chatTheme.lightModifier.sentMessageTextColor
                            :
                            theme.dark ? chatTheme.darkModifier.receivedMessageTextColor : chatTheme.lightModifier.receivedMessageTextColor
                          ,
                          fontFamily: "medium",
                          fontSize: 16,
                          lineHeight: 22,
                        }
                      }}
                    />
                  </View>
                  {item.index === messages.length - 1 && item.item.isAuthor && item.item.id !== "sending_message" && (
                    <Animated.View
                      entering={animPapillon(FadeIn)}
                    >
                      <NativeText variant={"subtitle"} style={{fontSize: 13}}>
                        Distribué
                      </NativeText>
                    </Animated.View>
                  )}

                </View>
              </Animated.View>
            )}
          />
        ):(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <MissingItem
              emoji="💬"
              title="C'est le début de la conversation"
              description="Envoyez un message pour commencer la discussion."
              entering={animPapillon(FadeInDown)}
              exiting={animPapillon(FadeOut)}
              style={{paddingVertical: 26}}
            />
          </View>
        ): <View style={{flex: 1}}/>}
        <View style={{
          minHeight: 66,
          maxHeight: 120,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderTopWidth: 0.5,
          borderTopColor: colors.text + "22",
          backgroundColor: theme.dark ?
            chatTheme.darkModifier.inputBarBackgroundColor
            :
            chatTheme.lightModifier.inputBarBackgroundColor,
          flexDirection: "row",
          alignItems: "center",
        }}>
          <TextInput
            placeholder={"Écrivez un message..."}
            style={{
              backgroundColor: "transparent",
              borderRadius: 25,
              flex: 1,
              marginRight: 10,
              fontSize: 16,
              color: colors.text,
            }}
            multiline={true}
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  animated: true,
                  offset: 1000 * (messages?.length || 0),
                });
              }, 100);
            }}
            onChangeText={(text) => setText(text)}
            value={text}
          />
          <TouchableOpacity
            style={{
              backgroundColor: theme.dark ?
                chatTheme.darkModifier.sendButtonBackgroundColor
                :
                chatTheme.lightModifier.sendButtonBackgroundColor,
              width: 56,
              height: 40,
              borderRadius: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={async () => {
              if (text.trim() === "") return;
              setText("");
              setMessages([
                ...(messages || []),
                {
                  id: "sending_message",
                  attachments: [],
                  author: account.name,
                  isAuthor: true,
                  date: new Date(),
                  content: text,
                }
              ]);
              if (route.params.newData) {
                let savedChats = await getChats(account);
                await createDiscussion(account, route.params.newData.subject, text, route.params.newData.selectedRecipients);
                let chats = await getChats(account);
                let chat = chats.find(chat => !savedChats.find(savedChat => savedChat.id === chat.id));
                route.params.handle = chat!;
                route.params.newData = undefined;

                refreshMessages()
                  .then(() => {
                    markDiscussionAsRead(account, route.params.handle);
                    fetchingInterval = setInterval(() => {
                      refreshMessages(true);
                    }, 2000);
                  });
                return;
              }
              sendDiscussionMessage(account, route.params.handle, text)
                .then(() => {
                  refreshMessages();
                });
            }}
          >
            <Send color={"#FFF"} size={24} style={{marginTop: 1, marginLeft: -3}}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


export default Chat;
