import React from 'react';
import { useRouter } from 'expo-router';
import DibsScrap from '../wishlist/DibsorScrap'; 

export default function AccompanyHome() {
    const router = useRouter();
    return <DibsScrap router={router} />;
}