import { describe, expect, it } from "vitest";
import { ILJU_BY_GAN_JI } from "../data/ilju-interpretations";
import type { SajuResult } from "./saju-calculator";
import { analyzeSaju, findIljuInterpretation } from "./saju-analyzer";

function pillar(gan: string, ji: string) {
  return { gan, ji, ganKr: "x", jiKr: "y", color: "#000000" };
}

function makeResult(overrides?: Partial<SajuResult>): SajuResult {
  return {
    solarDate: "2020-01-01 00:00:00",
    lunarDate: "sample",
    year: pillar("甲", "子"),
    month: pillar("丙", "午"),
    day: pillar("戊", "辰"),
    time: pillar("庚", "申"),
    tenGods: {
      year: { gan: "비견", ji: "비견" },
      month: { gan: "비견", ji: "비견" },
      day: { gan: "일원(본인)", ji: "비견" },
      time: { gan: "비견", ji: "비견" },
    },
    daewoon: [],
    currentAges: { international: 0, korean: 1 },
    currentDaewoonIndex: null,
    shensha: [],
    todayFortune: {
      date: "2026-02-19",
      gan: "甲",
      ji: "子",
      ganKr: "갑",
      jiKr: "자",
      tenGod: "비견",
      comment: "테스트용 운세",
      lucky: true,
    },
    ...overrides,
  };
}

describe("saju-analyzer", () => {
  it("counts all eight characters", () => {
    const analysis = analyzeSaju(makeResult());
    const sum = Object.values(analysis.element.counts).reduce((acc, count) => acc + count, 0);
    expect(sum).toBe(8);
  });

  it("marks excessive and deficient elements", () => {
    const analysis = analyzeSaju(
      makeResult({
        year: pillar("甲", "寅"),
        month: pillar("乙", "卯"),
        day: pillar("丙", "午"),
        time: pillar("戊", "辰"),
      })
    );

    expect(analysis.element.excessive).toContain("wood");
    expect(analysis.element.deficient).toContain("metal");
    expect(analysis.element.deficient).toContain("water");
  });

  it("finds ilju interpretation by day pillar", () => {
    const analysis = analyzeSaju(
      makeResult({
        day: pillar("甲", "子"),
      })
    );
    expect(analysis.ilju).not.toBeNull();
    expect(analysis.iljuKey).toBe("甲子");
    expect(analysis.iljuHeadline).toContain("기운을 타고났습니다");
  });

  it("returns fallback headline when ilju data is missing", () => {
    const backup = ILJU_BY_GAN_JI["甲子"];
    delete ILJU_BY_GAN_JI["甲子"];
    try {
      const analysis = analyzeSaju(
        makeResult({
          day: pillar("甲", "子"),
        })
      );
      expect(analysis.ilju).toBeNull();
      expect(analysis.iljuHeadline).toContain("준비 중입니다");
    } finally {
      ILJU_BY_GAN_JI["甲子"] = backup;
    }
  });

  it("supports direct ilju lookup", () => {
    const found = findIljuInterpretation("甲", "子");
    const missing = findIljuInterpretation("X", "Y");
    expect(found).not.toBeNull();
    expect(missing).toBeNull();
  });

  it("throws on unknown characters instead of silently skipping", () => {
    expect(() =>
      analyzeSaju(
        makeResult({
          day: pillar("X", "子"),
        })
      )
    ).toThrow("Unknown gan/ji character");
  });
});
