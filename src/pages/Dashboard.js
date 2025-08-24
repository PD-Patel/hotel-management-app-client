import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import GreetingNote from "../components/GreetingNote";
import { useAuth } from "../contexts/AuthContext";
import TotalEmployeesCard from "../components/TotalEmployeeCard";
import api from "../services/api";
import EmployeeHoursDashboardCard from "../components/EmployeeHoursDashboardCard";
import { getSummary } from "../services/payroll/payrollReport";
import CurrentlyClockedInCard from "../components/currentlyClockedInCard";

import { getPayPeriod } from "../services/payroll/generatePayroll";
import HoursCard from "../components/HoursCard";
import TotalPayRollAmountCard from "../components/TotalPayRollAmountCard";

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
      setEmployeeList(response.data.users);
      setTotalEmployees(response.data.users.length);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching employee data:", error);
      // Fallback to basic user data if clock-status fails
      try {
        const response = await api.get("/user/all-users");
        setTotalEmployees(response.data.users.length);
        setEmployeeList(response.data.users);
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

  // Refresh employee data every 30 seconds to get real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmployeeData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const [summary, setSummary] = useState([]);
  // Compute current pay period: 1st-15th or 16th-end

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
  }, []);

  console.log("summary:", summary);

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={`${user.firstName} ${user.lastName}`} />
        <Content>
          <TotalEmployeesCard totalEmployees={totalEmployees} />
          <HoursCard
            totalHours={summary.reduce((acc, curr) => acc + curr.totalHours, 0)}
          />
          <TotalPayRollAmountCard
            totalPayroll={summary.reduce(
              (acc, curr) =>
                acc +
                curr.payrate * curr.regularHours +
                curr.payrate * 1.5 * curr.overtimeHours,
              0
            )}
          />
        </Content>
        <EmployeeHoursDashboardCard summary={summary} start={start} end={end} />
        <CurrentlyClockedInCard
          presentList={employeeList}
          onRefresh={fetchEmployeeData}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
        />
      </Main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;
