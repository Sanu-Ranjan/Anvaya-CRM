import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ROUTES } from "../constants/apiRoutes";
import { ROUTES } from "../constants/appRoutes";
import { useGet } from "../hooks/useGet";
import { post, patch } from "../api/client";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const SOURCES = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

export const LeadManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState(null);
  const [lead, setLead] = useState(null);

  const { data: fetchedLead, loading: leadLoading, error: leadError } = useGet(API_ROUTES.leads.getById(id));
  const { data: fetchedComments, loading: commentsLoading, error: commentsError } = useGet(API_ROUTES.comments.getByLead(id));
  const { data: agents } = useGet(API_ROUTES.agents.getAll);
  const { data: tags } = useGet(API_ROUTES.tags.getAll);

  const loading = leadLoading || commentsLoading;
  const loadingErr = leadError || commentsError;

  const { isAdmin, user } = useAuth();

  const displayLead = lead ?? fetchedLead;
  // admin edits any lead, agents only their own
  const canEdit =
    isAdmin || String(displayLead?.salesAgent?._id) === String(user?.salesAgent);
  const displayComments = comments ?? fetchedComments;

  const handleEdit = () => {
    setForm({
      name: displayLead.name,
      source: displayLead.source,
      salesAgent: displayLead.salesAgent?._id,
      status: displayLead.status,
      priority: displayLead.priority,
      timeToClose: displayLead.timeToClose,
      tags: displayLead.tags,
    });
    setEditing(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleTagChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm({ ...form, tags: selected });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await patch(API_ROUTES.leads.update(id), form);
      setLead(updated);
      setEditing(false);
      toast.success("Lead updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // author is the logged in user, set by the server
      const newComment = await post(API_ROUTES.comments.add(id), { commentText: comment });
      setComments([...(displayComments ?? []), newComment]);
      setComment("");
      toast.success("Comment added!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-3">Loading...</p>;
  if (loadingErr) return <p className="p-3 text-danger">Error: {loadingErr}</p>;

  return (
    <div className="p-3">
      <button className="btn btn-link p-0 mb-3 text-secondary small text-decoration-none" onClick={() => navigate(ROUTES.LEADS)}>
        ← Back to Leads
      </button>

      <h5 className="mb-4">{displayLead.name}</h5>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Lead Details</span>
              {!editing && (canEdit ? (
                <button className="btn btn-outline-primary btn-sm" onClick={handleEdit}>Edit</button>
              ) : (
                <span title="Only the assigned agent or an admin can edit this lead" style={{ cursor: "not-allowed" }}>
                  <button className="btn btn-outline-primary btn-sm" disabled style={{ pointerEvents: "none" }}>Edit</button>
                </span>
              ))}
            </div>
            <div className="card-body">
              {!editing ? (
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: 160 }}>Lead Name</td><td><strong>{displayLead.name}</strong></td></tr>
                    <tr><td className="text-muted">Sales Agent</td><td>{displayLead.salesAgent?.name}</td></tr>
                    <tr><td className="text-muted">Source</td><td>{displayLead.source}</td></tr>
                    <tr><td className="text-muted">Status</td><td><span className="badge bg-secondary">{displayLead.status}</span></td></tr>
                    <tr><td className="text-muted">Priority</td><td>{displayLead.priority}</td></tr>
                    <tr><td className="text-muted">Time to Close</td><td>{displayLead.timeToClose} days</td></tr>
                    <tr><td className="text-muted">Tags</td><td>{displayLead.tags?.join(", ") || "None"}</td></tr>
                  </tbody>
                </table>
              ) : (
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Lead Name</label>
                      <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Lead Source</label>
                      <select name="source" className="form-select" value={form.source} onChange={handleChange}>
                        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Sales Agent</label>
                      <select name="salesAgent" className="form-select" value={form.salesAgent} onChange={handleChange} disabled={!isAdmin} title={isAdmin ? undefined : "Only an admin can reassign leads"}>
                        {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Status</label>
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
                      <label className="form-label">Time to Close</label>
                      <input type="number" name="timeToClose" className="form-control" value={form.timeToClose} onChange={handleChange} min={1} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Tags <span className="text-muted small">(Ctrl/Cmd for multiple)</span></label>
                      <select multiple className="form-select" value={form.tags} onChange={handleTagChange}>
                        {tags.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-header fw-semibold">Comments</div>
            <div className="card-body">
              <form onSubmit={handleCommentSubmit} className="mb-3">
                <div className="mb-2">
                  <textarea className="form-control" rows={3} placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Comment"}
                </button>
              </form>

              <hr />

              {displayComments.length === 0 ? (
                <p className="text-muted small mb-0">No comments yet.</p>
              ) : (
                displayComments.map((c) => (
                  <div key={c._id} className="border-bottom py-2">
                    <div className="small text-muted">
                      {c.author?.name ?? "Unknown"} — {new Date(c.createdAt).toLocaleString()}
                    </div>
                    <div>{c.commentText}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
