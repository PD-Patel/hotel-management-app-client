import React from "react";
import styled, { keyframes } from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleContainer>
      <ToggleButton
        onClick={toggleTheme}
        title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        isDarkMode={isDarkMode}
      >
        <ToggleTrack isDarkMode={isDarkMode}>
          <ToggleHandle isDarkMode={isDarkMode}>
            {isDarkMode ? (
              <MDBIcon fas icon="moon" className="toggle-icon" />
            ) : (
              <MDBIcon fas icon="sun" className="toggle-icon" />
            )}
          </ToggleHandle>
        </ToggleTrack>
        <ToggleLabel isDarkMode={isDarkMode}>
          {isDarkMode ? "Dark" : "Light"}
        </ToggleLabel>
      </ToggleButton>
    </ToggleContainer>
  );
};

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
`;

const ToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  gap: 6px;
  min-width: 60px;

  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToggleTrack = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? "linear-gradient(135deg, #1e40af, #3b82f6)"
      : "linear-gradient(135deg, #fbbf24, #f59e0b)"};
  border-radius: 12px;
  padding: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode
      ? "0 2px 8px rgba(59, 130, 246, 0.3)"
      : "0 2px 8px rgba(251, 191, 36, 0.3)"};
`;

const ToggleHandle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  position: absolute;
  top: 2px;
  left: ${({ isDarkMode }) => (isDarkMode ? "22px" : "2px")};
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .toggle-icon {
    font-size: 10px;
    color: ${({ isDarkMode }) => (isDarkMode ? "#1e40af" : "#f59e0b")};
    transition: all 0.3s ease;
    animation: ${({ isDarkMode }) => (isDarkMode ? slideIn : slideOut)} 0.3s
      ease;
  }
`;

const ToggleLabel = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  opacity: 0.8;
`;

export default ThemeToggle;
