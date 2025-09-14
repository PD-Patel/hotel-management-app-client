import React from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";

const PresenceCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const PresenceHeader = styled.div`
  background: var(--table-header-bg);
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  min-height: 40px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
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
    width: auto;
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.875rem;
    min-height: 36px;
    gap: 6px;
  }
`;

const RefreshSpinner = styled.span`
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

const TableContainer = styled.div`
  overflow-x: auto;
  background: var(--card-bg);
  padding: 8px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 4px 0;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);

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
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    th:nth-child(1),
    td:nth-child(1) {
      width: 40px;
      min-width: 40px;
      max-width: 40px;
    }
    th:nth-child(2),
    td:nth-child(2) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }
    th:nth-child(3),
    td:nth-child(3) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }
  }
`;

const StyledTableHead = styled.thead`
  background: var(--table-header-bg);
`;

const StyledTableHeader = styled.th`
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-tertiary);
  border-bottom: 2px solid var(--border-primary);
  white-space: nowrap;
  text-align: center;

  /* First column (index) - center aligned */
  &:first-child {
    text-align: center;
    width: 60px;
    min-width: 60px;
    max-width: 60px;
  }

  /* Second column (employee name) - left aligned */
  &:nth-child(2) {
    text-align: left;
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  /* Third column (status) - center aligned */
  &:nth-child(3) {
    text-align: center;
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8125rem;

    &:first-child {
      width: 40px;
      min-width: 40px;
      max-width: 40px;
    }

    &:nth-child(2) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }

    &:nth-child(3) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }
  }
`;

const StyledTableBody = styled.tbody``;

const StyledTableRow = styled.tr`
  border-bottom: 1px solid var(--table-border);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--table-row-hover);
    transform: translateX(2px);
  }

  &:last-child {
    border-bottom: none;
  }

  /* Add spacing between rows */
  td {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    td {
      padding-top: 16px;
      padding-bottom: 16px;
    }
  }
`;

const StyledTableCell = styled.td`
  padding: 12px 20px;
  font-size: 14px;
  color: var(--text-primary);
  vertical-align: middle;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8125rem;
  }
`;

const IndexCell = styled(StyledTableCell)`
  font-weight: 600;
  color: var(--text-secondary);
  width: 60px;
  text-align: center;
  min-width: 60px;
  max-width: 60px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 40px;
    min-width: 40px;
    max-width: 40px;
  }
`;

const NameCell = styled(StyledTableCell)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  justify-content: flex-start;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 150px;
    min-width: 150px;
    max-width: 150px;
  }
`;

const StatusDot = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "isActive",
})`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  background: ${(props) =>
    props.isActive ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#ef4444"};
  box-shadow: 0 0 0 2px
    ${(props) =>
      props.isActive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"};
`;

const NameText = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const StatusCell = styled(StyledTableCell)`
  font-weight: 500;
  text-align: center;
  width: 200px;
  min-width: 200px;
  max-width: 200px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 150px;
    min-width: 150px;
    max-width: 150px;
  }
`;

const StatusText = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "isActive",
})`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: ${(props) =>
    props.isActive
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #ef4444, #dc2626)"};
  color: white;
  border: 1px solid ${(props) => (props.isActive ? "#059669" : "#dc2626")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
    gap: 4px;
  }
`;

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
  font-size: 2.5rem;
  color: var(--text-muted);
  margin-bottom: 1rem;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 10px 16px;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    justify-content: center;
  }
`;

const formatStatusText = (status, datetime) => {
  if (!datetime) return "No activity";
  const date = new Date(datetime);
  const timeString = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return status
    ? `Clocked In at ${timeString}`
    : `Clocked Out at ${timeString}`;
};

const toCamelCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const CurrentlyClockedInCard = ({
  presentList,
  onRefresh,
  lastUpdated,
  isRefreshing,
}) => {
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <PresenceCard>
      <PresenceHeader>
        <HeaderContent>
          <HeaderIcon>
            <MDBIcon fas icon="user-clock" />
          </HeaderIcon>
          <HeaderTitle>Employee Clock Status</HeaderTitle>
        </HeaderContent>
        {onRefresh && (
          <RefreshButton
            onClick={onRefresh}
            title="Refresh clock status"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshSpinner>⏳</RefreshSpinner>
                Refreshing...
              </>
            ) : (
              <>
                <MDBIcon fas icon="sync-alt" />
                Refresh
              </>
            )}
          </RefreshButton>
        )}
      </PresenceHeader>

      <TableContainer>
        <StyledTable>
          <StyledTableHead>
            <tr>
              <StyledTableHeader>#</StyledTableHeader>
              <StyledTableHeader>Employee Name</StyledTableHeader>
              <StyledTableHeader>Clock Status</StyledTableHeader>
            </tr>
          </StyledTableHead>
          <StyledTableBody>
            {Array.isArray(presentList) && presentList.length > 0 ? (
              presentList.map((emp, index) => (
                <StyledTableRow key={emp.id || index}>
                  <IndexCell>{index + 1}</IndexCell>
                  <NameCell>
                    <StatusDot isActive={emp.clockStatus} />
                    <NameText>
                      {toCamelCase(`${emp.firstName} ${emp.lastName}`)}
                    </NameText>
                  </NameCell>
                  <StatusCell>
                    <StatusText isActive={emp.clockStatus}>
                      <MDBIcon
                        fas
                        icon={emp.clockStatus ? "sign-in-alt" : "sign-out-alt"}
                      />
                      {formatStatusText(
                        emp.clockStatus,
                        emp.clockStatus === true
                          ? emp.lastClockIn
                          : emp.lastClockOut
                      )}
                    </StatusText>
                  </StatusCell>
                </StyledTableRow>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  <EmptyState>
                    <EmptyIcon>👥</EmptyIcon>
                    <EmptyText>No employees found</EmptyText>
                  </EmptyState>
                </td>
              </tr>
            )}
          </StyledTableBody>
        </StyledTable>
      </TableContainer>

      {lastUpdated && (
        <Footer>
          <LastUpdated>
            <MDBIcon fas icon="clock" />
            Last updated: {formatLastUpdated(lastUpdated)}
          </LastUpdated>
          {isRefreshing && (
            <LastUpdated>
              <MDBIcon fas icon="sync-alt" />
              Refreshing...
            </LastUpdated>
          )}
        </Footer>
      )}
    </PresenceCard>
  );
};

export default CurrentlyClockedInCard;
