import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/appRoutes";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { label: "Dashboard", route: ROUTES.DASHBOARD },
  { label: "Leads", route: ROUTES.LEADS },
  { label: "Sales Agents", route: ROUTES.AGENTS },
  { label: "Reports", route: ROUTES.REPORTS },
  { label: "Settings", route: ROUTES.SETTINGS, adminOnly: true },
];

export const Layout = () => {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const roleLabel = isAdmin ? "Admin" : "Sales Agent";
  const navigate = useNavigate();

  // agents still see admin-only links, just dimmed and disabled
  // (guests see them normally, clicking sends them to login)
  const isLocked = (l) => isLoggedIn && l.adminOnly && !isAdmin;

  const handleLogout = () => {
    logout();
    toast.info("Logged out.");
    navigate(ROUTES.DASHBOARD);
  };

  // temporary password: nothing else until it's changed
  if (user?.mustChangePassword) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }

  return (
    <>
      {/* Mobile top nav — outside the grid */}
      <nav className="d-flex d-md-none gap-2 p-2 border-bottom overflow-auto flex-wrap">
        {links.map((l) =>
          isLocked(l) ? (
            <span
              key={l.label}
              className="btn btn-sm btn-outline-secondary text-nowrap"
              title="Admin only"
              style={{ opacity: 0.45, cursor: "not-allowed" }}
            >
              {l.label}
            </span>
          ) : (
            <NavLink
              key={l.label}
              to={l.route}
              end={l.route === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"} text-nowrap`
              }
            >
              {l.label}
            </NavLink>
          ),
        )}
        {isLoggedIn ? (
          <button
            className="btn btn-sm btn-outline-danger text-nowrap ms-auto"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="btn btn-sm btn-primary text-nowrap ms-auto"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Log In
          </button>
        )}
      </nav>

      <div className="row g-0" style={{ minHeight: "100vh" }}>
        {/* Desktop sidebar */}
        <div
          className="col-md-2 d-none d-md-flex flex-column border-end bg-light"
          style={{ minHeight: "100vh" }}
        >
          <div className="px-4 py-4 border-bottom">
            <Link to={ROUTES.DASHBOARD} className="text-decoration-none">
              <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>
                Anvaya
              </span>
              <span className="text-secondary ms-1" style={{ fontSize: "12px" }}>
                CRM
              </span>
            </Link>
          </div>
          <nav className="flex-column mt-2">
            {links.map((l) =>
              isLocked(l) ? (
                <span
                  key={l.label}
                  className="d-block px-4 py-2 text-secondary border-start border-3 border-transparent"
                  title="Admin only"
                  style={{
                    fontSize: "14px",
                    opacity: 0.45,
                    cursor: "not-allowed",
                  }}
                >
                  {l.label} 🔒
                </span>
              ) : (
                <NavLink
                  key={l.label}
                  to={l.route}
                  end={l.route === ROUTES.DASHBOARD}
                  className={({ isActive }) =>
                    `d-block px-4 py-2 text-decoration-none border-start border-3 ${
                      isActive
                        ? "text-primary fw-semibold border-primary"
                        : "text-secondary border-transparent"
                    }`
                  }
                  style={{ fontSize: "14px" }}
                >
                  {l.label}
                </NavLink>
              ),
            )}
          </nav>

          {/* logged in user, or a login button for guests */}
          {!isLoggedIn ? (
            <div className="mt-auto px-4 py-3 border-top">
              <div className="text-secondary" style={{ fontSize: "12px" }}>
                Browsing as guest
              </div>
              <button className="btn btn-sm btn-primary w-100 mt-2" onClick={() => navigate(ROUTES.LOGIN)}>
                Log In
              </button>
            </div>
          ) : (
          <div className="mt-auto px-4 py-3 border-top">
            <div
              className="fw-semibold text-dark text-truncate"
              style={{ fontSize: "14px" }}
            >
              {user?.name ?? "..."}
            </div>
            <div
              className="text-secondary text-truncate"
              style={{ fontSize: "12px" }}
            >
              {user?.email}
            </div>
            {user && (
              <span
                className={`badge mt-1 ${isAdmin ? "bg-primary" : "bg-secondary"}`}
              >
                {roleLabel}
              </span>
            )}
            <button
              className="btn btn-sm btn-outline-secondary w-100 mt-3"
              onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
            >
              Change Password
            </button>
            <button
              className="btn btn-sm btn-outline-danger w-100 mt-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          )}
        </div>

        {/* Main content */}
        <div className="col-12 col-md-10">
          <Outlet />
        </div>
      </div>
    </>
  );
};
