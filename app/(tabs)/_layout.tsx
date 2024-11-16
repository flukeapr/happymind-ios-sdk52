import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function _layout() {
  return (
    <Tabs screenOptions={{headerShown: false}} >
      <Tabs.Screen name='home' options={{
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name='home' color={color} size={size} />
        )
        }} />
         <Tabs.Screen name='community' options={{
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name='people' color={color} size={size} />
        )
        }} />
         <Tabs.Screen name='result' options={{
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name='bar-chart' color={color} size={size} />
        )
        }} />
        <Tabs.Screen name='documents' options={{
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name='document' color={color} size={size} />
        )
        }} />
         <Tabs.Screen name='profile' options={{
        headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name='person' color={color} size={size} />
        )
        }} />
    </Tabs>
  )
}