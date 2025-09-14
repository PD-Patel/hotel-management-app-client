import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import {
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
} from "mdb-react-ui-kit";
import { getEmployees } from "../../services/Employee/getEmployees";
import GreetingNote from "../../components/GreetingNote";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import defaultPhoto from "../../assets/user.png";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const employees = await getEmployees({
          role: user.role,
          siteId: user.siteId,
        });
        setEmployees(employees.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [user.role, user.siteId]);

  const handleEdit = (employee) => {
    navigate(`/employee/edit/${employee.id}`);
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees?.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || employee.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = [
    ...new Set(employees?.map((emp) => emp.department) || []),
  ];

  // Get employee statistics
  const totalEmployees = employees?.length || 0;
  const activeEmployees =
    employees?.filter((emp) => emp.status === "active").length || 0;
  const inactiveEmployees =
    employees?.filter((emp) => emp.status === "inactive").length || 0;

  return (
    <Container isDarkMode={isDarkMode}>
      <Sidebar user={user} />
      <Main isDarkMode={isDarkMode}>
        <GreetingNote userName={user ? user.firstName : "User"} />

        <Header isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>Employee Management</Title>
          <Subtitle isDarkMode={isDarkMode}>
            Manage employee information and profiles
          </Subtitle>
        </Header>

        {loading ? (
          <LoadingContainer isDarkMode={isDarkMode}>
            <LoadingSpinner>
              <MDBIcon fas icon="spinner" spin size="2x" />
            </LoadingSpinner>
            <LoadingText isDarkMode={isDarkMode}>
              Loading employees...
            </LoadingText>
          </LoadingContainer>
        ) : (
          <>
            {/* Statistics Cards */}
            <StatsContainer isDarkMode={isDarkMode}>
              <StatCard isDarkMode={isDarkMode}>
                <StatIcon isDarkMode={isDarkMode}>
                  <MDBIcon fas icon="users" />
                </StatIcon>
                <StatContent>
                  <StatNumber isDarkMode={isDarkMode}>
                    {totalEmployees}
                  </StatNumber>
                  <StatLabel isDarkMode={isDarkMode}>Total Employees</StatLabel>
                </StatContent>
              </StatCard>

              <StatCard isDarkMode={isDarkMode}>
                <StatIcon isDarkMode={isDarkMode} variant="success">
                  <MDBIcon fas icon="user-check" />
                </StatIcon>
                <StatContent>
                  <StatNumber isDarkMode={isDarkMode}>
                    {activeEmployees}
                  </StatNumber>
                  <StatLabel isDarkMode={isDarkMode}>Active</StatLabel>
                </StatContent>
              </StatCard>

              <StatCard isDarkMode={isDarkMode}>
                <StatIcon isDarkMode={isDarkMode} variant="warning">
                  <MDBIcon fas icon="user-clock" />
                </StatIcon>
                <StatContent>
                  <StatNumber isDarkMode={isDarkMode}>
                    {inactiveEmployees}
                  </StatNumber>
                  <StatLabel isDarkMode={isDarkMode}>Inactive</StatLabel>
                </StatContent>
              </StatCard>
            </StatsContainer>

            <ContentContainer isDarkMode={isDarkMode}>
              <HeaderSection isDarkMode={isDarkMode}>
                <PageTitle isDarkMode={isDarkMode}>Employees</PageTitle>
                <AddButton
                  isDarkMode={isDarkMode}
                  onClick={() => navigate("/employee/add")}
                >
                  <MDBIcon fas icon="plus" />
                  Add Employee
                </AddButton>
              </HeaderSection>

              {/* Search and Filters */}
              <FiltersSection isDarkMode={isDarkMode}>
                <SearchContainer isDarkMode={isDarkMode}>
                  <SearchIcon>
                    <MDBIcon fas icon="search" />
                  </SearchIcon>
                  <SearchInput
                    isDarkMode={isDarkMode}
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>

                <FilterContainer>
                  <FilterSelect
                    isDarkMode={isDarkMode}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </FilterSelect>

                  <FilterSelect
                    isDarkMode={isDarkMode}
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterContainer>
              </FiltersSection>

              {/* Mobile Card View */}
              <MobileView>
                {filteredEmployees?.length === 0 ? (
                  <MobileEmptyState isDarkMode={isDarkMode}>
                    <MobileEmptyIcon isDarkMode={isDarkMode}>
                      <MDBIcon fas icon="users" size="2x" />
                    </MobileEmptyIcon>
                    <MobileEmptyMessage isDarkMode={isDarkMode}>
                      {searchTerm ||
                      filterStatus !== "all" ||
                      filterDepartment !== "all"
                        ? "No employees match your filters. Try adjusting your search criteria."
                        : "No employees found. Add your first employee to get started."}
                    </MobileEmptyMessage>
                  </MobileEmptyState>
                ) : (
                  filteredEmployees?.map((employee) => (
                    <MobileEmployeeCard
                      key={employee.id}
                      isDarkMode={isDarkMode}
                    >
                      <MobileCardHeader isDarkMode={isDarkMode}>
                        <MobileEmployeeInfo>
                          <MobileEmployeePhoto
                            src={
                              employee.photo
                                ? `http://localhost:8888/${employee.photo}`
                                : defaultPhoto
                            }
                            alt={employee.firstName}
                          />
                          <MobileEmployeeDetails>
                            <MobileEmployeeName isDarkMode={isDarkMode}>
                              {employee.firstName} {employee.lastName}
                            </MobileEmployeeName>
                            <MobileEmployeeEmail isDarkMode={isDarkMode}>
                              {employee.email}
                            </MobileEmployeeEmail>
                          </MobileEmployeeDetails>
                        </MobileEmployeeInfo>
                        <MobileStatusBadge status={employee.status}>
                          {employee.status === "active" ? "Active" : "Inactive"}
                        </MobileStatusBadge>
                      </MobileCardHeader>

                      <MobileCardContent isDarkMode={isDarkMode}>
                        <MobileInfoRow>
                          <MobileLabel isDarkMode={isDarkMode}>
                            Position:
                          </MobileLabel>
                          <MobileValue isDarkMode={isDarkMode}>
                            {employee.role}
                          </MobileValue>
                        </MobileInfoRow>
                        <MobileInfoRow>
                          <MobileLabel isDarkMode={isDarkMode}>
                            Department:
                          </MobileLabel>
                          <MobileValue isDarkMode={isDarkMode}>
                            {employee.department}
                          </MobileValue>
                        </MobileInfoRow>
                      </MobileCardContent>

                      <MobileCardActions isDarkMode={isDarkMode}>
                        {!(
                          user.role === "manager" && employee.role === "admin"
                        ) && (
                          <MobileActionButton
                            onClick={() => handleEdit(employee)}
                          >
                            <MDBIcon fas icon="edit" />
                            Edit
                          </MobileActionButton>
                        )}
                      </MobileCardActions>
                    </MobileEmployeeCard>
                  ))
                )}
              </MobileView>

              {/* Desktop Table View */}
              <DesktopView>
                <TableContainer isDarkMode={isDarkMode}>
                  <MDBTable align="middle" responsive hover>
                    <MDBTableHead>
                      <tr>
                        <th scope="col">Employee</th>
                        <th scope="col">Position</th>
                        <th scope="col">Department</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {filteredEmployees?.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={
                                  employee.photo
                                    ? `http://localhost:8888/${employee.photo}`
                                    : defaultPhoto
                                }
                                alt=""
                                style={{ width: "48px", height: "48px" }}
                                className="rounded-circle"
                              />
                              <div className="ms-3 text-start">
                                <p
                                  className="fw-bold mb-1"
                                  style={{
                                    color: isDarkMode ? "#f8fafc" : "#1e293b",
                                  }}
                                >
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p
                                  className="mb-0 small"
                                  style={{
                                    color: isDarkMode ? "#cbd5e1" : "#64748b",
                                  }}
                                >
                                  {employee.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className="fw-medium"
                              style={{
                                color: isDarkMode ? "#f8fafc" : "#1e293b",
                              }}
                            >
                              {employee.role}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                color: isDarkMode ? "#cbd5e1" : "#64748b",
                              }}
                            >
                              {employee.department}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={employee.status}>
                              {employee.status === "active"
                                ? "Active"
                                : "Inactive"}
                            </StatusBadge>
                          </td>
                          <td>
                            {!(
                              user.role === "manager" &&
                              employee.role === "admin"
                            ) && (
                              <EditButton
                                color="link"
                                rounded
                                size="sm"
                                onClick={() => handleEdit(employee)}
                                isDarkMode={isDarkMode}
                              >
                                <MDBIcon fas icon="edit" className="me-1" />
                                Edit
                              </EditButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </MDBTableBody>
                  </MDBTable>
                </TableContainer>
              </DesktopView>
            </ContentContainer>
          </>
        )}
      </Main>
    </Container>
  );
};

export default Employee;

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
    isDarkMode ? "var(--bg-primary)" : "#fafbfc"};
  padding: 20px;
  overflow-y: auto;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.75rem;
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
  margin-bottom: 28px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
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

// Statistics Section
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--card-border)" : "#e2e8f0")};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ isDarkMode }) =>
      isDarkMode
        ? "0 8px 25px rgba(0, 0, 0, 0.4)"
        : "0 10px 25px rgba(0, 0, 0, 0.15)"};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${({ variant, isDarkMode }) => {
    if (variant === "success")
      return "linear-gradient(135deg, #10b981, #059669)";
    if (variant === "warning")
      return "linear-gradient(135deg, #f59e0b, #d97706)";
    return "linear-gradient(135deg, #3b82f6, #2563eb)";
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

const ContentContainer = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border-radius: 16px;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"};
  overflow: hidden;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--card-border)" : "#e2e8f0")};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 28px;
  padding: 24px 24px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem 1rem 0;
    margin-bottom: 1rem;
  }
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
  margin: 0;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 2px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.375rem;
    text-align: center;

    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2),
    0 2px 4px -1px rgba(59, 130, 246, 0.1);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.3),
      0 4px 6px -2px rgba(59, 130, 246, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 0.875rem;
    min-height: 48px;
  }
