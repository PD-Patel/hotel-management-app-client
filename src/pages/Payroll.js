import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import GreetingNote from "../components/GreetingNote";

import { getSummary } from "../services/payroll/payrollReport";

import {
  exportPayroll,
  getPayPeriod,
} from "../services/payroll/generatePayroll";

import { MDBIcon } from "mdb-react-ui-kit";

const Payroll = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [startPayPeriod, setStartPayPeriod] = useState("");
  const [endPayPeriod, setEndPayPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const payPeriod = await getPayPeriod(user.siteId);
        const { start, end } = payPeriod.payPeriod;
        setStartPayPeriod(start.substring(0, 10));
        setEndPayPeriod(end.substring(0, 10));

        // Set payroll generation flag
        setCanGenerate(payPeriod.canGenerate || false);

        console.log(start, end);
        const response = await getSummary(
          start.substring(0, 10),
          end.substring(0, 10)
        );
        console.log("Payroll Summary Response:", response);
        console.log("Employee Summary Data:", response.employeeSummary);
        setSummary(response.employeeSummary || []);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
        setMessage("Failed to load payroll data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user.siteId]);

  const handleGeneratePayroll = () => {
    if (!canGenerate) {
      setMessage(
        "Payroll can only be generated 4 days before payday. Please wait until the appropriate time."
      );
      setTimeout(() => setMessage(""), 8000);
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmGeneratePayroll = async () => {
    try {
      setGenerating(true);
      setMessage("");
      setShowConfirmDialog(false);

      // Regular payroll generation with database storage
      const response = await exportPayroll(user.siteId);
      setMessage("Payroll generated and saved to database successfully!");
      setTimeout(() => setMessage(""), 5000);

      // Refresh the payroll data after successful generation
      const payPeriod = await getPayPeriod(user.siteId);
      const { start, end } = payPeriod.payPeriod;
      setStartPayPeriod(start.substring(0, 10));
      setEndPayPeriod(end.substring(0, 10));
      setCanGenerate(payPeriod.canGenerate || false);
    } catch (error) {
      console.error("Error generating payroll:", error);
      setMessage("Failed to generate payroll. Please try again.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setGenerating(false);
    }
  };

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

  // Calculate total pay for all employees
  const calculateTotalPay = () => {
    if (!summary || summary.length === 0) return 0;
    return summary.reduce((total, emp) => {
      const regularHours = parseFloat(emp.regularHours || 0);
      const overtimeHours = parseFloat(emp.overtimeHours || 0);
      const rate = parseFloat(emp.payrate || 0);

      const regularPay = regularHours * rate;
      const overtimePay = overtimeHours * (rate * 1.5);

      return total + regularPay + overtimePay;
    }, 0);
  };

  // Calculate total pay for hourly cash employees
  const calculateHourlyCashAmount = () => {
    if (!summary || summary.length === 0) return 0;
    return summary.reduce((total, emp) => {
      if (emp.payMethod === "hourly_cash") {
        const regularHours = parseFloat(emp.regularHours || 0);
        const overtimeHours = parseFloat(emp.overtimeHours || 0);
        const rate = parseFloat(emp.payrate || 0);

        const regularPay = regularHours * rate;
        const overtimePay = overtimeHours * (rate * 1.5);

        return total + regularPay + overtimePay;
      }
      return total;
    }, 0);
  };

  // Calculate total pay for hourly check employees
  const calculateHourlyCheckAmount = () => {
    if (!summary || summary.length === 0) return 0;
    return summary.reduce((total, emp) => {
      if (emp.payMethod === "hourly") {
        const regularHours = parseFloat(emp.regularHours || 0);
        const overtimeHours = parseFloat(emp.overtimeHours || 0);
        const rate = parseFloat(emp.payrate || 0);

        const regularPay = regularHours * rate;
        const overtimePay = overtimeHours * (rate * 1.5);

        return total + regularPay + overtimePay;
      }
      return total;
    }, 0);
  };

  // Calculate total pay for per room rate employees
  const calculatePerRoomRateAmount = () => {
    if (!summary || summary.length === 0) return 0;
    return summary.reduce((total, emp) => {
      if (emp.payMethod === "per_room_rate") {
        // For per room rate, we'll use the total pay directly
        // This assumes the backend calculates room-based pay separately
        return total + parseFloat(emp.totalPay || 0);
      }
      return total;
    }, 0);
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />

        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Payroll Management</Title>
              <Subtitle>Generate and manage employee payroll reports</Subtitle>
            </HeaderText>
            <HistoryLink onClick={() => navigate("/payroll/history")}>
              <MDBIcon fas icon="history" />
              View History
            </HistoryLink>
          </HeaderContent>
        </Header>

        {message && (
          <MessageContainer
            type={message.includes("successfully") ? "success" : "error"}
          >
            <MessageIcon>
              {message.includes("successfully") ? "✅" : "⚠️"}
            </MessageIcon>
            <MessageText>{message}</MessageText>
          </MessageContainer>
        )}

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner>⏳</LoadingSpinner>
            <LoadingText>Loading payroll data...</LoadingText>
          </LoadingContainer>
        ) : (
          <>
            <PayPeriodCard>
              <PayPeriodHeader>
                <PayPeriodIcon>
                  <MDBIcon fas icon="calendar-alt" />
                </PayPeriodIcon>
                <PayPeriodInfo>
                  <PayPeriodLabel>Current Pay Period</PayPeriodLabel>
                  <PayPeriodDates>
                    {formatDate(startPayPeriod)} - {formatDate(endPayPeriod)}
                  </PayPeriodDates>
                </PayPeriodInfo>
              </PayPeriodHeader>
            </PayPeriodCard>

            {/* Summary Cards */}
            <SummaryCardsContainer>
              <SummaryCard isDarkMode={isDarkMode} cardType="total">
                <SummaryCardIcon cardType="total">
                  <MDBIcon fas icon="dollar-sign" />
                </SummaryCardIcon>
                <SummaryCardContent>
                  <SummaryCardValue>
                    ${calculateTotalPay().toFixed(2)}
                  </SummaryCardValue>
                  <SummaryCardLabel>Total Pay</SummaryCardLabel>
                </SummaryCardContent>
              </SummaryCard>

              <SummaryCard isDarkMode={isDarkMode} cardType="cash">
                <SummaryCardIcon cardType="cash">
                  <MDBIcon fas icon="money-bill-wave" />
                </SummaryCardIcon>
                <SummaryCardContent>
                  <SummaryCardValue>
                    ${calculateHourlyCashAmount().toFixed(2)}
                  </SummaryCardValue>
                  <SummaryCardLabel>Cash Payment</SummaryCardLabel>
                </SummaryCardContent>
              </SummaryCard>

              <SummaryCard isDarkMode={isDarkMode} cardType="check">
                <SummaryCardIcon cardType="check">
                  <MDBIcon fas icon="credit-card" />
                </SummaryCardIcon>
                <SummaryCardContent>
                  <SummaryCardValue>
                    ${calculateHourlyCheckAmount().toFixed(2)}
                  </SummaryCardValue>
                  <SummaryCardLabel>Check Payment</SummaryCardLabel>
                </SummaryCardContent>
              </SummaryCard>

              <SummaryCard isDarkMode={isDarkMode} cardType="room">
                <SummaryCardIcon cardType="room">
                  <MDBIcon fas icon="bed" />
                </SummaryCardIcon>
                <SummaryCardContent>
                  <SummaryCardValue>
                    ${calculatePerRoomRateAmount().toFixed(2)}
                  </SummaryCardValue>
                  <SummaryCardLabel>Per Room Rate</SummaryCardLabel>
                </SummaryCardContent>
              </SummaryCard>
            </SummaryCardsContainer>

            {/* Team Work Hours Display */}
            <TeamHoursSection>
              <TeamHoursHeader>
                <TeamHoursTitle>
                  <MDBIcon fas icon="users" />
                  Team Work Hours
                </TeamHoursTitle>
                <TeamHoursSubtitle>
                  Current pay period: {formatDate(startPayPeriod)} -{" "}
                  {formatDate(endPayPeriod)}
                </TeamHoursSubtitle>
              </TeamHoursHeader>

              {/* Desktop Table View */}
              <TeamHoursTable className="desktop-only">
                <TableHeader>
                  <TableHeaderCell>Employee</TableHeaderCell>
                  <TableHeaderCell>Pay Method</TableHeaderCell>
                  <TableHeaderCell>Pay Rate</TableHeaderCell>
                  <TableHeaderCell>Regular Hours</TableHeaderCell>
                  <TableHeaderCell>Overtime Hours</TableHeaderCell>
                  <TableHeaderCell>Total Hours</TableHeaderCell>
                  <TableHeaderCell>Total Pay</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {summary && summary.length > 0 ? (
                    summary.map((emp, index) => (
                      <TableRow key={emp.employeeId || index}>
                        <TableCell>
                          <EmployeeInfo>
                            <EmployeeName>{emp.employeeName}</EmployeeName>
                            <EmployeeRole>
                              {emp.employeeRole || emp.role || "N/A"}
                            </EmployeeRole>
                          </EmployeeInfo>
                        </TableCell>
                        <TableCell>
                          <PayMethodBadge payMethod={emp.payMethod}>
                            {emp.payMethod === "hourly"
                              ? "Hourly Check"
                              : emp.payMethod === "hourly_cash"
                              ? "Hourly Cash"
                              : "Per Room Rate"}
                          </PayMethodBadge>
                        </TableCell>
                        <TableCell>
                          <PayRateDisplay>${emp.payrate}</PayRateDisplay>
                        </TableCell>
                        <TableCell>
                          <HoursDisplay>
                            {parseFloat(emp.regularHours || 0).toFixed(2)} hrs
                          </HoursDisplay>
                        </TableCell>
                        <TableCell>
                          <HoursDisplay>
                            {parseFloat(emp.overtimeHours || 0).toFixed(2)} hrs
                          </HoursDisplay>
                        </TableCell>
                        <TableCell>
                          <TotalHoursDisplay>
                            {parseFloat(
                              (emp.regularHours || 0) + (emp.overtimeHours || 0)
                            ).toFixed(2)}{" "}
                            hrs
                          </TotalHoursDisplay>
                        </TableCell>
                        <TableCell>
                          <TotalPayDisplay>
                            $
                            {(
                              (emp.regularHours || 0) * (emp.payrate || 0) +
                              (emp.overtimeHours || 0) *
                                (emp.payrate || 0) *
                                1.5
                            ).toFixed(2)}
                          </TotalPayDisplay>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan="7"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        {loading
                          ? "Loading team hours..."
                          : "No employee data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TeamHoursTable>

              {/* Mobile Card View */}
              <MobileCardsContainer className="mobile-only">
                {summary && summary.length > 0 ? (
                  summary.map((emp, index) => (
                    <MobileEmployeeCard key={emp.employeeId || index}>
                      <MobileCardHeader>
                        <MobileEmployeeInfo>
                          <MobileEmployeeName>
                            {emp.employeeName}
                          </MobileEmployeeName>
                          <MobileEmployeeRole>
                            {emp.employeeRole || emp.role || "N/A"}
                          </MobileEmployeeRole>
                        </MobileEmployeeInfo>
                        <MobilePayMethodBadge payMethod={emp.payMethod}>
                          {emp.payMethod === "hourly"
                            ? "Check"
                            : emp.payMethod === "hourly_cash"
                            ? "Cash"
                            : "Room"}
                        </MobilePayMethodBadge>
                      </MobileCardHeader>

                      <MobileCardContent>
                        <MobileDataRow>
                          <MobileDataLabel>Pay Rate:</MobileDataLabel>
                          <MobileDataValue>${emp.payrate}</MobileDataValue>
                        </MobileDataRow>

                        <MobileDataRow>
                          <MobileDataLabel>Regular Hours:</MobileDataLabel>
                          <MobileDataValue>
                            {parseFloat(emp.regularHours || 0).toFixed(2)} hrs
                          </MobileDataValue>
                        </MobileDataRow>

                        <MobileDataRow>
                          <MobileDataLabel>Overtime Hours:</MobileDataLabel>
                          <MobileDataValue>
                            {parseFloat(emp.overtimeHours || 0).toFixed(2)} hrs
                          </MobileDataValue>
                        </MobileDataRow>

                        <MobileDataRow>
                          <MobileDataLabel>Total Hours:</MobileDataLabel>
                          <MobileDataValue>
                            {parseFloat(
                              (emp.regularHours || 0) + (emp.overtimeHours || 0)
                            ).toFixed(2)}{" "}
                            hrs
                          </MobileDataValue>
                        </MobileDataRow>

                        <MobileDataRow>
                          <MobileDataLabel>Total Pay:</MobileDataLabel>
                          <MobileDataValue>
                            $
                            {(
                              (emp.regularHours || 0) * (emp.payrate || 0) +
                              (emp.overtimeHours || 0) *
                                (emp.payrate || 0) *
                                1.5
                            ).toFixed(2)}
                          </MobileDataValue>
                        </MobileDataRow>
                      </MobileCardContent>
                    </MobileEmployeeCard>
                  ))
                ) : (
                  <MobileEmptyState>
                    <MobileEmptyIcon>📊</MobileEmptyIcon>
                    <MobileEmptyText>
                      {loading
                        ? "Loading team hours..."
                        : "No employee data available"}
                    </MobileEmptyText>
                  </MobileEmptyState>
                )}
              </MobileCardsContainer>
            </TeamHoursSection>

            {!canGenerate && (
              <PayrollNoteCard>
                <NoteIcon>ℹ️</NoteIcon>
                <NoteContent>
                  <NoteTitle>Payroll Generation Note</NoteTitle>
                  <NoteText>
                    Payroll can only be generated 4 days before the next payday.
                    This ensures all time entries are complete and accurate
                    before processing.
                  </NoteText>
                </NoteContent>
              </PayrollNoteCard>
            )}

            <ContentContainer></ContentContainer>

            <ActionSection>
              <GenerateButton
                onClick={handleGeneratePayroll}
                disabled={generating || !canGenerate}
              >
                {generating ? (
                  <>
                    <GeneratingSpinner>⏳</GeneratingSpinner>
                    Generating Payroll...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="file-invoice-dollar" />
                    Generate Payroll Report
                  </>
                )}
              </GenerateButton>
            </ActionSection>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
              <ConfirmDialog>
                <ConfirmDialogOverlay
                  onClick={() => setShowConfirmDialog(false)}
                />
                <ConfirmDialogContent>
                  <ConfirmDialogHeader>
                    <ConfirmDialogIcon>⚠️</ConfirmDialogIcon>
                    <ConfirmDialogTitle>
                      Confirm Payroll Generation
                    </ConfirmDialogTitle>
                  </ConfirmDialogHeader>
                  <ConfirmDialogBody>
                    <p>
                      Are you sure you want to generate payroll for the current
                      pay period?
                    </p>
                    <p>
                      <strong>Pay Period:</strong> {formatDate(startPayPeriod)}{" "}
                      - {formatDate(endPayPeriod)}
                    </p>
                    <p>
                      <em>
                        This action will advance the pay period and cannot be
                        undone.
                      </em>
                    </p>
                  </ConfirmDialogBody>
                  <ConfirmDialogActions>
                    <CancelButton onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </CancelButton>
                    <ConfirmButton
                      onClick={confirmGeneratePayroll}
                      disabled={generating}
                    >
                      {generating ? "Generating..." : "Generate Payroll"}
                    </ConfirmButton>
                  </ConfirmDialogActions>
                </ConfirmDialogContent>
              </ConfirmDialog>
            )}
          </>
        )}
      </Main>
    </Container>
  );
};

export default Payroll;

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const Main = styled.div`
  flex: 1;
  background-color: var(--bg-primary);
  padding: 20px;
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
  margin-bottom: 28px;

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

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeaderText = styled.div``;

const HistoryLink = styled.button`
  background: var(--status-info);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: var(--status-info-dark);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.875rem;
  }
`;

const MessageContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "type",
})`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) =>
    props.type === "success" ? "var(--status-success)" : "var(--status-error)"};
  color: white;
  border: 1px solid
    ${(props) =>
      props.type === "success"
        ? "var(--status-success)"
        : "var(--status-error)"};

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 0.8125rem;
    margin-bottom: 1rem;
  }
`;

const MessageIcon = styled.span`
  font-size: 16px;
`;

const MessageText = styled.span`
  flex: 1;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2rem;
  gap: 1rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 2.5rem 1.25rem;
  }
