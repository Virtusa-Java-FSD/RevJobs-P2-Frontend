import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip, Avatar, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, ThumbUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleReadMore = (id: number) => {
    navigate(`/blog/${id}`);
  };

  const categories = ['All', 'Job Market', 'Job Search', 'Interview Tips', 'Career Advice', 'Resume Tips', 'Tech Trends', 'Future of Work', 'Networking'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
            Career Insights & Tips
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: 3,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400
            }}
          >
            Stay ahead in your career with expert advice, industry insights, and practical tips from our team of career specialists.
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Categories */}
      <Box sx={{ py: 3, px: 3 }}>
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <Box sx={{ py: 6, px: 3, position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: '#212121' }}>
            Featured Articles
          </Typography>
          <Grid container spacing={4}>
            {featuredPosts.map((post) => (
              <Grid item xs={12} md={6} key={post.id}>
                <Card className="card-hover-lift" sx={{
                  height: '100%',
                  backgroundColor: '#ffffff',
                  borderRadius: 3,
                  boxShadow: 3
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box>
                        <Chip label="Featured" color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="caption" sx={{ color: '#757575' }} display="block">
                          {post.category}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
                      {post.title}
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#757575' }} paragraph>
                      {post.excerpt}
                    </Typography>

                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {post.author[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#212121' }}>
                            {post.author}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#757575' }}>
                            {new Date(post.date).toLocaleDateString()} • {post.readTime}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleLike(post.id)}
                          color={likedPosts.has(post.id) ? 'primary' : 'default'}
                        >
                          <ThumbUp fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" sx={{ color: '#757575' }}>24</Typography>
                        <Button variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => handleReadMore(post.id)}>
                          Read More
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Regular Posts */}
      <Box sx={{ py: 6, px: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4, color: '#212121' }}>
          Latest Articles
        </Typography>
        <Grid container spacing={3}>
          {regularPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card className="card-hover-lift" sx={{
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: 3,
                boxShadow: 2,
                cursor: 'pointer' // Add cursor pointer
              }} onClick={() => handleReadMore(post.id)}>
                <CardContent sx={{ p: 3 }}>

                  <Chip label={post.category} size="small" sx={{ mb: 2 }} />

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#212121' }}>
                    {post.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#757575' }} paragraph>
                    {post.excerpt}
                  </Typography>

                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#212121' }}>
                        {post.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {new Date(post.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }} // Stop propagation
                        color={likedPosts.has(post.id) ? 'primary' : 'default'}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: '#757575' }}>15</Typography>
                      <Typography variant="caption" sx={{ color: '#1976d2', ml: 1 }}>
                        {post.readTime}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Newsletter Signup */}
      <Box sx={{ py: 8, textAlign: 'center', background: 'rgba(255,255,255,0.95)', position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
          Stay Updated
        </Typography>
        <Typography variant="h6" paragraph sx={{ maxWidth: 600, mx: 'auto', color: 'rgba(255,255,255,0.9)' }}>
          Subscribe to our newsletter and get the latest career tips and job market insights delivered to your inbox.
        </Typography>
        <Box sx={{ maxWidth: 400, mx: 'auto', display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter your email"
            InputProps={{
              sx: {
                bgcolor: 'white',
                '& input': { color: '#212121' }
              }
            }}
          />
          <Button variant="contained" color="secondary" sx={{ minWidth: 'auto', px: 3 }}>
            Subscribe
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Blog;