import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import GreetingNote from "../../components/GreetingNote";
import HousekeepingAssignmentGrid from "../../components/housekeeping/HousekeepingAssignmentGrid";
import api from "../../services/api";
import {
  getRooms,
  assignRoomToEmployee as assignRoomToEmployeeAPI,
  unassignRoom as unassignRoomAPI,
  updateRoomStatusEmployee,
} from "../../services/rooms/getRooms";

export default function HousekeepingDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch housekeeping employees and rooms from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch both employees and rooms in parallel
        const [employeesResponse, roomsResponse] = await Promise.all([
          api.get("/user/all-users"),
          getRooms(user.siteId),
        ]);

        // Filter employees with housekeeping position
        const housekeepingEmployees = employeesResponse.data.users.filter(
          (emp) => emp.position === "housekeeping"
        );

        console.log("Housekeeping employees data:", housekeepingEmployees);

        setEmployees(housekeepingEmployees);
        setRooms(roomsResponse.rooms || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays if API fails
        setEmployees([]);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.siteId) {
      fetchData();
    }
  }, [user]);

  // Assign room to employee using backend API
  const assignRoomToEmployee = async (roomId, employeeId) => {
    try {
      // Ensure employeeId is a number for comparison
      const employeeIdNum = parseInt(employeeId, 10);

      // Find employee by ID
      const employee = employees.find((emp) => emp.id === employeeIdNum);

      if (!employee) {
        throw new Error("Employee not found");
      }

      // Call backend API
      await assignRoomToEmployeeAPI(roomId, employeeIdNum);

      // Update local state
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                assignedTo: employeeIdNum,
                assignedEmployeeName: `${employee.firstName} ${employee.lastName}`,
              }
            : room
        )
      );
    } catch (error) {
      console.error("Failed to assign room:", error);
      // TODO: Add error notification
      throw error;
    }
  };

  // Unassign room using backend API
  const unassignRoom = async (roomId) => {
    try {
      // Call backend API
      await unassignRoomAPI(roomId);

      // Update local state
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                assignedTo: null,
                assignedEmployeeName: null,
              }
            : room
        )
      );
    } catch (error) {
      console.error("Failed to unassign room:", error);
      // TODO: Add error notification
      throw error;
    }
  };

  // Update cleaning status (for admin/manager)
  const updateCleaningStatus = async (roomId, needsCleaning) => {
    try {
      // Call backend API
      await updateRoomStatusEmployee(roomId, { needsCleaning });

      // Update local state
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, needsCleaning } : room
        )
      );
    } catch (error) {
      console.error("Failed to update cleaning status:", error);
      // TODO: Add error notification
      throw error;
    }
  };

  // Update room status (vacant/occupied)
  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      // Call backend API
      await updateRoomStatusEmployee(roomId, { status: newStatus });

      // Update local state
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, status: newStatus } : room
        )
      );
    } catch (error) {
      console.error("Failed to update room status:", error);
      // TODO: Add error notification
      throw error;
    }
  };

  const unassignedRooms = rooms.filter((room) => !room.assignedEmployeeName);
  const assignedRooms = rooms.filter((room) => room.assignedEmployeeName);

  // Filter rooms by assigned employee
  const getRoomsByEmployee = (employeeName) => {
    return rooms.filter((room) => room.assignedEmployeeName === employeeName);
  };

  // Group rooms by assigned employee
  const roomsByEmployee = employees.reduce((acc, employee) => {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const employeeRooms = getRoomsByEmployee(employeeName);
    if (employeeRooms.length > 0) {
      acc[employeeName] = employeeRooms;
    }
    return acc;
  }, {});

  const handleUnassignAll = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to unassign all ${assignedRooms.length} rooms? This action cannot be undone.`
    );
    if (confirmed) {
      for (const room of assignedRooms) {
        await unassignRoom(room.id);
      }
      alert("All assigned rooms have been unassigned.");
    }
  };

  const handleMarkAllClean = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to mark all ${
        rooms.filter((r) => r.needsCleaning).length
      } rooms as clean? This action cannot be undone.`
    );
    if (confirmed) {
      for (const room of rooms.filter((r) => r.needsCleaning)) {
        await updateCleaningStatus(room.id, false);
      }
      alert("All assigned rooms have been marked as clean.");
    }
  };

  const handleMarkAllDirty = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to mark all ${
        rooms.filter((r) => !r.needsCleaning).length
      } rooms as dirty? This action cannot be undone.`
    );
    if (confirmed) {
      for (const room of rooms.filter((r) => !r.needsCleaning)) {
        await updateCleaningStatus(room.id, true);
      }
      alert("All clean rooms have been marked as dirty.");
    }
  };

  const handleMarkAllOccupied = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to mark all ${
        rooms.filter((r) => r.status === "vacant").length
      } vacant rooms as occupied? This action cannot be undone.`
    );
    if (confirmed) {
      for (const room of rooms.filter((r) => r.status === "vacant")) {
        await updateRoomStatus(room.id, "occupied");
      }
      alert("All vacant rooms have been marked as occupied.");
    }
  };

  const handleMarkAllVacant = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to mark all ${
        rooms.filter((r) => r.status === "occupied").length
      } occupied rooms as vacant? This action cannot be undone.`
    );
    if (confirmed) {
      for (const room of rooms.filter((r) => r.status === "occupied")) {
        await updateRoomStatus(room.id, "vacant");
      }
      alert("All occupied rooms have been marked as vacant.");
    }
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />
        <PageHeader>
          <PageTitle>Housekeeping Management</PageTitle>
          <PageSubtitle>Assign and manage room cleaning tasks</PageSubtitle>
        </PageHeader>

        {isLoading ? (
          <LoadingContainer>
            <LoadingText>Loading housekeeping data...</LoadingText>
          </LoadingContainer>
        ) : (
          <>
            {/* Employee Selection and Stats */}
            <EmployeeSection>
              <EmployeeStats>
                <StatCard>
                  <StatNumber>{unassignedRooms.length}</StatNumber>
                  <StatLabel>Unassigned Rooms</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{assignedRooms.length}</StatNumber>
                  <StatLabel>Assigned Rooms</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{employees.length}</StatNumber>
                  <StatLabel>Housekeeping Staff</StatLabel>
                </StatCard>
              </EmployeeStats>

              <EmployeeSelector>
                <SelectorLabel>View by Employee:</SelectorLabel>
                <Select
                  value={selectedEmployee || ""}
                  onChange={(e) => setSelectedEmployee(e.target.value || null)}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.firstName + " " + emp.lastName}
                    >
                      {emp.firstName} {emp.lastName} (
                      {
                        getRoomsByEmployee(emp.firstName + " " + emp.lastName)
                          .length
                      }{" "}
                      rooms)
                    </option>
                  ))}
                </Select>
              </EmployeeSelector>
            </EmployeeSection>

            {/* Bulk Action Buttons */}
            <BulkActionsSection>
              <BulkActionsTitle>Bulk Actions</BulkActionsTitle>
              <BulkActionsContainer>
                <BulkActionButton
                  onClick={handleUnassignAll}
                  disabled={assignedRooms.length === 0}
                  variant="unassign"
                >
                  Unassign All ({assignedRooms.length})
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllClean}
                  disabled={rooms.filter((r) => r.needsCleaning).length === 0}
                  variant="clean"
                >
                  Mark All Clean ({rooms.filter((r) => r.needsCleaning).length})
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllDirty}
                  disabled={rooms.filter((r) => !r.needsCleaning).length === 0}
                  variant="dirty"
                >
                  Mark All Dirty ({rooms.filter((r) => !r.needsCleaning).length}
                  )
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllOccupied}
                  disabled={
                    rooms.filter((r) => r.status === "vacant").length === 0
                  }
                  variant="occupied"
                >
                  Mark All Occupied (
                  {rooms.filter((r) => r.status === "vacant").length})
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllVacant}
                  disabled={
                    rooms.filter((r) => r.status === "occupied").length === 0
                  }
                  variant="vacant"
                >
                  Mark All Vacant (
                  {rooms.filter((r) => r.status === "occupied").length})
                </BulkActionButton>
              </BulkActionsContainer>
            </BulkActionsSection>

            {/* Unassigned Rooms Section */}
            {unassignedRooms.length > 0 && (
              <SectionContainer>
                <SectionHeader>
                  <SectionTitle>Unassigned Rooms</SectionTitle>
                  <SectionCount>{unassignedRooms.length} rooms</SectionCount>
                </SectionHeader>
                <HousekeepingAssignmentGrid
                  rooms={unassignedRooms}
                  employees={employees}
                  onAssignRoom={assignRoomToEmployee}
                  onUnassignRoom={unassignRoom}
                  onUpdateCleaningStatus={updateCleaningStatus}
                  showAssignmentControls={true}
                />
              </SectionContainer>
            )}

            {/* Rooms Assigned Per Employee - Separate Sections */}
            {Object.keys(roomsByEmployee).length > 0 && (
              <SectionContainer>
                <SectionHeader>
                  <SectionTitle>Rooms Assigned by Employee</SectionTitle>
                  <SectionCount>
                    {Object.keys(roomsByEmployee).length} employees with
                    assignments
                  </SectionCount>
                </SectionHeader>

                {Object.entries(roomsByEmployee).map(
                  ([employeeName, employeeRooms]) => (
                    <EmployeeAssignmentSection key={employeeName}>
                      <EmployeeSectionHeader>
                        <EmployeeName>{employeeName}</EmployeeName>
                        <EmployeeRoomCount>
                          {employeeRooms.length} rooms assigned
                        </EmployeeRoomCount>
                      </EmployeeSectionHeader>
                      <HousekeepingAssignmentGrid
                        rooms={employeeRooms}
                        employees={employees}
                        onAssignRoom={assignRoomToEmployee}
                        onUnassignRoom={unassignRoom}
                        onUpdateCleaningStatus={updateCleaningStatus}
                        showAssignmentControls={true}
                        employeeName={employeeName}
                      />
                    </EmployeeAssignmentSection>
                  )
                )}
              </SectionContainer>
            )}

            {/* Fallback if no rooms */}
            {rooms.length === 0 && !isLoading && (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <h3>No rooms found</h3>
                <p>There are no rooms available for housekeeping management.</p>
              </div>
            )}

            {/* Fallback if no housekeeping employees */}
            {employees.length === 0 && !isLoading && (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <h3>No Housekeeping Staff</h3>
                <p>
                  No employees with housekeeping position found. Please add
                  housekeeping staff first.
                </p>
              </div>
            )}
          </>
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

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const EmployeeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
`;

