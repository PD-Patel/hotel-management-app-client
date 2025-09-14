import React from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";
import defaultPhoto from "../assets/user.png";
import { getUserProfilePicture } from "../utils/profilePicture";

const EmployeeProfileCard = ({
  employee,
  showActions = false,
  onEdit,
  onViewDetails,
  compact = false,
}) => {
  const { isDarkMode } = useTheme();

  const getProfilePhoto = () => {
    return getUserProfilePicture(employee, defaultPhoto);
  };

  const getStatusColor = (status) => {
    return status === "active" ? "#10b981" : "#ef4444";
  };

  const getStatusIcon = (status) => {
    return status === "active" ? "user-check" : "user-clock";
  };

  return (
    <Card isDarkMode={isDarkMode} compact={compact}>
      <CardHeader isDarkMode={isDarkMode}>
        <ProfileSection>
          <ProfilePhoto>
            <PhotoImage
              src={getProfilePhoto()}
              alt={`${employee.firstName} ${employee.lastName}`}
              onError={(e) => {
                e.target.src = defaultPhoto;
              }}
            />
            <StatusIndicator
              status={employee.status}
              color={getStatusColor(employee.status)}
            >
              <MDBIcon fas icon={getStatusIcon(employee.status)} />
            </StatusIndicator>
          </ProfilePhoto>

          <ProfileInfo>
            <EmployeeName isDarkMode={isDarkMode}>
              {employee.firstName} {employee.lastName}
            </EmployeeName>
            <EmployeeEmail isDarkMode={isDarkMode}>
              {employee.email}
            </EmployeeEmail>
            <EmployeePosition isDarkMode={isDarkMode}>
              {employee.role}
            </EmployeePosition>
          </ProfileInfo>
        </ProfileSection>

        {showActions && (
          <ActionButtons>
            {onEdit && (
              <ActionButton
                onClick={() => onEdit(employee)}
                isDarkMode={isDarkMode}
              >
                <MDBIcon fas icon="edit" />
              </ActionButton>
            )}
            {onViewDetails && (
              <ActionButton
                onClick={() => onViewDetails(employee)}
                isDarkMode={isDarkMode}
              >
                <MDBIcon fas icon="eye" />
              </ActionButton>
            )}
          </ActionButtons>
        )}
      </CardHeader>

      {!compact && (
        <CardBody isDarkMode={isDarkMode}>
          <InfoGrid>
            <InfoItem isDarkMode={isDarkMode}>
              <InfoLabel>Department</InfoLabel>
              <InfoValue>{employee.department || "Not specified"}</InfoValue>
            </InfoItem>

            <InfoItem isDarkMode={isDarkMode}>
              <InfoLabel>Role</InfoLabel>
              <InfoValue>
                <RoleBadge role={employee.role} isDarkMode={isDarkMode}>
                  {employee.role}
                </RoleBadge>
              </InfoValue>
            </InfoItem>

            <InfoItem isDarkMode={isDarkMode}>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue>{employee.phone || "Not specified"}</InfoValue>
            </InfoItem>

            <InfoItem isDarkMode={isDarkMode}>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>
                <StatusBadge
                  status={employee.status}
                  color={getStatusColor(employee.status)}
                  isDarkMode={isDarkMode}
                >
                  {employee.status}
                </StatusBadge>
              </InfoValue>
            </InfoItem>

            {employee.payRate && (
              <InfoItem isDarkMode={isDarkMode}>
                <InfoLabel>Pay Rate</InfoLabel>
                <InfoValue>${employee.payRate}</InfoValue>
              </InfoItem>
            )}

            {employee.payMethod && (
              <InfoItem isDarkMode={isDarkMode}>
                <InfoLabel>Pay Method</InfoLabel>
                <InfoValue>
                  <PayMethodBadge
                    payMethod={employee.payMethod}
                    isDarkMode={isDarkMode}
                  >
                    {employee.payMethod}
                  </PayMethodBadge>
                </InfoValue>
              </InfoItem>
            )}
          </InfoGrid>

          {employee.address && (
            <AddressSection isDarkMode={isDarkMode}>
              <AddressLabel>Address</AddressLabel>
              <AddressValue>{employee.address}</AddressValue>
            </AddressSection>
          )}

          <ClockStatusSection isDarkMode={isDarkMode}>
            <ClockStatusLabel>Clock Status</ClockStatusLabel>
            <ClockStatusValue isDarkMode={isDarkMode}>
              <ClockIcon isClockedIn={employee.clockStatus}>
                <MDBIcon
                  fas
                  icon={employee.clockStatus ? "clock" : "stopwatch"}
                />
              </ClockIcon>
              <ClockText>
                {employee.clockStatus
                  ? "Currently Clocked In"
                  : "Not Clocked In"}
              </ClockText>
            </ClockStatusValue>
          </ClockStatusSection>
        </CardBody>
      )}
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: ${({ isDarkMode }) => (isDarkMode ? "var(--card-bg)" : "white")};
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--card-border)" : "#e2e8f0")};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 2px 4px rgba(0, 0, 0, 0.05)"};
  transition: all 0.3s ease;
  width: ${({ compact }) => (compact ? "auto" : "100%")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ isDarkMode }) =>
      isDarkMode
        ? "0 8px 25px rgba(0, 0, 0, 0.4)"
        : "0 4px 8px rgba(0, 0, 0, 0.1)"};
  }
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-secondary)" : "#f1f5f9")};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const ProfilePhoto = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const PhotoImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const EmployeeName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const EmployeeEmail = styled.div`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  margin-bottom: 6px;
  word-break: break-word;
