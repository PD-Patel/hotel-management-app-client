import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import GreetingNote from "../components/GreetingNote";
import { getEmployeePayroll } from "../services/payroll/employeePayroll";

const EmployeePayroll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showPayrollDetails, setShowPayrollDetails] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 20,
  });

  // Date filter state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("EmployeePayroll: User authenticated, fetching payroll data");
    console.log("User role:", user.role);

    fetchEmployeePayroll();
  }, [user, navigate]);

  const fetchEmployeePayroll = async (page = 1) => {
    try {
      setLoading(true);
      setMessage("");

      console.log(
        "Fetching payroll records for employee:",
        user.id,
        "page:",
        page,
        "month:",
        selectedMonth,
        "year:",
        selectedYear
      );

      // Log the actual parameters being sent
      const monthParam = selectedMonth || null;
      const yearParam = selectedYear || null;
      console.log("API call parameters:", {
        page,
        month: monthParam,
        year: yearParam,
      });

      const response = await getEmployeePayroll(
        user.id,
        page,
        20,
        monthParam,
        yearParam
      );

      if (response.success) {
        console.log("Payroll records fetched successfully:", response.data);
        setPayrollRecords(response.data.payrollRecords || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            recordsPerPage: 20,
          }
        );

        if (response.data.payrollRecords.length === 0) {
          setMessage("No payroll records found for your account.");
        }
      } else {
        console.error("API returned error:", response.message);
        setMessage(response.message || "Failed to load payroll records.");
      }
    } catch (error) {
      console.error("Error fetching payroll records:", error);
      setMessage("Failed to load payroll records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <StatusBadge status="paid">Paid</StatusBadge>;
      case "pending":
        return <StatusBadge status="pending">Pending</StatusBadge>;
      case "processing":
        return <StatusBadge status="processing">Processing</StatusBadge>;
      default:
        return <StatusBadge status="unknown">Unknown</StatusBadge>;
    }
  };

  const handleViewDetails = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayrollDetails(true);
  };

  const closePayrollDetails = () => {
    setShowPayrollDetails(false);
    setSelectedPayroll(null);
  };

  const handleDateFilterChange = async () => {
    try {
      setLoading(true);
      setMessage("");

      console.log(
        "Applying date filter - Month:",
        selectedMonth,
        "Year:",
        selectedYear
      );

      // Reset to first page when filters change
      setPagination((prev) => ({ ...prev, currentPage: 1 }));

      // Fetch data with current filter values
      const response = await getEmployeePayroll(
        user.id,
        1, // Start from page 1
        20,
        selectedMonth || null,
        selectedYear || null
      );

      if (response.success) {
        console.log(
          "Filtered payroll records fetched successfully:",
          response.data
        );
        setPayrollRecords(response.data.payrollRecords || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            recordsPerPage: 20,
          }
        );

        if (response.data.payrollRecords.length === 0) {
          setMessage("No payroll records found for the selected date range.");
        }
      } else {
        console.error("API returned error:", response.message);
        setMessage(response.message || "Failed to apply date filter.");
      }
    } catch (error) {
      console.error("Error applying date filter:", error);
      setMessage("Failed to apply date filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    try {
      setLoading(true);
      setMessage("");

      console.log("Clearing date filters");

      // Reset filter state
      setSelectedMonth("");
      setSelectedYear(new Date().getFullYear().toString());

      // Reset pagination
      setPagination((prev) => ({ ...prev, currentPage: 1 }));

      // Fetch all records without filters
      const response = await getEmployeePayroll(user.id, 1, 20, null, null);

      if (response.success) {
        console.log("All payroll records fetched successfully:", response.data);
        setPayrollRecords(response.data.payrollRecords || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 0,
            recordsPerPage: 20,
          }
        );

        if (response.data.payrollRecords.length === 0) {
          setMessage("No payroll records found for your account.");
        }
      } else {
        console.error("API returned error:", response.message);
        setMessage(response.message || "Failed to clear filters.");
      }
    } catch (error) {
      console.error("Error clearing filters:", error);
      setMessage("Failed to clear filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />

        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>My Payroll</Title>
              <Subtitle>View your payroll history and earnings</Subtitle>
            </HeaderText>
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
            <LoadingText>Loading your payroll records...</LoadingText>
          </LoadingContainer>
        ) : (
          <>
            <ContentContainer>
              <PayrollOverviewCard>
                <OverviewHeader>
                  <OverviewIcon>
                    <MDBIcon fas icon="chart-line" />
                  </OverviewIcon>
                  <OverviewContent>
                    <OverviewTitle>Payroll Summary</OverviewTitle>
                    <OverviewStats>
                      <StatItem>
                        <StatLabel>Total Records</StatLabel>
                        <StatValue>{payrollRecords.length}</StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>Total Earnings</StatLabel>
                        <StatValue>
                          {formatCurrency(
                            payrollRecords.reduce(
                              (sum, record) => sum + record.totalPay,
                              0
                            )
                          )}
                        </StatValue>
                      </StatItem>
                      <StatItem>
                        <StatLabel>Average Per Period</StatLabel>
                        <StatValue>
                          {formatCurrency(
                            payrollRecords.length > 0
                              ? payrollRecords.reduce(
                                  (sum, record) => sum + record.totalPay,
                                  0
                                ) / payrollRecords.length
                              : 0
                          )}
                        </StatValue>
                      </StatItem>
                    </OverviewStats>
                  </OverviewContent>
                </OverviewHeader>
              </PayrollOverviewCard>

              {/* Date Filter Controls */}
              <DateFilterContainer>
                <FilterRow>
                  <FilterSelect
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </FilterSelect>

                  <FilterSelect
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </FilterSelect>

                  <FilterButton onClick={handleDateFilterChange}>
                    <MDBIcon fas icon="search" />
                  </FilterButton>

                  <ClearButton onClick={clearFilters}>
                    <MDBIcon fas icon="times" />
                  </ClearButton>
                </FilterRow>
              </DateFilterContainer>

              <PayrollRecordsSection>
                <SectionHeader>
                  <SectionTitle>
                    <MDBIcon fas icon="history" />
                    Payroll History
                  </SectionTitle>
                  <SectionSubtitle>
                    View all your previous payroll records and earnings
                  </SectionSubtitle>
                </SectionHeader>

                <PayrollRecordsGrid>
                  {payrollRecords.length > 0 ? (
                    payrollRecords.map((record) => (
                      <PayrollRecordCard key={record.id}>
                        <RecordHeader>
                          <RecordPeriod>
                            <PeriodLabel>Pay Period</PeriodLabel>
                            <PeriodDates>
                              {formatDate(record.payPeriodStart)} -{" "}
                              {formatDate(record.payPeriodEnd)}
                            </PeriodDates>
                          </RecordPeriod>
                          <RecordStatus>
                            {getStatusBadge(record.status)}
                          </RecordStatus>
                        </RecordHeader>

                        <RecordContent>
                          <RecordRow>
                            <RecordLabel>Pay Date:</RecordLabel>
                            <RecordValue>
                              {formatDate(record.payDate)}
                            </RecordValue>
                          </RecordRow>
                          <RecordRow>
                            <RecordLabel>Regular Hours:</RecordLabel>
                            <RecordValue>
                              {record.regularHours.toFixed(2)} hrs
                            </RecordValue>
                          </RecordRow>
                          <RecordRow>
                            <RecordLabel>Overtime Hours:</RecordLabel>
                            <RecordValue>
                              {record.overtimeHours.toFixed(2)} hrs
                            </RecordValue>
                          </RecordRow>
                          <RecordRow>
                            <RecordLabel>Total Hours:</RecordLabel>
                            <RecordValue>
                              {record.totalHours.toFixed(2)} hrs
                            </RecordValue>
                          </RecordRow>
                          <RecordRow>
                            <RecordLabel>Pay Rate:</RecordLabel>
                            <RecordValue>
                              {formatCurrency(record.payRate)}/hr
                            </RecordValue>
                          </RecordRow>
                        </RecordContent>

                        <RecordFooter>
                          <TotalPay>
                            <TotalLabel>Total Pay</TotalLabel>
                            <TotalAmount>
                              {formatCurrency(record.totalPay)}
                            </TotalAmount>
                          </TotalPay>
                          <ViewDetailsButton
                            onClick={() => handleViewDetails(record)}
                          >
                            <MDBIcon fas icon="eye" />
                            View Details
                          </ViewDetailsButton>
                        </RecordFooter>
                      </PayrollRecordCard>
                    ))
                  ) : (
                    <EmptyState>
                      <EmptyIcon>📊</EmptyIcon>
                      <EmptyTitle>No Payroll Records</EmptyTitle>
                      <EmptyText>
                        You don't have any payroll records yet. Records will
                        appear here once payroll is generated.
                      </EmptyText>
                    </EmptyState>
                  )}
                </PayrollRecordsGrid>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationInfo>
                      Showing{" "}
                      {(pagination.currentPage - 1) *
                        pagination.recordsPerPage +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.currentPage * pagination.recordsPerPage,
                        pagination.totalRecords
                      )}{" "}
                      of {pagination.totalRecords} records
                    </PaginationInfo>
                    <PaginationControls>
                      <PaginationButton
                        onClick={() =>
                          fetchEmployeePayroll(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage <= 1}
                      >
                        <MDBIcon fas icon="chevron-left" />
                        Previous
                      </PaginationButton>

                      <PageNumbers>
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.currentPage >=
                              pagination.totalPages - 2
                            ) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.currentPage - 2 + i;
                            }

                            return (
                              <PageNumber
                                key={pageNum}
                                active={pageNum === pagination.currentPage}
                                onClick={() => fetchEmployeePayroll(pageNum)}
                              >
                                {pageNum}
                              </PageNumber>
                            );
                          }
                        )}
                      </PageNumbers>

                      <PaginationButton
                        onClick={() =>
                          fetchEmployeePayroll(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage >= pagination.totalPages
                        }
                      >
                        Next
                        <MDBIcon fas icon="chevron-right" />
                      </PaginationButton>
                    </PaginationControls>
                  </PaginationContainer>
                )}
              </PayrollRecordsSection>
            </ContentContainer>

            {/* Payroll Details Modal */}
            {showPayrollDetails && selectedPayroll && (
              <PayrollDetailsModal>
                <ModalOverlay onClick={closePayrollDetails} />
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Payroll Details</ModalTitle>
                    <CloseButton onClick={closePayrollDetails}>
                      <MDBIcon fas icon="times" />
                    </CloseButton>
                  </ModalHeader>

                  <ModalBody>
                    <DetailSection>
                      <DetailTitle>Pay Period Information</DetailTitle>
                      <DetailGrid>
                        <DetailItem>
                          <DetailLabel>Start Date</DetailLabel>
                          <DetailValue>
                            {formatDate(selectedPayroll.payPeriodStart)}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>End Date</DetailLabel>
                          <DetailValue>
                            {formatDate(selectedPayroll.payPeriodEnd)}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Pay Date</DetailLabel>
                          <DetailValue>
                            {formatDate(selectedPayroll.payDate)}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Status</DetailLabel>
                          <DetailValue>
                            {getStatusBadge(selectedPayroll.status)}
                          </DetailValue>
                        </DetailItem>
                      </DetailGrid>
                    </DetailSection>

                    <DetailSection>
                      <DetailTitle>Hours Breakdown</DetailTitle>
                      <DetailGrid>
                        <DetailItem>
                          <DetailLabel>Regular Hours</DetailLabel>
                          <DetailValue>
                            {selectedPayroll.regularHours.toFixed(2)} hrs
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Overtime Hours</DetailLabel>
                          <DetailValue>
                            {selectedPayroll.overtimeHours.toFixed(2)} hrs
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Total Hours</DetailLabel>
                          <DetailValue>
                            {selectedPayroll.totalHours.toFixed(2)} hrs
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Pay Rate</DetailLabel>
                          <DetailValue>
                            {formatCurrency(selectedPayroll.payRate)}/hr
                          </DetailValue>
                        </DetailItem>
                      </DetailGrid>
                    </DetailSection>

                    <DetailSection>
                      <DetailTitle>Earnings Breakdown</DetailTitle>
                      <DetailGrid>
                        <DetailItem>
                          <DetailLabel>Regular Pay</DetailLabel>
                          <DetailValue>
                            {formatCurrency(selectedPayroll.regularPay)}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Overtime Pay</DetailLabel>
                          <DetailValue>
                            {formatCurrency(selectedPayroll.overtimePay)}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Total Pay</DetailLabel>
                          <DetailValue className="total-pay">
                            {formatCurrency(selectedPayroll.totalPay)}
                          </DetailValue>
                        </DetailItem>
                      </DetailGrid>
                    </DetailSection>

                    <DetailSection>
                      <DetailTitle>Additional Information</DetailTitle>
                      <DetailGrid>
                        <DetailItem>
                          <DetailLabel>Generated By</DetailLabel>
                          <DetailValue>
                            {selectedPayroll.generatedBy}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Record ID</DetailLabel>
                          <DetailValue>#{selectedPayroll.id}</DetailValue>
                        </DetailItem>
                      </DetailGrid>
                    </DetailSection>
                  </ModalBody>
                </ModalContent>
              </PayrollDetailsModal>
            )}
          </>
        )}
      </Main>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  background: var(--bg-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
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

const Header = styled.header`
  margin-bottom: 24px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${({ type }) =>
    type === "success" ? "var(--status-success-bg)" : "var(--status-error-bg)"};
  border: 1px solid
    ${({ type }) =>
      type === "success" ? "var(--status-success)" : "var(--status-error)"};
  color: ${({ type }) =>
    type === "success" ? "var(--status-success)" : "var(--status-error)"};
`;

const MessageIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`;

const MessageText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  font-size: 32px;
  margin-bottom: 16px;
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

const LoadingText = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PayrollOverviewCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

const OverviewHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

const OverviewIcon = styled.div`
  background: linear-gradient(135deg, var(--status-info), #60a5fa);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const OverviewContent = styled.div`
  flex: 1;
`;

const OverviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
`;

const OverviewStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

const PayrollRecordsSection = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
`;

const PayrollRecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PayrollRecordCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
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
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-secondary);
`;

const RecordPeriod = styled.div`
  flex: 1;
`;

const PeriodLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const PeriodDates = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

const RecordStatus = styled.div`
  flex-shrink: 0;
`;

const StatusBadge = styled.span`
  background: ${({ status }) => {
    switch (status) {
      case "paid":
        return "linear-gradient(135deg, var(--status-success), #10b981)";
      case "pending":
        return "linear-gradient(135deg, var(--status-warning), #f59e0b)";
      case "processing":
        return "linear-gradient(135deg, var(--status-info), #3b82f6)";
      default:
        return "linear-gradient(135deg, var(--text-secondary), #6b7280)";
    }
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RecordContent = styled.div`
  margin-bottom: 20px;
`;

const RecordRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-secondary);

  &:last-child {
    border-bottom: none;
  }
`;

const RecordLabel = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const RecordValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
`;

const RecordFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 2px solid var(--border-secondary);
`;

const TotalPay = styled.div`
  text-align: center;
`;

const TotalLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const TotalAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--status-success);
`;

const ViewDetailsButton = styled.button`
  background: var(--status-info);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--status-info-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-primary);
  border: 2px dashed var(--border-secondary);
  border-radius: 16px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h4`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

// Modal Styled Components
const PayrollDetailsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: var(--bg-primary);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const DetailSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-secondary);
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;

  &.total-pay {
    color: var(--status-success);
    font-size: 18px;
    font-weight: 700;
  }
`;

// Pagination Styled Components
const PaginationContainer = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-secondary);
`;

const PaginationInfo = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  background: var(--status-info);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: var(--status-info-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageNumber = styled.button`
  background: ${({ active }) =>
    active ? "var(--status-info)" : "var(--bg-secondary)"};
  color: ${({ active }) => (active ? "white" : "var(--text-primary)")};
  border: 1px solid
    ${({ active }) => (active ? "var(--status-info)" : "var(--border-primary)")};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;

  &:hover:not(:active) {
    background: ${({ active }) =>
      active ? "var(--status-info-hover)" : "var(--bg-hover)"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Date Filter Styled Components
const DateFilterContainer = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:hover {
    border-color: var(--status-info);
  }

  &:focus {
    outline: none;
    border-color: var(--status-info);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    min-width: 100px;
    flex: 1;
  }
`;

const FilterButton = styled.button`
  background: var(--status-info);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;

  &:hover {
    background: var(--status-info-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ClearButton = styled.button`
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--status-warning);
    color: var(--status-warning);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default EmployeePayroll;
