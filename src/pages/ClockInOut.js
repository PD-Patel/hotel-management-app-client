import React, { useState, useRef } from "react";
import styled from "styled-components";
import { MDBContainer, MDBBtn } from "mdb-react-ui-kit";
import DaysInn from "../assets/DaysInn.png";
import { clockIn } from "../services/clock";
import Alert from "../components/Alert";
import { useEffect } from "react";
// Styled Components
const Card = styled.div`
  max-width: 420px;
  margin: 100px auto;
  padding: 2.5rem;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
`;

const Heading = styled.h4`
  font-weight: 600;
  margin-bottom: 8px;
`;

const SubText = styled.p`
  color: #666;
  margin-bottom: 24px;
`;

const PinBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PinInput = styled.input`
  width: 60px;
  height: 60px;
  font-size: 1.8rem;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 12px;
  outline: none;
  transition: 0.2s ease;

  &:focus {
    border-color: #0062ff;
    box-shadow: 0 0 5px rgba(0, 98, 255, 0.3);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Feedback = styled.div`
  color: #e53935;
  margin-top: 1rem;
  font-size: 0.95rem;
`;

export default function ClockInOut() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [siteId, setSiteId] = useState("");
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timeout); // cleanup on unmount or re-trigger
    }
  }, [alert]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSiteIdChange = (value) => {
    const numeric = value.replace(/\D/g, "");
    setSiteId(numeric);
  };

  const handleSubmit = async () => {
    const joined = pin.join("");
    const site = siteId;

    try {
      const response = await clockIn(joined, site);

      if (!response.user.clockStatus) {
        setAlert({
          message: `Thank you for clocking in, ${response.user.firstName}`,
          type: "success",
        });
        setPin(["", "", "", ""]);
        setSiteId("");
      } else {
        setAlert({
          message: `Thank you for clocking out, ${response.user.firstName}`,
          type: "success",
        });
        setPin(["", "", "", ""]);
        setSiteId("");
      }
    } catch (error) {
      console.error("Clock in/out error:", error);
      setAlert({
        message: "Invalid PIN",
        type: "danger",
      });
      setPin(["", "", "", ""]);
      setSiteId("");
    }
  };

  const handleClear = () => {
    setPin(["", "", "", ""]);
    setSiteId("");
    setError("");
    inputRefs.current[0]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (pin[index] === "") {
        if (index > 0) {
          const prev = inputRefs.current[index - 1];
          prev.focus();
          const newPin = [...pin];
          newPin[index - 1] = "";
          setPin(newPin);
        }
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    }
  };

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timeout); // cleanup on unmount or re-trigger
    }
  }, [alert]);

  return (
    <MDBContainer>
      <Card>
        <Logo src={DaysInn} alt="Hotel Logo" />

        {alert && <Alert message={alert.message} type={alert.type} />}
        <Heading>Enter Your 4-Digit PIN</Heading>
        <SubText>Assigned by the manager for clock in/out</SubText>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter Site ID"
            value={siteId}
            onChange={(e) => handleSiteIdChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>

        <PinBox>
          {pin.map((digit, index) => (
            <PinInput
              key={index}
              maxLength={1}
              value={digit}
              type="password"
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </PinBox>

        <ButtonRow>
          <MDBBtn color="primary" onClick={handleSubmit}>
            Submit
          </MDBBtn>
          <MDBBtn color="light" onClick={handleClear}>
            Clear
          </MDBBtn>
        </ButtonRow>

        {error && <Feedback>{error}</Feedback>}
      </Card>
    </MDBContainer>
  );
}
