import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  Modal,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker for image handling
import { Icon, Button } from "@rneui/base";
import { API_URL } from "../../global";
import { useSession } from '@/components/SessionContext';

interface Post {
  postId: number;
  postText: string;
  postImage: string;
  postLikes: number;
  postUserId: number;
  postUserName: string;
  postUserImage: string;
  postCreateAt: string;
  comments: any[];
  showComments: boolean;
  commentText: string;
}

const { width, height } = Dimensions.get("window");

export default function community() {
  const [posts, setPosts] = useState<Post[]>([]); // Stores all posts
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({}); // Tracks comment text per post
  const [postText, setPostText] = useState(""); // Tracks post text
  const [uploadImage, setUploadImage] = useState<ImagePicker.ImagePickerAsset | null>(null); // Stores selected image for posting
  const [myPost, setMyPost] = useState(false);
  const [isLiked, setIsLiked] = useState<{ postId: number; userId: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { session } = useSession();
  const getPost = async () => {
    try {
      const res = await fetch(API_URL + "/api/post");
      const data = await res.json();
      if (res.ok) {
        // Format posts and comments into structured data
        const formattedPost = data.reduce((acc: any, item: any) => {
          let post = acc.find((post: any) => post.postId === item.post_id);
          if (!post) {
            post = {
              postId: item.post_id,
              postText: item.post_text,
              postImage: item.post_image,
              postLikes: item.post_likes,
              postUserId: item.post_userId,
              postUserName: item.post_user_name,
              postUserImage: item.post_user_image,
              postCreateAt: item.post_create_at,
              comments: [],
              showComments: false,
              commentText: "",
            };
            acc.push(post);
          }

          if (item.comment_id) {
            post.comments.push({
              commentId: item.comment_id,
              commentText: item.comment_text,
              commentImage: item.comment_image,
              commentUser: item.comment_userId,
              commentUserName: item.comment_user_name,
              commentUserImage: item.comment_user_image,
              commentCreateAt: item.comment_create_at,
            });
          }

          return acc;
        }, []);

        // Sort the posts by creation date in descending order (latest first)
        formattedPost.sort(
          (a: any, b: any) => new Date(b.postCreateAt).getTime() - new Date(a.postCreateAt).getTime()
        );

        setPosts(formattedPost); // Update state with formatted posts
      }
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost();
  }, []);

  const toggleComments = (postId: number) => {
    const post = posts.find((post: Post) => post.postId === postId);
    if (post?.comments.length === 0) return;
    setPosts(
      posts.map((post) =>
        post.postId === postId
          ? { ...post, showComments: !post.showComments }
          : post
      )
    );
  };

  const formatDay = (createAt: any) => {
    const date = new Date(createAt);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (createAt: string) => {
    const date = new Date(createAt);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleWriteComment = (postId: number, text: string) => {
    setCommentText((prev) => ({ ...prev, [postId]: text }));
  };

  const handleComment = async (postId: number) => {
    const text = commentText[postId];
    if (!text) {
      Alert.alert("กรุณาเขียนความคิดเห็น");
      return;
    }

    try {
      const res = await fetch(API_URL + "/api/post/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: session.user.id, text }),
      });

      const data = await res.json();
      if (res.ok) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        getPost();
      } else {
        Alert.alert(data.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });
    if (!result.canceled) {
      try {
        setUploadImage(result.assets[0]);
        console.log(result.assets[0]);
      } catch (error) {
        console.log("error");
      }
    }
  };

  const handlePost = async () => {
    if (!postText) {
      Alert.alert("กรุณาใส่ข้อความ");
      return;
    }

    try {
      const res = await fetch(API_URL + "/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          text: postText,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const id = data.id;

        if (uploadImage) {
          const formData = new FormData();
          formData.append("image", {
            uri: uploadImage.uri,
            type: uploadImage.mimeType || "image/jpeg",
            name: uploadImage.fileName || "filename",
            size: uploadImage.fileSize || 0,
          });

          for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }

          try {
            const imageRes = await fetch(API_URL + `/api/post/image/${id}`, {
              method: "PUT",
              body: formData,
          
            });

            if (!imageRes.ok) {
              const imageData = await imageRes.json();
              Alert.alert(imageData.error);
              // If the image upload fails, delete the post
              await fetch(API_URL + `/api/post/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
              });
              return;
            }
          } catch (error) {
            console.log(error);
          }
        }

        Alert.alert("โพสต์สําเร็จ");
        setPostText("");
        setUploadImage(null);
        getPost(); // Refresh posts
        setModalVisible(false);
      } else {
        Alert.alert("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("เกิดข้อผิดพลาด");
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const resCheck = await fetch(API_URL + "/api/post/like/check-like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: session.user.id,
        }),
      });

      if (resCheck.status === 201) {
        setPosts((prev) =>
          prev.map((post) =>
            post.postId === postId
              ? { ...post, postLikes: post.postLikes - 1 }
              : post
          )
        );
        setIsLiked((prev) => (prev ? prev.filter((like) => like.postId !== postId) : []));
        const res = await fetch(API_URL + "/api/post/like/un-like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            userId:session.user.id,
          }),
        });
      } else if (resCheck.status === 200) {
        setPosts((prev) =>
          prev.map((post) =>
            post.postId === postId
              ? { ...post, postLikes: post.postLikes + 1 }
              : post
          )
        );
        setIsLiked((prev) => [
          ...prev,
          { postId, userId: session.user.id },
        ]);
        const res = await fetch(API_URL + "/api/post/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            userId: session.user.id,
          }),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getPost();
      getLikePost();
    }
  };
  const getLikePost = async () => {
    try {
      const res = await fetch(
          API_URL + `/api/post/like/${session.user.id}`
      );
      const dataJson = await res.json();
      if (res.ok) {
        setIsLiked(dataJson.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLikePost();
  }, []);

  const clearState = () => {
    setPostText("");
    setUploadImage(null);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.topicCard}>
      <View style={styles.topicUserContainer}>
        <Image
          source={{ uri: API_URL + item.postUserImage }}
          style={styles.topicUserImage}
        />
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text style={styles.topicUser}>{item.postUserName}</Text>
          <Text style={{ fontSize: 12 }}>{formatTime(item.postCreateAt)}</Text>
        </View>
      </View>

      {item.postImage && (
        <Image
          source={{ uri: API_URL + item.postImage }}
          style={styles.topicImage}
        />
      )}
      <Text style={styles.topicText}>{item.postText}</Text>

      <View style={styles.topicFooter}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleLike(item?.postId)}
        >
          <Ionicons
            name={
              isLiked?.find((like) => like.postId === item?.postId)
                ? "heart"
                : "heart-outline"
            }
            size={24}
            color={
              isLiked?.find((like) => like.postId === item?.postId)
                ? "red"
                : "black"
            }
          />
          <Text>{item.postLikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleComments(item.postId)}
        >
          <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
          <Text style={styles.commentButtonText}>
            {" "}
            {item.comments.length} ความคิดเห็น
          </Text>
        </TouchableOpacity>
      </View>
     
      {item.showComments && (
        <View>
          {item.comments.map((comment) => (
            <View key={comment.commentId} style={styles.commentContainer}>
            <View style={styles.topicUserContainer}>
              <Image
                source={{ uri: API_URL + comment.commentUserImage }}
                style={styles.topicUserImage}
              />
              <View style={{ display: "flex", flexDirection: "column" }}>
                <Text style={styles.topicUser}>{comment.commentUserName}</Text>
                <Text style={{ fontSize: 12 }}>
                  {formatTime(comment.commentCreateAt)}
                </Text>
              </View>
            </View>
            <Text style={{ marginLeft: 20}}>
              {comment.commentText}
            </Text>
          </View>
          ))}
         
        </View>
      )}
       <View style={{ display: "flex", flexDirection: "row" , justifyContent: "center", alignItems: "center" }}>
      <TextInput
            style={styles.commentInput}
            placeholder="เพิ่มความคิดเห็น..."
            value={commentText[item.postId] || ""}
            onChangeText={(text) => handleWriteComment(item.postId, text)}
          />
          <TouchableOpacity
            onPress={() => handleComment(item.postId)}
            style={styles.commentButton}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              ส่ง
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>ชุมชน</Text>
      <View style={styles.buttonContainer}></View>
      <FlatList
      refreshControl={<RefreshControl refreshing={loading} onRefresh={getPost} />} 
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={styles.topicsContainer}
      />
      {/* <TouchableOpacity style={styles.addButton} onPress={pickImage}>
  <Text style={styles.addButtonText}>เพิ่มรูปภาพ</Text>
</TouchableOpacity>
      <TextInput
        style={styles.postInput}
        placeholder="เขียนโพสต์..."
        value={postText}
        onChangeText={setPostText}
      />
      <TouchableOpacity onPress={handlePost} style={styles.postButton}>
        <Text style={styles.postButtonText}>โพสต์</Text>
      </TouchableOpacity> */}
      <Button
        title={"เขียนโพสต์"}
        color={"#0077b6"}
        containerStyle={{ borderRadius: 10 }}
        onPress={() => setModalVisible(true)}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Image
                source={{ uri: API_URL + session.user.picture }}
                style={styles.topicUserImage}
              />
              <View style={{ display: "flex", flexDirection: "column" }}>
                <Text style={styles.topicUser}>{session.user.name}</Text>
                <Text style={{ fontSize: 12 }}>{formatTime(new Date().toISOString())}</Text>
              </View>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="เขียนโพสต์..."
              value={postText}
              onChangeText={setPostText}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                marginVertical: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  display: "flex",
                  backgroundColor: "#0077b6",
                  borderRadius: 10,
                  width: 100,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={pickImage}
              >
                <Text style={styles.addButtonText}>เพิ่มรูปภาพ</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Button
                title="ยกเลิก"
                onPress={() => {
                  setModalVisible(false);
                  clearState();
                }}
                containerStyle={{ marginRight: 10, borderRadius: 10 }}
                color={"#EA6B6E"}
              />
              <Button
                title={"ยืนยัน"}
                onPress={() => handlePost()}
                containerStyle={{ marginLeft: 10, borderRadius: 10 }}
                color={"#023e8a"}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dceaf7",
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  topicsContainer: {
    flexGrow: 1,
  },
  topicCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  topicUser: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  topicImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
    marginTop: 10,
  },
  topicFooter: {
    flexDirection: "row",
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  topicText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  commentContainer: {
    marginTop: 10,
   
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    height:40,
    width: "80%",
  },
  commentButton: {
    backgroundColor: "#2196f3",
    borderRadius: 8,
    padding: 10,
    width: "20%",
    height:40,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  commentButtonText: {
    color: "#333",
    fontSize: 14,
  },
  postInput: {
    borderWidth: 1,
    width: "100%",
    height: 100,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  postButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  topicUserImage: {
    width: 40,
    height: 40,
    borderRadius: 15,
  },
  topicUserContainer: {
    flexDirection: "row",
  },
  button: {
    borderRadius: 8,
    padding: 10,
    width: "50%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalView: {
    width: width * 1, // 85% of screen width
    maxHeight: height * 0.9, // Limit modal height to 75% of screen height
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  loadingContainer: {
    backgroundColor:"#dceaf7",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});