import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Surface,
} from 'react-native-paper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { assetApi } from '../../services/api';

const { width, height } = Dimensions.get('window');

const AssetScanScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    return () => {
      setScanning(false);
    };
  }, []);

  const onSuccess = async (e) => {
    if (!scanning || loading) return;

    const scannedData = e.data;
    
    // Prevent duplicate scans
    if (lastScan === scannedData) return;
    setLastScan(scannedData);

    // Vibrate on successful scan
    Vibration.vibrate(100);
    
    setScanning(false);
    setLoading(true);

    try {
      // Try to find asset by scanned code
      const response = await assetApi.scan(scannedData);
      
      if (response.data) {
        // Asset found, navigate to asset detail
        navigation.navigate('AssetDetail', { 
          assetId: response.data.id,
          scannedTag: scannedData 
        });
      } else {
        // Asset not found
        Alert.alert(
          'Asset Not Found',
          `No asset found with tag: ${scannedData}`,
          [
            {
              text: 'Scan Again',
              onPress: () => {
                setScanning(true);
                setLastScan(null);
              },
            },
            {
              text: 'Cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Scan error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to scan asset';
      
      Alert.alert(
        'Scan Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanning(true);
              setLastScan(null);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Manual Entry',
      'Enter asset tag manually:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Search',
          onPress: async (assetTag) => {
            if (assetTag && assetTag.trim()) {
              setLoading(true);
              try {
                const response = await assetApi.scan(assetTag.trim());
                if (response.data) {
                  navigation.navigate('AssetDetail', { 
                    assetId: response.data.id,
                    scannedTag: assetTag.trim()
                  });
                } else {
                  setSnackbarMessage(`No asset found with tag: ${assetTag}`);
                  setSnackbarVisible(true);
                }
              } catch (error) {
                setSnackbarMessage('Failed to find asset');
                setSnackbarVisible(true);
              } finally {
                setLoading(false);
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Scanning asset...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={flashOn ? 'torch' : 'off'}
          showMarker={true}
          markerStyle={styles.marker}
          cameraStyle={styles.camera}
          topContent={
            <View style={styles.topContent}>
              <Text style={styles.instructionText}>
                Point your camera at the QR code or barcode
              </Text>
            </View>
          }
          bottomContent={
            <View style={styles.bottomContent}>
              <View style={styles.controlsContainer}>
                <IconButton
                  icon={flashOn ? 'flash-on' : 'flash-off'}
                  size={30}
                  iconColor="white"
                  style={styles.controlButton}
                  onPress={toggleFlash}
                />
                
                <Button
                  mode="contained"
                  onPress={handleManualEntry}
                  style={styles.manualButton}
                  labelStyle={styles.manualButtonText}
                >
                  Manual Entry
                </Button>
                
                <IconButton
                  icon="close"
                  size={30}
                  iconColor="white"
                  style={styles.controlButton}
                  onPress={() => navigation.goBack()}
                />
              </View>
              
              <Surface style={styles.instructionCard}>
                <Text style={styles.instructionCardText}>
                  Align the QR code or barcode within the frame
                </Text>
              </Surface>
            </View>
          }
        />
      ) : (
        <View style={styles.pausedContainer}>
          <Icon name="qr-code-scanner" size={80} color="#666" />
          <Text style={styles.pausedText}>Scanner Paused</Text>
          <Button
            mode="contained"
            onPress={() => {
              setScanning(true);
              setLastScan(null);
            }}
            style={styles.resumeButton}
          >
            Resume Scanning
          </Button>
        </View>
      )}

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
    backgroundColor: 'black',
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
  camera: {
    height: height,
    width: width,
  },
  marker: {
    borderColor: '#1976d2',
    borderWidth: 2,
    borderRadius: 10,
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  manualButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
  },
  instructionCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
  },
  instructionCardText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  pausedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  pausedText: {
    fontSize: 20,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  resumeButton: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
});

export default AssetScanScreen;
