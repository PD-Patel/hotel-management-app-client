import React from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import styled from "styled-components";

const SidebarLogo = () => (
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
);

// Styled components
const LogoContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HotelIcon = styled.div`
  font-size: 2rem;
  color: #007bff;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoMain = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const LogoSub = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

export default SidebarLogo;
