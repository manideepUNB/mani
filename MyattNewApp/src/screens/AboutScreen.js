import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AboutScreen = ({ navigation }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    loadSavedCredentials();
    checkLoginStatus();
    
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
      console.log('Login response:', data); // Debug log

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

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>About Us</Text>
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={toggleDropdown}
        >
          <Text style={styles.signInText}>
            {loggedIn ? 'Welcome!' : 'SIGN IN'}
          </Text>
        </TouchableOpacity>
      </View>

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
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.listItem}
          onPress={() => toggleSection('mission')}
        >
          <Ionicons name="school" size={20} color="#FF5400" style={styles.listIcon} />
          <Text style={styles.listText}>About Dr. Myatt Academy of Learning</Text>
          <Ionicons 
            name={expandedSections.mission ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        {expandedSections.mission && (
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>The shared dream and purpose of every member of our team is "To provide the gold standard of affordable, flexible, quality online preschool, elementary, and secondary education to youth worldwide".</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.listItem}
          onPress={() => toggleSection('contact')}
        >
          <Ionicons name="call" size={20} color="#FF5400" style={styles.listIcon} />
          <Text style={styles.listText}>Contact Us</Text>
          <Ionicons 
            name={expandedSections.contact ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        {expandedSections.contact && (
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Ionicons name="mail" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>inquiries@myattacademy.com</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="call" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>(1833) 376-928</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons name="location" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>44 NB-107, Stanley, NB E6C 2G7</Text>
            </View>
          </View>
        )}
      </View>

      {loggedIn && (
        <>
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.listItem}
              onPress={handleChangePassword}
            >
              <Ionicons name="key" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.listItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#FF5400" style={styles.listIcon} />
              <Text style={styles.listText}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {renderChangePasswordModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5400',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
  },
  listIcon: {
    marginRight: 10,
  },
  listText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 25,
    paddingTop: 45,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default AboutScreen;
