import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { calculateSaju } from "../utils/saju-calculator";
import SajuResult from "./SajuResult";

function getShareCaptureSection(html: string): string {
  const start = html.indexOf('<div class="share-capture"');
  const end = html.indexOf('<p class="result-footnote">');
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }
  return html.slice(start, end);
}

describe("SajuResult", () => {
  it("renders share action and privacy notice", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male", new Date("2026-02-19T00:00:00"));

    const html = renderToStaticMarkup(
      <SajuResult result={result} name="홍길동" gender="male" calendarType="solar" />
    );

    expect(html).toContain("명식표 이미지 공유");
    expect(html).toContain("공유 이미지에는 이름, 성별, 생년월일 정보가 포함되지 않습니다.");
  });

  it("keeps sensitive meta in header but excludes it from capture area", () => {
    const result = calculateSaju(2020, 2, 4, 18, 22, "male", new Date("2026-02-19T00:00:00"));

    const html = renderToStaticMarkup(
      <SajuResult result={result} name="홍길동" gender="male" calendarType="solar" />
    );

    const shareSection = getShareCaptureSection(html);

    expect(html).toContain("홍길동");
    expect(html).toContain("남성");
    expect(html).toContain(`양력 ${result.solarDate}`);

    expect(shareSection).toContain("공유용 사주 명식표");
    expect(shareSection).not.toContain("홍길동");
    expect(shareSection).not.toContain("남성");
    expect(shareSection).not.toContain(result.solarDate);
  });
});
