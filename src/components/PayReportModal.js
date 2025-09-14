import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";

const PayReportModal = ({ isOpen, onClose, employeeId, siteId, dateRange }) => {
  const { isDarkMode } = useTheme();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && siteId) {
      fetchPayReport();
    }
  }, [isOpen, employeeId, siteId, dateRange]);

  const fetchPayReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        siteId: siteId,
        ...(employeeId && { employeeId }),
        ...(dateRange && { dateRange }),
      });

      const response = await fetch(`/api/pay/report?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pay report");
      }

      const data = await response.json();
      setReportData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = generatePrintContent();

    printWindow.document.write(`
      <html>
        <head>
          <title>Pay Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .summary-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .total-row { font-weight: bold; background: #f0f9ff; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = () => {
    if (!reportData) return "";

    const { employees, summary } = reportData;

    return `
      <div class="header">
        <h1>Pay Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${dateRange ? `<p>Period: ${dateRange}</p>` : ""}
      </div>
      
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-number">${summary.totalEmployees}</div>
            <div class="summary-label">Total Employees</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${summary.totalHours}</div>
            <div class="summary-label">Total Hours</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">$${summary.totalPay.toFixed(2)}</div>
            <div class="summary-label">Total Pay</div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Position</th>
            <th>Department</th>
            <th>Hours</th>
            <th>Pay Rate</th>
            <th>Total Pay</th>
          </tr>
        </thead>
        <tbody>
          ${employees
            .map(
              (emp) => `
            <tr>
              <td>${emp.firstName} ${emp.lastName}</td>
              <td>${emp.role || "-"}</td>
              <td>${emp.department || "-"}</td>
              <td>${emp.totalHours}</td>
              <td>${emp.payRate ? `$${emp.payRate}` : "-"}</td>
              <td>$${emp.totalPay.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  const handleDownloadCSV = () => {
    if (!reportData) return;

    const { employees, summary } = reportData;

    const csvContent = [
      ["Employee", "Position", "Department", "Hours", "Pay Rate", "Total Pay"],
      ...employees.map((emp) => [
        `${emp.firstName} ${emp.lastName}`,
        emp.role || "",
        emp.department || "",
        emp.totalHours,
        emp.payRate || "",
        emp.totalPay.toFixed(2),
      ]),
      ["", "", "", "Total Hours", "Total Pay"],
      ["", "", "", summary.totalHours, `$${summary.totalPay.toFixed(2)}`],
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pay-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        isDarkMode={isDarkMode}
      >
        <ModalHeader isDarkMode={isDarkMode}>
          <ModalTitle>Pay Report</ModalTitle>
          <CloseButton onClick={onClose}>
            <MDBIcon fas icon="times" />
          </CloseButton>
        </ModalHeader>

        <ModalBody isDarkMode={isDarkMode}>
          {loading ? (
            <LoadingContainer>
              <MDBIcon fas icon="spinner" spin size="2x" />
              <LoadingText>Generating pay report...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorMessage>
              <MDBIcon fas icon="exclamation-triangle" />
              {error}
            </ErrorMessage>
          ) : reportData ? (
            <>
              {/* Summary Section */}
              <SummarySection isDarkMode={isDarkMode}>
                <SummaryTitle>Summary</SummaryTitle>
                <SummaryGrid>
                  <SummaryCard isDarkMode={isDarkMode}>
                    <SummaryNumber>
                      {reportData.summary.totalEmployees}
                    </SummaryNumber>
                    <SummaryLabel>Total Employees</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard isDarkMode={isDarkMode}>
                    <SummaryNumber>
                      {reportData.summary.totalHours}
                    </SummaryNumber>
                    <SummaryLabel>Total Hours</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard isDarkMode={isDarkMode}>
                    <SummaryNumber>
                      ${reportData.summary.totalPay.toFixed(2)}
                    </SummaryNumber>
                    <SummaryLabel>Total Pay</SummaryLabel>
                  </SummaryCard>
                </SummaryGrid>
              </SummarySection>

              {/* Employee Details */}
              <DetailsSection isDarkMode={isDarkMode}>
                <DetailsTitle>Employee Details</DetailsTitle>
                <EmployeeTable isDarkMode={isDarkMode}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Position</th>
                      <th>Department</th>
                      <th>Hours</th>
                      <th>Pay Rate</th>
                      <th>Total Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <EmployeeInfo>
                            <EmployeeName>
                              {employee.firstName} {employee.lastName}
                            </EmployeeName>
                            <EmployeeEmail>{employee.email}</EmployeeEmail>
                          </EmployeeInfo>
                        </td>
                        <td>{employee.role || "-"}</td>
                        <td>{employee.department || "-"}</td>
                        <td>{employee.totalHours}</td>
                        <td>
                          {employee.payRate ? `$${employee.payRate}` : "-"}
                        </td>
                        <td>${employee.totalPay.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </EmployeeTable>
              </DetailsSection>
            </>
          ) : null}
        </ModalBody>

        <ModalFooter isDarkMode={isDarkMode}>
          <ActionButtonGroup>
            <PrintButton onClick={handlePrint} disabled={!reportData}>
              <MDBIcon fas icon="print" />
              Print Report
            </PrintButton>
            <DownloadButton onClick={handleDownloadCSV} disabled={!reportData}>
              <MDBIcon fas icon="download" />
              Download CSV
            </DownloadButton>
            <CloseModalButton onClick={onClose}>Close</CloseModalButton>
          </ActionButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
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
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#f1f5f9"};
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1e293b"};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
`;

const LoadingText = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-weight: 500;
`;

const SummarySection = styled.div`
  margin-bottom: 32px;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0 0 20px 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const SummaryCard = styled.div`
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "#f8fafc"};
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const SummaryNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin-bottom: 8px;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  font-weight: 500;
`;

const DetailsSection = styled.div`
  margin-bottom: 24px;
`;

const DetailsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0 0 20px 0;
`;

const EmployeeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};

  th,
  td {
    padding: 16px 12px;
    text-align: left;
    border-bottom: 1px solid
      ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  }

  th {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--table-header-bg)" : "#f8fafc"};
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-tertiary)" : "#475569"};
    font-weight: 600;
    font-size: 13px;
  }

  td {
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1e293b"};
    vertical-align: middle;
  }

  tbody tr:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--table-row-hover)" : "#f8fafc"};
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmployeeName = styled.span`
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
`;

const EmployeeEmail = styled.span`
  font-size: 12px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
`;

const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "#f8fafc"};
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CloseModalButton = styled.button`
  padding: 12px 20px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-tertiary)" : "#e2e8f0"};
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#475569"};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--border-primary)" : "#cbd5e1"};
  }
`;

export default PayReportModal;
