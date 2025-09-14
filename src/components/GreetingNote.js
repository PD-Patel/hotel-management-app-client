import React from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";

const GreetingNote = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Function to capitalize first letter of name
  const capitalizeName = (name) => {
    if (!name) return "User";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <WelcomeSection>
      <GreetingContainer>
        <GreetingIcon>
          <MDBIcon fas icon="sun" />
        </GreetingIcon>
        <GreetingText>
          <Greeting>
            {getGreeting()} , {capitalizeName(userName)}!
          </Greeting>
        </GreetingText>
      </GreetingContainer>
    </WelcomeSection>
  );
};

export default GreetingNote;

const WelcomeSection = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  margin: 0 0 20px 0;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const GreetingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 1rem;
  }
`;

const GreetingIcon = styled.div`
  font-size: 24px;
  color: var(--status-info);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const GreetingText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const Greeting = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  font-family: Arial, sans-serif;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.75rem;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    font-size: 20px;
  }
`;
