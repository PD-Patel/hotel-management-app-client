import api from "../api";

export const getPayrollReport = async (startDate, endDate) => {
  try {
    const response = await api.get(
      `/reports/hours/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSummary = async (startDate, endDate) => {
  try {
    const response = await api.get(
      `/reports/hours/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTotalHoursOfEmployee = async (
  employeeId,
  startDate,
  endDate
) => {
  try {
    const response = await api.get(
      `/reports/hours/summary/employee?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
