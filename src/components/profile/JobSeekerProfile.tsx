import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, Avatar, Paper, List, ListItem, ListItemText } from '@mui/material';
import { CloudUpload, Add, Delete, Work } from '@mui/icons-material';
import { JobSeeker, Experience } from '../../types';
import { userAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';


const AppliedJobsList: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const applications = await applicationAPI.getMyApplications();
      setAppliedJobs(applications);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  return (
    <Box>
      {appliedJobs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No jobs applied yet. Start applying to see them here!
        </Typography>
      ) : (
        <List>
          {appliedJobs.slice(0, 5).map((application) => (
            <ListItem key={application.id} sx={{ pl: 0 }}>
              <Work sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary={application.job?.title || 'Job Title'}
                secondary={`${application.job?.companyName || 'Company'} • Applied: ${new Date(application.appliedDate).toLocaleDateString()}`}
              />
              <Chip
                label={application.status || 'PENDING'}
                size="small"
                color={application.status === 'SHORTLISTED' ? 'success' : application.status === 'REJECTED' ? 'error' : 'info'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

const JobSeekerProfile: React.FC = () => {
  const [profile, setProfile] = useState<Partial<JobSeeker>>({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    skills: [],
    experience: [],
    expectedSalary: 0,
    profilePicture: '', // Add this field
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (user?.email) {
        const profileData = await userAPI.getProfile();
        // Load local data for persistence
        const localData = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');

        // userAPI returns { ...localProfile, email: user.email }
        // We merge with default structure to ensure all fields exist
        setProfile((prev) => ({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          location: '',
          skills: [],
          experience: [],
          expectedSalary: 0,
          profilePicture: localData.profilePicture || profileData.profilePicture || '',
          resumeUrl: localData.resumeUrl || profileData.resumeUrl || '',
          resumeName: localData.resumeName || profileData.resumeName || '',
          ...profileData,
          ...localData // Ensure local updates take precedence
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      description: '',
    };
    setProfile(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExp]
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience?.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const removeExperience = (id: string) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience?.filter(exp => exp.id !== id) || []
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.email) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Update state
        setProfile(prev => ({ ...prev, profilePicture: base64String }));

        // Save to local storage explicitly to ensure persistence
        const currentData = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
        const updatedData = { ...currentData, profilePicture: base64String };
        localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(updatedData));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('document')) {
        alert('Please upload a PDF or Word document');
        return;
      }
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          // Update state with Base64 URL
          setProfile(prev => ({ ...prev, resumeUrl: base64String, resumeName: file.name }));

          // Persist to local storage similar to profile image
          if (user?.email) {
            const currentData = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
            const updatedData = {
              ...currentData,
              resumeUrl: base64String,
              resumeName: file.name
            };
            localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(updatedData));
          }

          alert('Resume uploaded successfully!');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Error uploading resume. Please try again.');
      }
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        await userAPI.updateProfile(profile);
        alert('✅ Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
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
            My Profile
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Manage your professional information and resume
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Basic Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                hidden
                accept="image/png, image/jpeg, image/jpg, image/gif"
              />
              <Box position="relative">
                <Avatar
                  src={profile.profilePicture}
                  onClick={triggerFileInput}
                  sx={{
                    width: 80,
                    height: 80,
                    cursor: 'pointer',
                    transition: '0.3s',
                    border: '2px solid transparent',
                    '&:hover': {
                      opacity: 0.8,
                      borderColor: 'primary.main',
                      boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {profile.firstName?.charAt(0) || 'U'}
                </Avatar>
                <Box
                  onClick={triggerFileInput}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                    boxShadow: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CloudUpload sx={{ fontSize: 16, color: 'primary.main' }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="h5">
                  {profile.firstName || ''} {profile.lastName || ''}
                </Typography>
                <Typography color="text.secondary">{profile.email || ''}</Typography>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profile.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profile.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profile.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Expected Salary"
                  type="number"
                  value={profile.expectedSalary || 0}
                  onChange={(e) => handleChange('expectedSalary', parseInt(e.target.value))}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resume
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexDirection="column">
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                >
                  Upload Resume
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  or paste URL below
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Resume URL (Google Drive, Dropbox, etc.)"
                value={profile.resumeUrl || ''}
                onChange={(e) => handleChange('resumeUrl', e.target.value)}
                placeholder="https://drive.google.com/your-resume-link"
                sx={{ mt: 1 }}
              />
              {profile.resumeUrl && (
                <Box>
                  <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    📄 Resume: {(profile as any).resumeName || 'Saved from job application'}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(profile.resumeUrl, '_blank')}
                  >
                    📖 View Resume
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="Add skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                sx={{ flex: 1 }}
              />
              <Button onClick={addSkill} variant="outlined">
                Add
              </Button>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              {profile.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => removeSkill(skill)}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Work Experience
              </Typography>
              <Button onClick={addExperience} startIcon={<Add />}>
                Add Experience
              </Button>
            </Box>

            {profile.experience?.map((exp) => (
              <Paper key={exp.id} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    />
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={exp.endDate || ''}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  />
                  <Button
                    onClick={() => removeExperience(exp.id)}
                    startIcon={<Delete />}
                    color="error"
                  >
                    Remove
                  </Button>
                </Box>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {/* Applied Jobs */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Applied Jobs
            </Typography>
            <AppliedJobsList />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={saveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default JobSeekerProfile;