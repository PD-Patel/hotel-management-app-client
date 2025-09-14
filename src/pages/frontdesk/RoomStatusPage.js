import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import GreetingNote from "../../components/GreetingNote";
import RoomGrid from "../../components/rooms/RoomGrid";
import {
  getRooms,
  updateRoomStatusEmployee,
} from "../../services/rooms/getRooms";
import { MDBIcon } from "mdb-react-ui-kit";

export default function RoomStatusPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch rooms from backend
  const fetchRooms = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await getRooms(user.siteId);
        setRooms(response.rooms || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user.siteId]
  );

  useEffect(() => {
    if (user && user.siteId) {
      fetchRooms();
    }
  }, [user, fetchRooms]);

  // Update room status using backend API
  const updateRoomStatus = async (roomId, updateType) => {
    try {
      if (updateType === "status") {
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
      throw error;
    }
  };

  // Calculate room statistics
  const getRoomStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (room) => room.status === "occupied"
    ).length;
    const vacantRooms = rooms.filter((room) => room.status === "vacant").length;
    const needsCleaning = rooms.filter((room) => room.needsCleaning).length;

    return { totalRooms, occupiedRooms, vacantRooms, needsCleaning };
  };

  const stats = getRoomStats();

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />

        <Header>
          <HeaderContent>
            <HeaderLeft>
              <Title>Front Desk Dashboard</Title>
              <Subtitle>Monitor and manage room status in real-time</Subtitle>
            </HeaderLeft>
            <HeaderRight>
              <RefreshButton
                onClick={() => fetchRooms(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshSpinner>⏳</RefreshSpinner>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="sync-alt" />
                    Refresh
                  </>
                )}
              </RefreshButton>
            </HeaderRight>
          </HeaderContent>

          {lastUpdated && (
            <LastUpdated>
              <MDBIcon fas icon="clock" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </LastUpdated>
          )}
        </Header>

        <StatsSection>
          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="building" />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.totalRooms}</StatValue>
              <StatLabel>Total Rooms</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon occupied>
              <MDBIcon fas icon="bed" />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.occupiedRooms}</StatValue>
              <StatLabel>Occupied</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon vacant>
              <MDBIcon fas icon="door-open" />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.vacantRooms}</StatValue>
              <StatLabel>Vacant</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon cleaning>
              <MDBIcon fas icon="broom" />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.needsCleaning}</StatValue>
              <StatLabel>Need Cleaning</StatLabel>
            </StatContent>
          </StatCard>
        </StatsSection>

        <ContentSection>
          <SectionHeader>
            <SectionTitle>Room Status Overview</SectionTitle>
            <SectionSubtitle>
              Click on any room to toggle its occupancy status
            </SectionSubtitle>
          </SectionHeader>

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner>⏳</LoadingSpinner>
              <LoadingText>Loading room data...</LoadingText>
            </LoadingContainer>
          ) : rooms.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🏨</EmptyIcon>
              <EmptyTitle>No Rooms Available</EmptyTitle>
              <EmptyMessage>
                There are no rooms configured for this location.
              </EmptyMessage>
            </EmptyState>
          ) : (
            <RoomGrid rooms={rooms} onRoomClick={updateRoomStatus} />
          )}
        </ContentSection>
      </Main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 100vh;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const Main = styled.div`
  flex: 1;
  background-color: var(--bg-primary);
  padding: 20px;
  overflow-y: auto;

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

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
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
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.875rem;
  }
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  width: fit-content;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    font-size: 0.8125rem;
    padding: 10px 14px;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(
    135deg,
    var(--btn-primary),
    var(--btn-primary-hover)
  );
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  min-height: 44px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 1rem;
    min-height: 48px;
  }
`;

const RefreshSpinner = styled.span`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  /* Tablet and up - 4 columns */
  @media (min-width: 769px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 12px;
  }
`;

const StatIcon = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !["occupied", "vacant", "cleaning"].includes(prop),
})`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  background: ${(props) => {
    if (props.occupied)
      return "linear-gradient(135deg, var(--status-error), #dc2626)";
    if (props.vacant)
      return "linear-gradient(135deg, var(--status-success), #059669)";
    if (props.cleaning)
      return "linear-gradient(135deg, var(--status-warning), #d97706)";
    return "linear-gradient(135deg, var(--status-info), #2563eb)";
  }};

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const ContentSection = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const LoadingSpinner = styled.div`
  font-size: 2.5rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  color: var(--text-tertiary);
  margin: 0 0 8px 0;
  font-weight: 600;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;
