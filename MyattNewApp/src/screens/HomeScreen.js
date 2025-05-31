import React, { useState, useEffect } from 'react'; 
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity, Text, Alert, ScrollView, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation, route }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check login status on initial load
    checkLoginStatus();
    loadSavedCredentials();
    
    // Add focus listener to check login status when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });

    // Cleanup the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberPassword(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setLoggedIn(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);

        if (data.token) {
        try {
          // Store token and user data
          await AsyncStorage.setItem('userToken', data.token);
          if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }            
                
          // Store credentials if remember password is checked
        if (rememberPassword) {
          await AsyncStorage.setItem('savedEmail', email);
          await AsyncStorage.setItem('savedPassword', password);
        }

          // Update UI state
        setLoggedIn(true);
        setIsDropdownVisible(false);
          Alert.alert('Success', 'You have been successfully logged in!');
        return true;
        } catch (storageError) {
          console.error('Storage error:', storageError);
          Alert.alert('Error', 'Failed to save login information. Please try again.');
          return false;
        }
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('HTTP error')) {
        Alert.alert('Server Error', 'Unable to connect to the server. Please try again later.');
      } else {
        Alert.alert('Login Error', 'An error occurred during login. Please try again.');
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
    const success = await loginUser(email, password);
    if (success) {
      setIsDropdownVisible(false);
      setEmail('');
      setPassword('');
      }
    } catch (error) {
      console.error('Handle login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setLoggedIn(false);
      setEmail('');
      setPassword('');
      setIsDropdownVisible(false);
      Alert.alert('Logged Out', 'You have been logged out.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChangePassword = () => {
    setIsDropdownVisible(false);
    setShowChangePasswordModal(true);
  };

  const verifyOldPassword = async () => {
    try {
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ password: oldPassword }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const isOldPasswordValid = await verifyOldPassword();
    if (!isOldPasswordValid) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    try {
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          oldPassword,
          newPassword 
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowChangePasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const renderChangePasswordModal = () => (
    <Modal
      visible={showChangePasswordModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowChangePasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowChangePasswordModal(false)}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Change Password</Text>

          <View style={styles.passwordInputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                placeholderTextColor="#666666"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons 
                  name={showOldPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordInputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholderTextColor="#666666"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordInputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#666666"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={handlePasswordChange}
          >
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
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
        'This course will be available soon. Magic takes time! 😊',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ]
      );
    }
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            checkLoginStatus();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../screens/bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      {!loggedIn && (
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={toggleDropdown}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      )}

      {isDropdownVisible && !loggedIn && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={toggleDropdown}
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
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
              onPress={togglePasswordVisibility}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.rememberContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}
              onPress={() => setRememberPassword(!rememberPassword)}
            >
              {rememberPassword && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <Text style={styles.rememberText}>Remember Password</Text>
          </View>
          <TouchableOpacity 
            style={styles.dropdownLoginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.mainScrollView}>
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />

            <Image 
              source={require('../assets/yak.png')} 
              style={styles.yakImage}
              resizeMode="contain"
            />

            <View style={styles.programsContainer}>
              <Text style={styles.programsTitle}>Our Programs</Text>
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
        </View>
      </ScrollView>
      {renderChangePasswordModal()}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    minHeight: 700,
    width: '100%',
    alignItems: 'center',
    paddingTop: 120,
  },
  logo: {
    width: '60%',
    height: '25%',
    marginTop: 20,
    marginBottom: -20,
  },
  spacer: {
    height: 100,
  },
  yakImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    zIndex: 1,
    right: 20,
    top: 380,
  },
  programsContainer: {
    width: '100%',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    flex: 1,
    marginTop: -10,
    position: 'relative',
  },
  programsScrollView: {
    height: 1000,
    marginTop: 2,
  },
  programsScrollContent: {
    paddingBottom: 20,
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
  mainScrollView: {
    flex: 1,
  },
  programsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 0,
  },
  loginButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF5400',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 25,
    paddingTop: 45,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
    alignSelf: 'center',
    position: 'absolute',
    top: 100,
    left: '5%',
    right: '5%',
    zIndex: 9998,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1002,
    padding: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#333333',
  },
  eyeIcon: {
    padding: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#A9C667',
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#A9C667',
  },
  rememberText: {
    fontSize: 14,
    color: '#666666',
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
    padding: 20,
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
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordInputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  changePasswordButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
  },
  dropdownLoginButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default HomeScreen;
