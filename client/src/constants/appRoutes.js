const ROUTES = {
  DASHBOARD: "/",
  LEADS: "/leads",
  LEAD_NEW: "/leads/new",
  LEAD_DETAIL: (id) => `/leads/${id}`,
  LEADS_BY_STATUS: (status) => `/leads/status/${status}`,
  LEADS_BY_AGENT: (id) => `/leads/by-agent/${id}`,
  AGENTS: "/agents",
  AGENT_NEW: "/agents/new",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  LOGIN: "/login",
  CHANGE_PASSWORD: "/change-password",
};

const ROUTES_DEFINITION = {
  DASHBOARD: "/",
  LEADS: "/leads",
  LEAD_DETAIL: "/leads/:id",
  LEAD_NEW: "/leads/new",
  LEADS_BY_STATUS: "/leads/status/:status",
  LEADS_BY_AGENT: "/leads/by-agent/:agentId",
  AGENTS: "/agents",
  AGENT_NEW: "/agents/new",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  LOGIN: "/login",
  CHANGE_PASSWORD: "/change-password",
};

export { ROUTES, ROUTES_DEFINITION };
