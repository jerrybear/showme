import type { DailyFortune as DailyFortuneData } from "@/utils/saju-calculator";

interface DailyFortuneProps {
    fortune: DailyFortuneData;
}

export default function DailyFortune({ fortune }: DailyFortuneProps) {
    return (
        <div className="daily-fortune-card">
            <div className="daily-header">
                <h3 className="daily-title">오늘의 운세</h3>
                <span className="daily-date">{fortune.date}</span>
            </div>

            <div className="daily-content">
                <div className={`daily-badge ${fortune.lucky ? "lucky" : "normal"}`}>
                    오늘의 기운: {fortune.tenGod}
                </div>
                <div className="daily-ganzhi">
                    {fortune.gan}{fortune.ji} ({fortune.ganKr}{fortune.jiKr})일
                </div>
                <p className="daily-comment">{fortune.comment}</p>
            </div>
        </div>
    );
}
