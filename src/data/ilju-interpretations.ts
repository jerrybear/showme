export interface IljuInterpretation {
  key: string;
  gan: string;
  ji: string;
  title: string;
  personality: string;
  wealth: string;
  career: string;
}

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const GAN_KR: Record<(typeof GAN)[number], string> = {
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

const ZHI_KR: Record<(typeof ZHI)[number], string> = {
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

const ANIMAL_BY_ZHI: Record<(typeof ZHI)[number], string> = {
  子: "쥐",
  丑: "소",
  寅: "호랑이",
  卯: "토끼",
  辰: "용",
  巳: "뱀",
  午: "말",
  未: "양",
  申: "원숭이",
  酉: "닭",
  戌: "개",
  亥: "돼지",
};

const TITLE_PREFIX_BY_GAN: Record<(typeof GAN)[number], string> = {
  甲: "푸른",
  乙: "유연한",
  丙: "빛나는",
  丁: "따뜻한",
  戊: "든든한",
  己: "온화한",
  庚: "강인한",
  辛: "정교한",
  壬: "깊은",
  癸: "맑은",
};

const PERSONALITY_BY_GAN: Record<(typeof GAN)[number], string> = {
  甲: "기준을 세우고 방향을 잡는 힘이 강합니다.",
  乙: "관계를 부드럽게 연결하고 조율하는 감각이 좋습니다.",
  丙: "분위기를 밝히고 추진 동력을 만드는 재능이 있습니다.",
  丁: "세부를 살피고 완성도를 끌어올리는 집중력이 좋습니다.",
  戊: "흔들림 없이 중심을 지키며 장기전을 버티는 힘이 있습니다.",
  己: "상대의 필요를 읽고 현실적인 해법을 찾는 능력이 좋습니다.",
  庚: "판단이 빠르고 핵심을 잘라내는 결단력이 강점입니다.",
  辛: "정교한 기준으로 결과물을 다듬는 감각이 뛰어납니다.",
  壬: "큰 흐름을 읽고 판을 넓게 보는 시야가 좋습니다.",
  癸: "세밀한 변화와 맥락을 빠르게 포착하는 감수성이 있습니다.",
};

const PERSONALITY_BY_ZHI: Record<(typeof ZHI)[number], string> = {
  子: "아이디어를 축적해 타이밍 좋게 꺼내는 편입니다.",
  丑: "속도는 느려도 끝까지 책임지는 태도가 돋보입니다.",
  寅: "새로운 출발에서 리더십이 잘 드러납니다.",
  卯: "대인관계에서 신뢰와 호감을 쌓는 속도가 빠릅니다.",
  辰: "다양한 입장을 조정하며 균형점을 찾는 능력이 좋습니다.",
  巳: "표현력과 설득력이 필요한 장면에서 존재감이 큽니다.",
  午: "현장감과 행동력이 강해 상황을 전진시키는 힘이 있습니다.",
  未: "주변을 돌보며 분위기를 안정시키는 역할에 강합니다.",
  申: "문제 구조를 파악해 효율적인 실행으로 연결하는 편입니다.",
  酉: "정돈된 체계와 정확성을 요구하는 환경에서 빛납니다.",
  戌: "원칙과 책임을 중시하며 신뢰 기반을 단단히 만듭니다.",
  亥: "통찰과 상상력을 바탕으로 새로운 관점을 제시합니다.",
};

const WEALTH_BY_GAN: Record<(typeof GAN)[number], string> = {
  甲: "확장 국면에서 수익 기회를 포착하는 편입니다.",
  乙: "지속 가능한 현금흐름을 만드는 운영 감각이 좋습니다.",
  丙: "네트워크와 노출이 재물 기회로 이어지기 쉽습니다.",
  丁: "세밀한 관리로 손실을 줄이고 효율을 높입니다.",
  戊: "안정 자산을 차근히 쌓는 전략이 잘 맞습니다.",
  己: "예산 배분과 비용 통제에서 강점을 보입니다.",
  庚: "결정이 필요한 시점에 과감한 선택으로 성과를 냅니다.",
  辛: "단가와 품질을 정밀하게 조율해 이익률을 지킵니다.",
  壬: "흐름을 읽는 감각으로 순환 구조를 만들기 좋습니다.",
  癸: "작은 수익원을 꾸준히 늘리는 방식에 강합니다.",
};

const WEALTH_BY_ZHI: Record<(typeof ZHI)[number], string> = {
  子: "정보 수집과 타이밍 포착이 수익 효율을 높여 줍니다.",
  丑: "누적형 투자와 장기 관점의 저축 전략이 잘 맞습니다.",
  寅: "신규 프로젝트나 초기 시장 진입에서 기회가 생깁니다.",
  卯: "브랜딩과 평판이 재무 성과에 직접 연결되기 쉽습니다.",
  辰: "복수 자산을 분산해 리스크를 낮추는 방식이 유리합니다.",
  巳: "설득과 협상력이 좋은 조건을 만드는 데 도움이 됩니다.",
  午: "활동량이 많아질수록 기회가 커지는 구조가 나타납니다.",
  未: "안정적 파이프라인 구축이 재무 만족도를 높입니다.",
  申: "데이터 기반 판단이 손익 변동을 줄여 줍니다.",
  酉: "품질 기준을 지킬수록 단가 방어력이 좋아집니다.",
  戌: "원칙 있는 계약 관리가 손실 예방에 효과적입니다.",
  亥: "연구형 투자와 장기 테마 탐색에 적성이 있습니다.",
};

const CAREER_BY_GAN: Record<(typeof GAN)[number], string> = {
  甲: "전략 기획, 신사업, 교육 리딩",
  乙: "조정, 상담, 파트너십 운영",
  丙: "마케팅, 브랜딩, 퍼블릭 커뮤니케이션",
  丁: "콘텐츠 제작, 품질 관리, 전문 실무",
  戊: "프로젝트 총괄, 운영 리더, 조직 관리",
  己: "서비스 운영, HR, 고객 성공",
  庚: "의사결정 중심 역할, 영업 총괄, 구조개선",
  辛: "디자인, 분석, 감사/검수",
  壬: "사업개발, 리서치, 글로벌 협업",
  癸: "데이터/문서화, 기획 지원, 연구 보조",
};

const CAREER_BY_ZHI: Record<(typeof ZHI)[number], string> = {
  子: "기획/전략",
  丑: "재무/운영",
  寅: "창업/개척",
  卯: "브랜드/PR",
  辰: "PM/조정",
  巳: "세일즈/프레젠테이션",
  午: "현장/대외협력",
  未: "교육/케어",
  申: "분석/자동화",
  酉: "품질/디자인",
  戌: "보안/감사",
  亥: "연구/콘텐츠",
};

export const ILJU_INTERPRETATIONS: IljuInterpretation[] = Array.from({ length: 60 }, (_, index) => {
  const gan = GAN[index % 10];
  const ji = ZHI[index % 12];
  const ganKr = GAN_KR[gan];
  const jiKr = ZHI_KR[ji];
  const animal = ANIMAL_BY_ZHI[ji];
  const key = `${ganKr}${jiKr}(${gan}${ji})`;
  const title = `${TITLE_PREFIX_BY_GAN[gan]} ${animal}`;

  return {
    key,
    gan,
    ji,
    title,
    personality: `${PERSONALITY_BY_GAN[gan]} ${PERSONALITY_BY_ZHI[ji]} 관계에서는 신뢰와 일관성을 유지할수록 장점이 뚜렷해집니다.`,
    wealth: `${WEALTH_BY_GAN[gan]} ${WEALTH_BY_ZHI[ji]} 지출 목적과 회수 계획을 함께 관리하면 안정감이 커집니다.`,
    career: `${CAREER_BY_GAN[gan]} 영역에서 강점을 발휘하기 쉽습니다. 특히 ${CAREER_BY_ZHI[ji]} 성격의 역할과 결합할 때 성과가 꾸준히 누적됩니다.`,
  };
});

export const ILJU_BY_GAN_JI: Record<string, IljuInterpretation> = ILJU_INTERPRETATIONS.reduce(
  (acc, item) => {
    acc[`${item.gan}${item.ji}`] = item;
    return acc;
  },
  {} as Record<string, IljuInterpretation>
);
