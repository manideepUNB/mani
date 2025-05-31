import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Animated, StatusBar, SafeAreaView, Modal, Dimensions, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import RNFetchBlob from 'react-native-blob-util';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const Toast = ({ visible, message, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const CourseDetails = ({ route }) => {
  const { courseId, gradeId, subjectId, unitId, unitTitle } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const menuWidth = 60;
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const contentMarginAnimation = useRef(new Animated.Value(menuWidth)).current;
  const [currentUnitTitle, setCurrentUnitTitle] = useState(unitTitle || '');
  const navigation = useNavigation();
  
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [vocabularies, setVocabularies] = useState([]);
  const [vocabulariesLoading, setVocabulariesLoading] = useState(false);
  const [vocabularyError, setVocabularyError] = useState(null);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [hasVocabulary, setHasVocabulary] = useState(false);
  const [hasStories, setHasStories] = useState(false);
  const message = "";
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videos, setVideos] = useState([]);
  const [expandedVideoId, setExpandedVideoId] = useState(null);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState(false);
  const [sketchImage, setSketchImage] = useState(null);

  const contentPaddingAnimation = menuAnimation.interpolate({
    inputRange: [-menuWidth, 0],
    outputRange: [10, menuWidth + 20]
  });

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  useEffect(() => {
    if (courseData?.data?.lessons) {
      const currentLesson = courseData.data.lessons.find(
        lesson => Number(lesson.lesson_id) === Number(unitId)
      );
      if (currentLesson) {
        setCurrentUnitTitle(currentLesson.name || '');
      }
    }
  }, [courseData, unitId]);

  const toggleMenu = () => {
    Animated.parallel([
      Animated.timing(menuAnimation, {
        toValue: isMenuOpen ? -menuWidth : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentMarginAnimation, {
        toValue: isMenuOpen ? 0 : menuWidth,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchCourseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view course data');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/courses/${courseId}?grade_id=${gradeId}&subject_id=${subjectId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data) {
        setCourseData(data);
        setHasVocabulary(data.data?.has_vocabulary === 1);
        setHasStories(data.data?.has_story === 1);
        if (data.data?.lessons) {
          const currentLesson = data.data.lessons.find(
            lesson => Number(lesson.lesson_id) === Number(unitId)
          );
          if (currentLesson) {
            setCurrentUnitTitle(currentLesson.name || '');
          }
        }
      } else {
        console.error('Error in course details:', data);
        Alert.alert('Error', data.message || 'Could not load course details');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      Alert.alert('Error', 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view assignments');
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/assignment?lesson_id=${unitId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success === "Success") {
        setAssignments(data.data);
      } else {
        console.error('Error fetching assignments:', data);
        Alert.alert('Error', data.message || 'Could not load assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to fetch assignments');
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchVocabularies = async () => {
    try {
      setVocabulariesLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view vocabularies');
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/vocabulary?lesson_id=${unitId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      console.log('Vocabulary API Response:', data);

      if (response.ok && data.success === "Success" && data.data) {
        setVocabularies(data.data);
        setHasVocabulary(data.data.length > 0);
      } else {
        console.error('Error fetching vocabularies:', data);
        setHasVocabulary(false);
        Alert.alert('Error', data.message || 'Could not load vocabularies');
      }
    } catch (error) {
      console.error('Error:', error);
      setHasVocabulary(false);
      Alert.alert('Error', 'Failed to fetch vocabularies');
    } finally {
      setVocabulariesLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      setStoriesLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view stories');
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/story?lesson_id=${unitId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success === "Success") {
        setStories(data.data);
        setHasStories(data.data.length > 0);
      } else {
        console.error('Error fetching stories:', data);
        setHasStories(false);
        Alert.alert('Error', data.message || 'Could not load stories');
      }
    } catch (error) {
      console.error('Error:', error);
      setHasStories(false);
      Alert.alert('Error', 'Failed to fetch stories');
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setQuizzesLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view quizzes');
        return;
      }

      const response = await fetch(
        `https://myattacademyapi.sapphiresolutions.in.net/api/course/quiz?lesson_id=${unitId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      console.log('Quizzes API Response:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success === "Success") {
        setQuizzes(data.data || []);
        setQuizError(null);
      } else {
        console.error('Error fetching quizzes:', data);
        setQuizError(data.message || 'Could not load quizzes');
        Alert.alert('Error', data.message || 'Could not load quizzes');
      }
    } catch (error) {
      console.error('Error:', error);
      setQuizError('Failed to fetch quizzes');
      Alert.alert('Error', 'Failed to fetch quizzes');
    } finally {
      setQuizzesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'vocabulary') {
      fetchVocabularies();
    }
  }, [activeTab, unitId]);

  useEffect(() => {
    if (activeTab === 'story') {
      fetchStories();
    }
  }, [activeTab, unitId]);

  useEffect(() => {
    if (activeTab === 'quiz') {
      fetchQuizzes();
    }
  }, [activeTab, unitId]);

  useEffect(() => {
    if (courseData?.data?.lessons) {
      const currentLesson = courseData.data.lessons.find(
        lesson => Number(lesson.lesson_id) === Number(unitId)
      );
      
      if (currentLesson) {
        const fetchAllVideos = async () => {
          try {
            setVideoLoading(true);
            const videoPromises = [];
            const videoData = [];

            // Add main video if exists
            if (currentLesson.video_link) {
              const mainVideoData = await fetchVideoData(currentLesson.video_link);
              if (mainVideoData) {
                videoData.push({
                  id: 'main',
                  title: mainVideoData.title || 'Main Video',
                  videoUrl: mainVideoData.videoUrl,
                  thumbnail: mainVideoData.thumbnail
                });
              }
            }

            // Add lecture videos if they exist
            if (currentLesson.lectures && currentLesson.lectures.length > 0) {
              for (const lecture of currentLesson.lectures) {
                if (lecture.video_link) {
                  const lectureVideoData = await fetchVideoData(lecture.video_link);
                  if (lectureVideoData) {
                    videoData.push({
                      id: `lecture_${lecture.lecture_id}`,
                      title: lectureVideoData.title || lecture.title || 'Lecture Video',
                      videoUrl: lectureVideoData.videoUrl,
                      thumbnail: lectureVideoData.thumbnail
                    });
                  }
                }
              }
            }

            setVideos(videoData);
          } catch (error) {
            console.error('Error fetching videos:', error);
            Alert.alert('Error', 'Failed to fetch videos');
          } finally {
            setVideoLoading(false);
          }
        };

        fetchAllVideos();
      }
    }
  }, [courseData, unitId]);

  const handleImagePress = (thumbnails) => {
    if (thumbnails && thumbnails.length > 0) {
      setSelectedImage(thumbnails[0].thumbnail);
      setIsImageModalVisible(true);
    }
  };

  const fetchVideoData = async (videoLink) => {
    if (!videoLink) {
      console.log('No video link provided');
      return null;
    }
    
    try {
      setVideoLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No token found');
        Alert.alert('Error', 'Please login to view video content');
        return null;
      }

      const apiUrl = `https://myattacademyapi.sapphiresolutions.in.net/api/course/lesson/video_player/${videoLink}`;
      console.log('Video API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Raw video API response:', JSON.stringify(data, null, 2));

      if (data.status === 200 && data.data) {
        // Get the highest quality progressive video link
        const progressiveVideos = data.data.play?.progressive || [];
        if (progressiveVideos.length > 0) {
          // Sort by height to get the highest quality
          const sortedVideos = progressiveVideos.sort((a, b) => b.height - a.height);
          const highestQualityVideo = sortedVideos[0];
          
          return {
            title: data.data.name,
            videoUrl: highestQualityVideo.link,
            thumbnail: data.data.pictures?.base_link
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching video data:', error);
      Alert.alert('Error', 'Failed to fetch video data');
      return null;
    } finally {
      setVideoLoading(false);
    }
  };

  const renderVideo = () => {
    if (videoLoading) {
      return (
        <View style={styles.videoLoadingContainer}>
          <ActivityIndicator size="large" color="#A9C667" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      );
    }

    if (videos.length === 0) {
      return (
        <View style={styles.noVideoContainer}>
          <Text style={styles.noVideoText}>No videos available for this lesson</Text>
        </View>
      );
    }

    return (
      <View style={styles.videoCardsContainer}>
        {videos.map((video, index) => (
          <View key={video.id} style={styles.videoCard}>
            <View style={styles.videoCardHeader}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
            </View>
            <View style={styles.videoPlayerContainer}>
              <WebView
                source={{ 
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                        <style>
                          body { margin: 0; padding: 0; background-color: black; }
                          .video-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
                          video { width: 100%; height: 100%; object-fit: contain; }
                        </style>
                      </head>
                      <body>
                        <div class="video-container">
                          <video
                            controls
                            playsinline
                            webkit-playsinline
                            src="${video.videoUrl}"
                            type="video/mp4"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </body>
                    </html>
                  `
                }}
                style={styles.videoPlayer}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const downloadImage = async (imageUrl, title) => {
    try {
      // Show download started message
      showToast('Download started...');

      // Request storage permission for Android
      if (Platform.OS === 'android') {
        try {
          // For Android 13+ (API level 33+), we need to request specific media permissions
          if (Platform.Version >= 33) {
            const mediaPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              {
                title: 'Storage Permission',
                message: 'App needs access to storage to download the image.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
            if (mediaPermission !== PermissionsAndroid.RESULTS.GRANTED) {
              showToast('Storage permission denied');
              return;
            }
          } else {
            // For Android 12 and below, we need both READ and WRITE permissions
            const permissions = [
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ];

            const results = await Promise.all(
              permissions.map(permission =>
                PermissionsAndroid.request(permission, {
                  title: 'Storage Permission',
                  message: 'App needs access to storage to download the image.',
                  buttonNeutral: 'Ask Me Later',
                  buttonNegative: 'Cancel',
                  buttonPositive: 'OK',
                })
              )
            );

            const allGranted = results.every(
              result => result === PermissionsAndroid.RESULTS.GRANTED
            );

            if (!allGranted) {
              showToast('Storage permission denied');
              return;
            }
          }
        } catch (err) {
          console.error('Permission request error:', err);
          showToast('Failed to request storage permission');
          return;
        }
      }

      // Create a safe filename from the title
      const timestamp = new Date().getTime();
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_${timestamp}.jpg`;

      // Set up download options
      const { config, fs } = RNFetchBlob;
      const downloadDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const path = `${downloadDir}/${filename}`;

      // Configure download options
      const options = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: 'Downloading image',
          mime: 'image/jpeg',
          mediaScannable: true,
          title: filename
        },
        IOSDownloadTask: true
      };

      // Start download with progress tracking
      const response = await RNFetchBlob.config(options)
        .fetch('GET', imageUrl)
        .progress((received, total) => {
          const progress = Math.floor((received / total) * 100);
          if (progress % 25 === 0) { // Update every 25%
            showToast(`Downloading: ${progress}%`);
          }
        });

      // Handle platform-specific success
      if (Platform.OS === 'ios') {
        await RNFetchBlob.ios.previewDocument(response.path());
        showToast('Image saved to documents');
      } else {
        // For Android, verify the file exists
        const exists = await fs.exists(response.path());
        if (exists) {
          showToast('Image saved to downloads');
        } else {
          throw new Error('File not found after download');
        }
      }

    } catch (error) {
      console.error('Download error:', error);
      let errorMessage = 'Download failed. ';
      
      if (error.message.includes('permission')) {
        errorMessage += 'Storage permission denied. Please grant storage permission in Settings.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Network error. Please check your connection.';
      } else if (error.message.includes('not found')) {
        errorMessage += 'Image not found.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      showToast(errorMessage);
    }
  };

  const handleViewQuiz = (quiz) => {
    console.log('Viewing quiz:', quiz);
    navigation.navigate('QuizScreen', {
      quizId: quiz.exam_id,
      quizTitle: quiz.exam_name,
      lessonId: unitId
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#A9C667" />
        </View>
      );
    }

    if (!courseData) {
      return (
        <View style={styles.centered}>
          <Text>No course data available.</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.contentContainer}>
            {courseData.data?.lessons?.map((lesson, index) => {
              const lessonId = Number(lesson.lesson_id);
              const routeLessonId = Number(unitId);
              
              if (lessonId === routeLessonId) {
                return (
                  <View key={index}>
                    <View style={styles.descriptionCard}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.descriptionText}>
                        {lesson.description || 'No description available for this unit.'}
                      </Text>
                    </View>
                    {renderVideo()}
                  </View>
                );
              }
              return null;
            })}
            {!courseData.data?.lessons?.some(lesson => Number(lesson.lesson_id) === Number(unitId)) && (
              <View style={styles.noContentContainer}>
                <Ionicons name="book-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>No overview available for this unit.</Text>
              </View>
            )}
          </View>
        );
      case 'assignments':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Assignments</Text>
            {assignmentsLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A9C667" />
              </View>
            ) : assignments.length > 0 ? (
              <>
                <ScrollView>
                  {assignments.map((assignment, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.assignmentCard}
                      onPress={() => handleImagePress(assignment.thumbnails)}
                    >
                      <View style={styles.assignmentTitleContainer}>
                        <Text style={styles.assignmentTitle} numberOfLines={2}>
                          {assignment.assignment_title || assignment.assignment_name}
                        </Text>
                      </View>
                      {assignment.thumbnails && assignment.thumbnails.length > 0 && (
                        <Image
                          source={{ uri: assignment.thumbnails[0].thumbnail }}
                          style={styles.assignmentThumbnail}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Full Screen Image Modal */}
                <Modal
                  visible={isImageModalVisible}
                  transparent={false}
                  animationType="fade"
                  statusBarTranslucent={true}
                  onRequestClose={() => setIsImageModalVisible(false)}
                >
                  <View style={styles.modalContainer}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setIsImageModalVisible(false)}
                    >
                      <View style={styles.closeButtonCircle}>
                        <Ionicons name="close-outline" size={24} color="#000" />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => {
                        const currentAssignment = assignments.find(
                          assignment => assignment.thumbnails?.[0]?.thumbnail === selectedImage
                        );
                        showToast('Download started...');
                        downloadImage(
                          selectedImage,
                          currentAssignment?.assignment_title || currentAssignment?.assignment_name || 'assignment'
                        );
                      }}
                    >
                      <View style={styles.downloadButtonCircle}>
                        <Ionicons name="download-outline" size={24} color="#000" />
                      </View>
                    </TouchableOpacity>

                    {selectedImage && (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </Modal>
              </>
            ) : (
              <View style={styles.noContentContainer}>
                <Ionicons name="document-text-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>No assignments available</Text>
              </View>
            )}
          </View>
        );
      case 'vocabulary':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Vocabulary</Text>
            {vocabulariesLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A9C667" />
              </View>
            ) : vocabularies && vocabularies.length > 0 ? (
              <ScrollView>
                {vocabularies.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.assignmentCard}
                    onPress={() => {
                      if (item.thumbnails && item.thumbnails[0]) {
                        setSelectedImage(item.thumbnails[0].thumbnail);
                        setIsImageModalVisible(true);
                      }
                    }}
                  >
                    <View style={styles.assignmentTitleContainer}>
                      <Text style={styles.assignmentTitle} numberOfLines={2}>
                        {item.vucabularies_title}
                      </Text>
                    </View>
                    {item.thumbnails && item.thumbnails[0] && (
                      <Image
                        source={{ uri: item.thumbnails[0].thumbnail }}
                        style={styles.assignmentThumbnail}
                        resizeMode="cover"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noContentContainer}>
                <Ionicons name="book-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>No vocabulary items available</Text>
              </View>
            )}

            {/* Full Screen Image Modal for Vocabulary */}
            <Modal
              visible={isImageModalVisible}
              transparent={false}
              animationType="fade"
              statusBarTranslucent={true}
              onRequestClose={() => setIsImageModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsImageModalVisible(false)}
                >
                  <View style={styles.closeButtonCircle}>
                    <Ionicons name="close-outline" size={24} color="#000" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    const currentVocabulary = vocabularies.find(
                      vocabulary => vocabulary.thumbnails?.[0]?.thumbnail === selectedImage
                    );
                    showToast('Download started...');
                    downloadImage(
                      selectedImage,
                      currentVocabulary?.vucabularies_title || 'vocabulary'
                    );
                  }}
                >
                  <View style={styles.downloadButtonCircle}>
                    <Ionicons name="download-outline" size={24} color="#000" />
                  </View>
                </TouchableOpacity>

                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </Modal>
          </View>
        );
      case 'story':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Story</Text>
            {storiesLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A9C667" />
              </View>
            ) : stories && stories.length > 0 ? (
              <ScrollView>
                {stories.map((story, storyIndex) => (
                  <TouchableOpacity
                    key={`story-${storyIndex}`}
                    style={styles.storyCard}
                    onPress={() => {
                      setSelectedStory(story);
                      setIsStoryModalVisible(true);
                    }}
                  >
                    <Text style={styles.storyTitle}>{story.story_title}</Text>
                    {story.thumbnails && story.thumbnails.length > 0 && (
                      <Image
                        source={{ uri: story.thumbnails[0].thumbnail }}
                        style={styles.storyThumbnail}
                        resizeMode="cover"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noContentContainer}>
                <Ionicons name="book-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>No stories available</Text>
              </View>
            )}

            {/* Story Details Modal */}
            <Modal
              visible={isStoryModalVisible}
              transparent={false}
              animationType="slide"
              statusBarTranslucent={true}
              onRequestClose={() => setIsStoryModalVisible(false)}
            >
              <SafeAreaView style={styles.storyModalContainer}>
                <View style={styles.storyModalHeader}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setIsStoryModalVisible(false)}
                  >
                    <View style={styles.closeButtonCircle}>
                      <Ionicons name="close-outline" size={24} color="#000" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.storyModalTitle} numberOfLines={1}>
                    {selectedStory?.story_title}
                  </Text>
                </View>

                <ScrollView style={styles.storyModalContent}>
                  {selectedStory?.thumbnails?.map((item, index) => (
                    <TouchableOpacity
                      key={`modal-thumbnail-${index}`}
                      onPress={() => {
                        setSelectedImage(item.thumbnail);
                        setSelectedImageIndex(index);
                        setIsImageModalVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.storyModalImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </SafeAreaView>
            </Modal>

            {/* Full Screen Image Modal */}
            <Modal
              visible={isImageModalVisible}
              transparent={false}
              animationType="fade"
              statusBarTranslucent={true}
              onRequestClose={() => setIsImageModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setIsImageModalVisible(false);
                    setSelectedImageIndex(0);
                  }}
                >
                  <View style={styles.closeButtonCircle}>
                    <Ionicons name="close-outline" size={24} color="#000" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    if (selectedStory?.thumbnails?.[selectedImageIndex]?.thumbnail) {
                      showToast('Download started...');
                      downloadImage(
                        selectedStory.thumbnails[selectedImageIndex].thumbnail,
                        `${selectedStory.story_title}_${selectedImageIndex + 1}`
                      );
                    }
                  }}
                >
                  <View style={styles.downloadButtonCircle}>
                    <Ionicons name="download-outline" size={24} color="#000" />
                  </View>
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const slideWidth = Dimensions.get('window').width;
                    const currentIndex = Math.floor(event.nativeEvent.contentOffset.x / slideWidth);
                    setSelectedImageIndex(currentIndex);
                  }}
                  contentOffset={{ x: selectedImageIndex * Dimensions.get('window').width, y: 0 }}
                >
                  {selectedStory?.thumbnails?.map((item, index) => (
                    <View key={`fullscreen-${index}`} style={styles.fullScreenImageContainer}>
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.paginationContainer}>
                  {selectedStory?.thumbnails?.map((_, index) => (
                    <View
                      key={`dot-${index}`}
                      style={[
                        styles.paginationDot,
                        index === selectedImageIndex && styles.paginationDotActive
                      ]}
                    />
                  ))}
                </View>
              </View>
            </Modal>
          </View>
        );
      case 'quiz':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Quiz</Text>
            {quizzesLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#A9C667" />
              </View>
            ) : quizError ? (
              <View style={styles.noContentContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
                <Text style={styles.errorText}>{quizError}</Text>
              </View>
            ) : quizzes.length > 0 ? (
              <ScrollView>
                <View style={styles.quizTableContainer}>
                  {/* Table Header */}
                  <View style={styles.quizTableHeader}>
                    <Text style={[styles.quizTableHeaderText, { flex: 2 }]}>Quiz Title</Text>
                    <Text style={[styles.quizTableHeaderText, { flex: 1, marginLeft: -36 }]}>Attempts</Text>
                    <View style={{ flex: 1 }} />
                  </View>
                  
                  {/* Table Rows */}
                  {quizzes.map((quiz, index) => (
                    <View key={quiz.exam_id || index} style={styles.quizTableRow}>
                      <Text style={[styles.quizTableCell, { flex: 2 }]} numberOfLines={2}>
                        {quiz.exam_name || 'Untitled Quiz'}
                      </Text>
                      <Text style={[styles.quizTableCell, { flex: 1, marginLeft: -36 }]}>
                        {quiz.attempts || 0}
                      </Text>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <TouchableOpacity
                          style={styles.viewQuizButton}
                          onPress={() => handleViewQuiz(quiz)}
                        >
                          <Text style={styles.viewQuizButtonText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noContentContainer}>
                <Ionicons name="help-circle-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>No quizzes available</Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF5400" barStyle="light-content" />
      <View style={styles.mainContent}>
        <Animated.View style={[
          styles.sideMenu,
          {
            transform: [{ translateX: menuAnimation }],
            width: menuWidth,
          }
        ]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'overview' && styles.activeMenuItem]}
              onPress={() => setActiveTab('overview')}
            >
              <Ionicons 
                name="book-outline" 
                size={20} 
                color={activeTab === 'overview' ? '#55198A' : '#333'} 
              />
              <Text style={[styles.menuItemText, activeTab === 'overview' && styles.activeMenuItemText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'assignments' && styles.activeMenuItem]}
              onPress={() => setActiveTab('assignments')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'assignments' ? '#55198A' : '#333'} 
              />
              <Text style={[styles.menuItemText, activeTab === 'assignments' && styles.activeMenuItemText]}>
                Assignments
              </Text>
            </TouchableOpacity>
            {hasVocabulary && (
              <TouchableOpacity 
                style={[styles.menuItem, activeTab === 'vocabulary' && styles.activeMenuItem]}
                onPress={() => setActiveTab('vocabulary')}
              >
                <Ionicons 
                  name="text-outline" 
                  size={20} 
                  color={activeTab === 'vocabulary' ? '#55198A' : '#333'} 
                />
                <Text style={[styles.menuItemText, activeTab === 'vocabulary' && styles.activeMenuItemText]}>
                  Vocabulary
                </Text>
              </TouchableOpacity>
            )}
            {hasStories && (
              <TouchableOpacity 
                style={[styles.menuItem, activeTab === 'story' && styles.activeMenuItem]}
                onPress={() => setActiveTab('story')}
              >
                <Ionicons 
                  name="book-outline" 
                  size={20} 
                  color={activeTab === 'story' ? '#55198A' : '#333'} 
                />
                <Text style={[styles.menuItemText, activeTab === 'story' && styles.activeMenuItemText]}>
                  Story
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'quiz' && styles.activeMenuItem]}
              onPress={() => setActiveTab('quiz')}
            >
              <Ionicons 
                name="help-circle-outline" 
                size={20} 
                color={activeTab === 'quiz' ? '#55198A' : '#333'} 
              />
              <Text style={[styles.menuItemText, activeTab === 'quiz' && styles.activeMenuItemText]}>
                Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[
          styles.contentWrapper,
          {
            marginLeft: contentMarginAnimation
          }
        ]}>
          <View style={styles.contentArea}>
            <View style={styles.topBar}>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={toggleMenu}
              >
                <Ionicons 
                  name={isMenuOpen ? "menu" : "menu-outline"} 
                  size={24} 
                  color="#333" 
                />
              </TouchableOpacity>
              <View style={styles.header}>
                {courseData?.image && (
                  <Image 
                    source={{ uri: courseData.image }} 
                    style={styles.courseImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={1} ellipsizeMode="tail">
                    {currentUnitTitle || 'Loading...'}
                  </Text>
                  <Text style={styles.courseSubtitle} numberOfLines={1} ellipsizeMode="tail">
                    {courseData?.grade_name} {courseData?.subject_name}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.content}>
              {renderContent()}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
      <Toast 
        visible={toastVisible} 
        message={toastMessage} 
        onHide={hideToast} 
      />
      {/* Sketch Modal */}
      <Modal
        visible={isSketchModalVisible}
        transparent={false}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setIsSketchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsSketchModalVisible(false)}
          >
            <View style={styles.closeButtonCircle}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </View>
          </TouchableOpacity>
          {sketchImage && (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: sketchImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <ReactSketchCanvas
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  strokeWidth={4}
                  strokeColor="#FF5400"
                  width={Dimensions.get('window').width}
                  height={Dimensions.get('window').height}
                />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5400',
  },
  mainContent: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FF5400',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFE168',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    zIndex: 2,
    elevation: 5,
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemsContainer: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activeMenuItem: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 3,
    borderLeftColor: '#55198A',
  },
  menuItemText: {
    fontSize: 10,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  activeMenuItemText: {
    color: '#55198A',
    fontWeight: 'bold',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    zIndex: 1,
    backgroundColor: '#FF5400',
  },
  header: {
    flex: 1,
    backgroundColor: '#FFE168',
    padding: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
  },
  courseImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  courseInfo: {
    flex: 1,
    marginRight: 4,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0,
    lineHeight: 16,
  },
  courseSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
    lineHeight: 13,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  descriptionCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  assignmentCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  assignmentThumbnail: {
    width: '100%',
    height: 200,
  },
  assignmentTitleContainer: {
    padding: 12,
    backgroundColor: '#FFE168',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    marginTop: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#FFE168',
    borderRadius: 8,
    zIndex: 3,
  },
  videoCardsContainer: {
    paddingHorizontal: 10,
  },
  videoCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  videoCardHeader: {
    padding: 16,
    backgroundColor: '#FFE168',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  videoPlayerContainer: {
    height: 150,
    backgroundColor: '#000',
    width: '100%',
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
    marginTop: 16,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  noVideoContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
    marginTop: 16,
    borderRadius: 12,
  },
  noVideoText: {
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF5400',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  vocabularyCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 10,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vocabularyImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  vocabularyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  vocabularyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  vocabularyMeta: {
    flexDirection: 'column',
  },
  vocabularyMetaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  downloadButton: {
    position: 'absolute',
    top: 0,
    right: 70, // Position it next to the close button
    zIndex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  downloadButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 0,
  },
  storyThumbnail: {
    width: '100%',
    height: 200,
    marginTop: 16,
  },
  storyModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFE168',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storyModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginRight: 48,
  },
  storyModalContent: {
    flex: 1,
    padding: 16,
  },
  storyModalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 16,
  },
  fullScreenImageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  quizTableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quizTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFE168',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quizTableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quizTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  quizTableCell: {
    fontSize: 14,
    color: '#333',
  },
  viewQuizButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#55198A',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewQuizButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flexShrink: 1,
  },
  videoUrlContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  videoUrlText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  sketchButton: {
    position: 'absolute',
    top: 0,
    right: 120, // Place it left of the download button
    zIndex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
});

export default CourseDetails;
