import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import GreetingNote from "../../components/GreetingNote";
import api from "../../services/api";

const RoomManagementPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [bulkRoomNumbers, setBulkRoomNumbers] = useState("");
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user && user.siteId) {
      fetchRooms();
    }
  }, [user]);

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

    // Check if room number already exists
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

      // Refresh rooms list
      await fetchRooms();

      // Clear success message after 3 seconds
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

      // Parse room numbers from comma-separated string
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

      // Refresh rooms list
      await fetchRooms();

      // Clear success message after 3 seconds
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

      // Refresh rooms list
      await fetchRooms();

      // Clear success message after 3 seconds
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

  if (isLoading) {
    return (
      <Container>
        <Sidebar user={user} />
        <Main>
          <GreetingNote userName={user.firstName} />
          <PageHeader>
            <Title>Room Management</Title>
            <Subtitle>Loading rooms...</Subtitle>
          </PageHeader>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />
        <PageHeader>
          <Title>Room Management</Title>
          <Subtitle>Manage rooms for your site</Subtitle>
        </PageHeader>

        {/* Add Room Section */}
        <AddRoomSection>
          <AddRoomTitle>Add New Room</AddRoomTitle>
          <AddRoomForm>
            <RoomNumberInput
              type="text"
              placeholder="Enter room number (e.g., 101, 201)"
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAddingRoom}
            />
            <AddButton
              onClick={addRoom}
              disabled={isAddingRoom || !newRoomNumber.trim()}
            >
              {isAddingRoom ? "Adding..." : "Add Room"}
            </AddButton>
          </AddRoomForm>

          <BulkAddSection>
            <BulkAddTitle>Bulk Add Rooms</BulkAddTitle>
            <BulkAddForm>
              <BulkInput
                type="text"
                placeholder="Enter room numbers separated by commas (e.g., 101, 102, 103)"
                value={bulkRoomNumbers}
                onChange={(e) => setBulkRoomNumbers(e.target.value)}
                disabled={isAddingBulk}
              />
              <BulkAddButton
                onClick={addBulkRooms}
                disabled={isAddingBulk || !bulkRoomNumbers.trim()}
              >
                {isAddingBulk ? "Adding..." : "Add Multiple Rooms"}
              </BulkAddButton>
            </BulkAddForm>
            <BulkAddHint>
              💡 Tip: You can add multiple rooms at once by separating room
              numbers with commas
            </BulkAddHint>
          </BulkAddSection>
        </AddRoomSection>

        {/* Messages */}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {/* Rooms List */}
        <RoomsSection>
          <RoomsTitle>Current Rooms ({rooms.length})</RoomsTitle>

          {rooms.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🏠</EmptyIcon>
              <EmptyText>No rooms configured yet</EmptyText>
              <EmptySubtext>
                Add your first room using the form above
              </EmptySubtext>
            </EmptyState>
          ) : (
            <RoomsGrid>
              {rooms.map((room) => (
                <RoomCard key={room.id}>
                  <RoomInfo>
                    <RoomNumber>Room {room.number}</RoomNumber>
                    <RoomStatus status={room.status}>
                      {room.status === "vacant" ? "Vacant" : "Occupied"}
                    </RoomStatus>
                    <RoomDetails>
                      <DetailItem>
                        <DetailLabel>Cleaning:</DetailLabel>
                        <DetailValue needsCleaning={room.needsCleaning}>
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
                  </RoomInfo>
                  <RoomActions>
                    <DeleteButton
                      onClick={() => deleteRoom(room.id, room.number)}
                      title="Delete room"
                    >
                      🗑️
                    </DeleteButton>
                  </RoomActions>
                </RoomCard>
              ))}
            </RoomsGrid>
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
`;

const Main = styled.div`
  flex: 1;
  background-color: #f7f8fa;
  padding: 20px;
  overflow-y: auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
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

const AddRoomSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AddRoomTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 16px 0;
`;

const AddRoomForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RoomNumberInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #218838;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const BulkAddSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
`;

const BulkAddTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 16px 0;
`;

const BulkAddForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
`;

const BulkInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
`;

const BulkAddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const BulkAddHint = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #c3e6cb;
`;

const RoomsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RoomsTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 20px 0;
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

const RoomsGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const RoomCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomNumber = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const RoomStatus = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  background-color: ${({ status }) =>
    status === "vacant" ? "#d4edda" : "#f8d7da"};
  color: ${({ status }) => (status === "vacant" ? "#155724" : "#721c24")};
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 12px;
  color: ${({ needsCleaning }) => (needsCleaning ? "#dc3545" : "#28a745")};
  font-weight: 500;
`;

const RoomActions = styled.div`
  display: flex;
  gap: 8px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8d7da;
  }
`;
