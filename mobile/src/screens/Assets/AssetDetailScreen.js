import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Snackbar,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { assetApi } from '../../services/api';

const AssetDetailScreen = ({ navigation, route }) => {
  const { assetId, scannedTag } = route.params;
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadAssetDetails();
  }, [assetId]);

  const loadAssetDetails = async () => {
    try {
      const response = await assetApi.getById(assetId);
      setAsset(response.data);
    } catch (error) {
      console.error('Error loading asset:', error);
      setSnackbarMessage('Failed to load asset details');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssetDetails();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#4caf50';
      case 'Inactive':
        return '#f44336';
      case 'Maintenance':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading asset details...</Text>
      </View>
    );
  }

  if (!asset) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color="#f44336" />
        <Text style={styles.errorText}>Asset not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetTag}>#{asset.assetTag}</Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(asset.status) }}
              style={[styles.statusChip, { borderColor: getStatusColor(asset.status) }]}
            >
              {asset.status}
            </Chip>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Basic Information</Text>
            
            <View style={styles.infoRow}>
              <Icon name="category" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{asset.category}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{asset.location}</Text>
              </View>
            </View>

            {asset.custodian && (
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#666" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Custodian</Text>
                  <Text style={styles.infoValue}>{asset.custodian}</Text>
                </View>
              </View>
            )}

            {asset.description && (
              <View style={styles.infoRow}>
                <Icon name="description" size={20} color="#666" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{asset.description}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Technical Details */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Technical Details</Text>
            
            {asset.serialNumber && (
              <View style={styles.infoRow}>
                <Icon name="confirmation-number" size={20} color="#666" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Serial Number</Text>
                  <Text style={styles.infoValue}>{asset.serialNumber}</Text>
                </View>
              </View>
            )}

            {asset.model && (
              <View style={styles.infoRow}>
                <Icon name="devices" size={20} color="#666" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Model</Text>
                  <Text style={styles.infoValue}>{asset.model}</Text>
                </View>
              </View>
            )}

            {asset.manufacturer && (
              <View style={styles.infoRow}>
                <Icon name="business" size={20} color="#666" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Manufacturer</Text>
                  <Text style={styles.infoValue}>{asset.manufacturer}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                icon="photo-camera"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Photos', {
                  screen: 'PhotoCapture',
                  params: { assetId: asset.id }
                })}
              >
                Take Photo
              </Button>
              
              <Button
                mode="outlined"
                icon="swap-horiz"
                style={styles.actionButton}
                onPress={() => navigation.navigate('Movements', {
                  screen: 'MovementForm',
                  params: { assetId: asset.id }
                })}
              >
                Create Movement
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="qr-code-scanner"
        style={styles.fab}
        onPress={() => navigation.navigate('AssetScan')}
        label="Scan"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  assetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  assetTag: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusChip: {
    height: 32,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 80,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default AssetDetailScreen;
