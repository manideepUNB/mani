import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const EarlyChildhoodScreen = ({ navigation }) => {
  const { addToCart } = useCart();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/grades', {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://myattacademy.sapphiresolutions.in.net',
          'Referer': 'https://myattacademy.sapphiresolutions.in.net/',
          'accept': 'application/json',
          'authorization': 'Bearer 11556|SUVvGQmxCHP07Q7POZWGJjWJ6GQxzKdTe0PEVoGX',
          'content-type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (data.status === 200) {
        // Filter only Reading Tree, Preschool, and Kindergarten
        const filteredGrades = data.data.filter(grade => 
          grade.name === 'Reading Tree' || 
          grade.name === 'Preschool' || 
          grade.name === 'Kindergarten'
        );
        setGrades(filteredGrades);
      } else {
        setError('Failed to fetch grades');
      }
    } catch (err) {
      setError('Error fetching grades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (subject, gradeName) => {
    const cartItem = {
      ...subject,
      grade: gradeName
    };
    addToCart(cartItem);
    Alert.alert(
      "Success",
      `${gradeName} - ${subject.name} has been added to the shopping cart`,
      [
        { 
          text: "View Cart", 
          onPress: () => navigation.navigate('Shopping Cart'),
          style: 'default'
        },
        { 
          text: "Continue Shopping", 
          onPress: () => console.log("Continue shopping"),
          style: 'cancel'
        }
      ]
    );
  };

  const renderSubjectCard = (subject, gradeName) => (
    <View style={styles.subjectCard}>
      <Text style={styles.cardHeading}>{subject.name}</Text>
      <Text style={styles.priceText}>${subject.price}</Text>
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => handleBuyNow(subject, gradeName)}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGradeSection = (grade) => (
    <View key={grade.id} style={styles.gradeSection}>
      <Text style={styles.gradeSectionTitle}>{grade.name}</Text>
      <View style={styles.subjectsRow}>
        {grade.subcategories.map((subject) => (
          <View key={subject.id} style={styles.subjectCardContainer}>
            {renderSubjectCard(subject, grade.name)}
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Early Childhood Program</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            Children in our preschool and kindergarten programs study letters, numbers, and will learn how to read and write in preparation for the Academy's elementary school. These sessions will be provided by qualified early childhood teachers and adhere to a set curriculum.
          </Text>
        
          <Video
            source={require('../assets/courses/earlychildhood.mp4')}
            style={styles.video}
            controls={true}
            resizeMode="contain"
            repeat={false}
          />
        </View>                                                                 
        <View style={styles.coursesContainer}>
          <Text style={styles.cardsSectionTitle}>Available Courses</Text>
          {grades.map(renderGradeSection)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CB6D51',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFE168',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Dreaming Outloud Pro',
    lineHeight: 24,
    textAlign: 'auto',
    padding: 15,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  coursesContainer: {
    padding: 10,
  },
  cardsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  gradeSection: {
    marginBottom: 20,
  },
  gradeSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  subjectCardContainer: {
    width: '48%',
    marginBottom: 10,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 14,
    color: '#55198A',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#55198A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 5,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default EarlyChildhoodScreen;
