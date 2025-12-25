import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Paper, Divider, Chip } from '@mui/material';
import { ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { servicesData } from '../data/servicesData';

const ServiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<typeof servicesData[0] | null>(null);

    useEffect(() => {
        const foundService = servicesData.find(s => s.id === id);
        if (foundService) {
            setService(foundService);
        } else {
            // Redirect to services if not found
            navigate('/services');
        }
    }, [id, navigate]);

    const handleGetStarted = () => {
        switch (service?.id) {
            case 'job-search':
                navigate('/jobs');
                break;
            case 'career-growth':
            case 'skill-development':
                navigate('/careers');
                break;
            case 'support':
                // navigate('/contact'); // If contact page exists
                navigate('/messages');
                break;
            default:
                navigate('/register');
        }
    };

    if (!service) {
        return null;
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/services')}
                    sx={{ mb: 4 }}
                >
                    Back to Services
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={3} mb={4}>
                        <Box sx={{ color: 'primary.main', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                            {service.icon}
                        </Box>
                        <Box>
                            <Typography variant="h3" fontWeight={700} gutterBottom>
                                {service.title}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" fontWeight={400}>
                                {service.description}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={6}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Overview
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                                {service.details}
                            </Typography>

                            {/* Render rich text description if available */}
                            {service.fullDescription && (
                                <Box sx={{ mt: 4, '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 3, mb: 2 }, '& ul': { pl: 2, mb: 2 }, '& li': { mb: 1, color: '#4b5563' }, '& p': { mb: 2, color: '#4b5563', lineHeight: 1.7 } }}>
                                    <div dangerouslySetInnerHTML={{ __html: service.fullDescription }} />
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, bgcolor: '#fafafa' }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Key Features
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                                    {service.features.map((feature, index) => (
                                        <Box key={index} display="flex" alignItems="center" gap={1}>
                                            <CheckCircleOutline color="success" fontSize="small" />
                                            <Typography variant="body1">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Box mt={4}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ borderRadius: 2, py: 1.5 }}
                                        onClick={handleGetStarted}
                                    >
                                        Get Started
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>

                <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                        Need more help? <Button color="primary" onClick={() => navigate('/contact')}>Contact Support</Button>
                    </Typography>
                </Box>

            </Container>
        </Box>
    );
};

export default ServiceDetail;
