import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, InputAdornment, Button, Chip, Avatar, Pagination, CircularProgress, Alert, Container } from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';

const STATIC_COMPANIES = [
  // ... Major MNCs in India ...
  { id: 'google_in', name: 'Google', logo: 'G', location: 'Bangalore, Karnataka', openJobs: '50+', jobs: [{ title: 'Software Eng' }, { title: 'Product Mgr' }], externalLink: 'https://careers.google.com/locations/bangalore/' },
  { id: 'microsoft_in', name: 'Microsoft', logo: 'M', location: 'Hyderabad, Telangana', openJobs: '45+', jobs: [{ title: 'SDE II' }, { title: 'Support Eng' }], externalLink: 'https://careers.microsoft.com/us/en/l-india' },
  { id: 'amazon_in', name: 'Amazon', logo: 'A', location: 'Bangalore, Karnataka', openJobs: '100+', jobs: [{ title: 'SDE' }, { title: 'Ops Mgr' }], externalLink: 'https://www.amazon.jobs/en/locations/bangalore-india' },
  { id: 'flipkart', name: 'Flipkart', logo: 'F', location: 'Bangalore, Karnataka', openJobs: '60+', jobs: [{ title: 'UI Engineer' }, { title: 'Data Scientist' }], externalLink: 'https://www.flipkartcareers.com/' },
  { id: 'tcs', name: 'TCS', logo: 'T', location: 'Mumbai, Maharashtra', openJobs: '200+', jobs: [{ title: 'System Eng' }, { title: 'Java Dev' }], externalLink: 'https://www.tcs.com/careers' },
  { id: 'infosys', name: 'Infosys', logo: 'I', location: 'Bangalore, Karnataka', openJobs: '150+', jobs: [{ title: 'Tech Analyst' }, { title: 'React Dev' }], externalLink: 'https://www.infosys.com/careers/' },
  { id: 'wipro', name: 'Wipro', logo: 'W', location: 'Bangalore, Karnataka', openJobs: '120+', jobs: [{ title: 'Project Eng' }, { title: 'Test Eng' }], externalLink: 'https://careers.wipro.com/' },
  { id: 'hcl', name: 'HCLTech', logo: 'H', location: 'Noida, UP', openJobs: '100+', jobs: [{ title: 'Senior Dev' }, { title: 'Lead Eng' }], externalLink: 'https://www.hcltech.com/careers' },
  { id: 'tech_mahindra', name: 'Tech Mahindra', logo: 'T', location: 'Pune, Maharashtra', openJobs: '90+', jobs: [{ title: 'Software Eng' }, { title: 'Consultant' }], externalLink: 'https://careers.techmahindra.com/' },
  { id: 'accenture_in', name: 'Accenture', logo: 'A', location: 'Bangalore, Karnataka', openJobs: '180+', jobs: [{ title: 'App Dev' }, { title: 'Data Analyst' }], externalLink: 'https://www.accenture.com/in-en/careers' },
  { id: 'cognizant', name: 'Cognizant', logo: 'C', location: 'Chennai, Tamil Nadu', openJobs: '140+', jobs: [{ title: 'Programmer Analyst' }, { title: 'Associate' }], externalLink: 'https://careers.cognizant.com/global/en' },
  { id: 'capgemini', name: 'Capgemini', logo: 'C', location: 'Pune, Maharashtra', openJobs: '110+', jobs: [{ title: 'Software Eng' }, { title: 'Consultant' }], externalLink: 'https://www.capgemini.com/in-en/careers/' },
  { id: 'ibm_in', name: 'IBM', logo: 'I', location: 'Bangalore, Karnataka', openJobs: '80+', jobs: [{ title: 'App Developer' }, { title: 'Data Eng' }], externalLink: 'https://www.ibm.com/in-en/careers' },
  { id: 'oracle_in', name: 'Oracle', logo: 'O', location: 'Bangalore, Karnataka', openJobs: '70+', jobs: [{ title: 'Java Dev' }, { title: 'Cloud Architect' }], externalLink: 'https://www.oracle.com/in/careers/' },
  { id: 'cisco', name: 'Cisco', logo: 'C', location: 'Bangalore, Karnataka', openJobs: '40+', jobs: [{ title: 'Network Eng' }, { title: 'Software Eng' }], externalLink: 'https://www.cisco.com/c/en_in/about/careers.html' },
  { id: 'intel', name: 'Intel', logo: 'I', location: 'Bangalore, Karnataka', openJobs: '30+', jobs: [{ title: 'Hardware Eng' }, { title: 'Validation Eng' }], externalLink: 'https://jobs.intel.com/en/location/india-jobs' },
  { id: 'samsung_in', name: 'Samsung R&D', logo: 'S', location: 'Noida, UP', openJobs: '50+', jobs: [{ title: 'Android Dev' }, { title: 'Research Eng' }], externalLink: 'https://www.samsung.com/in/about-us/careers/' },
  { id: 'jio', name: 'Jio Platforms', logo: 'J', location: 'Mumbai, Maharashtra', openJobs: '90+', jobs: [{ title: 'Backend Dev' }, { title: 'Full Stack' }], externalLink: 'https://careers.jio.com/' },
  { id: 'airtel', name: 'Airtel', logo: 'A', location: 'Gurgaon, Haryana', openJobs: '60+', jobs: [{ title: 'Network Eng' }, { title: 'Product Mgr' }], externalLink: 'https://www.airtel.in/careers/' },
  { id: 'paytm', name: 'Paytm', logo: 'P', location: 'Noida, UP', openJobs: '45+', jobs: [{ title: 'Backend Eng' }, { title: 'iOS Dev' }], externalLink: 'https://paytm.com/careers' },
  { id: 'zomato', name: 'Zomato', logo: 'Z', location: 'Gurgaon, Haryana', openJobs: '35+', jobs: [{ title: 'SDE II' }, { title: 'Product Designer' }], externalLink: 'https://www.zomato.com/careers' },
  { id: 'swiggy', name: 'Swiggy', logo: 'S', location: 'Bangalore, Karnataka', openJobs: '40+', jobs: [{ title: 'SDE III' }, { title: 'Data Scientist' }], externalLink: 'https://careers.swiggy.com/' },
  { id: 'ola', name: 'Ola', logo: 'O', location: 'Bangalore, Karnataka', openJobs: '30+', jobs: [{ title: 'Mobile Dev' }, { title: 'Backend Eng' }], externalLink: 'https://olaelectric.com/careers' },
  { id: 'razorpay', name: 'Razorpay', logo: 'R', location: 'Bangalore, Karnataka', openJobs: '25+', jobs: [{ title: 'Frontend Eng' }, { title: 'Product Mgr' }], externalLink: 'https://razorpay.com/jobs/' },
  { id: 'cred', name: 'CRED', logo: 'C', location: 'Bangalore, Karnataka', openJobs: '20+', jobs: [{ title: 'Backend Eng' }, { title: 'Designer' }], externalLink: 'https://careers.cred.club/' },
  { id: 'zoho', name: 'Zoho', logo: 'Z', location: 'Chennai, Tamil Nadu', openJobs: '60+', jobs: [{ title: 'Software Dev' }, { title: 'Marketing' }], externalLink: 'https://www.zoho.com/careers/' },
  { id: 'freshworks', name: 'Freshworks', logo: 'F', location: 'Chennai, Tamil Nadu', openJobs: '30+', jobs: [{ title: 'SDE' }, { title: 'Sales Eng' }], externalLink: 'https://www.freshworks.com/company/careers/' },
  { id: 'mindtree', name: 'Mindtree', logo: 'M', location: 'Bangalore, Karnataka', openJobs: '50+', jobs: [{ title: 'Java Dev' }, { title: 'Cloud Eng' }], externalLink: 'https://www.mindtree.com/careers' },
  { id: 'lt_infotech', name: 'LTI (L&T)', logo: 'L', location: 'Mumbai, Maharashtra', openJobs: '80+', jobs: [{ title: 'Software Eng' }, { title: 'Consultant' }], externalLink: 'https://www.lntinfotech.com/careers/' },
  { id: 'myntra', name: 'Myntra', logo: 'M', location: 'Bangalore, Karnataka', openJobs: '40+', jobs: [{ title: 'Data Scientist' }, { title: 'UI Dev' }], externalLink: 'https://careers.myntra.com/' },
  { id: 'nykaa', name: 'Nykaa', logo: 'N', location: 'Mumbai, Maharashtra', openJobs: '35+', jobs: [{ title: 'Product Mgr' }, { title: 'Marketing' }], externalLink: 'https://www.nykaa.com/careers' },
  { id: 'lenskart', name: 'Lenskart', logo: 'L', location: 'Gurgaon, Haryana', openJobs: '30+', jobs: [{ title: 'Android Dev' }, { title: 'Optometrist' }], externalLink: 'https://hiring.lenskart.com/' },
  { id: 'meesho', name: 'Meesho', logo: 'M', location: 'Bangalore, Karnataka', openJobs: '45+', jobs: [{ title: 'SDE II' }, { title: 'Data Analyst' }], externalLink: 'https://meesho.io/careers' },
  { id: 'phonepe', name: 'PhonePe', logo: 'P', location: 'Bangalore, Karnataka', openJobs: '50+', jobs: [{ title: 'SDE' }, { title: 'Engineering Mgr' }], externalLink: 'https://www.phonepe.com/careers/' },
  { id: 'zerodha', name: 'Zerodha', logo: 'Z', location: 'Bangalore, Karnataka', openJobs: '15+', jobs: [{ title: 'Go Dev' }, { title: 'FOSS Hacker' }], externalLink: 'https://zerodha.com/careers' },
  { id: 'udaan', name: 'Udaan', logo: 'U', location: 'Bangalore, Karnataka', openJobs: '25+', jobs: [{ title: 'Backend Eng' }, { title: 'Product Mgr' }], externalLink: 'https://udaan.com/careers' },
  { id: 'groww', name: 'Groww', logo: 'G', location: 'Bangalore, Karnataka', openJobs: '30+', jobs: [{ title: 'SDE' }, { title: 'Analyst' }], externalLink: 'https://groww.in/careers' },
  { id: 'deloitte', name: 'Deloitte', logo: 'D', location: 'Hyderabad, Telangana', openJobs: '100+', jobs: [{ title: 'Analyst' }, { title: 'Consultant' }], externalLink: 'https://www2.deloitte.com/in/en/careers.html' },
  { id: 'kpmg', name: 'KPMG', logo: 'K', location: 'Gurgaon, Haryana', openJobs: '60+', jobs: [{ title: 'Audit' }, { title: 'Tax Consultant' }], externalLink: 'https://home.kpmg/in/en/home/careers.html' },
  { id: 'ey', name: 'EY', logo: 'E', location: 'Bangalore, Karnataka', openJobs: '90+', jobs: [{ title: 'Consultant' }, { title: 'Tech Risk' }], externalLink: 'https://www.ey.com/en_in/careers' },
  { id: 'pwc', name: 'PwC', logo: 'P', location: 'Mumbai, Maharashtra', openJobs: '70+', jobs: [{ title: 'Associate' }, { title: 'Analyst' }], externalLink: 'https://www.pwc.in/careers.html' },
  { id: 'adobe', name: 'Adobe', logo: 'A', location: 'Noida, UP', openJobs: '40+', jobs: [{ title: 'Computer Scientist' }, { title: 'MTS' }], externalLink: 'https://www.adobe.com/careers.html' },
  { id: 'salesforce', name: 'Salesforce', logo: 'S', location: 'Hyderabad, Telangana', openJobs: '50+', jobs: [{ title: 'MTS' }, { title: 'Solution Eng' }], externalLink: 'https://www.salesforce.com/in/company/careers/' },
  { id: 'intuit', name: 'Intuit', logo: 'I', location: 'Bangalore, Karnataka', openJobs: '30+', jobs: [{ title: 'Software Eng' }, { title: 'Product Mgr' }], externalLink: 'https://www.intuit.com/careers/' },
  { id: 'sap', name: 'SAP Labs', logo: 'S', location: 'Bangalore, Karnataka', openJobs: '60+', jobs: [{ title: 'Developer' }, { title: 'DevOps' }], externalLink: 'https://www.sap.com/india/about/careers.html' },
  { id: 'vmware', name: 'VMware', logo: 'V', location: 'Bangalore, Karnataka', openJobs: '40+', jobs: [{ title: 'MTS' }, { title: 'Cloud Eng' }], externalLink: 'https://careers.vmware.com/main/' },
  { id: 'pay_pal', name: 'PayPal', logo: 'P', location: 'Chennai, Tamil Nadu', openJobs: '35+', jobs: [{ title: 'SDE' }, { title: 'Risk Analyst' }], externalLink: 'https://www.paypal.com/us/webapps/mpp/jobs' },
  { id: 'uber', name: 'Uber', logo: 'U', location: 'Bangalore, Karnataka', openJobs: '25+', jobs: [{ title: 'SDE II' }, { title: 'Data Scientist' }], externalLink: 'https://www.uber.com/in/en/careers/' },
  { id: 'linkedin', name: 'LinkedIn', logo: 'L', location: 'Bangalore, Karnataka', openJobs: '20+', jobs: [{ title: 'SDE' }, { title: 'SRE' }], externalLink: 'https://careers.linkedin.com/' },
  { id: 'atlassian', name: 'Atlassian', logo: 'A', location: 'Bangalore, Karnataka', openJobs: '30+', jobs: [{ title: 'Java Dev' }, { title: 'Full Stack' }], externalLink: 'https://www.atlassian.com/company/careers' }
];

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();

    // Real-time updates
    const handleJobCreated = () => fetchCompanies();
    window.addEventListener('jobCreated', handleJobCreated);

    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchCompanies, 10000);

    return () => {
      window.removeEventListener('jobCreated', handleJobCreated);
      clearInterval(interval);
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      const jobs = await jobAPI.getJobs();

      // Extract unique companies from jobs
      const companyMap = new Map();

      jobs.forEach((job: any) => {
        const companyName = job.companyName;
        if (companyName) {
          if (!companyMap.has(companyName)) {
            companyMap.set(companyName, {
              id: companyName,
              name: companyName,
              logo: companyName[0]?.toUpperCase() || 'C',
              location: job.location,
              openJobs: 1,
              jobs: [job]
            });
          } else {
            const company = companyMap.get(companyName);
            company.openJobs++;
            company.jobs.push(job);
          }
        }
      });

      // Merge static companies with fetched companies
      const allCompanies = [...STATIC_COMPANIES, ...Array.from(companyMap.values())];
      setCompanies(allCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  const startIndex = (currentPage - 1) * companiesPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, startIndex + companiesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              mb: 2
            }}
          >
            Top Companies Hiring
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              mb: 3,
              fontWeight: 400
            }}
          >
            {companies.length} companies with active job openings
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search companies..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography sx={{ fontWeight: 600 }}>Loading companies...</Typography>
          </Box>
        ) : companies.length === 0 ? (
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            No companies found. Companies will appear here when jobs are posted.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4, px: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                Showing {startIndex + 1}-{Math.min(startIndex + companiesPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ px: 3 }}>
              {currentCompanies.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
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
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Avatar sx={{ width: 60, height: 60, fontSize: '1.5rem', bgcolor: 'primary.main' }}>
                          {company.logo}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: '#212121' }}>
                            {company.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <LocationOn fontSize="small" sx={{ color: '#757575' }} />
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                              {company.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                        Currently hiring for {company.openJobs} position{company.openJobs > 1 ? 's' : ''}
                      </Typography>

                      <Box mb={3}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Recent Openings:
                        </Typography>
                        {company.jobs.slice(0, 3).map((job: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={job.title}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={`${company.openJobs} Open Job${company.openJobs > 1 ? 's' : ''}`}
                          color="primary"
                          variant="filled"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            if (company.externalLink) {
                              window.open(company.externalLink, '_blank');
                            } else {
                              navigate(`/jobs?company=${encodeURIComponent(company.name)}`);
                            }
                          }}
                        >
                          View Jobs
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" sx={{ mt: 4, pb: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Companies;