const EmployeeStats = styled.div`
  display: flex;
  gap: 16px;
`;

const StatCard = styled.div`
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 120px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmployeeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectorLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1c;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #1c1c1c;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2e7d32;
    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const SectionCount = styled.span`
  font-size: 14px;
  color: #666;
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 12px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0;
`;

const EmployeeAssignmentSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }
`;

const EmployeeSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #dee2e6;
`;

const EmployeeName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "👤";
    font-size: 18px;
  }
`;

const EmployeeRoomCount = styled.span`
  font-size: 14px;
  color: #495057;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
`;

const BulkActionsSection = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const BulkActionsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #dee2e6;
`;

const BulkActionsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const BulkActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ variant }) =>
    variant === "unassign" &&
    `
    background-color: #dc3545;
    color: white;
    &:hover:not(:disabled) {
      background-color: #c82333;
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
  `}

  ${({ variant }) =>
    variant === "clean" &&
    `
    background-color: #28a745;
    color: white;
    &:hover:not(:disabled) {
      background-color: #218838;
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
  `}

  ${({ variant }) =>
    variant === "dirty" &&
    `
    background-color: #fd7e14;
    color: white;
    &:hover:not(:disabled) {
      background-color: #e8690b;
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
  `}

  ${({ variant }) =>
    variant === "occupied" &&
    `
    background-color: #007bff;
    color: white;
    &:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
  `}

  ${({ variant }) =>
    variant === "vacant" &&
    `
    background-color: #6c757d;
    color: white;
    &:hover:not(:disabled) {
      background-color: #5a6268;
      transform: translateY(-1px);
    }
    &:disabled {
      background-color: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
    }
  `}

  &:disabled {
    opacity: 0.6;
  }
`;
