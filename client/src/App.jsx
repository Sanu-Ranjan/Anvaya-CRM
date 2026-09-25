import { ROUTES_DEFINITION } from "./constants/appRoutes";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { LeadAdd } from "./pages/LeadAdd";
import { LeadList } from "./pages/LeadList";
import { LeadManagement } from "./pages/LeadManagement";
import { LeadStatus } from "./pages/LeadStatus";
import { Reports } from "./pages/Reports";
import { SalesAgentList } from "./pages/SalesAgentList";
import { SalesAgentView } from "./pages/SalesAgentView";
import { SalesAgentAdd } from "./pages/SalesAgentAdd";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ChangePassword } from "./pages/ChangePassword";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// AuthProvider sits inside the router so pages can use useNavigate with it
const Root = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: ROUTES_DEFINITION.LOGIN,  element: <Login /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES_DEFINITION.CHANGE_PASSWORD, element: <ChangePassword /> },
        ],
      },
      {
        element: <Layout />,
        children: [
          // viewing is open to everyone
          { path: ROUTES_DEFINITION.DASHBOARD,       element: <Dashboard /> },
          { path: ROUTES_DEFINITION.LEADS,           element: <LeadList /> },
          { path: ROUTES_DEFINITION.LEAD_DETAIL,     element: <LeadManagement /> },
          { path: ROUTES_DEFINITION.AGENTS,          element: <SalesAgentList /> },
          { path: ROUTES_DEFINITION.LEADS_BY_AGENT,  element: <SalesAgentView /> },
          { path: ROUTES_DEFINITION.LEADS_BY_STATUS, element: <LeadStatus /> },
          { path: ROUTES_DEFINITION.REPORTS,         element: <Reports /> },
          {
            // adding a lead needs login
            element: <ProtectedRoute />,
            children: [
              { path: ROUTES_DEFINITION.LEAD_NEW, element: <LeadAdd /> },
            ],
          },
          {
            // admin only pages
            element: <ProtectedRoute adminOnly />,
            children: [
              { path: ROUTES_DEFINITION.AGENT_NEW, element: <SalesAgentAdd /> },
              { path: ROUTES_DEFINITION.SETTINGS,  element: <Settings /> },
            ],
          },
        ],
      },
    ],
  },
]);

export const App = () => (
  <>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </>
);
