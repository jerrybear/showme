import { describe, expect, it } from "vitest";
import { calculateTenGods } from "./saju-calculator";

describe("calculateTenGods", () => {
  it("returns day self as ilwon", () => {
    expect(calculateTenGods("甲", "甲")).toBe("일원(본인)");
  });

  it("covers same element relations", () => {
    expect(calculateTenGods("甲", "甲")).toBe("일원(본인)");
    expect(calculateTenGods("甲", "乙")).toBe("겁재");
  });

  it("covers generated element relations", () => {
    expect(calculateTenGods("甲", "丙")).toBe("식신");
    expect(calculateTenGods("甲", "丁")).toBe("상관");
  });

  it("covers wealth relations", () => {
    expect(calculateTenGods("甲", "戊")).toBe("편재");
    expect(calculateTenGods("甲", "己")).toBe("정재");
  });

  it("covers officer relations", () => {
    expect(calculateTenGods("甲", "庚")).toBe("편관");
    expect(calculateTenGods("甲", "辛")).toBe("정관");
  });

  it("covers resource relations", () => {
    expect(calculateTenGods("甲", "壬")).toBe("편인");
    expect(calculateTenGods("甲", "癸")).toBe("정인");
  });
});
