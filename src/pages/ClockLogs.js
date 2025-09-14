import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { MDBIcon } from "mdb-react-ui-kit";
import api from "../services/api";
import { updateClockLog, deleteClockLog } from "../services/clock";

const ClockLogs = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [clockLogs, setClockLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 50,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [form, setForm] = useState({ date: "", clockIn: "", clockOut: "" });

  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helpers to compute week range (Mon-Sun) for a given date
  const toYmd = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  };

  const getWeekRangeForDate = useCallback((dateLike) => {
    const d = new Date(dateLike);
    const day = d.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toYmd(start), end: toYmd(end) };
  }, []);

  // Set default date range to current week (Mon-Sun) once on mount
  useEffect(() => {
    const { start, end } = getWeekRangeForDate(new Date());
    setStartDate(start);
    setEndDate(end);
  }, [getWeekRangeForDate]);

  // Fetch employees for filter
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employee");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, [clockLogs]);

  // Fetch clock logs
  const fetchClockLogs = useCallback(
    async (page = 1) => {
      if (!startDate || !endDate) return;

      setLoading(true);
      setError(null);

      try {
        const params = {
          startDate,
          endDate,
          page,
          limit: pagination.recordsPerPage,
        };

        if (selectedEmployee) {
          params.employeeId = selectedEmployee;
        }

        const response = await api.get("/reports/hours/details", { params });

        setClockLogs(response.data.records || []);
        setPagination(response.data.pagination);
        setTotalHours(response.data.totalHours ?? 0);
      } catch (error) {
        console.error("❌ Error fetching clock logs:", error);
        setError("Failed to fetch clock logs. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, selectedEmployee, pagination.recordsPerPage]
  );

  // Fetch logs when date range or employee filter changes
  useEffect(() => {
    fetchClockLogs(1);
  }, [startDate, endDate, selectedEmployee, fetchClockLogs]);

  // Don't render clock logs for per_room_rate employees since they don't use clock in/out
  if (user && user.payMethod === "per_room_rate") {
    return (
      <Container>
        <Sidebar user={user} />
        <Main>
          <AccessDeniedCard isDarkMode={isDarkMode}>
            <AccessDeniedIcon>
              <MDBIcon fas icon="bed" />
            </AccessDeniedIcon>
            <AccessDeniedTitle>Clock Logs Not Available</AccessDeniedTitle>
            <AccessDeniedMessage>
              As a per room rate employee, you don't use the clock in/out
              system. Your pay is based on rooms serviced rather than hours
              worked.
            </AccessDeniedMessage>
          </AccessDeniedCard>
        </Main>
      </Container>
    );
  }

  const handlePageChange = (newPage) => {
    fetchClockLogs(newPage);
  };

  const handleDateFilter = () => {
    fetchClockLogs(1);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    // For ISO date strings with time, we need to handle timezone conversion properly
    // Create the date object and adjust for timezone offset
    const date = new Date(dateString);

    // Adjust for timezone offset to prevent date shifting
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + timezoneOffset);

    return localDate.toLocaleString();
  };

  const formatHours = (hours) => {
    return `${hours.toFixed(2)} hrs`;
  };

  const formatForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  return (
    <>
      <Container>
        <Sidebar user={user} />
        <Main>
          <Header>
            <Title>Clock Logs</Title>
            <Subtitle>View and manage employee time tracking records</Subtitle>
          </Header>

          {/* Filters */}
          <FiltersContainer>
            <FilterRow>
              <FilterGroup>
                <FilterLabel>Start Date:</FilterLabel>
                <FilterInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>End Date:</FilterLabel>
                <FilterInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Employee:</FilterLabel>
                <CustomDropdown
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={[
                    { value: "", label: "All Employees" },
                    ...employees.map((employee) => ({
                      value: employee.id,
                      label: `${employee.firstName} ${employee.lastName}`,
                    })),
                  ]}
                  placeholder="Select Employee"
                />
              </FilterGroup>

              <FilterGroup>
                <FilterButton onClick={handleDateFilter}>
                  <MDBIcon fas icon="search" />
                  Filter
                </FilterButton>
              </FilterGroup>
            </FilterRow>
          </FiltersContainer>

          {/* Content */}
          <ContentContainer>
            {loading ? (
              <LoadingContainer>
                <MDBIcon fas icon="spinner" spin size="2x" />
                <LoadingText>Loading clock logs...</LoadingText>
              </LoadingContainer>
            ) : error ? (
              <ErrorContainer>
                <MDBIcon fas icon="exclamation-triangle" />
                <ErrorMessage>{error}</ErrorMessage>
              </ErrorContainer>
            ) : (
              <>
                {/* Summary Stats */}
                <StatsContainer>
                  <StatsRow>
                    <StatCard>
                      <StatIcon>
                        <MDBIcon fas icon="users" />
                      </StatIcon>
                      <StatContent>
                        <StatNumber>{pagination.totalRecords}</StatNumber>
                        <StatLabel>Total Records</StatLabel>
                      </StatContent>
                    </StatCard>

                    <StatCard>
                      <StatIcon>
                        <MDBIcon fas icon="clock" />
                      </StatIcon>
                      <StatContent>
                        <StatNumber>{pagination.currentPage}</StatNumber>
                        <StatLabel>Current Page</StatLabel>
                      </StatContent>
                    </StatCard>
                  </StatsRow>

                  <StatsRow>
                    <StatCard>
                      <StatIcon>
                        <MDBIcon fas icon="file-alt" />
                      </StatIcon>
                      <StatContent>
                        <StatNumber>{pagination.totalPages}</StatNumber>
                        <StatLabel>Total Pages</StatLabel>
                      </StatContent>
                    </StatCard>

                    <StatCard>
                      <StatIcon>
                        <MDBIcon fas icon="stopwatch" />
                      </StatIcon>
                      <StatContent>
                        <StatNumber>{formatHours(totalHours)}</StatNumber>
                        <StatLabel>Total Hours (range)</StatLabel>
                      </StatContent>
                    </StatCard>
                  </StatsRow>
                </StatsContainer>

                {/* Clock Logs Table */}
                <TableContainer>
                  {/* Mobile Card View */}
                  <MobileView>
                    {clockLogs.length === 0 ? (
                      <MobileEmptyState>
                        <MobileEmptyIcon>
                          <MDBIcon fas icon="clock" size="2x" />
                        </MobileEmptyIcon>
                        <MobileEmptyMessage>
                          No clock logs found for the selected date range.
                        </MobileEmptyMessage>
                      </MobileEmptyState>
                    ) : (
                      clockLogs.map((log) => (
                        <MobileLogCard key={log.id}>
                          <MobileCardHeader>
                            <MobileEmployeeSection>
                              <MobileEmployeeAvatar>
                                {log.employeeName ? (
                                  <InitialIcon>
                                    {log.employeeName.charAt(0).toUpperCase()}
                                  </InitialIcon>
                                ) : (
                                  <MDBIcon fas icon="user" />
                                )}
                              </MobileEmployeeAvatar>
                              <MobileEmployeeInfo>
                                <MobileEmployeeName>
                                  {log.employeeName}
                                </MobileEmployeeName>
                                <MobileEmployeeEmail>
                                  {log.employeeEmail}
                                </MobileEmployeeEmail>
                              </MobileEmployeeInfo>
                            </MobileEmployeeSection>
                          </MobileCardHeader>

                          <MobileCardContent>
                            <MobileInfoRow>
                              <MobileValue>{log.date}</MobileValue>
                            </MobileInfoRow>

                            <MobileInfoRow>
                              <MobileValue>
                                {formatDateTime(log.clockIn)}
                              </MobileValue>
                            </MobileInfoRow>

                            <MobileInfoRow>
                              <MobileValue>
                                {log.status === "missing punch" ? (
                                  <div>
                                    <MobileStatusBadge status="missing">
                                      Missing Punch
                                    </MobileStatusBadge>
                                    <MobileStatusText>
                                      {log.clockOut
                                        ? `${formatDateTime(
                                            log.clockOut
                                          )} (est.)`
                                        : ""}
                                    </MobileStatusText>
                                  </div>
                                ) : log.clockOut ? (
                                  formatDateTime(log.clockOut)
                                ) : (
                                  <MobileStatusBadge status="active">
                                    Still Clocked In
                                  </MobileStatusBadge>
                                )}
                              </MobileValue>
                            </MobileInfoRow>

                            <MobileInfoRow>
                              <MobileValue>
                                <MobileHoursBadge>
                                  {log.hoursWorked > 0
                                    ? formatHours(log.hoursWorked)
                                    : "0.00 hrs"}
                                </MobileHoursBadge>
                              </MobileValue>
                            </MobileInfoRow>

                            <MobileInfoRow>
                              <MobileValue>{log.employeePosition}</MobileValue>
                            </MobileInfoRow>
                          </MobileCardContent>

                          {(user?.role === "admin" ||
                            user?.role === "manager") && (
                            <MobileCardActions>
                              <MobileActionButton
                                onClick={() => {
                                  setSelectedLog(log);
                                  setForm({
                                    date: log.date || "",
                                    clockIn: formatForInput(log.clockIn),
                                    clockOut: log.clockOut
                                      ? formatForInput(log.clockOut)
                                      : "",
                                  });
                                  setEditOpen(true);
                                }}
                              >
                                Edit
                              </MobileActionButton>
                              <MobileActionButton
                                danger
                                onClick={() => {
                                  setSelectedLog(log);
                                  setDeleteOpen(true);
                                }}
                              >
                                Delete
                              </MobileActionButton>
                            </MobileCardActions>
                          )}
                        </MobileLogCard>
                      ))
                    )}
                  </MobileView>

                  {/* Desktop Card Row View */}
                  <DesktopView>
                    <CardRowContainer>
                      {clockLogs.length === 0 ? (
                        <EmptyState>
                          <EmptyIcon>
                            <MDBIcon fas icon="clock" size="3x" />
                          </EmptyIcon>
                          <EmptyTitle>No Clock Logs Found</EmptyTitle>
                          <EmptyMessage>
                            No clock logs found for the selected date range.
                          </EmptyMessage>
                        </EmptyState>
                      ) : (
                        clockLogs.map((log) => (
                          <LogCard key={log.id}>
                            <CardHeader>
                              <EmployeeSection>
                                <EmployeeAvatar>
                                  {log.employeeName ? (
                                    <InitialIcon>
                                      {log.employeeName.charAt(0).toUpperCase()}
                                    </InitialIcon>
                                  ) : (
                                    <MDBIcon fas icon="user" />
                                  )}
                                </EmployeeAvatar>
                                <EmployeeDetails>
                                  <EmployeeName>
                                    {log.employeeName}
                                  </EmployeeName>
                                  <EmployeeEmail>
                                    {log.employeeEmail}
                                  </EmployeeEmail>
                                </EmployeeDetails>
                              </EmployeeSection>
                              <DateSection>
                                <DateLabel>Date</DateLabel>
                                <DateValue>{log.date}</DateValue>
                              </DateSection>
                            </CardHeader>

                            <CardBody>
                              <TimeSection>
                                <TimeRow>
                                  <TimeLabel>Clock In:</TimeLabel>
                                  <TimeValue>
                                    {formatDateTime(log.clockIn)}
                                  </TimeValue>
                                </TimeRow>
                                <TimeRow>
                                  <TimeLabel>Clock Out:</TimeLabel>
                                  <TimeValue>
                                    {log.status === "missing punch" ? (
                                      <div>
                                        <StatusBadge status="missing">
                                          Missing Punch
                                        </StatusBadge>
                                        {log.clockOut && (
                                          <StatusText>
                                            {formatDateTime(log.clockOut)}{" "}
                                            (est.)
                                          </StatusText>
                                        )}
                                      </div>
                                    ) : log.clockOut ? (
                                      formatDateTime(log.clockOut)
                                    ) : (
                                      <StatusBadge status="active">
                                        Still Clocked In
                                      </StatusBadge>
                                    )}
                                  </TimeValue>
                                </TimeRow>
                              </TimeSection>

                              <HoursSection>
                                <HoursLabel>Hours</HoursLabel>
                                <HoursValue>
                                  {log.hoursWorked > 0
                                    ? formatHours(log.hoursWorked)
                                    : "0.00 hrs"}
                                </HoursValue>
                              </HoursSection>

                              {(user?.role === "admin" ||
                                user?.role === "manager") && (
                                <CardActions>
                                  <ActionButton
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setForm({
                                        date: log.date || "",
                                        clockIn: formatForInput(log.clockIn),
                                        clockOut: log.clockOut
                                          ? formatForInput(log.clockOut)
                                          : "",
                                      });
                                      setEditOpen(true);
                                    }}
                                  >
                                    <MDBIcon fas icon="edit" />
                                  </ActionButton>
                                  <ActionButton
                                    danger
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setDeleteOpen(true);
                                    }}
                                  >
                                    <MDBIcon fas icon="trash" />
                                  </ActionButton>
                                </CardActions>
                              )}
                            </CardBody>
                          </LogCard>
                        ))
                      )}
                    </CardRowContainer>
                  </DesktopView>
                </TableContainer>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationRow>
                      <PaginationButton
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                      >
                        <MDBIcon fas icon="chevron-left" />
                        Previous
                      </PaginationButton>

                      <PageInfo>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </PageInfo>

                      <PaginationButton
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                        <MDBIcon fas icon="chevron-right" />
                      </PaginationButton>
                    </PaginationRow>
                  </PaginationContainer>
                )}
              </>
            )}
          </ContentContainer>
        </Main>
      </Container>

      {editOpen && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <ModalTitle>Edit Clock Log</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <FormLabel>Date</FormLabel>
                <FormInput
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    if (
                      e.target.value < new Date().toISOString().split("T")[0]
                    ) {
                      setForm({ ...form, date: e.target.value });
                    } else {
                      alert("You cannot edit a clock log from the future");
                    }
                  }}
                />
              </FormRow>
              <FormRow>
                <FormLabel>Clock In</FormLabel>
                <FormInput
                  type="datetime-local"
                  value={form.clockIn}
                  onChange={(e) => {
                    if (e.target.value < new Date().toISOString()) {
                      setForm({ ...form, clockIn: e.target.value });
                    } else {
                      alert("You cannot edit a clock log from the future");
                    }
                  }}
                />
              </FormRow>
              <FormRow>
                <FormLabel>Clock Out</FormLabel>
                <FormInput
                  type="datetime-local"
                  value={form.clockOut}
                  onChange={(e) => {
                    if (e.target.value < new Date().toISOString()) {
                      setForm({ ...form, clockOut: e.target.value });
                    } else {
                      alert("You cannot edit a clock log from the future");
                    }
                  }}
                />
              </FormRow>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => setEditOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={async () => {
                  if (!selectedLog) return;
                  const payload = {
                    date: form.date || undefined,
                    clockIn: form.clockIn || undefined,
                    clockOut: form.clockOut === "" ? null : form.clockOut,
                  };
                  await updateClockLog(selectedLog.id, payload);
                  setEditOpen(false);
                  fetchClockLogs(pagination.currentPage);
                }}
              >
                Save
              </PrimaryButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {deleteOpen && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <ModalTitle>Delete Log</ModalTitle>
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete this log? This action cannot be
              undone.
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={() => setDeleteOpen(false)}>
                Cancel
              </SecondaryButton>
              <DangerButton
                onClick={async () => {
                  if (!selectedLog) return;
                  await deleteClockLog(selectedLog.id);
                  setDeleteOpen(false);
                  fetchClockLogs(pagination.currentPage);
                }}
              >
                Delete
              </DangerButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
};

export default ClockLogs;

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
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
  width: 100%;
  position: relative;
  z-index: 1;

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
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.75rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.9375rem;
  }
`;

const FiltersContainer = styled.div`
  background: var(--card-bg);
  padding: 28px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 32px;
  border: 1px solid var(--card-border);
  width: 100%;
  max-width: 100%;
  position: relative;
  z-index: 999;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  position: relative;
  z-index: 998;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 18px;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
  position: relative;

  /* Mobile Layout */
  @media (max-width: 768px) {
    min-width: 100%;
    gap: 8px;
  }
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 2px;
  }
`;

const FilterInput = styled.input`
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg);
  transition: all 0.2s ease;
  min-height: 48px;
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: var(--border-accent);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px;
    min-height: 52px;
  }
`;

const FilterButton = styled.button`
  background: linear-gradient(
    135deg,
    var(--btn-primary) 0%,
    var(--btn-primary-hover) 100%
  );
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--btn-primary-hover) 0%,
      #1f5f8b 100%
    );
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px 24px;
    font-size: 16px;
    min-height: 52px;
    width: 100%;
    margin-top: 12px;
  }
`;

const ContentContainer = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  border: 1px solid var(--card-border);
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  border-bottom: 1px solid var(--card-border);
  background: var(--table-header-bg);
  width: 100%;
  max-width: 100%;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 24px;
    gap: 12px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 20px;
    padding: 28px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 20px;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 12px;
  flex: 1;
  min-width: 180px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 20px;
    justify-content: center;
    text-align: center;
    flex-direction: column;
    gap: 12px;
    min-width: 100%;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 20px;
  }
`;

