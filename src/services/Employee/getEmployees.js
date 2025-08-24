import axios from "axios";
import api from "../api";

export const getEmployees = async ({ role, siteId }) => {
  try {
    const response = await api.get("/user/all-users", {
      role: role,
      siteId: siteId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
