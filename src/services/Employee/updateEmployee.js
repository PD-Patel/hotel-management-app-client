import api from "../api";

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const formData = new FormData();
    Object.keys(employeeData).forEach((key) => {
      if (key === "photo" && employeeData[key]) {
        formData.append("photo", employeeData[key]);
      } else if (key !== "photo") {
        formData.append(key, employeeData[key]);
      }
    });

    const response = await api.put(
      `http://localhost:8888/api/employee/updateEmployee/${employeeId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};