`;

const LoadingSpinner = styled.div`
  font-size: 2.5rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const LoadingText = styled.span`
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const PayPeriodCard = styled.div`
  background: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 1.5rem;
    margin-bottom: 1.75rem;
  }
`;

const PayPeriodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 12px;
    flex-direction: column;
    text-align: center;
  }
`;

const PayPeriodIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(
    135deg,
    var(--btn-primary),
    var(--btn-primary-hover)
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const PayPeriodInfo = styled.div`
  flex: 1;
`;

const PayPeriodLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const PayPeriodDates = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.125rem;
  }
`;

const ContentContainer = styled.div`
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 1rem 0;
  }
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(
    135deg,
    var(--btn-primary),
    var(--btn-primary-hover)
  );
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  min-height: 48px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 16px 20px;
    font-size: 0.875rem;
    min-height: 52px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 12px 20px;
    font-size: 0.875rem;
  }
`;

const GeneratingSpinner = styled.span`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConfirmDialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const ConfirmDialogContent = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10001;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 20px;
    margin: 20px;
    width: calc(100% - 40px);
  }
`;

const ConfirmDialogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const ConfirmDialogIcon = styled.div`
  font-size: 24px;
`;

const ConfirmDialogTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const ConfirmDialogBody = styled.div`
  margin-bottom: 24px;

  p {
    margin: 0 0 12px 0;
    color: var(--text-primary);
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: var(--text-primary);
    }

    em {
      color: var(--text-secondary);
      font-style: italic;
    }
  }
