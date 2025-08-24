import api from "./api";

export const clockIn = async (pin, siteId) => {
  try {
    const response = await api.post("/clock/toggle-clock", { pin, siteId });
    return response.data;
  } catch (error) {
    console.error("Clock service error:", error);
    throw error; // Re-throw to handle in component
  }
};

export const getSites = async () => {
  try {
    const response = await api.get("/clock/sites");
    return response.data.sites;
  } catch (error) {
    console.error("Error fetching sites:", error);
    throw error;
  }
};

export const validatePin = async (pin, siteId) => {
  try {
    const response = await api.post("/clock/validate-pin", { pin, siteId });
    return response.data;
  } catch (error) {
    console.error("Error validating PIN:", error);
    throw error;
  }
};

export const webToggle = async (coords = {}) => {
  try {
    const response = await api.post("/clock/web-toggle", coords);
    return response.data;
  } catch (error) {
    console.error("Error web toggling:", error);
    throw error;
  }
};

export const getMyRecentLogs = async (limit = 7) => {
  try {
    const response = await api.get(`/clock/my-recent?limit=${limit}`);
    return response.data.logs;
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    throw error;
  }
};

// Admin: update a clock log
export const updateClockLog = async (id, payload) => {
  try {
    const response = await api.put(`/reports/hours/logs/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating clock log:", error);
    throw error;
  }
};

// Admin: delete a clock log
export const deleteClockLog = async (id) => {
  try {
    const response = await api.delete(`/reports/hours/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting clock log:", error);
    throw error;
  }
};
