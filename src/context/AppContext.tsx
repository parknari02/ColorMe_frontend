import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../utils/api';

type Step = 'welcome' | 'choose-method' | 'upload' | 'select-color' | 'analyzing' | 'result' | 'cosmetic-preference' | 'cosmetics' | 'style-preference' | 'fashion-recommendations';

interface AppContextType {
    step: Step;
    setStep: (step: Step) => void;
    personalColor: string;
    setPersonalColor: (color: string) => void;
    personalColorNote: string | null;
    setPersonalColorNote: (note: string | null) => void;
    personalColorClass: string | null;
    setPersonalColorClass: (colorClass: string | null) => void;
    uploadedImage: string | null;
    setUploadedImage: (image: string | null) => void;
    cosmeticPreferences: string;
    setCosmeticPreferences: (preferences: string) => void;
    stylePreferences: { bodyType: string; style: string } | null;
    setStylePreferences: (preferences: { bodyType: string; style: string } | null) => void;
    selectedCosmeticCategory: string;
    setSelectedCosmeticCategory: (category: string) => void;
    recommendedProducts: Product[];
    setRecommendedProducts: (products: Product[]) => void;
    getPersonalColorName: (color: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [step, setStep] = useState<Step>('welcome');
    const [personalColor, setPersonalColor] = useState<string>('');
    const [personalColorNote, setPersonalColorNote] = useState<string | null>(null);
    const [personalColorClass, setPersonalColorClass] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [cosmeticPreferences, setCosmeticPreferences] = useState<string>('');
    const [stylePreferences, setStylePreferences] = useState<{ bodyType: string; style: string } | null>(null);
    const [selectedCosmeticCategory, setSelectedCosmeticCategory] = useState<string>('베이스');
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

    const getPersonalColorName = (color: string) => {
        const colorNames: Record<string, string> = {
            'spring-light': '봄 라이트',
            'spring-bright': '봄 브라이트',
            'summer-light': '여름 라이트',
            'summer-mute': '여름 뮤트',
            'autumn-mute': '가을 뮤트',
            'autumn-deep': '가을 딥',
            'winter-bright': '겨울 브라이트',
            'winter-dark': '겨울 다크',
            'spring': '봄 웜톤',
            'summer': '여름 쿨톤',
            'autumn': '가을 웜톤',
            'winter': '겨울 쿨톤',
        };
        return colorNames[color] || color;
    };

    return (
        <AppContext.Provider
            value={{
                step,
                setStep,
                personalColor,
                setPersonalColor,
                personalColorNote,
                setPersonalColorNote,
                personalColorClass,
                setPersonalColorClass,
                uploadedImage,
                setUploadedImage,
                cosmeticPreferences,
                setCosmeticPreferences,
                stylePreferences,
                setStylePreferences,
                selectedCosmeticCategory,
                setSelectedCosmeticCategory,
                recommendedProducts,
                setRecommendedProducts,
                getPersonalColorName,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

