import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import GreetingNote from "../../components/GreetingNote";
import { MDBIcon } from "mdb-react-ui-kit";
import api from "../../services/api";

const RoomManagementPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [bulkRoomNumbers, setBulkRoomNumbers] = useState("");
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && user.siteId) {
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    setFilterStatus("all");
  }, [searchTerm]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/rooms/site/${user.siteId}`);
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const addRoom = async () => {
    if (!newRoomNumber.trim()) {
      setError("Please enter a room number");
      return;
    }

    if (rooms.some((room) => room.number === newRoomNumber.trim())) {
      setError("Room number already exists");
      return;
    }

    try {
      setIsAddingRoom(true);
      setError("");

      const response = await api.post(`/rooms/initialize/${user.siteId}`, {
        roomNumber: newRoomNumber.trim(),
      });

      setSuccess(`Room ${newRoomNumber} added successfully!`);
      setNewRoomNumber("");
      await fetchRooms();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding room:", error);
      setError(error.response?.data?.message || "Failed to add room");
    } finally {
      setIsAddingRoom(false);
    }
  };

  const addBulkRooms = async () => {
    if (!bulkRoomNumbers.trim()) {
      setError("Please enter room numbers");
      return;
    }

    try {
      setIsAddingBulk(true);
      setError("");

      const roomNumbers = bulkRoomNumbers
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num.length > 0);

      if (roomNumbers.length === 0) {
        setError("Please enter valid room numbers");
        return;
      }

      const response = await api.post(`/rooms/bulk-add/${user.siteId}`, {
        roomNumbers,
      });

      setSuccess(`Successfully added ${response.data.count} rooms!`);
      setBulkRoomNumbers("");
      await fetchRooms();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding bulk rooms:", error);
      setError(error.response?.data?.message || "Failed to add rooms");
    } finally {
      setIsAddingBulk(false);
    }
  };

  const deleteRoom = async (roomId, roomNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Room ${roomNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/rooms/${roomId}`);
      setSuccess(`Room ${roomNumber} deleted successfully!`);
      await fetchRooms();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting room:", error);
      setError(error.response?.data?.message || "Failed to delete room");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addRoom();
    }
  };

  // Filter and search rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get room statistics
  const roomStats = {
    total: rooms.length,
    vacant: rooms.filter((r) => r.status === "vacant").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    cleaning: rooms.filter((r) => r.status === "cleaning").length,
  };

  if (isLoading) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user.firstName} />
          <PageHeader>
            <Title isDarkMode={isDarkMode}>Room Management</Title>
            <Subtitle isDarkMode={isDarkMode}>Loading rooms...</Subtitle>
          </PageHeader>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading room data...</LoadingText>
          </LoadingContainer>
        </Main>
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Sidebar user={user} />
      <Main isDarkMode={isDarkMode}>
        <GreetingNote userName={user.firstName} />

        {/* Page Header */}
        <PageHeader>
          <HeaderContent>
            <HeaderLeft>
              <Title isDarkMode={isDarkMode}>Room Management</Title>
              <Subtitle isDarkMode={isDarkMode}>
                Manage and monitor all rooms in your property
              </Subtitle>
            </HeaderLeft>
            <HeaderActions>
              <ViewToggle>
                <ViewButton
                  active={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  isDarkMode={isDarkMode}
                >
                  <MDBIcon fas icon="th-large" />
                </ViewButton>
                <ViewButton
                  active={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  isDarkMode={isDarkMode}
                >
                  <MDBIcon fas icon="list" />
                </ViewButton>
              </ViewToggle>
            </HeaderActions>
          </HeaderContent>
        </PageHeader>

        {/* Statistics Cards */}
        <StatsGrid>
          <StatCard>
            <StatIcon status="total">
              <MDBIcon fas icon="bed" />
            </StatIcon>
            <StatContent>
              <StatNumber>{roomStats.total}</StatNumber>
              <StatLabel>Total Rooms</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon status="vacant">
              <MDBIcon fas icon="check-circle" />
            </StatIcon>
            <StatContent>
              <StatNumber>{roomStats.vacant}</StatNumber>
              <StatLabel>Vacant</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon status="occupied">
              <MDBIcon fas icon="user" />
            </StatIcon>
            <StatContent>
              <StatNumber>{roomStats.occupied}</StatNumber>
              <StatLabel>Occupied</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon status="maintenance">
              <MDBIcon fas icon="tools" />
            </StatIcon>
            <StatContent>
              <StatNumber>{roomStats.maintenance}</StatNumber>
              <StatLabel>Maintenance</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        {/* Add Room Section */}
        <AddRoomSection>
          <SectionHeader>
            <SectionTitle isDarkMode={isDarkMode}>
              <MDBIcon fas icon="plus-circle" />
              Add New Room
            </SectionTitle>
          </SectionHeader>

          <AddRoomForm>
            <InputGroup>
              <InputLabel isDarkMode={isDarkMode}>Room Number</InputLabel>
              <RoomNumberInput
                type="text"
                placeholder="Enter room number (e.g., 101, 201)"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAddingRoom}
              />
            </InputGroup>
            <AddButton
              onClick={addRoom}
              disabled={isAddingRoom || !newRoomNumber.trim()}
              isDarkMode={isDarkMode}
            >
              {isAddingRoom ? (
                <>
                  <LoadingSpinnerSmall />
                  Adding...
                </>
              ) : (
                <>
                  <MDBIcon fas icon="plus" />
                  Add Room
                </>
              )}
            </AddButton>
          </AddRoomForm>

          <BulkAddSection>
            <BulkAddTitle isDarkMode={isDarkMode}>Bulk Add Rooms</BulkAddTitle>
            <BulkAddForm>
              <InputGroup>
                <InputLabel isDarkMode={isDarkMode}>
                  Multiple Room Numbers
                </InputLabel>
                <BulkInput
                  type="text"
                  placeholder="Enter room numbers separated by commas (e.g., 101, 102, 103)"
                  value={bulkRoomNumbers}
                  onChange={(e) => setBulkRoomNumbers(e.target.value)}
                  disabled={isAddingBulk}
                />
              </InputGroup>
              <BulkAddButton
                onClick={addBulkRooms}
                disabled={isAddingBulk || !bulkRoomNumbers.trim()}
                isDarkMode={isDarkMode}
              >
                {isAddingBulk ? (
                  <>
                    <LoadingSpinnerSmall />
                    Adding...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="layer-group" />
                    Add Multiple Rooms
                  </>
                )}
              </BulkAddButton>
            </BulkAddForm>
            <BulkAddHint isDarkMode={isDarkMode}>
              💡 Tip: You can add multiple rooms at once by separating room
              numbers with commas
            </BulkAddHint>
          </BulkAddSection>
        </AddRoomSection>

        {/* Messages */}
        {error && <ErrorMessage isDarkMode={isDarkMode}>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage isDarkMode={isDarkMode}>{success}</SuccessMessage>
        )}

        {/* Rooms List Section */}
        <RoomsSection>
          <SectionHeader>
            <SectionTitle isDarkMode={isDarkMode}>
              <MDBIcon fas icon="bed" />
              Current Rooms ({filteredRooms.length})
            </SectionTitle>

            <SectionActions>
              <SearchContainer>
                <SearchInput
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon>
                  <MDBIcon fas icon="search" />
                </SearchIcon>
              </SearchContainer>

              <FilterContainer>
                <FilterSelect
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                </FilterSelect>
              </FilterContainer>
            </SectionActions>
          </SectionHeader>

          {filteredRooms.length === 0 ? (
            <EmptyState isDarkMode={isDarkMode}>
              <EmptyIcon>🏠</EmptyIcon>
              <EmptyText isDarkMode={isDarkMode}>
                {searchTerm || filterStatus !== "all"
                  ? "No rooms match your search criteria"
                  : "No rooms configured yet"}
              </EmptyText>
              <EmptySubtext isDarkMode={isDarkMode}>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter settings"
                  : "Add your first room using the form above"}
              </EmptySubtext>
            </EmptyState>
          ) : viewMode === "grid" ? (
            <RoomsGrid>
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} status={room.status}>
                  <RoomCardHeader>
                    <RoomNumber>Room {room.number}</RoomNumber>
                    <StatusIndicator status={room.status}>
                      <MDBIcon
                        fas
                        icon={room.status === "occupied" ? "bed" : "door-open"}
                      />
                    </StatusIndicator>
                  </RoomCardHeader>

                  <RoomCardBody>
                    <RoomDetails>
                      <DetailItem>
                        <DetailLabel>Status:</DetailLabel>
                        <DetailValue status={room.status}>
                          {room.status === "vacant"
                            ? "Available"
                            : room.status === "occupied"
                            ? "In Use"
                            : room.status === "maintenance"
                            ? "Under Repair"
                            : "Being Cleaned"}
                        </DetailValue>
                      </DetailItem>

                      <DetailItem>
                        <DetailLabel>Cleaning:</DetailLabel>
                        <DetailValue status={room.status}>
                          {room.needsCleaning ? "Needs Cleaning" : "Clean"}
                        </DetailValue>
                      </DetailItem>

                      {room.assignedEmployeeName && (
                        <DetailItem>
                          <DetailLabel>Assigned to:</DetailLabel>
                          <DetailValue>{room.assignedEmployeeName}</DetailValue>
                        </DetailItem>
                      )}
                    </RoomDetails>
                  </RoomCardBody>

                  <RoomCardActions>
                    <ActionButton
                      onClick={() => deleteRoom(room.id, room.number)}
                      title="Delete room"
                    >
                      <MDBIcon fas icon="trash" />
                    </ActionButton>
                  </RoomCardActions>
                </RoomCard>
              ))}
            </RoomsGrid>
          ) : (
            <RoomsTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Room</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Cleaning</TableHeaderCell>
                  <TableHeaderCell>Assigned To</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>Room {room.number}</TableCell>
                    <TableCell>
                      <StatusBadge status={room.status}>
                        {room.status === "vacant"
                          ? "Vacant"
                          : room.status === "occupied"
                          ? "Occupied"
                          : room.status === "maintenance"
                          ? "Maintenance"
                          : "Cleaning"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <CleaningBadge needsCleaning={room.needsCleaning}>
                        {room.needsCleaning ? "Needs Cleaning" : "Clean"}
                      </CleaningBadge>
                    </TableCell>
                    <TableCell>
                      {room.assignedEmployeeName || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        onClick={() => deleteRoom(room.id, room.number)}
                        title="Delete room"
                      >
                        <MDBIcon fas icon="trash" />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </RoomsTable>
          )}
        </RoomsSection>
      </Main>
    </Container>
  );
};

