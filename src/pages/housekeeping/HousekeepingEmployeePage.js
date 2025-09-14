import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRooms,
  updateRoomStatusEmployee,
} from "../../services/rooms/getRooms";
import HousekeepingAssignmentGrid from "../../components/housekeeping/HousekeepingAssignmentGrid";
import Sidebar from "../../components/Sidebar";
import GreetingNote from "../../components/GreetingNote";
import { useTheme } from "../../contexts/ThemeContext";

const HousekeepingEmployeePage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getRooms(user.siteId);
      const allRooms = response.rooms || [];

      // Filter rooms assigned to current user
      const userAssignedRooms = allRooms.filter(
        (room) => room.assignedTo === user.id
      );

      setRooms(userAssignedRooms);
    } catch (error) {
      console.error("Error fetching assigned rooms:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [user.siteId, user.id]);

  useEffect(() => {
    if (user && user.siteId) {
      fetchAssignedRooms();
    }
  }, [user, fetchAssignedRooms]);

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

  // Mock employees array for the HousekeepingAssignmentGrid (not needed for employee view)
  const mockEmployees = [];

  if (isLoading) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user ? user.firstName : "User"} />
          <Header>
            <Title isDarkMode={isDarkMode}>My Assigned Rooms</Title>
            <Subtitle isDarkMode={isDarkMode}>
              Loading your assigned rooms...
            </Subtitle>
          </Header>
          <LoadingGrid>
            {[...Array(6)].map((_, index) => (
              <LoadingCard key={index} isDarkMode={isDarkMode}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    ...
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>Loading</div>
                </div>
              </LoadingCard>
            ))}
          </LoadingGrid>
        </Main>
      </Container>
    );
  }

  if (rooms.length === 0) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user ? user.firstName : "User"} />
          <Header>
            <Title isDarkMode={isDarkMode}>My Assigned Rooms</Title>
            <Subtitle isDarkMode={isDarkMode}>
              No rooms currently assigned to you
            </Subtitle>
          </Header>
          <EmptyState>
            <EmptyIcon>🏠</EmptyIcon>
            <EmptyText isDarkMode={isDarkMode}>
              You don't have any rooms assigned yet.
            </EmptyText>
            <EmptySubtext isDarkMode={isDarkMode}>
              Contact your supervisor to get room assignments.
            </EmptySubtext>
          </EmptyState>
        </Main>
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Sidebar user={user} />
      <Main isDarkMode={isDarkMode}>
        <GreetingNote userName={user ? user.firstName : "User"} />
        <Header>
          <Title isDarkMode={isDarkMode}>My Assigned Rooms</Title>
          <Subtitle isDarkMode={isDarkMode}>
            {rooms.length} room{rooms.length !== 1 ? "s" : ""} assigned to you
          </Subtitle>
          <RefreshButton onClick={fetchAssignedRooms} isDarkMode={isDarkMode}>
            🔄 Refresh
          </RefreshButton>
        </Header>

        <HousekeepingAssignmentGrid
          rooms={rooms}
          employees={mockEmployees}
          onAssignRoom={() => {}} // Not needed for employee view
          onUnassignRoom={() => {}} // Not needed for employee view
          onUpdateCleaningStatus={updateRoomStatus}
          showAssignmentControls={false}
        />
      </Main>
    </Container>
  );
};

export default HousekeepingEmployeePage;

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-primary)" : "#fafbfc"};
`;

const Main = styled.main`
  flex: 1;
  padding: 20px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-primary)" : "#fafbfc"};
  min-height: 100vh;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-top: 4rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 1.5rem;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 28px;
  position: relative;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    margin-bottom: 1.75rem;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.75rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--status-info)" : "#007bff"};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--status-info-hover)" : "#0056b3"};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const LoadingCard = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 2px 4px rgba(0, 0, 0, 0.1)"};
  border: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? "var(--border-primary)" : "transparent"};
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
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#6c757d"};
  margin: 0 0 12px 0;
`;

const EmptySubtext = styled.p`
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#adb5bd"};
  margin: 0;
`;
