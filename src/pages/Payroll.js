import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import GreetingNote from "../components/GreetingNote";
import EmployeeHoursDashboardCard from "../components/EmployeeHoursDashboardCard";
import { getSummary } from "../services/payroll/payrollReport";
import { getCurrentPayPeriod } from "../services/getCurrentPayPeriod";
import {
  exportPayroll,
  getPayPeriod,
} from "../services/payroll/generatePayroll";

const Payroll = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [startPayPeriod, setStartPayPeriod] = useState("");
  const [endPayPeriod, setEndPayPeriod] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      const payPeriod = await getPayPeriod(user.siteId);
      const { start, end } = payPeriod.payPeriod;
      setStartPayPeriod(start.substring(0, 10));
      setEndPayPeriod(end.substring(0, 10));
      const response = await getSummary(
        start.substring(0, 10),
        end.substring(0, 10)
      );
      setSummary(response.employeeSummary || []);
    };
    fetchSummary();
  }, []);

  const handleGeneratePayroll = async () => {
    const response = await exportPayroll(user.siteId);
    console.log(response);
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Content>
        <GreetingNote userName={`${user.firstName} ${user.lastName}`} />
        <EmployeeHoursDashboardCard
          summary={summary}
          showPayRoll={true}
          start={startPayPeriod}
          end={endPayPeriod}
        />
        <Button onClick={handleGeneratePayroll}>Generate Payroll</Button>
      </Content>
    </Container>
  );
};

export default Payroll;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
`;
