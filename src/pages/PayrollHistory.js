import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { MDBIcon } from "mdb-react-ui-kit";
import { format } from "date-fns";
import api from "../services/api";
import GreetingNote from "../components/GreetingNote";

const PayrollHistory = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 10,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  useEffect(() => {
    if (user && user.siteId) {
      fetchPayrollHistory();
    }
  }, [user?.siteId, pagination.currentPage]);

  const fetchPayrollHistory = async () => {
    if (!user || !user.siteId) {
      console.log("User or siteId not available:", {
        user: !!user,
        siteId: user?.siteId,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching payroll history for siteId:", user.siteId);

      const response = await api.get(
        `/payroll/history/${user.siteId}?page=${pagination.currentPage}&limit=${pagination.recordsPerPage}`
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log(
        "First payroll record sample:",
        response.data.data?.payrollRecords?.[0]
      );

      const data = response.data;

      if (data.success) {
        console.log("Setting payroll records:", data.data.payrollRecords);
        console.log("Setting pagination:", data.data.pagination);
        setPayrollRecords(data.data.payrollRecords);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.data.pagination.totalPages,
          totalRecords: data.data.pagination.totalRecords,
        }));
      } else {
        setError("Failed to fetch payroll history");
      }
    } catch (error) {
      console.error("Error fetching payroll history:", error);
      setError("Failed to fetch payroll history");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRecord(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatHours = (hours) => {
    return `${parseFloat(hours || 0).toFixed(2)} hrs`;
  };

  const formatName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Filter functions
  const getFilteredRecords = () => {
    return payrollRecords.filter((record) => {
      const payDate = new Date(record.payDate);
      const recordYear = payDate.getFullYear();
      const recordMonth = payDate.getMonth();

      return recordYear === selectedYear && recordMonth === selectedMonth;
    });
  };

  const getFilteredTotalPayroll = () => {
    const filteredRecords = getFilteredRecords();
    return filteredRecords.reduce((sum, record) => {
      const amount = parseFloat(record.totalPayroll) || 0;
      return sum + amount;
    }, 0);
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    isOpen,
    onToggle,
    selectedValue,
    onSelect,
    options,
  }) => {
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onToggle(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, onToggle]);

    return (
      <DropdownContainer ref={dropdownRef}>
        <DropdownButton onClick={() => onToggle(!isOpen)}>
          <DropdownButtonText>
            {selectedOption?.label || "Select..."}
          </DropdownButtonText>
          <DropdownArrow isOpen={isOpen}>▼</DropdownArrow>
        </DropdownButton>

        {isOpen && (
          <DropdownMenu>
            {options.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => onSelect(option.value)}
                isSelected={option.value === selectedValue}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </DropdownContainer>
    );
  };

  // Don't render until user is loaded with required properties
  if (!user || !user.siteId) {
    return (
      <Container>
        <Main>
          <LoadingContainer>
            <LoadingSpinner>⏳</LoadingSpinner>
            <LoadingText>Loading user data...</LoadingText>
          </LoadingContainer>
        </Main>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Sidebar user={user} />
        <Main>
          <LoadingContainer>
            <LoadingSpinner>⏳</LoadingSpinner>
            <LoadingText>Loading payroll history...</LoadingText>
          </LoadingContainer>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <GlobalStyles />
      <Sidebar user={user} />
      <Main>
        {/* Greeting Note with Spacing */}
        <GreetingNoteContainer>
          <GreetingNote userName={user.firstName} />
        </GreetingNoteContainer>

        {/* Header Section - Professional Design */}
        <HeaderSection>
          <HeaderContent>
            <HeaderTitle>Payroll History</HeaderTitle>
            <HeaderSubtitle>
              View and manage previously generated payroll records
            </HeaderSubtitle>
          </HeaderContent>
          <HeaderStats>
            <StatBadge>
              <StatBadgeIcon>
                <MDBIcon fas icon="chart-bar" />
              </StatBadgeIcon>
              <StatBadgeText>{payrollRecords.length} Records</StatBadgeText>
            </StatBadge>
          </HeaderStats>
        </HeaderSection>

        {error && (
          <ErrorMessage>
            <ErrorIcon>⚠️</ErrorIcon>
            {error}
          </ErrorMessage>
        )}

        <ContentContainer>
          {/* Filter Controls */}
          <FilterContainer>
            <FilterLabel>Filter:</FilterLabel>
            <FilterDropdowns>
              <FilterDropdown>
                <CustomDropdown
                  isOpen={isMonthOpen}
                  onToggle={setIsMonthOpen}
                  selectedValue={selectedMonth}
                  onSelect={(value) => {
                    setSelectedMonth(value);
                    setIsMonthOpen(false);
                  }}
                  options={[
                    { value: 0, label: "Jan" },
                    { value: 1, label: "Feb" },
                    { value: 2, label: "Mar" },
                    { value: 3, label: "Apr" },
                    { value: 4, label: "May" },
                    { value: 5, label: "Jun" },
                    { value: 6, label: "Jul" },
                    { value: 7, label: "Aug" },
                    { value: 8, label: "Sep" },
                    { value: 9, label: "Oct" },
                    { value: 10, label: "Nov" },
                    { value: 11, label: "Dec" },
                  ]}
                />
              </FilterDropdown>

              <FilterDropdown>
                <CustomDropdown
                  isOpen={isYearOpen}
                  onToggle={setIsYearOpen}
                  selectedValue={selectedYear}
                  onSelect={(value) => {
                    setSelectedYear(value);
                    setIsYearOpen(false);
                  }}
                  options={Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return { value: year, label: year.toString() };
                  })}
                />
              </FilterDropdown>
            </FilterDropdowns>
          </FilterContainer>

          {console.log("Current payrollRecords:", payrollRecords)}
          {console.log("payrollRecords.length:", payrollRecords.length)}
          {payrollRecords.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <EmptyTitle>No Payroll Records Found</EmptyTitle>
              <EmptyText>
                No payroll records have been generated yet. Generate your first
                payroll to see it here.
              </EmptyText>
            </EmptyState>
          ) : (
            <>
              <StatsContainer>
                <StatCard>
                  <StatCardContent>
                    <StatIcon>
                      <MDBIcon fas icon="file-alt" />
                    </StatIcon>
                    <StatInfo>
                      <StatValue>{getFilteredRecords().length}</StatValue>
                      <StatLabel>Records Found</StatLabel>
                    </StatInfo>
                  </StatCardContent>
                  <StatTrend>
                    <StatTrendIcon>
                      <MDBIcon fas icon="chart-line" />
                    </StatTrendIcon>
                  </StatTrend>
                </StatCard>

                <StatCard>
                  <StatCardContent>
                    <StatIcon>
                      <MDBIcon fas icon="dollar-sign" />
                    </StatIcon>
                    <StatInfo>
                      <StatValue>
                        {formatCurrency(getFilteredTotalPayroll())}
                      </StatValue>
                      <StatLabel>Total Payroll</StatLabel>
                    </StatInfo>
                  </StatCardContent>
                  <StatTrend>
                    <StatTrendIcon>
                      <MDBIcon fas icon="credit-card" />
                    </StatTrendIcon>
                  </StatTrend>
                </StatCard>
              </StatsContainer>

              {/* Desktop Table View */}
              <TableContainer className="desktop-only">
                <TableHeaderContainer>
                  <TableTitle>Payroll Records</TableTitle>
                  <TableSubtitle>
                    Detailed view of all payroll records for the selected period
                  </TableSubtitle>
                </TableHeaderContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Pay Period</TableHeaderMain>
                          <TableHeaderSub>Start - End</TableHeaderSub>
                        </TableHeaderContent>
                      </TableHeader>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Pay Date</TableHeaderMain>
                        </TableHeaderContent>
                      </TableHeader>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Hours</TableHeaderMain>
                          <TableHeaderSub>Regular | Overtime</TableHeaderSub>
                        </TableHeaderContent>
                      </TableHeader>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Total Payroll</TableHeaderMain>
                        </TableHeaderContent>
                      </TableHeader>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Generated By</TableHeaderMain>
                        </TableHeaderContent>
                      </TableHeader>
                      <TableHeader>
                        <TableHeaderContent>
                          <TableHeaderMain>Actions</TableHeaderMain>
                        </TableHeaderContent>
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredRecords().map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <DateRange>
                            <DateRangeStart>
                              {formatDate(record.payPeriodStart)}
                            </DateRangeStart>
                            <DateRangeSeparator>to</DateRangeSeparator>
                            <DateRangeEnd>
                              {formatDate(record.payPeriodEnd)}
                            </DateRangeEnd>
                          </DateRange>
                        </TableCell>
                        <TableCell>
                          <PayDate>{formatDate(record.payDate)}</PayDate>
                        </TableCell>

                        <TableCell>
                          <HoursContainer>
                            <HoursRow>
                              <HoursLabel>Regular:</HoursLabel>
                              <HoursValue>
                                {formatHours(record.totalRegularHours)}
                              </HoursValue>
                            </HoursRow>
                            <HoursRow>
                              <HoursLabel>Overtime:</HoursLabel>
                              <HoursValue>
                                {formatHours(record.totalOvertimeHours)}
                              </HoursValue>
                            </HoursRow>
                          </HoursContainer>
                        </TableCell>
                        <TableCell>
                          <PayrollAmount>
                            <PayrollAmountIcon>
                              <MDBIcon fas icon="dollar-sign" />
                            </PayrollAmountIcon>
                            {formatCurrency(record.totalPayroll)}
                          </PayrollAmount>
                        </TableCell>
                        <TableCell>
                          <GeneratorInfo>
                            {formatName(
                              `${record.generator?.firstName} ${record.generator?.lastName}`
                            )}
                          </GeneratorInfo>
                        </TableCell>
                        <TableCell>
                          <ActionButton
                            onClick={() => handleViewDetails(record)}
                          >
                            <MDBIcon fas icon="eye" />
                            View Details
                          </ActionButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Mobile Cards View */}
              <MobileCardsContainer className="mobile-only">
                <MobileCardsHeader>
                  <MobileCardsTitle>Payroll Records</MobileCardsTitle>
                  <MobileCardsSubtitle>
                    Mobile view of payroll records
                  </MobileCardsSubtitle>
                </MobileCardsHeader>
                {getFilteredRecords().map((record) => (
                  <MobileCard key={record.id}>
                    <MobileCardHeader>
                      <MobileCardPeriod>
                        <MobileCardPeriodIcon>
                          <MDBIcon fas icon="calendar-alt" />
                        </MobileCardPeriodIcon>
                        <MobileCardPeriodText>
                          {formatDate(record.payPeriodStart)} -{" "}
                          {formatDate(record.payPeriodEnd)}
                        </MobileCardPeriodText>
                      </MobileCardPeriod>
                      <MobileCardPayDate>
                        Pay Date: {formatDate(record.payDate)}
                      </MobileCardPayDate>
                    </MobileCardHeader>

                    <MobileCardContent>
                      <MobileCardSection>
                        <MobileCardSectionTitle>Hours</MobileCardSectionTitle>
                        <MobileCardRow>
                          <MobileCardLabel>Regular:</MobileCardLabel>
                          <MobileCardValue>
                            {formatHours(record.totalRegularHours)}
                          </MobileCardValue>
                        </MobileCardRow>
                        <MobileCardRow>
                          <MobileCardLabel>Overtime:</MobileCardLabel>
                          <MobileCardValue>
                            {formatHours(record.totalOvertimeHours)}
                          </MobileCardValue>
                        </MobileCardRow>
                      </MobileCardSection>

                      <MobileCardSection>
                        <MobileCardSectionTitle>
                          Financial
                        </MobileCardSectionTitle>
                        <MobileCardRow>
                          <MobileCardLabel>Total Payroll:</MobileCardLabel>
                          <MobileCardValue>
                            {formatCurrency(record.totalPayroll)}
                          </MobileCardValue>
                        </MobileCardRow>
                      </MobileCardSection>

                      <MobileCardSection>
                        <MobileCardSectionTitle>Details</MobileCardSectionTitle>
                        <MobileCardRow>
                          <MobileCardLabel>Generated By:</MobileCardLabel>
                          <MobileCardValue>
                            {formatName(
                              `${record.generator?.firstName} ${record.generator?.lastName}`
                            )}
                          </MobileCardValue>
                        </MobileCardRow>
                      </MobileCardSection>
                    </MobileCardContent>

                    <MobileCardActions>
                      <MobileActionButton
                        onClick={() => handleViewDetails(record)}
                      >
                        <MDBIcon fas icon="eye" />
                        View Details
                      </MobileActionButton>
                    </MobileCardActions>
                  </MobileCard>
                ))}
              </MobileCardsContainer>

              {pagination.totalPages > 1 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <MDBIcon fas icon="chevron-left" />
                    Previous
                  </PaginationButton>

                  <PageInfo>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </PageInfo>

                  <PaginationButton
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                    <MDBIcon fas icon="chevron-right" />
                  </PaginationButton>
                </PaginationContainer>
              )}
            </>
          )}
        </ContentContainer>

        {/* Payroll Details Modal */}
        {showDetails && selectedRecord && (
          <ModalOverlay onClick={closeDetails}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Payroll Details</ModalTitle>
                <CloseButton onClick={closeDetails}>
                  <MDBIcon fas icon="times" />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailSection>
                  <DetailTitle>Pay Period Information</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Pay Period:</DetailLabel>
                      <DetailValue>
                        {formatDate(selectedRecord.payPeriodStart)} -{" "}
                        {formatDate(selectedRecord.payPeriodEnd)}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Pay Date:</DetailLabel>
                      <DetailValue>
                        {formatDate(selectedRecord.payDate)}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Status:</DetailLabel>
                      <StatusBadge status={selectedRecord.status}>
                        {selectedRecord.status}
                      </StatusBadge>
                    </DetailItem>
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <DetailTitle>Summary</DetailTitle>
                  <SummaryGrid>
                    <SummaryCard>
                      <SummaryValue>
                        {selectedRecord.totalEmployees}
                      </SummaryValue>
                      <SummaryLabel>Total Employees</SummaryLabel>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryValue>
                        {formatHours(selectedRecord.totalRegularHours)}
                      </SummaryValue>
                      <SummaryLabel>Regular Hours</SummaryLabel>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryValue>
                        {formatHours(selectedRecord.totalOvertimeHours)}
                      </SummaryValue>
                      <SummaryLabel>Overtime Hours</SummaryLabel>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryValue>
                        {formatCurrency(selectedRecord.totalPayroll)}
                      </SummaryValue>
                      <SummaryLabel>Total Payroll</SummaryLabel>
                    </SummaryCard>
                  </SummaryGrid>
                </DetailSection>

                {selectedRecord.employeeRecords &&
                  selectedRecord.employeeRecords.length > 0 && (
                    <DetailSection>
                      <DetailTitle>Employee Breakdown</DetailTitle>

                      {/* Mobile Employee Cards */}
                      <MobileEmployeeCards>
                        {selectedRecord.employeeRecords.map((emp, index) => (
                          <MobileEmployeeCard key={index}>
                            <MobileEmployeeHeader>
                              <MobileEmployeeName>
                                {formatName(emp.employeeName)}
                              </MobileEmployeeName>
                              <MobileEmployeeRole>
                                <RoleBadge>
                                  {emp.employeeRole || "N/A"}
                                </RoleBadge>
                              </MobileEmployeeRole>
                            </MobileEmployeeHeader>
                            <MobileEmployeeDetails>
                              <MobileEmployeeDetail>
                                <MobileEmployeeLabel>
                                  Regular Hours
                                </MobileEmployeeLabel>
                                <MobileEmployeeValue>
                                  {formatHours(emp.regularHours)}
                                </MobileEmployeeValue>
                              </MobileEmployeeDetail>
                              <MobileEmployeeDetail>
                                <MobileEmployeeLabel>
                                  Overtime Hours
                                </MobileEmployeeLabel>
                                <MobileEmployeeValue>
                                  {formatHours(emp.overtimeHours)}
                                </MobileEmployeeValue>
                              </MobileEmployeeDetail>
                              <MobileEmployeeDetail>
                                <MobileEmployeeLabel>
                                  Total Pay
                                </MobileEmployeeLabel>
                                <MobileEmployeeValue>
                                  {formatCurrency(emp.totalPay)}
                                </MobileEmployeeValue>
                              </MobileEmployeeDetail>
                            </MobileEmployeeDetails>
                          </MobileEmployeeCard>
                        ))}
                      </MobileEmployeeCards>

                      {/* Desktop Employee Table */}
                      <EmployeeTableDesktop>
                        <EmployeeTable>
                          <EmployeeTableHead>
                            <EmployeeTableRow>
                              <EmployeeTableHeader>
                                Employee
                              </EmployeeTableHeader>
                              <EmployeeTableHeader>Role</EmployeeTableHeader>
                              <EmployeeTableHeader>
                                Regular Hours
                              </EmployeeTableHeader>
                              <EmployeeTableHeader>
                                Overtime Hours
                              </EmployeeTableHeader>
                              <EmployeeTableHeader>
                                Total Pay
                              </EmployeeTableHeader>
                            </EmployeeTableRow>
                          </EmployeeTableHead>
                          <EmployeeTableBody>
                            {selectedRecord.employeeRecords.map(
                              (emp, index) => (
                                <EmployeeTableRow key={index}>
                                  <EmployeeTableCell>
                                    {formatName(emp.employeeName)}
                                  </EmployeeTableCell>
                                  <EmployeeTableCell>
                                    <RoleBadge>
                                      {emp.employeeRole || "N/A"}
                                    </RoleBadge>
                                  </EmployeeTableCell>
                                  <EmployeeTableCell>
                                    {formatHours(emp.regularHours)}
                                  </EmployeeTableCell>
                                  <EmployeeTableCell>
                                    {formatHours(emp.overtimeHours)}
                                  </EmployeeTableCell>
                                  <EmployeeTableCell>
                                    {formatCurrency(emp.totalPay)}
                                  </EmployeeTableCell>
                                </EmployeeTableRow>
                              )
                            )}
                          </EmployeeTableBody>
                        </EmployeeTable>
                      </EmployeeTableDesktop>
                    </DetailSection>
                  )}

                <DetailSection>
                  <DetailTitle>Additional Information</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Generated By:</DetailLabel>
                      <DetailValue>
                        {formatName(
                          `${selectedRecord.generator?.firstName} ${selectedRecord.generator?.lastName}`
                        )}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Generated On:</DetailLabel>
                      <DetailValue>
                        {formatDate(selectedRecord.generatedAt)}
                      </DetailValue>
                    </DetailItem>
                    {selectedRecord.notes && (
                      <DetailItem>
                        <DetailLabel>Notes:</DetailLabel>
                        <DetailValue>{selectedRecord.notes}</DetailValue>
                      </DetailItem>
                    )}
                  </DetailGrid>
                </DetailSection>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </Main>
    </Container>
  );
};

