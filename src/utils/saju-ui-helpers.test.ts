import { describe, expect, it, vi } from "vitest";
import { Lunar } from "lunar-javascript";
import { getMeaningText, SAJU_MEANING_MAP } from "../components/SajuResult";
import {
  calculateSajuFromInput,
  getLeapMonthForYear,
  getValidLunarDays,
  mapSajuInputErrorMessage,
  parseSolarDate,
  parseTime,
  toSolarDateFromCalendarInput,
  type SajuFormInput,
} from "./saju-ui-helpers";

describe("saju-ui-helpers", () => {
  it("parses solar date and time", () => {
    expect(parseSolarDate("1991-11-28")).toEqual({ year: 1991, month: 11, day: 28 });
    expect(parseTime("07:45")).toEqual({ hour: 7, minute: 45 });
  });

  it("calls Lunar.fromYmdHms with negative month for lunar leap", () => {
    const spy = vi.spyOn(Lunar, "fromYmdHms");

    toSolarDateFromCalendarInput("lunarLeap", "", 2020, 4, 2, 13, 0);

    expect(spy).toHaveBeenCalledWith(2020, -4, 2, 13, 0, 0);
    spy.mockRestore();
  });

  it("calls Lunar.fromYmdHms with positive month for normal lunar", () => {
    const spy = vi.spyOn(Lunar, "fromYmdHms");

    toSolarDateFromCalendarInput("lunar", "", 2020, 4, 2, 13, 0);

    expect(spy).toHaveBeenCalledWith(2020, 4, 2, 13, 0, 0);
    spy.mockRestore();
  });

  it("branches to solar input path", () => {
    const calculateFn = vi.fn().mockReturnValue({ ok: true });
    const input: SajuFormInput = {
      name: "",
      birthDateSolar: "2020-02-04",
      birthHourMinute: "18:22",
      unknownTime: false,
      gender: "male",
      calendarType: "solar",
      lunarYear: 2020,
      lunarMonth: 1,
      lunarDay: 1,
    };

    calculateSajuFromInput(input, calculateFn as never);
    expect(calculateFn).toHaveBeenCalledWith(2020, 2, 4, 18, 22, "male");
  });

  it("branches to lunar input path and converts to solar", () => {
    const calculateFn = vi.fn().mockReturnValue({ ok: true });
    const input: SajuFormInput = {
      name: "",
      birthDateSolar: "",
      birthHourMinute: "13:00",
      unknownTime: false,
      gender: "female",
      calendarType: "lunar",
      lunarYear: 2019,
      lunarMonth: 12,
      lunarDay: 12,
    };

    calculateSajuFromInput(input, calculateFn as never);

    const converted = Lunar.fromYmdHms(2019, 12, 12, 13, 0, 0).getSolar();
    expect(calculateFn).toHaveBeenCalledWith(converted.getYear(), converted.getMonth(), converted.getDay(), 13, 0, "female");
  });

  it("uses 00:00 when unknown time is checked", () => {
    const calculateFn = vi.fn().mockReturnValue({ ok: true });
    const input: SajuFormInput = {
      name: "",
      birthDateSolar: "2020-02-04",
      birthHourMinute: "23:59",
      unknownTime: true,
      gender: "male",
      calendarType: "solar",
      lunarYear: 2020,
      lunarMonth: 1,
      lunarDay: 1,
    };

    calculateSajuFromInput(input, calculateFn as never);
    expect(calculateFn).toHaveBeenCalledWith(2020, 2, 4, 0, 0, "male");
  });

  it("returns only valid lunar days", () => {
    const days = getValidLunarDays(2020, 4, false);
    expect(days.length).toBeGreaterThan(0);
    expect(days.length).toBeLessThanOrEqual(30);
    expect(days[0]).toBe(1);
  });

  it("returns leap month for a year", () => {
    expect(getLeapMonthForYear(2020)).toBe(4);
    expect(getLeapMonthForYear(2021)).toBe(0);
  });
});

describe("tooltip data", () => {
  it("contains all 10 heavenly stems and 12 earthly branches", () => {
    expect(Object.keys(SAJU_MEANING_MAP)).toHaveLength(22);
    expect(getMeaningText("甲")).toContain("갑목");
    expect(getMeaningText("子")).toContain("자수");
  });

  it("returns fallback text for unknown glyph", () => {
    expect(getMeaningText("X")).toContain("준비 중");
  });
});

describe("error message mapping", () => {
  it("maps lunar month errors to user-friendly text", () => {
    const err = new Error("wrong lunar year 2021 month -1");
    expect(mapSajuInputErrorMessage(err)).toContain("윤달");
  });

  it("maps calculator validation errors", () => {
    const err = new Error("Invalid date/time input");
    expect(mapSajuInputErrorMessage(err)).toContain("올바르지 않습니다");
  });
});
