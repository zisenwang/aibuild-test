'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import { CloudUpload, Description, CheckCircle } from '@mui/icons-material';
import { uploadExcelFile, type UploadResult } from './actions';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/i)) {
      handleFileChange(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('startDate', startDate);
      formData.append('overwriteExisting', overwriteExisting.toString());

      const uploadResult = await uploadExcelFile(formData);
      setResult(uploadResult);

    } catch (error) {
      setResult({
        success: false,
        error: 'Upload failed: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Data Import
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload Excel files to import product inventory, procurement, and sales data into the system.
      </Typography>

      <Paper sx={{
        p: 4,
        mb: 3,
        // borderRadius: 2
      }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3}}>
          Upload Configuration
        </Typography>
        
        {/* File Drop Zone */}
        <Paper
          sx={{
            display: 'block',
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            bgcolor: dragOver ? 'grey.50' : 'primary.50',
            borderRadius: 2,
            p: 4,
            mb: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50'
            },
          }}
          component="label"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              <Description color="primary" />
              <Box textAlign="left">
                <Typography variant="body1" fontWeight={500}>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(file.size / 1024)} KB • Excel File
                </Typography>
              </Box>
              <CheckCircle color="success" />
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={2}>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Drop Excel file here or click to browse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .xlsx and .xls files
                </Typography>
              </Box>
            </Stack>
          )}
          
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </Paper>

        <Stack spacing={3}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Day 1 columns in your Excel file will be mapped to this date"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography component="span">Overwrite existing data</Typography>
                <Typography variant="body2" color="text.secondary" display="block">
                  Update records if they already exist for the same date and product
                </Typography>
              </Box>
            }
          />

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || loading}
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? 'Processing...' : 'Import Data'}
          </Button>
        </Stack>
      </Paper>

      {result && (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Import Results
          </Typography>
          
          {result.success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                {result.message}
              </Alert>
              
              {result.data && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      File Information
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`File: ${result.data.filename}`} variant="outlined" />
                      <Chip label={`Start Date: ${result.data.startDate}`} variant="outlined" />
                      <Chip label={`Days: ${result.data.totalDays}`} variant="outlined" />
                      <Chip label={`Batch: ${result.data.batchId}`} variant="outlined" />
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Import Statistics
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip 
                        label={`Products: ${result.data.statistics.createdProducts} created, ${result.data.statistics.updatedProducts} updated`}
                        color="primary"
                      />
                      <Chip 
                        label={`Records: ${result.data.statistics.createdMetrics} created, ${result.data.statistics.updatedMetrics} updated`}
                        color="secondary"
                      />
                      <Chip 
                        label={`Total: ${result.data.statistics.totalRecords} records`}
                        color="success"
                      />
                    </Stack>
                  </Box>
                </Stack>
              )}
            </>
          ) : (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {result.error}
              </Alert>
              
              {result.details && result.details.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Error Details
                  </Typography>
                  <Stack spacing={1}>
                    {result.details.map((detail, index) => (
                      <Typography key={index} variant="body2" color="error" sx={{ pl: 2 }}>
                        • {detail}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}