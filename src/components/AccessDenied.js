import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const AccessDeniedCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 90%;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #e74c3c;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
`;

const Message = styled.p`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2980b9;
  }
`;

const AccessDenied = ({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  buttonText = "Go to Dashboard",
  onButtonClick = null,
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <AccessDeniedContainer>
      <AccessDeniedCard>
        <Icon>🚫</Icon>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Button onClick={handleButtonClick}>{buttonText}</Button>
      </AccessDeniedCard>
    </AccessDeniedContainer>
  );
};

export default AccessDenied;
