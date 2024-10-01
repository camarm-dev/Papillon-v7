import { PronoteAccount } from "@/stores/account/types";
import { Chat, ChatMessage } from "../shared/Chat";
import pronote, {Discussion, DiscussionRecipient} from "pawnote";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { decodeAttachment } from "./attachment";
import { Recipient } from "../shared/Recipient";
import { info } from "@/utils/logger/logger";

export const getChats = async (account: PronoteAccount): Promise<Array<Chat>> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const chats = await pronote.discussions(account.instance);
  info("PRONOTE->getChats(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  async function getParticipantName (chat: Discussion): Promise<string> {
    let recipients: Array<DiscussionRecipient> = await pronote.discussionRecipients(account.instance!, chat);
    let recipientNames: Array<string> = recipients.map((recipient) => recipient.name);
    recipientNames = recipientNames.filter((name) => !name.includes(studentName));
    for (let i = 0; i < recipientNames.length; i++) {
      recipientNames[i] = recipientNames[i]
        .replaceAll("M. ", "")
        .replaceAll("Mme ", "")
        .split(" ")
        .reverse()
        .join(" ")
      ;
    }
    if (recipientNames.length > 3) {
      recipientNames = recipientNames.slice(0, 3);
      recipientNames.push("et plus...");
    }
    return recipientNames.join(", ");
  }

  let result: Array<Chat> = [];
  for (let chat of chats.items) {
    let recipientName = chat.recipientName;
    if (recipientName === undefined) {
      recipientName = await getParticipantName(chat);
    } else {
      recipientName = recipientName
        .replaceAll("M. ", "")
        .replaceAll("Mme ", "")
        .split(" ")
        .reverse()
        .join(" ")
      ;
    }
    result.push({
      id: chat.participantsMessageID,
      subject: chat.subject,
      creator: chat.creator ?? studentName,
      recipient: recipientName!,
      unreadMessages: chat.numberOfMessagesUnread,
      _handle: chat,
      isGroup: chat.recipientName === undefined
    });
  }

  return result;
};

export const getChatMessages = async (account: PronoteAccount, chat: Chat): Promise<Array<ChatMessage>> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const messages = await pronote.discussionMessages(account.instance, chat._handle);
  info("PRONOTE->getChatMessages(): OK", "pronote");

  const studentName = account.instance.user.resources[0].name;

  return messages.sents.map((message) => {
    return {
      id: message.id,
      content: message.content,
      author: message.author?.name ?? studentName,
      date: message.creationDate,
      attachments: message.files.map(decodeAttachment),
      isAuthor: message.author?.name === undefined
    };
  });
};

export const createDiscussionRecipients = async (account: PronoteAccount): Promise<Recipient[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const user = account.instance.user.resources[0];
  const recipientsALL = await Promise.all([
    pronote.EntityKind.Teacher,
    pronote.EntityKind.Personal
  ].map(kind => pronote.newDiscussionRecipients(account.instance!, user, kind)));

  const recipients = recipientsALL.flat();
  info("PRONOTE->createDiscussionRecipients(): OK", "pronote");
  return recipients.map((recipient) => ({
    name: recipient.name,
    kind:
        recipient.kind === pronote.EntityKind.Teacher ? "Professeur" :
          recipient.kind === pronote.EntityKind.Personal ? "Personnel" :
            recipient.kind === pronote.EntityKind.Student ? "Étudiant" : "Inconnu"
    ,
    description: recipient.subjects[0] ? recipient.subjects[0].name : "",
    _handle: recipient
  }));
};

export const createDiscussion = async (account: PronoteAccount, subject: string, content: string, recipients: Recipient[]): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.newDiscussion(account.instance, subject, content, recipients.map(r => r._handle));
  info("PRONOTE->createDiscussion(): OK", "pronote");
};

export const sendDiscussionMessage = async (account: PronoteAccount, chat: Chat, content: string): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.discussionSendMessage(account.instance, chat._handle, content);
  info("PRONOTE->discussionSendMessage(): OK", "pronote");
};

export const markDiscussionAsRead = async (account: PronoteAccount, chat: Chat): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.discussionRead(account.instance, chat._handle);
  info("PRONOTE->markDiscussionAsRead(): OK", "pronote");
};

export const getDiscussionParticipants = async (account: PronoteAccount, chat: Chat): Promise<Recipient[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const participants = await pronote.discussionRecipients(account.instance, chat._handle);
  info("PRONOTE->getDiscussionParticipants(): OK", "pronote");

  return participants.map((participant) => ({
    name: participant.name
      .replaceAll("M. ", "")
      .replaceAll("Mme ", "")
      .split(" ")
      .reverse()
      .join(" ")
      .replace(/\(([^;]*)\)/g, "")
      .trim()
    ,
    kind:
            participant.kind === pronote.EntityKind.Teacher ? "Professeur" :
              participant.kind === pronote.EntityKind.Personal ? "Personnel" :
                participant.kind === pronote.EntityKind.Student ? "Étudiant" : "Inconnu"
    ,
    _handle: participant
  }));
};

export const deleteDiscussion = async (account: PronoteAccount, chat: Chat): Promise<void> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  await pronote.discussionDelete(account.instance, chat._handle);
  info("PRONOTE->deleteDiscussion(): OK", "pronote");

  return;
};