const StatIcon = styled.div`
  font-size: 24px;
  color: var(--btn-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const StatNumber = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 0.6875rem;
  }
`;

const TableContainer = styled.div`
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 100%;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 32px;
  border-top: 1px solid var(--card-border);
  background: var(--table-header-bg);
  width: 100%;
  max-width: 100%;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 20px;
    padding: 28px;
  }
`;

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PaginationButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "disabled",
})`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: ${(props) =>
    props.disabled
      ? "var(--bg-tertiary)"
      : "linear-gradient(135deg, var(--btn-primary) 0%, var(--btn-primary-hover) 100%)"};
  color: ${(props) => (props.disabled ? "var(--text-muted)" : "white")};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.disabled ? "none" : "0 2px 8px rgba(59, 130, 246, 0.3)"};

  &:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      var(--btn-primary-hover) 0%,
      #1f5f8b 100%
    );
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 16px 20px;
    font-size: 16px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 14px 18px;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    text-align: center;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "danger",
})`
  margin-right: 8px;
  padding: 6px 12px;
  background: ${(props) =>
    props.danger ? "var(--btn-danger)" : "var(--btn-primary)"};
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 50px;

  &:hover {
    background: ${(props) =>
      props.danger ? "#c82333" : "var(--btn-primary-hover)"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
    margin-bottom: 6px;
    width: 100%;
    margin-right: 0;
    min-width: auto;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 7px 11px;
    font-size: 10px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Modal = styled.div`
  background: var(--card-bg);
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  /* Mobile Layout */
  @media (max-width: 768px) {
    max-width: 100%;
    margin: 0 1rem;
  }
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ModalTitle = styled.h3`
  margin: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 16px 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ModalFooter = styled.div`
  padding: 14px 20px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const FormLabel = styled.label`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
  }
`;

const PrimaryButton = styled.button`
  padding: 8px 14px;
  background: var(--btn-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const SecondaryButton = styled.button`
  padding: 8px 14px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const DangerButton = styled.button`
  padding: 8px 14px;
  background: var(--btn-danger);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: var(--text-tertiary);

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
  padding: 60px 20px;
  gap: 16px;
  color: #d32f2f;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const ErrorMessage = styled.span`
  font-size: 16px;
  color: var(--status-error);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

// New styled components for mobile/desktop views
const MobileView = styled.div`
  display: none; /* Hidden by default on desktop */

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: flex !important; /* Force display on mobile */
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: var(--bg-tertiary);
    border-radius: 12px;
    margin-bottom: 24px;
    width: 100%;
    box-shadow: var(--card-shadow);
  }
`;

const MobileLogCard = styled.div`
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const MobileCardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const MobileEmployeeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MobileEmployeeAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
`;

const MobileEmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MobileEmployeeName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MobileEmployeeEmail = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
  font-style: italic;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const MobileCardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MobileInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 8px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
    padding: 10px 0;
  }
`;

const MobileValue = styled.span`
  flex: 1;
  text-align: right;
  color: var(--text-primary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    text-align: left;
    font-size: 0.875rem;
    width: 100%;
  }
`;

const MobileStatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "status",
})`
  background: ${(props) =>
    props.status === "missing"
      ? "var(--status-error)"
      : "var(--status-success)"};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
  margin-right: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: block;
    margin-right: 0;
    margin-bottom: 6px;
    text-align: center;
    width: fit-content;
  }
