declare module "lunar-javascript" {
  export interface DaYun {
    getStartAge(): number;
    getEndAge(): number;
    getGanZhi(): string;
  }

  export interface Yun {
    getDaYun(n?: number): DaYun[];
    getStartSolar(): Solar;
  }

  export interface EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYun(gender: number, sect?: number): Yun;
  }

  export interface Lunar {
    getEightChar(): EightChar;
    toFullString(): string;
    getSolar(): Solar;
  }

  export interface LunarYear {
    getLeapMonth(): number;
  }

  export interface Solar {
    getLunar(): Lunar;
    toYmdHms(): string;
    toYmd(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export const Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
  };

  export const Lunar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Lunar;
  };

  export const LunarYear: {
    fromYear(year: number): LunarYear;
  };
}
