import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Visibility, People, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds for faster updates
    const interval = setInterval(fetchData, 5000);
    
    // Listen for job created events and application events
    const handleJobCreated = () => fetchData();
    const handleApplicationSubmitted = () => {
      console.log('Application submitted event received, refreshing...');
      setTimeout(fetchData, 1000); // Delay to ensure backend processing
    };
    
    window.addEventListener('jobCreated', handleJobCreated);
    window.addEventListener('applicationSubmitted', handleApplicationSubmitted);
    window.addEventListener('applicationStatusChanged', handleApplicationSubmitted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('jobCreated', handleJobCreated);
      window.removeEventListener('applicationSubmitted', handleApplicationSubmitted);
      window.removeEventListener('applicationStatusChanged', handleApplicationSubmitted);
    };
  }, []);

  const fetchData = async () => {
    try {
      const jobsData = await jobAPI.getJobsByRecruiter();
      console.log('Employer jobs:', jobsData);
      setJobs(jobsData);
      
      // Fetch real applications for employer's jobs
      const allApplications: any[] = [];
      for (const job of jobsData) {
        try {
          const jobApplications = await applicationAPI.getApplicationsByJob(job.id);
          console.log(`Applications for job ${job.id}:`, jobApplications);
          allApplications.push(...jobApplications.map((app: any) => ({
            ...app,
            jobTitle: job.title,
            companyName: job.companyName
          })));
        } catch (error) {
          console.error(`Error fetching applications for job ${job.id}:`, error);
        }
      }
      console.log('Total applications found:', allApplications);
      
      // Try backend aggregator endpoint via API gateway if available, otherwise rely on per-job fetch
      try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (response.ok) {
          const apiResponse = await response.json();
          const allApps = apiResponse.data || apiResponse;
          const employerApps = allApps.filter((app: any) =>
            jobsData.some((job: any) => job.id === app.job?.id)
          );
          console.log('Gateway applications found:', employerApps);

          // Merge with existing applications, avoiding duplicates
          const existingIds = new Set(allApplications.map(app => app.id));
          const newApps = employerApps.filter((app: any) => !existingIds.has(app.id));
          allApplications.push(...newApps);
        }
      } catch (error) {
        console.error('Gateway applications fetch failed, using per-job data only:', error);
      }
      
      // Sort by date (newest first)
      const sortedApplications = allApplications.sort((a: any, b: any) => {
        const dateA = new Date(a.appliedDate || 0).getTime();
        const dateB = new Date(b.appliedDate || 0).getTime();
        return dateB - dateA;
      });
      
      setApplications(sortedApplications);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const application = applications.find(app => app.id === applicationId);
        
        // Create notification for job seeker
        if (application) {
          const notifications = JSON.parse(localStorage.getItem(`notifications_${application.applicantEmail}`) || '[]');
          notifications.push({
            id: Date.now().toString(),
            type: newStatus === 'SHORTLISTED' ? 'accepted' : 'rejected',
            from: user?.email,
            message: `Your application for "${application.jobTitle}" has been ${newStatus.toLowerCase()} by ${application.companyName || 'the company'}`,
            timestamp: new Date().toISOString(),
            read: false
          });
          localStorage.setItem(`notifications_${application.applicantEmail}`, JSON.stringify(notifications));
          
          // Create conversation if shortlisted
          if (newStatus === 'SHORTLISTED') {
            const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
            const conversationId = `${application.applicantEmail}_${application.companyName || 'Company'}_${applicationId}`;
            
            const existingConv = conversations.find((c: any) => c.id === conversationId);
            if (!existingConv) {
              conversations.push({
                id: conversationId,
                participants: [application.applicantEmail, user?.email],
                companyName: application.companyName || 'Company',
                jobTitle: application.jobTitle,
                status: 'ACCEPTED',
                lastMessage: 'Conversation started',
                lastMessageTime: new Date().toISOString()
              });
              localStorage.setItem('conversations', JSON.stringify(conversations));
              
              // Send initial message
              const initialMessage = {
                id: Date.now().toString(),
                conversationId: conversationId,
                sender: user?.email,
                content: `Congratulations! Your application for ${application.jobTitle} has been shortlisted by ${application.companyName || 'our company'}. We'd like to discuss the next steps with you.`,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem(`messages_${conversationId}`, JSON.stringify([initialMessage]));
            }
          }
        }
        
        alert(`✅ Application ${newStatus.toLowerCase()} successfully! ${newStatus === 'SHORTLISTED' ? 'Conversation created with candidate.' : ''}`);
        
        // Trigger event for job seeker's Applications page to refresh
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { 
          detail: { applicationId, newStatus, applicantEmail: application?.applicantEmail } 
        }));
        
        fetchData();
      } else {
        alert('❌ Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
            Recruiter Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            Manage your job postings and applications
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Work sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{jobs.length}</Typography>
                <Typography color="text.secondary">Active Jobs</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <People sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4">{applications.length}</Typography>
                <Typography color="text.secondary">Total Applications</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Visibility sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4">
                  {jobs.reduce((sum, job) => sum + (job as any).views || 0, 0)}
                </Typography>
                <Typography color="text.secondary">Total Views</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>



      {/* Posted Jobs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Posted Jobs
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {loading ? (
              <Typography>Loading jobs...</Typography>
            ) : jobs.length === 0 ? (
              <Box textAlign="center" width="100%" py={4}>
                <Typography variant="h6" color="text.secondary">
                  No jobs posted yet
                </Typography>
              </Box>
            ) : (
              jobs.map((job) => (
                <Box key={job.id} sx={{ flex: '1 1 300px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {job.location} • {job.experienceLevel}
                      </Typography>
                      <Box display="flex" justifyContent="between" alignItems="center">
                        <Chip
                          label={job.status || 'ACTIVE'}
                          color={job.status === 'ACTIVE' ? 'success' : 'default'}
                          size="small"
                        />
                        <Button
                          size="small"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployerDashboard;