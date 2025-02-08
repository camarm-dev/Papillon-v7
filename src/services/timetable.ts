import { type Account, AccountService } from "@/stores/account/types";
import { useTimetableStore } from "@/stores/timetable";
import { epochWNToPronoteWN, weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error } from "@/utils/logger/logger";
import { fetchIcalData } from "./local/ical";
import { WeekFrequency } from "./shared/Timetable";

/**
 * Updates the state and cache for the timetable of given week number.
 */
export async function updateTimetableForWeekInCache <T extends Account> (account: T, epochWeekNumber: number, force: boolean = false): Promise<void> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getTimetableForWeek } = await import("./pronote/timetable");
      const weekNumber = epochWNToPronoteWN(epochWeekNumber, account);
      const timetable = await getTimetableForWeek(account, weekNumber);
      useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
      break;
    }
    case AccountService.Local: {
      useTimetableStore.getState().updateClasses(epochWeekNumber, []);

      break;
    }
    case AccountService.Skolengo: {
      if(!checkIfSkoSupported(account, "Lessons")) {
        error("[updateTimetableForWeekInCache]: This Skolengo instance doesn't support Lessons.", "skolengo");
        break;
      }
      const { getTimetableForWeek } = await import("./skolengo/data/timetable");
      const timetable = await getTimetableForWeek(account, epochWeekNumber);
      useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
      break;
    }
    case AccountService.EcoleDirecte: {
      const { getTimetableForWeek } = await import("./ecoledirecte/timetable");
      const rangeDate = weekNumberToDateRange(epochWeekNumber);
      const timetable = await getTimetableForWeek(account, rangeDate);
      useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
      break;
    }
    case AccountService.Multi: {
      const { getTimetableForWeek } = await import("./multi/data/timetable");
      const timetable = await getTimetableForWeek(account, epochWeekNumber);
      useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
      break;
    }
    default: {
      throw new Error("Service not implemented.");
    }
  }

  // Fetch iCal data
  await fetchIcalData(account, force);
}

/**
 * Gets the week "frequency" object for the given week number.
 *
 * @example "Q1"/"Q2", "S1"/"S2"
 */
export async function getWeekFrequency <T extends Account> (account: T, epochWeekNumber: number): Promise<WeekFrequency | null> {
  switch (account.service) {
    case AccountService.Pronote:
      const { getWeekFrequency } = await import("./pronote/timetable");
      const weekNumber = epochWNToPronoteWN(epochWeekNumber, account);
      return getWeekFrequency(account, weekNumber);
    default:
      return null;
  }
}