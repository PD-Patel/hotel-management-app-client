import React from "react";
import styled from "styled-components";
import HousekeepingRoomCard from "./HousekeepingRoomCard";

const HousekeepingAssignmentGrid = ({
  rooms,
  employees,
  onAssignRoom,
  onUnassignRoom,
  onUpdateCleaningStatus,
  showAssignmentControls = true,
}) => {
  return (
    <GridContainer>
      {rooms.map((room) => (
        <HousekeepingRoomCard
          key={room.id}
          room={room}
          employees={employees}
          onAssignRoom={onAssignRoom}
          onUnassignRoom={onUnassignRoom}
          onUpdateCleaningStatus={onUpdateCleaningStatus}
          showAssignmentControls={showAssignmentControls}
        />
      ))}
    </GridContainer>
  );
};

export default HousekeepingAssignmentGrid;

const GridContainer = styled.div`
  display: grid;
  gap: 12px;
  max-width: 1200px;

  /* Mobile Layout - 3 columns for better mobile experience */
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr); /* 4 columns for small tablets */
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(5, 1fr); /* 5 columns for tablets */
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(6, 1fr); /* 6 columns for small desktops */
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(7, 1fr); /* 7 columns for large desktops */
  }
`;
