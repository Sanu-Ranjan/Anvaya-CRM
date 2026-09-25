import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/appRoutes";
import { PasswordInput } from "../components/PasswordInput";

export const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  // forced = still on the temporary password the admin set
  const forced = user?.mustChangePassword;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }
    if (form.newPassword !== form.confirm) {
      return toast.error("New passwords don't match.");
    }
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success("Password updated.");
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: 400 }}>
        <div className="mb-4">
          <span className="fw-bold text-dark" style={{ fontSize: "18px" }}>Anvaya</span>
          <span className="text-secondary ms-1" style={{ fontSize: "13px" }}>CRM</span>
          <p className="text-muted small mb-0 mt-1">
            {forced
              ? "You're using a temporary password. Set your own to continue."
              : "Change your password"}
          </p>
        </div>

        {user?.isDemo && (
          <div className="alert alert-warning small py-2">Demo account passwords can't be changed.</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{forced ? "Temporary Password" : "Current Password"}</label>
            <PasswordInput name="currentPassword" value={form.currentPassword} onChange={handleChange} required autoComplete="current-password" />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <PasswordInput name="newPassword" placeholder="At least 6 characters" value={form.newPassword} onChange={handleChange} required autoComplete="new-password" />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <PasswordInput name="confirm" value={form.confirm} onChange={handleChange} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading || user?.isDemo}>
            {loading ? "Saving..." : "Update Password"}
          </button>
        </form>

        {forced ? (
          <button className="btn btn-link btn-sm mt-3 p-0 text-danger" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <button className="btn btn-link btn-sm mt-3 p-0 text-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};
