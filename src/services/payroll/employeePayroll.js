import api from "../api";

export const getEmployeePayroll = async (
  employeeId,
  page = 1,
  limit = 20,
  month = null,
  year = null
) => {
  try {
    const params = { page, limit };
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await api.get(`/payroll/employee/${employeeId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching employee payroll:", error);
    throw error;
  }
};