`;

const EmployeePosition = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "#f1f5f9"};
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? "var(--btn-primary)" : "#3b82f6"};
    color: white;
    transform: translateY(-1px);
  }
`;

const CardBody = styled.div`
  padding: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#475569"};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-weight: 500;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ role, isDarkMode }) => {
    switch (role) {
      case "admin":
        return isDarkMode ? "rgba(239, 68, 68, 0.2)" : "#fef2f2";
      case "manager":
        return isDarkMode ? "rgba(59, 130, 246, 0.2)" : "#eff6ff";
      default:
        return isDarkMode ? "rgba(16, 185, 129, 0.2)" : "#f0fdf4";
    }
  }};
  color: ${({ role, isDarkMode }) => {
    switch (role) {
      case "admin":
        return isDarkMode ? "#fca5a5" : "#dc2626";
      case "manager":
        return isDarkMode ? "#93c5fd" : "#2563eb";
      default:
        return isDarkMode ? "#6ee7b7" : "#16a34a";
    }
  }};
  border: 1px solid
    ${({ role, isDarkMode }) => {
      switch (role) {
        case "admin":
          return isDarkMode ? "rgba(239, 68, 68, 0.3)" : "#fecaca";
        case "manager":
          return isDarkMode ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe";
        default:
          return isDarkMode ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0";
      }
    }};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ status, isDarkMode }) =>
    status === "active"
      ? isDarkMode
        ? "rgba(16, 185, 129, 0.2)"
        : "#f0fdf4"
      : isDarkMode
      ? "rgba(239, 68, 68, 0.2)"
      : "#fef2f2"};
  color: ${({ status, isDarkMode }) =>
    status === "active"
      ? isDarkMode
        ? "#6ee7b7"
        : "#16a34a"
      : isDarkMode
      ? "#fca5a5"
      : "#dc2626"};
  border: 1px solid
    ${({ status, isDarkMode }) =>
      status === "active"
        ? isDarkMode
          ? "rgba(16, 185, 129, 0.3)"
          : "#bbf7d0"
        : isDarkMode
        ? "rgba(239, 68, 68, 0.3)"
        : "#fecaca"};
`;

const PayMethodBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ payMethod, isDarkMode }) => {
    switch (payMethod) {
      case "hourly":
      case "hourly_cash":
        return isDarkMode ? "rgba(16, 185, 129, 0.2)" : "#f0fdf4";
      case "per_room_rate":
        return isDarkMode ? "rgba(59, 130, 246, 0.2)" : "#eff6ff";
      default:
        return isDarkMode ? "rgba(107, 114, 128, 0.2)" : "#f9fafb";
    }
  }};
  color: ${({ payMethod, isDarkMode }) => {
    switch (payMethod) {
      case "hourly":
      case "hourly_cash":
        return isDarkMode ? "#6ee7b7" : "#16a34a";
      case "per_room_rate":
        return isDarkMode ? "#93c5fd" : "#2563eb";
      default:
        return isDarkMode ? "#9ca3af" : "#6b7280";
    }
  }};
  border: 1px solid
    ${({ payMethod, isDarkMode }) => {
      switch (payMethod) {
        case "hourly":
        case "hourly_cash":
          return isDarkMode ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0";
        case "per_room_rate":
          return isDarkMode ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe";
        default:
          return isDarkMode ? "rgba(107, 114, 128, 0.3)" : "#e5e7eb";
      }
    }};
`;

const AddressSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "#f8fafc"};
  border-radius: 12px;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
`;

const AddressLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#475569"};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const AddressValue = styled.div`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  line-height: 1.4;
`;

const ClockStatusSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "#f8fafc"};
  border-radius: 12px;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
`;

const ClockStatusLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#475569"};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ClockStatusValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
`;

const ClockIcon = styled.span`
  color: ${({ isClockedIn }) => (isClockedIn ? "#10b981" : "#64748b")};
  font-size: 16px;
`;

const ClockText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

export default EmployeeProfileCard;
