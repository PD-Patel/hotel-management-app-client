import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import GreetingNote from "../components/GreetingNote";
import { getTotalHoursOfEmployee } from "../services/payroll/payrollReport";
import { webToggle, getMyRecentLogs } from "../services/clock";
import { getUser } from "../services/getUser";

export default function Home() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchError, setPunchError] = useState("");
  const [justPunched, setJustPunched] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(0);

  // Function to refresh current clock status from server
  const refreshClockStatus = async () => {
    try {
      const userData = await getUser();
      if (userData && userData.clockStatus !== undefined) {
        setIsClockedIn(Boolean(userData.clockStatus));
      }
    } catch (error) {
      console.error("Error refreshing clock status:", error);
    }
  };

  const toYmd = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const getWeekRangeForDate = (dateLike) => {
    const d = new Date(dateLike);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  // Refresh clock status when user changes (login/logout)
  useEffect(() => {
    if (user) {
      refreshClockStatus();
    } else {
      setIsClockedIn(false);
    }
  }, [user]);

  // Periodic refresh of clock status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshClockStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const { start, end } = getWeekRangeForDate(new Date());
    const s = toYmd(start);
    const e = toYmd(end);
    setWeekStart(s);
    setWeekEnd(e);
    const fetchRecent = async () => {
      try {
        const logs = await getMyRecentLogs(7);
        setRecent(logs);
      } catch (e) {
        // ignore
      }
    };
    const fetchHours = async () => {
      try {
        const resp = await getTotalHoursOfEmployee(user.id, s, e);
        setWeeklyHours(Math.round((resp.totalHours ?? 0) * 100) / 100);
      } catch (e) {
        setWeeklyHours(0);
      }
    };
    fetchRecent();
    fetchHours();
  }, [user]);

  const doWebPunch = async () => {
    setPunchLoading(true);
    setPunchError("");
    try {
      const resp = await webToggle();
      setJustPunched({
        message: resp.message,
        when: new Date().toISOString(),
        statusNow: resp.user.clockStatus,
      });
      setIsClockedIn(Boolean(resp.user.clockStatus));

      // Refresh recent logs and hours
      const logs = await getMyRecentLogs(7);
      setRecent(logs);

      // Refresh clock status to ensure consistency
      await refreshClockStatus();
    } catch (e) {
      setPunchError("Failed to punch. Please try again.");
    } finally {
      setPunchLoading(false);
    }
  };

  // No department shown in recent activity

  const flattenRecent = (logs) => {
    const rows = [];
    logs.forEach((log) => {
      const cin = new Date(log.clockIn);
      rows.push({
        id: `${log.id}-in`,
        type: "in",
        time: cin,
      });
      if (log.clockOut) {
        rows.push({
          id: `${log.id}-out`,
          type: "out",
          time: new Date(log.clockOut),
        });
      }
    });
    // sort desc by time
    return rows.sort((a, b) => b.time - a.time).slice(0, 7);
  };

  const activityRows = flattenRecent(recent);

  const fmtTime = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const fmtDate = (d) => d.toLocaleDateString();

  return (
    <Container>
      <Sidebar user={user} />
      <Content>
        <TopBar>
          <GreetingNote userName={`${user.firstName} ${user.lastName}`} />
          <WeekInfo>
            Current Week: {weekStart} - {weekEnd} | Total Hours:{" "}
            {weeklyHours.toFixed(2)}
          </WeekInfo>
        </TopBar>
        <CardsRow>
          {/* Web punch for all users */}
          <SmallCard>
            <CardHeader>Web Punch</CardHeader>
            <PunchCardBody>
              <PunchStatus>
                <StatusDot active={isClockedIn} />
                <StatusText>
                  {isClockedIn ? "You are clocked in" : "You are clocked out"}
                </StatusText>
              </PunchStatus>
              <PunchButton onClick={doWebPunch} disabled={punchLoading}>
                {punchLoading
                  ? "Processing..."
                  : isClockedIn
                  ? "Punch Out"
                  : "Punch In"}
              </PunchButton>
              {punchError && <PunchError>{punchError}</PunchError>}
            </PunchCardBody>
          </SmallCard>

          <MediumCard>
            <CardHeader>Recent Activity</CardHeader>
            <RecentHeader>
              <span>Last 7 entries</span>
            </RecentHeader>
            <RecentTable>
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <ActDot type={row.type} />
                    </td>
                    <td>
                      {row.type === "in" ? "In" : "Out"} at {fmtTime(row.time)}{" "}
                      on {fmtDate(row.time)}
                    </td>
                  </tr>
                ))}
                {activityRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="2"
                      style={{ textAlign: "center", padding: 16 }}
                    >
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </RecentTable>
          </MediumCard>
        </CardsRow>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: #f8f9fa;
  display: flex;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f8f9fa;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  overflow: hidden;
  width: 500px;
`;

const CardHeader = styled.div`
  background: #f3f6fb;
  color: #2c3e50;
  font-weight: 600;
  padding: 10px 14px;
  font-size: 14px;
  border-bottom: 1px solid #e6ecf5;
`;

const CardsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
`;

const BaseCard = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  overflow: hidden;
`;

const SmallCard = styled(BaseCard)`
  width: 500px;
`;

const MediumCard = styled(BaseCard)`
  width: 100%;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const WeekInfo = styled.div`
  font-size: 13px;
  color: #555;
`;

const PunchCardBody = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
`;

const PunchStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => (p.active ? "#2e7d32" : "#b71c1c")};
`;

const StatusText = styled.span`
  font-weight: 600;
`;

const PunchButton = styled.button`
  padding: 10px 18px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const PunchError = styled.div`
  color: #d32f2f;
  font-size: 13px;
`;

const PunchNote = styled.div`
  font-size: 13px;
  color: #555;
`;

const RecentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
`;

const RecentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    padding: 10px 14px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
  }
  thead th {
    background: #fafafa;
    font-weight: 600;
    font-size: 12px;
    color: #555;
  }
  tbody td {
    font-size: 13px;
    color: #333;
  }
`;

const ActDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => (p.type === "in" ? "#2e7d32" : "#c62828")};
`;