export default RoomManagementPage;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  background-color: var(--bg-primary);
`;

const Main = styled.div`
  flex: 1;
  background-color: var(--bg-primary);
  padding: 20px;
  overflow-y: auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewButton = styled.button`
  background-color: ${({ active, isDarkMode }) =>
    active
      ? isDarkMode
        ? "#007bff"
        : "#28a745"
      : isDarkMode
      ? "#343a40"
      : "#e9ecef"};
  color: ${({ active, isDarkMode }) =>
    active ? "white" : isDarkMode ? "#adb5bd" : "#495057"};
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#0056b3" : "#218838"};
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e9ecef" : "#1c1c1c")};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid
    ${({ isDarkMode }) => (isDarkMode ? "#007bff" : "#28a745")};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
  margin-top: 15px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid var(--card-border);
`;

const StatIcon = styled.div`
  font-size: 36px;
  color: ${({ status }) => {
    switch (status) {
      case "total":
        return "#6c757d";
      case "vacant":
        return "#28a745";
      case "occupied":
        return "#007bff";
      case "maintenance":
        return "#dc3545";
      case "cleaning":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  }};
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e9ecef" : "#1c1c1c")};
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
  margin-top: 4px;
`;

const AddRoomSection = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-primary);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.5px;
`;

const AddRoomForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-size: 14px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#495057")};
  margin-bottom: 8px;
  font-weight: 500;
`;

