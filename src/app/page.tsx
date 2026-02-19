"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import SajuResult from "@/components/SajuResult";
import { calculateSaju } from "@/utils/saju-calculator";
import {
  calculateSajuFromInput,
  getLeapMonthForYear,
  getValidLunarDays,
  mapSajuInputErrorMessage,
  type CalendarType,
  type Gender,
  type SajuFormInput,
} from "@/utils/saju-ui-helpers";

const LUNAR_YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Home() {
  const [name, setName] = useState("");
  const [birthDateSolar, setBirthDateSolar] = useState("");
  const [birthHourMinute, setBirthHourMinute] = useState("12:00");
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [lunarYear, setLunarYear] = useState<number>(1990);
  const [lunarMonth, setLunarMonth] = useState<number>(1);
  const [lunarDay, setLunarDay] = useState<number>(1);
  const [result, setResult] = useState<ReturnType<typeof calculateSaju> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resultRef = useRef<HTMLElement | null>(null);

  const leapMonthForYear = useMemo(() => getLeapMonthForYear(lunarYear), [lunarYear]);

  const availableLunarMonths = useMemo(() => {
    if (calendarType !== "lunarLeap") {
      return MONTHS;
    }
    return leapMonthForYear > 0 ? [leapMonthForYear] : [];
  }, [calendarType, leapMonthForYear]);

  const normalizedLunarMonth = useMemo(() => {
    if (availableLunarMonths.length === 0) {
      return lunarMonth;
    }
    return availableLunarMonths.includes(lunarMonth) ? lunarMonth : availableLunarMonths[0];
  }, [availableLunarMonths, lunarMonth]);

  const validLunarDays = useMemo(
    () => getValidLunarDays(lunarYear, normalizedLunarMonth, calendarType === "lunarLeap"),
    [lunarYear, normalizedLunarMonth, calendarType]
  );

  const normalizedLunarDay = useMemo(() => {
    if (validLunarDays.length === 0) {
      return 1;
    }
    return validLunarDays.includes(lunarDay) ? lunarDay : validLunarDays[0];
  }, [lunarDay, validLunarDays]);

  useEffect(() => {
    if (!result) {
      return;
    }
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
    setError(null);

    try {
      const input: SajuFormInput = {
        name,
        birthDateSolar,
        birthHourMinute,
        unknownTime,
        gender,
        calendarType,
        lunarYear,
        lunarMonth: normalizedLunarMonth,
        lunarDay: normalizedLunarDay,
      };

      const next = calculateSajuFromInput(input, calculateSaju);
      setResult(next);
    } catch (submitError) {
      setResult(null);
      setError(mapSajuInputErrorMessage(submitError));
    }
  }

  const showLunarFields = calendarType !== "solar";
  const isLeapMonthUnavailable = calendarType === "lunarLeap" && leapMonthForYear === 0;
  const isLunarInputInvalid = showLunarFields && (availableLunarMonths.length === 0 || validLunarDays.length === 0);

  return (
    <main className="page-shell">
      <section className="form-card">
        <header className="hero">
          <p className="eyebrow">ShowMeTheFuture</p>
          <h1>당신의 사주를 입력하세요</h1>
          <p className="sub">다크 앤 골드 테마의 전통 명식표로 4주 8자를 확인할 수 있습니다.</p>
        </header>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="name">
              이름 (선택)
            </label>
            <input
              className="input"
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="홍길동"
            />
          </div>

          <div className="form-group">
            <span className="label">성별</span>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />
                남
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />
                여
              </label>
            </div>
          </div>

          <div className="form-group">
            <span className="label">달력 기준</span>
            <div className="radio-group calendar-radios">
              <label>
                <input
                  type="radio"
                  name="calendarType"
                  value="solar"
                  checked={calendarType === "solar"}
                  onChange={() => setCalendarType("solar")}
                />
                양력
              </label>
              <label>
                <input
                  type="radio"
                  name="calendarType"
                  value="lunar"
                  checked={calendarType === "lunar"}
                  onChange={() => setCalendarType("lunar")}
                />
                음력
              </label>
              <label>
                <input
                  type="radio"
                  name="calendarType"
                  value="lunarLeap"
                  checked={calendarType === "lunarLeap"}
                  onChange={() => setCalendarType("lunarLeap")}
                />
                음력(윤달)
              </label>
            </div>
          </div>

          {!showLunarFields ? (
            <div className="form-group">
              <label className="label" htmlFor="birthDate">
                생년월일
              </label>
              <input
                className="input"
                id="birthDate"
                name="birthDate"
                type="date"
                value={birthDateSolar}
                onChange={(event) => setBirthDateSolar(event.target.value)}
                required={calendarType === "solar"}
              />
            </div>
          ) : (
            <div className="form-group">
              <span className="label">음력 생년월일</span>
              <div className="lunar-selects">
                <select
                  className="select"
                  value={lunarYear}
                  onChange={(event) => setLunarYear(Number.parseInt(event.target.value, 10))}
                >
                  {LUNAR_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={normalizedLunarMonth}
                  onChange={(event) => setLunarMonth(Number.parseInt(event.target.value, 10))}
                >
                  {availableLunarMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={normalizedLunarDay}
                  onChange={(event) => setLunarDay(Number.parseInt(event.target.value, 10))}
                >
                  {validLunarDays.map((day) => (
                    <option key={day} value={day}>
                      {day}일
                    </option>
                  ))}
                </select>
              </div>
              {isLeapMonthUnavailable ? (
                <p className="inline-warning">해당 연도에는 윤달이 없습니다. 다른 연도를 선택해 주세요.</p>
              ) : null}
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="birthTime">
              태어난 시간
            </label>
            <input
              className="input"
              id="birthTime"
              name="birthTime"
              type="time"
              value={unknownTime ? "00:00" : birthHourMinute}
              onChange={(event) => setBirthHourMinute(event.target.value)}
              disabled={unknownTime}
              required={!unknownTime}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(event) => setUnknownTime(event.target.checked)}
              />
              태어난 시간을 모름 (00:00 기준)
            </label>
          </div>

          <button className="btn-primary" type="submit" disabled={isLunarInputInvalid}>
            운세 보기
          </button>
        </form>

        {isSubmitted && error ? (
          <div className="error-box" role="alert">
            {error}
          </div>
        ) : null}
      </section>

      {result ? (
        <section ref={resultRef} className="result-container">
          <SajuResult result={result} name={name} gender={gender} calendarType={calendarType} />
        </section>
      ) : null}
    </main>
  );
}
