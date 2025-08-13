import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import AssetListScreen from './src/screens/Assets/AssetListScreen';
import AssetDetailScreen from './src/screens/Assets/AssetDetailScreen';
import AssetScanScreen from './src/screens/Assets/AssetScanScreen';
import MovementListScreen from './src/screens/Movements/MovementListScreen';
import MovementDetailScreen from './src/screens/Movements/MovementDetailScreen';
import MovementFormScreen from './src/screens/Movements/MovementFormScreen';
import PhotoCaptureScreen from './src/screens/Photos/PhotoCaptureScreen';
import PhotoListScreen from './src/screens/Photos/PhotoListScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Theme
import { theme } from './src/utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Assets') {
            iconName = 'inventory';
          } else if (route.name === 'Movements') {
            iconName = 'swap-horiz';
          } else if (route.name === 'Photos') {
            iconName = 'photo-camera';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assets" component={AssetStackNavigator} />
      <Tab.Screen name="Movements" component={MovementStackNavigator} />
      <Tab.Screen name="Photos" component={PhotoStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AssetStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AssetList" 
        component={AssetListScreen} 
        options={{ title: 'Assets' }}
      />
      <Stack.Screen 
        name="AssetDetail" 
        component={AssetDetailScreen} 
        options={{ title: 'Asset Details' }}
      />
      <Stack.Screen 
        name="AssetScan" 
        component={AssetScanScreen} 
        options={{ title: 'Scan Asset' }}
      />
    </Stack.Navigator>
  );
};

const MovementStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MovementList" 
        component={MovementListScreen} 
        options={{ title: 'Movements' }}
      />
      <Stack.Screen 
        name="MovementDetail" 
        component={MovementDetailScreen} 
        options={{ title: 'Movement Details' }}
      />
      <Stack.Screen 
        name="MovementForm" 
        component={MovementFormScreen} 
        options={{ title: 'Create Movement' }}
      />
    </Stack.Navigator>
  );
};

const PhotoStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PhotoList" 
        component={PhotoListScreen} 
        options={{ title: 'Photos' }}
      />
      <Stack.Screen 
        name="PhotoCapture" 
        component={PhotoCaptureScreen} 
        options={{ title: 'Capture Photo' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
