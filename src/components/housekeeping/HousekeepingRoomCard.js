import React from "react";
import styled from "styled-components";
import {
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-react-ui-kit";

const DropdownContainer = styled.div`
  position: relative;
  z-index: 10000;
`;

const Card = styled.div`
  background: ${({ status }) =>
    status === "occupied" ? "#f8d7da" : "#d4edda"};
  border: 1px solid
    ${({ status }) => (status === "occupied" ? "#f5c6cb" : "#c3e6cb")};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const RoomNumber = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 8px;
`;

const CleaningStatusBadge = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  margin-top: 4px;
  border: 1px solid
    ${({ needsCleaning }) => (needsCleaning ? "#ffc107" : "#28a745")};
  background-color: ${({ needsCleaning }) =>
    needsCleaning ? "#fff3cd" : "#d4edda"};
  color: ${({ needsCleaning }) => (needsCleaning ? "#856404" : "#155724")};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ needsCleaning }) => (needsCleaning ? "#dc3545" : "#28a745")};
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: 4px;

  &:hover {
    background-color: ${({ needsCleaning }) =>
      needsCleaning ? "#f8d7da" : "#d4edda"};
  }
`;

const UnassignButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
  }
`;

export default function HousekeepingRoomCard({
  room,
  employees,
  onAssignRoom,
  onUnassignRoom,
  onUpdateCleaningStatus,
}) {
  return (
    <Card status={room.status}>
      <RoomNumber>{room.number}</RoomNumber>

      <CleaningStatusBadge needsCleaning={room.needsCleaning}>
        {room.needsCleaning ? "Needs Cleaning" : "Clean"}
      </CleaningStatusBadge>

      <ToggleButton
        needsCleaning={room.needsCleaning}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateCleaningStatus(room.id, !room.needsCleaning);
        }}
      >
        {room.needsCleaning ? "Mark Clean" : "Mark Dirty"}
      </ToggleButton>

      <DropdownContainer>
        <MDBDropdown>
          <MDBDropdownToggle
            color="primary"
            size="sm"
            style={{
              backgroundColor: "#007bff",
              border: "none",
              padding: "4px 12px",
              fontSize: "10px",
              fontWeight: "500",
              borderRadius: "4px",
              marginTop: "8px",
            }}
          >
            Assign
          </MDBDropdownToggle>
          <MDBDropdownMenu
            style={{
              zIndex: 10001,
              position: "absolute",
              minWidth: "150px",
              padding: "4px 0",
              margin: "2px 0 0",
              backgroundColor: "#fff",
              border: "1px solid rgba(0,0,0,.15)",
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0,0,0,.1)",
            }}
          >
            {employees.map((employee) => (
              <MDBDropdownItem
                key={employee.id}
                onClick={() => onAssignRoom(room.id, employee.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#495057",
                  transition: "background-color 0.15s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {`${employee.firstName} ${employee.lastName}`}
              </MDBDropdownItem>
            ))}
          </MDBDropdownMenu>
        </MDBDropdown>
      </DropdownContainer>

      <UnassignButton
        onClick={(e) => {
          e.stopPropagation();
          onUnassignRoom(room.id);
        }}
      >
        Unassign
      </UnassignButton>
    </Card>
  );
}