export default PayrollHistory;

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`;

const Main = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Greeting Note Container with Spacing
const GreetingNoteContainer = styled.div`
  margin-top: 60px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    margin-top: 48px;
    margin-bottom: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    margin-top: 54px;
    margin-bottom: 14px;
  }
`;

// Header Section - Matching Dashboard Style
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    margin-bottom: 28px;
    padding: 22px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 12px;
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--status-info);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
`;

const StatBadgeIcon = styled.span`
  color: white;

  svg {
    font-size: 1rem;
  }
`;

const StatBadgeText = styled.span`
  white-space: nowrap;
`;

const HeaderTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 1.875rem;
    margin-bottom: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2rem;
    margin-bottom: 7px;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.96875rem;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 24px;
  font-weight: 500;
`;

const ErrorIcon = styled.span`
  font-size: 1.2rem;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--status-info);
  }

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
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 768px) {
    padding: 18px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 19px;
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--status-info);
  border-radius: 8px;
  color: white;

  svg {
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    svg {
      font-size: 1.375rem;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    width: 46px;
    height: 46px;

    svg {
      font-size: 1.4375rem;
    }
  }
`;

const StatCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const StatTrendIcon = styled.span`
  color: var(--status-success);

  svg {
    font-size: 1.25rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.375rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.8125rem;
  }
`;

// Enhanced Table Components
const TableContainer = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    border-radius: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    border-radius: 10px;
    margin-bottom: 20px;
  }

  &.desktop-only {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const TableHeaderContainer = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
`;

const TableTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const TableSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: var(--bg-tertiary);
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: top;

  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 0.75rem;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
  font-size: 14px;
  &:hover {
    background: var(--bg-tertiary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: center;

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
`;

const DateRange = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
  }
`;

const DateRangeStart = styled.span`
  color: var(--text-primary);
`;

const DateRangeSeparator = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
`;

const DateRangeEnd = styled.span`
  color: var(--text-primary);
`;

const PayDate = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const PayrollAmountIcon = styled.span`
  color: var(--status-success);
  margin-right: 6px;

  svg {
    font-size: 1rem;
  }
`;

const PayrollAmount = styled.div`
  font-weight: 700;
  color: var(--status-success);
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.05rem;
  }
`;

const GeneratorInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.84375rem;
  }
`;

const ActionButton = styled.button`
  background: #3b82f6;
  color: white !important;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    color: white !important;
  }

  &:active {
    transform: translateY(0);
    color: white !important;
  }

  &:focus {
    color: white !important;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8125rem;
    gap: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 7px 14px;
    font-size: 0.84375rem;
    gap: 7px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 14px;
    margin-top: 20px;
  }
`;

const PaginationButton = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--bg-tertiary);
    transform: translateY(-1px);
    color: var(--text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.875rem;
    gap: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 7px 14px;
    font-size: 0.9375rem;
    gap: 7px;
  }
`;

const PageInfo = styled.div`
  color: var(--text-secondary);
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    padding: 48px 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 56px 20px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 3.5rem;
    margin-bottom: 14px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin: 0 0 6px 0;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.375rem;
    margin: 0 0 7px 0;
  }
