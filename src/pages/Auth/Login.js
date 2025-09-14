import React from "react";
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBCheckbox,
  MDBBtn,
} from "mdb-react-ui-kit";
import styled from "styled-components";

import { useState } from "react";
import { login as loginService } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginService(email, password);

      // Check if login was successful and has required data
      if (response.user) {
        // Use AuthContext login to set authentication state
        login(response.user);

        // Redirect based on user role and pay method
        if (
          response.user.role === "admin" ||
          response.user.role === "manager"
        ) {
          navigate("/dashboard");
        } else if (response.user.role === "frontdesk") {
          navigate("/frontdesk");
        } else if (response.user.role === "housekeeping") {
          navigate("/housekeeping-employee");
        } else if (response.user.payMethod === "per_room_rate") {
          // Per room rate employees go to housekeeping page instead of home
          navigate("/housekeeping-employee");
        } else {
          navigate("/home");
        }
      } else {
        alert("Login failed. Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    }
  };
  return (
    <LoginContainer>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <MDBInput
          className="mb-4"
          type="email"
          id="form1Example1"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <MDBInput
          className="mb-4"
          type="password"
          id="form1Example2"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <MDBRow className="mb-4">
          <MDBCol className="d-flex justify-content-center">
            <MDBCheckbox
              id="form1Example3"
              label="Remember me"
              defaultChecked
            />
          </MDBCol>
          <MDBCol>
            <a href="#!">Forgot password?</a>
          </MDBCol>
        </MDBRow>

        <MDBBtn type="submit" block>
          Sign in
        </MDBBtn>

        <div className="text-center mt-3">
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </form>
    </LoginContainer>
  );
}

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f0f0f0;

  form {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: #000;
    }
  }
`;
