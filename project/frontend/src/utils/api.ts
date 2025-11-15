// src/utils/api.ts

// Automatically switch between local & production API
export const API_BASE_URL = import.meta.env.PROD
  ? "https://smart-waste-reporting-system.onrender.com"
  : "http://localhost:5000";

// Utility function to get full image URL
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it starts with /uploads, prepend API_BASE_URL
  if (imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // If it's a relative path, construct full URL
  if (imageUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imageUrl}`;
  }
  
  // Otherwise, assume it's a relative path from uploads
  return `${API_BASE_URL}/uploads/${imageUrl}`;
};

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Authentication API calls
export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to login");
  }
  return res.json();
};

export const registerUser = async (userData: { name: string; email: string; password: string; phone: string; role?: string }) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to register");
  }
  return res.json();
};

export const getCurrentUser = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

export const logoutUser = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to logout");
  return res.json();
};

// Reports API calls
export const getReports = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
};

export const getUserReports = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/reports/my-reports`, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch your reports");
  return res.json();
};

export const submitReport = async (data: any) => {
  const token = getToken();
  // Create FormData for file upload
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'location') {
      formData.append(key, JSON.stringify(data[key]));
    } else if (key !== 'image') {
      formData.append(key, data[key]);
    }
  });
  if (data.image) {
    formData.append('image', data.image);
  }

  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to submit report");
  }
  return res.json();
};

// Update report (assign/start/resolve)
export const updateReportStatus = async (
  reportId: string,
  body: Record<string, any>
) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update report");
  }
  return res.json();
};

export const assignReportToAgent = async (reportId: string, agentId: string) => {
  return updateReportStatus(reportId, { status: 'Assigned', assignedAgentId: agentId });
};

// Users/Workers API calls
export const getUsers = async (role?: string) => {
  const token = getToken();
  const url = role 
    ? `${API_BASE_URL}/api/users?role=${role}` 
    : `${API_BASE_URL}/api/users`;
  const res = await fetch(url, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const getWorkers = async () => {
  return getUsers('worker');
};

export const createWorker = async (workerData: { name: string; email: string; phone: string; password: string; location?: any }) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/workers`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(workerData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create worker");
  }
  return res.json();
};

export const updateUser = async (userId: string, userData: any) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update user");
  }
  return res.json();
};

export const updateProfile = async (profileData: { name?: string; phone?: string; location?: any; preferences?: any }) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update profile");
  }
  return res.json();
};

export const getAnalytics = async (days: number = 30) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/analytics?days=${days}`, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch analytics");
  }
  return res.json();
};

export const getLeaderboard = async (period: string = 'all') => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/rewards/leaderboard?period=${period}`, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch leaderboard");
  }
  return res.json();
};

// Search reports by ID or phone number
export const searchReports = async (query: string, type: 'id' | 'phone' = 'id') => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/reports/search?query=${encodeURIComponent(query)}&type=${type}`, {
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to search reports");
  }
  return res.json();
};

// Create task (assign report to worker)
export const createTask = async (taskData: {
  reportId: string;
  assignedAgentId: string;
  title?: string;
  description?: string;
  priority?: string;
  estimatedDuration?: number;
  scheduledDate?: string;
  dueDate?: string;
}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create task");
  }
  return res.json();
};
