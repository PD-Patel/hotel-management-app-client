import React, { useState } from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../../contexts/ThemeContext";

const RoomCard = ({ room, onRoomClick, isHousekeeping = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { isDarkMode } = useTheme();

  const handleCardClick = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      if (!isHousekeeping) {
        await onRoomClick(room.id, "status");
      }
    } catch (error) {
      console.error("Failed to update room status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleaningToggle = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;

    if (room.status === "occupied") {
      alert(
        "Cannot change cleaning status of occupied rooms. Please wait until the room is vacant."
      );
      return;
    }

    setIsUpdating(true);
    try {
      await onRoomClick(room.id, "cleaning");
    } catch (error) {
      console.error("Failed to update cleaning status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
    <Card
      onClick={handleCardClick}
      isUpdating={isUpdating}
      isHousekeeping={isHousekeeping}
      status={room.status}
      statusColors={statusColors}
    >
      <CardHeader>
        <RoomNumber
          className="room-number"
          theme={isDarkMode ? "dark" : "light"}
        >
          {isUpdating ? "..." : room.number}
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
            status={room.status}
            theme={isDarkMode ? "dark" : "light"}
          >
            Status
          </StatusLabel>
          <StatusValue
            status={room.status}
            theme={isDarkMode ? "dark" : "light"}
          >
            {room.status === "occupied" ? "Occupied" : "Vacant"}
          </StatusValue>
        </StatusSection>

        <CleaningSection>
          <CleaningStatus
            colors={cleaningColors}
            theme={isDarkMode ? "dark" : "light"}
          >
            <MDBIcon fas icon={room.needsCleaning ? "broom" : "check-circle"} />
            <span>{room.needsCleaning ? "Needs Cleaning" : "Clean"}</span>
          </CleaningStatus>
        </CleaningSection>

        {isHousekeeping && (
          <ActionSection theme={isDarkMode ? "dark" : "light"}>
            <ToggleButton
              colors={cleaningColors}
              theme={isDarkMode ? "dark" : "light"}
              onClick={handleCleaningToggle}
              disabled={room.status === "occupied"}
              title={
                room.status === "occupied"
                  ? "Cannot change cleaning status of occupied rooms"
                  : ""
              }
            >
              {room.needsCleaning ? "Mark Clean" : "Mark Dirty"}
            </ToggleButton>
          </ActionSection>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomCard;

const Card = styled.div`
  background: ${({ statusColors }) => statusColors.background};
  border: 2px solid ${({ statusColors }) => statusColors.border};
  border-radius: 12px;
  padding: 20px;
  cursor: ${({ isHousekeeping }) => (isHousekeeping ? "default" : "pointer")};
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${({ isHousekeeping }) =>
      isHousekeeping ? "none" : "translateY(-4px)"};
    box-shadow: ${({ isHousekeeping }) =>
      isHousekeeping ? "var(--card-shadow)" : "0 8px 25px rgba(0, 0, 0, 0.12)"};
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 120px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const RoomNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) =>
    theme === "dark" ? "#f8fafc" : "#1e293b"} !important;
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

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => (theme === "dark" ? "#cbd5e1" : "#64748b")};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const StatusValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ status, theme }) =>
    status === "occupied"
      ? theme === "dark"
        ? "#f87171"
        : "#dc2626"
      : theme === "dark"
      ? "#4ade80"
      : "#16a34a"};
`;

const CleaningSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

const CleaningStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ colors }) => colors.text};
  padding: 6px 10px;
  background: ${({ colors }) => colors.background};
  border: 1px solid ${({ colors }) => colors.border};
  border-radius: 6px;
  width: fit-content;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const ActionSection = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid
    ${({ theme }) => (theme === "dark" ? "#334155" : "#e2e8f0")};

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding-top: 10px;
  }
`;

const ToggleButton = styled.button`
  background: ${({ colors }) => colors.background};
  border: 1px solid ${({ colors }) => colors.border};
  color: ${({ colors }) => colors.text};
  font-size: 12px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  padding: 8px 12px;
  border-radius: 6px;
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
    font-size: 11px;
    padding: 6px 10px;
  }
`;
