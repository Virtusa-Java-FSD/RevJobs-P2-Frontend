import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, FormControlLabel, Switch } from '@mui/material';
import { jobAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateJob: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    remote: false,
    experienceLevel: 'INTERMEDIATE',
    salaryMin: '',
    salaryMax: '',
    applicationDeadline: '',
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.companyName || !formData.description || !formData.location) {
      alert('Please fill in all required fields (Title, Company, Description, Location)');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const jobData = {
        title: formData.title,
        companyName: formData.companyName,
        description: stripHtmlTags(formData.description),
        location: formData.location,
        remote: formData.remote,
        experienceLevel: formData.experienceLevel,
        requirements: requirements.length > 0 ? requirements : ['Not specified'],
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        applicationDeadline: formData.applicationDeadline || null,
        recruiterId: user.id
      };

      const result = await jobAPI.createJob(jobData);
      alert('✅ Job posted successfully! Job seekers can now see and apply.');

      // Navigate based on role
      if (user.role === 'RECRUITER') {
        navigate('/employer/dashboard');
      } else {
        navigate('/recruiter/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      alert('❌ ' + (error.message || 'Failed to create job. Please ensure backend is running on port 9090.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Professional Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          py: 4,
          mb: 4
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              mb: 2
            }}
          >
            Post New Job
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Create a new job posting to attract top talent
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        <Card sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                margin="normal"
                required
                placeholder="e.g., Google, Microsoft, Amazon"
              />

              <TextField
                fullWidth
                label="Job Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                margin="normal"
                required
                multiline
                rows={6}
                placeholder="Describe the job role, responsibilities, and requirements..."
              />

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                margin="normal"
                required
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.remote}
                    onChange={(e) => handleChange('remote', e.target.checked)}
                  />
                }
                label="Remote Position"
                sx={{ mt: 2, mb: 2 }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={formData.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                >
                  <MenuItem value="ENTRY">Entry Level</MenuItem>
                  <MenuItem value="INTERMEDIATE">Mid Level</MenuItem>
                  <MenuItem value="SENIOR">Senior Level</MenuItem>
                  <MenuItem value="EXECUTIVE">Executive</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" gap={2}>
                <TextField
                  label="Minimum Salary"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleChange('salaryMin', e.target.value)}
                  margin="normal"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Maximum Salary"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleChange('salaryMax', e.target.value)}
                  margin="normal"
                  sx={{ flex: 1 }}
                />
              </Box>

              <TextField
                fullWidth
                label="Application Deadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => handleChange('applicationDeadline', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Requirements & Skills
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <TextField
                    label="Add requirement"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    sx={{ flex: 1 }}
                  />
                  <Button onClick={addRequirement} variant="outlined">
                    Add
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      onDelete={() => removeRequirement(req)}
                    />
                  ))}
                </Box>
              </Box>

              <Box mt={4} display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#1e40af' } }}
                >
                  {loading ? '🔄 Posting...' : '🚀 Post Job'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/employer/dashboard')}
                  size="large"
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CreateJob;