import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
 // Import Image
import { useSession } from "../components/SessionContext";
import { API_URL } from "../global";

export default function App() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { session, setSession } = useSession();

  
  useEffect(() => {
    const checkLogin = async () => {
      try {
          const resSession = await fetch(API_URL + '/api/auth/session');
        const session = await resSession.json();
        console.log("session login page", session);
        if (session?.user) {
          console.log("User already logged in");
          setSession(session);
          if (session.user.role === 2) {        
            router.replace('/(tabs)/home'); 
          } else {
            Alert.alert("Access Denied", "You do not have the necessary permissions.");
          } 
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('กรุณากรอกอีเมล์และรหัสผ่าน');
        return;
      }
  
      const resCsrf = await fetch(API_URL + '/api/auth/csrf');
      const csrfToken = await resCsrf.json();
  
      const response = await fetch(API_URL + '/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          Connection: 'keep-alive',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, ...csrfToken }),
      }).then((response) => response.json())
        .catch((error) => console.log(error));
  
      const resSession = await fetch(API_URL + '/api/auth/session');
      const session = await resSession.json();
  
      if (session.user) {
        setSession(session);
  
        if (session.user.role === 2) {
          Alert.alert("เข้าสู่ระบบสำเร็จ");
          router.replace('/(tabs)/home'); 
        }  else {
          Alert.alert("Access Denied", "You do not have the necessary permissions.");
          setTimeout(async () => {
            await fetch(API_URL + '/api/auth/signout', { method: 'POST' });
          }, 1500);
        }
      } else {
        Alert.alert('Login failed', 'Please check your credentials');
      }
    } catch (error : any) {
      console.log(error);
      Alert.alert('Network Error', error.message);
    }
  };

  function goToForgot(){
    try {
      router.push('/(auth)/Forgot');
    } catch (error) {
      console.log(error);
    }
  }

  function goToSignup(){
    try {
      router.push('/(auth)/Signup');
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <View style={styles.container}>
    <Image source={require('../assets/images/MH3.png')} style={{width: 300, height: 300}}  />
   <View style={styles.titleContainer}>
    
     {/* <Image 
       source={require('../res/smile-logo-blue.png')} // Adjust the path to your image
       style={styles.image}
     /> */}
     <Text style={styles.title}>HAPPYMIND</Text>
   </View>
   <Text style={styles.subtitle}>กรุณาป้อนอีเมลและรหัสผ่านของคุณ</Text>
   <View style={styles.form}>
  


   <TextInput
     style={styles.input}
     placeholder="อีเมล"
     placeholderTextColor="#999"
     value={email}
     onChangeText={setEmail}
   />
   <TextInput
     style={styles.input}
     placeholder="รหัสผ่าน"
     placeholderTextColor="#999"
     secureTextEntry
     value={password}
     onChangeText={setPassword}
   />
         <Text style={styles.link} onPress={goToForgot}>ลืมรหัสผ่าน      </Text>
   </View>
   <TouchableOpacity style={styles.button} onPress={handleLogin}>
     <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
   </TouchableOpacity>
   <Text style={styles.text}>     ยังไม่มีบัญชี?<Text style={styles.link} onPress={goToSignup}> สมัครสมาชิก      </Text></Text>
   <Text style={styles.text}></Text>
 </View>
  );
};
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10, // Space between image and text
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#023e8a',
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 20 
  },
  input: { 
    width: 280, 
    height: 50, 
    borderColor: '#023e8a', 
    borderWidth: 1, 
    marginBottom: 15, 
    paddingLeft: 15,
    borderRadius: 10,
    backgroundColor: 'white', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: { 
    backgroundColor: '#afd7f6',
    paddingVertical: 15, 
    paddingHorizontal: 80, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: { 
    color: '#023e8a', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: { 
    marginTop: 20,
    fontSize: 14,
    color: '#023e8a',
  },
  link: { 
    color: '#0077b6', 
    fontWeight: 'bold',
    
   
  },
  form:{
    display:'flex',
    justifyContent:'center',
    alignItems:'flex-end',
    marginBottom:10,
    
  }
});

