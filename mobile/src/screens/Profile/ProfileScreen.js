import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  Avatar,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
      setLogoutDialogVisible(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <Card style={styles.userCard}>
        <Card.Content style={styles.userCardContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.firstName, user?.lastName)}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>{user?.role?.name || 'User'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Navigate to change password screen
              Alert.alert('Coming Soon', 'Password change feature will be available soon');
            }}
          />
          <Divider />
          <List.Item
            title="Account Information"
            description={`Member since ${formatDate(user?.createdAt)}`}
            left={(props) => <List.Icon {...props} icon="account-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Navigate to account info screen
              Alert.alert('Account Info', `Username: ${user?.username}\nEmail: ${user?.email}\nRole: ${user?.role?.name}`);
            }}
          />
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Settings</Text>
          <List.Item
            title="Notifications"
            description="Receive push notifications"
            left={(props) => <List.Icon {...props} icon="notifications" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Offline Mode"
            description="Enable offline data sync"
            left={(props) => <List.Icon {...props} icon="cloud-off" />}
            right={() => (
              <Switch
                value={offlineModeEnabled}
                onValueChange={setOfflineModeEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="info" />}
          />
        </Card.Content>
      </Card>

      {/* Support Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Support</Text>
          <List.Item
            title="Help & FAQ"
            description="Get help and find answers"
            left={(props) => <List.Icon {...props} icon="help" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Help', 'Help documentation will be available soon');
            }}
          />
          <Divider />
          <List.Item
            title="Contact Support"
            description="Get in touch with our team"
            left={(props) => <List.Icon {...props} icon="support" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Contact Support', 'Support contact information will be available soon');
            }}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={(props) => <List.Icon {...props} icon="privacy-tip" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy policy will be available soon');
            }}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => setLogoutDialogVisible(true)}
            icon="logout"
            textColor="#f44336"
            style={styles.logoutButton}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Dialog
        visible={logoutDialogVisible}
        onDismiss={() => setLogoutDialogVisible(false)}
      >
        <DialogTitle>Sign Out</DialogTitle>
        <DialogContent>
          <Text>Are you sure you want to sign out?</Text>
        </DialogContent>
        <DialogActions>
          <Button onPress={() => setLogoutDialogVisible(false)}>
            Cancel
          </Button>
          <Button
            onPress={handleLogout}
            disabled={loggingOut}
            textColor="#f44336"
          >
            {loggingOut ? <ActivityIndicator size="small" /> : 'Sign Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    margin: 16,
    elevation: 4,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  logoutCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    elevation: 2,
  },
  logoutButton: {
    borderColor: '#f44336',
  },
});

export default ProfileScreen;
