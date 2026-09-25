import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "../constants/apiRoutes";
import { ROUTES } from "../constants/appRoutes";
import { post } from "../api/client";
import { toast } from "react-toastify";

export const SalesAgentAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post(API_ROUTES.agents.add, form);
      toast.success("Agent added. Share the email and temporary password with them.");
      navigate(ROUTES.AGENTS);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <button className="btn btn-link p-0 mb-3 text-secondary small text-decoration-none" onClick={() => navigate(ROUTES.AGENTS)}>
        ← Back to Agents
      </button>

      <h5 className="mb-4">Add New Agent</h5>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Temporary Password</label>
                <input type="text" name="password" className="form-control" value={form.password} onChange={handleChange} minLength={6} required autoComplete="off" />
                <div className="form-text">The agent will be asked to change it on first login.</div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Adding..." : "Add Agent"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
