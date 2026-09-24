import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/appRoutes";

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.DASHBOARD;

  if (token) return <Navigate to={from} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: 400 }}>
        <div className="mb-4">
          <span className="fw-bold text-dark" style={{ fontSize: "18px" }}>Anvaya</span>
          <span className="text-secondary ms-1" style={{ fontSize: "13px" }}>CRM</span>
          <p className="text-muted small mb-0 mt-1">Log in to manage your leads</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-muted small mt-3 mb-0">
          No account?{" "}
          <Link to={ROUTES.SIGNUP} state={location.state}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};
