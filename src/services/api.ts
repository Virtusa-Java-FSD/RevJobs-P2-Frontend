import { handleApiResponse, safeJsonParse } from '../utils/apiHelper';

export const API_BASE_URL = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
};

export const api = {
    // Auth endpoints
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await handleApiResponse(response) || {};
    },

    register: async (userData: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await handleApiResponse(response) || {};
    },

    // Jobs endpoints
    getJobs: async () => {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const result = await response.json();
        return result.data || result;
    },

    getJobById: async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch job');
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching job:', error);
            throw error;
        }
    },

    // Companies endpoints
    getCompanies: async () => {
        // There is no dedicated companies endpoint in the current backend
        // We derive it from jobs usually, or return empty if not supported
        return [];
    }
};

// Auth API
export const authAPI = {
    login: api.login,
    register: api.register
};

// Job API
export const jobAPI = {
    getJobs: async (filters?: any) => {
        try {
            const queryParams = filters ? new URLSearchParams(filters).toString() : '';
            const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },
    getJobById: api.getJobById,
    createJob: async (jobData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create job');
            }

            const result = await response.json();

            // Trigger storage event or custom event for real-time update if needed
            window.dispatchEvent(new CustomEvent('jobCreated', { detail: result }));

            return result.data || result;
        } catch (error: any) {
            console.error('Error creating job:', error);
            throw error;
        }
    },
    getJobsByRecruiter: async () => {
        try {
            const user = getCurrentUser();
            if (!user.id) {
                console.warn('No logged-in user found for recruiter jobs');
                return [];
            }

            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${user.id}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) return [];
            const apiResponse = await response.json();
            return apiResponse.data || apiResponse;
        } catch (error) {
            console.error('Error fetching recruiter jobs:', error);
            return [];
        }
    },
    searchJobs: async (keyword: string) => {
        // Current backend doesn't support search query param apparently, 
        // so we fetch all and filter client side or implement search in backend.
        // Assuming client side filtering for now as fallback.
        try {
            const jobs = await jobAPI.getJobs();
            if (!keyword.trim()) {
                return jobs;
            }
            const lower = keyword.toLowerCase();
            return jobs.filter((job: any) =>
                job.title?.toLowerCase().includes(lower) ||
                job.description?.toLowerCase().includes(lower) ||
                job.companyName?.toLowerCase().includes(lower)
            );
        } catch (error) {
            console.error('Error searching jobs:', error);
            return [];
        }
    },
    getCompanies: async () => {
        try {
            const jobs = await jobAPI.getJobs();
            const companyMap = new Map();

            jobs.forEach((job: any) => {
                const companyName = job.companyName;
                if (companyName) {
                    if (!companyMap.has(companyName)) {
                        companyMap.set(companyName, {
                            name: companyName,
                            jobCount: 1,
                            location: job.location
                        });
                    } else {
                        companyMap.get(companyName).jobCount++;
                    }
                }
            });

            return Array.from(companyMap.values());
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }
};

// Application API
export const applicationAPI = {
    apply: async (applicationData: {
        jobId: number;
        coverLetter: string;
        resumeUrl: string;
        companyName?: string;
        jobTitle?: string;
        applicantName?: string;
        applicantPhone?: string;
        gender?: string;
        nationality?: string;
        currentLocation?: string;
        yearsOfExperience?: number;
        currentCompany?: string;
        education?: string;
        skills?: string;
        linkedinUrl?: string;
        portfolioUrl?: string;
        expectedSalary?: string;
        noticePeriod?: string;
    }) => {
        try {
            const user = getCurrentUser();
            const response = await fetch(`${API_BASE_URL}/applications`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...applicationData,
                    applicantId: user.id,
                    applicantEmail: user.email,
                    status: 'PENDING'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to apply');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error: any) {
            console.error('Error applying:', error);
            throw error;
        }
    },

    getMyApplications: async () => {
        try {
            const user = getCurrentUser();
            if (!user.id) return [];

            const response = await fetch(`${API_BASE_URL}/applications/applicant/${user.id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return [];
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    },

    getApplicationsByJob: async (jobId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return [];
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching job applications:', error);
            return [];
        }
    },

    uploadResume: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/applications/upload`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || 'Failed to upload file');
            }

            const result = await response.json();
            return result.url; // Backend returns { url: "/api/applications/files/xyz.pdf", message: "..." }
        } catch (error) {
            console.error('Error uploading resume:', error);
            throw error;
        }
    }
};

