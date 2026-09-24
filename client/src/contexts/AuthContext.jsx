import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_ROUTES } from "../constants/apiRoutes";
import { get, post } from "../api/client";
import { AUTH_LOGOUT_EVENT, clearToken, getToken, setToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken);
  const [user, setUser] = useState(null);

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

  // login and signup both return { token, user }
  const authenticate = async (url, body) => {
    const data = await post(url, body);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = (email, password) =>
    authenticate(API_ROUTES.auth.login, { email, password });

  const signup = (form) => authenticate(API_ROUTES.auth.signup, form);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAdmin: user?.role === "admin",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
