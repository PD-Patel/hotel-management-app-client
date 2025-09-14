import React from "react";
import styled from "styled-components";

export default function HoursCard({ totalHours }) {
  return (
    <Card>
      <IconSection>
        <i className="fas fa-clock" />
      </IconSection>
      <Details>
        <Label>Total Hours</Label>
        <Count>{totalHours.toFixed(2)}</Count>
      </Details>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 260px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    max-width: 100%;
    padding: 1.5rem;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    max-width: 260px;
    padding: 20px;
  }
`;

const IconSection = styled.div`
  background-color: #fff3e0;
  color: #f57c00;
  font-size: 1.8rem;
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
    padding: 1rem;
    border-radius: 50%;
    width: 4rem;
    height: 4rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.6rem;
    padding: 1.25rem;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Label = styled.div`
  font-size: 0.95rem;
  color: #555;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1rem;
    font-weight: 500;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9rem;
  }
`;

const Count = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.4rem;
  }
`;
