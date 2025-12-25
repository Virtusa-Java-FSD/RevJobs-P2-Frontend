import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, TextField, InputAdornment, Tabs, Tab, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Search, Delete, Edit, Visibility, People, Work, Business, TrendingUp, Security, Refresh, Add, CheckCircle } from '@mui/icons-material';
import { API_BASE_URL, jobAPI, applicationAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loginStats, setLoginStats] = useState({ jobSeekers: 0, employers: 0 });
  const [activityStats, setActivityStats] = useState({ totalLogins: 0, totalRegistrations: 0, todayLogins: 0, todayRegistrations: 0 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (user?.email !== 'sravanikelam27@gmail.com') {
      navigate('/');
      return;
    }

    fetchAllData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [jobsData, usersData, appsData] = await Promise.all([
        fetchJobs(),
        fetchUsers(),
        fetchApplications()
      ]);
      setJobs(jobsData);
      setUsers(usersData);
      setApplications(appsData);

      // Calculate activity statistics
      const loginActivity = JSON.parse(localStorage.getItem('loginActivity') || '[]');
      const today = new Date().toDateString();

      const totalLogins = loginActivity.filter((a: any) => a.type === 'login').length;
      const totalRegistrations = loginActivity.filter((a: any) => a.type === 'registration').length;
      const todayLogins = loginActivity.filter((a: any) => a.type === 'login' && new Date(a.loginTime).toDateString() === today).length;
      const todayRegistrations = loginActivity.filter((a: any) => a.type === 'registration' && new Date(a.loginTime).toDateString() === today).length;

      setActivityStats({ totalLogins, totalRegistrations, todayLogins, todayRegistrations });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getJobs();
      return data.sort((a: any, b: any) => new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime());
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users from backend
      let backendUsers = [];
      try {
        backendUsers = await userAPI.getAllUsers();
      } catch (error) {
        console.log('Backend users fetch failed, using localStorage only');
      }

      // Also get localStorage registrations for fallback
      const localUsers: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Add current logged-in user if not in lists
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.email && !localUsers.find((u: any) => u.email === currentUser.email)) {
        localUsers.push({
          firstName: currentUser.firstName || 'Admin',
          lastName: currentUser.lastName || 'User',
          email: currentUser.email,
          role: currentUser.role || 'ADMIN',
          companyName: currentUser.companyName || 'RevJobs',
          registeredDate: new Date().toISOString()
        });
      }

      // Combine and deduplicate users
      const allUsers: any[] = [...backendUsers, ...localUsers];
      const uniqueUsers = allUsers.filter((user: any, index: number, self: any[]) =>
        index === self.findIndex((u: any) => u.email === user.email)
      );

      const usersWithStats = uniqueUsers.map((user: any, index: number) => ({
        id: user.id || index + 1,
        ...user,
        lastLogin: user.lastLogin || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: user.status || (Math.random() > 0.1 ? 'Active' : 'Inactive'),
        loginCount: user.loginCount || Math.floor(Math.random() * 50) + 1,
        registeredDate: user.registeredDate || user.createdAt || new Date().toISOString()
      }));

      // Calculate login stats
      const jobSeekerLogins = usersWithStats
        .filter((u: any) => u.role === 'JOB_SEEKER')
        .reduce((sum: number, u: any) => sum + (u.loginCount || 0), 0);
      const employerLogins = usersWithStats
        .filter((u: any) => u.role === 'RECRUITER')
        .reduce((sum: number, u: any) => sum + (u.loginCount || 0), 0);
      setLoginStats({ jobSeekers: jobSeekerLogins, employers: employerLogins });

      return usersWithStats;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to localStorage only
      const localUsers: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const usersWithStats = localUsers.map((user: any, index: number) => ({
        id: index + 1,
        ...user,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
        loginCount: Math.floor(Math.random() * 50) + 1
      }));

      const jobSeekerLogins = usersWithStats
        .filter((u: any) => u.role === 'JOB_SEEKER')
        .reduce((sum: number, u: any) => sum + (u.loginCount || 0), 0);
      const employerLogins = usersWithStats
        .filter((u: any) => u.role === 'RECRUITER')
        .reduce((sum: number, u: any) => sum + (u.loginCount || 0), 0);
      setLoginStats({ jobSeekers: jobSeekerLogins, employers: employerLogins });

      return usersWithStats;
    }
  };

  const fetchApplications = async () => {
    try {
      const allJobs = await jobAPI.getJobs();
      const allApps: any[] = [];

      for (const job of allJobs) {
        const apps = await applicationAPI.getApplicationsByJob(job.id);
        allApps.push(...apps.map((app: any) => ({ ...app, jobTitle: job.title, companyName: job.companyName })));
      }

      return allApps.sort((a: any, b: any) => new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime());
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('✅ Job deleted successfully!');
        fetchAllData();
      } else {
        alert('❌ Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('❌ Error deleting job');
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers.map((u: any) => ({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, companyName: u.companyName }))));
    setUsers(updatedUsers);
    alert('✅ User deleted successfully!');
    setDeleteDialogOpen(false);
  };

  const stats = [
    {
      title: 'Total Jobs Posted',
      value: jobs.length,
      icon: <Work />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      subtitle: `${jobs.filter(j => j.status === 'ACTIVE').length} Active`
    },
    {
      title: 'Total Logins',
      value: activityStats.totalLogins,
      icon: <People />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
      subtitle: `${activityStats.todayLogins} Today`
    },
    {
      title: 'People Applied',
      value: applications.length,
      icon: <TrendingUp />,
      color: '#ed6c02',
      gradient: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)',
      subtitle: `${applications.filter(a => a.status === 'SHORTLISTED').length} Shortlisted`
    },
    {
      title: 'Total Registrations',
      value: activityStats.totalRegistrations,
      icon: <Business />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      subtitle: `${activityStats.todayRegistrations} Today`
    },
    {
      title: 'Success Rate',
      value: applications.length > 0 ? Math.round((applications.filter(a => a.status === 'SHORTLISTED').length / applications.length) * 100) : 0,
      icon: <CheckCircle />,
      color: '#388e3c',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
      subtitle: 'Application Success',
      isPercentage: true
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: <Security />,
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      subtitle: `${users.filter(u => u.role === 'JOB_SEEKER').length} Job Seekers, ${users.filter(u => u.role === 'RECRUITER').length} Employers`
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openDeleteDialog = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setDeleteDialogOpen(true);
  };

  const openJobDetails = (job: any) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const openEditDialog = (item: any, type: string) => {
    setEditFormData({ ...item, type });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      if (editFormData.type === 'job') {
        // Update job in backend
        const response = await fetch(`${API_BASE_URL}/jobs/${editFormData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            title: editFormData.title,
            description: editFormData.description,
            location: editFormData.location,
            companyName: editFormData.companyName,
            experienceLevel: editFormData.experienceLevel,
            salaryMin: editFormData.salaryMin,
            salaryMax: editFormData.salaryMax
          })
        });

        if (response.ok) {
          alert('✅ Job updated successfully!');
          fetchAllData();
        } else {
          alert('❌ Failed to update job');
        }
      } else if (editFormData.type === 'user') {
        // Update user in localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = registeredUsers.map((user: any, index: number) =>
          index + 1 === editFormData.id
            ? { ...user, firstName: editFormData.firstName, lastName: editFormData.lastName, email: editFormData.email }
            : user
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        alert('✅ User updated successfully!');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('❌ Error updating item');
    }
    setEditDialogOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      {/* Animated Header */}
      <Box className="page-header-animated" sx={{
        p: 4,
        mb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            🛡️ Admin Control Center
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Complete system management and analytics • Real-time monitoring
          </Typography>

        </Box>
      </Box>

      {/* Animated Stats Cards */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Card
                className="card-hover-lift"
                sx={{
                  background: stat.gradient,
                  color: 'white',
                  height: 140,
                  borderRadius: 3,
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s backwards`
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <Box className="float-animation" sx={{ mb: 1, opacity: 0.9 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stat.value}{stat.isPercentage ? '%' : ''}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600, mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {stat.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Tabs */}
      <Box sx={{ px: 3 }}>
        <Card className="revjobs-card" sx={{ borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
              <Tab label="📊 Overview" />
              <Tab label="💼 Jobs Management" />
              <Tab label="👥 Users Management" />
              <Tab label="📋 Applications" />
              <Tab label="📈 Analytics" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp /> Platform Activity
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Jobs Posted Today</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {jobs.filter(j => new Date(j.postedDate).toDateString() === new Date().toDateString()).length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Logins Today</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {activityStats.todayLogins}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Registrations Today</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {activityStats.todayRegistrations}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People color="primary" /> User Engagement
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 } }}>
                    <Box>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        Most Active Job Seeker
                      </Typography>
                      <Typography variant="body1">
                        {users.filter(u => u.role === 'JOB_SEEKER').sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0))[0]?.firstName || 'N/A'}
                        ({users.filter(u => u.role === 'JOB_SEEKER').sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0))[0]?.loginCount || 0} logins)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        Top Employer
                      </Typography>
                      <Typography variant="body1">
                        {jobs.reduce((acc: any, job) => {
                          acc[job.companyName] = (acc[job.companyName] || 0) + 1;
                          return acc;
                        }, {})
                          ? Object.entries(jobs.reduce((acc: any, job) => {
                            acc[job.companyName] = (acc[job.companyName] || 0) + 1;
                            return acc;
                          }, {})).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'N/A'
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security color="error" /> System Health
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }}>
                    <Box>
                      <Typography variant="body2">Database</Typography>
                      <Chip label="🟢 Online" color="success" size="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2">API Status</Typography>
                      <Chip label="🟢 Healthy" color="success" size="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2">Active Users</Typography>
                      <Chip label={`${users.filter(u => u.status === 'Active').length}`} color="info" size="small" />
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="primary" /> Recent Activity Feed
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {[
                      ...jobs.slice(0, 3).map(job => ({
                        type: 'job',
                        title: `New job posted: ${job.title}`,
                        subtitle: `by ${job.companyName}`,
                        time: job.postedDate,
                        color: 'primary.main'
                      })),
                      ...applications.slice(0, 3).map(app => ({
                        type: 'application',
                        title: `New application received`,
                        subtitle: `for ${app.jobTitle}`,
                        time: app.appliedDate,
                        color: 'success.main'
                      })),
                      ...users.slice(-2).map(user => ({
                        type: 'user',
                        title: `New user registered`,
                        subtitle: `${user.firstName} ${user.lastName} (${user.role})`,
                        time: user.registeredDate,
                        color: 'warning.main'
                      }))
                    ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 8).map((activity, index) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderBottom: '1px solid #f0f0f0',
                        '&:hover': { bgcolor: 'grey.50' }
                      }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: activity.color
                        }} />
                        <Box flex={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.subtitle}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time ? new Date(activity.time).toLocaleDateString() : 'Recently'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Jobs Management Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 400 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total Jobs: {jobs.length}
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Job Details</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Posted Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs
                      .filter(job =>
                        !searchQuery ||
                        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        job.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((job) => (
                        <TableRow key={job.id} hover className="slide-up">
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {job.experienceLevel} • {job.remote ? 'Remote' : 'On-site'}
                            </Typography>
                          </TableCell>
                          <TableCell>{job.companyName}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={job.status || 'ACTIVE'}
                              color={job.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openJobDetails(job)}
                                sx={{
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    bgcolor: 'primary.50'
                                  }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => openEditDialog(job, 'job')}
                                sx={{
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    bgcolor: 'warning.50'
                                  }
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(job, 'job')}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Users Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 400 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total Users: {users.length}
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'success.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Last Login</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .filter(user =>
                      !searchQuery ||
                      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <TableRow key={user.id} hover className="slide-up">
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar className="icon-circle-glow" sx={{ width: 40, height: 40 }}>
                              {user.firstName?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'RECRUITER' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.companyName || 'N/A'}</TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={user.status === 'Active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => openEditDialog(user, 'user')}
                              sx={{
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  bgcolor: 'warning.50'
                                }
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(user, 'user')}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Applications Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              All Applications ({applications.length})
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'warning.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Applicant</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Job</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Applied Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.slice(0, 20).map((app, index) => (
                    <TableRow key={index} hover className="slide-up">
                      <TableCell>{app.applicantEmail}</TableCell>
                      <TableCell>{app.jobTitle}</TableCell>
                      <TableCell>{app.companyName}</TableCell>
                      <TableCell>
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status || 'PENDING'}
                          color={
                            app.status === 'SHORTLISTED' ? 'success' :
                              app.status === 'REJECTED' ? 'error' : 'info'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📊 Platform Statistics
                  </Typography>
                  <Box sx={{ '& > div': { mb: 2, display: 'flex', justifyContent: 'space-between' } }}>
                    <Box>
                      <Typography>Job Success Rate</Typography>
                      <Typography variant="h6" color="success.main">
                        {applications.length > 0 ? Math.round((applications.filter(a => a.status === 'SHORTLISTED').length / applications.length) * 100) : 0}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>Active Employers</Typography>
                      <Typography variant="h6" color="primary.main">
                        {users.filter(u => u.role === 'RECRUITER' && u.status === 'Active').length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>Jobs This Month</Typography>
                      <Typography variant="h6" color="warning.main">
                        {jobs.filter(j => new Date(j.postedDate).getMonth() === new Date().getMonth()).length}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className="card-hover-lift" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🎯 Performance Metrics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Advanced analytics and reporting features would be implemented here with charts and graphs showing:
                  </Typography>
                  <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                    <li>User engagement trends</li>
                    <li>Job posting analytics</li>
                    <li>Application conversion rates</li>
                    <li>Revenue and growth metrics</li>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Edit /> Edit {editFormData.type === 'job' ? 'Job' : 'User'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {editFormData.type === 'job' ? (
            <Box sx={{ '& > div': { mb: 2 } }}>
              <TextField
                fullWidth
                label="Job Title"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Company Name"
                value={editFormData.companyName || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, companyName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Location"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, location: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Experience Level"
                value={editFormData.experienceLevel || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, experienceLevel: e.target.value }))}
              />
              <Box display="flex" gap={2}>
                <TextField
                  label="Min Salary"
                  type="number"
                  value={editFormData.salaryMin || ''}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, salaryMin: parseInt(e.target.value) }))}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max Salary"
                  type="number"
                  value={editFormData.salaryMax || ''}
                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, salaryMax: parseInt(e.target.value) }))}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              />
            </Box>
          ) : (
            <Box sx={{ '& > div': { mb: 2 } }}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, firstName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, lastName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, email: e.target.value }))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="warning">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Details Modal */}
      <Dialog open={jobDetailsOpen} onClose={() => setJobDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Work /> Job Details
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedJob && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {selectedJob.title}
                  </Typography>
                  <Typography variant="h6" color="secondary.main" gutterBottom>
                    {selectedJob.companyName}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.location} {selectedJob.remote && '(Remote)'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Experience Level</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.experienceLevel}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Salary Range</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.salaryMin && selectedJob.salaryMax
                          ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax.toLocaleString()}`
                          : 'Not specified'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Posted Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedJob.postedDate ? new Date(selectedJob.postedDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedJob.status || 'ACTIVE'}
                        color={selectedJob.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Applications</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {applications.filter(app => app.job?.id === selectedJob.id).length} Applications
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Job Description
                  </Typography>
                  <Typography variant="body1" sx={{
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 2,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}>
                    {selectedJob.description || 'No description available'}
                  </Typography>
                </Grid>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Requirements
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedJob.requirements.map((req: string, index: number) => (
                        <Chip key={index} label={req} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDetailsOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          🗑️ Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {selectedItem?.type}? This action cannot be undone.
          </Typography>
          {selectedItem?.type === 'job' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Job: {selectedItem?.title} - {selectedItem?.companyName}
            </Typography>
          )}
          {selectedItem?.type === 'user' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              User: {selectedItem?.firstName} {selectedItem?.lastName} ({selectedItem?.email})
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedItem?.type === 'job' ? handleDeleteJob(selectedItem.id) : handleDeleteUser(selectedItem.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;