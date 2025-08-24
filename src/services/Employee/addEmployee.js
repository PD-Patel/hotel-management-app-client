import axios from "axios";
import api from "../api";

export const addEmployee = async (employeeData) => {
  try {
    const response = await api.post("/auth/register-employee", employeeData);
    return response.data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};
