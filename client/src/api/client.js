import { authHeaders, getToken, AUTH_LOGOUT_EVENT } from "../utils/auth";

// every request goes through here, so the token is attached in one place
const request = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
    },
  });

  // token expired or invalid: tell AuthContext to log out
  if (response.status === 401 && getToken()) {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

const get = (path) => request(path);

const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

const patch = (path, body) =>
  request(path, { method: "PATCH", body: JSON.stringify(body) });

const del = (path) => request(path, { method: "DELETE" });

export { get, post, patch, del };