`;

const ConfirmDialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-accent);
  }
`;

const ConfirmButton = styled.button`
  padding: 12px 24px;
  background: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--btn-primary-hover);
  }

  &:disabled {
    background: var(--btn-disabled);
    cursor: not-allowed;
  }
`;

const PayrollNoteCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-accent);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }
`;

const NoteIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;
`;

const NoteContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoteTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NoteText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr;
  gap: 16px;
  padding: 16px;
  background: var(--table-header-bg);
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
`;

const TableHeaderCell = styled.div`
  font-size: 14px;
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    text-align: left;
    font-size: 13px;
  }
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-accent);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    text-align: left;
    justify-content: flex-start;
    font-size: 13px;
  }
`;

const PayMethodBadge = styled.div`
  background: ${({ payMethod }) => {
    switch (payMethod) {
      case "hourly":
        return "var(--status-info)";
      case "hourly_cash":
        return "var(--status-warning)";
      case "per_room_rate":
        return "#8b5cf6";
      default:
        return "var(--status-info)";
    }
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 4px 8px;
  }
`;

// Team Hours Styled Components
const TeamHoursSection = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 20px;
    border-radius: 8px;
  }
`;

const TeamHoursHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const TeamHoursTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const TeamHoursSubtitle = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TeamHoursTable = styled.div`
  overflow-x: auto;
  padding: 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: none;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-items: flex-start;
    text-align: left;
  }
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const EmployeeRole = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const PayRateDisplay = styled.div`
  font-weight: 600;
  color: var(--status-success);
  font-size: 14px;
`;

const HoursDisplay = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
`;

const TotalHoursDisplay = styled.div`
  font-weight: 600;
  color: var(--status-info);
  font-size: 14px;
`;

const TotalPayDisplay = styled.div`
  font-weight: 700;
  color: var(--status-success);
  font-size: 14px;
`;

// Mobile Card View Styled Components
const MobileCardsContainer = styled.div`
  display: none;
  flex-direction: column;
  gap: 20px;
  padding: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileEmployeeCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--status-info),
      var(--status-success)
    );
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-color: var(--border-accent);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-secondary);
  position: relative;
`;

const MobileEmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const MobileEmployeeName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.2;
`;

const MobileEmployeeRole = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;

const MobilePayMethodBadge = styled.div`
  background: ${({ payMethod }) => {
    switch (payMethod) {
      case "hourly":
        return "linear-gradient(135deg, var(--status-info), #60a5fa)";
      case "hourly_cash":
        return "linear-gradient(135deg, var(--status-warning), #fbbf24)";
      case "per_room_rate":
        return "linear-gradient(135deg, #8b5cf6, #a78bfa)";
      default:
        return "linear-gradient(135deg, var(--status-info), #60a5fa)";
    }
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 60px;
`;

const MobileCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileDataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-accent);
    transform: translateX(2px);
  }
`;

const MobileDataLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  flex: 1;
  letter-spacing: 0.025em;
`;

const MobileDataValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
  flex: 1;
  letter-spacing: -0.025em;
`;

const MobileEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 2px dashed var(--border-secondary);
`;

const MobileEmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const MobileEmptyText = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.025em;
`;

// Summary Cards Styled Components
const SummaryCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
`;

const SummaryCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ cardType }) => {
      switch (cardType) {
        case "total":
          return "linear-gradient(90deg, #10b981, #34d399)";
        case "cash":
          return "linear-gradient(90deg, #f59e0b, #fbbf24)";
        case "check":
          return "linear-gradient(90deg, #3b82f6, #60a5fa)";
        default:
          return "linear-gradient(90deg, #3b82f6, #60a5fa)";
      }
    }};
    border-radius: 12px 12px 0 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: var(--border-accent);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SummaryCardIcon = styled.div`
  font-size: 24px;
  color: ${({ cardType }) => {
    switch (cardType) {
      case "total":
        return "#10b981";
      case "cash":
        return "#f59e0b";
      case "check":
        return "#3b82f6";
      case "room":
        return "#8b5cf6";
      default:
        return "#3b82f6";
    }
  }};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ cardType }) => {
    switch (cardType) {
      case "total":
        return "rgba(16, 185, 129, 0.1)";
      case "cash":
        return "rgba(245, 158, 11, 0.1)";
      case "check":
        return "rgba(59, 130, 246, 0.1)";
      case "room":
        return "rgba(139, 92, 246, 0.1)";
      default:
        return "rgba(59, 130, 246, 0.1)";
    }
  }};
  border-radius: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 20px;
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }
`;

const SummaryCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryCardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const SummaryCardLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;
