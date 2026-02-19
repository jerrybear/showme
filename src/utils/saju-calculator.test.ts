import { describe, expect, it } from "vitest";
import { calculateSaju } from "./saju-calculator";

const ganElementMap: Record<string, string> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

const zhiElementMap: Record<string, string> = {
  子: "water",
  丑: "earth",
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
};

const elementColorMap: Record<string, string> = {
  wood: "#2E8B57",
  fire: "#D1495B",
  earth: "#C9A227",
  metal: "#C0C0C0",
  water: "#2F4F4F",
};

describe("calculateSaju", () => {
  it("calculates exact pillars before LiChun boundary", () => {
    const result = calculateSaju(2020, 2, 4, 13, 22, "male");

    expect(result.year.gan).toBe("己");
    expect(result.year.ji).toBe("亥");
    expect(result.month.gan).toBe("丁");
    expect(result.month.ji).toBe("丑");
  });

  it("calculates exact pillars after LiChun boundary", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male");

    expect(result.year.gan).toBe("庚");
    expect(result.year.ji).toBe("子");
    expect(result.month.gan).toBe("戊");
    expect(result.month.ji).toBe("寅");
  });

  it("maps gan/zhi to Korean text", () => {
    const result = calculateSaju(2020, 2, 4, 13, 22, "male");

    expect(result.year.gan).toBe("己");
    expect(result.year.ganKr).toBe("기");
    expect(result.year.ji).toBe("亥");
    expect(result.year.jiKr).toBe("해");
  });

  it("mixes color when gan/zhi have different elements", () => {
    const result = calculateSaju(2020, 2, 4, 13, 22, "male");

    expect(result.year.gan).toBe("己");
    expect(result.year.ji).toBe("亥");
    expect(result.year.color).toBe("#938535");
  });

  it("uses base color when gan/zhi share same element", () => {
    let matchedColor: string | null = null;
    let matchedElement: string | null = null;

    for (let day = 1; day <= 31; day += 1) {
      const result = calculateSaju(2020, 3, day, 12, 0, "male");
      const pillars = [result.year, result.month, result.day, result.time];

      for (const pillar of pillars) {
        const ganElement = ganElementMap[pillar.gan];
        const zhiElement = zhiElementMap[pillar.ji];
        if (ganElement && zhiElement && ganElement === zhiElement) {
          matchedColor = pillar.color;
          matchedElement = ganElement;
          break;
        }
      }

      if (matchedColor) {
        break;
      }
    }

    expect(matchedElement).not.toBeNull();
    expect(matchedColor).toBe(elementColorMap[matchedElement as string]);
  });

  it("returns formatted solar and lunar strings", () => {
    const result = calculateSaju(2020, 2, 4, 13, 22, "male");

    expect(result.solarDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(result.lunarDate.length).toBeGreaterThan(0);
    expect(result.lunarDate).toContain("年");
  });

  it("throws for invalid input values", () => {
    expect(() => calculateSaju(2024, 13, 1, 0, 0, "male")).toThrow("Invalid date/time input");
    expect(() => calculateSaju(2024, 2, 30, 0, 0, "male")).toThrow("Invalid date/time input");
    expect(() => calculateSaju(2024, 2, 1, 24, 0, "male")).toThrow("Invalid date/time input");
    expect(() => calculateSaju(2024, 2, 1, 0, 60, "male")).toThrow("Invalid date/time input");
    expect(() => calculateSaju(2024, 2, 1.1, 0, 0, "male")).toThrow("Invalid date/time input");
  });

  it("includes ten gods and daewoon metadata", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male", new Date("2026-02-19T00:00:00"));

    expect(result.tenGods.day.gan).toBe("일원(본인)");
    expect(result.daewoon).toHaveLength(10);
    expect(result.daewoon[0].startAge).toBe(result.daewoon[0].startAgeKorean - 1);
    expect(result.currentAges.international).toBeGreaterThanOrEqual(0);
    expect(result.currentAges.korean).toBe(result.currentAges.international + 1);
  });

  it("calculates current daewoon index", () => {
    const result = calculateSaju(1981, 1, 29, 23, 37, "male", new Date("2026-02-19T00:00:00"));
    expect(result.currentDaewoonIndex).not.toBeNull();
  });

  it("includes shensha field with deduped names", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male");
    const names = result.shensha.map((item) => item.name);
    expect(result.shensha).toBeDefined();
    expect(new Set(names).size).toBe(names.length);
    for (const item of result.shensha) {
      expect(["year", "month", "day", "time"]).toContain(item.pillar);
      expect(item.description).toContain("기준");
    }
  });

  it("applies year-base priority when same shensha is found by both year/day bases", () => {
    let matched:
      | {
          name: string;
          description: string;
        }
      | null = null;

    for (let month = 1; month <= 12 && !matched; month += 1) {
      for (let day = 1; day <= 28 && !matched; day += 1) {
        const result = calculateSaju(2020, month, day, 12, 0, "male");
        const yearBase = result.shensha.filter((item) => item.description.startsWith("연지 기준"));
        const dayBase = result.shensha.filter((item) => item.description.startsWith("일지 기준"));
        const yearNames = new Set(yearBase.map((item) => item.name));
        const overlap = dayBase.find((item) => yearNames.has(item.name));
        if (overlap) {
          matched = overlap;
        }
      }
    }

    expect(matched).toBeNull();
  });
});
