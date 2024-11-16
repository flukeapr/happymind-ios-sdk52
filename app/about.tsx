import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { Button } from '@rneui/base'
import { useRouter } from 'expo-router'
export default function about() {
    const router = useRouter();
  return (
    <View>
      <Text>about</Text>
      <Button onPress={() => router.back()}>Back</Button>
    </View>
  )
}