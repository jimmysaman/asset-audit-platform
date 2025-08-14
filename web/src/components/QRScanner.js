import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  CenterFocusStrong as FocusIcon,
} from '@mui/icons-material';

const QRScanner = ({ open, onClose, onScan, title = "Scan QR Code" }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);

  const startScanner = async () => {
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

      // Request camera access with back camera preference
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Start QR code detection
      startQRDetection();

    } catch (err) {
      console.error('Scanner error:', err);
      setError(err.message || 'Failed to access camera');
    } finally {
      setLoading(false);
    }
  };

  const startQRDetection = () => {
    // Simple QR detection simulation
    // In a real implementation, you'd use a library like jsQR or qr-scanner
    const detectQR = () => {
      if (!videoRef.current || !stream) return;

      // Simulate QR detection
      // This is a placeholder - you'd implement actual QR detection here
      setTimeout(() => {
        if (Math.random() > 0.95) { // 5% chance to simulate finding a QR code
          const mockQRData = 'ASSET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
          handleQRDetected(mockQRData);
        } else if (stream && videoRef.current) {
          detectQR(); // Continue scanning
        }
      }, 100);
    };

    detectQR();
  };

  const handleQRDetected = (data) => {
    onScan(data);
    handleClose();
  };

  const toggleFlash = async () => {
    if (!stream) return;

    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleQRDetected(manualCode.trim());
    }
  };

  const handleClose = () => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setError('');
    setManualEntry(false);
    setManualCode('');
    setFlashEnabled(false);
    onClose();
  };

  useEffect(() => {
    if (open && !manualEntry) {
      startScanner();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, manualEntry]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          bgcolor: manualEntry ? 'background.paper' : 'black',
          color: manualEntry ? 'text.primary' : 'white',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: manualEntry ? 'background.paper' : 'rgba(0,0,0,0.8)',
        color: manualEntry ? 'text.primary' : 'white'
      }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton 
          onClick={handleClose} 
          sx={{ color: manualEntry ? 'text.primary' : 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: manualEntry ? 3 : 0, 
        bgcolor: manualEntry ? 'background.paper' : 'black' 
      }}>
        {manualEntry ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter the asset tag or QR code manually:
            </Typography>
            <TextField
              fullWidth
              label="Asset Tag / QR Code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g., ASSET-001, LAP001, etc."
              autoFocus
              margin="normal"
            />
          </Box>
        ) : (
          <>
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
                <Typography sx={{ ml: 2, color: 'white' }}>Starting scanner...</Typography>
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

                {/* Scanner overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  border: '2px solid #fff',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FocusIcon sx={{ color: 'white', fontSize: 40, opacity: 0.7 }} />
                </Box>

                {/* Controls overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <IconButton
                    onClick={toggleFlash}
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.5)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    {flashEnabled ? <FlashOffIcon /> : <FlashOnIcon />}
                  </IconButton>
                </Box>

                {/* Instructions */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  textAlign: 'center',
                }}>
                  <Typography variant="body2" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.7)', p: 1, borderRadius: 1 }}>
                    Point camera at QR code or barcode
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        bgcolor: manualEntry ? 'background.paper' : 'rgba(0,0,0,0.8)', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Button 
          onClick={() => setManualEntry(!manualEntry)}
          sx={{ color: manualEntry ? 'primary.main' : 'white' }}
        >
          {manualEntry ? 'Use Camera' : 'Manual Entry'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleClose} 
            sx={{ color: manualEntry ? 'text.primary' : 'white' }}
          >
            Cancel
          </Button>
          {manualEntry && (
            <Button
              onClick={handleManualSubmit}
              variant="contained"
              disabled={!manualCode.trim()}
            >
              Submit
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;
