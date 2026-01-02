import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, Chip, CircularProgress, Alert, Container } from '@mui/material';
import { LocationOn, Schedule, Delete, WorkOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { savedJobAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SavedJobs: React.FC = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedJobs();
    }, [user]);

    const fetchSavedJobs = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            const savedJobs = await savedJobAPI.getSavedJobs(user.id);
            setJobs(savedJobs);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId: string) => {
        if (!user?.id) return;

        try {
            await savedJobAPI.unsaveJob(user.id, parseInt(jobId));
            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error unsaving job:', error);
            alert('Failed to remove job');
        }
    };

    const formatSalary = (min?: number, max?: number) => {
        if (!min && !max) return 'Competitive Salary';
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `From $${min.toLocaleString()}`;
        return `Up to $${max?.toLocaleString()}`;
    };

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 8 }}>
                <Container maxWidth="md">
                    <Alert severity="warning">
                        Please log in to view your saved jobs
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Header */}
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
                        Saved Jobs
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: 800,
                            mx: 'auto',
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 400,
                            textAlign: 'center'
                        }}
                    >
                        Your bookmarked opportunities
                    </Typography>
                </Box>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography sx={{ fontWeight: 600 }}>Loading saved jobs...</Typography>
                    </Box>
                ) : jobs.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <WorkOutline sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
                            No Saved Jobs Yet
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#757575', mb: 3 }}>
                            Start saving jobs you're interested in to find them here later
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/jobs')}
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#1e40af' } }}
                        >
                            Browse Jobs
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                            {jobs.length} Saved {jobs.length === 1 ? 'Job' : 'Jobs'}
                        </Typography>
                        <Grid container spacing={3}>
                            {jobs.map((job) => (
                                <Grid item xs={12} md={6} lg={4} key={job.id}>
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
                                                <Box flex={1}>
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
                                                    <Chip
                                                        label="Remote"
                                                        size="small"
                                                        color="success"
                                                        sx={{
                                                            color: '#212121',
                                                            '&:hover': {
                                                                color: 'white'
                                                            }
                                                        }}
                                                    />
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
                                                {job.requirements?.slice(0, 2).map((req: string, idx: number) => (
                                                    <Chip key={idx} label={req} size="small" variant="outlined" />
                                                ))}
                                            </Box>

                                            <Box display="flex" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleUnsave(job.id)}
                                                    sx={{ minWidth: 'auto', px: 2 }}
                                                >
                                                    <Delete />
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default SavedJobs;
