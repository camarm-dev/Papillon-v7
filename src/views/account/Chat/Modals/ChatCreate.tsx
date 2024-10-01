import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  TextInput,
  View,
  Button, SectionList, KeyboardAvoidingView, Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList, NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { Recipient } from "@/services/shared/Recipient";
import { createDiscussion, createDiscussionRecipients } from "@/services/chats";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import {getProfileColorByName} from "@/services/local/default-personalization";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const ChatCreate: Screen<"ChatCreate"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(state => state.account!);

  const [recipients, setRecipients] = useState<{ title: string, data: Recipient[]  } | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");

  function createDiscussion () {
    navigation.goBack();
    navigation.navigate("Chat", {
      handle: {
        id: "new",
        subject: subject,
        recipient: selectedRecipients[0].name,
        creator: account.instance?.user.resources[0].name,
        unreadMessages: 0
      },
      newData: {subject, selectedRecipients}
    });
  }

  useEffect(() => {
    void async function () {
      const recipients = await createDiscussionRecipients(account);
      let categories = [];
      recipients.forEach((recipient) => {
        if (!categories.includes(recipient.kind)) {
          categories.push(recipient.kind);
        }
      });
      let filteredRecipients = categories.map((category) => {
        return {
          title: category,
          data: recipients.filter((recipient) => recipient.kind === category),
        };
      });
      setRecipients(filteredRecipients);
      setSelectedRecipients([]);
    }();
  }, [account?.instance]);

  return (
    <View style={{flex: 1, paddingBottom: useSafeAreaInsets().bottom}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="padding"
        keyboardVerticalOffset={120}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          {recipients?.map((category, index) => (
            <View key={index}>
              <NativeListHeader label={category.title} key={index}/>
              <NativeList>
                {category.data.map((recipient, index) => (
                  <NativeItem
                    onPress={() => {
                      if (selectedRecipients.includes(recipient)) {
                        setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
                        return;
                      }
                      setSelectedRecipients([...selectedRecipients, recipient]);
                    }}
                    chevron={false}
                    leading={
                      <InitialIndicator
                        initial={parse_initials(recipient.name)}
                        color={getProfileColorByName(recipient.name).bright}
                        textColor={getProfileColorByName(recipient.name).dark}
                      />
                    }
                    key={index}
                    trailing={
                      <PapillonCheckbox
                        style={{marginRight: 10}}
                        checked={selectedRecipients.includes(recipient)}
                        color={getProfileColorByName(recipient.name).dark}
                        onPress={() => {
                          if (selectedRecipients.includes(recipient)) {
                            setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
                            return;
                          }
                          setSelectedRecipients([...selectedRecipients, recipient]);
                        }}
                      />
                    }
                  >
                    <NativeText>{recipient.name.replaceAll("M. ", "").replaceAll("Mme ", "")}</NativeText>
                    {recipient.description && (
                      <NativeText variant={"subtitle"} numberOfLines={1}>{recipient.description}</NativeText>
                    )}
                  </NativeItem>
                ))}
              </NativeList>
            </View>
          ))}
        </ScrollView>
        <View style={{
          padding: 20,
          gap: 16,
          height: 160,
        }}>
          <TextInput
            placeholder="Objet"
            value={subject}
            onChangeText={setSubject}
            style={{
              paddingVertical: 15,
              paddingHorizontal: 15,
              backgroundColor: colors.text + "10",
              padding: 10,
              borderRadius: 12,
              fontSize: 16,
              fontFamily: "medium",
              borderWidth: 1,
              borderColor: colors.border,

            }}
          />
          <TouchableOpacity
            style={{
              height: 50,
              backgroundColor: selectedRecipients.length > 0 ? "#0E7CCB": "#0003",
              pointerEvents: selectedRecipients.length > 0 ? "auto" : "none",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 25,
            }}
            onPress={() => {
              if (subject === "") {
                Alert.alert(
                  "Voulez-vous continuer sans objet ?",
                  "Vous êtes sur le point de créer une discussion sans objet. Voulez-vous continuer ?",
                  [
                    {
                      text: "Annuler",
                      style: "cancel",
                    },
                    {
                      text: "Continuer",
                      onPress: () => createDiscussion(),
                    },
                  ],
                  { cancelable: true }
                );
              } else {
                createDiscussion();
              }
            }}
          >
            <NativeText style={{color: "#FFF"}}>Créer la discussion</NativeText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

//<ScrollView
//       contentContainerStyle={{
//         padding: 20,
//       }}
//     >
//
//         <NativeText>Sélectionner les destinataires :</NativeText>
//         {recipients?.map((recipient, index) => (
//           <TouchableOpacity key={index}
//             style={{
//               padding: 10,
//               backgroundColor: selectedRecipients.includes(recipient) ? colors.primary : colors.card,
//               margin: 5,
//               borderRadius: 5,
//             }}
//             onPress={() => {
//               if (selectedRecipients.includes(recipient)) {
//                 setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
//                 return;
//               }
//
//               setSelectedRecipients([...selectedRecipients, recipient]);
//             }}
//           >
//             <NativeText>
//               {recipient.name}
//             </NativeText>
//           </TouchableOpacity>
//         )) || (
//           <NativeText>
//             Chargement des destinataires...
//           </NativeText>
//         )}
//       </View>
//
//       <Button title="Créer la discussion" onPress={async () => {
//         await createDiscussion(account, subject, content, selectedRecipients);
//         navigation.goBack();
//       }} />
//     </ScrollView>

export default ChatCreate;
