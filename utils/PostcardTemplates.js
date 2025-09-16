// 로컬 템플릿 이미지 매핑
export const postcardTemplates = {
    1: require('../assets/postcardType/1.png'),
    2: require('../assets/postcardType/2.png'),
    3: require('../assets/postcardType/3.png'),
    4: require('../assets/postcardType/4.png'),
    5: require('../assets/postcardType/5.png'),
    6: require('../assets/postcardType/6.png'),
    7: require('../assets/postcardType/7.png'),
    8: require('../assets/postcardType/8.png'),
    9: require('../assets/postcardType/9.png'),
    10: require('../assets/postcardType/10.png'),
    11: require('../assets/postcardType/11.png'),
    12: require('../assets/postcardType/12.png'),
    13: require('../assets/postcardType/13.png'),
    14: require('../assets/postcardType/14.png'),
    15: require('../assets/postcardType/15.png'),
};

// 템플릿별 텍스트 레이아웃 스타일 함수
export const getPostcardOverlayStyle = (templateNumber) => {
    switch (templateNumber) {
        case 1:
            // 첫 번째 템플릿: 오른쪽에 텍스트
            return {
                width: '50%',
                height: '70%',
                position: 'absolute',
                right: '-1%',
                top: '32%',
                padding: 18,
                lineHeight: 20,
                justifyContent: 'space-between',
            };
        case 2:
            // 두 번째 템플릿: 양쪽에 텍스트
            return {
                width: '85%',
                height: '70%',
                padding: 18,
                lineHeight: 20,
                left: '8%',
                top: '18%',
                justifyContent: 'space-between',
                flexDirection: 'row',
                textAlign: 'left'
            };
        case 3:
            // 세 번째 템플릿: 전체적으로 텍스트
            return {
                width: '85%',
                height: '70%',
                top: '12%',
                left: '8%',
                padding: 18,
                lineHeight: 22,
                justifyContent: 'center',
                textAlign: 'left'
            };
        case 4:
            // 네 번째 템플릿: 중간-하단 영역에 텍스트
            return {
                width: '80%',
                height: '50%',
                position: 'absolute',
                bottom: '15%',
                padding: 15,
                lineHeight: 28,
                top: '39%',
                left: '8%',
                justifyContent: 'flex-start',
            };
        case 5:
            // 다섯 번째 템플릿: 중간 영역에 텍스트, 날짜는 오른쪽 하단
            return {
                width: '100%',
                height: '80%',
                position: 'absolute',
                top: '28%',
                padding: 15,
                lineHeight: 28,
                justifyContent: 'space-between',
            };
        case 6:
            // 여섯 번째 템플릿: 중앙에 텍스트, 날짜는 하단
            return {
                width: '100%',
                height: '50%',
                top: '60%',
                padding: 20,
                justifyContent: 'space-between',
            };
        case 7:
            // 일곱 번째 템플릿: 상단 영역에 텍스트
            return {
                width: '100%',
                height: '50%',
                position: 'absolute',
                top: '40%',
                padding: 15,
                justifyContent: 'flex-start',
            };
        case 8:
            // 여덟 번째 템플릿: 상단과 중앙 영역
            return {
                width: '100%',
                height: '50%',
                top: '55%',
                padding: 20,
                justifyContent: 'space-between',
            };
        case 9:
            // 아홉 번째 템플릿: 오른쪽 영역 (왼쪽 세로 텍스트 피해서)
            return {
                width: '70%',
                height: '65%',
                position: 'absolute',
                top: '20%',
                left: '12%',
                padding: 15,
                justifyContent: 'center',
                textAlign: 'left'
            };
        case 10:
            // 열 번째 템플릿: 제목 아래 중앙 영역
            return {
                width: '80%',
                height: '65%',
                position: 'absolute',
                top: '22%',
                left: '10%',
                padding: 15,
                justifyContent: 'center',
                textAlign: 'left'
            };
        default:
            // 기본 스타일
            return {
                width: '80%',
                height: '70%',
                padding: 20,
                justifyContent: 'space-between',
            };
    }
};