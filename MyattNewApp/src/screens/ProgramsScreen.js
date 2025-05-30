import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProgramsScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

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
        'These courses will be available soon.',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {!isLoggedIn && (
          <View style={styles.loginMessageContainer}>
            <Text style={styles.loginMessage}>Login/Sign up to view your courses</Text>
          </View>
        )}
        <Text style={styles.header}>Our Programs</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF884',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  loginMessageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginMessage: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  programCard: {
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  programContent: {
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'justify',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProgramsScreen;