`;

const EmptyText = styled.p`
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    max-width: 300px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
    max-width: 350px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;

  @media (max-width: 768px) {
    height: 300px;
    gap: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    height: 350px;
    gap: 14px;
  }
`;

const LoadingSpinner = styled.div`
  font-size: 3rem;
  animation: spin 1s linear infinite;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2.75rem;
  }

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
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.05rem;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 18px;
  }
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-primary);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    max-width: 90vw;
    border-radius: 14px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px;
  border-bottom: 2px solid var(--border-primary);
  background: var(--bg-tertiary);
  border-radius: 16px 16px 0 0;

  @media (max-width: 768px) {
    padding: 20px 24px;
    border-radius: 12px 12px 0 0;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 24px 28px;
    border-radius: 14px 14px 0 0;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "";
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.375rem;

    &::before {
      height: 20px;
      width: 3px;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.5625rem;

    &::before {
      height: 22px;
      width: 3.5px;
    }
  }
`;

const CloseButton = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--status-info);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    padding: 8px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    width: 38px;
    height: 38px;
    padding: 9px;
  }
`;

const ModalBody = styled.div`
  padding: 32px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 26px;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    margin-bottom: 28px;
  }
`;

const DetailTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "";
    width: 3px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 1.5px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 0 12px 0;
    padding-bottom: 8px;

    &::before {
      height: 14px;
      width: 2px;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.1875rem;
    margin: 0 0 18px 0;
    padding-bottom: 11px;

    &::before {
      height: 17px;
      width: 2.75px;
    }
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 18px;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--status-info);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px;
    gap: 4px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 14px;
    gap: 7px;
  }
