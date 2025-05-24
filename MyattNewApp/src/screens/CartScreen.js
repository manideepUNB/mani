import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove ${item.grade} - ${item.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => removeFromCart(item),
          style: "destructive"
        }
      ]
    );
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token; // Returns true if token exists, false otherwise
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://myattacademyapi.sapphiresolutions.in.net/api/login', {
        email,
        password,
      });

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      // Store token
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }

      // Store user data - directly from response
      const userData = {
        id: response.data.id,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        phone: response.data.phone,
        gender: response.data.gender,
        country_id: response.data.country_id
      };

      console.log('User data to store:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      Alert.alert('Success', 'Login successful!');
      setShowLoginModal(false);
      
      // Navigate to payment with both cart data and user data
      navigation.navigate('Payment', {
        cartItems: cartItems.map(item => ({
          grade_id: item.grade_id,
          grade_name: item.grade,
          subject_id: item.subject_id,
          subject_name: item.name,
          price: item.price
        })),
        totalAmount: calculateTotal(),
        userData: userData
      });

    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Please check your credentials and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before checkout.");
      return;
    }

    const isLoggedIn = await checkAuthStatus();

    if (isLoggedIn) {
      // User is logged in, proceed to payment with cart data
      navigation.navigate('Payment', {
        cartItems: cartItems.map(item => ({
          grade_id: item.grade_id,
          grade_name: item.grade,
          subject_id: item.subject_id,
          subject_name: item.name,
          price: item.price
        })),
        totalAmount: calculateTotal()
      });
    } else {
      // User is not logged in, show auth options
      Alert.alert(
        "Authentication Required",
        "Please login or sign up to continue",
        [
          {
            text: "Login",
            onPress: () => {
              // Show login modal instead of navigating to HomeMain
              setShowLoginModal(true);
            }
          },
          {
            text: "Sign Up",
            onPress: () => {
              // Navigate directly to enrollment screen
              navigation.navigate('Enrollment');
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF5400" />
        </TouchableOpacity>
        <Text style={styles.header}>Your Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>No courses enrolled.</Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Explore Programs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            {cartItems.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemGrade}>{item.grade}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF5400" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalAmount}>${calculateTotal()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.clearCartButton}
              onPress={() => {
                Alert.alert(
                  "Clear Cart",
                  "Are you sure you want to clear your cart?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Clear",
                      onPress: () => clearCart(),
                      style: "destructive"
                    }
                  ]
                );
              }}
            >
              <Text style={styles.clearCartText}>Clear Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={showLoginModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowLoginModal(false)}
            >
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Login</Text>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666666"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#666666"
              />

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => {
                  setShowLoginModal(false);
                  navigation.navigate('Enrollment');
                }}
              >
                <Text style={styles.signUpText}>
                  Don't have an account? Sign up here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5400',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
  },
  continueShoppingButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemGrade: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 5,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5400',
  },
  removeButton: {
    padding: 8,
  },
  totalContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5400',
  },
  clearCartButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5400',
    marginBottom: 10,
  },
  clearCartText: {
    color: '#FF5400',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#FF5400',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5400',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    padding: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
  },
  loginButton: {
    backgroundColor: '#FF5400',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#FF5400',
    fontSize: 16,
  },
});

export default CartScreen;
