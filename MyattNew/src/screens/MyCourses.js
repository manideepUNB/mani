import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MyCourses = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view courses');
        setLoading(false);
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
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load courses');
      }

      if (data.data && Array.isArray(data.data)) {
        // Filter out courses without proper titles
        const validCourses = data.data.filter(course => 
          course.full_course_name && 
          course.grade_name && 
          course.subject_name
        );
        setCourses(validCourses);
      } else {
        setCourses([]);
        console.log('No courses found in response');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', error.message || 'Failed to fetch courses');
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

  const renderCourse = ({ item, index }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.courseImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.full_course_name}</Text>
          <Text style={styles.courseSubtitle}>
            {item.grade_name} - {item.subject_name}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${item.average_progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {item.average_progress.toFixed(1)}% Complete
        </Text>
      </View>

      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.number_of_lecture}</Text>
          <Text style={styles.statLabel}>Units</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(item.total_seconds / 60)}m
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.startButton,
            item.average_progress === 100 && styles.completedButton
          ]}
          onPress={() => handleCoursePress(index, item.grade_id, item.subject_id, item.full_course_name)}
        >
          <Text style={styles.startButtonText}>
            Explore
          </Text>
        </TouchableOpacity>

        {item.average_progress === 100 && item.certificate_path && (
          <TouchableOpacity 
            style={styles.certificateButton}
            onPress={() => {
              // Handle certificate download
              console.log('Download certificate for:', item.full_course_name);
            }}
          >
            <Text style={styles.certificateButtonText}>Download Certificate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A9C667" />
        <Text style={styles.loadingText}>Loading courses...</Text>
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
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => `${item.grade_id}-${item.subject_id}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5400',
    paddingTop: 20,
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
    textAlign: 'left',
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  courseCard: {
    backgroundColor: '#FFE168',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A9C667',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#55198A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#55198A',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#55198A',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  certificateButton: {
    backgroundColor: '#55198A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A9C667',
    minWidth: 160,
  },
  certificateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyCourses;
