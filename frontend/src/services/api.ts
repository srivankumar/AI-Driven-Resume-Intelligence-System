const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // If not JSON, read as text for better error message
    const text = await response.text();
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred');
  }
  return data;
};

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

export const jobApi = {
  getActiveJobs: async () => {
    const response = await fetch(`${API_URL}/jobs/active`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAllJobs: async () => {
    const response = await fetch(`${API_URL}/jobs/all`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getJobById: async (id: string) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  createJob: async (data: {
    title: string;
    description: string;
    skills: string;
    experience: string;
    application_deadline: string;
  }) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateJob: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  endApplication: async (id: string) => {
    const response = await fetch(`${API_URL}/jobs/${id}/end`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteJob: async (id: string) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

export const applicationApi = {
  apply: async (jobId: string, resumeFile: File) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('resume', resumeFile);

    const response = await fetch(`${API_URL}/applications/apply`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(response);
  },

  checkApplicationStatus: async (jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/applications/check/${jobId}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (error) {
      // Return default response if check fails
      return { applied: false };
    }
  },

  getMyApplications: async () => {
    const response = await fetch(`${API_URL}/applications/my-applications`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAllApplications: async (filters?: {
    jobId?: string;
    status?: string;
    minScore?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minScore) params.append('minScore', filters.minScore.toString());

    const response = await fetch(
      `${API_URL}/applications/all?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/applications/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  getTopCandidates: async (limit = 10) => {
    const response = await fetch(
      `${API_URL}/applications/top-candidates?limit=${limit}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },

  getResumeDownloadUrl: async (key: string) => {
    const response = await fetch(
      `${API_URL}/applications/download/${encodeURIComponent(key)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return handleResponse(response);
  },
};
