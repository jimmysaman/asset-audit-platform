import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  FlipCameraAndroid as FlipIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const MobileCamera = ({ open, onClose, onCapture, title = "Take Photo" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [location, setLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Check if device supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Get location if enabled
      if (locationEnabled) {
        getCurrentLocation();
      }

    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message || 'Failed to access camera');
    } finally {
      setLoading(false);
    }
  }, [facingMode, stream, locationEnabled]);

  const getCurrentLocation = useCallback(() => {
    if (!locationEnabled || !navigator.geolocation) return;

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
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
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, [locationEnabled]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        // Include location data if available
        const photoData = {
          file,
          location: location,
          timestamp: new Date().toISOString(),
        };

        onCapture(photoData);
        handleClose();
      }
    }, 'image/jpeg', 0.8);
  }, [location, onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const handleClose = useCallback(() => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setError('');
    setLocation(null);
    onClose();
  }, [stream, onClose]);

  // Start camera when dialog opens
  React.useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, startCamera]);

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (open && stream) {
      startCamera();
    }
  }, [facingMode]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
      PaperProps={{
        sx: {
          bgcolor: 'black',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'rgba(0,0,0,0.8)',
        color: 'white'
      }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'black', position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 400,
            bgcolor: 'black'
          }}>
            <CircularProgress sx={{ color: 'white' }} />
            <Typography sx={{ ml: 2, color: 'white' }}>Starting camera...</Typography>
          </Box>
        )}

        {!loading && !error && (
          <Box sx={{ position: 'relative', bgcolor: 'black' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'cover',
              }}
            />

            {/* Camera controls overlay */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}>
              <IconButton
                onClick={switchCamera}
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <FlipIcon />
              </IconButton>
            </Box>

            {/* Location info overlay */}
            {locationEnabled && (
              <Box sx={{
                position: 'absolute',
                bottom: 80,
                left: 16,
                right: 16,
              }}>
                {gettingLocation ? (
                  <Chip
                    icon={<CircularProgress size={16} sx={{ color: 'white' }} />}
                    label="Getting location..."
                    sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                ) : location ? (
                  <Chip
                    icon={<LocationIcon />}
                    label={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                    sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                ) : null}
              </Box>
            )}
          </Box>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>

      <DialogActions sx={{ 
        bgcolor: 'rgba(0,0,0,0.8)', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={locationEnabled}
              onChange={(e) => setLocationEnabled(e.target.checked)}
              sx={{ color: 'white' }}
            />
          }
          label="GPS Location"
          sx={{ color: 'white' }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleClose} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button
            onClick={capturePhoto}
            variant="contained"
            startIcon={<CameraIcon />}
            disabled={loading || !!error}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Capture
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MobileCamera;
