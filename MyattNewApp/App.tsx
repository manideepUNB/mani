import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 👉 Your screen imports
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BlogsScreen from './src/screens/BlogsScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import CartScreen from './src/screens/CartScreen';
import AboutScreen from './src/screens/AboutScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import EarlyChildhoodScreen from './src/screens/EarlyChildhoodScreen';
import ElementarySchoolScreen from './src/screens/ElementarySchoolScreen';
import BlogFullDetails from './src/screens/BlogFullDetails';
import MyCourses from './src/screens/MyCourses';
import EnrollmentScreen from './src/screens/EnrollmentScreen';
import CourseContent from './src/screens/CourseContent';
import CourseDetails from './src/screens/CourseDetails';
import QuizScreen from './src/screens/QuizScreen';
import PaymentScreen from './src/screens/PaymentScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false  
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="MyCourses" component={MyCourses} />
    <Stack.Screen name="CourseContent" component={CourseContent} />
    <Stack.Screen name="QuizScreen" component={QuizScreen} />
    <Stack.Screen 
      name="CourseDetails" 
      component={CourseDetails}
      options={({ route }) => ({ 
        title: 'Course Details'
      })}
    />
    <Stack.Screen 
      name="EarlyChildhood" 
      component={EarlyChildhoodScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen 
      name="ElementarySchool" 
      component={ElementarySchoolScreen}
      options={{
        headerShown: false
      }}
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
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen 
      name="ProgramsMain" 
      component={MyCourses}
    />
    <Stack.Screen 
      name="CourseContent" 
      component={CourseContent}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen 
      name="EarlyChildhood" 
      component={EarlyChildhoodScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen 
      name="ElementarySchool" 
      component={ElementarySchoolScreen}
      options={{
        headerShown: false
      }}
    />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
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
          const icons: { [key: string]: string } = {
            Explore: 'home',
            Blogs: 'book-outline',
            'My Programs': 'school-outline',
            'Shopping Cart': 'cart-outline',
            'My Profile': 'person-circle-outline',
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
      <Tab.Screen 
        name="Explore" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Blogs" 
        component={BlogsStack}
        options={{
          tabBarLabel: 'Blogs',
        }}
      />
      <Tab.Screen 
        name="My Programs" 
        component={ProgramsStack}
        options={{
          tabBarLabel: 'Programs',
        }}
      />
      <Tab.Screen 
        name="Shopping Cart" 
        component={CartStack}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen 
        name="My Profile" 
        component={AboutStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
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
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Enrollment" component={EnrollmentScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
} 