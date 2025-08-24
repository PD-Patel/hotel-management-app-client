import React from "react";
import styled, { keyframes } from "styled-components";

// Fade in/out animation
const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
`;

const alertStyles = {
  success: { bg: "#d1e7dd", text: "#0f5132", icon: "fas fa-check-circle" },
  danger: { bg: "#f8d7da", text: "#842029", icon: "fas fa-times-circle" },
  warning: {
    bg: "#fff3cd",
    text: "#664d03",
    icon: "fas fa-exclamation-triangle",
  },
  info: { bg: "#cff4fc", text: "#055160", icon: "fas fa-info-circle" },
  primary: { bg: "#cfe2ff", text: "#084298", icon: "fas fa-bell" },
};

const AlertWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${({ type }) => alertStyles[type]?.bg || "#e2e3e5"};
  color: ${({ type }) => alertStyles[type]?.text || "#41464b"};
  font-size: 0.85rem;
  font-weight: 400;
  animation: ${fadeInOut} 3s ease forwards;
`;

const IconWrapper = styled.i`
  font-size: 1rem;
`;

const Message = styled.span`
  flex: 1;
`;

export default function Alert({ message, type = "primary" }) {
  const { icon } = alertStyles[type] || {};
  return (
    <AlertWrapper type={type}>
      <IconWrapper className={icon} />
      <Message>{message}</Message>
    </AlertWrapper>
  );
}
