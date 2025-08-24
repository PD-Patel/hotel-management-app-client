import api from "./api";

export const getUser = async () => {
  try {
    const response = await api.get("/user/me");
    return response.data.user;
  } catch (error) {
    console.error("Error getting user:", error);
    return error.response.data;
  }
};
