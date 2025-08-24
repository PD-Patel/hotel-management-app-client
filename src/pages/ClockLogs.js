import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { MDBIcon } from "mdb-react-ui-kit";
import api from "../services/api";
import { updateClockLog, deleteClockLog } from "../services/clock";

const ClockLogs = () => {
  const { user } = useAuth();
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

  // Helpers to compute week range (Mon-Sun) for a given date
  const toYmd = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  };

  const getWeekRangeForDate = (dateLike) => {
    const d = new Date(dateLike);
    const day = d.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toYmd(start), end: toYmd(end) };
  };

  // Set default date range to current week (Mon-Sun) once on mount
  useEffect(() => {
    const { start, end } = getWeekRangeForDate(new Date());
    setStartDate(start);
    setEndDate(end);
  }, []);

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
  const fetchClockLogs = async (page = 1) => {
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

      setClockLogs(response.data.records);
      setPagination(response.data.pagination);
      setTotalHours(response.data.totalHours ?? 0);
    } catch (error) {
      console.error("Error fetching clock logs:", error);
      setError("Failed to fetch clock logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when date range or employee filter changes
  useEffect(() => {
    fetchClockLogs(1);
  }, [startDate, endDate, selectedEmployee]);

  const handlePageChange = (newPage) => {
    fetchClockLogs(newPage);
  };

  const handleDateFilter = () => {
    fetchClockLogs(1);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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
              <FilterSelect
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterButton onClick={handleDateFilter}>
              <MDBIcon fas icon="search" />
              Filter
            </FilterButton>
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
                </StatsContainer>

                {/* Clock Logs Table */}
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Employee</Th>
                        <Th>Date</Th>
                        <Th>Clock In</Th>
                        <Th>Clock Out</Th>
                        <Th>Hours Worked</Th>
                        <Th>Position</Th>
                        {(user?.role === "admin" ||
                          user?.role === "manager") && <Th>Actions</Th>}
                      </tr>
                    </thead>
                    <tbody>
                      {clockLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{ textAlign: "center", padding: "20px" }}
                          >
                            No clock logs found for the selected date range.
                          </td>
                        </tr>
                      ) : (
                        clockLogs.map((log) => (
                          <tr key={log.id}>
                            <Td>
                              <EmployeeInfo>
                                <EmployeeName>{log.employeeName}</EmployeeName>
                                <EmployeeEmail>
                                  {log.employeeEmail}
                                </EmployeeEmail>
                              </EmployeeInfo>
                            </Td>
                            <Td>{log.date}</Td>
                            <Td>{formatDateTime(log.clockIn)}</Td>
                            <Td>
                              {log.status === "missing punch" ? (
                                <div>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      background: "#ffebee",
                                      color: "#d32f2f",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontWeight: 600,
                                      fontSize: "12px",
                                      marginRight: "8px",
                                    }}
                                  >
                                    Missing Punch
                                  </span>
                                  <span
                                    style={{ color: "#666", fontSize: "12px" }}
                                  >
                                    {log.clockOut
                                      ? `${formatDateTime(log.clockOut)} (est.)`
                                      : ""}
                                  </span>
                                </div>
                              ) : log.clockOut ? (
                                formatDateTime(log.clockOut)
                              ) : (
                                <span style={{ color: "#ff9800" }}>
                                  Still Clocked In
                                </span>
                              )}
                            </Td>
                            <Td>
                              <HoursBadge>
                                {log.hoursWorked > 0
                                  ? formatHours(log.hoursWorked)
                                  : "0.00 hrs"}
                              </HoursBadge>
                            </Td>
                            <Td>{log.employeePosition}</Td>
                            {(user?.role === "admin" ||
                              user?.role === "manager") && (
                              <Td>
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
                                  Edit
                                </ActionButton>
                                <ActionButton
                                  danger
                                  onClick={() => {
                                    setSelectedLog(log);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  Delete
                                </ActionButton>
                              </Td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <PaginationContainer>
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
`;

const Main = styled.div`
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: end;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  background: white;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1565c0;
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  flex: 1;
`;

const StatIcon = styled.div`
  font-size: 24px;
  color: #1976d2;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 16px 12px;

  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  font-size: 14px;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmployeeName = styled.span`
  font-weight: 600;
  color: #333;
`;

const EmployeeEmail = styled.span`
  font-size: 12px;
  color: #666;
`;

const HoursBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid #eee;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.disabled ? "#f5f5f5" : "#1976d2")};
  color: ${(props) => (props.disabled ? "#999" : "white")};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1565c0;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const ActionButton = styled.button`
  margin-right: 8px;
  padding: 6px 10px;
  background: ${(props) => (props.danger ? "#f44336" : "#1976d2")};
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
`;

const ModalBody = styled.div`
  padding: 16px 20px;
`;

const ModalFooter = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  color: #555;
  margin-bottom: 6px;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const PrimaryButton = styled.button`
  padding: 8px 14px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
`;

const SecondaryButton = styled.button`
  padding: 8px 14px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
`;

const DangerButton = styled.button`
  padding: 8px 14px;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #d32f2f;
`;

const ErrorMessage = styled.span`
  font-size: 16px;
  color: #d32f2f;
`;
