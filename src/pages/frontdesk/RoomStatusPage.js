import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import GreetingNote from "../../components/GreetingNote";
import RoomGrid from "../../components/rooms/RoomGrid";
import {
  getRooms,
  updateRoomStatusEmployee,
} from "../../services/rooms/getRooms";

export default function RoomStatusPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch rooms from backend
  const fetchRooms = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log("🔄 Fetching rooms...");
      console.log("👤 Current user:", user);
      console.log("🏢 Site ID:", user.siteId);
      const response = await getRooms(user.siteId);
      console.log("📊 Received rooms data:", response.rooms);
      setRooms(response.rooms || []);
      setLastUpdated(new Date());
      console.log("✅ Rooms updated at:", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.siteId) {
      fetchRooms();
    }
  }, [user]);

  // Auto-refresh functionality removed - rooms will only refresh manually or when user changes

  // Debug: Log whenever rooms state changes
  useEffect(() => {
    console.log("🏠 Rooms state updated:", rooms);
  }, [rooms]);

  // Update room status using backend API
  const updateRoomStatus = async (roomId, updateType) => {
    try {
      if (updateType === "status") {
        // For front desk, toggle occupancy status (vacant/occupied)
        const currentRoom = rooms.find((room) => room.id === roomId);
        const newStatus =
          currentRoom.status === "vacant" ? "occupied" : "vacant";

        await updateRoomStatusEmployee(roomId, { status: newStatus });

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, status: newStatus } : room
          )
        );
      }
    } catch (error) {
      console.error("Failed to update room status:", error);
      // TODO: Add error notification
      throw error;
    }
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />
        <PageHeader>
          <PageTitle>Front Desk — Room Status</PageTitle>
          <HeaderInfo>
            {lastUpdated && (
              <LastUpdated>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </LastUpdated>
            )}
            <RefreshButton
              onClick={() => fetchRooms(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? "🔄 Refreshing..." : "🔄 Refresh"}
            </RefreshButton>
          </HeaderInfo>
        </PageHeader>

        {isLoading ? (
          <LoadingGrid>
            {[...Array(12)].map((_, index) => (
              <LoadingCard key={index}>
                <LoadingRoomNumber />
              </LoadingCard>
            ))}
          </LoadingGrid>
        ) : rooms.length === 0 ? (
          <EmptyState>
            <EmptyMessage>No rooms available</EmptyMessage>
          </EmptyState>
        ) : (
          <RoomGrid rooms={rooms} onRoomClick={updateRoomStatus} />
        )}
      </Main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
`;

const Main = styled.div`
  flex: 1;
  background-color: #f7f8fa;
  padding: 20px;
  overflow-y: auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const LastUpdated = styled.span`
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const RefreshButton = styled.button`
  background-color: #4a90e2;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:focus {
    outline: none;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  gap: 16px;
  max-width: 1200px;

  /* Responsive grid columns - match the main grid */
  grid-template-columns: 2fr; /* Default: 2 columns for mobile */

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr); /* 3 columns for small tablets */
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr); /* 4 columns for tablets */
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(5, 1fr); /* 5 columns for small desktops */
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(6, 1fr); /* 6 columns for large desktops */
  }
`;

const LoadingCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
`;

const LoadingRoomNumber = styled.div`
  width: 60px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const EmptyMessage = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0;
`;

// Add keyframes for loading animation
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);
