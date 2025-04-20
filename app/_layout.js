import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Text, View } from 'react-native';

export default function AppLayout() {
    return (
        <Tabs
        screenOptions={{
            tabBarShowLabel: true,
            tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            borderTopWidth: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: 'white'
            },
            headerShown: false,
        }}
        >
        {/* 1. 동행 */}
        <Tabs.Screen
            name="accompany"
            options={{
            tabBarLabel: ({ focused }) => (
                <Text style={{
                fontSize: 11,
                color: focused ? '#000' : '#999',
                fontWeight: focused ? 'bold' : 'normal'
                }}>동행</Text>
            ),
            tabBarIcon: ({ focused }) => (
                <Ionicons name="people" size={24} color={focused ? '#000' : '#ccc'} />
            ),
            }}
        />
        {/* 2. 찜 */}
        <Tabs.Screen
            name="wishlist"
            options={{
            tabBarLabel: ({ focused }) => (
                <Text style={{
                fontSize: 11,
                color: focused ? '#000' : '#999',
                fontWeight: focused ? 'bold' : 'normal'
                }}>찜</Text>
            ),
            tabBarIcon: ({ focused }) => (
                <Ionicons name="heart" size={24} color={focused ? '#000' : '#ccc'} />
            ),
            }}
        />
        {/* 3. 홈 */}
        <Tabs.Screen
            name="home"
            options={{
            tabBarLabel: ({ focused }) => (
                <Text style={{
                fontSize: 11,
                color: focused ? '#000' : '#999',
                fontWeight: focused ? 'bold' : 'normal'
                }}>홈</Text>
            ),
            tabBarIcon: ({ focused }) => (
                <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: focused ? '#000' : '#ccc',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                }}>
                <Ionicons name="home" size={22} color="#fff" />
                </View>
            ),
            }}
        />
        {/* 4. 내 여행 */}
        <Tabs.Screen
            name="mytrips"
            options={{
            tabBarLabel: ({ focused }) => (
                <Text style={{
                fontSize: 11,
                color: focused ? '#000' : '#999',
                fontWeight: focused ? 'bold' : 'normal'
                }}>내 여행</Text>
            ),
            tabBarIcon: ({ focused }) => (
                <FontAwesome6 name="plane-up" size={22} color={focused ? '#000' : '#ccc'} />
            ),
            }}
        />
        {/* 5. 프로필 */}
        <Tabs.Screen
            name="profile"
            options={{
            tabBarLabel: ({ focused }) => (
                <Text style={{
                fontSize: 11,
                color: focused ? '#000' : '#999',
                fontWeight: focused ? 'bold' : 'normal'
                }}>프로필</Text>
            ),
            tabBarIcon: ({ focused }) => (
                <Ionicons name="person" size={24} color={focused ? '#000' : '#ccc'} />
            ),
            }}
        />
        </Tabs>
    );
}
