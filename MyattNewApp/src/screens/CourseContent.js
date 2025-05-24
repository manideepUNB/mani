import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CourseContent = ({ route, navigation }) => {
  const { courseId, gradeId, subjectId, courseTitle } = route.params;
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseUnits();
  }, []);

  const fetchCourseUnits = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view course content');
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
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (data && data.data && data.data.lessons) {
        setUnits(data.data.lessons);
      } else {
        console.error('Invalid data structure:', data);
        Alert.alert('Error', 'Invalid data received from server');
      }

    } catch (error) {
      console.error('Error fetching course units:', error);
      Alert.alert('Error', 'Failed to fetch course units. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUnitItem = ({ item, index }) => {
    const sortedLectures = item.lectures ? [...item.lectures].sort((a, b) => a.order_id - b.order_id) : [];

    return (
      <TouchableOpacity
        style={styles.unitCard}
        onPress={() => navigation.navigate('CourseDetails', {
          courseId,
          gradeId,
          subjectId,
          unitId: item.lesson_id,
        })}
      >
        <View style={styles.unitHeader}>
          <View style={styles.unitNumberContainer}>
            <Text style={styles.unitNumber}>{item.unit || `Unit ${index + 1}`}</Text>
            <Text style={styles.unitTitle}>{item.unit_name || item.name || 'Untitled Unit'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </View>

        <View style={styles.partsContainer}>
          {sortedLectures.map((lecture, lectureIndex) => (
            <View key={lectureIndex} style={styles.partItem}>
              <View style={styles.partDot} />
              <View style={styles.lectureInfo}>
                <Text style={styles.partTitle}>{lecture.title || 'Untitled Lecture'}</Text>
                <View style={styles.lectureDetails}>
                  <Text style={styles.duration}>Duration: {lecture.duration || 'N/A'}</Text>
                  <Text style={styles.progress}>Progress: {lecture.progress || 0}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.unitFooter}>
          <View style={styles.videoCountContainer}>
            <Ionicons name="videocam-outline" size={16} color="#666" />
            <Text style={styles.videoCount}>
              {sortedLectures.length} Lectures
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FF5400" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{courseTitle}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#A9C667" />
        </View>
      ) : (
        <FlatList
          data={units}
          renderItem={renderUnitItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No units available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5400',
    paddingTop: 20,
  },
  header: {
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
    textAlign: 'left',

  },
  listContainer: {
    padding: 16,
  },
  unitCard: {
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
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  unitNumberContainer: {
    flex: 1,
    marginRight: 8,
  },
  unitNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#55198A',
    marginBottom: 4,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  partsContainer: {
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 8,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#55198A',
    marginRight: 8,
    marginTop: 8,
  },
  lectureInfo: {
    flex: 1,
  },
  partTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  lectureDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderId: {
    fontSize: 12,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  progress: {
    fontSize: 12,
    color: '#666',
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  videoCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
});

export default CourseContent; 