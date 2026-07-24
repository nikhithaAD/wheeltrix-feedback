// Shared API + auth helpers used across all pages
const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("wx_token");
}
function getUser() {
  const raw = localStorage.getItem("wx_user");
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem("wx_token", token);
  localStorage.setItem("wx_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("wx_token");
  localStorage.removeItem("wx_user");
}
function logout() {
  clearSession();
  window.location.href = "login.html";
}

// Redirect helpers for page guards
function requireLogin() {
  if (!getToken()) window.location.href = "login.html";
}
function requireAdminOrRedirect() {
  const user = getUser();
  if (!getToken() || !user || user.role !== "admin") {
    window.location.href = "feedback.html";
  }
}

async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* no body */
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function fmtDate(d) {
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