`;

// Filters Section
const FiltersSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 24px;
  gap: 1rem;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-secondary)" : "#f1f5f9")};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0 1rem 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  border-radius: 12px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "white"};
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-muted)" : "#94a3b8"};
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  border-radius: 12px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "white"};
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  option {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "white"};
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1e293b"};
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const TableContainer = styled.div`
  padding: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
  }

  /* Custom table styling */
  .table {
    margin-bottom: 0;
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--card-bg)" : "white"};

    th {
      background: ${({ isDarkMode }) =>
        isDarkMode
          ? "var(--table-header-bg)"
          : "linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)"};
      border-bottom: 2px solid
        ${({ isDarkMode }) => (isDarkMode ? "var(--table-border)" : "#e2e8f0")};
      color: ${({ isDarkMode }) =>
        isDarkMode ? "var(--text-tertiary)" : "#475569"};
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 16px 12px;
    }

    td {
      padding: 16px 12px;
      vertical-align: middle;
      border-bottom: 1px solid
        ${({ isDarkMode }) => (isDarkMode ? "var(--table-border)" : "#f1f5f9")};
      color: ${({ isDarkMode }) =>
        isDarkMode ? "var(--text-primary)" : "#1e293b"};
    }

    tbody tr:hover {
      background-color: ${({ isDarkMode }) =>
        isDarkMode ? "var(--table-row-hover)" : "#f8fafc"};
    }
  }
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "status",
})`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${(props) => (props.status === "active" ? "#10b981" : "#ef4444")};
  color: ${(props) => (props.status === "active" ? "#ffffff" : "#ffffff")};
  border: 1px solid
    ${(props) => (props.status === "active" ? "#059669" : "#dc2626")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EditButton = styled(MDBBtn)`
  color: ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")} !important;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "rgba(96, 165, 250, 0.1)" : "#eff6ff"} !important;
    color: ${({ isDarkMode }) =>
      isDarkMode ? "#93c5fd" : "#2563eb"} !important;
    transform: translateY(-1px);
  }
