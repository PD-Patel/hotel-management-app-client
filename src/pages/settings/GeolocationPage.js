import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import Sidebar from "../../components/Sidebar";
import GreetingNote from "../../components/GreetingNote";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;

  margin: 0 auto;
  height: 100vh;
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
`;

const GeoCard = styled(MDBCard)`
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
`;

const GeoHeader = styled(MDBCardHeader)`
  background-color: transparent;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e1e1e;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
`;

const FormSection = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GeolocationSetupPage = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleSave = () => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude.");
      return;
    }
    // Save to backend or local storage (temporary)
    localStorage.setItem("workplaceLat", latitude);
    localStorage.setItem("workplaceLng", longitude);
    alert("Workplace geolocation saved successfully!");
    navigate("/home");
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition((position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        });
      } catch (error) {
        console.error("Error getting current location:", error);
      }
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <PageWrapper>
      <Sidebar user={user} />
      <ContentWrapper>
        <GreetingNote userName={user.name} />
        <GeoCard>
          <GeoHeader>📍 Set Workplace Geolocation</GeoHeader>
          <MDBCardBody>
            <FormSection>
              <MDBInput
                label="Latitude"
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="any"
              />
              <MDBInput
                label="Longitude"
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="any"
              />
              <MDBBtn onClick={handleSave}>Save Location</MDBBtn>
              <MDBBtn
                style={{ marginTop: "10px", backgroundColor: "#007bff" }}
                onClick={handleUseCurrentLocation}
              >
                Use Current Location
              </MDBBtn>
            </FormSection>
          </MDBCardBody>
        </GeoCard>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default GeolocationSetupPage;
