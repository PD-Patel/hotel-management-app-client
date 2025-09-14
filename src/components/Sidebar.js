import React, { useState, useEffect } from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

import defaultPhoto from "../assets/user.png";

const Sidebar = ({ user }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, sessionExpiry } = useAuth();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    } else if (path === "/users") {
      setActive("users");
    } else if (path === "/employee-payroll") {
      setActive("employee-payroll");
    } else {
      setActive(""); // Reset if no match
    }
  }, [location.pathname]);

  const handleActive = (item) => {
    setActive(item);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  // Safety check: if user is not provided or undefined, don't render
  if (!user) {
    return null;
  }

  // Mobile menu toggle button
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Toggle Button */}
        <MobileMenuToggle
          onClick={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        >
          <MDBIcon
            fas
            icon={isMobileMenuOpen ? "times" : "bars"}
            style={{
              transition: "all 0.3s ease",
              transform: isMobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </MobileMenuToggle>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <MobileMenuOverlay onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <MobileSidebarContainer className={isMobileMenuOpen ? "open" : ""}>
          <SidebarContent>
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
              {/* Home menu for all users except per_room_rate employees */}
              {user.payMethod !== "per_room_rate" && (
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
              )}
              {/* Employee Payroll - For all employees */}
              <MenuItem
                active={active === "employee-payroll" ? "true" : "false"}
                onClick={() => {
                  setActive("employee-payroll");
                  navigate("/employee-payroll");
                }}
              >
                <MenuIcon>
                  <MDBIcon fas icon="file-invoice-dollar" />
                </MenuIcon>
                <MenuText>My Payroll</MenuText>
              </MenuItem>

              {/* Housekeeping - For housekeeping role users */}
              {user.role === "housekeeping" && (
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
                  <MenuText>Housekeeping</MenuText>
                </MenuItem>
              )}

              {(user.role === "frontdesk" ||
                user.role === "admin" ||
                user.role === "manager") && (
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
              {user.role === "housekeeping" && (
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
                <>
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
                  <MenuItem
                    active={active === "payroll-history" ? "true" : "false"}
                    onClick={() => {
                      setActive("payroll-history");
                      navigate("/payroll/history");
                    }}
                  >
                    <MenuIcon>
                      <MDBIcon fas icon="history" />
                    </MenuIcon>
                    <MenuText>Payroll History</MenuText>
                  </MenuItem>
                </>
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
                      active={active === "employees" ? "true" : "false"}
                      onClick={() => {
                        setActive("employees");
                        navigate("/employee");
                      }}
                    >
                      <SubMenuIcon>
                        <MDBIcon fas icon="user" />
                      </SubMenuIcon>
                      <SubMenuText>Employees</SubMenuText>
                    </SubMenuItem>
                  )}
                </SubMenuContainer>
              )}

              {/* {(user.role === "admin" || user.role === "manager") && (
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
              )} */}
              {/* Revenue */}
              {/* <MenuItem
                active={active === "revenue" ? "true" : "false"}
                onClick={() => handleActive("revenue")}
              >
                <MenuIcon>
                  <MDBIcon fas icon="chart-bar" />
                </MenuIcon>
                <MenuText>Revenue</MenuText>
              </MenuItem> */}
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
            <UserProfileContainer onClick={() => navigate("/profile")}>
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

            {/* Theme Toggle */}
            <ThemeToggleContainer>
              <ThemeToggle />
            </ThemeToggleContainer>

            {/* Logout Section */}
            <LogoutContainer>
              <LogoutButton onClick={handleLogout}>
                <MenuIcon>
                  <MDBIcon fas icon="sign-out-alt" />
                </MenuIcon>
                <MenuText>Logout</MenuText>
              </LogoutButton>
            </LogoutContainer>
          </SidebarContent>
        </MobileSidebarContainer>
      </>
    );
  }

  // Desktop/Tablet Sidebar
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

        {/* Home menu for all users except per_room_rate employees */}
        {user.payMethod !== "per_room_rate" && (
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
        )}
        {/* Employee Payroll - For all employees */}
        <MenuItem
          active={active === "employee-payroll" ? "true" : "false"}
          onClick={() => {
            setActive("employee-payroll");
            navigate("/employee-payroll");
          }}
        >
          <MenuIcon>
            <MDBIcon fas icon="file-invoice-dollar" />
          </MenuIcon>
          <MenuText>My Payroll</MenuText>
        </MenuItem>

        {/* Housekeeping - For housekeeping role users */}
        {user.role === "housekeeping" && (
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
            <MenuText>Housekeeping</MenuText>
          </MenuItem>
        )}

        {(user.role === "frontdesk" ||
          user.role === "admin" ||
          user.role === "manager") && (
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
        {user.role === "housekeeping" && (
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
                active={active === "employees" ? "true" : "false"}
                onClick={() => {
                  setActive("employees");
                  navigate("/employee");
                }}
              >
                <SubMenuIcon>
                  <MDBIcon fas icon="user" />
                </SubMenuIcon>
                <SubMenuText>Employees</SubMenuText>
              </SubMenuItem>
            )}
          </SubMenuContainer>
        )}
        {/* Employees 
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
        */}

        {/* Revenue */}
        {/* <MenuItem
          active={active === "revenue" ? "true" : "false"}
          onClick={() => handleActive("revenue")}
        >
          <MenuIcon>
            <MDBIcon fas icon="chart-bar" />
          </MenuIcon>
          <MenuText>Revenue</MenuText>
        </MenuItem> */}

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
      <UserProfileContainer onClick={() => navigate("/profile")}>
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

      {/* Theme Toggle */}
      <ThemeToggleContainer>
        <ThemeToggle />
      </ThemeToggleContainer>

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

// Mobile Components
const MobileMenuToggle = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "isMobileMenuOpen",
})`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  background: linear-gradient(
    135deg,
    var(--btn-primary),
    var(--btn-primary-hover)
  );
  color: white;
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--shadow-heavy);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 18px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: ${({ isMobileMenuOpen }) =>
    isMobileMenuOpen ? "none" : "float 3s ease-in-out infinite"};

  &:hover {
    background: linear-gradient(
      135deg,
      var(--btn-primary-hover),
      var(--btn-primary)
    );
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 24px var(--shadow-heavy);
    animation: none;
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 4px 16px var(--shadow-heavy);
    }
    50% {
      box-shadow: 0 4px 16px var(--shadow-heavy),
        0 0 0 8px rgba(59, 130, 246, 0.3);
    }
    100% {
      box-shadow: 0 4px 16px var(--shadow-heavy);
    }
  }

  @media (min-width: 769px) {
    display: none;
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 16px;
  }
`;