`;

// Mobile View Components
const MobileView = styled.div`
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileEmployeeCard = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--card-border)" : "#e2e8f0")};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 2px 4px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${({ isDarkMode }) =>
      isDarkMode
        ? "0 8px 25px rgba(0, 0, 0, 0.4)"
        : "0 4px 8px rgba(0, 0, 0, 0.1)"};
    transform: translateY(-2px);
  }
`;

const MobileCardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-secondary)" : "#f1f5f9")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-tertiary)" : "#f8fafc"};
`;

const MobileEmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
`;

const MobileEmployeePhoto = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MobileEmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MobileEmployeeName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  line-height: 1.3;
`;

const MobileEmployeeEmail = styled.span`
  font-size: 0.875rem;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  line-height: 1.2;
`;

const MobileStatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "status",
})`
  background: ${(props) => (props.status === "active" ? "#10b981" : "#ef4444")};
  color: ${(props) => (props.status === "active" ? "#ffffff" : "#ffffff")};
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid
    ${(props) => (props.status === "active" ? "#059669" : "#dc2626")};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MobileCardContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
`;

const MobileInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
`;

const MobileLabel = styled.span`
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#475569"};
  font-size: 0.875rem;
`;

const MobileValue = styled.span`
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-size: 0.875rem;
  font-weight: 500;
`;

const MobileCardActions = styled.div`
  padding: 1.25rem;
  border-top: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-secondary)" : "#f1f5f9")};
  display: flex;
  justify-content: flex-end;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-tertiary)" : "#f8fafc"};
`;

const MobileActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }
`;

const MobileEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
  gap: 1rem;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  text-align: center;
`;

const MobileEmptyIcon = styled.div`
  font-size: 3rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "var(--text-muted)" : "#cbd5e1")};
`;

const MobileEmptyMessage = styled.p`
  font-size: 1rem;
  margin: 0;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  font-weight: 500;
  line-height: 1.5;
`;

// Desktop View Components
const DesktopView = styled.div`
  /* Mobile Layout */
  @media (max-width: 768px) {
    display: none;
  }
`;