// Company API
export const companyAPI = {
    getCompanies: jobAPI.getCompanies
};

// User API
export const userAPI = {
    getProfile: async () => {
        try {
            const user = getCurrentUser();
            if (!user.email) throw new Error('No user email found');

            // Try fetching from backend first
            const response = await fetch(`${API_BASE_URL}/users/email/${user.email}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                return result.data || result;
            }

            // Fallback to localStorage if backend fails (e.g. if endpoint missing)
            console.warn('Backend profile fetch failed, using local storage');
            const profile = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
            return { ...profile, email: user.email };
        } catch (error) {
            console.error('Error fetching profile:', error);
            const user = getCurrentUser();
            return { email: user.email };
        }
    },
    updateProfile: async (userData: any) => {
        // current backend has no update profile endpoint, keeping local storage sync
        const user = getCurrentUser();
        const existingProfile = JSON.parse(localStorage.getItem(`userProfile_${user.email}`) || '{}');
        const updatedProfile = { ...existingProfile, ...userData, email: user.email };
        localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(updatedProfile));
        return updatedProfile;
    },
    getUserById: async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('User not found');
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },
    getAllUsers: async () => {
        // Admin only, not implemented in backend controller
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return registeredUsers;
    }
};

// Message API
export const messageAPI = {
    getMessages: async () => {
        try {
            const user = getCurrentUser();
            if (!user.id) return [];

            const response = await fetch(`${API_BASE_URL}/messages/user/${user.id}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                // Transform backend message list to conversation format if needed by frontend
                // For now, returning the raw list, assuming frontend treats it as list of messages
                return result.data || result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    },
    sendMessage: async (messageData: any) => {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(messageData)
        });
        const result = await response.json();
        return result.data || result;
    }
};

// Notification API
export const notificationAPI = {
    getNotifications: async () => {
        try {
            const user = getCurrentUser();
            if (!user.id) return [];

            const response = await fetch(`${API_BASE_URL}/notifications/user/${user.id}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const result = await response.json();
                return result.data || result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },
    markAsRead: async (notificationId: string | number) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },
    markAllAsRead: async () => {
        try {
            const user = getCurrentUser();
            if (!user.id) return;
            await fetch(`${API_BASE_URL}/notifications/user/${user.id}/read-all`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
};

// Saved Jobs API
export const savedJobAPI = {
    saveJob: async (userId: number, jobId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs/${jobId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to save job');
            return await response.json();
        } catch (error) {
            console.error('Error saving job:', error);
            throw error;
        }
    },

    unsaveJob: async (userId: number, jobId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs/${jobId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to unsave job');
        } catch (error) {
            console.error('Error unsaving job:', error);
            throw error;
        }
    },

    getSavedJobs: async (userId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch saved jobs');
            const savedJobs = await response.json();

            // Fetch full job details for each saved job
            const jobPromises = savedJobs.map(async (saved: any) => {
                try {
                    return await jobAPI.getJobById(saved.jobId.toString());
                } catch (error) {
                    console.error(`Failed to fetch job ${saved.jobId}:`, error);
                    return null;
                }
            });

            const jobs = await Promise.all(jobPromises);
            return jobs.filter(job => job !== null);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            return [];
        }
    },

    isSaved: async (userId: number, jobId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs/${jobId}/exists`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return false;
            const result = await response.json();
            return result.saved || false;
        } catch (error) {
            console.error('Error checking if job is saved:', error);
            return false;
        }
    }
};
