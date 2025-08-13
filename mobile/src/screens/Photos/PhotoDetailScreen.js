import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  IconButton,
  Snackbar,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { photoApi } from '../../services/api';

const PhotoDetailScreen = ({ route, navigation }) => {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchPhoto();
  }, [photoId]);

  const fetchPhoto = async () => {
    try {
      setLoading(true);
      const response = await photoApi.getById(photoId);
      setPhoto(response.data);
      setDescription(response.data.description || '');
    } catch (error) {
      console.error('Error fetching photo:', error);
      setSnackbarMessage('Failed to load photo details');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDescription = () => {
    setEditing(true);
  };

  const handleSaveDescription = async () => {
    try {
      setUpdating(true);
      await photoApi.updatePhoto(photoId, { description });
      setPhoto({ ...photo, description });
      setEditing(false);
      setSnackbarMessage('Description updated successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error updating description:', error);
      setSnackbarMessage('Failed to update description');
      setSnackbarVisible(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(photo.description || '');
    setEditing(false);
  };

  const handleDeletePhoto = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await photoApi.deletePhoto(photoId);
      setSnackbarMessage('Photo deleted successfully');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setSnackbarMessage('Failed to delete photo');
      setSnackbarVisible(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading photo details...</Text>
      </View>
    );
  }

  if (!photo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Photo not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.imageCard}>
        <Image source={{ uri: photo.url }} style={styles.image} resizeMode="contain" />
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Asset Information</Text>
          <Text style={styles.assetName}>{photo.asset?.name || 'Unknown Asset'}</Text>
          <Text style={styles.assetTag}>{photo.asset?.assetTag || 'No tag'}</Text>
          
          {photo.asset?.location && (
            <Chip icon="map-marker" style={styles.locationChip}>
              {photo.asset.location}
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.descriptionCard}>
        <Card.Content>
          <View style={styles.descriptionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            {!editing && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={handleEditDescription}
              />
            )}
          </View>

          {editing ? (
            <View>
              <TextInput
                label={`Description ${description.length}/500`}
                value={description}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setDescription(text);
                  }
                }}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Describe what's in this photo, its condition, or any relevant details..."
                maxLength={500}
                style={styles.descriptionInput}
              />
              <View style={styles.editButtons}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  style={styles.editButton}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveDescription}
                  style={styles.editButton}
                  loading={updating}
                  disabled={updating}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <Text style={styles.descriptionText}>
              {photo.description || 'No description provided'}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.metadataCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Photo Details</Text>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Uploaded:</Text>
            <Text style={styles.metadataValue}>{formatDate(photo.createdAt)}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>File Size:</Text>
            <Text style={styles.metadataValue}>{formatFileSize(photo.filesize)}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Type:</Text>
            <Text style={styles.metadataValue}>{photo.mimetype}</Text>
          </View>
          {photo.uploader && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Uploaded by:</Text>
              <Text style={styles.metadataValue}>
                {photo.uploader.firstName} {photo.uploader.lastName}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDeletePhoto}
            style={styles.deleteButton}
            textColor="#d32f2f"
          >
            Delete Photo
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageCard: {
    margin: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 300,
  },
  detailsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  descriptionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  metadataCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  assetTag: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationChip: {
    alignSelf: 'flex-start',
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  descriptionInput: {
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    marginLeft: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    borderColor: '#d32f2f',
  },
});

export default PhotoDetailScreen;