const RoomNumberInput = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background-color: var(--bg-secondary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
  }

  &:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    color: var(--text-muted);
  }
`;

const AddButton = styled.button`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#007bff" : "#28a745")};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#0056b3" : "#218838"};
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingSpinnerSmall = styled.span`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const BulkAddSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#495057" : "#e9ecef")};
`;

const BulkAddTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e9ecef" : "#1c1c1c")};
  margin: 0 0 16px 0;
`;

const BulkAddForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BulkInput = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background-color: var(--bg-secondary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
  }

  &:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    color: var(--text-muted);
  }
`;

const BulkAddButton = styled.button`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#007bff" : "#28a745")};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#0056b3" : "#218838"};
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const BulkAddHint = styled.p`
  font-size: 14px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
  margin: 0;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#dc3545" : "#f8d7da")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#e9ecef" : "#721c24")};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#dc3545" : "#f5c6cb")};
`;

const SuccessMessage = styled.div`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#28a745" : "#d4edda")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#e9ecef" : "#155724")};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#28a745" : "#c3e6cb")};
`;

const RoomsSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
`;

const SectionActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid var(--border-primary);
  border-radius: 10px;
  font-size: 14px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#495057")};
`;

const FilterContainer = styled.div`
  position: relative;
  min-width: 160px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 10px;
  font-size: 14px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23adb5bd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down' %3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
  padding-right: 35px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    color: var(--text-muted);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const EmptyText = styled.h3`
  font-size: 24px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#6c757d")};
  margin: 0 0 12px 0;
`;

