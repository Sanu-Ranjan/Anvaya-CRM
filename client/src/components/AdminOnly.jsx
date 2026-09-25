import { useAuth } from "../contexts/AuthContext";

// wraps an admin-only control: admins get it as is, guests get it as is
// too (the protected route sends them to login), and agents see it
// dimmed and disabled with an "Admin only" tooltip
export const AdminOnly = ({ children }) => {
  const { isAdmin, isLoggedIn } = useAuth();
  if (isAdmin || !isLoggedIn) return children;

  return (
    <span
      className="d-inline-block"
      title="Admin only"
      style={{ opacity: 0.45, cursor: "not-allowed" }}
    >
      <span style={{ pointerEvents: "none" }} aria-disabled="true">
        {children}
      </span>
    </span>
  );
};
