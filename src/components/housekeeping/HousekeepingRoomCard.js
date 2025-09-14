import React from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import {
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { useTheme } from "../../contexts/ThemeContext";

const HousekeepingRoomCard = ({
  room,
  employees,
  onAssignRoom,
  onUnassignRoom,
  onUpdateCleaningStatus,
  showAssignmentControls = true,
}) => {
  const { isDarkMode } = useTheme();

  // Check if room is assigned to someone
  const isAssigned = room.assignedTo && room.assignedTo !== null;

  const getStatusColor = () => {
    if (room.status === "occupied") {
      return {
        background: isDarkMode
          ? "linear-gradient(135deg, #1e293b, #334155)"
          : "linear-gradient(135deg, #fef2f2, #fee2e2)",
        border: isDarkMode ? "#475569" : "#fecaca",
        text: "#dc2626",
        icon: "#ef4444",
      };
    } else {
      return {
        background: isDarkMode
          ? "linear-gradient(135deg, #0f172a, #1e293b)"
          : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        border: isDarkMode ? "#334155" : "#bbf7d0",
        text: "#16a34a",
        icon: "#22c55e",
      };
    }
  };

  const getCleaningColor = () => {
    if (room.needsCleaning) {
      return {
        background: isDarkMode
          ? "linear-gradient(135deg, #451a03, #78350f)"
          : "linear-gradient(135deg, #fffbeb, #fef3c7)",
        border: isDarkMode ? "#92400e" : "#fde68a",
        text: isDarkMode ? "#fbbf24" : "#d97706",
        icon: "#f59e0b",
      };
    } else {
      return {
        background: isDarkMode
          ? "linear-gradient(135deg, #064e3b, #065f46)"
          : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        border: isDarkMode ? "#047857" : "#bbf7d0",
        text: isDarkMode ? "#4ade80" : "#16a34a",
        icon: "#22c55e",
      };
    }
  };

  const statusColors = getStatusColor();
  const cleaningColors = getCleaningColor();

  return (
    <Card statusColors={statusColors}>
      <CardHeader>
        <RoomNumber
          theme={isDarkMode ? "dark" : "light"}
          style={{ color: isDarkMode ? "#f8fafc" : "#1e293b" }}
        >
          {room.number}
        </RoomNumber>
        <StatusIndicator status={room.status}>
          <MDBIcon
            fas
            icon={room.status === "occupied" ? "bed" : "door-open"}
          />
        </StatusIndicator>
      </CardHeader>

      <CardContent>
        <StatusSection>
          <StatusLabel
            theme={isDarkMode ? "dark" : "light"}
            style={{ color: isDarkMode ? "#cbd5e1" : "#64748b" }}
          >
            Status
          </StatusLabel>
          <StatusValue
            status={room.status}
            theme={isDarkMode ? "dark" : "light"}
            style={{
              color:
                room.status === "occupied"
                  ? isDarkMode
                    ? "#f87171"
                    : "#dc2626"
                  : isDarkMode
                  ? "#4ade80"
                  : "#16a34a",
            }}
          >
            {room.status === "occupied" ? "Occupied" : "Vacant"}
          </StatusValue>
        </StatusSection>

        <CleaningSection>
          <CleaningStatus colors={cleaningColors}>
            <MDBIcon fas icon={room.needsCleaning ? "broom" : "check-circle"} />
            <span>{room.needsCleaning ? "Needs Cleaning" : "Clean"}</span>
          </CleaningStatus>
        </CleaningSection>

        <ActionSection theme={isDarkMode ? "dark" : "light"}>
          <ToggleButton
            colors={cleaningColors}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateCleaningStatus(room.id, !room.needsCleaning);
            }}
            disabled={room.status === "occupied"}
            title={
              room.status === "occupied"
                ? "Cannot change cleaning status of occupied rooms"
                : ""
            }
          >
            {room.needsCleaning ? "Mark Clean" : "Mark Dirty"}
          </ToggleButton>

          {/* Show Assign button only when room is NOT assigned AND assignment controls are enabled */}
          {!isAssigned && showAssignmentControls && (
            <AssignButton>
              <MDBDropdown>
                <MDBDropdownToggle
                  color="primary"
                  size="sm"
                  style={{
                    backgroundColor: "#007bff",
                    border: "none",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    width: "100%",
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
                    backgroundColor: isDarkMode ? "#1e293b" : "#fff",
                    border: `1px solid ${
                      isDarkMode ? "#334155" : "rgba(0,0,0,.15)"
                    }`,
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
                        color: isDarkMode ? "#cbd5e1" : "#495057",
                        transition: "background-color 0.15s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode
                          ? "#334155"
                          : "#f8f9fa";
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
            </AssignButton>
          )}

          {/* Show Unassign button only when room IS assigned AND assignment controls are enabled */}
          {isAssigned && showAssignmentControls && (
            <UnassignButton
              onClick={(e) => {
                e.stopPropagation();
                onUnassignRoom(room.id);
              }}
            >
              Unassign
            </UnassignButton>
          )}
        </ActionSection>
      </CardContent>
    </Card>
  );
};

export default HousekeepingRoomCard;

// Styled Components
const Card = styled.div`
  background: ${({ statusColors }) => statusColors.background};
  border: 2px solid ${({ statusColors }) => statusColors.border};
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 100px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const RoomNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) =>
    theme === "dark" ? "#f8fafc" : "#1e293b"} !important;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StatusIndicator = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ status }) =>
    status === "occupied"
      ? "linear-gradient(135deg, var(--status-error), #dc2626)"
      : "linear-gradient(135deg, var(--status-success), #16a34a)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatusLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) =>
    theme === "dark" ? "#cbd5e1" : "#64748b"} !important;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const StatusValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ status, theme }) =>
    status === "occupied"
      ? theme === "dark"
        ? "#f87171"
        : "#dc2626"
      : theme === "dark"
      ? "#4ade80"
      : "#16a34a"} !important;
`;

const CleaningSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
`;

const CleaningStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ colors }) => colors.text};
  padding: 4px 8px;
  background: ${({ colors }) => colors.background};
  border: 1px solid ${({ colors }) => colors.border};
  border-radius: 5px;
  width: fit-content;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const ActionSection = styled.div`
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid
    ${({ theme }) => (theme === "dark" ? "#334155" : "rgba(0, 0, 0, 0.1)")};
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding-top: 6px;
    gap: 4px;
  }
`;

const ToggleButton = styled.button`
  background: ${({ colors }) => colors.background};
  border: 1px solid ${({ colors }) => colors.border};
  color: ${({ colors }) => colors.text};
  font-size: 11px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  padding: 6px 10px;
  border-radius: 5px;
  transition: all 0.2s ease;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 4px 8px;
  }
`;

const AssignButton = styled.div`
  width: 100%;
`;

const UnassignButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 10px;
  }
`;
