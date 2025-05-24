import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import BlogsScreen from '../screens/BlogsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EarlyChildhoodScreen from '../screens/EarlyChildhoodScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import CourseDetails from '../screens/CourseDetails';
import MyCourses from '../screens/MyCourses';
import CourseContent from '../screens/CourseContent';
import EnrollmentScreen from '../screens/EnrollmentScreen';
import CartScreen from '../screens/CartScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
  </Stack.Navigator>
);

const CoursesStack = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#FF5400',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="CoursesMain" component={CoursesScreen} />
    <Stack.Screen name="EarlyChildhood" component={EarlyChildhoodScreen} />
    <Stack.Screen name="CourseContent" component={CourseContent} />
    <Stack.Screen name="CourseDetails" component={CourseDetails} />
  </Stack.Navigator>
);

const BlogsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BlogsMain" component={BlogsScreen} />
    <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const MyProgramsStack = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#FF5400',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="MyProgramsMain" 
      component={MyCourses}
      options={{
        title: 'My Courses',
        headerLeft: () => null // Remove back button since it's a tab
      }}
    />
    <Stack.Screen name="CourseContent" component={CourseContent} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Enrollment" component={EnrollmentScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Blogs') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'MyPrograms') {
            iconName = focused ? 'library' : 'library-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#55198A',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Courses" component={CoursesStack} />
      <Tab.Screen 
        name="MyPrograms" 
        component={MyProgramsStack} 
        options={{ 
          title: 'My Programs',
          tabBarLabel: 'My Programs'
        }} 
      />
      <Tab.Screen name="Blogs" component={BlogsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator; 