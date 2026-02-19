import { Solar } from "lunar-javascript";

export interface SajuPillar {
  gan: string;
  ji: string;
  ganKr: string;
  jiKr: string;
  color: string;
}

export type Gender = "male" | "female";

export type TenGodLabel =
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "편재"
  | "정재"
  | "편관"
  | "정관"
  | "편인"
  | "정인"
  | "일원(본인)";

export interface PillarTenGods {
  gan: TenGodLabel;
  ji: TenGodLabel;
}

export interface Daewoon {
  startAge: number;
  startAgeKorean: number;
  gan: string;
  ji: string;
  ganKr: string;
  jiKr: string;
  color: string;
}

export interface Shensha {
  pillar: "year" | "month" | "day" | "time";
  name: "도화살" | "역마살" | "화개살";
  description: string;
}

export interface SajuResult {
  solarDate: string;
  lunarDate: string;
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  time: SajuPillar;
  tenGods: {
    year: PillarTenGods;
    month: PillarTenGods;
    day: PillarTenGods;
    time: PillarTenGods;
  };
  daewoon: Daewoon[];
  currentAges: {
    international: number;
    korean: number;
  };
  currentDaewoonIndex: number | null;
  shensha: Shensha[];
  todayFortune: DailyFortune; // New field
}

export interface DailyFortune {
  date: string;
  gan: string;
  ji: string;
  ganKr: string;
  jiKr: string;
  tenGod: TenGodLabel; // Relation of Today's Gan to Day Gan
  comment: string;
  lucky: boolean;
}


type Element = "wood" | "fire" | "earth" | "metal" | "water";
type YinYang = "yang" | "yin";

const GAN_KR_MAP: Record<string, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

const ZHI_KR_MAP: Record<string, string> = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

