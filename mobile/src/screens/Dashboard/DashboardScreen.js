import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  Surface,
  Text,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { assetApi, movementApi, discrepancyApi } from '../../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeMovements: 0,
    openDiscrepancies: 0,
    recentScans: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load dashboard statistics
      const [assetsResponse, movementsResponse, discrepanciesResponse] = await Promise.all([
        assetApi.getAssets({ limit: 1 }),
        movementApi.getMovements({ status: 'Requested', limit: 1 }),
        discrepancyApi.getDiscrepancies({ status: 'Open', limit: 1 }),
      ]);

      setStats({
        totalAssets: assetsResponse.data.total || 0,
        activeMovements: movementsResponse.data.total || 0,
        openDiscrepancies: discrepanciesResponse.data.total || 0,
        recentScans: 0, // This would come from a recent scans endpoint
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <Icon name={icon} size={24} color={color} />
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onPress }) => (
    <Card style={styles.actionCard} onPress={onPress}>
      <Card.Content style={styles.actionCardContent}>
        <View style={[styles.actionIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="white" />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.welcomeTitle}>
          Welcome back, {user?.firstName}!
        </Title>
        <Paragraph style={styles.welcomeSubtitle}>
          Here's what's happening with your assets
        </Paragraph>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          icon="inventory"
          color="#1976d2"
          onPress={() => navigation.navigate('Assets')}
        />
        <StatCard
          title="Active Movements"
          value={stats.activeMovements}
          icon="swap-horiz"
          color="#ff9800"
          onPress={() => navigation.navigate('Movements')}
        />
        <StatCard
          title="Open Discrepancies"
          value={stats.openDiscrepancies}
          icon="error"
          color="#f44336"
          onPress={() => navigation.navigate('Discrepancies')}
        />
        <StatCard
          title="Recent Scans"
          value={stats.recentScans}
          icon="qr-code-scanner"
          color="#4caf50"
          onPress={() => navigation.navigate('Assets', { screen: 'AssetScan' })}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        
        <QuickActionCard
          title="Scan Asset"
          description="Scan QR code to view or update asset"
          icon="qr-code-scanner"
          color="#4caf50"
          onPress={() => navigation.navigate('Assets', { screen: 'AssetScan' })}
        />

        <QuickActionCard
          title="Create Movement"
          description="Request asset transfer or checkout"
          icon="add-circle"
          color="#2196f3"
          onPress={() => navigation.navigate('Movements', { screen: 'MovementForm' })}
        />

        <QuickActionCard
          title="Capture Photo"
          description="Take photos for asset documentation"
          icon="photo-camera"
          color="#9c27b0"
          onPress={() => navigation.navigate('Photos', { screen: 'PhotoCapture' })}
        />

        <QuickActionCard
          title="View Assets"
          description="Browse and search asset inventory"
          icon="list"
          color="#607d8b"
          onPress={() => navigation.navigate('Assets')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Recent Activity</Title>
        <Surface style={styles.activityCard}>
          <Text style={styles.activityText}>
            No recent activity to display
          </Text>
          <Text style={styles.activitySubtext}>
            Start scanning assets or creating movements to see activity here
          </Text>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityCard: {
    padding: 20,
    borderRadius: 8,
    elevation: 1,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default DashboardScreen;