`;

const MobileStatusText = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    display: block;
    font-size: 0.75rem;
  }
`;

const MobileHoursBadge = styled.span`
  background: var(--btn-primary);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--card-border);
  background: var(--bg-tertiary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    flex-direction: column;
  }
`;

const MobileActionButton = styled(ActionButton)`
  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 8px;
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 6px;
  }
`;

const DesktopView = styled.div`
  /* Mobile Layout */
  @media (max-width: 768px) {
    display: none !important; /* Force hide on mobile */
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    overflow-x: auto;
  }
`;

const MobileEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
  color: var(--text-tertiary);
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 30px 15px;
    gap: 10px;
  }
`;

const MobileEmptyIcon = styled.div`
  font-size: 48px;
  color: var(--text-muted);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const MobileEmptyMessage = styled.p`
  font-size: 16px;
  margin: 0;
  color: var(--text-secondary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// New Table-like Components
const CardRowContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0 0 0;

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 10px;
    padding: 18px 0 0 0;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    gap: 14px;
    padding: 24px 0 0 0;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px 0 0 0;
  }
`;

const LogCard = styled.div`
  background: var(--card-bg);
  border-radius: 6px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--table-header-bg);
  border-bottom: 1px solid var(--card-border);

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 15px;
  }
`;

const EmployeeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const DateLabel = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const DateValue = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 15px;
    gap: 15px;
  }
