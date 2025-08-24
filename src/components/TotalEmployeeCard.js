import React from "react";
import styled from "styled-components";

export default function TotalEmployeesCard({ totalEmployees }) {
  return (
    <Card>
      <IconSection>
        <i className="fas fa-users" />
      </IconSection>
      <Details>
        <Label>Total Employees</Label>
        <Count>{totalEmployees}</Count>
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
`;

const IconSection = styled.div`
  background-color: #e8f3ff;
  color: #1a73e8;
  font-size: 1.8rem;
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.div`
  font-size: 0.95rem;
  color: #555;
`;

const Count = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;
`;
