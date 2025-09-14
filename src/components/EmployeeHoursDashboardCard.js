import React from "react";
import styled from "styled-components";
import {
  MDBCard,
  MDBCardHeader,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";

// Styled Card
const StyledCard = styled(MDBCard)`
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);
  background-color: var(--card-bg);
  margin-top: 1.5rem;
  width: 100%;
  overflow: hidden;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-top: 1rem;
    border-radius: 8px;
    overflow: visible;
  }
`;

// Header
const StyledCardHeader = styled(MDBCardHeader)`
  background: var(--table-header-bg);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

// Pay Period
const PayPeriod = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0 1.5rem;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  gap: 8px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin: 0 1rem;
    padding: 10px 0;
    font-size: 0.8125rem;
    justify-content: center;
  }
`;

const PayPeriodIcon = styled.div`
  color: var(--status-info);
  font-size: 14px;
`;

// Table Container
const TableContainer = styled.div`
  border-radius: 0 0 12px 12px;
  width: 100%;
  overflow: hidden;

  /* Mobile Layout */
  @media (max-width: 768px) {
    border-radius: 0 0 8px 8px;
  }
`;

// Desktop Table View
const DesktopTable = styled.div`
  display: block;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: none;
  }
`;

// Mobile Card View
const MobileCardView = styled.div`
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: flex;
  }
`;

// Mobile Employee Card
const MobileEmployeeCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Mobile Employee Header
const MobileEmployeeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-secondary);
  width: 100%;
  justify-content: center;
`;

// Mobile Employee Info
const MobileEmployeeInfo = styled.div`
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Mobile Employee Name
const MobileEmployeeName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 8px;
  text-align: center;
`;

// Mobile Employee ID
const MobileEmployeeId = styled.div`
  display: none;
`;

// Mobile Employee Role
const MobileEmployeeRole = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: capitalize;
`;

// Mobile Employee Details
const MobileEmployeeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  justify-items: center;
  align-items: start;
  justify-content: center;
  max-width: 100%;
`;

// Mobile Detail Item
const MobileDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
  width: 100%;
  justify-content: center;
  min-width: 120px;
`;

// Mobile Detail Label
const MobileDetailLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  text-align: center;
  width: 100%;
`;

// Mobile Detail Value
const MobileDetailValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  width: 100%;
`;

// Mobile Hours Value
const MobileHoursValue = styled(MobileDetailValue)`
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 700;
`;

// Mobile Pay Rate Value
const MobilePayRateValue = styled(MobileDetailValue)`
  color: #059669;
  font-size: 0.875rem;
  font-weight: 600;
`;

// Mobile Total Pay Value
const MobileTotalPayValue = styled(MobileDetailValue)`
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 700;
`;

// Table Styles
const StyledTable = styled(MDBTable)`
  width: 100%;
  margin-bottom: 0;
  border-collapse: collapse;

  th,
  td {
    box-sizing: border-box;
    vertical-align: middle;
  }

  /* Ensure consistent column widths */
  th:nth-child(1),
  td:nth-child(1) {
    width: 60px;
    min-width: 60px;
    max-width: 60px;
  }
  th:nth-child(2),
  td:nth-child(2) {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }
  th:nth-child(3),
  td:nth-child(3) {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
  }
  th:nth-child(4),
  td:nth-child(4) {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
  }
  th:nth-child(5),
  td:nth-child(5) {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
  }
  th:nth-child(6),
  td:nth-child(6) {
    width: 140px;
    min-width: 140px;
    max-width: 140px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    th:nth-child(1),
    td:nth-child(1) {
      width: 50px;
      min-width: 50px;
      max-width: 50px;
    }
    th:nth-child(2),
    td:nth-child(2) {
      width: 180px;
      min-width: 180px;
      max-width: 180px;
    }
    th:nth-child(3),
    td:nth-child(3) {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    th:nth-child(4),
    td:nth-child(4) {
      width: 100px;
      min-width: 100px;
      max-width: 100px;
    }
    th:nth-child(5),
    td:nth-child(5) {
      width: 100px;
      min-width: 100px;
      max-width: 100px;
    }
    th:nth-child(6),
    td:nth-child(6) {
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }
  }
`;

// Table Head
const StyledTableHead = styled(MDBTableHead)`
  background: var(--table-header-bg);

  th {
    font-weight: 600;
    color: var(--text-tertiary);
    border-bottom: 2px solid var(--border-primary);
    padding: 16px 12px;
    white-space: nowrap;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    position: relative;
    min-width: 120px;
    text-align: center;

    &:first-child {
      border-top-left-radius: 12px;
      min-width: 60px;
      text-align: center;
    }

    &:nth-child(2) {
      min-width: 200px;
      text-align: left;
    }

    &:nth-child(3) {
      min-width: 100px;
      text-align: center;
    }

    &:last-child {
      border-top-right-radius: 12px;
      text-align: center;
    }
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    th {
      padding: 12px 8px;
      font-size: 0.75rem;
      min-width: 100px;

      &:first-child {
        min-width: 50px;
      }

      &:nth-child(2) {
        min-width: 180px;
      }

      &:nth-child(3) {
        min-width: 80px;
      }
    }
  }
`;

