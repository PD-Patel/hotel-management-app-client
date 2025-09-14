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

        // Filter employees with housekeeping role
        const housekeepingEmployees = employeesResponse.data.users.filter(
          (emp) => emp.role === "housekeeping"
        );

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
            <LoadingSpinner />
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
                  style={{ color: "white" }}
                >
                  Unassign All ({assignedRooms.length})
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllClean}
                  disabled={rooms.filter((r) => r.needsCleaning).length === 0}
                  variant="clean"
                  style={{ color: "white" }}
                >
                  Mark All Clean ({rooms.filter((r) => r.needsCleaning).length})
                </BulkActionButton>
                <BulkActionButton
                  onClick={handleMarkAllDirty}
                  disabled={rooms.filter((r) => !r.needsCleaning).length === 0}
                  variant="dirty"
                  style={{ color: "white" }}
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
                  style={{ color: "white" }}
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
                  style={{ color: "white" }}
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
              <EmptyStateContainer>
                <EmptyStateIcon>🧹</EmptyStateIcon>
                <EmptyStateTitle>No rooms found</EmptyStateTitle>
                <EmptyStateMessage>
                  There are no rooms available for housekeeping management.
                </EmptyStateMessage>
              </EmptyStateContainer>
            )}

            {/* Fallback if no housekeeping employees */}
            {employees.length === 0 && !isLoading && (
              <EmptyStateContainer>
                <EmptyStateIcon>👔</EmptyStateIcon>
                <EmptyStateTitle>No Housekeeping Staff</EmptyStateTitle>
                <EmptyStateMessage>
                  No employees with housekeeping position found. Please add
                  housekeeping staff first.
                </EmptyStateMessage>
              </EmptyStateContainer>
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
  background-color: var(--bg-primary);
`;

const Main = styled.div`
  flex: 1;
  background-color: var(--bg-primary);
  padding: 20px;
  overflow-y: auto;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
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

const PageHeader = styled.div`
  margin-bottom: 28px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.875rem;
  }
`;

const EmployeeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
  flex-wrap: wrap;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const EmployeeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  /* Tablet and up - 3 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatCard = styled.div`
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  text-align: center;
  min-width: 140px;
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 120px;
    padding: 16px 20px;
  }
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const EmployeeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const SelectorLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;

  /* Mobile Layout */
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 200px;
  transition: all 0.2s ease;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: var(--btn-primary-hover);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 32px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    text-align: center;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SectionCount = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid var(--border-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-self: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
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

const LoadingText = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const EmployeeAssignmentSection = styled.div`
  background: var(--card-bg);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const EmployeeSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--bg-tertiary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    text-align: center;
  }
`;

const EmployeeName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "👤";
    font-size: 20px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1.25rem;
  }
`;

const EmployeeRoomCount = styled.span`
  font-size: 14px;
  color: white;
  background: var(--btn-primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-self: center;
  }
`;

const BulkActionsSection = styled.div`
  background: var(--card-bg);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 28px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
`;

const BulkActionsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--bg-tertiary);
`;

const BulkActionsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  /* Mobile Layout */
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const BulkActionButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  ${({ variant }) =>
    variant === "unassign" &&
    `
    background: #ef4444;
    color: white !important;
    &:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
    }
    &:disabled {
      background: #f3f4f6;
      color: #9ca3af !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  ${({ variant }) =>
    variant === "clean" &&
    `
    background: #10b981;
    color: white !important;
    &:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
    }
    &:disabled {
      background: #f3f4f6;
      color: #9ca3af !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  ${({ variant }) =>
    variant === "dirty" &&
    `
    background: #f59e0b;
    color: white !important;
    &:hover:not(:disabled) {
      background: #d97706;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
    }
    &:disabled {
      background: #f3f4f6;
      color: #9ca3af !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  ${({ variant }) =>
    variant === "occupied" &&
    `
    background: #3b82f6;
    color: white !important;
    &:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
    }
    &:disabled {
      background: #f3f4f6;
      color: #9ca3af !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  ${({ variant }) =>
    variant === "vacant" &&
    `
    background: #6b7280;
    color: white !important;
    &:hover:not(:disabled) {
      background: #4b5563;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(107, 114, 128, 0.25);
    }
    &:disabled {
      background: #f3f4f6;
      color: #9ca3af !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  &:disabled {
    opacity: 0.6;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 12px;
    min-height: 40px;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const EmptyStateMessage = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;
