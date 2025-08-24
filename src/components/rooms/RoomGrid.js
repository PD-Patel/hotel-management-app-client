import React from "react";
import styled from "styled-components";
import RoomCard from "./RoomCard";

const RoomGrid = ({ rooms, onRoomClick, isHousekeeping = false }) => {
  return (
    <GridContainer>
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onRoomClick={onRoomClick}
          isHousekeeping={isHousekeeping}
        />
      ))}
    </GridContainer>
  );
};

export default RoomGrid;

const GridContainer = styled.div`
  display: grid;
  gap: 16px;
  max-width: 1200px;

  /* Responsive grid columns - more columns since cards are smaller */
  grid-template-columns: 2fr; /* Default: 2 columns for mobile */

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr); /* 3 columns for small tablets */
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr); /* 4 columns for tablets */
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(5, 1fr); /* 5 columns for small desktops */
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(6, 1fr); /* 6 columns for large desktops */
  }
`;
