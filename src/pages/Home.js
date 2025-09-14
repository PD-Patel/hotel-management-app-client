import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import GreetingNote from "../components/GreetingNote";
import { getTotalHoursOfEmployee } from "../services/payroll/payrollReport";
import { webToggle, getMyRecentLogs } from "../services/clock";
import { getUser } from "../services/getUser";
import { MDBIcon } from "mdb-react-ui-kit";

// ============================================================================
// STYLED COMPONENTS - LAYOUT & CONTAINERS
// ============================================================================

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
`;

const Main = styled.div`
  flex: 1;
  background-color: var(--bg-primary);
  padding: 20px;
  overflow-y: auto;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    margin-top: 4rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 18px;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    padding: 24px;
  }
`;

// ============================================================================
// STYLED COMPONENTS - HEADER SECTION
// ============================================================================

const Header = styled.div`
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    margin-bottom: 16px;
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
    gap: 12px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
  line-height: 1.2;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 26px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  line-height: 1.5;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 14px;
    text-align: center;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 15px;
  }
`;

// ============================================================================
// STYLED COMPONENTS - WEEK INFO CARD
// ============================================================================

const WeekInfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
  min-width: 200px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 18px;
  }
`;

const WeekIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const WeekContent = styled.div`
  flex: 1;
`;

const WeekLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 3px;
`;

const WeekDates = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

// ============================================================================
// STYLED COMPONENTS - STATISTICS SECTION
// ============================================================================

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  /* Desktop Layout */
  @media (min-width: 1025px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: var(--border-secondary);

    &::before {
      opacity: 1;
    }
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.2;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

// ============================================================================
// STYLED COMPONENTS - CONTENT SECTION
// ============================================================================

const ContentSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-primary);

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 18px;
  }
`;

// ============================================================================
// STYLED COMPONENTS - PUNCH CARD
// ============================================================================

const PunchCard = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 220px;
  box-shadow: var(--card-shadow);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: var(--border-secondary);
  }
`;

const CardHeader = styled.div`
  background: var(--table-header-bg);
  padding: 18px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
  }
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
`;

const HeaderSubtitle = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: auto;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardBody = styled.div`
  padding: 18px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  text-align: center;
  height: fit-content;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: ${({ active, theme }) =>
    active
      ? theme === "dark"
        ? "linear-gradient(135deg, #166534, #14532d)"
        : "linear-gradient(135deg, #f0fdf4, #dcfce7)"
      : theme === "dark"
      ? "linear-gradient(135deg, #991b1b, #7f1d1d)"
      : "linear-gradient(135deg, #fef2f2, #fee2e2)"};
  border: 1px solid
    ${({ active, theme }) =>
      active
        ? theme === "dark"
          ? "#22c55e"
          : "#bbf7d0"
        : theme === "dark"
        ? "#ef4444"
        : "#fecaca"};
  border-radius: 10px;
  min-width: 200px;
  height: fit-content;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ active }) =>
    active ? "var(--status-success)" : "var(--status-error)"};
  box-shadow: 0 0 0 2px
    ${({ active }) =>
      active ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"};
`;

const StatusText = styled.span`
  font-weight: 700;
  color: ${({ active }) =>
    active ? "var(--status-success)" : "var(--status-error)"};
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PunchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ isClockedIn }) =>
    isClockedIn
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #22c55e, #16a34a)"};
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 180px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2),
      0 4px 6px -2px rgba(0, 0, 0, 0.1);
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
    width: 100%;
    justify-content: center;
    padding: 16px 20px;
    font-size: 14px;
  }
