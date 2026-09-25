import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/appRoutes";
import { API_ROUTES } from "../constants/apiRoutes";
import { get, post } from "../api/client";
import { AUTH_LOGOUT_EVENT, clearToken, getToken, setToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  // any 401 from api/client fires this event
  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, logout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
  }, [logout]);

  // on page load (or after login) fetch the user behind the saved token
  useEffect(() => {
    if (!token) return;
    get(API_ROUTES.auth.me)
      .then((data) => setUser(data.user))
      .catch((err) => console.log("Error fetching user:", err.message));
  }, [token]);

  // role = the login tab used, the server rejects a mismatch
  const login = async (email, password, role) => {
    const data = await post(API_ROUTES.auth.login, { email, password, role });
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const data = await post(API_ROUTES.auth.changePassword, {
      currentPassword,
      newPassword,
    });
    setUser(data.user);
    return data.user;
  };

  // call before any write action: guests are sent to login and come back after
  const requireAuth = () => {
    if (token) return true;
    toast.info("Please log in first.");
    navigate(ROUTES.LOGIN, {
      state: { from: location.pathname + location.search },
    });
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAdmin: user?.role === "admin",
        isAgent: user?.role === "agent",
        isLoggedIn: !!token,
        requireAuth,
        login,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
