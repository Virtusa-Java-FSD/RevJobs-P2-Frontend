import React, { useState, useEffect } from 'react';
import { Box, Paper, Tabs, Tab, Container, useMediaQuery, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import '../../styles/creative-theme.css';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const AuthPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const isSmallScreen = useMediaQuery('(max-width:900px)');

    const motivationalMessages = [
        "Welcome back! Your next opportunity awaits! 🚀",
        "Great to see you again! Let's find your dream job! 🎯",
        "Ready to take the next step in your career? 💪",
        "Your future starts here! Let's make it happen! ✨",
        "Success is just one login away! 🌟"
    ];

    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % motivationalMessages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.pathname === '/register') {
            setValue(1);
        } else {
            setValue(0);
        }
    }, [location.pathname]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 0) {
            navigate('/login');
        } else {
            navigate('/register');
        }
    };

    return (
        <Box
            className="login-page" // Reusing exisitng gradient background class
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Fallback or override
                position: 'relative',
                overflow: 'hidden',
                p: 2
            }}
        >
            {/* Floating Background Shapes */}
            <Box className="bg-shape bg-shape-1" sx={{ width: 400, height: 400, top: -100, right: -100, background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)', opacity: 0.1 }} />
            <Box className="bg-shape bg-shape-2" sx={{ width: 300, height: 300, bottom: -50, left: -50, background: 'linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)', opacity: 0.1 }} />

            <Container maxWidth="lg" disableGutters sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={24}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: 1000,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Left Side - Hero/Image Section (Hidden on small screens) */}
                    {!isSmallScreen && (
                        <Box sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            p: 6,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'url("https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.2,
                                mixBlendMode: 'overlay'
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight="bold" gutterBottom>
                                    RevJobs
                                </Typography>
                                <Box sx={{ width: 60, height: 4, bgcolor: 'white', borderRadius: 2, mx: 'auto', mb: 4 }} />
                                <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6, minHeight: '3em' }}>
                                    {motivationalMessages[currentMessage]}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Right Side - Auth Forms */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                variant="fullWidth"
                                textColor="primary"
                                indicatorColor="primary"
                                aria-label="auth tabs"
                            >
                                <Tab label="Sign In" sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }} />
                                <Tab label="Sign Up" sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }} />
                            </Tabs>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '85vh' }}>
                            <CustomTabPanel value={value} index={0}>
                                <Login />
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <Register />
                            </CustomTabPanel>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthPage;