// Table Body
const StyledTableBody = styled(MDBTableBody)`
  tr {
    font-size: 0.875rem;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--table-border);

    &:nth-child(even) {
      background-color: var(--bg-tertiary);
    }

    &:hover {
      background-color: var(--table-row-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    &:last-child {
      border-bottom: none;
    }

    td {
      padding: 16px 12px;
      white-space: nowrap;
      vertical-align: middle;
      border: none;
      min-width: 120px;
    }
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    tr {
      font-size: 0.8125rem;

      td {
        padding: 12px 8px;
        min-width: 80px;
      }
    }
  }
`;

// Row Number Cell
const RowNumberCell = styled.td`
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  width: 60px;
  min-width: 60px;
  max-width: 60px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 50px;
    min-width: 50px;
    max-width: 50px;
  }
`;

// Name Cell
const NameCell = styled.td`
  font-weight: 600;
  color: var(--text-primary);
  min-width: 200px;
  max-width: 200px;
  text-align: left;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 180px;
    max-width: 180px;
  }
`;

const EmployeeName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
`;

const EmployeeAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
    font-weight: 700;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EmployeeNameText = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const EmployeeId = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
`;

// Role Cell
const RoleCell = styled.td`
  text-align: center;
  min-width: 100px;
  max-width: 100px;
  vertical-align: middle;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 80px;
  }
`;

const RoleText = styled.div`
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: capitalize;
`;

// Hours Cell
const HoursCell = styled.td`
  text-align: center;
  min-width: 120px;
  max-width: 120px;
  vertical-align: middle;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 100px;
    max-width: 100px;
  }
`;

const HourText = styled.div`
  color: var(--status-info);
  font-weight: 700;
  font-size: 0.875rem;
  background: ${({ theme }) =>
    theme === "dark"
      ? "linear-gradient(135deg, #1e40af, #1e3a8a)"
      : "linear-gradient(135deg, #dbeafe, #eff6ff)"};
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  min-width: 80px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    padding: 4px 8px;
    min-width: 70px;
  }
`;

// Pay Rate Cell
const PayRateCell = styled.td`
  text-align: center;
  min-width: 120px;
  max-width: 120px;
  vertical-align: middle;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 100px;
    max-width: 100px;
  }
`;

const PayRateText = styled.div`
  color: var(--status-success);
  font-weight: 600;
  font-size: 0.875rem;
  background: ${({ theme }) =>
    theme === "dark"
      ? "linear-gradient(135deg, #166534, #14532d)"
      : "linear-gradient(135deg, #d1fae5, #ecfdf5)"};
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  min-width: 80px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    padding: 4px 8px;
    min-width: 70px;
  }
`;

// Total Pay Cell
const TotalPayCell = styled.td`
  text-align: center;
  min-width: 140px;
  max-width: 140px;
  vertical-align: middle;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 120px;
    max-width: 120px;
  }
`;

const TotalPayText = styled.div`
  color: var(--status-error);
  font-weight: 700;
  font-size: 0.875rem;
  background: ${({ theme }) =>
    theme === "dark"
      ? "linear-gradient(135deg, #991b1b, #7f1d1d)"
      : "linear-gradient(135deg, #fee2e2, #fef2f2)"};
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  min-width: 80px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    padding: 4px 8px;
    min-width: 70px;
  }
`;

