import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import GreetingNote from "../components/GreetingNote";
import { useAuth } from "../contexts/AuthContext";

import api from "../services/api";
import EmployeeHoursDashboardCard from "../components/EmployeeHoursDashboardCard";
import { getSummary } from "../services/payroll/payrollReport";
import CurrentlyClockedInCard from "../components/currentlyClockedInCard";
import { getPayPeriod } from "../services/payroll/generatePayroll";

import { MDBIcon } from "mdb-react-ui-kit";

export default function Dashboard() {
  const { user } = useAuth();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employeeList, setEmployeeList] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch employee data with real-time clock status
  const fetchEmployeeData = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/user/clock-status");
      // Filter out per_room_rate employees from clock status display
      const filteredUsers = response.data.users.filter(
        (user) => user.payMethod !== "per_room_rate"
      );
      setEmployeeList(filteredUsers);
      setTotalEmployees(response.data.users.length); // Keep total count including per_room_rate
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching employee data:", error);
      // Fallback to basic user data if clock-status fails
      try {
        const response = await api.get("/user/all-users");
        setTotalEmployees(response.data.users.length);
        // Filter out per_room_rate employees from fallback data too
        const filteredUsers = response.data.users.filter(
          (user) => user.payMethod !== "per_room_rate"
        );
        setEmployeeList(filteredUsers);
        setLastUpdated(new Date());
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const payPeriod = await getPayPeriod(user.siteId);
      const { start, end } = payPeriod.payPeriod;
      const response = await getSummary(
        start.substring(0, 10),
        end.substring(0, 10)
      );
      setSummary(response.employeeSummary || []);
      setStart(start.substring(0, 10));
      setEnd(end.substring(0, 10));
    };

    fetchSummary();
  }, [user.siteId]);

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

  const totalHours = summary.reduce(
    (acc, curr) => acc + (curr.regularHours || 0) + (curr.overtimeHours || 0),
    0
  );
  const totalPayroll = summary.reduce((acc, curr) => {
    const regularPay = curr.payrate * curr.regularHours.toFixed(2);
    const overtimePay = curr.payrate * 1.5 * curr.overtimeHours.toFixed(2);
    return acc + regularPay + overtimePay;
  }, 0);

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />

        <Header>
          <HeaderContent>
            <HeaderLeft>
              <Title>Dashboard Overview</Title>
              <Subtitle>
                Monitor your business metrics and employee activities
              </Subtitle>
            </HeaderLeft>
            <HeaderRight>
              <RefreshButton
                onClick={fetchEmployeeData}
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

              {lastUpdated && (
                <LastUpdated>
                  <MDBIcon fas icon="clock" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </LastUpdated>
              )}
            </HeaderRight>
          </HeaderContent>
        </Header>

        <PayPeriodSection>
          <PayPeriodCard>
            <PayPeriodIcon>
              <MDBIcon fas icon="calendar-alt" />
            </PayPeriodIcon>
            <PayPeriodContent>
              <PayPeriodLabel>Current Pay Period</PayPeriodLabel>
              <PayPeriodDates>
                {formatDate(start)} - {formatDate(end)}
              </PayPeriodDates>
            </PayPeriodContent>
          </PayPeriodCard>
        </PayPeriodSection>

        <StatsSection>
          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="users" />
            </StatIcon>
            <StatContent>
              <StatValue>{totalEmployees}</StatValue>
              <StatLabel>Total Employees</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="clock" />
            </StatIcon>
            <StatContent>
              <StatValue>{totalHours.toFixed(2)}</StatValue>
              <StatLabel>Total Hours</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="dollar-sign" />
            </StatIcon>
            <StatContent>
              <StatValue>${totalPayroll.toFixed(2)}</StatValue>
              <StatLabel>Total Payroll</StatLabel>
            </StatContent>
          </StatCard>
        </StatsSection>

        <ContentSection>
          <SectionHeader>
            <SectionTitle>Employee Hours Summary</SectionTitle>
            <SectionSubtitle>
              Detailed breakdown of employee hours and pay
            </SectionSubtitle>
          </SectionHeader>
          <EmployeeHoursDashboardCard
            summary={summary}
            start={start}
            end={end}
          />
        </ContentSection>

        <ContentSection>
          <SectionHeader>
            <SectionTitle>Currently Clocked In</SectionTitle>
            <SectionSubtitle>Real-time employee clock status</SectionSubtitle>
          </SectionHeader>
          <CurrentlyClockedInCard
            presentList={employeeList}
            onRefresh={fetchEmployeeData}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
          />
        </ContentSection>
      </Main>
    </Container>
  );
}

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
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
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
    font-size: 0.875rem;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
  min-height: 36px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(59, 130, 246, 0.3);
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
    padding: 10px 16px;
    font-size: 0.875rem;
    min-height: 40px;
    gap: 5px;
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

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  width: fit-content;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    font-size: 0.8125rem;
    padding: 10px 14px;
  }
`;

const PayPeriodSection = styled.div`
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const PayPeriodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
  max-width: 400px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px;
    gap: 10px;
    border-radius: 8px;
  }
`;

const PayPeriodIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;

const PayPeriodContent = styled.div`
  flex: 1;
`;

const PayPeriodLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 2px;
  }
`;

const PayPeriodDates = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  /* Small Mobile Layout */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 12px;
    border-radius: 8px;
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 2px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const ContentSection = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 0.875rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 0 6px 0;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;
