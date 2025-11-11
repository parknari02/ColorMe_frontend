import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChatMessage } from '../ChatMessage';
import { ImageUploader } from '../ImageUploader';
import { useApp } from '../../context/AppContext';
import { predictPersonalColor, convertAPIColorToAppFormat } from '../../utils/api';

export function UploadStep() {
    const { setUploadedImage, setStep, setPersonalColor, setPersonalColorNote, setPersonalColorClass } = useApp();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (file: File) => {
        // 이미지 미리보기 설정
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // 분석 시작
        setIsAnalyzing(true);
        setError(null);
        setStep('analyzing');

        try {
            // API 호출
            const response = await predictPersonalColor(file);

            // 퍼스널 컬러 형식 변환 및 설정
            const appColorFormat = convertAPIColorToAppFormat(response.predicted_class);
            setPersonalColor(appColorFormat);

            // API 응답 정보 저장
            setPersonalColorClass(response.predicted_class);
            setPersonalColorNote(response.note || null);

            // 결과 페이지로 이동
            setStep('result');
        } catch (err) {
            console.error('퍼스널 컬러 예측 실패:', err);
            setError('퍼스널 컬러 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
            setStep('upload'); // 업로드 페이지로 돌아가기
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <ChatMessage type="user">
                <p>사진으로 분석해주세요</p>
            </ChatMessage>
            <ChatMessage type="bot" delay={0.2}>
                <p>얼굴이 잘 보이는 사진을 업로드해주세요.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    자연광에서 촬영한 사진이 가장 정확해요!
                </p>
            </ChatMessage>
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <ImageUploader onUpload={handleImageUpload} />
            </motion.div>
        </>
    );
}

