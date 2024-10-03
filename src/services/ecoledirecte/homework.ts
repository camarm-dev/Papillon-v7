import ecoledirecte from "pawdirecte";
import type { Homework } from "@/services/shared/Homework";
import type { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDaysList } from "@/utils/epochWeekNumber";
import { log } from "@/utils/logger/logger";
import type { AttachmentType } from "../shared/Attachment";

export const getHomeworkForWeek = async (account: EcoleDirecteAccount, weekNumber: number): Promise<Homework[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const weekdays = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];

  for (const date of weekdays) {
    const formattedDate = formatDate(date);

    const homeworks = await ecoledirecte.studentHomeworks(account.authentication.session, account.authentication.account, formattedDate);
    for (const homework of homeworks) {
      response.push({
        attachments: homework.attachments.map((att) => ({
          url: `${att.name}\\${att.id}\\${att.kind}`,
          type: att.kind as AttachmentType,
          name: att.name
        })),
        color: "#000000", // TODO
        content: homework.content,
        done: homework.done,
        due: date.getTime(),
        id: homework.id.toString(),
        subject: homework.subject
      });
    }
  }
  return response.filter(hw => hw.content !== "");
};

export const toggleHomeworkState = async (account: EcoleDirecteAccount, homework: Homework): Promise<void> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");
  await ecoledirecte.setHomeworkState(account.authentication.session, account.authentication.account, Number(homework.id), !homework.done);
  log(`Homework ${homework.id} marked as ${homework.done ? "not done" : "done"}.`, "ED->toggleHomeworkState");
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed, so +1
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
