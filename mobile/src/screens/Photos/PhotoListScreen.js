import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';

const PhotoListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Photo Gallery</Text>
          <Text style={styles.placeholder}>
            This screen will display a grid of photos with filtering options 
            by asset, movement, or date. Users can view, edit, or delete photos.
          </Text>
        </Card.Content>
      </Card>

      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => navigation.navigate('PhotoCapture')}
        label="Capture"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default PhotoListScreen;
