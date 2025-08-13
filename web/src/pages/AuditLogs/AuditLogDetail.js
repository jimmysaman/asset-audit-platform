import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { auditLogApi } from '../../services/api';

const AuditLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditLog, setAuditLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogDetails();
  }, [id]);

  const fetchAuditLogDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await auditLogApi.getById(id);
      setAuditLog(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit log details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/audit-logs');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'error';
      case 'login':
        return 'primary';
      case 'logout':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderValueComparison = (previousValues, newValues) => {
    if (!previousValues && !newValues) return null;

    const prevKeys = previousValues ? Object.keys(previousValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const allKeys = [...new Set([...prevKeys, ...newKeys])];

    if (allKeys.length === 0) return null;

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Field</strong></TableCell>
              <TableCell><strong>Previous Value</strong></TableCell>
              <TableCell><strong>New Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allKeys.map((key) => {
              const prevValue = previousValues?.[key];
              const newValue = newValues?.[key];
              const hasChanged = prevValue !== newValue;

              return (
                <TableRow key={key} sx={{ backgroundColor: hasChanged ? 'action.hover' : 'inherit' }}>
                  <TableCell component="th" scope="row">
                    {key}
                  </TableCell>
                  <TableCell>
                    {prevValue !== undefined ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: hasChanged ? 'error.main' : 'text.primary',
                          textDecoration: hasChanged ? 'line-through' : 'none',
                        }}
                      >
                        {typeof prevValue === 'object' ? JSON.stringify(prevValue) : String(prevValue)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {newValue !== undefined ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: hasChanged ? 'success.main' : 'text.primary',
                          fontWeight: hasChanged ? 'bold' : 'normal',
                        }}
                      >
                        {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!auditLog) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Audit log not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ textDecoration: 'none' }}
        >
          Audit Logs
        </Link>
        <Typography color="text.primary">Log #{auditLog.id.slice(-8)}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Audit Log Details
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Log ID: {auditLog.id}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Audit Logs
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Action Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Action
                    </Typography>
                    <Chip
                      label={auditLog.action}
                      color={getActionColor(auditLog.action)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Entity Type
                    </Typography>
                    <Typography variant="body1">{auditLog.entityType}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Entity ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {auditLog.entityId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(auditLog.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {auditLog.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {auditLog.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Value Changes */}
          {(auditLog.previousValues || auditLog.newValues) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Value Changes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {renderValueComparison(auditLog.previousValues, auditLog.newValues)}
            </Paper>
          )}

          {/* Metadata */}
          {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                  {JSON.stringify(auditLog.metadata, null, 2)}
                </pre>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* User and System Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {auditLog.userId || 'System'}
                </Typography>
              </Box>
            </Box>

            {auditLog.user && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  User Name
                </Typography>
                <Typography variant="body1">
                  {auditLog.user.firstName} {auditLog.user.lastName}
                </Typography>
              </Box>
            )}

            {auditLog.user && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">
                  {auditLog.user.username}
                </Typography>
              </Box>
            )}

            {auditLog.user && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {auditLog.user.role?.name || 'N/A'}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {auditLog.ipAddress && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ComputerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    IP Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {auditLog.ipAddress}
                  </Typography>
                </Box>
              </Box>
            )}

            {auditLog.userAgent && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {auditLog.userAgent}
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDateTime(auditLog.createdAt)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditLogDetail;
