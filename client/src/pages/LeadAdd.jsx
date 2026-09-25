import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES } from "../constants/apiRoutes";
import { ROUTES } from "../constants/appRoutes";
import { useGet } from "../hooks/useGet";
import { post } from "../api/client";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const SOURCES = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

export const LeadAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", source: "", salesAgent: "", status: "New", priority: "Medium", timeToClose: "", tags: [],
  });
  const [loading, setLoading] = useState(false);
  const { isAgent, user } = useAuth();
  // agents always create leads for themselves
  const salesAgent = isAgent ? user?.salesAgent ?? "" : form.salesAgent;

  const { data: agents } = useGet(API_ROUTES.agents.getAll);
  const { data: tags } = useGet(API_ROUTES.tags.getAll);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleTagChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm({ ...form, tags: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post(API_ROUTES.leads.add, { ...form, salesAgent });
      toast.success("Lead created successfully!");
      navigate(ROUTES.LEADS);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <button className="btn btn-link p-0 mb-3 text-secondary small text-decoration-none" onClick={() => navigate(ROUTES.LEADS)}>
        ← Back to Leads
      </button>

      <h5 className="mb-4">Add New Lead</h5>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Lead Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Lead Source</label>
                <select name="source" className="form-select" value={form.source} onChange={handleChange} required>
                  <option value="">Select Source</option>
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Sales Agent</label>
                <select name="salesAgent" className="form-select" value={salesAgent} onChange={handleChange} required disabled={isAgent} title={isAgent ? "New leads are assigned to you" : undefined}>
                  <option value="">Select Agent</option>
                  {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Lead Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Time to Close (days)</label>
                <input type="number" name="timeToClose" className="form-control" value={form.timeToClose} onChange={handleChange} min={1} required />
              </div>
              <div className="col-12">
                <label className="form-label">Tags <span className="text-muted small">(hold Ctrl/Cmd to select multiple)</span></label>
                <select multiple className="form-select" value={form.tags} onChange={handleTagChange}>
                  {tags.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
