import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MyCourses = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [organizedCourses, setOrganizedCourses] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Add programs data
  const programs = [
    { 
      id: 1, 
      title: 'Early Childhood (Ages 3-5)', 
      image: require('../assets/early-childhood.png')
    },
    { 
      id: 2, 
      title: 'Elementary School (Grades 1-6)',
      image: require('../assets/elementary-school.png')
    },
    { 
      id: 3, 
      title: 'Middle School (Grades 7-9)',
      image: require('../assets/middle-school.png')
    },
    { 
      id: 4, 
      title: 'Upper School (Grades 10-12)',
      image: require('../assets/upper-school.png')
    },
    { 
      id: 5, 
      title: 'Reading Tree (All ages)',
      image: require('../assets/the-reading-tree.png')
    },
  ];

  const getCardColor = (id) => {
    switch(id) {
      case 1:
        return 'rgb(249, 144, 73)';
      case 2:
        return '#7575cf';
      case 3:
        return '#6af892';
      case 4:
        return 'rgb(98, 125, 185)';
      case 5:
        return 'rgb(153, 0, 153)';
      default:
        return '#FFE168';
    }
  };

  const handleProgramPress = (id) => {
    if (id === 1) {
      navigation.navigate('EarlyChildhood');
    } else if (id === 2) {
      navigation.navigate('ElementarySchool');
    } else {
      Alert.alert(
        'Coming Soon!',
        'These courses will be available soon',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ]
      );
    }
  };

  useEffect(() => {
    fetchCourses();
    
    // Add focus listener to refresh courses when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true); // Set loading to true when screen comes into focus
      fetchCourses();
    });

    // Cleanup the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const organizeCoursesByGrade = (coursesArray) => {
    const organized = {};
    coursesArray.forEach(course => {
      if (!organized[course.grade_name]) {
        organized[course.grade_name] = [];
      }
      organized[course.grade_name].push(course);
    });
    return organized;
  };

  const fetchCourses = async () => {
    try {
      setError(null); // Clear any previous errors
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      
      if (!token) {
        setLoading(false);
        setCourses([]);
        setOrganizedCourses({});
        return;
      }

      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/courses', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load courses');
      }

      if (data.data && Array.isArray(data.data)) {
        const validCourses = data.data.filter(course => 
          course.full_course_name && 
          course.grade_name && 
          course.subject_name
        );
        setCourses(validCourses);
        setOrganizedCourses(organizeCoursesByGrade(validCourses));
      } else {
        setCourses([]);
        setOrganizedCourses({});
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.message || 'Failed to load courses');
      setCourses([]);
      setOrganizedCourses({});
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course_id, grade_id, subject_id, course_title) => {
    if (grade_id) {
      navigation.navigate('CourseContent', { 
        courseId: course_id, 
        gradeId: grade_id, 
        subjectId: subject_id,
        courseTitle: course_title
      });
    }
  };

  const renderCourseCard = (course) => {
    const progress = Math.min(Math.max(course.average_progress, 0), 100);
    const isCompleted = progress === 100;
    const size = 50;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <TouchableOpacity 
        key={`${course.grade_id}-${course.subject_id}`}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course.course_id, course.grade_id, course.subject_id, course.full_course_name)}
      >
        <View style={styles.courseHeader}>
          <View style={styles.topRow}>
            {course.image && (
              <Image 
                source={{ uri: course.image }} 
                style={styles.courseImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.subject_name}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.pieChartContainer}>
                <View style={[styles.pieChart, { width: size, height: size }]}>
                  <View style={[styles.pieChartBackground, { width: size, height: size, borderRadius: size / 2 }]} />
                  <View 
                    style={[
                      styles.pieChartProgress,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: '#A9C667',
                        transform: [{ rotate: '-90deg' }],
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: progress >= 50 ? '#A9C667' : 'transparent',
                        borderLeftColor: '#A9C667',
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.pieChartProgress,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: '#A9C667',
                        transform: [{ rotate: '90deg' }],
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: progress > 50 ? '#A9C667' : 'transparent',
                        borderLeftColor: progress > 50 ? '#A9C667' : 'transparent',
                      }
                    ]} 
                  />
                  <View style={styles.progressTextContainer}>
                    <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color="#666" />
              <Text style={styles.statText}>{course.number_of_lecture} Units</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{Math.round(course.total_seconds / 60)}m</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.exploreButton,
              isCompleted && styles.exploreButtonCompleted
            ]}
            onPress={() => handleCoursePress(course.course_id, course.grade_id, course.subject_id, course.full_course_name)}
          >
            <Text style={styles.buttonText}>Start Learning</Text>
          </TouchableOpacity>

          {course.average_progress === 100 && course.certificate_path && (
            <TouchableOpacity 
              style={styles.certificateButton}
              onPress={() => {
                Alert.alert(
                  'Download Started',
                  'Your certificate is being downloaded. You will be notified when it\'s ready.',
                  [{ text: 'OK' }]
                );
                console.log('Download certificate for:', course.full_course_name);
              }}
            >
              <Text style={styles.buttonText}>Certificate</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGradeSection = (gradeName, courses) => (
    <View key={gradeName} style={styles.gradeSection}>
      <Text style={styles.gradeName}>{gradeName}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.subjectsScroll}
        contentContainerStyle={styles.subjectsContainer}
      >
        {courses.map(course => renderCourseCard(course))}
      </ScrollView>
    </View>
  );

  const renderProgramsList = () => (
    <View style={styles.programsContainer}>
      <View style={styles.programsBackground}>
        <Text style={styles.programsTitle}>Available Programs</Text>
        <ScrollView 
          vertical
          showsVerticalScrollIndicator={true}
          style={styles.programsScrollView}
          contentContainerStyle={styles.programsScrollContent}
        >
          {programs.map((program) => (
            <TouchableOpacity 
              key={program.id} 
              style={[styles.programCard, { backgroundColor: getCardColor(program.id) }]}
              onPress={() => handleProgramPress(program.id)}
            >
              <View style={styles.programContent}>
                <Text style={styles.programTitle}>{program.title}</Text>
              </View>
              <View style={[styles.imageContainer, { backgroundColor: getCardColor(program.id) }]}>
                <Image 
                  source={program.image}
                  style={styles.programImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A9C667" />
        <Text style={styles.loadingText}>Loading your courses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchCourses();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Courses</Text>
      </View>
      
      <ScrollView style={styles.mainScroll}>
        {Object.entries(organizedCourses).map(([gradeName, gradeCourses]) => 
          renderGradeSection(gradeName, gradeCourses)
        )}
        {Object.keys(organizedCourses).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoggedIn ? 'No courses enrolled.' : 'Login to view your courses.'}
            </Text>
          </View>
        )}
        {renderProgramsList()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5400',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFE168',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mainScroll: {
    flex: 1,
  },
  gradeSection: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  gradeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subjectsScroll: {
    flexGrow: 0,
  },
  subjectsContainer: {
    paddingRight: 16,
  },
  courseCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 240,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseHeader: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  courseInfo: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  pieChartBackground: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  pieChartProgress: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exploreButton: {
    backgroundColor: '#55198A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  exploreButtonCompleted: {
    backgroundColor: '#A9C667',
  },
  certificateButton: {
    backgroundColor: '#55198A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 90,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  programsContainer: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  programsScrollView: {
    flex: 1,
  },
  programsScrollContent: {
    paddingBottom: 10,
  },
  programsBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  programCard: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  programContent: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF5400',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#A9C667',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
});

export default MyCourses;