`;

const DetailLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.8125rem;
  }
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${(props) => {
    if (props.status === "generated") {
      return "var(--status-success)";
    } else if (props.status === "pending") {
      return "var(--status-warning)";
    } else {
      return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    if (props.status === "generated") {
      return "var(--status-success-text)";
    } else if (props.status === "pending") {
      return "var(--status-warning-text)";
    } else {
      return "var(--text-primary)";
    }
  }};
  border: 1px solid
    ${(props) => {
      if (props.status === "generated") {
        return "var(--status-success-border)";
      } else if (props.status === "pending") {
        return "var(--status-warning-border)";
      } else {
        return "var(--border-primary)";
      }
    }};
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 18px;
  }
`;

const SummaryCard = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 20px;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 18px;
  }
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.375rem;
    margin-bottom: 7px;
  }
`;

const SummaryLabel = styled.div`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.78125rem;
  }
`;

const EmployeeTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  table-layout: fixed;

  @media (max-width: 768px) {
    border-radius: 8px;
    overflow-x: auto;
    table-layout: auto;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    border-radius: 10px;
  }
`;

const EmployeeTableHead = styled.thead`
  background: var(--bg-tertiary);
`;

const EmployeeTableHeader = styled.th`
  padding: 16px 20px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border-primary);
  background: var(--bg-tertiary);
  position: relative;
  vertical-align: middle;
  white-space: nowrap;

  &:first-child {
    border-top-left-radius: 12px;
    width: 25%;
  }

  &:nth-child(2) {
    width: 15%;
  }

  &:nth-child(3) {
    width: 20%;
  }

  &:nth-child(4) {
    width: 20%;
  }

  &:last-child {
    border-top-right-radius: 12px;
    width: 20%;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.75rem;

    &:first-child,
    &:nth-child(2),
    &:nth-child(3),
    &:nth-child(4),
    &:last-child {
      width: auto;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 14px 18px;
    font-size: 0.8125rem;
  }
`;