`;

const PunchSpinner = styled.span`
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

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--status-error);
  font-size: 13px;
  font-weight: 600;
  padding: 14px 18px;
  background: ${({ theme }) =>
    theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "#fef2f2"};
  border: 1px solid
    ${({ theme }) => (theme === "dark" ? "rgba(239, 68, 68, 0.3)" : "#fecaca")};
  border-radius: 8px;
  width: 100%;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px 16px;
  }
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 600;
  padding: 14px 18px;
  background: ${({ theme }) =>
    theme === "dark" ? "rgba(59, 130, 246, 0.1)" : "#eff6ff"};
  border: 1px solid
    ${({ theme }) => (theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe")};
  border-radius: 8px;
  width: 100%;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px 16px;
  }
`;

// ============================================================================
// STYLED COMPONENTS - ACTIVITY CARD
// ============================================================================

const ActivityCard = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: var(--border-secondary);
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--table-row-hover);
    transform: translateX(2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 10px 14px;
    gap: 10px;
  }
`;

const ActivityIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ type }) =>
    type === "in"
      ? "linear-gradient(135deg, #22c55e, #16a34a)"
      : "linear-gradient(135deg, #ef4444, #dc2626)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  flex-shrink: 0;

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 13px;
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 10px;
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
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchError, setPunchError] = useState("");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dailyTotalHours, setDailyTotalHours] = useState(0);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(0);

  // Function to refresh current clock status from server
  const refreshClockStatus = useCallback(async () => {
    try {
      const userData = await getUser();

      if (userData && userData.clockStatus !== undefined) {
        const clockedIn = Boolean(userData.clockStatus);
        setIsClockedIn(clockedIn);

        // If clocked in, we need to get the actual punch-in time from recent logs
        if (clockedIn && !currentSessionStart) {
          try {
            // Get recent logs to find the actual clock-in time
            const logs = await getMyRecentLogs(7);

            if (logs && logs.length > 0) {
              // Find the most recent clock-in entry
              const recentClockIn = logs.find(
                (log) => log.clockIn && !log.clockOut
              );

              if (recentClockIn) {
                const actualClockInTime = new Date(recentClockIn.clockIn);
                setCurrentSessionStart(actualClockInTime);

                // Calculate the actual elapsed time since clock-in
                const now = new Date();
                const actualElapsed = Math.floor(
                  (now - actualClockInTime) / 1000
                );
                setElapsedTime(actualElapsed);
              } else {
                // Fallback: if no recent clock-in found, use current time
                setCurrentSessionStart(new Date());
                setElapsedTime(0);
              }
            } else {
              // Fallback: if no logs found, use current time
              setCurrentSessionStart(new Date());
              setElapsedTime(0);
            }
          } catch (logError) {
            console.error(
              "❌ Error fetching recent logs for clock-in time:",
              logError
            );
            // Fallback: use current time if logs fetch fails
            setCurrentSessionStart(new Date());
            setElapsedTime(0);
          }
        } else if (!clockedIn) {
          setCurrentSessionStart(null);
          setElapsedTime(0);
        }
      } else {
        // No user data or clock status undefined
      }
    } catch (error) {
      console.error("❌ Error refreshing clock status:", error);
    }
  }, [currentSessionStart]);

  // Function to calculate total hours worked today from server logs
  const calculateTotalHoursToday = useCallback(async () => {
    try {
      const logs = await getMyRecentLogs(7);

      if (!logs || logs.length === 0) {
        return 0;
      }

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      let totalHours = 0;

      logs.forEach((log) => {
        if (log.clockIn && log.clockOut) {
          const clockInTime = new Date(log.clockIn);
          const clockOutTime = new Date(log.clockOut);

          // Check if this session was today
          if (clockInTime >= todayStart && clockInTime < todayEnd) {
            const sessionDuration = (clockOutTime - clockInTime) / 1000; // seconds
            const sessionHours = sessionDuration / 3600; // convert to hours
            totalHours += sessionHours;

            // Session duration calculated
          }
        }
      });

      return totalHours;
    } catch (error) {
      console.error("❌ Error calculating total hours today:", error);
      return 0;
    }
  }, []);

  // Function to refresh total hours from server logs
  const refreshTotalHours = useCallback(async () => {
    try {
      const totalHours = await calculateTotalHoursToday();
      setDailyTotalHours(totalHours);
    } catch (error) {
      console.error("❌ Error refreshing total hours:", error);
    }
  }, [calculateTotalHoursToday]);

  // Refresh clock status when user changes (login/logout)
  useEffect(() => {
    if (user) {
      refreshClockStatus();
      refreshTotalHours(); // Get total hours from server logs
    } else {
      setIsClockedIn(false);
      setCurrentSessionStart(null);
      setElapsedTime(0);
      setDailyTotalHours(0);
    }
  }, [user, refreshClockStatus, refreshTotalHours]);

  // Periodic refresh of clock status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshClockStatus();
      refreshTotalHours(); // Also refresh total hours periodically
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, refreshClockStatus, refreshTotalHours]);

  // Timer effect to update elapsed time when clocked in
  useEffect(() => {
    if (!isClockedIn || !currentSessionStart) {
      setElapsedTime(0);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - currentSessionStart) / 1000); // elapsed seconds
      setElapsedTime(elapsed);
    }, 1000); // update every second

    return () => clearInterval(timer);
  }, [isClockedIn, currentSessionStart]);

  // Set week range and fetch data on component mount
  useEffect(() => {
    if (!user) return;

    // Set current week range
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    setWeekStart(start.toISOString().split("T")[0]);
    setWeekEnd(end.toISOString().split("T")[0]);

    // Fetch recent logs and weekly hours
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
        const resp = await getTotalHoursOfEmployee(
          user.id,
          start.toISOString().split("T")[0],
          end.toISOString().split("T")[0]
        );
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

      const newClockStatus = Boolean(resp.user.clockStatus);
      setIsClockedIn(newClockStatus);

      if (newClockStatus) {
        // Clocking in - start new session with current time
        const now = new Date();
        setCurrentSessionStart(now);
        setElapsedTime(0);
      } else {
        // Clocking out - calculate session hours
        if (currentSessionStart) {
          const sessionEnd = new Date();
          const sessionDuration = (sessionEnd - currentSessionStart) / 1000; // seconds
          const sessionHours = sessionDuration / 3600; // convert to hours

          // Add session hours to daily total
          const newDailyTotal = dailyTotalHours + sessionHours;
          setDailyTotalHours(newDailyTotal);

          // Show session summary
          const sessionFormatted = formatElapsedTime(sessionDuration);
          const dailyFormatted = formatHours(newDailyTotal);
          alert(
            `Session completed: ${sessionFormatted}\nDaily total: ${dailyFormatted}`
          );
        }

        setCurrentSessionStart(null);
        setElapsedTime(0);
      }

      // Refresh recent logs and hours
      const logs = await getMyRecentLogs(7);
      setRecent(logs);

      // Refresh clock status and total hours to ensure consistency
      await refreshClockStatus();
      await refreshTotalHours(); // Get updated total hours from server logs
    } catch (e) {
      console.error("❌ Punch failed:", e);
      setPunchError("Failed to punch. Please try again.");
    } finally {
      setPunchLoading(false);
    }
  };

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

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format hours as HH:MM
  const formatHours = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user.firstName} />

        <Header>
          <HeaderContent>
            <HeaderLeft>
              <Title>Welcome Back!</Title>
              <Subtitle>Manage your time and track your activities</Subtitle>
            </HeaderLeft>
            <HeaderRight>
              <WeekInfoCard>
                <WeekIcon>
                  <MDBIcon fas icon="calendar-alt" />
                </WeekIcon>
                <WeekContent>
                  <WeekLabel>Current Week</WeekLabel>
                  <WeekDates>
                    {formatDate(weekStart)} - {formatDate(weekEnd)}
                  </WeekDates>
                </WeekContent>
              </WeekInfoCard>
            </HeaderRight>
          </HeaderContent>
        </Header>

        <StatsSection>
          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="chart-line" />
            </StatIcon>
            <StatContent>
              <StatValue>{weeklyHours.toFixed(2)}</StatValue>
              <StatLabel>Weekly Hours</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="play-circle" />
            </StatIcon>
            <StatContent>
              <StatValue>
                {isClockedIn && currentSessionStart
                  ? formatElapsedTime(elapsedTime)
                  : "00:00:00"}
              </StatValue>
              <StatLabel>Current Session</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon>
              <MDBIcon fas icon="clock" />
            </StatIcon>
            <StatContent>
              <StatValue>{formatHours(dailyTotalHours)}</StatValue>
              <StatLabel>Today's Total</StatLabel>
            </StatContent>
          </StatCard>
        </StatsSection>

        <ContentSection>
          <CardsRow>
            {user.payMethod !== "per_room_rate" && (
              <PunchCard>
                <CardHeader>
                  <HeaderIcon>
                    <MDBIcon fas icon="user-clock" />
                  </HeaderIcon>
                  <HeaderTitle>Time Clock</HeaderTitle>
                </CardHeader>

                <CardBody>
                  <StatusSection>
                    <StatusIndicator active={isClockedIn} theme={theme}>
                      <StatusDot active={isClockedIn} />
                      <StatusText>
                        {isClockedIn
                          ? "Currently Clocked In"
                          : "Currently Clocked Out"}
                      </StatusText>
                    </StatusIndicator>

                    <PunchButton
                      onClick={doWebPunch}
                      disabled={punchLoading}
                      isClockedIn={isClockedIn}
                    >
                      {punchLoading ? (
                        <>
                          <PunchSpinner>⏳</PunchSpinner>
                          Processing...
                        </>
                      ) : (
                        <>
                          <MDBIcon
                            fas
                            icon={isClockedIn ? "sign-out-alt" : "sign-in-alt"}
                          />
                          {isClockedIn ? "Clock Out" : "Clock In"}
                        </>
                      )}
                    </PunchButton>

                    {punchError && (
                      <ErrorMessage theme={theme}>
                        <MDBIcon fas icon="exclamation-triangle" />
                        {punchError}
                      </ErrorMessage>
                    )}
                  </StatusSection>
                </CardBody>
              </PunchCard>
            )}

            {user.payMethod === "per_room_rate" && (
              <PunchCard>
                <CardHeader>
                  <HeaderIcon>
                    <MDBIcon fas icon="bed" />
                  </HeaderIcon>
                  <HeaderTitle>Room Service</HeaderTitle>
                </CardHeader>

                <CardBody>
                  <StatusSection>
                    <StatusIndicator active={false} theme={theme}>
                      <StatusDot active={false} />
                      <StatusText>Per Room Rate Employee</StatusText>
                    </StatusIndicator>

                    <InfoMessage theme={theme}>
                      <MDBIcon fas icon="info-circle" />
                      You are paid per room serviced, not by hours worked.
                    </InfoMessage>
                  </StatusSection>
                </CardBody>
              </PunchCard>
            )}

            <ActivityCard>
              <CardHeader>
                <HeaderIcon>
                  <MDBIcon fas icon="list-alt" />
                </HeaderIcon>
                <HeaderTitle>Recent Activity</HeaderTitle>
                <HeaderSubtitle>Last 7 entries</HeaderSubtitle>
              </CardHeader>

              <CardBody>
                {activityRows.length > 0 ? (
                  <ActivityList>
                    {activityRows.map((row) => (
                      <ActivityItem key={row.id}>
                        <ActivityIcon type={row.type}>
                          <MDBIcon
                            fas
                            icon={
                              row.type === "in" ? "sign-in-alt" : "sign-out-alt"
                            }
                          />
                        </ActivityIcon>
                        <ActivityContent>
                          <ActivityText>
                            {row.type === "in" ? "In" : "Out"}
                          </ActivityText>
                          <ActivityTime>
                            {fmtTime(row.time)} • {fmtDate(row.time)}
                          </ActivityTime>
                        </ActivityContent>
                      </ActivityItem>
                    ))}
                  </ActivityList>
                ) : (
                  <EmptyState>
                    <EmptyIcon>
                      <MDBIcon fas icon="inbox" />
                    </EmptyIcon>
                    <EmptyText>No recent activity</EmptyText>
                  </EmptyState>
                )}
              </CardBody>
            </ActivityCard>
          </CardsRow>
        </ContentSection>
      </Main>
    </Container>
  );
}
