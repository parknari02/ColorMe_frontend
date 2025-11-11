import React, { useState } from 'react';
import { ChatMessage } from '../ChatMessage';
import { Button } from '../common/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { recommendCosmetics } from '../../utils/api';

export function ResultStep() {
    const {
        personalColor,
        personalColorClass,
        personalColorNote,
        getPersonalColorName,
        setStep,
        cosmeticPreferences,
        setRecommendedProducts
    } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 퍼스널 컬러 클래스 이름 변환
    const getColorClassName = (colorClass: string | null) => {
        if (!colorClass) return '';
        const colorNames: Record<string, string> = {
            'spring': '봄 웜톤',
            'summer': '여름 쿨톤',
            'autumn': '가을 웜톤',
            'winter': '겨울 쿨톤',
        };
        return colorNames[colorClass.toLowerCase()] || colorClass;
    };

    // note를 분석 이유와 추천 팁으로 분리
    const parseNote = (note: string | null) => {
        if (!note) return { reason: '', suggestions: '' };
        const parts = note.split(' | ');
        return {
            reason: parts[0] || '',
            suggestions: parts[1] || '',
        };
    };

    const { reason, suggestions } = parseNote(personalColorNote);

    const handleRecommend = async () => {
        if (!personalColor && !personalColorClass) {
            setError('퍼스널 컬러가 설정되지 않았습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const query = cosmeticPreferences || '추천해주세요';

            // 이미지로 분석받은 경우: personalColorClass (예: "summer", "spring")를 그대로 사용
            // 수동으로 선택한 경우: personalColor (예: "spring-light")를 API 형식으로 변환
            const colorForAPI = personalColorClass || personalColor;

            const response = await recommendCosmetics(colorForAPI, query, undefined, undefined, 10);

            setRecommendedProducts(response.products);
            setStep('cosmetics');
        } catch (err) {
            console.error('화장품 추천 API 호출 실패:', err);
            setError('화장품 추천을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ChatMessage type="bot" delay={0}>
                {personalColorClass ? (
                    <p>분석이 완료되었어요! ✨</p>
                ) : (
                    <p>선택한 퍼스널 컬러가 있어요! ✨</p>
                )}
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">당신의 퍼스널 컬러는</p>
                    {personalColorClass ? (
                        <h3 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-xl font-bold">
                            {getColorClassName(personalColorClass)}
                        </h3>
                    ) : (
                        <h3 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-xl font-bold">
                            {getPersonalColorName(personalColor)}
                        </h3>
                    )}
                </div>
            </ChatMessage>
            {reason && (
                <ChatMessage type="bot" delay={0.2}>
                    <div className="space-y-2">
                        <p className="font-medium text-foreground">분석 결과</p>
                        <p className="text-sm text-muted-foreground">{reason}</p>
                    </div>
                </ChatMessage>
            )}
            {suggestions && (
                <ChatMessage type="bot" delay={0.3}>
                    <div className="space-y-2">
                        <p className="font-medium text-foreground">추천 팁</p>
                        <p className="text-sm text-muted-foreground">{suggestions}</p>
                    </div>
                </ChatMessage>
            )}
            <ChatMessage type="bot" delay={0.4}>
                <p>이제 화장품 추천을 받아보실까요? 💄</p>
            </ChatMessage>
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
            <div className="flex gap-3 justify-center flex-wrap mt-6">
                <Button
                    onClick={handleRecommend}
                    disabled={isLoading}
                    className="cursor-pointer bg-gradient-to-r from-primary to-pink-400 hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            추천 중...
                        </>
                    ) : (
                        <>
                            화장품 추천 받기
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </>
    );
}

