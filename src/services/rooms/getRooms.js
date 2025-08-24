import api from "../api";

export const getRooms = async (siteId) => {
  try {
    const response = await api.get(`/rooms/site/${siteId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

export const updateRoomStatus = async (roomId, status) => {
  try {
    const response = await api.put(`/rooms/${roomId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating room status:", error);
    throw error;
  }
};

export const updateRoomStatusEmployee = async (roomId, data) => {
  try {
    const response = await api.put(`/rooms/${roomId}/status-employee`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

export const assignRoomToEmployee = async (roomId, employeeId) => {
  try {
    const response = await api.put(`/rooms/${roomId}/assign`, { employeeId });
    return response.data;
  } catch (error) {
    console.error("Error assigning room to employee:", error);
    throw error;
  }
};

export const unassignRoom = async (roomId) => {
  try {
    const response = await api.put(`/rooms/${roomId}/unassign`);
    return response.data;
  } catch (error) {
    console.error("Error unassigning room:", error);
    throw error;
  }
};
