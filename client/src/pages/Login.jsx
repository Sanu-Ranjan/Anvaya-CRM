import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/appRoutes";
import { PasswordInput } from "../components/PasswordInput";

// demo accounts come from `npm run seed`
const ROLE_TABS = {
  agent: {
    label: "Sales Agent",
    demo: { email: "john@anvaya.com", password: "agent123" },
  },
  admin: {
    label: "Admin",
    demo: { email: "admin@anvaya.com", password: "admin123" },
  },
};

export const Login = () => {
  const [role, setRole] = useState("agent");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.DASHBOARD;

  if (token) return <Navigate to={from} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchRole = (next) => {
    setRole(next);
    setForm({ email: "", password: "" });
  };

  // used by the form and by the demo button (one click, no typing)
  const doLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login(email, password, role);
      if (user.mustChangePassword) {
        toast.info("Please set your own password to continue.");
        navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
        return;
      }
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(form);
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: 400 }}>
        <div className="mb-4">
          <span className="fw-bold text-dark" style={{ fontSize: "18px" }}>Anvaya</span>
          <span className="text-secondary ms-1" style={{ fontSize: "13px" }}>CRM</span>
          <p className="text-muted small mb-0 mt-1">Log in to manage your leads</p>
        </div>

        <ul className="nav nav-pills nav-fill mb-3">
          {Object.entries(ROLE_TABS).map(([key, tab]) => (
            <li className="nav-item" key={key}>
              <button
                type="button"
                className={`nav-link ${role === key ? "active" : ""}`}
                onClick={() => switchRole(key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <PasswordInput name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : `Log In as ${ROLE_TABS[role].label}`}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => doLogin(ROLE_TABS[role].demo)}
            disabled={loading}
          >
            Log in as demo {ROLE_TABS[role].label.toLowerCase()}
          </button>
        </form>

        {role === "agent" ? (
          <p className="text-muted small mt-3 mb-0">
            Your admin gives you your login. On first login you'll set your own password.
          </p>
        ) : (
          <p className="text-muted small mt-3 mb-0">
            Admins manage sales agents and can delete agents and leads.
          </p>
        )}
      </div>
    </div>
  );
};
