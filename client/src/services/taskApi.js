const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch (_error) {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validationMessage = payload.errors
      ? Object.values(payload.errors).join(" ")
      : "";
    throw new Error(validationMessage || payload.message || "Request failed.");
  }
  return payload;
}

export const taskApi = {
  list: () => request("/tasks"),
  create: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, task) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) }),
  updateStatus: (id, status) => request(`/tasks/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ status })
  }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" })
};
