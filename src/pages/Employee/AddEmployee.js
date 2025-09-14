import React from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import GreetingNote from "../../components/GreetingNote";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import EmployeeForm from "../../components/EmployeeForm";
import { useNavigate } from "react-router-dom";
import { addEmployee } from "../../services/Employee/addEmployee";

const AddEmployee = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await addEmployee(formData);

      // Redirect back to employee list after successful submission
      navigate("/employee");
    } catch (error) {
      console.error("Error adding employee:", error);
      // You can add error handling here (show error message to user)
    }
  };

  const handleCancel = () => {
    navigate("/employee");
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <Sidebar user={user} />
      <Main isDarkMode={isDarkMode}>
        <GreetingNote userName={user ? user.firstName : "User"} />

        <Header isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>Add New Employee</Title>
          <Subtitle isDarkMode={isDarkMode}>
            Create a new employee account and profile
          </Subtitle>
        </Header>

        <ContentContainer isDarkMode={isDarkMode}>
          <EmployeeForm
            title="Add New Employee"
            action="add"
            submitButtonText="Create Employee"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            siteId={user?.siteId}
            createdBy={user?.id}
          />
        </ContentContainer>
      </Main>
    </Container>
  );
};

export default AddEmployee;

// Styled Components with Dark Mode Support
const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  display: flex;
  height: 100vh;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-primary)" : "#f8fafc"};

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const Main = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  flex: 1;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-primary)" : "#f8fafc"};
  padding: 24px;
  overflow-y: auto;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 4rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 1.5rem;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    margin-bottom: 1.75rem;
  }
`;

const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  font-size: 28px;
  font-weight: 700;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#0f172a"};
  margin: 0 0 12px 0;
  letter-spacing: -0.025em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "isDarkMode",
})`
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  margin: 0;
  font-weight: 400;
  line-height: 1.5;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-height: auto;
  }
`;
