import React from "react";
import styled from "styled-components";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";

// Styled Card
const StyledCard = styled(MDBCard)`
  border-radius: 16px;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.06);
  border: none;
  background-color: #ffffff;
  margin-top: 2rem;
  width: fit-content;
  min-width: 400px;
  width: 65%;
`;

// Header
const StyledCardHeader = styled(MDBCardHeader)`
  background-color: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1c1c1c;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
`;

// Table Head
const StyledTableHead = styled(MDBTableHead)`
  background-color: #f8f9fb;
  font-size: 0.75rem;
  th {
    font-weight: 600;
    color: #555;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.5rem;
    white-space: nowrap;
  }
`;

// Table Row
const StyledRow = styled.tr`
  font-size: 0.75rem;
  &:nth-child(even) {
    background-color: #fafafa;
  }
  &:hover {
    background-color: #f2f7ff;
  }
  td {
    padding: 0.5rem;
    white-space: nowrap;
  }
`;

// Name and Hours
const NameCell = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const HourText = styled.div`
  color: #3f51b5;
  font-weight: 600;
`;

const PayrollButton = styled.button`
  background-color: #3f51b5;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
`;

const PayPeriod = styled.div`
  font-size: 0.75rem;
  color: #000;

  font-weight: 600;
  margin-top: 1rem;
`;

const EmployeeHoursDashboardCard = ({ summary, showPayRoll, start, end }) => {
  //   console.log(summary);
  return (
    <StyledCard>
      <StyledCardHeader>{`Team Work Hours`}</StyledCardHeader>
      <PayPeriod>{`${start} to ${end}`}</PayPeriod>
      <MDBCardBody>
        <MDBTable align="middle" responsive hover>
          <StyledTableHead>
            <tr>
              <th>#</th>
              <th>Employee Name</th>
              <th>Total Hours</th>
              {showPayRoll && <th>Pay Rate</th>}
              {showPayRoll && <th>Total Pay</th>}
            </tr>
          </StyledTableHead>
          <MDBTableBody>
            {summary.map((emp, index) => (
              <StyledRow key={emp.employeeId || index}>
                <td>{index + 1}</td>
                <td>
                  <NameCell>{emp.employeeName}</NameCell>
                </td>
                <td>
                  <HourText>
                    {parseFloat(emp.totalHours).toFixed(2)} hrs
                  </HourText>
                </td>
                {showPayRoll && (
                  <td>
                    <HourText>
                      {`$${parseFloat(emp.payrate).toFixed(2)}`}
                    </HourText>
                  </td>
                )}
                {showPayRoll && (
                  <td>
                    <HourText>
                      {`$${parseFloat(emp.totalHours * emp.payrate).toFixed(
                        2
                      )}`}
                    </HourText>
                  </td>
                )}
              </StyledRow>
            ))}
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </StyledCard>
  );
};

export default EmployeeHoursDashboardCard;
