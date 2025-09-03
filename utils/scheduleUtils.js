// 시간 관련 유틸리티
export const timeUtils = {
    timeToMinutes: (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    },

    minutesToTime: (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
};

// 일정 관련 유틸리티
export const scheduleUtils = {
    getCategoryStyle: (category) => {
        const categoryStyles = {
            '숙소': { backgroundColor: '#FFF5CC', borderColor: '#FFD965', textColor: '#000' },
            '식사': { backgroundColor: '#FFE5D5', borderColor: '#FF9E6D', textColor: '#000' },
            '관광': { backgroundColor: '#E6F1FB', borderColor: '#A3C8E9', textColor: '#000' },
            '휴식': { backgroundColor: '#EFF5EC', borderColor: '#C6D6C3', textColor: '#000' }
        };

        return categoryStyles[category] || categoryStyles['관광'];
    },

    getScheduleInfo: (dayNumber, timeSlot, scheduleData) => {
        const dayKey = `day${dayNumber}`;
        const daySchedules = scheduleData[dayKey] || [];

        const currentMinutes = timeUtils.timeToMinutes(timeSlot.timeString);

        for (const schedule of daySchedules) {
            const startMinutes = timeUtils.timeToMinutes(schedule.startTime);
            const endMinutes = timeUtils.timeToMinutes(schedule.endTime);

            // 현재 timeSlot이 특정 일정에 포함되는지 확인
            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                const isFirstBlockOfSchedule = currentMinutes === startMinutes;

                return {
                    schedule,
                    isFirstBlockOfSchedule,
                    startMinutes,
                    endMinutes
                };
            }
        }
        return null;
    },

                calculateBlockHeight: (startMinutes, endMinutes, dayNumber, daySlotInfo) => {
        let totalMinutesDuration = 0;
        let currentTime = startMinutes;

        while (currentTime < endMinutes) {
            const currentHour = Math.floor(currentTime / 60);
            const needsHalfHour = daySlotInfo[dayNumber] && daySlotInfo[dayNumber][currentHour];

            if (needsHalfHour) {
                // 30분 단위로 계산 (현재 시간부터 30분 또는 종료 시간까지)
                const durationToAdd = Math.min(30, endMinutes - currentTime);
                totalMinutesDuration += durationToAdd;
                currentTime += durationToAdd;
            } else {
                // 1시간 단위로 계산 (현재 시간부터 60분 또는 종료 시간까지)
                const durationToAdd = Math.min(60, endMinutes - currentTime);
                totalMinutesDuration += durationToAdd;
                currentTime += durationToAdd;
            }
        }
        // 최소 높이 보장 (0분짜리 스케줄이 아니면 최소 30분 높이)
        if (totalMinutesDuration === 0 && (endMinutes - startMinutes) > 0) {
            return 30; // 30분으로 간주하여 최소 높이 보장
        }
        return totalMinutesDuration; // 분 단위로 반환
    },

    findNextScheduleStartTime: (dayNumber, currentMinutes, scheduleData) => {
        const dayKey = `day${dayNumber}`;
        const daySchedules = scheduleData[dayKey] || [];

        let nextScheduleStartMinutes = 24 * 60; // Default to end of day (midnight)

        for (const schedule of daySchedules) {
            const scheduleStart = timeUtils.timeToMinutes(schedule.startTime);
            if (scheduleStart > currentMinutes && scheduleStart < nextScheduleStartMinutes) {
                nextScheduleStartMinutes = scheduleStart;
            }
        }
        return nextScheduleStartMinutes;
    }
};