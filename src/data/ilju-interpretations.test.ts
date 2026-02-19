import { describe, expect, it } from "vitest";
import { ILJU_BY_GAN_JI, ILJU_INTERPRETATIONS } from "./ilju-interpretations";

const VALID_GAN = new Set(["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]);
const VALID_ZHI = new Set(["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]);

describe("ilju-interpretations data", () => {
  it("contains 60 items", () => {
    expect(ILJU_INTERPRETATIONS).toHaveLength(60);
  });

  it("has unique gan+ji keys", () => {
    const keys = ILJU_INTERPRETATIONS.map((item) => `${item.gan}${item.ji}`);
    expect(new Set(keys).size).toBe(60);
  });

  it("index map resolves original item", () => {
    const sample = ILJU_INTERPRETATIONS[0];
    expect(ILJU_BY_GAN_JI[`${sample.gan}${sample.ji}`]).toEqual(sample);
  });

  it("each row has required non-empty fields and valid symbols", () => {
    for (const item of ILJU_INTERPRETATIONS) {
      expect(item.key.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.personality.length).toBeGreaterThan(0);
      expect(item.wealth.length).toBeGreaterThan(0);
      expect(item.career.length).toBeGreaterThan(0);
      expect(VALID_GAN.has(item.gan)).toBe(true);
      expect(VALID_ZHI.has(item.ji)).toBe(true);
    }
  });
});
