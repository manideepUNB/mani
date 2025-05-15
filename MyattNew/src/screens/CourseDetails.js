import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Animated, StatusBar, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CourseDetails = ({ route }) => {
  const { courseId, gradeId, subjectId, unitId, unitTitle } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-200)).current;
  const [currentUnitTitle, setCurrentUnitTitle] = useState(unitTitle || '');
  const navigation = useNavigation();

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  useEffect(() => {
    if (courseData?.data?.lessons) {
      const currentLesson = courseData.data.lessons.find(
        lesson => Number(lesson.lesson_id) === Number(unitId)
      );
      if (currentLesson) {
        setCurrentUnitTitle(currentLesson.unit_name || currentLesson.name || '');
      }
    }
  }, [courseData, unitId]);

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -200 : 0;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
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
        console.log('Course Data:', JSON.stringify(data, null, 2));
      } else {
        Alert.alert('Error', data.message || 'Could not load course details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch course data');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
                  <View key={index} style={styles.descriptionCard}>
                    <Text style={styles.descriptionText}>
                      {lesson.description || 'No description available for this unit.'}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
            {!courseData.data?.lessons?.some(lesson => Number(lesson.lesson_id) === Number(unitId)) && (
              <Text style={styles.placeholderText}>No unit found with the specified ID.</Text>
            )}
          </View>
        );
      case 'assignments':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Assignments</Text>
            <Text style={styles.placeholderText}>No assignments available yet</Text>
          </View>
        );
      case 'vocabulary':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Vocabulary</Text>
            <Text style={styles.placeholderText}>No vocabulary available yet</Text>
          </View>
        );
      case 'story':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Story</Text>
            <Text style={styles.placeholderText}>No stories available yet</Text>
          </View>
        );
      case 'quiz':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Quiz</Text>
            <Text style={styles.placeholderText}>No quizzes available yet</Text>
          </View>
        );
      case 'notice':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Notices</Text>
            <Text style={styles.placeholderText}>No notices available yet</Text>
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
        <View style={styles.sideMenu}>
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
              <Ionicons name="book-outline" size={20} color={activeTab === 'overview' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'overview' && styles.activeMenuItemText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'assignments' && styles.activeMenuItem]}
              onPress={() => setActiveTab('assignments')}
            >
              <Ionicons name="document-text-outline" size={20} color={activeTab === 'assignments' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'assignments' && styles.activeMenuItemText]}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'vocabulary' && styles.activeMenuItem]}
              onPress={() => setActiveTab('vocabulary')}
            >
              <Ionicons name="bookmark-outline" size={20} color={activeTab === 'vocabulary' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'vocabulary' && styles.activeMenuItemText]}>Vocabulary</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'story' && styles.activeMenuItem]}
              onPress={() => setActiveTab('story')}
            >
              <Ionicons name="library-outline" size={20} color={activeTab === 'story' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'story' && styles.activeMenuItemText]}>Story</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'quiz' && styles.activeMenuItem]}
              onPress={() => setActiveTab('quiz')}
            >
              <Ionicons name="help-circle-outline" size={20} color={activeTab === 'quiz' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'quiz' && styles.activeMenuItemText]}>Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, activeTab === 'notice' && styles.activeMenuItem]}
              onPress={() => setActiveTab('notice')}
            >
              <Ionicons name="notifications-outline" size={20} color={activeTab === 'notice' ? '#55198A' : '#333'} />
              <Text style={[styles.menuItemText, activeTab === 'notice' && styles.activeMenuItemText]}>Notice</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.topBar}>
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
      </View>
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
    flexDirection: 'row',
    marginTop: StatusBar.currentHeight || 0,
  },
  sideMenu: {
    width: 60,
    backgroundColor: '#FFE168',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
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
  contentArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingLeft: 10,
    zIndex: 1,
  },
  header: {
    flex: 1,
    backgroundColor: '#FFE168',
    padding: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
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
    marginLeft: 10,
  },
  contentContainer: {
    padding: 10,
    marginRight: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitCard: {
    backgroundColor: '#FFE168',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  videoItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  lecturesContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  lectureItem: {
    marginBottom: 8,
  },
  lectureTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  lectureDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 24,
  },
  lectureDuration: {
    fontSize: 12,
    color: '#666',
  },
  lectureProgress: {
    fontSize: 12,
    color: '#666',
  },
  selectedUnitCard: {
    borderWidth: 2,
    borderColor: '#55198A',
    backgroundColor: '#FFF8E1',
  },
  selectedUnitTitle: {
    color: '#55198A',
    fontSize: 20,
  },
});

export default CourseDetails;
