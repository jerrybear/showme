import { Lunar, LunarYear } from "lunar-javascript";
import type { Gender, SajuResult } from "@/utils/saju-calculator";
export type { Gender } from "@/utils/saju-calculator";

export type CalendarType = "solar" | "lunar" | "lunarLeap";

export interface SajuFormInput {
  name: string;
  birthDateSolar: string;
  birthHourMinute: string;
  unknownTime: boolean;
  gender: Gender;
  calendarType: CalendarType;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
}

export interface Ymd {
  year: number;
  month: number;
  day: number;
}

export function parseSolarDate(dateStr: string): Ymd {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error("생년월일 형식이 올바르지 않습니다.");
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  return { year, month, day };
}

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeStr);
  if (!match) {
    throw new Error("태어난 시간 형식이 올바르지 않습니다.");
  }

  return {
    hour: Number.parseInt(match[1], 10),
    minute: Number.parseInt(match[2], 10),
  };
}

export function getValidLunarDays(year: number, month: number, isLeap: boolean): number[] {
  const signedMonth = isLeap ? -month : month;
  const days: number[] = [];

  for (let day = 1; day <= 30; day += 1) {
    try {
      Lunar.fromYmdHms(year, signedMonth, day, 0, 0, 0);
      days.push(day);
    } catch {
      // Skip invalid day for selected lunar month.
    }
  }

  return days;
}

export function getLeapMonthForYear(year: number): number {
  return LunarYear.fromYear(year).getLeapMonth();
}

export function toSolarDateFromCalendarInput(
  calendarType: CalendarType,
  birthDateSolar: string,
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  hour: number,
  minute: number
): Ymd {
  if (calendarType === "solar") {
    return parseSolarDate(birthDateSolar);
  }

  const signedMonth = calendarType === "lunarLeap" ? -lunarMonth : lunarMonth;
  const lunar = Lunar.fromYmdHms(lunarYear, signedMonth, lunarDay, hour, minute, 0);
  const solar = lunar.getSolar();

  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
  };
}

export function calculateSajuFromInput(
  input: SajuFormInput,
  calculateFn: (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    gender: Gender,
    referenceDate?: Date
  ) => SajuResult
): SajuResult {
  const { hour, minute } = input.unknownTime ? { hour: 0, minute: 0 } : parseTime(input.birthHourMinute);

  const solarDate = toSolarDateFromCalendarInput(
    input.calendarType,
    input.birthDateSolar,
    input.lunarYear,
    input.lunarMonth,
    input.lunarDay,
    hour,
    minute
  );

  return calculateFn(solarDate.year, solarDate.month, solarDate.day, hour, minute, input.gender);
}

export function mapSajuInputErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "입력값을 다시 확인해 주세요.";
  }

  const message = error.message;
  if (message.includes("wrong lunar year") || message.includes("wrong lunar month")) {
    return "선택한 연도에는 해당 윤달 월이 없습니다. 월/윤달 설정을 확인해 주세요.";
  }
  if (message.includes("wrong lunar day") || message.includes("only")) {
    return "선택한 날짜가 해당 음력 월에 존재하지 않습니다.";
  }
  if (message.includes("생년월일 형식")) {
    return message;
  }
  if (message.includes("태어난 시간 형식")) {
    return message;
  }
  if (message.includes("Invalid date/time input")) {
    return "입력한 날짜 또는 시간이 올바르지 않습니다.";
  }

  return "입력값을 다시 확인해 주세요.";
}
