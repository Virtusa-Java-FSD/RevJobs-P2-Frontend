import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { theme } from './theme/index';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import './index.css';
import './styles/animations.css';
import './styles/revjobs-theme.css';
import './styles/global-theme.css';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Applications from './pages/Applications';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthPage from './components/auth/AuthPage';
import ForgotPassword from './components/auth/ForgotPassword';
import JobDetail from './components/jobs/JobDetail';
import CreateJob from './components/jobs/CreateJob';
import EmployerDashboard from './pages/EmployerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CandidateProfile from './pages/CandidateProfile';
import JobSeekerProfile from './components/profile/JobSeekerProfile';
import MessageCenter from './components/messaging/MessageCenter';



const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/applications" element={
          <ProtectedRoute roles={['JOB_SEEKER']}>
            <Applications />
          </ProtectedRoute>
        } />
        <Route path="/candidate/:id" element={
          <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
            <CandidateProfile />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute roles={['JOB_SEEKER']}>
            <JobSeekerProfile />
          </ProtectedRoute>
        } />

        <Route path="/messages" element={
          <ProtectedRoute>
            <MessageCenter />
          </ProtectedRoute>
        } />

        <Route path="/employer/dashboard" element={
          <ProtectedRoute roles={['RECRUITER']}>
            <EmployerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/recruiter/dashboard" element={
          <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        } />

        <Route path="/employer/jobs/create" element={
          <ProtectedRoute roles={['RECRUITER']}>
            <CreateJob />
          </ProtectedRoute>
        } />

        <Route path="/jobs/create" element={
          <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
            <CreateJob />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app-theme">
          <ToastProvider>
            <AuthProvider>
              <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <AppRoutes />
              </Router>
            </AuthProvider>
          </ToastProvider>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;