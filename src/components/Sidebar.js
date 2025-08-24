import React, { useState, useEffect } from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import defaultPhoto from "../assets/user.png";

const Sidebar = ({ user }) => {
  const [timestationOpen, setTimestationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, sessionExpiry } = useAuth();

  // Update active state based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path === "/home") {
      setActive("home");
    } else if (path === "/dashboard") {
      setActive("dashboard");
    } else if (path === "/frontdesk") {
      setActive("frontdesk");
    } else if (path === "/housekeeping") {
      setActive("housekeeping");
    } else if (path === "/employee" || path === "/employee/add") {
      setActive("employees");
    } else if (path === "/clock-logs") {
      setActive("clock-logs");
      setTimestationOpen(true); // Open timestation submenu
    } else if (path === "/users") {
      setActive("users");
    } else {
      setActive(""); // Reset if no match
    }
  }, [location.pathname]);
  const handleActive = (item) => {
    setActive(item);
  };

  const toggleTimestation = () => {
    setTimestationOpen(!timestationOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleLogout = async () => {
    try {
      // Use AuthContext logout to clear state and call server
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if service call fails
      navigate("/");
    }
  };

  console.log(user);

  return (
    <SidebarContainer>
      {/* Hotel Management Logo */}
      <LogoContainer>
        <Logo>
          <HotelIcon>
            <MDBIcon fas icon="hotel" />
          </HotelIcon>
          <LogoText>
            <LogoMain>DaysInn</LogoMain>
            <LogoSub>Management</LogoSub>
          </LogoText>
        </Logo>
      </LogoContainer>

      {/* Menu Items */}

      <MenuContainer>
        {/* Dashboard - Active Item */}
        {(user.role === "admin" || user.role === "manager") && (
          <MenuItem
            active={active === "dashboard" ? "true" : "false"}
            onClick={() => {
              setActive("dashboard");
              navigate("/dashboard");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="tachometer-alt" />
            </MenuIcon>
            <MenuText>Dashboard</MenuText>
          </MenuItem>
        )}

        {/* Home menu for all users */}
        <MenuItem
          active={active === "home" ? "true" : "false"}
          onClick={() => {
            setActive("home");
            navigate("/home");
          }}
        >
          <MenuIcon>
            <MDBIcon fas icon="home" />
          </MenuIcon>
          <MenuText>Home</MenuText>
        </MenuItem>

        {(user.position === "frontdesk" || user.position === "Manager") && (
          <MenuItem
            active={active === "frontdesk" ? "true" : "false"}
            onClick={() => {
              setActive("frontdesk");
              navigate("/frontdesk");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="door-open" />
            </MenuIcon>
            <MenuText>Frontdesk</MenuText>
          </MenuItem>
        )}

        {/* Housekeeping - Admin and Manager only */}
        {(user.role === "admin" || user.role === "manager") && (
          <MenuItem
            active={active === "housekeeping" ? "true" : "false"}
            onClick={() => {
              setActive("housekeeping");
              navigate("/housekeeping");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="broom" />
            </MenuIcon>
            <MenuText>Housekeeping</MenuText>
          </MenuItem>
        )}

        {/* Housekeeping Employee - For housekeeping staff */}
        {user.position === "housekeeping" && (
          <MenuItem
            active={active === "housekeeping-employee" ? "true" : "false"}
            onClick={() => {
              setActive("housekeeping-employee");
              navigate("/housekeeping-employee");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="broom" />
            </MenuIcon>
            <MenuText>My Rooms</MenuText>
          </MenuItem>
        )}

        {/* Timestation - Collapsible */}

        {(user.role === "admin" || user.role === "manager") && (
          <MenuItem
            active={active === "clock-logs" ? "true" : "false"}
            onClick={() => {
              setActive("clock-logs");
              navigate("/clock-logs");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="clock" />
            </MenuIcon>
            <MenuText>Clock Logs</MenuText>
          </MenuItem>
        )}

        {(user.role === "admin" || user.role === "manager") && (
          <MenuItem
            active={active === "payroll" ? "true" : "false"}
            onClick={() => {
              setActive("payroll");
              navigate("/payroll");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="dollar-sign" />
            </MenuIcon>
            <MenuText>Payroll</MenuText>
          </MenuItem>
        )}

        {/* Settings - Collapsible */}
        <MenuItem
          active={active === "settings" ? "true" : "false"}
          onClick={toggleSettings}
        >
          <MenuIcon>
            <MDBIcon fas icon="cog" />
          </MenuIcon>
          <MenuText>Settings</MenuText>
          <ChevronIcon>
            <MDBIcon fas icon="chevron-down" />
          </ChevronIcon>
        </MenuItem>

        {/* Settings Sub-menu */}
        {settingsOpen && (
          <SubMenuContainer>
            {(user.role === "admin" || user.role === "manager") && (
              <SubMenuItem
                active={active === "geolocation" ? "true" : "false"}
                onClick={() => {
                  handleActive("geolocation");
                  navigate("/settings/geolocation");
                }}
              >
                <SubMenuIcon>
                  <MDBIcon fas icon="location-dot" />
                </SubMenuIcon>
                <SubMenuText>Geo Location</SubMenuText>
              </SubMenuItem>
            )}

            {user.role === "admin" && (
              <SubMenuItem
                active={active === "room-management" ? "true" : "false"}
                onClick={() => {
                  handleActive("room-management");
                  navigate("/settings/room-management");
                }}
              >
                <SubMenuIcon>
                  <MDBIcon fas icon="bed" />
                </SubMenuIcon>
                <SubMenuText>Room Management</SubMenuText>
              </SubMenuItem>
            )}

            {(user.role === "admin" || user.role === "manager") && (
              <SubMenuItem
                active={active === "time-reports" ? "true" : "false"}
                onClick={() => handleActive("time-reports")}
              >
                <SubMenuIcon>
                  <MDBIcon fas icon="user" />
                </SubMenuIcon>
                <SubMenuText>User Management</SubMenuText>
              </SubMenuItem>
            )}
          </SubMenuContainer>
        )}

        {(user.role === "admin" || user.role === "manager") && (
          <MenuItem
            active={active === "employees" ? "true" : "false"}
            onClick={() => {
              setActive("employees");
              navigate("/employee");
            }}
          >
            <MenuIcon>
              <MDBIcon fas icon="users" />
            </MenuIcon>
            <MenuText>Employees</MenuText>
          </MenuItem>
        )}

        {/* Employees */}

        {/* Revenue */}
        {/* <MenuItem
          active={active === "revenue" ? "true" : "false"}
          onClick={() => handleActive("revenue")}
        >
          <MenuIcon>
            <MDBIcon fas icon="chart-bar" />
          </MenuIcon>
          <MenuText>Revenue</MenuText>
        </MenuItem>

        {/* Rooms */}
        {/* <MenuItem
          active={active === "rooms" ? "true" : "false"}
          onClick={() => handleActive("rooms")}
        >
          <MenuIcon>
            <MDBIcon fas icon="bed" />
          </MenuIcon>
          <MenuText>Rooms</MenuText>
        </MenuItem> */}

        {/* Reservations */}
        {/* <MenuItem
          active={active === "reservations" ? "true" : "false"}
          onClick={() => handleActive("reservations")}
        >
          <MenuIcon>
            <MDBIcon fas icon="calendar-check" />
          </MenuIcon>
          <MenuText>Reservations</MenuText>
        </MenuItem> */}

        {/* Guests */}
        {/* <MenuItem
          active={active === "guests" ? "true" : "false"}
          onClick={() => handleActive("guests")}
        >
          <MenuIcon>
            <MDBIcon fas icon="user-friends" />
          </MenuIcon>
          <MenuText>Guests</MenuText>
        </MenuItem> */}

        {/* Maintenance */}
        {/* <MenuItem
          active={active === "maintenance" ? "true" : "false"}
          onClick={() => handleActive("maintenance")}
        >
          <MenuIcon>
            <MDBIcon fas icon="tools" />
          </MenuIcon>
          <MenuText>Maintenance</MenuText>
        </MenuItem> */}
      </MenuContainer>

      {/* User Profile Section */}
      <UserProfileContainer>
        <UserAvatar>
          <img
            src={user?.image ? user.image : defaultPhoto}
            alt="User Profile"
          />
        </UserAvatar>
        <UserInfo>
          <UserName>
            {user ? `${user.firstName} ${user.lastName}` : "User"}
          </UserName>
          <UserRole>{user?.role}</UserRole>
          {sessionExpiry && (
            <SessionStatus>
              Session expires: {sessionExpiry.toLocaleDateString()}
            </SessionStatus>
          )}
        </UserInfo>
      </UserProfileContainer>

      {/* Logout Section */}
      <LogoutContainer>
        <LogoutButton onClick={handleLogout}>
          <MenuIcon>
            <MDBIcon fas icon="sign-out-alt" />
          </MenuIcon>
          <MenuText>Logout</MenuText>
        </LogoutButton>
      </LogoutContainer>
    </SidebarContainer>
  );
};

export default Sidebar;

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0 30px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HotelIcon = styled.div`
  font-size: 32px;
  color: #1976d2;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoMain = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
  letter-spacing: 1px;
`;

const LogoSub = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const MenuContainer = styled.div`
  flex: 1;
  padding: 0 20px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.active === "true" ? "#e3f2fd" : "transparent"};
  color: ${(props) => (props.active === "true" ? "#4285f4" : "#424242")};

  &:hover {
    background-color: ${(props) =>
      props.active === "true" ? "#e3f2fd" : "#f5f5f5"};
  }
`;

const MenuIcon = styled.div`
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const MenuText = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const ChevronIcon = styled.div`
  font-size: 12px;
  color: #757575;
`;

const SubMenuContainer = styled.div`
  margin-left: 20px;
  margin-bottom: 8px;
`;

const SubMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.active === "true" ? "#e8f4fd" : "transparent"};
  color: ${(props) => (props.active === "true" ? "#1976d2" : "#666")};

  &:hover {
    background-color: ${(props) =>
      props.active === "true" ? "#e8f4fd" : "#f5f5f5"};
  }
`;

const SubMenuIcon = styled.div`
  margin-right: 10px;
  font-size: 14px;
  width: 16px;
  text-align: center;
`;

const SubMenuText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e3f2fd;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const SessionStatus = styled.span`
  font-size: 11px;
  color: #999;
  margin-top: 2px;
`;

const LogoutContainer = styled.div`
  padding: 10px;
  border-top: 1px solid #f0f0f0;
`;

const LogoutButton = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #d32f2f;
  background-color: transparent;

  &:hover {
    background-color: #ffebee;
  }
`;
