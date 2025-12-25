import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, TextField, InputAdornment, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Search, PersonAdd, Work, TrendingUp, People, Visibility } from '@mui/icons-material';
import { API_BASE_URL, jobAPI, applicationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
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

const RecruiterDashboard: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);

        // Listen for job created events
        const handleJobCreated = () => fetchData();
        window.addEventListener('jobCreated', handleJobCreated);

        return () => {
            clearInterval(interval);
            window.removeEventListener('jobCreated', handleJobCreated);
        };
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [jobsData, allApplications] = await Promise.all([
                jobAPI.getJobsByRecruiter(),
                fetchAllApplications()
            ]);
            setJobs(jobsData);
            setApplications(allApplications);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAllApplications = async () => {
        try {
            // Fetch only the logged-in employer's jobs
            const employerJobs = await jobAPI.getJobsByRecruiter();
            console.log('Recruiter jobs:', employerJobs);
            const employerApps: any[] = [];

            for (const job of employerJobs as any[]) {
                try {
                    const apps = await applicationAPI.getApplicationsByJob(job.id);
                    console.log(`Applications for job ${job.id}:`, apps);
                    employerApps.push(...apps.map((app: any) => ({ ...app, jobTitle: job.title, companyName: job.companyName })));
                } catch (error) {
                    console.error(`Error fetching applications for job ${job.id}:`, error);
                }
            }

            // Sort by date (newest first)
            return employerApps.sort((a: any, b: any) => {
                const dateA = new Date(a.appliedDate || 0).getTime();
                const dateB = new Date(b.appliedDate || 0).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    };

    const stats = [
        { title: 'Jobs Posted', value: jobs.length, icon: <Work />, color: 'primary' },
        { title: 'Total Applications', value: applications.length, icon: <People />, color: 'success' },
        { title: 'Pending Review', value: applications.filter(a => a.status === 'PENDING').length, icon: <PersonAdd />, color: 'info' },
        { title: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: <TrendingUp />, color: 'warning' },
    ];

    const getJobApplicationCount = (jobId: number) => {
        return applications.filter(app => app.job?.id === jobId).length;
    };



    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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

    const commonChipSx = {
        '&:hover': {
            color: '#ffffff !important',
            '& .MuiChip-label': {
                color: '#ffffff !important'
            }
        }
    };

    const handleRefresh = () => {
        fetchData();
    };

    const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
        try {
            const application = applications.find(app => app.id === applicationId);
            if (!application) {
                alert('❌ Application not found');
                return;
            }

            // Update status via API
            const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Optimistic Update: Update local state immediately
            setApplications(prevApps =>
                prevApps.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );

            // If shortlisted, send a welcome message
            if (newStatus === 'SHORTLISTED' && user?.id && application.applicantId) {
                try {
                    // Import messageAPI dynamically if not available or add to imports
                    const { messageAPI } = await import('../services/api');

                    await messageAPI.sendMessage({
                        senderId: typeof user.id === 'string' ? parseInt(user.id) : user.id,
                        receiverId: application.applicantId,
                        content: `Congratulations! Your application for "${application.jobTitle}" has been shortlisted by ${application.companyName || 'our company'}. We'd like to discuss the next steps with you.`
                    });

                    alert('✅ Application shortlisted and message sent to candidate!');
                } catch (msgError) {
                    console.error('Failed to send shortlist message:', msgError);
                    alert('✅ Application shortlisted (Note: Failed to send automated message)');
                }
            } else {
                alert(`✅ Application ${newStatus.toLowerCase()} successfully!`);
            }

            // Trigger event for UI refresh if needed
            window.dispatchEvent(new CustomEvent('applicationStatusChanged', {
                detail: { applicationId, newStatus, applicantEmail: application.applicantEmail }
            }));

            // fetchData(); // Don't refetch immediately to allow optimistic update to persist. Auto-refresh will eventually sync.
        } catch (error) {
            console.error('Error updating status:', error);
            alert('❌ Error updating status');
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
                        Recruiter
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
            <Box sx={{ px: 3 }}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Total Applications */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                            color: 'white',
                            height: 120,
                            borderRadius: 3,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.1)'
                            }
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                <Box sx={{ mr: 2, opacity: 0.8 }}>
                                    <People />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {applications.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Applications
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Views */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
                            color: 'white',
                            height: 120,
                            borderRadius: 3,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.1)'
                            }
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                <Box sx={{ mr: 2, opacity: 0.8 }}>
                                    <Visibility />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {jobs.reduce((sum, job) => sum + (job.views || 0), 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Views
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card sx={{
                                background: `linear-gradient(135deg, ${stat.color === 'primary' ? '#1976d2' :
                                    stat.color === 'success' ? '#2e7d32' :
                                        stat.color === 'info' ? '#0288d1' : '#ed6c02'} 0%, ${stat.color === 'primary' ? '#42a5f5' :
                                            stat.color === 'success' ? '#66bb6a' :
                                                stat.color === 'info' ? '#29b6f6' : '#ffb74d'} 100%)`,
                                color: 'white',
                                height: 120,
                                borderRadius: 3,
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
            </Box>

            {/* Tabs */}
            <Card sx={{ mx: 3, borderRadius: 3, backgroundColor: '#ffffff' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Candidates" />
                        <Tab label="My Jobs" />
                        <Tab label="Analytics" />
                    </Tabs>
                </Box>

                {/* Applications Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search applications..."
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
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : applications.length === 0 ? (
                        <Alert severity="info">
                            No applications yet. Applications will appear here when job seekers apply to your jobs.
                            <br />Debug: {jobs.length} jobs posted, check console for details.
                        </Alert>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Candidate</TableCell>
                                        <TableCell>Job Title</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Applied Date</TableCell>
                                        <TableCell>Cover Letter</TableCell>
                                        <TableCell>Resume</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {applications
                                        .filter(app => {
                                            const matchesSearch = !searchQuery ||
                                                app.applicantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
                                            const matchesJob = !selectedJobId || app.job?.id === selectedJobId;
                                            return matchesSearch && matchesJob;
                                        })
                                        .map((application) => (
                                            <TableRow key={application.id}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                            {application.applicantEmail?.[0]?.toUpperCase() || 'A'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {application.applicant?.firstName} {application.applicant?.lastName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {application.applicantEmail}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{application.jobTitle || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={application.status || 'PENDING'}
                                                        color={getStatusColor(application.status) as any}
                                                        size="small"
                                                        sx={commonChipSx}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                        {application.coverLetter?.includes('CV:') ? application.coverLetter.split('CV:')[0] : application.coverLetter || 'No cover letter'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {application.resumeUrl ? (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                const url = application.resumeUrl;
                                                                if (url.startsWith('data:')) {
                                                                    const win = window.open();
                                                                    if (win) {
                                                                        win.document.write(
                                                                            `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                                                        );
                                                                    }
                                                                } else {
                                                                    // Fix for double prefix issue
                                                                    let fullUrl = url;
                                                                    if (!url.startsWith('http')) {
                                                                        // If url already starts with /api (or API_BASE_URL), don't prepend it again
                                                                        // Assuming API_BASE_URL is '/api' or similar
                                                                        if (url.startsWith(API_BASE_URL)) {
                                                                            fullUrl = url;
                                                                        } else if (url.startsWith('/api/') && API_BASE_URL.includes('/api')) {
                                                                            fullUrl = url;
                                                                        } else {
                                                                            fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                                                                        }
                                                                    }
                                                                    // Append host if needed (for relative paths to work in new tab)
                                                                    // Actually, window.open with relative path opens in current origin, which is correct for proxy.
                                                                    // But if API_BASE_URL includes host, we are good.
                                                                    // If API_BASE_URL is just '/api', it works relative to current page domain.
                                                                    window.open(fullUrl, '_blank');
                                                                }
                                                            }}
                                                        >
                                                            View PDF
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">No Resume</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {application.status === 'PENDING' ? (
                                                        <Box display="flex" gap={1} flexDirection="column">
                                                            <Button
                                                                size="small"
                                                                color="success"
                                                                variant="contained"
                                                                onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                                                            >
                                                                ✅ Shortlist
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                onClick={() => navigate('/messages', { state: { partnerId: parseInt(application.applicantId) } })}
                                                            >
                                                                💬 Message
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                variant="outlined"
                                                                onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                                                            >
                                                                ❌ Reject
                                                            </Button>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" align="center">
                                                            {application.status}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                {/* Jobs Tab */}
                <TabPanel value={tabValue} index={1}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Applications</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Posted Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Loading jobs...
                                        </TableCell>
                                    </TableRow>
                                ) : jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No jobs posted yet. Click "Post New Job" to get started!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {job.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{job.companyName || 'N/A'}</TableCell>
                                            <TableCell>{job.location}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getJobApplicationCount(job.id)}
                                                    color={getJobApplicationCount(job.id) > 0 ? 'primary' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={job.status || 'ACTIVE'}
                                                    color={job.status === 'ACTIVE' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => {
                                                            setTabValue(0); // Switch to Candidates tab
                                                            setSelectedJobId(job.id); // Filter by job ID
                                                            setSearchQuery(''); // Clear search
                                                        }}
                                                    >
                                                        View Applications
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Analytics Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Application Trends</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Analytics charts would be implemented here showing application trends,
                                        conversion rates, and hiring metrics.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Detailed performance metrics including time-to-hire,
                                        source effectiveness, and candidate quality scores.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Card>
        </Box >
    );
};

export default RecruiterDashboard;