const EmployeeTableBody = styled.tbody``;

const EmployeeTableRow = styled.tr`
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: var(--bg-tertiary);
  }

  &:hover {
    background: var(--bg-quaternary);
  }
`;

const EmployeeTableCell = styled.td`
  padding: 16px 20px;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: middle;
  line-height: 1.4;
  text-align: center;

  &:first-child {
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 14px 18px;
    font-size: 0.8125rem;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: var(--status-info);
  color: white;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 5px 14px;
    font-size: 0.6875rem;
    border-radius: 18px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 5.5px 15px;
    font-size: 0.71875rem;
    border-radius: 19px;
  }
`;

// Mobile Employee Cards
const MobileEmployeeCards = styled.div`
  display: none;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileEmployeeCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
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
    height: 4px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  &:hover {
    border-color: var(--status-info);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const MobileEmployeeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-primary);
`;

const MobileEmployeeName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    background: var(--status-info);
    border-radius: 50%;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const MobileEmployeeRole = styled.div`
  display: flex;
  align-items: center;
`;

const MobileEmployeeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const MobileEmployeeDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
  height: 100%;
  justify-content: flex-start;

  &:hover {
    background: var(--bg-quaternary);
    border-color: var(--status-info);
    transform: scale(1.02);
  }

  @media (max-width: 480px) {
    padding: 10px 6px;
    gap: 6px;
  }
