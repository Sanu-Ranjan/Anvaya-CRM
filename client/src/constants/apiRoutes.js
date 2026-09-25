const API_BASE_URL = import.meta.env.VITE_BACKEND;

export const API_ROUTES = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
  },

  leads: {
    getAll: `${API_BASE_URL}/leads`,
    getById: (id) => `${API_BASE_URL}/leads/${id}`,
    add: `${API_BASE_URL}/leads`,
    update: (id) => `${API_BASE_URL}/leads/${id}`,
    delete: (id) => `${API_BASE_URL}/leads/${id}`,
  },

  agents: {
    getAll: `${API_BASE_URL}/agents`,
    getById: (id) => `${API_BASE_URL}/agents/${id}`,
    add: `${API_BASE_URL}/agents`,
    delete: (id) => `${API_BASE_URL}/agents/${id}`,
    setPassword: (id) => `${API_BASE_URL}/agents/${id}/password`,
  },

  comments: {
    getByLead: (leadId) => `${API_BASE_URL}/leads/${leadId}/comments`,
    add: (leadId) => `${API_BASE_URL}/leads/${leadId}/comments`,
  },

  tags: {
    getAll: `${API_BASE_URL}/tags`,
    add: `${API_BASE_URL}/tags`,
  },

  reports: {
    lastWeek: `${API_BASE_URL}/report/last-week`,
    pipeline: `${API_BASE_URL}/report/pipeline`,
    closedByAgent: `${API_BASE_URL}/report/closed-by-agent`,
    statusDistribution: `${API_BASE_URL}/report/status-distribution`,
  },
};
