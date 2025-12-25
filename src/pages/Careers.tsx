import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { LocationOn, Schedule, Send } from '@mui/icons-material';
import { jobAPI } from '../services/api';

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    fetchJobs();
    
    // Real-time updates
    const handleJobCreated = () => fetchJobs();
    window.addEventListener('jobCreated', handleJobCreated);
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchJobs, 10000);
    
    return () => {
      window.removeEventListener('jobCreated', handleJobCreated);
      clearInterval(interval);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getJobs();
      // Sort by date (newest first)
      const sortedJobs = data.sort((a: any, b: any) => {
        const dateA = new Date(a.postedDate || 0).getTime();
        const dateB = new Date(b.postedDate || 0).getTime();
        return dateB - dateA;
      });
      setJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setApplyDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    const applications = JSON.parse(localStorage.getItem('careerApplications') || '[]');
    const newApplication = {
      id: Date.now().toString(),
      jobTitle: selectedJob.title,
      ...applicationData,
      appliedDate: new Date().toISOString(),
      status: 'Applied'
    };
    applications.push(newApplication);
    localStorage.setItem('careerApplications', JSON.stringify(applications));
    
    setApplicationSubmitted(true);
    setTimeout(() => {
      setApplyDialogOpen(false);
      setApplicationSubmitted(false);
      setApplicationData({ name: '', email: '', phone: '', coverLetter: '' });
    }, 2000);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive Salary';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const benefits = [
    { title: 'Competitive Salary', desc: 'Top market rates with equity options' },
    { title: 'Health Benefits', desc: 'Comprehensive medical, dental, and vision' },
    { title: 'Unlimited PTO', desc: 'Take time off when you need it' },
    { title: 'Learning Budget', desc: '$2000 annual learning and development' },
    { title: 'Remote Work', desc: 'Work from anywhere in the world' },
    { title: 'Growth Opportunities', desc: 'Fast career progression and mentorship' }
  ];

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
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'white',
              mb: 2
            }}
          >
            Career Opportunities
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              maxWidth: 800, 
              mx: 'auto', 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400
            }}
          >
            Discover amazing job opportunities from top companies
          </Typography>
        </Box>
      </Box>

      {/* Open Positions */}
      <Box sx={{ py: 6, px: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#212121' }}>
          Latest Job Openings
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 6, color: '#757575' }}>
          Sorted by posting date (newest first)
        </Typography>
        
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography sx={{ fontWeight: 600 }}>Loading opportunities...</Typography>
          </Box>
        ) : jobs.length === 0 ? (
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            No jobs available at the moment. Check back soon!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={4} key={job.id}>
                <Card sx={{ 
                  height: '100%', 
                  backgroundColor: '#ffffff', 
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                        {job.companyName?.[0]?.toUpperCase() || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                          {job.title}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: '#1976d2' }}>
                          {job.companyName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn fontSize="small" sx={{ color: '#757575' }} />
                        <Typography variant="body2" sx={{ color: '#757575' }}>
                          {job.location}
                        </Typography>
                      </Box>
                      {job.remote && (
                        <Chip label="Remote" size="small" color="success" />
                      )}
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" sx={{ color: '#757575' }} />
                        <Typography variant="body2" sx={{ color: '#757575' }}>
                          {job.experienceLevel}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                      {job.requirements?.slice(0, 3).map((req: string, idx: number) => (
                        <Chip key={idx} label={req} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 2 }}>
                      Posted: {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently'}
                    </Typography>

                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleApply(job)}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Benefits */}
      <Box sx={{ py: 6, px: 3, backgroundColor: '#ffffff' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6, color: '#212121' }}>
          Why Work With Us?
        </Typography>
        <Grid container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                p: 3, 
                height: '100%', 
                backgroundColor: '#ffffff', 
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.1)'
                }
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  {benefit.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 6, textAlign: 'center', backgroundColor: '#f8fafc' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
          Ready to Join Us?
        </Typography>
        <Typography variant="h6" sx={{ color: '#757575' }} paragraph>
          Don't see a perfect fit? Send us your resume anyway!
        </Typography>
        <Button variant="contained" size="large" onClick={() => handleApply({ title: 'General Application' })}>
          Send Resume
        </Button>
      </Box>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Apply for {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          {applicationSubmitted ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Application submitted successfully! We'll review your application and get back to you soon.
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={applicationData.name}
                onChange={(e) => setApplicationData(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={applicationData.email}
                onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={applicationData.phone}
                onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Cover Letter"
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                margin="normal"
                placeholder="Tell us why you're interested in this position..."
              />
            </Box>
          )}
        </DialogContent>
        {!applicationSubmitted && (
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitApplication} 
              variant="contained" 
              startIcon={<Send />}
              disabled={!applicationData.name || !applicationData.email}
            >
              Submit Application
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default Careers;