import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip, Avatar, Divider, List, ListItem, ListItemText, Paper } from '@mui/material';
import { Email, Phone, LocationOn, Work, School, Download, Message, PersonAdd } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';


const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCandidateData();
  }, [user, id]);

  const loadCandidateData = async () => {
    if (user?.email) {
      // Fetch identity from backend, merge with local extended details
      const apiData = await userAPI.getProfile();
      const localData = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');

      // Merge: localData overrides backend to show latest user edits
      const profileData = { ...apiData, ...localData };

      const appliedJobs = JSON.parse(localStorage.getItem(`appliedJobs_${user.email}`) || '[]');

      // Load profile image from local storage
      if (profileData.profilePicture) {
        setProfileImage(profileData.profilePicture);
      } else if (profileData.profileImage) {
        // Fallback for previous implementation
        setProfileImage(profileData.profileImage);
      }

      setCandidate({
        id: id || profileData.id || user.id,
        name: `${profileData.firstName || user.firstName || ''} ${profileData.lastName || user.lastName || ''}`.trim() || 'User',
        email: profileData.email || user.email,
        phone: profileData.phone || 'Not provided',
        location: profileData.location || 'Not specified',
        title: profileData.title || 'Job Seeker',
        summary: profileData.summary || 'Professional seeking new opportunities.',
        appliedJobsCount: appliedJobs.length,
        experience: profileData.experience || [],
        education: profileData.education || [],
        skills: profileData.skills || [],
        certifications: profileData.certifications || [],
        languages: profileData.languages || ['English'],
        resumeUrl: profileData.resumeUrl || '#',
        resumeName: profileData.resumeName || '',
        expectedSalary: profileData.expectedSalary || 0
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.email) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);

        // Save to local storage
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

  if (!candidate) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

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
            Candidate Profile
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Detailed candidate information and qualifications
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Button variant="outlined" sx={{ mb: 3 }} onClick={() => window.history.back()}>
          ← Back to Candidates
        </Button>

        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  hidden
                  accept="image/*"
                />
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={profileImage || undefined}
                    onClick={triggerFileInput}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      transition: '0.3s',
                      '&:hover': {
                        opacity: 0.8,
                        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {!profileImage && candidate.name[0]}
                  </Avatar>
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {candidate.name}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {candidate.title}
                </Typography>

                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{candidate.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{candidate.phone}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{candidate.location}</Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} flexDirection="column">
                  <Button variant="contained" startIcon={<Message />} fullWidth>
                    Send Message
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    fullWidth
                    onClick={() => {
                      if (candidate.resumeUrl && candidate.resumeUrl !== '#') {
                        // Open base64 or URL
                        const win = window.open();
                        if (win) {
                          win.document.write(
                            `<iframe src="${candidate.resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                          );
                        }
                      } else {
                        alert('No resume uploaded');
                      }
                    }}
                  >
                    Download Resume
                  </Button>
                  <Button variant="outlined" startIcon={<PersonAdd />} fullWidth>
                    Schedule Interview
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Skills
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {candidate.skills.map((skill, index) => (
                    <Chip key={index} label={skill} variant="outlined" size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Languages
                </Typography>
                {candidate.languages.map((language, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {language}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Detailed Info */}
          <Grid item xs={12} md={8}>
            {/* Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Professional Summary
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {candidate.summary}
                </Typography>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Work sx={{ mr: 1 }} />
                  Work Experience
                </Typography>
                {candidate.experience.map((exp, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {exp.position}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {exp.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {exp.duration}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {exp.description}
                    </Typography>
                    {index < candidate.experience.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <School sx={{ mr: 1 }} />
                  Education
                </Typography>
                {candidate.education.map((edu, index) => (
                  <Box key={index}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {edu.degree}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {edu.institution}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {edu.duration}
                    </Typography>
                    <Typography variant="body2">
                      GPA: {edu.gpa}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Certifications
                </Typography>
                <List>
                  {candidate.certifications.map((cert, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={cert}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CandidateProfile;