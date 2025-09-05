import { Redirect } from 'expo-router';

// 이 파일은 앱의 루트 경로('/')에 해당합니다.
// AuthContext의 로직에 따라 사용자를 적절한 페이지로 리디렉션하기 위해
// '(tabs)' 그룹의 첫 번째 라우트로 리디렉션합니다.
export default function Index() {
    return <Redirect href="/(tabs)" />;
}
//import TypeTestMain from './typeTest/index';
//import Home from './(tabs)';

//export default function Index() {
//    return <TypeTestMain />;
//}

// 이것도 나중에 지울게요 - 탱
// import React, { useEffect } from 'react';
// import { useAuth, debugTokenStorage, debugUserDataMismatch } from '../context/AuthContext';
// import Home from './(tabs)';

// const AppWrapper = () => {
//     const auth = useAuth();

//     // useEffect 훅을 사용하여 컴포넌트가 처음 마운트될 때 한 번만 실행합니다.
//     useEffect(() => {
//         debugUserDataMismatch();
//     }, []);

//     // auth.loading 상태에 따라 로딩 스크린을 렌더링합니다.
//     if (auth.loading) {
//         return null; // 또는 <ActivityIndicator /> 등 로딩 컴포넌트를 반환
//     }

//     // 모든 준비가 완료되면 App 컴포넌트를 렌더링합니다.
//     return <myTour />;
// };

// export default AppWrapper;