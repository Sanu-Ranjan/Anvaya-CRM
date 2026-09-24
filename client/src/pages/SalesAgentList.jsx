import { useNavigate, Link } from "react-router-dom";
import { API_ROUTES } from "../constants/apiRoutes";
import { ROUTES } from "../constants/appRoutes";
import { useGet } from "../hooks/useGet";
import { useAuth } from "../contexts/AuthContext";

export const SalesAgentList = () => {
  const { data: agents, loading, error } = useGet(API_ROUTES.agents.getAll);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  if (loading) return <p className="p-3">Loading...</p>;
  if (error) return <p className="p-3 text-danger">Error: {error}</p>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Sales Agents</h5>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.AGENT_NEW)}>
            + Add New Agent
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr><td colSpan={3} className="text-muted text-center py-3">No agents found.</td></tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id}>
                    <td>
                      <Link to={ROUTES.LEADS_BY_AGENT(agent._id)} className="text-decoration-none fw-semibold">
                        {agent.name}
                      </Link>
                    </td>
                    <td>{agent.email}</td>
                    <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
