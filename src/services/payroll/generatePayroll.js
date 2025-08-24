import api from "../api";

export const getPayPeriod = async (siteId) => {
  try {
    const response = await api.post("/payroll/generate", { siteId });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const exportPayroll = async (siteId) => {
  try {
    const response = await api.post("/payroll/export", { siteId });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
