import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { reportApi } from '../../services/api';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [generateReportDialog, setGenerateReportDialog] = useState({
    open: false,
    type: '',
    title: '',
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportApi.getReports({
        search: searchTerm,
        type: reportType,
        startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
        endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined,
      });
      setReports(response.data.reports);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = () => {
    fetchReports();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchReports();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setReportType('');
    setDateRange({
      startDate: null,
      endDate: null,
    });
    fetchReports();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadReport = async (reportId, reportName) => {
    try {
      setExportLoading(true);
      const response = await reportApi.downloadReport(reportId);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'Report downloaded successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error downloading report:', err);
      setSnackbar({
        open: true,
        message: 'Failed to download report',
        severity: 'error',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleOpenGenerateDialog = (type) => {
    let title = '';
    switch (type) {
      case 'asset':
        title = 'Generate Asset Report';
        break;
      case 'movement':
        title = 'Generate Movement Report';
        break;
      case 'discrepancy':
        title = 'Generate Discrepancy Report';
        break;
      case 'audit':
        title = 'Generate Audit Report';
        break;
      default:
        title = 'Generate Report';
    }

    setGenerateReportDialog({
      open: true,
      type,
      title,
    });
  };

  const handleCloseGenerateDialog = () => {
    setGenerateReportDialog({
      ...generateReportDialog,
      open: false,
    });
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await reportApi.generateReport({
        type: generateReportDialog.type,
        startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
        endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined,
      });

      setSnackbar({
        open: true,
        message: 'Report generated successfully',
        severity: 'success',
      });

      // Close dialog and refresh reports list
      handleCloseGenerateDialog();
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      setSnackbar({
        open: true,
        message: 'Failed to generate report',
        severity: 'error',
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getReportTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'asset':
        return <TableChartIcon />;
      case 'movement':
        return <BarChartIcon />;
      case 'discrepancy':
        return <PieChartIcon />;
      case 'audit':
        return <DescriptionIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenGenerateDialog('asset')}
          >
            Asset Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenGenerateDialog('movement')}
          >
            Movement Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenGenerateDialog('discrepancy')}
          >
            Discrepancy Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenGenerateDialog('audit')}
          >
            Audit Report
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            label="Search Reports"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type"
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="asset">Asset</MenuItem>
              <MenuItem value="movement">Movement</MenuItem>
              <MenuItem value="discrepancy">Discrepancy</MenuItem>
              <MenuItem value="audit">Audit</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />

            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear All
            </Button>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No reports found</Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Try generating a new report or adjusting your search filters.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getReportTypeIcon(report.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {report.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Type: {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Generated: {formatDate(report.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Period: {formatDate(report.startDate)} - {formatDate(report.endDate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {report.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleDownloadReport(report.id, report.name)}
                    disabled={exportLoading}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Generate Report Dialog */}
      <Dialog open={generateReportDialog.open} onClose={handleCloseGenerateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{generateReportDialog.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Select the date range for your report:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGenerateDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            startIcon={generatingReport ? <CircularProgress size={20} /> : null}
          >
            {generatingReport ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportList;