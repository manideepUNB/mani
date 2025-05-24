import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EnrollmentScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showGenderList, setShowGenderList] = useState(false);

  const genderOptions = [
    { id: '1', label: 'Male' },
    { id: '2', label: 'Female' },
    { id: '3', label: 'Others' },
  ];

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleSignUp = async () => {
    // Debug logging for all form fields
    console.log('=== Form Data Debug ===');
    console.log('First Name:', formData.firstName, 'Length:', formData.firstName?.length);
    console.log('Last Name:', formData.lastName, 'Length:', formData.lastName?.length);
    console.log('Email:', formData.email, 'Length:', formData.email?.length);
    console.log('Phone:', formData.phone, 'Length:', formData.phone?.length);
    console.log('Gender:', formData.gender, 'Length:', formData.gender?.length);
    console.log('Selected Country:', selectedCountry);
    console.log('=====================');

    // Detailed validation with logging
    const missingFields = [];
    if (!formData.firstName?.trim()) {
      console.log('First Name is missing or empty');
      missingFields.push('First Name');
    }
    if (!formData.lastName?.trim()) {
      console.log('Last Name is missing or empty');
      missingFields.push('Last Name');
    }
    if (!formData.email?.trim()) {
      console.log('Email is missing or empty');
      missingFields.push('Email');
    }
    if (!formData.phone?.trim()) {
      console.log('Phone is missing or empty');
      missingFields.push('Phone');
    }
    if (!formData.gender?.trim()) {
      console.log('Gender is missing or empty');
      missingFields.push('Gender');
    }
    if (!selectedCountry) {
      console.log('Country is missing or empty');
      missingFields.push('Country');
    }

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      Alert.alert('Missing Fields', `Please fill in the following fields:\n${missingFields.join('\n')}`);
      return;
    }

    try {
      const requestBody = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender.trim(),
        country_id: selectedCountry.id,
      };

      console.log('Sending registration request with data:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Registration response:', JSON.stringify(data, null, 2));

      if (data.status === 200) {
        Alert.alert('Success', 'Registration successful! Please login to continue.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Please try again');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://myattacademyapi.sapphiresolutions.in.net/api/country', {
        method: 'GET',
        headers: {
          'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
          'Origin': 'https://myattacademy.sapphiresolutions.in.net',
          'Referer': 'https://myattacademy.sapphiresolutions.in.net/',
          'accept': 'application/json',
          'content-type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.status === 200) {
        setCountries(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      Alert.alert('Error', 'Failed to fetch countries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        console.log('Selected country:', item);
        setSelectedCountry(item);
        setShowCountryList(false);
      }}
    >
      <Text style={styles.countryName}>{item.country_name}</Text>
    </TouchableOpacity>
  );

  const renderGenderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.genderItem}
      onPress={() => {
        console.log('Selected gender:', item.label);
        handleInputChange('gender', item.label);
        setShowGenderList(false);
      }}
    >
      <Text style={styles.genderText}>{item.label}</Text>
    </TouchableOpacity>
  );

  // Add validation styles to inputs
  const getInputStyle = (field) => {
    const value = formData[field]?.trim();
    return [
      styles.input,
      !value && styles.inputError
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5400" />
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
          <Ionicons name="arrow-back" size={24} color="#FF5400" />
        </TouchableOpacity>
        <Text style={styles.header}>Sign Up</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={getInputStyle('firstName')}
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
        />

        <TextInput
          style={getInputStyle('lastName')}
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
        />

        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderSelector, !formData.gender && styles.inputError]}
            onPress={() => setShowGenderList(!showGenderList)}
          >
            <Text style={styles.genderSelectorText}>
              {formData.gender || 'Select Gender'}
            </Text>
            <Ionicons 
              name={showGenderList ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#666666" 
            />
          </TouchableOpacity>

          {showGenderList && (
            <View style={styles.genderListContainer}>
              <FlatList
                data={genderOptions}
                renderItem={renderGenderItem}
                keyExtractor={item => item.id}
                style={styles.genderList}
              />
            </View>
          )}
        </View>

        <TextInput
          style={getInputStyle('email')}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.phoneContainer}>
          <View style={styles.countrySelectorContainer}>
            <TouchableOpacity
              style={[styles.countrySelector, !selectedCountry && styles.inputError]}
              onPress={() => setShowCountryList(!showCountryList)}
            >
              <Text style={styles.selectedCountryText} numberOfLines={1}>
                {selectedCountry ? selectedCountry.country_name : 'Select Country'}
              </Text>
              <Ionicons 
                name={showCountryList ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#666666" 
              />
            </TouchableOpacity>

            {showCountryList && (
              <View style={styles.countryListContainer}>
                <FlatList
                  data={countries}
                  renderItem={renderCountryItem}
                  keyExtractor={item => item.id.toString()}
                  style={styles.countryList}
                />
              </View>
            )}
          </View>

          <TextInput
            style={[styles.input, styles.phoneInput, getInputStyle('phone')]}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  countrySelectorContainer: {
    width: '50%',
    position: 'relative',
  },
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  selectedCountryText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  countryListContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  countryName: {
    fontSize: 16,
    color: '#333333',
  },
  genderContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  genderSelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  genderListContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  genderList: {
    maxHeight: 150,
  },
  genderItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  genderText: {
    fontSize: 16,
    color: '#333333',
  },
  signUpButton: {
    backgroundColor: '#FF5400',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#FF5400',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
  },
});

export default EnrollmentScreen; 