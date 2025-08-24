import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return error.response.data;
  }
};

export const register = async ({
  firstName,
  lastName,
  name,
  email,
  password,
  phone,
  siteName,
  siteAddress,
  city,
  state,
  zipCode,
  country,
  role,
}) => {
  try {
    const response = await api.post("/auth/register", {
      firstName,
      lastName,
      name,
      email,
      password,
      phone,
      siteName,
      siteAddress,
      city,
      state,
      zipCode,
      country,
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    return error.response.data;
  }
};

export const logout = async () => {
  try {
    const response = await api.get("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    return error.response.data;
  }
};
