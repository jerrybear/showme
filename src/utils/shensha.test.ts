import { describe, expect, it } from "vitest";
import { calculateSaju } from "./saju-calculator";

type Pillar = "year" | "month" | "day" | "time";
type ShenshaName = "도화살" | "역마살" | "화개살";

const GROUPS = [
  {
    bases: ["申", "子", "辰"],
    targets: { 도화살: "酉", 역마살: "寅", 화개살: "辰" },
  },
  {
    bases: ["寅", "午", "戌"],
    targets: { 도화살: "卯", 역마살: "申", 화개살: "戌" },
  },
  {
    bases: ["巳", "酉", "丑"],
    targets: { 도화살: "午", 역마살: "亥", 화개살: "丑" },
  },
  {
    bases: ["亥", "卯", "未"],
    targets: { 도화살: "子", 역마살: "巳", 화개살: "未" },
  },
] as const;

function getTargets(base: string): Record<ShenshaName, string> | null {
  const group = GROUPS.find((item) => (item.bases as readonly string[]).includes(base));
  return group ? { ...group.targets } : null;
}

function detect(base: string, zhiByPillar: Record<Pillar, string>) {
  const targets = getTargets(base);
  if (!targets) {
    return new Map<ShenshaName, Pillar>();
  }

  const found = new Map<ShenshaName, Pillar>();
  const order: Pillar[] = ["year", "month", "day", "time"];

  for (const name of Object.keys(targets) as ShenshaName[]) {
    const target = targets[name];
    const pillar = order.find((key) => zhiByPillar[key] === target);
    if (pillar) {
      found.set(name, pillar);
    }
  }

  return found;
}

describe("shensha mapping", () => {
  it("uses valid mapping table for all four samhap groups", () => {
    for (const group of GROUPS) {
      expect(group.bases).toHaveLength(3);
      expect(new Set(group.bases).size).toBe(3);
      expect(Object.values(group.targets)).toHaveLength(3);
      expect(new Set(Object.values(group.targets)).size).toBe(3);
    }
  });

  it("matches year/day-base mapping and keeps only one record per shensha", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male");

    const zhiByPillar = {
      year: result.year.ji,
      month: result.month.ji,
      day: result.day.ji,
      time: result.time.ji,
    } satisfies Record<Pillar, string>;

    const byYear = detect(result.year.ji, zhiByPillar);
    const byDay = detect(result.day.ji, zhiByPillar);

    const expectedNames = new Set<ShenshaName>([...byYear.keys(), ...byDay.keys()]);
    const actualNames = new Set(result.shensha.map((item) => item.name));

    expect(actualNames).toEqual(expectedNames);
    expect(actualNames.size).toBe(result.shensha.length);
  });

  it("prefers year-base description when duplicated with day-base", () => {
    let checked = false;

    for (let year = 2018; year <= 2022 && !checked; year += 1) {
      for (let month = 1; month <= 12 && !checked; month += 1) {
        for (let day = 1; day <= 28 && !checked; day += 1) {
          const result = calculateSaju(year, month, day, 12, 0, "male");

          const zhiByPillar = {
            year: result.year.ji,
            month: result.month.ji,
            day: result.day.ji,
            time: result.time.ji,
          } satisfies Record<Pillar, string>;

          const byYear = detect(result.year.ji, zhiByPillar);
          const byDay = detect(result.day.ji, zhiByPillar);
          const overlap = [...byYear.keys()].find((name) => byDay.has(name));

          if (!overlap) {
            continue;
          }

          checked = true;
          const target = result.shensha.filter((item) => item.name === overlap);
          expect(target).toHaveLength(1);
          expect(target[0].description.startsWith("연지 기준")).toBe(true);
        }
      }
    }

    expect(checked).toBe(true);
  });
});
