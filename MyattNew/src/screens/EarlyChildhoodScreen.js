import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5;

const EarlyChildhoodScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();

  const cards = [
    { id: '1', title: 'Reading Tree', heading: 'Reading Tree' },
    { id: '2', title: 'Preschool', heading: 'Language Arts' },
    { id: '3', title: 'Preschool', heading: 'Math' },
    { id: '4', title: 'Preschool', heading: 'Science' },
    { id: '5', title: 'Preschool', heading: 'Social Studies' },
    { id: '6', title: 'Kindergarten', heading: 'Language Arts' },
    { id: '7', title: 'Kindergarten', heading: 'Math' },
    { id: '8', title: 'Kindergarten', heading: 'Science' },
    { id: '9', title: 'Kindergarten', heading: 'Social Studies' },
  ];

  const handleBuyNow = (course) => {
    addToCart(course);
    Alert.alert(
      "Success",
      `${course.title} - ${course.heading} has been added to the shopping cart`,
      [
        { 
          text: "View Cart", 
          onPress: () => navigation.navigate('Cart'),
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

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardHeading}>{item.heading}</Text>
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => handleBuyNow(item)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

          <View style={styles.priceContainer}>
            <Text style={styles.price}>$ 50 per course</Text>
          </View>
        </View>                                                                 
        <View style={styles.cardsSection}>
          <Text style={styles.cardsSectionTitle}>Available Courses</Text>
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.cardsContainer}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
          />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Dreaming Outloud Pro',
    lineHeight: 24,
    textAlign: 'auto',
    padding: 15,
  },
  priceContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    alignSelf: 'center',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    color: '#55198A',
    lineHeight: 24,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  cardsSection: {
    padding: 10,
    marginTop: 0,
  },
  cardsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#55198A',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardHeading: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#55198A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EarlyChildhoodScreen;
