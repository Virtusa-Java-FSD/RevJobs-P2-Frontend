import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Visibility, Message, Delete, TrendingUp, Schedule, CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { applicationAPI, jobAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Applications: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      console.log('User logged in, fetching applications for:', user.email);
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      if (user?.email) {
        fetchApplications();
      }
    }, 10000);

    // Listen for status change events
    const handleStatusChange = () => {
      console.log('Status changed, refreshing applications...');
      fetchApplications();
    };

    // Listen for new applications
    const handleNewApplication = () => {
      console.log('New application submitted, refreshing...');
      setLoading(true);
      setTimeout(() => {
        fetchApplications();
      }, 1000);
      setTimeout(() => {
        fetchApplications();
      }, 3000);
    };

    window.addEventListener('applicationStatusChanged', handleStatusChange);
    window.addEventListener('applicationSubmitted', handleNewApplication);

    return () => {
      clearInterval(interval);
      window.removeEventListener('applicationStatusChanged', handleStatusChange);
      window.removeEventListener('applicationSubmitted', handleNewApplication);
    };
  }, []);

  const fetchApplications = async () => {
    if (!user?.email) {
      console.log('No user email, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching applications for user:', user?.email);

      // Fetch applications and jobs in parallel for enrichment
      const [appData, jobsData] = await Promise.all([
        applicationAPI.getMyApplications(),
        jobAPI.getJobs().catch(e => [])
      ]);

      console.log('API Response:', appData);

      let enrichedApps = appData;

      // Enrich with job details if available
      if (Array.isArray(jobsData) && jobsData.length > 0) {
        const jobMap = new Map(jobsData.map((j: any) => [j.id, j]));

        enrichedApps = appData.map((app: any) => {
          const jobId = app.jobId || app.job?.id;
          const job = jobMap.get(typeof jobId === 'string' ? parseInt(jobId) : jobId);

          if (job) {
            return {
              ...app,
              jobTitle: app.jobTitle || job.title,
              companyName: app.companyName || job.companyName,
              // Ensure nested job object is also populated for components that might use it
              job: {
                ...(app.job || {}),
                ...job
              }
            };
          }
          return app;
        });
      }

      if (Array.isArray(enrichedApps) && enrichedApps.length > 0) {
        const sortedApps = enrichedApps.sort((a: any, b: any) => {
          const dateA = new Date(a.appliedDate || 0).getTime();
          const dateB = new Date(b.appliedDate || 0).getTime();
          return dateB - dateA;
        });
        setApplications(sortedApps);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('API Error, failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'info';
      case 'REVIEWED': return 'warning';
      case 'SHORTLISTED': return 'success';
      case 'REJECTED': return 'error';
      case 'ACCEPTED': return 'success';
      default: return 'default';
    }
  };

  const getProgress = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 25;
      case 'REVIEWED': return 50;
      case 'SHORTLISTED': return 75;
      case 'ACCEPTED': return 100;
      case 'REJECTED': return 0;
      default: return 25;
    }
  };

  // Common styles for Chips to force white text on hover
  const commonChipSx = {
    '&:hover': {
      color: '#ffffff !important',
      '& .MuiChip-label': {
        color: '#ffffff !important'
      }
    }
  };

  const stats = [
    { title: 'Total Applications', value: applications.length, icon: <TrendingUp />, color: 'primary' },
    { title: 'Pending', value: applications.filter(app => app.status === 'PENDING').length, icon: <Schedule />, color: 'info' },
    { title: 'Shortlisted', value: applications.filter(app => app.status === 'SHORTLISTED').length, icon: <CheckCircle />, color: 'success' },
    { title: 'Rejected', value: applications.filter(app => app.status === 'REJECTED').length, icon: <Cancel />, color: 'error' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
            My Applications
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Track your job applications and recruiter responses
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                height: 120,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.1)'
                }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Box sx={{ mr: 2, opacity: 0.8 }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Applications" />
              <Tab label="Active" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : applications.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No applications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start applying to jobs to see them here! Check console for debugging info.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log('Manual refresh clicked');
                    setLoading(true);
                    fetchApplications();
                  }}
                  sx={{ mt: 2 }}
                >
                  Refresh Applications
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Details</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Applied Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Cover Letter & Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {application.jobTitle || application.job?.title || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.job?.location || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {application.companyName || application.job?.companyName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status || 'PENDING'}
                            color={getStatusColor(application.status) as any}
                            size="small"
                            sx={commonChipSx}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getProgress(application.status)}
                              sx={{ height: 8, borderRadius: 4 }}
                              color={getStatusColor(application.status) as any}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {getProgress(application.status)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {application.coverLetter || 'No cover letter'}
                            </Typography>
                            {application.status === 'SHORTLISTED' && (
                              <Chip
                                label="✅ Shortlisted by Recruiter"
                                size="small"
                                color="success"
                                sx={{
                                  mt: 0.5,
                                  ...commonChipSx
                                }}
                              />
                            )}
                            {application.status === 'REJECTED' && (
                              <Chip
                                label="❌ Rejected by Recruiter"
                                size="small"
                                color="error"
                                sx={{
                                  mt: 0.5,
                                  ...commonChipSx
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {applications.filter(app => app.status !== 'REJECTED').map((application) => (
                  <Grid item xs={12} md={6} key={application.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {application.jobTitle || application.job?.title || 'N/A'}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                              {application.companyName || application.job?.companyName || 'N/A'}
                            </Typography>
                          </Box>
                          <Chip
                            label={application.status || 'PENDING'}
                            color={getStatusColor(application.status) as any}
                            size="small"
                            sx={commonChipSx}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                          {application.coverLetter || 'No cover letter provided'}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Applied: {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getProgress(application.status)}
                            sx={{ width: 100, height: 8, borderRadius: 4 }}
                            color={getStatusColor(application.status) as any}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {applications.filter(app => app.status === 'REJECTED' || app.status === 'ACCEPTED').map((application) => (
                  <Grid item xs={12} md={6} key={application.id}>
                    <Card sx={{ height: '100%', opacity: 0.8 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {application.jobTitle || application.job?.title || 'N/A'}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                              {application.companyName || application.job?.companyName || 'N/A'}
                            </Typography>
                          </Box>
                          <Chip
                            label={application.status || 'PENDING'}
                            color={getStatusColor(application.status) as any}
                            size="small"
                            sx={commonChipSx}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                          {application.coverLetter || 'No cover letter'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Applied: {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Card>
      </Box>
    </Box>
  );
};

export default Applications;