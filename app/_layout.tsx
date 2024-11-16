import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SessionProvider } from '../components/SessionContext'

export default function _layout() {
  return (
    <SessionProvider>
    <Stack  screenOptions={{headerShown: false}} >
      <Stack.Screen name='index' options={{headerShown:false}} />
      <Stack.Screen name='about' options={{headerShown:false}} />
      <Stack.Screen name='Ai' options={{headerShown:false}} />
      <Stack.Screen name='Ar' options={{headerShown:false}} />
      
      <Stack.Screen name='Forgot' options={{headerShown:false}} />
     <Stack.Screen name='test' options={{headerShown:false}} />
    
      
    </Stack>
    </SessionProvider>
  )
}