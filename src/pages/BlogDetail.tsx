import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Chip, Avatar, Paper } from '@mui/material';
import { ArrowBack, CalendarToday, AccessTime, Person } from '@mui/icons-material';
import { blogPosts, BlogPost } from '../data/blogPosts';

const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        if (id) {
            const foundPost = blogPosts.find(p => p.id === parseInt(id));
            if (foundPost) {
                setPost(foundPost);
                window.scrollTo(0, 0);
            } else {
                navigate('/blog'); // Redirect if not found
            }
        }
    }, [id, navigate]);

    if (!post) {
        return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography>Loading...</Typography></Box>;
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 6 }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/blog')}
                    sx={{ mb: 4, color: '#64748b' }}
                >
                    Back to Articles
                </Button>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: '24px', bgcolor: 'white' }}>

                    {/* Header */}
                    <Box mb={4}>
                        <Chip label={post.category} color="primary" sx={{ mb: 2 }} />
                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 800,
                                color: '#1e293b',
                                fontSize: { xs: '2rem', md: '3rem' }
                            }}
                        >
                            {post.title}
                        </Typography>

                        <Box display="flex" flexWrap="wrap" gap={3} alignItems="center" mt={3} sx={{ color: '#64748b' }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>{post.author[0]}</Avatar>
                                <Typography variant="subtitle2" fontWeight="600">{post.author}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday fontSize="small" />
                                <Typography variant="body2">{new Date(post.date).toLocaleDateString()}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <AccessTime fontSize="small" />
                                <Typography variant="body2">{post.readTime}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{
                            lineHeight: 1.8,
                            fontSize: '1.1rem',
                            color: '#334155',
                            '& h3': {
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                mt: 4,
                                mb: 2,
                                color: '#0f172a'
                            },
                            '& p': { mb: 3 },
                            '& ul, & ol': { mb: 3, pl: 3 },
                            '& li': { mb: 1 }
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </Typography>

                    {/* Footer / Share / Tags could go here */}
                    <Box mt={6} pt={4} borderTop="1px solid #e2e8f0">
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Share this article
                        </Typography>
                        {/* Add share buttons if needed */}
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>LinkedIn</Button>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>Twitter</Button>
                        <Button variant="outlined" size="small">Facebook</Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default BlogDetail;
