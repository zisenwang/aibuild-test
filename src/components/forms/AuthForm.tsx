'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  TextFieldProps
} from '@mui/material';

export interface AuthField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textFieldProps?: Partial<TextFieldProps>;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: AuthField[];
  submitButtonText: string;
  loadingButtonText?: string;
  footerText?: string;
  onSubmit: (formData: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  initialValues?: Record<string, string>;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  submitButtonText,
  loadingButtonText = 'Processing...',
  footerText,
  onSubmit,
  initialValues = {}
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ 
      ...acc, 
      [field.name]: initialValues[field.name] || '' 
    }), {})
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onSubmit(formData);
      
      if (!result.success) {
        setError(result.error || 'Operation failed');
      }
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={24}
      sx={{
        p: 6,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        width: '100%'
      }}
    >
      <Stack spacing={4} alignItems="center">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </Typography>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              width: '100%',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: 'white',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Stack spacing={3}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={handleChange(field.name)}
                required={field.required !== false}
                variant="outlined"
                sx={{
                  minHeight: '56px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    height: '56px',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00d4ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '16px',
                    padding: '16px 14px',
                  },
                }}
                {...field.textFieldProps}
              />
            ))}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00b8e6, #0088bb)',
                  boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? loadingButtonText : submitButtonText}
            </Button>

            {footerText && (
              <Typography
                variant="caption"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                }}
              >
                {footerText}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}