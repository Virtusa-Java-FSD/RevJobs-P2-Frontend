import React from 'react';
import { Work, School, TrendingUp, Assessment, Support, Security } from '@mui/icons-material';

export const servicesData = [
    {
        id: 'job-search',
        icon: <Work sx={{ fontSize: 48 }} />,
        title: 'Job Search',
        description: 'Find your dream job from thousands of opportunities across various industries and locations.',
        features: ['Advanced Filters', 'Job Alerts', 'One-Click Apply', 'Application Tracking'],
        details: 'Our intelligent job search engine uses advanced algorithms to match your profile with the most relevant opportunities. Filter by remote work, salary range, company size, and more. Set up custom alerts so you never miss a new opening that fits your criteria.',
        fullDescription: `
        <p>Our Job Search platform is designed to connect you with the best opportunities in the market. We aggregate listings from top companies, startups, and recruitment agencies to provide a comprehensive database of active job openings.</p>
        
        <h3>Why Choose Our Job Search?</h3>
        <ul>
          <li><strong>Smart Matching:</strong> Our AI-driven recommendation engine learns from your preferences and search history to suggest jobs that are a perfect fit for your skills and career goals.</li>
          <li><strong>Verified Listings:</strong> We verify every employer and job posting to ensure a safe and scam-free job hunting experience.</li>
          <li><strong>Salary Transparency:</strong> Get insights into salary ranges for most positions, helping you negotiate better.</li>
          <li><strong>Remote First:</strong> Easily filter for remote, hybrid, or on-site roles to match your lifestyle.</li>
        </ul>

        <h3>How It Works</h3>
        <p>Simply create a profile, upload your resume, and start searching. You can save jobs for later, apply with a single click, and track your application status in real-time from your dashboard.</p>
      `
    },
    {
        id: 'skill-development',
        icon: <School sx={{ fontSize: 48 }} />,
        title: 'Skill Development',
        description: 'Enhance your skills with our comprehensive learning platform and certification programs.',
        features: ['Online Courses', 'Certifications', 'Skill Assessments', 'Learning Paths'],
        details: 'Access thousands of curated courses from industry leaders. Earn recognized certifications to boost your resume. specific skill assessments help you identify gaps and create a personalized learning path to master in-demand technologies and soft skills.',
        fullDescription: `
        <p>Stay ahead of the competition with our Skill Development hub. Whether you are looking to master a new programming language, improve your management skills, or get certified in project management, we have resources for you.</p>

        <h3>Features</h3>
        <ul>
          <li><strong>Expert-Led Courses:</strong> Learn from industry veterans and top university professors.</li>
          <li><strong>Hands-on Projects:</strong> Apply what you learn with real-world projects and interactive labs.</li>
          <li><strong>Accredited Certifications:</strong> Earn certificates that are recognized by top employers globally.</li>
        </ul>
      `
    },
    {
        id: 'career-growth',
        icon: <TrendingUp sx={{ fontSize: 48 }} />,
        title: 'Career Growth',
        description: 'Get personalized career guidance and insights to accelerate your professional growth.',
        features: ['Career Counseling', 'Resume Building', 'Interview Prep', 'Salary Insights'],
        details: 'Work one-on-one with professional career coaches who can help guide your career trajectory. Utilize our AI-powered resume builder to create ATS-friendly resumes. Practice with mock interviews and get real-time feedback to ace your next job interview.',
        fullDescription: `
         <p>Accelerate your career with personalized guidance. Our Career Growth services are designed to help you navigate the complexities of the modern workplace.</p>
         
         <h3>Services Include</h3>
         <ul>
            <li><strong>1-on-1 Coaching:</strong> Personalized sessions with experienced career coaches.</li>
            <li><strong>Resume Reviews:</strong> detailed feedback on your CV to ensure it passes ATS systems.</li>
            <li><strong>Interview Preparation:</strong> Mock interviews with industry-specific questions and performance feedback.</li>
         </ul>
      `
    },
    {
        id: 'analytics-reports',
        icon: <Assessment sx={{ fontSize: 48 }} />,
        title: 'Analytics & Reports',
        description: 'Access detailed analytics about job market trends and your application performance.',
        features: ['Market Trends', 'Salary Reports', 'Application Analytics', 'Industry Insights'],
        details: 'Make data-driven career decisions. View detailed reports on salary trends for your role and location. Track the performance of your applications to see what is working and where you can improve. deeper insights into industry hiring patterns.',
        fullDescription: `
        <p>Data is power. Our Analytics & Reports tool gives you a competitive edge by providing deep insights into the job market and your own performance.</p>

        <h3>Key Metrics</h3>
        <ul>
            <li><strong>Application Funnel:</strong> See where you drop off in the hiring process (Application -> Interview -> Offer).</li>
            <li><strong>Market Demand:</strong> Identify which skills are most in demand for your role.</li>
            <li><strong>Salary Benchmarking:</strong> Compare your salary expectations against current market rates.</li>
        </ul>
      `
    },
    {
        id: 'support',
        icon: <Support sx={{ fontSize: 48 }} />,
        title: '24/7 Support',
        description: 'Get round-the-clock support from our dedicated team of career experts.',
        features: ['Live Chat', 'Email Support', 'Phone Support', 'FAQ Resources'],
        details: 'We are here for you anytime, anywhere. Whether you have a technical issue with the platform or a quick question about an application, our support team is available 24/7 via chat, email, or phone to ensure a smooth experience.',
        fullDescription: `
        <p>We believe in supporting our users every step of the way. Our dedicated support team is available 24/7 to assist you with any questions or issues.</p>
      `
    },
    {
        id: 'privacy-security',
        icon: <Security sx={{ fontSize: 48 }} />,
        title: 'Privacy & Security',
        description: 'Your data is protected with enterprise-grade security and privacy measures.',
        features: ['Data Encryption', 'Privacy Controls', 'Secure Payments', 'GDPR Compliant'],
        details: 'Your privacy is our top priority. We use bank-level encryption to secure your personal data. You have full control over your profile visibility and who can contact you. We are fully GDPR and CCPA compliant to ensure your rights are protected.',
        fullDescription: `
        <p>Security is at the core of our platform. We employ state-of-the-art security measures to ensure your personal and professional data remains confidential and safe.</p>
      `
    }
];