// Empty State
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
`;

const EmployeeHoursDashboardCard = ({ summary, showPayRoll, start, end }) => {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Parse the date string and create a date object in local timezone
    // This prevents timezone conversion issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledCard>
      <StyledCardHeader>
        <HeaderIcon>
          <MDBIcon fas icon="users" />
        </HeaderIcon>
        Team Work Hours
      </StyledCardHeader>

      <PayPeriod>
        <PayPeriodIcon>
          <MDBIcon fas icon="calendar-alt" />
        </PayPeriodIcon>
        {formatDate(start)} to {formatDate(end)}
      </PayPeriod>

      <TableContainer>
        <DesktopTable>
          <StyledTable align="middle" responsive hover>
            <StyledTableHead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Role</th>
                <th>Regular Hours</th>
                <th>Overtime Hours</th>
                {showPayRoll && <th>Pay Rate</th>}
                {showPayRoll && <th>Total Pay</th>}
              </tr>
            </StyledTableHead>
            <StyledTableBody>
              {summary && summary.length > 0 ? (
                summary.map((emp, index) => (
                  <tr key={emp.employeeId || index}>
                    <RowNumberCell>{index + 1}</RowNumberCell>
                    <NameCell>
                      <EmployeeName>
                        <EmployeeAvatar>
                          {getInitials(emp.employeeName)}
                        </EmployeeAvatar>
                        <EmployeeInfo>
                          <EmployeeNameText>
                            {emp.employeeName}
                          </EmployeeNameText>
                          <EmployeeId>ID: {emp.employeeId || "N/A"}</EmployeeId>
                        </EmployeeInfo>
                      </EmployeeName>
                    </NameCell>
                    <RoleCell>
                      <RoleText theme={theme}>
                        {emp.employeeRole || emp.role || "N/A"}
                      </RoleText>
                    </RoleCell>
                    <HoursCell>
                      <HourText theme={theme}>
                        {parseFloat(emp.regularHours || 0).toFixed(2)} hrs
                      </HourText>
                    </HoursCell>
                    <HoursCell>
                      <HourText theme={theme}>
                        {parseFloat(emp.overtimeHours || 0).toFixed(2)} hrs
                      </HourText>
                    </HoursCell>
                    {showPayRoll && (
                      <PayRateCell>
                        <PayRateText theme={theme}>
                          ${parseFloat(emp.payrate || 0).toFixed(2)}
                        </PayRateText>
                      </PayRateCell>
                    )}
                    {showPayRoll && (
                      <TotalPayCell>
                        <TotalPayText theme={theme}>
                          $
                          {parseFloat(
                            (emp.regularHours || 0) * (emp.payrate || 0) +
                              (emp.overtimeHours || 0) *
                                (emp.payrate || 0) *
                                1.5
                          ).toFixed(2)}
                        </TotalPayText>
                      </TotalPayCell>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showPayRoll ? 7 : 5}>
                    <EmptyState>
                      <EmptyIcon>📊</EmptyIcon>
                      <EmptyText>
                        No employee data available for this period
                      </EmptyText>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </StyledTableBody>
          </StyledTable>
        </DesktopTable>

        <MobileCardView>
          {summary && summary.length > 0 ? (
            summary.map((emp, index) => (
              <MobileEmployeeCard key={emp.employeeId || index}>
                <MobileEmployeeHeader>
                  <EmployeeAvatar>
                    {getInitials(emp.employeeName)}
                  </EmployeeAvatar>
                  <MobileEmployeeInfo>
                    <MobileEmployeeName>{emp.employeeName}</MobileEmployeeName>
                    <MobileEmployeeId>
                      ID: {emp.employeeId || "N/A"}
                    </MobileEmployeeId>
                    <MobileEmployeeRole>
                      Role: {emp.employeeRole || emp.role || "N/A"}
                    </MobileEmployeeRole>
                  </MobileEmployeeInfo>
                </MobileEmployeeHeader>
                <MobileEmployeeDetails>
                  <MobileDetailItem>
                    <MobileDetailLabel>Regular Hours</MobileDetailLabel>
                    <MobileHoursValue>
                      {parseFloat(emp.regularHours || 0).toFixed(2)} hrs
                    </MobileHoursValue>
                  </MobileDetailItem>
                  <MobileDetailItem>
                    <MobileDetailLabel>Overtime Hours</MobileDetailLabel>
                    <MobileHoursValue>
                      {parseFloat(emp.overtimeHours || 0).toFixed(2)} hrs
                    </MobileHoursValue>
                  </MobileDetailItem>
                  {showPayRoll && (
                    <MobileDetailItem>
                      <MobileDetailLabel>Pay Rate</MobileDetailLabel>
                      <MobilePayRateValue>
                        ${parseFloat(emp.payrate || 0).toFixed(2)}
                      </MobilePayRateValue>
                    </MobileDetailItem>
                  )}
                  {showPayRoll && (
                    <MobileDetailItem>
                      <MobileDetailLabel>Total Pay</MobileDetailLabel>
                      <MobileTotalPayValue>
                        $
                        {parseFloat(
                          (emp.regularHours || 0) * (emp.payrate || 0) +
                            (emp.overtimeHours || 0) * (emp.payrate || 0) * 1.5
                        ).toFixed(2)}
                      </MobileTotalPayValue>
                    </MobileDetailItem>
                  )}
                </MobileEmployeeDetails>
              </MobileEmployeeCard>
            ))
          ) : (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <EmptyText>No employee data available for this period</EmptyText>
            </EmptyState>
          )}
        </MobileCardView>
      </TableContainer>
    </StyledCard>
  );
};

export default EmployeeHoursDashboardCard;
