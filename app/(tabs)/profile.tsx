import { View, Text, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { API_URL } from '../../global';
import { useSession } from '@/components/SessionContext';
import { router } from 'expo-router';

export default function profile() {
  const { session, setSession } = useSession();
  
  const checkLogin = async () => {
    try {
      const resSession = await fetch(API_URL + "/api/auth/session");
      const session = await resSession.json();

      console.log("session home", session);
      if (!session.user) {
        console.log("User not logged in, redirecting to login page.");
        setSession(null);
        router.replace('/');
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "ยืนยันการออกจากระบบ",
      "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "ตกลง",
          onPress: async () => {
            try {
              // Fetch CSRF token for secure logout
              const resCsrf = await fetch(API_URL + "/api/auth/csrf");
              const csrfToken = await resCsrf.json();
  
              // Perform logout request
              await fetch(API_URL + "/api/auth/signout", {
                method: 'POST',
                headers: {
                  Connection: 'keep-alive',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(csrfToken),
              }).catch((error) => console.log(error));
  
              // Verify if user is logged out
              const resSession = await fetch(API_URL + "/api/auth/session");
              const session = await resSession.json();
              if (!session.user) {
                setSession(null);
                router.replace('/'); // Navigate to Login screen after successful logout
              }
            } catch (error) {
              console.error("Error logging out:", error);
            }
          }
        }
      ]
    );
  };
  
  useEffect(() => {
    checkLogin(); // Ensure login check on component load
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: API_URL + session?.user?.picture || 'https://example.com/profile.jpg' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.profileName}>{session?.user?.name}</Text>
        <Text style={styles.profileEmail}>{session?.user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => {router.push('/HelpCenter') }}>
        <Text style={styles.buttonText}>ศูนย์การช่วยเหลือ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#dceaf7',
    
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#afd7f6',
    paddingVertical: 20,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
