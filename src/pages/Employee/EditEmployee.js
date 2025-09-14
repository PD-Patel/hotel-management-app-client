import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import Sidebar from "../../components/Sidebar";
import GreetingNote from "../../components/GreetingNote";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import EmployeeForm from "../../components/EmployeeForm";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployees } from "../../services/Employee/getEmployees";
import { updateEmployee } from "../../services/Employee/updateEmployee";

const EditEmployee = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        const employees = await getEmployees({
          role: user.role,
          siteId: user.siteId,
        });

        const foundEmployee = employees.users.find(
          (emp) => emp.id === parseInt(id)
        );

        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          setError("Employee not found");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchEmployee();
    } else {
      if (!user) {
        setError("User not authenticated");
      }
      setLoading(false);
    }
  }, [id, user]);

  const handleSubmit = async (formData) => {
    try {
      await updateEmployee(parseInt(id), formData);

      // Show success message or redirect
      navigate("/employee");
    } catch (error) {
      console.error("Error updating employee:", error);
      // You can add error handling here
    }
  };

  const handleCancel = () => {
    navigate("/employee");
  };

  if (loading) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user ? user.firstName : "User"} />

          <Header isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Edit Employee</Title>
            <Subtitle isDarkMode={isDarkMode}>
              Update employee information and profile
            </Subtitle>
          </Header>

          <LoadingContainer isDarkMode={isDarkMode}>
            <LoadingSpinner>
              <MDBIcon fas icon="spinner" spin size="2x" />
            </LoadingSpinner>
            <LoadingText isDarkMode={isDarkMode}>
              Loading employee data...
            </LoadingText>
          </LoadingContainer>
        </Main>
      </Container>
    );
  }

  if (error || !employee) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user ? user.firstName : "User"} />

          <Header isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Edit Employee</Title>
            <Subtitle isDarkMode={isDarkMode}>
              Update employee information and profile
            </Subtitle>
          </Header>

          <ErrorContainer isDarkMode={isDarkMode}>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage isDarkMode={isDarkMode}>
              {error || "Employee not found"}
            </ErrorMessage>
            <ErrorAction>
              <BackButton onClick={() => navigate("/employee")}>
                Back to Employee List
              </BackButton>
            </ErrorAction>
          </ErrorContainer>
        </Main>
      </Container>
    );
  }

  // Fallback case - if we somehow get here without employee data
  if (!employee) {
    return (
      <Container isDarkMode={isDarkMode}>
        <Sidebar user={user} />
        <Main isDarkMode={isDarkMode}>
          <GreetingNote userName={user ? user.firstName : "User"} />

          <Header isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Edit Employee</Title>
            <Subtitle isDarkMode={isDarkMode}>
              Update employee information and profile
            </Subtitle>
          </Header>

          <ErrorContainer isDarkMode={isDarkMode}>
            <ErrorIcon>❌</ErrorIcon>
            <ErrorMessage isDarkMode={isDarkMode}>
              No employee data available
            </ErrorMessage>
            <ErrorAction>
              <BackButton onClick={() => navigate("/employee")}>
                Back to Employee List
              </BackButton>
            </ErrorAction>
          </ErrorContainer>
        </Main>
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Sidebar user={user} />
      <Main isDarkMode={isDarkMode}>
        <GreetingNote userName={user ? user.firstName : "User"} />

        <Header isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>Edit Employee</Title>
          <Subtitle isDarkMode={isDarkMode}>
            Update employee information and profile
          </Subtitle>
        </Header>

        <ContentContainer isDarkMode={isDarkMode}>
          <EmployeeForm
            title="Edit Employee"
            action="edit"
            submitButtonText="Update Employee"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={employee}
            siteId={user?.siteId}
            createdBy={user?.id}
          />
        </ContentContainer>
      </Main>
    </Container>
  );
};

export default EditEmployee;

// Styled Components with Dark Mode Support
const Container = styled.div`
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

const Main = styled.div`
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

const Title = styled.h1`
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

const Subtitle = styled.p`
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 3rem 1.25rem;
  }
`;

const LoadingSpinner = styled.div`
  color: #3b82f6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  color: #f59e0b;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  margin: 0;
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ErrorAction = styled.div`
  margin-top: 1rem;
`;

const BackButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 18px;
    font-size: 0.875rem;
    min-height: 44px;
  }
`;
