import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentScreen = ({ navigation, route }) => {
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user data from AsyncStorage
        const userDataString = await AsyncStorage.getItem('userData');
        console.log('User data from AsyncStorage:', userDataString);

        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          console.log('Parsed user data:', parsedData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };

    initializeData();
  }, []);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const message = data.message?.toLowerCase();

      if (message && message.includes('success')) {
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
          // Store user data
          if (data.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));
            setUserData(data.user);
          }
        }
        Alert.alert('Success', 'Login successful!');
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
        // Retry the payment process
        handlePaymentSelection(selectedPayment);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  const handlePaymentSelection = async (method) => {
    setSelectedPayment(method);
    if (method === 'stripe') {
      await handleStripePayment();
    } else if (method === 'paypal') {
      await handlePayPalPayment();
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      
      if (!userData) {
        Alert.alert('Error', 'Please try again');
        setLoading(false);
        return;
      }

      // Get cart data from route params
      const { cartItems, totalAmount } = route.params || {};

      if (!cartItems || !totalAmount) {
        Alert.alert('Error', 'Cart data not found. Please try again.');
        setLoading(false);
        return;
      }

      // Prepare the request payload with dynamic data
      const payload = {
        country_id: userData.country_id || 38,
        name: `${userData.first_name} ${userData.last_name}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        gender: userData.gender,
        phone: userData.phone || '',
        payment_method: "stripe",
        phone_number: userData.phone || '',
        total_price: totalAmount,
        amount: totalAmount,
        project_name: "Myatt Academy",
        order_items: cartItems.map(item => ({
          grade_id: item.grade_id,
          grade_name: item.grade_name,
          subject_id: item.subject_id,
          subject_name: item.subject_name,
          unit_price: item.price
        }))
      };

      console.log('Payment payload:', payload);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please try again');
        setLoading(false);
        return;
      }

      // Make the API call to get the checkout URL
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/user/checkout', {
        method: 'POST',
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'custombearertoken': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        const canOpen = await Linking.canOpenURL(data.data);
        if (canOpen) {
          await Linking.openURL(data.data);
        } else {
          Alert.alert('Error', 'Cannot open payment link');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        'Unable to process payment. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      if (!userData) {
        Alert.alert('Error', 'User data not found. Please try logging in again.');
        setLoading(false);
        return;
      }

      // Get cart data from route params
      const { cartItems, totalAmount } = route.params || {};

      if (!cartItems || !totalAmount) {
        Alert.alert('Error', 'Cart data not found. Please try again.');
        setLoading(false);
        return;
      }

      const payload = {
        country_id: userData.country_id || 39,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        gender: userData.gender,
        phone: userData.phone || '',
        payment_method: "paypal",
        phone_number: userData.phone || '',
        total_price: totalAmount,
        amount: totalAmount,
        project_name: "Myatt Academy",
        order_items: cartItems.map(item => ({
          grade_id: item.grade_id,
          grade_name: item.grade_name,
          subject_id: item.subject_id,
          subject_name: item.subject_name,
          unit_price: item.price
        }))
      };

      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/checkout', {
        method: 'POST',
        headers: {
          'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'custombearertoken': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal checkout session');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        const canOpen = await Linking.canOpenURL(data.data);
        if (canOpen) {
          await Linking.openURL(data.data);
        } else {
          Alert.alert('Error', 'Cannot open PayPal payment link');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      Alert.alert(
        'Payment Error',
        'Unable to process PayPal payment. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLoginModal = () => (
    <Modal
      visible={showLoginModal}
      transparent={true}
      animationType="fade"
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

          <Text style={styles.modalTitle}>Login Required</Text>
          <Text style={styles.modalSubtitle}>Please login to proceed with payment</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666666"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#666666"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDebugModal = () => (
    <Modal
      visible={showDebugModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDebugModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowDebugModal(false)}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Debug Information</Text>
          
          <ScrollView style={styles.debugScrollView}>
            <View style={styles.debugSection}>
              <Text style={styles.debugSectionTitle}>User Data:</Text>
              <Text style={styles.debugText}>
                {userData ? JSON.stringify(userData, null, 2) : 'No user data found'}
              </Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugSectionTitle}>Cart Data:</Text>
              <Text style={styles.debugText}>
                {route.params ? JSON.stringify(route.params, null, 2) : 'No cart data found'}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => setShowDebugModal(false)}
          >
            <Text style={styles.loginButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF5400" />
        </TouchableOpacity>
        <Text style={styles.header}>Payment</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.paymentOptionsContainer}>
          <Text style={styles.paymentTitle}>Select Payment Method</Text>
          <Text style={styles.paymentSubtitle}>Choose your preferred payment method</Text>
          
          <View style={styles.paymentOptionsWrapper}>
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                selectedPayment === 'stripe' && styles.selectedOption,
                loading && styles.disabledOption
              ]}
              onPress={() => handlePaymentSelection('stripe')}
              disabled={loading}
            >
              <View style={styles.radioButton}>
                {selectedPayment === 'stripe' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentOptionContent}>
                <Image 
                  source={require('../assets/stripe.png')}
                  style={styles.paymentImage}
                  resizeMode="contain"
                />
                <Text style={styles.paymentDescription}>
                  Pay securely with Stripe
                </Text>
              </View>
              {loading && selectedPayment === 'stripe' && (
                <ActivityIndicator color="#FF5400" style={styles.loader} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.paymentOption,
                selectedPayment === 'paypal' && styles.selectedOption,
                loading && styles.disabledOption
              ]}
              onPress={() => handlePaymentSelection('paypal')}
              disabled={loading}
            >
              <View style={styles.radioButton}>
                {selectedPayment === 'paypal' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.paymentOptionContent}>
                <Image 
                  source={require('../assets/Paypal.png')}
                  style={styles.paymentImage}
                  resizeMode="contain"
                />
                <Text style={styles.paymentDescription}>
                  Pay with your PayPal account
                </Text>
              </View>
              {loading && selectedPayment === 'paypal' && (
                <ActivityIndicator color="#FF5400" style={styles.loader} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {renderLoginModal()}
      {renderDebugModal()}
    </SafeAreaView>
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
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  paymentOptionsContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  paymentSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  paymentOptionsWrapper: {
    gap: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#FF5400',
    backgroundColor: '#FFF5F0',
    shadowColor: '#FF5400',
    shadowOpacity: 0.1,
  },
  disabledOption: {
    opacity: 0.7,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF5400',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5400',
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentImage: {
    width: 100,
    height: 30,
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666666',
  },
  loader: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugScrollView: {
    maxHeight: 400,
    marginVertical: 16,
  },
  debugSection: {
    marginBottom: 16,
  },
  debugSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
});

export default PaymentScreen; 