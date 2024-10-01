import ecoledirecte from "pawdirecte";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import type { Chat, ChatMessage } from "../shared/Chat";

export const getChats = async (account: EcoleDirecteAccount): Promise<{chats: Chat[], canReply: boolean}> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");
  const chats = await ecoledirecte.studentReceivedMessages(account.authentication.session, account.authentication.account);

  return {
    canReply: chats.canReply,
    chats: chats.chats.map((chat) => ({
      id: chat.id.toString(),
      subject: chat.subject,
      recipient: chat.sender,
      creator: chat.sender,
      unreadMessages: chat.read,
      isGroup: false // not in ed
    }))};
};

export const getChatMessages = async (account: EcoleDirecteAccount, chat: Chat): Promise<ChatMessage> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const message = await ecoledirecte.readMessage(account.authentication.session, account.authentication.account, Number(chat.id));

  return {
    id: message.id.toString(),
    content: message.content,
    author: message.sender,
    date: message.date,
    subject: chat.subject,
    //@ts-ignore
    attachments: message.files.map((a) => ({
      type: a.type,
      name: a.name,
      url: ""
    }))
  };
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed, so +1
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