`;

const MobileEmployeeLabel = styled.div`
  font-size: 0.6875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 4px;
  text-align: center;
  line-height: 1.2;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileEmployeeValue = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.2;
  text-align: center;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    font-size: 0.875rem;
    min-height: 20px;
  }
`;

// Desktop Table (hide on mobile)
const EmployeeTableDesktop = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

// Multi-line header components
const TableHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;

  @media (max-width: 768px) {
    gap: 1px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 1.5px;
  }
`;

const TableHeaderMain = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.8125rem;
  }
`;

const TableHeaderSub = styled.div`
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 0.625rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.6875rem;
  }
`;

// Hours display components
const HoursContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    gap: 2px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 3px;
  }
`;

const HoursRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 7px;
  }
`;

const HoursLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.625rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.6875rem;
  }
`;

const HoursValue = styled.span`
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.8125rem;
  }
`;

// Enhanced Mobile Card Components
const MobileCardsContainer = styled.div`
  display: none;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  &.mobile-only {
    @media (max-width: 768px) {
      display: flex;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 14px;
    margin-bottom: 20px;
  }
`;

const MobileCardsHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

const MobileCardsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const MobileCardsSubtitle = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`;

const MobileCardPeriod = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const MobileCardPeriodIcon = styled.span`
  color: var(--status-info);

  svg {
    font-size: 1rem;
  }
