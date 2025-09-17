import Constants from 'expo-constants';


const kakaoRestApiKey = Constants.expoConfig.extra.kakaoRestApiKey;
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';


export const searchLocation = async (query) => {
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return null;
    }

    try {
        const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=1`, {
            headers: { 'Authorization': `KakaoAK ${kakaoRestApiKey}` }
        });

        if (!response.ok) {
            throw new Error(`Kakao API search failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            return data.documents[0];
        } else {
            console.log(`[Search] No results found for query: "${query}"`);
            return null;
        }
    } catch (error) {
        console.error(`[Search] An error occurred during search for query "${query}":`, error);
        return null;
    }
};
