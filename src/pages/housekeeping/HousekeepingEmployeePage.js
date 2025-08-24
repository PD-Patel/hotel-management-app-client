import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRooms,
  updateRoomStatusEmployee,
} from "../../services/rooms/getRooms";
import RoomGrid from "../../components/rooms/RoomGrid";

const HousekeepingEmployeePage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.siteId) {
      fetchAssignedRooms();
    }
  }, [user]);

  const fetchAssignedRooms = async () => {
    try {
      setIsLoading(true);
      const response = await getRooms(user.siteId);
      const allRooms = response.rooms || [];

      // Filter rooms assigned to current user
      const userAssignedRooms = allRooms.filter(
        (room) => room.assignedTo === user.id
      );

      console.log("All rooms:", allRooms);
      console.log("User ID:", user.id);
      console.log("Filtered rooms:", userAssignedRooms);

      setRooms(userAssignedRooms);
    } catch (error) {
      console.error("Error fetching assigned rooms:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoomStatus = async (roomId, updateType) => {
    try {
      if (updateType === "cleaning") {
        // Update cleaning status (needsCleaning field)
        const currentRoom = rooms.find((room) => room.id === roomId);

        // Check if room is occupied - housekeeping cannot change cleaning status of occupied rooms
        if (currentRoom.status === "occupied") {
          alert(
            "Cannot change cleaning status of occupied rooms. Please wait until the room is vacant."
          );
          return;
        }

        const needsCleaning = !currentRoom.needsCleaning; // Toggle the current status

        await updateRoomStatusEmployee(roomId, { needsCleaning });

        // Update local state
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, needsCleaning } : room
          )
        );
      }
      // Housekeeping employees cannot change room occupancy status - only cleaning status
    } catch (error) {
      console.error("Failed to update room status:", error);
      alert("Failed to update room status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header>
          <Title>My Assigned Rooms</Title>
          <Subtitle>Loading your assigned rooms...</Subtitle>
        </Header>
        <LoadingGrid>
          {[...Array(6)].map((_, index) => (
            <LoadingCard key={index}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>...</div>
                <div style={{ fontSize: "14px", color: "#666" }}>Loading</div>
              </div>
            </LoadingCard>
          ))}
        </LoadingGrid>
      </PageContainer>
    );
  }

  if (rooms.length === 0) {
    return (
      <PageContainer>
        <Header>
          <Title>My Assigned Rooms</Title>
          <Subtitle>No rooms currently assigned to you</Subtitle>
        </Header>
        <EmptyState>
          <EmptyIcon>🏠</EmptyIcon>
          <EmptyText>You don't have any rooms assigned yet.</EmptyText>
          <EmptySubtext>
            Contact your supervisor to get room assignments.
          </EmptySubtext>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>My Assigned Rooms</Title>
        <Subtitle>
          {rooms.length} room{rooms.length !== 1 ? "s" : ""} assigned to you
        </Subtitle>
        <RefreshButton onClick={fetchAssignedRooms}>🔄 Refresh</RefreshButton>
      </Header>

      <RoomGrid
        rooms={rooms}
        onRoomClick={updateRoomStatus}
        isHousekeeping={true}
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  position: relative;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin: 0;
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const EmptyText = styled.h3`
  font-size: 24px;
  color: #6c757d;
  margin: 0 0 12px 0;
`;

const EmptySubtext = styled.p`
  font-size: 16px;
  color: #adb5bd;
  margin: 0;
`;

export default HousekeepingEmployeePage;
