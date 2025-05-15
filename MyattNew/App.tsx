import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CartProvider } from './src/context/CartContext';

// 👉 Your screen imports
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BlogsScreen from './src/screens/BlogsScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import CartScreen from './src/screens/CartScreen';
import AboutScreen from './src/screens/AboutScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import EarlyChildhoodScreen from './src/screens/EarlyChildhoodScreen';
import BlogFullDetails from './src/screens/BlogFullDetails';
import MyCourses from './src/screens/MyCourses';
import CourseContent from './src/screens/CourseContent';
import CourseDetails from './src/screens/CourseDetails';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,
      headerStyle: {
        backgroundColor: '#FF5400',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="MyCourses" component={MyCourses} />
    <Stack.Screen name="CourseContent" component={CourseContent} />
    <Stack.Screen 
      name="CourseDetails" 
      component={CourseDetails}
      options={({ route }) => ({ 
        title: route.params?.course?.full_course_name || 'Course Details'
      })}
    />
  </Stack.Navigator>
);

const BlogsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BlogsMain" component={BlogsScreen} />
    <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
    <Stack.Screen name="BlogFullDetails" component={BlogFullDetails} />
  </Stack.Navigator>
);

const ProgramsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProgramsMain" component={ProgramsScreen} />
    <Stack.Screen name="EarlyChildhood" component={EarlyChildhoodScreen} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
  </Stack.Navigator>
);

const AboutStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AboutMain" component={AboutScreen} />
  </Stack.Navigator>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Blogs: 'book-outline',
            Programs: 'school-outline',
            Cart: 'cart-outline',
            About: 'information-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          backgroundColor: '#A9C667',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Programs" component={ProgramsStack} />
      <Tab.Screen name="Blogs" component={BlogsStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="About" component={AboutStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoading ? (
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
} 