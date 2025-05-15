import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>About Us</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          We are dedicated to helping people achieve their fitness goals through personalized programs,
          expert guidance, and a supportive community.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Team</Text>
        <ScrollView 
          style={styles.teamScrollView}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
        >
          <View style={styles.teamMember}>
            <Text style={styles.teamMemberName}>Add Teacher 1</Text>
            <Text style={styles.teamMemberRole}>Role</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.teamMemberName}>Add Teacher 2</Text>
            <Text style={styles.teamMemberRole}>Role</Text>
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.teamMemberName}>Add Teacher 3</Text>
            <Text style={styles.teamMemberRole}>Role</Text>
          </View>
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionText}>
          Email: support@fitnessapp.com{'\n'}
          Phone: (123) 456-7890{'\n'}
          Address: 123 Fitness Street, Health City
        </Text>
      </View>
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
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  teamScrollView: {
    flexDirection: 'row',
    marginTop: 10,
  },
  teamMember: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    width: 200,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  teamMemberRole: {
    fontSize: 14,
    color: '#666666',
  },
});

export default AboutScreen;
