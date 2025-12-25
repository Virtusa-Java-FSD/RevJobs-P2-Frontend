# RevJobs P1 - Monolithic Job Board & Recruitment Platform

A modern, responsive job board and recruitment platform built with React.js, Material-UI, and TypeScript.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based login/registration with role-based access
- **Role-Based Dashboards**: Separate interfaces for Job Seekers, Employers, and Admins
- **Job Management**: Create, view, search, and apply for jobs
- **Profile Management**: Complete profile system for job seekers
- **Real-time Messaging**: Communication between employers and candidates
- **Admin Panel**: Comprehensive management of users, jobs, and companies

### UI/UX Features
- **Modern Design**: Professional LinkedIn/Naukri-inspired interface
- **Responsive Layout**: Mobile-first design with perfect tablet/desktop support
- **Material-UI Theme**: Custom theme with consistent branding
- **Rich Text Editor**: React-Quill integration for job descriptions
- **Advanced Filters**: Location, salary, experience level, job type filtering
- **Toast Notifications**: Global notification system
- **Loading States**: Professional loading spinners and states

## 🛠 Tech Stack

- **Frontend**: React.js 19.2.0 (Functional Components)
- **Routing**: React Router DOM v6
- **UI Framework**: Material-UI v5 with custom theme
- **HTTP Client**: Axios with interceptors
- **Rich Text**: React-Quill
- **Styling**: CSS, SCSS, Material-UI styled components
- **TypeScript**: Full type safety
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── assets/                 # Images and icons
├── components/            
│   ├── auth/              # Login, Register components
│   ├── common/            # Layout, shared components
│   ├── jobs/              # Job listing, details, creation
│   ├── profile/           # User profile components
│   ├── messaging/         # Message center
│   ├── admin/             # Admin dashboard components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts (Auth, Toast)
├── pages/                 # Main page components
├── services/              # API services and Axios config
├── styles/                # Global styles and themes
├── theme/                 # Material-UI theme configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🎯 User Roles & Features

### Job Seeker
- Browse and search jobs with advanced filters
- View detailed job descriptions with rich text
- Apply to jobs with cover letters
- Manage complete profile with resume upload
- Track application status
- Message with employers

### Employer
- Access to employer dashboard
- Create and manage job postings
- View and manage applications
- Message with candidates
- Company profile management

### Admin
- Comprehensive admin dashboard
- User management (view, edit, delete)
- Job management and moderation
- Company verification and management
- Analytics and reporting
- System-wide controls

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd revjob_p1/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Accounts

The application includes demo accounts for testing:

- **Job Seeker**: john.doe@example.com / password123
- **Employer**: employer@company.com / password123  
- **Admin**: admin@revjobs.com / password123

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px and above

## 🎨 Design System

### Color Palette
- **Primary**: #0066cc (Professional Blue)
- **Secondary**: #ff6b35 (Accent Orange)
- **Background**: #f8fafc (Light Gray)
- **Text**: #1a202c (Dark Gray)

### Typography
- **Font Family**: Inter, Roboto, Helvetica, Arial
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- Custom Material-UI theme with consistent styling
- Hover animations and transitions
- Professional shadows and borders
- Consistent spacing and alignment

## 🔧 Key Components

### Authentication
- JWT token storage in localStorage
- Axios interceptors for automatic token attachment
- Role-based route protection
- Automatic redirects based on user role

### Job Management
- Advanced search and filtering
- Pagination support
- Rich text job descriptions
- Application tracking
- Salary range filtering

### Profile System
- Resume upload (PDF support)
- Skills management
- Work experience timeline
- Personal information management

### Admin Dashboard
- User management with pagination
- Job moderation tools
- Company verification system
- Analytics and reporting

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:8080/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- React team for the amazing framework
- All contributors and testers

---

Built with ❤️ for the RevJobs recruitment platform