import React, { useState, useEffect } from 'react'; 
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);

  useEffect(() => {
    // Load saved credentials if they exist
    loadSavedCredentials();
  }, []);
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

  const saveCredentials = async () => {
    try {
      if (rememberPassword) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
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

      const data = await response.json();
      const message = data.message?.toLowerCase();

      if (message && message.includes('success')) {
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
        }            
                
        if (rememberPassword) {
          await saveCredentials();
        }
        Alert.alert('Success', 'Login successful!');
        setLoggedIn(true);
        setUserInitial(email.trim().charAt(0).toUpperCase());
        setIsDropdownVisible(false);
        return true;
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
        return false;
      }

    } catch (error) {
      Alert.alert('Login Error', error.message);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const success = await loginUser(email, password);
    if (success) {
      setIsDropdownVisible(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleJoinUsPress = () => {
    navigation.navigate('Programs');
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
    Alert.alert('Change Password', 'Redirect to change password screen.');
    // navigation.navigate('ChangePassword'); // add if you have a screen for it
  };

  const handleMyCoursesPress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        navigation.navigate('MyCourses', { token });
      } else {
        Alert.alert(
          "Login Required",
          "Please log in to view your courses",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => {
                setIsDropdownVisible(false);
                navigation.navigate('Login');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not retrieve token");
    }
  };
  

  return (
    <ImageBackground 
      source={require('../screens/bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={toggleDropdown}
          >
            {loggedIn ? (
              <View style={styles.initialCircle}>
                <Text style={styles.initialText}>{userInitial}</Text>
              </View>
            ) : (
              <Image 
                source={require('../assets/profile.png')} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {isDropdownVisible && (
            <View style={styles.dropdownContainer}>
              {loggedIn ? (
                <>
                  <TouchableOpacity onPress={handleChangePassword} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Change Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Logout</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />

          {loggedIn ? (
            <>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={handleMyCoursesPress}
              >
                <Text style={styles.joinButtonText}>My Courses</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.moreButton}
                onPress={handleJoinUsPress}
              >
                <Text style={styles.moreButtonText}>More Courses</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={handleJoinUsPress}
            >
              <Text style={styles.joinButtonText}>Join Us</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  profileContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE168',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  initialCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FF5400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    width: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 5,
    zIndex: 1001,
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
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    paddingHorizontal: 10,
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
  logo: {
    width: '70%',
    height: '30%',
  },
  joinButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreButton: {
    backgroundColor: '#FF5400',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
});

export default HomeScreen;