const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--overlay-bg);
  z-index: 999;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileSidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  background: linear-gradient(
    180deg,
    var(--sidebar-bg) 0%,
    var(--bg-secondary) 100%
  );
  box-shadow: 4px 0 20px var(--shadow-medium);
  border-right: 1px solid var(--border-primary);
  overflow-y: auto;

  &.open {
    transform: translateX(0);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1rem 1.5rem;

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
  }
`;

// Desktop Components
const SidebarContainer = styled.div`
  width: 240px;
  height: 100vh;
  background: linear-gradient(
    180deg,
    var(--sidebar-bg) 0%,
    var(--bg-secondary) 100%
  );
  box-shadow: 4px 0 20px var(--shadow-light);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  padding: 0;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    display: none;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    width: 260px;
  }

  @media (min-width: 1025px) {
    width: 280px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--sidebar-border);
  gap: 16px;
  position: relative;
  min-height: 64px;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: flex-start;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    justify-content: flex-start;
    gap: 1rem;
    flex-direction: row;
    align-items: flex-start;
    min-height: 56px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    min-height: 48px;
    align-items: flex-start;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const HotelIcon = styled.div`
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: white;
  background: linear-gradient(
    135deg,
    var(--btn-primary),
    var(--btn-primary-hover)
  );
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px var(--shadow-medium);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  margin-right: 4px;
  margin-top: 2px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
    margin-right: 0.5rem;
    margin-top: 0.125rem;
  }

  @media (max-width: 480px) {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    margin-right: 0.375rem;
    margin-top: 0.125rem;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 2px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding-top: 0.125rem;
  }

  @media (max-width: 480px) {
    padding-top: 0.125rem;
  }
`;

const LogoMain = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 2px;
  margin-top: 0;
  padding-top: 0;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-left: 0.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-left: 0.125rem;
  }
`;

const LogoSub = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  margin-left: 2px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.625rem;
    margin-left: 0.25rem;
  }

  @media (max-width: 480px) {
    font-size: 0.5625rem;
    margin-left: 0.125rem;
  }
`;

const MenuContainer = styled.div`
  flex: 1;
  padding: 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    gap: 0.25rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.25rem;
    gap: 0.125rem;
  }
`;

const MenuItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.active === "true" ? "var(--sidebar-active)" : "transparent"};
  color: ${(props) =>
    props.active === "true"
      ? "var(--sidebar-active-text)"
      : "var(--text-secondary)"};
  border: 1px solid transparent;

  &:hover {
    background-color: ${(props) =>
      props.active === "true"
        ? "var(--sidebar-active)"
        : "var(--sidebar-hover)"};
    border-color: ${(props) =>
      props.active === "true" ? "transparent" : "var(--sidebar-hover-border)"};
    transform: translateX(4px);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin-bottom: 0.125rem;
    font-size: 0.875rem;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 0.625rem 0.75rem;
    margin-bottom: 0.0625rem;
    font-size: 0.8125rem;
    border-radius: 6px;
  }
`;

const MenuIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})`
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: ${(props) =>
    props.active === "true"
      ? "var(--sidebar-active-text)"
      : "var(--text-tertiary)"};
  transition: all 0.2s ease;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin-right: 0.75rem;
    font-size: 0.875rem;
    width: 1.125rem;
  }

  @media (max-width: 480px) {
    margin-right: 0.625rem;
    font-size: 0.8125rem;
    width: 1rem;
  }
`;

const MenuText = styled.span`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const ChevronIcon = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const SubMenuContainer = styled.div`
  margin-left: 24px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding-left: 12px;
  border-left: 2px solid var(--border-secondary);

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin-left: 1rem;
    margin-top: 0.25rem;
    margin-bottom: 0.125rem;
    padding-left: 0.75rem;
  }

  @media (max-width: 480px) {
    margin-left: 0.75rem;
    margin-top: 0.125rem;
    margin-bottom: 0.0625rem;
    padding-left: 0.5rem;
  }
`;

const SubMenuItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.active === "true" ? "var(--sidebar-active)" : "transparent"};
  color: ${(props) =>
    props.active === "true"
      ? "var(--sidebar-active-text)"
      : "var(--text-tertiary)"};
  border: 1px solid transparent;

  &:hover {
    background-color: ${(props) =>
      props.active === "true"
        ? "var(--sidebar-active)"
        : "var(--sidebar-hover)"};
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    margin-bottom: 0.125rem;
    font-size: 0.8125rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.625rem;
    margin-bottom: 0.0625rem;
    font-size: 0.75rem;
    border-radius: 5px;
  }
`;

const SubMenuIcon = styled.div`
  margin-right: 8px;
  font-size: 12px;
  width: 14px;
  text-align: center;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin-right: 0.5rem;
    font-size: 0.875rem;
    width: 1rem;
  }

  @media (max-width: 480px) {
    margin-right: 0.375rem;
    font-size: 0.8125rem;
    width: 0.875rem;
  }
`;

const SubMenuText = styled.span`
  font-size: 12px;
  font-weight: 500;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--sidebar-border);
  margin-top: auto;
  gap: 8px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin: 12px 8px 8px 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-medium);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: var(--status-success);
    border-radius: 0 2px 2px 0;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: row;
    text-align: left;
    gap: 0.75rem;
    margin: 1rem 1rem 1rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    margin: 0.75rem 0.75rem 0.75rem 0.75rem;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--sidebar-active);
  box-shadow: 0 2px 8px var(--shadow-medium);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
  }

  @media (max-width: 480px) {
    width: 2rem;
    height: 2rem;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    align-items: flex-start;
  }
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const UserRole = styled.span`
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  text-transform: capitalize;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 0.6875rem;
  }
`;

const SessionStatus = styled.span`
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  opacity: 0.8;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.6875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.625rem;
  }
`;

const ThemeToggleContainer = styled.div`
  padding: 6px 8px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  margin: 0 8px 8px 8px;
  border-radius: 8px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin: 0 1rem 1rem 1rem;
    padding: 0.75rem 1rem;
  }

  @media (max-width: 480px) {
    margin: 0 0.75rem 0.75rem 0.75rem;
    padding: 0.5rem 0.75rem;
  }
`;

const LogoutContainer = styled.div`
  padding: 6px 8px;
  border-top: 1px solid var(--sidebar-border);
  background: var(--bg-secondary);
  margin: 0 8px 8px 8px;
  border-radius: 8px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin: 0 1rem 1rem 1rem;
    padding: 0.75rem 1rem;
  }

  @media (max-width: 480px) {
    margin: 0 0.75rem 0.75rem 0.75rem;
    padding: 0.5rem 0.75rem;
  }
`;

const LogoutButton = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--status-error);
  background-color: transparent;
  font-size: 12px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;

  &:hover {
    background-color: var(--bg-tertiary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
