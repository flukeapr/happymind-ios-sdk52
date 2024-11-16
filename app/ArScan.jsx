import { Camera, useCameraDevice } from 'react-native-vision-camera'
import { useFaceDetection } from 'vision-camera-face-detector'
import { useState, useEffect } from "react"
import { Button, StyleSheet, Text, View } from "react-native"

export default function ArScan() {
  const [hasPermission, setHasPermission] = useState(false)
  const [faceBounds, setFaceBounds] = useState(null)
  const [cameraPosition, setCameraPosition] = useState('front')
  const [expression, setExpression] = useState("")
  
  const device = useCameraDevice(cameraPosition)
  const frameProcessor = useFaceDetection({
    maxFaces: 1,
  })

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission()
    setHasPermission(cameraPermission === 'granted')
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={checkPermission} title="grant permission" />
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No camera device available</Text>
      </View>
    )
  }

  const handleFacesDetected = (faces) => {
    if (faces && faces.length > 0) {
      const face = faces[0]
      setFaceBounds({
        origin: { x: face.bounds.x, y: face.bounds.y },
        size: { width: face.bounds.width, height: face.bounds.height }
      })
      
      // Smile detection based on face landmarks
      if (face.smilingProbability > 0.3) {
        setExpression("Happy")
      } else {
        setExpression("Sad")
      }
    } else {
      setFaceBounds(null)
      setExpression("")
    }
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        onFrameProcessed={handleFacesDetected}
      >
        {faceBounds && (
          <View
            style={[
              styles.faceBorder,
              {
                left: faceBounds.origin.x,
                top: faceBounds.origin.y,
                width: faceBounds.size.width,
                height: faceBounds.size.height,
              },
            ]}
          />
        )}
        {faceBounds && (
          <Text
            style={[
              styles.expressionText,
              {
                position: 'absolute',
                left: faceBounds.origin.x,
                top: faceBounds.origin.y + faceBounds.size.height + 10,
              },
            ]}
          >
            {expression}
          </Text>
        )}
      </Camera>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  faceBorder: {
    position: "absolute",
    borderColor: "green",
    borderWidth: 2,
    borderRadius: 10,
  },
  expressionText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
    textAlign: "center",
  }
})