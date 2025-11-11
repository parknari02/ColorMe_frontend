// @ts-ignore - Vite 환경 변수
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export interface Product {
    id: string;
    brand: string;
    name: string;
    option_name: string;
    price: number | null;
    price_str: string;
    img_url: string;
    shade_hex: string | null;
    product_url: string;
    reason?: string;
}

export interface SearchResponse {
    products: Product[];
    total_found: number;
    personal_color: string;
    query: string;
    note?: string;
}

export interface PersonalColorResponse {
    predicted_class: string;
    confidence: number;
    class_probabilities: Record<string, number>;
    all_probs?: number[] | null;
    note?: string;
}

/**
 * 퍼스널 컬러 형식을 API 형식으로 변환
 * spring-light -> spring_light
 * spring -> spring (그대로)
 */
export function convertPersonalColorToAPI(color: string): string {
    // 이미 계절만 있는 경우 (spring, summer 등) 그대로 반환
    if (!color.includes('-') && !color.includes('_')) {
        return color;
    }
    // 세부 형식이 있는 경우 (spring-light -> spring_light)
    return color.replace('-', '_');
}

/**
 * 화장품 추천 API 호출
 */
export async function recommendCosmetics(
    personalColor: string,
    query: string = '',
    budget?: number,
    skinType?: string,
    limit: number = 10
): Promise<SearchResponse> {
    const apiPersonalColor = convertPersonalColorToAPI(personalColor);

    // FastAPI의 /recommend는 query parameter로 받음
    const params = new URLSearchParams({
        personal_color: apiPersonalColor,
        query: query || '추천해주세요',
        limit: limit.toString(),
    });

    if (budget) {
        params.append('budget', budget.toString());
    }

    if (skinType) {
        params.append('skin_type', skinType);
    }

    const response = await fetch(`${BASE_URL}/recommend?${params.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 호출 실패 (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * 퍼스널 컬러 예측 API 호출 (이미지 업로드)
 */
export async function predictPersonalColor(file: File): Promise<PersonalColorResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/predict-color`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`퍼스널 컬러 예측 실패 (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * API 응답의 predicted_class를 앱 내부 형식으로 변환
 * spring -> spring-light (기본값)
 * summer -> summer-light
 * autumn -> autumn-mute
 * winter -> winter-bright
 */
export function convertAPIColorToAppFormat(predictedClass: string): string {
    const colorMap: Record<string, string> = {
        'spring': 'spring-light',
        'summer': 'summer-light',
        'autumn': 'autumn-mute',
        'winter': 'winter-bright',
    };

    // 이미 세부 형식이 있으면 그대로 반환 (spring-light, summer-mute 등)
    if (predictedClass.includes('-')) {
        return predictedClass;
    }

    return colorMap[predictedClass.toLowerCase()] || 'spring-light';
}

