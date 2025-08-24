import React from "react";
import styled from "styled-components";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
} from "mdb-react-ui-kit";

// Styled Card Wrapper
const PresenceCard = styled(MDBCard)`
  border-radius: 16px;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.06);
  border: none;
  background-color: #ffffff;
  margin-top: 2rem;
  min-width: 400px;
  max-width: 600px;
  padding: 1rem;
`;

// Header Styling
const PresenceHeader = styled(MDBCardHeader)`
  background-color: transparent;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e1e1e;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled(MDBBtn)`
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background-color: #007bff;
  border: none;

  &:hover {
    background-color: #0056b3;
  }
`;

// Table Header Styling
const StyledTableHead = styled(MDBTableHead)`
  background-color: #f8f9fb;
  font-size: 0.8rem;
  th {
    font-weight: 600;
    color: #444;
    padding: 0.6rem 0.75rem;
    white-space: nowrap;
    text-align: left;
  }
`;

// Table Row Styling
const StyledRow = styled.tr`
  font-size: 0.78rem;
  &:nth-child(even) {
    background-color: #fdfdfd;
  }
  td {
    padding: 0.55rem 0.75rem;
    vertical-align: middle;
    text-align: left;
  }
`;

// Name Cell
const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.span`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
  background-color: ${(props) =>
    props.isActive === true ? "#4caf50" : "#f44336"};
`;

const NameText = styled.span`
  font-weight: 600;
  color: #1a1a1a;
`;

const formatStatusText = (status, datetime) => {
  if (!datetime) return "-";
  const date = new Date(datetime);
  return `${status ? "IN" : "OUT"}: ${date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
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
        <HeaderContent>Employee Presence Status</HeaderContent>
        {onRefresh && (
          <RefreshButton
            size="sm"
            onClick={onRefresh}
            title="Refresh clock status"
            disabled={isRefreshing}
          >
            {isRefreshing ? "↻ Refreshing..." : "↻ Refresh"}
          </RefreshButton>
        )}
      </PresenceHeader>
      <MDBCardBody className="p-0">
        <MDBTable align="middle" responsive hover className="mb-0">
          <StyledTableHead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Last Clock In/Out</th>
            </tr>
          </StyledTableHead>
          <MDBTableBody>
            {Array.isArray(presentList) &&
              presentList.map((emp, index) => (
                <StyledRow key={emp.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <NameCell>
                      <StatusDot isActive={emp.clockStatus} />
                      <NameText>{`${emp.firstName} ${emp.lastName}`}</NameText>
                    </NameCell>
                  </td>
                  <td>
                    {formatStatusText(
                      emp.clockStatus,
                      emp.clockStatus === true
                        ? emp.lastClockIn
                        : emp.lastClockOut
                    )}
                  </td>
                </StyledRow>
              ))}
          </MDBTableBody>
        </MDBTable>
        {lastUpdated && (
          <div
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.75rem",
              color: "#666",
              borderTop: "1px solid #eee",
              textAlign: "right",
            }}
          >
            Last updated: {formatLastUpdated(lastUpdated)}
            {isRefreshing && " (refreshing...)"}
          </div>
        )}
      </MDBCardBody>
    </PresenceCard>
  );
};

export default CurrentlyClockedInCard;
