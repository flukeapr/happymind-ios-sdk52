import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, Button, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { API_URL } from '../../global';
import { useSession } from '@/components/SessionContext';

const { width, height } = Dimensions.get('window');

export default function documents() {
  const { session } = useSession();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL + '/api/media');
        const data = await res.json();
        console.log(data);  // Log the API response to inspect the data structure
        setDocuments(data);
        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "Failed to load documents.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch((err) => Alert.alert("Error", "Failed to open URL."));
  };

  return (
    <>
    {loading ? (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    ) :(
      <>
       <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>สื่อให้ความรู้</Text>

      {/* Section for Images */}
    <Text style={styles.subtitle}>ภาพสื่อให้ความรู้</Text>
    <View style={styles.grid}>
      {documents.filter(doc => doc.image).map((doc, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => handleOpenLink(doc.url)}>
          <Image source={{ uri: API_URL + doc.image }} style={styles.image} />
          <Text style={styles.text}>{doc.title}</Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Section for Videos */}
    <Text style={styles.subtitle}>วิดีโอให้ความรู้</Text>
    <View style={styles.grid}>
      {documents.filter(doc => doc.video).map((doc, index) => (
        <VideoCard key={index} videoUri={API_URL + doc.video} title={doc.title} content={doc.content} />
      ))}
    </View>
    </ScrollView>
    </>
    )}
  </>
  )
};


const VideoCard = ({ videoUri, title, content }) => {
  const videoRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePressVideo = () => {
    setModalVisible(true);  // Show the modal with the content and video
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (videoRef.current) {
      videoRef.current.stopAsync(); // Stop the video when modal is closed
    }
  };

  return (
    <View>
      {/* Thumbnail and Title */}
      <TouchableOpacity style={styles.cardVDO} onPress={handlePressVideo}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode="contain"
          style={styles.video}
          useNativeControls={false}
        />
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>

      {/* Modal for displaying video and content */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.modalTitle}>{title}</Text>

              {/* Display video inside Modal */}
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                resizeMode="contain"
                style={styles.modalVideo}
                useNativeControls={true}
                shouldPlay={true}
              />

              <Text style={styles.modalContent}>{content}</Text>
            </ScrollView>
            <Button title="ปิด" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   
    padding: 16,
    backgroundColor: '#dceaf7',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '49%',  // Change to full width
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardVDO: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  horizontal: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    width: width * 0.85,  // 85% of screen width
    maxHeight: height * 0.75, // Limit modal height to 75% of screen height
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalVideo: {
    width: '100%',
    aspectRatio: 16 / 9,  // Maintain 16:9 aspect ratio for video
    marginBottom: 20,
  },
  modalContent: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
});
