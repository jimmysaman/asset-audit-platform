import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Card,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Chip,
  Switch,
} from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { photoApi } from '../../services/api';

const { width } = Dimensions.get('window');

const PhotoCaptureScreen = ({ navigation, route }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { assetId, movementId } = route.params || {};

  const imagePickerOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8,
  };

  useEffect(() => {
    if (locationEnabled) {
      getCurrentLocation();
    }
  }, [locationEnabled]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to tag photos with GPS coordinates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions handled differently
  };

  const getCurrentLocation = async () => {
    if (!locationEnabled) return;

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setSnackbarMessage('Location permission denied');
      setSnackbarVisible(true);
      return;
    }

    setGettingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setSnackbarMessage('Failed to get location');
        setSnackbarVisible(true);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const openCamera = () => {
    launchCamera(imagePickerOptions, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const uploadPhoto = async () => {
    if (!selectedImage) {
      setSnackbarMessage('Please select a photo first');
      setSnackbarVisible(true);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'photo.jpg',
      });

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (location && locationEnabled) {
        formData.append('gpsLatitude', location.latitude.toString());
        formData.append('gpsLongitude', location.longitude.toString());
      }

      if (assetId) {
        formData.append('assetId', assetId);
      }

      if (movementId) {
        formData.append('movementId', movementId);
      }

      await photoApi.upload(formData);

      setSnackbarMessage('Photo uploaded successfully');
      setSnackbarVisible(true);

      // Reset form
      setSelectedImage(null);
      setDescription('');

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbarMessage('Failed to upload photo');
      setSnackbarVisible(true);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {selectedImage ? (
          <Card style={styles.imageCard}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.image} />
              <IconButton
                icon="close"
                size={24}
                iconColor="white"
                style={styles.removeButton}
                onPress={removePhoto}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.placeholderCard} onPress={showImagePicker}>
            <Card.Content style={styles.placeholderContent}>
              <Icon name="add-a-photo" size={64} color="#ccc" />
              <Text style={styles.placeholderText}>Tap to add photo</Text>
              <Text style={styles.placeholderSubtext}>
                Take a photo or select from gallery
              </Text>
            </Card.Content>
          </Card>
        )}

        <TextInput
          label={`Description (optional) ${description.length}/500`}
          value={description}
          onChangeText={(text) => {
            if (text.length <= 500) {
              setDescription(text);
            }
          }}
          mode="outlined"
          style={styles.descriptionInput}
          multiline
          numberOfLines={3}
          placeholder="Describe what's in this photo, its condition, location, or any relevant details..."
          disabled={uploading}
          maxLength={500}
        />

        <Card style={styles.locationCard}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>Location Information</Text>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                disabled={uploading}
              />
            </View>

            {locationEnabled && (
              <View style={styles.locationInfo}>
                {gettingLocation ? (
                  <View style={styles.locationLoading}>
                    <ActivityIndicator size="small" />
                    <Text style={styles.locationText}>Getting location...</Text>
                  </View>
                ) : location ? (
                  <View>
                    <Chip icon="map-marker" style={styles.locationChip}>
                      {`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                    </Chip>
                    <Text style={styles.accuracyText}>
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </Text>
                    <Button
                      mode="text"
                      onPress={getCurrentLocation}
                      disabled={uploading}
                      style={styles.refreshLocationButton}
                    >
                      Refresh Location
                    </Button>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.noLocationText}>No location available</Text>
                    <Button
                      mode="text"
                      onPress={getCurrentLocation}
                      disabled={uploading}
                      style={styles.refreshLocationButton}
                    >
                      Get Location
                    </Button>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          {selectedImage ? (
            <>
              <Button
                mode="outlined"
                onPress={showImagePicker}
                style={styles.button}
                disabled={uploading}
              >
                Change Photo
              </Button>
              <Button
                mode="contained"
                onPress={uploadPhoto}
                style={styles.button}
                disabled={uploading}
                loading={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={showImagePicker}
              style={styles.button}
              icon="camera"
            >
              Add Photo
            </Button>
          )}
        </View>

        {assetId && (
          <Text style={styles.contextText}>
            Photo will be associated with the selected asset
          </Text>
        )}

        {movementId && (
          <Text style={styles.contextText}>
            Photo will be associated with the selected movement
          </Text>
        )}
      </View>

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
  content: {
    flex: 1,
    padding: 16,
  },
  imageCard: {
    marginBottom: 16,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: width * 0.75,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  placeholderCard: {
    marginBottom: 16,
    elevation: 2,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  placeholderContent: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionInput: {
    marginBottom: 16,
  },
  locationCard: {
    marginBottom: 16,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationInfo: {
    marginTop: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    color: '#666',
  },
  locationChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  noLocationText: {
    color: '#666',
    marginBottom: 8,
  },
  refreshLocationButton: {
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  contextText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PhotoCaptureScreen;
