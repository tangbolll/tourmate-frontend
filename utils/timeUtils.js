import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 타임스탬프 포맷팅 함수
export const formatChatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = dayjs();
    const messageTime = dayjs(timestamp);
    const diffInHours = now.diff(messageTime, 'hour');
    const diffInMinutes = now.diff(messageTime, 'minute');
    const diffInDays = now.diff(messageTime, 'day');
    
    // 1분 미만
    if (diffInMinutes < 1) {
        return '방금 전';
    }
    // 1시간 미만
    else if (diffInHours < 1) {
        return `${diffInMinutes}분 전`;
    }
    // 24시간 미만
    else if (diffInHours < 24) {
        return messageTime.format('HH:mm');
    }
    // 1주일 미만
    else if (diffInDays < 7) {
        return messageTime.format('M월 D일');
    }
    // 1주일 이상
    else {
        return messageTime.format('YYYY.M.D');
    }
};