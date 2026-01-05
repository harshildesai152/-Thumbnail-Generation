import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3005/api';

export const api = {
  auth: {
    register: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      return result;
    },
    
    login: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      return result;
    },
    
    getProfile: async () => {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }
      
      return result;
    },

    logout: () => {
      Cookies.remove('token');
      Cookies.remove('refreshToken');
    }
  },

  jobs: {
    getUserJobs: async (page = 1, limit = 10) => {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/jobs?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch jobs');
      }

      return result;
    },

    getJobById: async (jobId: string) => {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch job');
      }

      return result;
    }
  },

  upload: {
    uploadFiles: async (files: FileList) => {
      const token = Cookies.get('token');
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    }
  }
};
