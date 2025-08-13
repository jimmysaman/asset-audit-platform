import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  Chip,
  FAB,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { movementApi } from '../../services/api';

const MovementListScreen = ({ navigation }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const response = await movementApi.getMovements({
        limit: 50,
        search: searchQuery,
      });
      setMovements(response.data.movements || []);
    } catch (error) {
      console.error('Error loading movements:', error);
      setSnackbarMessage('Failed to load movements');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMovements();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4caf50';
      case 'Approved':
        return '#2196f3';
      case 'Requested':
        return '#ff9800';
      case 'Rejected':
      case 'Cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const renderMovementItem = ({ item }) => (
    <Card
      style={styles.movementCard}
      onPress={() => navigation.navigate('MovementDetail', { movementId: item.id })}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.movementHeader}>
          <View style={styles.movementInfo}>
            <Text style={styles.movementType}>{item.type}</Text>
            <Text style={styles.movementRoute}>
              {item.fromLocation} → {item.toLocation}
            </Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.movementDetails}>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.requestDate).toLocaleDateString()}
            </Text>
          </View>
          {item.reason && (
            <View style={styles.detailRow}>
              <Icon name="description" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.reason}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="swap-horiz" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No movements found</Text>
        <Text style={styles.emptySubtext}>
          Movements will appear here once created
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search movements..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={movements}
        renderItem={renderMovementItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={movements.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('MovementForm')}
        label="Create"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
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
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  movementCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  movementInfo: {
    flex: 1,
    marginRight: 12,
  },
  movementType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  movementRoute: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  movementDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default MovementListScreen;