`;

const MobileCardPeriodText = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const MobileCardPayDate = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const MobileCardSection = styled.div`
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-primary);
`;

const MobileCardSectionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MobileCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 18px;
    border-radius: 10px;
  }
`;

const MobileCardHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-primary);
`;

const MobileCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 12px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 11px;
    margin-bottom: 14px;
  }
`;

const MobileCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 11px;
  }
`;

const MobileCardLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.84375rem;
  }
`;

const MobileCardValue = styled.span`
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.84375rem;
  }
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const MobileActionButton = styled.button`
  background: #3b82f6;
  color: white !important;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    color: white !important;
  }

  &:active {
    transform: translateY(0);
    color: white !important;
  }

  &:focus {
    color: white !important;
  }

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 0.8125rem;
    gap: 6px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 9px 15px;
    font-size: 0.84375rem;
    gap: 7px;
  }
`;

// Filter Components
const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    padding: 10px 12px;
    margin-bottom: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 18px;
  }
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.84375rem;
  }
`;

const FilterDropdowns = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 10px;
  }
`;

const FilterDropdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;

  @media (max-width: 768px) {
    min-width: 100%;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    min-width: 90px;
  }
`;

// Custom Dropdown Styled Components
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button`
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  &:hover {
    border-color: var(--status-info);
    background: var(--bg-quaternary);
    color: var(--text-primary);
  }

  &:focus {
    border-color: var(--status-info);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.8125rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 9px;
    font-size: 0.8125rem;
  }
`;

const DropdownButtonText = styled.span`
  flex: 1;
`;

const DropdownArrow = styled.span`
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  color: var(--text-secondary);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 160px;
  overflow-y: auto;
  margin-top: 2px;
`;

const DropdownItem = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.isSelected ? "var(--status-info)" : "transparent"};
  color: ${(props) => (props.isSelected ? "white" : "var(--text-primary)")};
  font-weight: ${(props) => (props.isSelected ? "600" : "400")};
  font-size: 0.8125rem;

  &:hover {
    background: ${(props) =>
      props.isSelected ? "var(--status-info-dark)" : "var(--bg-tertiary)"};
    color: ${(props) => (props.isSelected ? "white" : "var(--text-primary)")};
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;
// Global responsive utility classes
const GlobalStyles = styled.div`
  .desktop-only {
    @media (max-width: 768px) {
      display: none !important;
    }
  }

  .mobile-only {
    @media (min-width: 769px) {
      display: none !important;
    }
  }
`;