const GAN_ELEMENT_MAP: Record<string, Element> = {
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

const ZHI_ELEMENT_MAP: Record<string, Element> = {
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

const GAN_YINYANG_MAP: Record<string, YinYang> = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin",
};

const ZHI_YINYANG_MAP: Record<string, YinYang> = {
  子: "yang",
  丑: "yin",
  寅: "yang",
  卯: "yin",
  辰: "yang",
  巳: "yin",
  午: "yang",
  未: "yin",
  申: "yang",
  酉: "yin",
  戌: "yang",
  亥: "yin",
};

const ELEMENT_COLORS: Record<Element, string> = {
  wood: "#2E8B57",
  fire: "#D1495B",
  earth: "#C9A227",
  metal: "#C0C0C0",
  water: "#2F4F4F",
};

const GENERATE_MAP: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROL_MAP: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

const ZHI_GROUP_RULES = [
  {
    bases: ["申", "子", "辰"],
    targets: { peach: "酉", travel: "寅", art: "辰" },
  },
  {
    bases: ["寅", "午", "戌"],
    targets: { peach: "卯", travel: "申", art: "戌" },
  },
  {
    bases: ["巳", "酉", "丑"],
    targets: { peach: "午", travel: "亥", art: "丑" },
  },
  {
    bases: ["亥", "卯", "未"],
    targets: { peach: "子", travel: "巳", art: "未" },
  },
] as const;

const SHENSHA_TEXT: Record<Shensha["name"], string> = {
  도화살: "대중의 관심을 끄는 매력이 있습니다.",
  역마살: "이동과 변화에 강한 흐름이 있습니다.",
  화개살: "몰입과 사색, 예술적 감수성이 두드러집니다.",
};

function validateInput(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): void {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    throw new Error("Invalid date/time input");
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid date/time input");
  }

  const date = new Date(year, month - 1, day, hour, minute, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    throw new Error("Invalid date/time input");
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toPart = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toPart(r)}${toPart(g)}${toPart(b)}`;
}

function mixHexColor(ganHex: string, zhiHex: string, ganWeight: number, zhiWeight: number): string {
  const [r1, g1, b1] = hexToRgb(ganHex);
  const [r2, g2, b2] = hexToRgb(zhiHex);

  const r = Math.round(r1 * ganWeight + r2 * zhiWeight);
  const g = Math.round(g1 * ganWeight + g2 * zhiWeight);
  const b = Math.round(b1 * ganWeight + b2 * zhiWeight);

  return rgbToHex(r, g, b);
}

function getPillarColor(gan: string, zhi: string): string {
  const ganElement = GAN_ELEMENT_MAP[gan];
  const zhiElement = ZHI_ELEMENT_MAP[zhi];

  if (!ganElement || !zhiElement) {
    throw new Error("Invalid gan/zhi input");
  }

  if (ganElement === zhiElement) {
    return ELEMENT_COLORS[ganElement];
  }

  return mixHexColor(ELEMENT_COLORS[ganElement], ELEMENT_COLORS[zhiElement], 0.65, 0.35);
}

function toPillar(gan: string, zhi: string): SajuPillar {
  const ganKr = GAN_KR_MAP[gan];
  const jiKr = ZHI_KR_MAP[zhi];

  if (!ganKr || !jiKr) {
    throw new Error("Invalid gan/zhi input");
  }

  return {
    gan,
    ji: zhi,
    ganKr,
    jiKr,
    color: getPillarColor(gan, zhi),
  };
}

function getElement(char: string): Element {
  const element = GAN_ELEMENT_MAP[char] ?? ZHI_ELEMENT_MAP[char];
  if (!element) {
    throw new Error(`Invalid gan/zhi input: ${char}`);
  }
  return element;
}

function getYinYang(char: string): YinYang {
  const yinYang = GAN_YINYANG_MAP[char] ?? ZHI_YINYANG_MAP[char];
  if (!yinYang) {
    throw new Error(`Invalid yin/yang target: ${char}`);
  }
  return yinYang;
}

function isGeneratedBy(source: Element, target: Element): boolean {
  return GENERATE_MAP[source] === target;
}

function isControlledBy(source: Element, target: Element): boolean {
  return CONTROL_MAP[source] === target;
}

export function calculateTenGods(dayGan: string, target: string): TenGodLabel {
  if (dayGan === target) {
    return "일원(본인)";
  }

  const dayElement = getElement(dayGan);
  const targetElement = getElement(target);
  const samePolarity = getYinYang(dayGan) === getYinYang(target);

  if (dayElement === targetElement) {
    return samePolarity ? "비견" : "겁재";
  }
  if (isGeneratedBy(dayElement, targetElement)) {
    return samePolarity ? "식신" : "상관";
  }
  if (isControlledBy(dayElement, targetElement)) {
    return samePolarity ? "편재" : "정재";
  }
  if (isControlledBy(targetElement, dayElement)) {
    return samePolarity ? "편관" : "정관";
  }
  if (isGeneratedBy(targetElement, dayElement)) {
    return samePolarity ? "편인" : "정인";
  }

  throw new Error(`Cannot determine ten gods for dayGan=${dayGan}, target=${target}`);
}

function calculateInternationalAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  referenceDate: Date
): number {
  let age = referenceDate.getFullYear() - birthYear;
  const beforeBirthday =
    referenceDate.getMonth() + 1 < birthMonth ||
    (referenceDate.getMonth() + 1 === birthMonth && referenceDate.getDate() < birthDay);
  if (beforeBirthday) {
    age -= 1;
  }
  return Math.max(0, age);
}

function getShenshaTargets(baseZhi: string): { peach: string; travel: string; art: string } | null {
  const matched = ZHI_GROUP_RULES.find((rule) => (rule.bases as readonly string[]).includes(baseZhi));
  return matched ? { ...matched.targets } : null;
}

function detectShenshaByBase(
  baseZhi: string,
  baseLabel: "연지" | "일지",
  zhiByPillar: Record<Shensha["pillar"], string>
): Shensha[] {
  const targets = getShenshaTargets(baseZhi);
  if (!targets) {
    return [];
  }

  const entries: Array<{ name: Shensha["name"]; target: string; phrase: string }> = [
    { name: "도화살", target: targets.peach, phrase: "도화 기운으로" },
    { name: "역마살", target: targets.travel, phrase: "역마 기운으로" },
    { name: "화개살", target: targets.art, phrase: "화개 기운으로" },
  ];

  const pillarOrder: Shensha["pillar"][] = ["year", "month", "day", "time"];
  const result: Shensha[] = [];

  for (const entry of entries) {
    const matchedPillar = pillarOrder.find((pillar) => zhiByPillar[pillar] === entry.target);
    if (!matchedPillar) {
      continue;
    }
    result.push({
      pillar: matchedPillar,
      name: entry.name,
      description: `${baseLabel} 기준 ${entry.phrase} ${SHENSHA_TEXT[entry.name]}`,
    });
  }

  return result;
}

function calculateShensha(
  yearZhi: string,
  dayZhi: string,
  zhiByPillar: Record<Shensha["pillar"], string>
): Shensha[] {
  const merged: Shensha[] = [];
  const seen = new Set<Shensha["name"]>();

  const yearBased = detectShenshaByBase(yearZhi, "연지", zhiByPillar);
  for (const item of yearBased) {
    merged.push(item);
    seen.add(item.name);
  }

  const dayBased = detectShenshaByBase(dayZhi, "일지", zhiByPillar);
  for (const item of dayBased) {
    if (seen.has(item.name)) {
      continue;
    }
    merged.push(item);
    seen.add(item.name);
  }

  return merged;
}

function calculateDailyFortune(dayGan: string, dayZhi: string): DailyFortune {
  const now = new Date();
  const solar = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const todayGan = eightChar.getDayGan();
  const todayZhi = eightChar.getDayZhi();

  const tenGod = calculateTenGods(dayGan, todayGan);

  // Simple interpretation logic
  let comment = "평온한 하루가 예상됩니다.";
  let lucky = false;

  const tenGodMeaning: Record<string, string> = {
    "비견": "친구와 협력하거나 경쟁할 일이 생길 수 있습니다.",
    "겁재": "의외의 지출 조심! 하지만 경쟁심이 불타오르는 날입니다.",
    "식신": "맛있는 음식과 즐거운 대화가 따르는 날입니다.",
    "상관": "톡톡 튀는 아이디어가 샘솟지만, 말실수는 조심하세요.",
    "편재": "뜻밖의 횡재수나 재미있는 일이 생길 수 있습니다!",
    "정재": "성실하게 일한 만큼 확실한 보상이 따르는 날입니다.",
    "편관": "책임감이 필요한 날. 조금 바쁘더라도 명예가 따릅니다.",
    "정관": "규칙을 지키고 순리대로 풀리는 안정적인 날입니다.",
    "편인": "독창적인 생각이 떠오르거나 깊은 고민에 빠질 수 있습니다.",
    "정인": "나를 도와주는 귀인을 만나거나 칭찬을 받을 수 있습니다.",
  };

  if (tenGod in tenGodMeaning) {
    comment = tenGodMeaning[tenGod];
  }

  // Check for Clash (Chung) - Simple check
  // Zi-Wu, Chou-Wei, Yin-Shen, Mao-You, Chen-Xu, Si-Hai
  const clashes: Record<string, string> = {
    "子": "午", "午": "子",
    "丑": "未", "未": "丑",
    "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰",
    "巳": "亥", "亥": "巳",
  };

  if (clashes[dayZhi] === todayZhi) {
    comment = "변동수가 강한 날입니다. 차분하게 대응하면 기회가 됩니다.";
    lucky = false; // Caution
  } else if (["편재", "식신", "정관", "정인"].includes(tenGod)) {
    lucky = true;
  }

  // Helper for Kr
  const toP = toPillar(todayGan, todayZhi);

  return {
    date: `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`,
    gan: todayGan,
    ji: todayZhi,
    ganKr: toP.ganKr,
    jiKr: toP.jiKr,
    tenGod,
    comment,
    lucky,
  };
}


export function calculateSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender,
  referenceDate: Date = new Date()
): SajuResult {
  validateInput(year, month, day, hour, minute);

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const dayGan = eightChar.getDayGan();

  const yearPillar = toPillar(eightChar.getYearGan(), eightChar.getYearZhi());
  const monthPillar = toPillar(eightChar.getMonthGan(), eightChar.getMonthZhi());
  const dayPillar = toPillar(dayGan, eightChar.getDayZhi());
  const timePillar = toPillar(eightChar.getTimeGan(), eightChar.getTimeZhi());
  const shensha = calculateShensha(yearPillar.ji, dayPillar.ji, {
    year: yearPillar.ji,
    month: monthPillar.ji,
    day: dayPillar.ji,
    time: timePillar.ji,
  });

  const yun = eightChar.getYun(gender === "male" ? 1 : 0, 1);
  const daYunList = yun
    .getDaYun(11)
    .map((item) => {
      const ganZhi = item.getGanZhi();
      if (!ganZhi || ganZhi.length < 2) {
        return null;
      }
      const gan = ganZhi[0];
      const ji = ganZhi[1];
      const pillar = toPillar(gan, ji);
      const startAgeKorean = item.getStartAge();
      return {
        startAge: Math.max(0, startAgeKorean - 1),
        startAgeKorean,
        ...pillar,
      } satisfies Daewoon;
    })
    .filter((item): item is Daewoon => item !== null)
    .slice(0, 10);

  const internationalAge = calculateInternationalAge(year, month, day, referenceDate);
  const koreanAge = internationalAge + 1;

  let currentDaewoonIndex: number | null = null;
  for (let i = 0; i < daYunList.length; i += 1) {
    const current = daYunList[i];
    const next = daYunList[i + 1];
    if (!next) {
      if (internationalAge >= current.startAge) {
        currentDaewoonIndex = i;
      }
      continue;
    }
    if (internationalAge >= current.startAge && internationalAge < next.startAge) {
      currentDaewoonIndex = i;
      break;
    }
  }

  return {
    solarDate: solar.toYmdHms(),
    lunarDate: lunar.toFullString(),
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: timePillar,
    tenGods: {
      year: {
        gan: calculateTenGods(dayGan, yearPillar.gan),
        ji: calculateTenGods(dayGan, yearPillar.ji),
      },
      month: {
        gan: calculateTenGods(dayGan, monthPillar.gan),
        ji: calculateTenGods(dayGan, monthPillar.ji),
      },
      day: {
        gan: "일원(본인)",
        ji: calculateTenGods(dayGan, dayPillar.ji),
      },
      time: {
        gan: calculateTenGods(dayGan, timePillar.gan),
        ji: calculateTenGods(dayGan, timePillar.ji),
      },
    },
    daewoon: daYunList,
    currentAges: {
      international: internationalAge,
      korean: koreanAge,
    },
    currentDaewoonIndex,
    shensha,
    todayFortune: calculateDailyFortune(dayGan, dayPillar.ji),
  };
}

