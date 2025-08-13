import React, { useState, useEffect, useCallback } from 'react';
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
import { assetApi } from '../../services/api';

const AssetListScreen = ({ navigation }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadAssets(true);
  }, []);

  const loadAssets = async (reset = false) => {
    if (loading && !reset) return;

    try {
      const currentPage = reset ? 1 : page;
      const response = await assetApi.getAssets({
        page: currentPage,
        limit: 20,
        search: searchQuery,
      });

      const newAssets = response.data.assets || [];
      
      if (reset) {
        setAssets(newAssets);
        setPage(2);
      } else {
        setAssets(prev => [...prev, ...newAssets]);
        setPage(prev => prev + 1);
      }

      setHasMore(newAssets.length === 20);
    } catch (error) {
      console.error('Error loading assets:', error);
      setSnackbarMessage('Failed to load assets');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadAssets(true);
  }, [searchQuery]);

  const onSearch = useCallback((query) => {
    setSearchQuery(query);
    setLoading(true);
    setPage(1);
    setTimeout(() => loadAssets(true), 300); // Debounce search
  }, []);

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

  const renderAssetItem = ({ item }) => (
    <Card
      style={styles.assetCard}
      onPress={() => navigation.navigate('AssetDetail', { assetId: item.id })}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.assetHeader}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{item.name}</Text>
            <Text style={styles.assetTag}>#{item.assetTag}</Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.assetDetails}>
          <View style={styles.detailRow}>
            <Icon name="category" size={16} color="#666" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          {item.custodian && (
            <View style={styles.detailRow}>
              <Icon name="person" size={16} color="#666" />
              <Text style={styles.detailText}>{item.custodian}</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="inventory" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No assets found</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery ? 'Try adjusting your search' : 'Assets will appear here once added'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search assets..."
        onChangeText={onSearch}
        value={searchQuery}
        style={styles.searchbar}
        icon="search"
        clearIcon="close"
      />

      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadAssets();
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={assets.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

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
  assetCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetInfo: {
    flex: 1,
    marginRight: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  assetTag: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusChip: {
    height: 28,
  },
  assetDetails: {
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
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

export default AssetListScreen;