`;

const TimeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
`;

const TimeLabel = styled.span`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  min-width: 80px;
`;

const TimeValue = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const HoursSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    align-items: flex-start;
    min-width: auto;
  }
`;

const HoursLabel = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const EmployeeAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 3px 10px rgba(52, 152, 219, 0.35);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }
`;

const InitialIcon = styled.span`
  font-weight: 700;
  font-size: 12px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
  user-select: none;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 10px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 11px;
  }
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmployeeName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
`;

const EmployeeEmail = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "status",
})`
  background: ${(props) =>
    props.status === "missing"
      ? "var(--status-error)"
      : "var(--status-success)"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 2px;
`;

const StatusText = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

const HoursValue = styled.span`
  background: var(--btn-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  color: var(--text-muted);
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
`;

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        <DropdownButtonText>
          {selectedOption ? selectedOption.label : placeholder}
        </DropdownButtonText>
        <DropdownArrow isOpen={isOpen}>
          <MDBIcon fas icon="chevron-down" />
        </DropdownArrow>
      </DropdownButton>

      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownOption
              key={option.value}
              onClick={() => handleSelect(option.value)}
              isSelected={option.value === value}
            >
              {option.label}
            </DropdownOption>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

// Custom Dropdown Styled Components
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "isOpen",
})`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  min-height: 48px;
  text-align: left;

  &:hover {
    border-color: var(--border-accent);
  }

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px;
    min-height: 52px;
  }
`;

const DropdownButtonText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropdownArrow = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isOpen",
})`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  color: var(--text-secondary);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
`;

const DropdownOption = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isSelected",
})`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${(props) =>
    props.isSelected ? "var(--btn-primary)" : "transparent"};
  color: ${(props) => (props.isSelected ? "white" : "var(--text-primary)")};

  &:hover {
    background: ${(props) =>
      props.isSelected ? "var(--btn-primary)" : "var(--bg-tertiary)"};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
`;

const AccessDeniedCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
`;

const AccessDeniedIcon = styled.div`
  font-size: 4rem;
  color: #8b5cf6;
  margin-bottom: 20px;
`;

const AccessDeniedTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const AccessDeniedMessage = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
`;