const EmptySubtext = styled.p`
  font-size: 16px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#adb5bd" : "#adb5bd")};
  margin: 0;
`;

const RoomsGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 28px;
  }
`;

const RoomsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const TableHeader = styled.thead`
  background-color: var(--bg-secondary);
  border-bottom: 2px solid var(--card-border);
`;

const TableRow = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--card-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody`
  & tr:last-child td {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--card-border);
  vertical-align: middle;
`;

const RoomCard = styled.div`
  background: ${({ status }) => {
    if (status === "occupied") {
      return "linear-gradient(135deg, #1e293b, #334155)";
    } else {
      return "linear-gradient(135deg, #0f172a, #1e293b)";
    }
  }};
  border: 2px solid
    ${({ status }) => {
      if (status === "occupied") {
        return "#475569";
      } else {
        return "#334155";
      }
    }};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 120px;
  }
`;

const RoomCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const RoomNumber = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const StatusIndicator = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ status }) =>
    status === "occupied"
      ? "linear-gradient(135deg, var(--status-error), #dc2626)"
      : "linear-gradient(135deg, var(--status-success), #16a34a)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

const RoomCardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ status }) => (status === "occupied" ? "#f87171" : "#4ade80")};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ status }) => {
    switch (status) {
      case "vacant":
        return "var(--status-success)";
      case "occupied":
        return "var(--status-error)";
      case "maintenance":
        return "var(--status-warning)";
      case "cleaning":
        return "var(--status-info)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: white;
  border: 1px solid
    ${({ status }) => {
      switch (status) {
        case "vacant":
          return "var(--status-success)";
        case "occupied":
          return "var(--status-error)";
        case "maintenance":
          return "var(--status-warning)";
        case "cleaning":
          return "var(--status-info)";
        default:
          return "var(--border-primary)";
      }
    }};
`;

const CleaningBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ needsCleaning }) =>
    needsCleaning ? "var(--status-error)" : "var(--status-success)"};
  color: white;
  border: 1px solid
    ${({ needsCleaning }) =>
      needsCleaning ? "var(--status-error)" : "var(--status-success)"};
`;

const RoomCardActions = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding-top: 10px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #cbd5e1;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
    transform: scale(1.1);
  }
`;
