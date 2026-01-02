import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Grid, Divider, Alert, Container } from '@mui/material';
import { LocationOn, Work, AttachMoney, CalendarToday, Business, Share, Bookmark, CloudUpload } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import { Job } from '../../types';
import { jobAPI, applicationAPI, messageAPI, savedJobAPI, API_BASE_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const jobData = await jobAPI.getJobById(id!);
      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      alert('Please log in to apply');
      return;
    }

    if (!job || (!resumeUrl.trim() && !resumeFile)) {
      alert('Please provide your resume URL or upload a PDF file');
      return;
    }

    setApplying(true);
    try {
      let finalResumeUrl = resumeUrl;



      // Handle file upload if file selected
      if (resumeFile) {
        try {
          setUploading(true);
          const rawPath = await applicationAPI.uploadResume(resumeFile);
          finalResumeUrl = `${API_BASE_URL}${rawPath}`;
          setUploading(false);
        } catch (error) {
          setUploading(false);
          setApplying(false);
          console.error('File upload error:', error);
          alert('Failed to upload resume file. Please try again.');
          return;
        }
      }

      // Save resume to profile
      if (user?.email) {
        const savedProfile = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
        if (finalResumeUrl) {
          savedProfile.resumeUrl = finalResumeUrl;
        }
        localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(savedProfile));
      }

      const result = await applicationAPI.apply(parseInt(job.id), `Resume provided`, finalResumeUrl, job.companyName, job.title);

      // Store application in localStorage as backup
      const appliedJobs = JSON.parse(localStorage.getItem(`appliedJobs_${user.email}`) || '[]');
      const newApplication = {
        id: Date.now(),
        job: {
          id: job.id,
          title: job.title,
          companyName: job.companyName,
          location: job.location
        },
        appliedDate: new Date().toISOString(),
        status: 'PENDING',
        coverLetter: `CV: ${finalResumeUrl}`
      };
      appliedJobs.push(newApplication);
      localStorage.setItem(`appliedJobs_${user.email}`, JSON.stringify(appliedJobs));

      // Get recruiter email from job - use the actual job poster's email
      const recruiterEmail = job.recruiterEmail || 'sravanir826@gmail.com';

      // Send initial message via API
      if (user?.id && job.recruiterId) {
        try {
          await messageAPI.sendMessage({
            senderId: user.id,
            receiverId: job.recruiterId,
            content: `Hi, I have applied for the ${job.title} position at ${job.companyName}. Resume: ${finalResumeUrl}. Looking forward to hearing from you!`,
            applicationId: newApplication.id
          });
        } catch (msgError) {
          console.error('Failed to send initial message', msgError);
          // Don't block application success
        }
      }

      // Send notification to recruiter
      const recruiterNotifications = JSON.parse(localStorage.getItem(`notifications_${recruiterEmail}`) || '[]');
      recruiterNotifications.push({
        id: Date.now().toString(),
        type: 'application',
        from: user?.email,
        message: `New application from ${user?.email} for ${job.title}`,
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem(`notifications_${recruiterEmail}`, JSON.stringify(recruiterNotifications));

      setApplyDialogOpen(false);
      setResumeUrl('');
      setResumeFile(null);
      setApplied(true);

      // Trigger events for all relevant pages to refresh
      window.dispatchEvent(new CustomEvent('applicationSubmitted'));

      // Force refresh multiple times to ensure all dashboards update
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('applicationSubmitted'));
        window.dispatchEvent(new CustomEvent('applicationStatusChanged'));
      }, 1000);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('applicationSubmitted'));
      }, 3000);

      alert('Application submitted! Conversation created with recruiter. Check Applications page to track status.');
    } catch (error: any) {
      console.error('Error applying:', error);
      alert(' ' + (error.message || 'Failed to submit application. Please try again.'));
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Job link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please log in to save jobs');
      return;
    }

    try {
      if (saved) {
        // Unsave
        await savedJobAPI.unsaveJob(user.id, parseInt(job!.id));
        setSaved(false);
        alert('Job removed from saved list');
      } else {
        // Save
        await savedJobAPI.saveJob(user.id, parseInt(job!.id));
        setSaved(true);
        alert('Job saved successfully!');
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      alert('Failed to update saved status');
    }
  };

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (job && user) {
        try {
          const apps = await applicationAPI.getMyApplications();
          const hasApplied = apps.some((app: any) => (app.jobId || app.job?.id) === parseInt(job.id));
          setApplied(hasApplied);
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };

    checkApplicationStatus();
    checkSavedStatus();
  }, [job, user]);

  const checkSavedStatus = async () => {
    if (job && user) {
      try {
        const isSaved = await savedJobAPI.isSaved(user.id, parseInt(job.id));
        setSaved(isSaved);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!job) return (
    <Box textAlign="center" py={8}>
      <Typography variant="h5" gutterBottom>Job not found</Typography>
      <Typography color="text.secondary">The job you're looking for doesn't exist or has been removed.</Typography>
    </Box>
  );

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="lg">
        {applied && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Application submitted successfully! We'll notify you about the next steps.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="between" alignItems="start" mb={3}>
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {job.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Business color="primary" />
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {job.companyName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<Share />} size="small" onClick={handleShare}>
                      Share
                    </Button>
                    <Button
                      variant={saved ? "contained" : "outlined"}
                      startIcon={<Bookmark />}
                      size="small"
                      onClick={handleSave}
                    >
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={2}>
                      <LocationOn color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Location</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {job.location} {job.remote && '(Remote)'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={2}>
                      <Work color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                        <Typography variant="body1" fontWeight={500}>{job.experienceLevel}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={2}>
                      <AttachMoney color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Salary</Typography>
                        <Typography variant="body1" fontWeight={500}>{formatSalary(job.salaryMin, job.salaryMax)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1} p={2} bgcolor="grey.50" borderRadius={2}>
                      <CalendarToday color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Posted</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(job.postedDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Required Skills
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                  {job.requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      variant="outlined"
                      sx={{
                        bgcolor: 'primary.50',
                        borderColor: 'primary.200',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>

                {job.applicationDeadline && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                {user?.role === 'JOB_SEEKER' && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setApplyDialogOpen(true)}
                    disabled={applied}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: applied ? '#4ecdc4' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      '&:hover': {
                        background: applied ? '#4ecdc4' : 'linear-gradient(135deg, #ee5a24 0%, #c44569 100%)',
                        transform: applied ? 'none' : 'translateY(-2px)'
                      }
                    }}
                  >
                    {applied ? 'Application Submitted' : 'Apply Now'}
                  </Button>
                )}

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Job Details
                </Typography>
                <Box sx={{ '& > div': { mb: 2 } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Job Type</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {job.remote ? 'Remote' : 'On-site'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Experience Level</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.experienceLevel}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={job.status}
                      size="small"
                      sx={{
                        backgroundColor: job.status === 'ACTIVE' ? '#2e7d32 !important' : '#757575 !important',
                        color: '#ffffff !important',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          color: '#ffffff !important'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Apply Dialog */}
        <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>Resume URL</Typography>
              <TextField
                fullWidth
                placeholder="https://drive.google.com/your-resume-link"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                helperText="Paste your Google Drive, Dropbox, or LinkedIn resume link"
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>OR</Typography>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 1 }}
                >
                  Upload Resume PDF
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          alert('Please upload a PDF file only');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size should be less than 5MB');
                          return;
                        }
                        setResumeFile(file);
                        setResumeUrl(''); // Clear URL if file is uploaded
                      }
                    }}
                  />
                </Button>
                {resumeFile && (
                  <Typography variant="body2" color="success.main">
                    📄 {resumeFile.name} selected
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
            <Button
              onClick={handleApply}
              variant="contained"
              disabled={applying || uploading || (!resumeUrl.trim() && !resumeFile)}
              sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ee5a24 0%, #c44569 100%)'
                }
              }}
            >
              {applying ? (uploading ? 'Uploading...' : 'Applying...') : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default JobDetail;