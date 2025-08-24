import React, { useState } from "react";
import styled from "styled-components";

const RoomCard = ({ room, onRoomClick, isHousekeeping = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCardClick = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      if (!isHousekeeping) {
        // Only front desk can toggle occupancy status (vacant/occupied)
        await onRoomClick(room.id, "status");
      }
      // Housekeeping employees cannot change room occupancy status
    } catch (error) {
      console.error("Failed to update room status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleaningToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (isUpdating) return;

    // Prevent cleaning status change for occupied rooms
    if (room.status === "occupied") {
      alert(
        "Cannot change cleaning status of occupied rooms. Please wait until the room is vacant."
      );
      return;
    }

    setIsUpdating(true);
    try {
      // Toggle cleaning status
      await onRoomClick(room.id, "cleaning");
    } catch (error) {
      console.error("Failed to update cleaning status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCleaningStatusText = () => {
    return room.needsCleaning ? "Needs Cleaning" : "Clean";
  };

  return (
    <Card
      onClick={handleCardClick}
      isUpdating={isUpdating}
      isHousekeeping={isHousekeeping}
      status={room.status}
      needsCleaning={room.needsCleaning}
    >
      <RoomNumber>{isUpdating ? "..." : room.number}</RoomNumber>

      {/* Show cleaning status badge for all users (front desk and housekeeping) */}
      <CleaningStatusBadge needsCleaning={room.needsCleaning}>
        {getCleaningStatusText()}
      </CleaningStatusBadge>

      {/* Only show update button for housekeeping users */}
      {isHousekeeping && (
        <ToggleButton
          needsCleaning={room.needsCleaning}
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
      )}
    </Card>
  );
};

export default RoomCard;

const Card = styled.div`
  background: ${({ status, isHousekeeping, needsCleaning }) => {
    // Always show occupancy status through background color
    if (status === "occupied") {
      return "#f8d7da"; // Light red for occupied
    } else {
      return "#d4edda"; // Light green for vacant
    }
  }};
  border: 1px solid
    ${({ status, isHousekeeping, needsCleaning }) => {
      // Always show occupancy status through border color
      if (status === "occupied") {
        return "#f5c6cb"; // Red border for occupied
      } else {
        return "#c3e6cb"; // Green border for vacant
      }
    }};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: ${({ isHousekeeping }) => (isHousekeeping ? "default" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: ${({ isHousekeeping }) =>
      isHousekeeping ? "none" : "translateY(-2px)"};
    box-shadow: ${({ isHousekeeping }) =>
      isHousekeeping
        ? "0 2px 4px rgba(0, 0, 0, 0.1)"
        : "0 4px 8px rgba(0, 0, 0, 0.15)"};
  }
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
  color: ${({ needsCleaning, disabled }) => {
    if (disabled) return "#6c757d"; // Gray color for disabled
    return needsCleaning ? "#dc3545" : "#28a745";
  }};
  font-size: 10px;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: 4px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${({ needsCleaning, disabled }) => {
      if (disabled) return "transparent";
      return needsCleaning ? "#f8d7da" : "#d4edda";
    }};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
