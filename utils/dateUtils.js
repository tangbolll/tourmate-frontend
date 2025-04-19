// 간단한 날짜 형식 변환 함수
export const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 요일 가져오기 함수
export const getDayOfWeek = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(date).getDay()];
};