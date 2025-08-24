import React from "react";
import { MDBInput, MDBBtn } from "mdb-react-ui-kit";
import styled from "styled-components";
import { useState } from "react";
import { register as registerService } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MDBIcon } from "mdb-react-ui-kit";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // User Information
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Site Information
  const [siteInfo, setSiteInfo] = useState({
    siteName: "",
    siteAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateUserInfo = () => {
    const newErrors = {};

    if (!userInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!userInfo.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!userInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!userInfo.password) {
      newErrors.password = "Password is required";
    } else if (userInfo.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!userInfo.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (userInfo.password !== userInfo.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!userInfo.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSiteInfo = () => {
    const newErrors = {};

    if (!siteInfo.siteName.trim()) newErrors.siteName = "Site name is required";
    if (!siteInfo.siteAddress.trim())
      newErrors.siteAddress = "Street address is required";
    if (!siteInfo.city.trim()) newErrors.city = "City is required";
    if (!siteInfo.state.trim()) newErrors.state = "State is required";
    if (!siteInfo.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!siteInfo.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSiteInfoChange = (field, value) => {
    setSiteInfo((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNext = () => {
    if (validateUserInfo()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSiteInfo()) {
      return;
    }

    setLoading(true);

    try {
      const response = await registerService({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email,
        password: userInfo.password,
        phone: userInfo.phone,
        siteName: siteInfo.siteName,
        siteAddress: siteInfo.siteAddress,
        city: siteInfo.city,
        state: siteInfo.state,
        zipCode: siteInfo.zipCode,
        country: siteInfo.country,
        role: "admin", // Default to admin for registration
      });

      // Auto-login after successful registration
      if (response.user && response.token) {
        login(response.user, response.token);
        navigate("/home");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressStep active={step >= 1} completed={step > 1}>
            <StepNumber completed={step > 1}>1</StepNumber>
            <StepLabel active={step >= 1} completed={step > 1}>
              User Information
            </StepLabel>
          </ProgressStep>
          <ProgressLine active={step > 1} />
          <ProgressStep active={step >= 2} completed={false}>
            <StepNumber completed={false}>2</StepNumber>
            <StepLabel active={step >= 2} completed={false}>
              Site Information
            </StepLabel>
          </ProgressStep>
        </ProgressContainer>

        {/* Step 1: User Information */}
        {step === 1 && (
          <StepContainer>
            <StepTitle>
              <MDBIcon fas icon="user" />
              User Information
            </StepTitle>
            <StepSubtitle>Please provide your personal details</StepSubtitle>

            <FormGrid>
              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="First Name"
                  value={userInfo.firstName}
                  onChange={(e) =>
                    handleUserInfoChange("firstName", e.target.value)
                  }
                  invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <ErrorMessage>{errors.firstName}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="Last Name"
                  value={userInfo.lastName}
                  onChange={(e) =>
                    handleUserInfoChange("lastName", e.target.value)
                  }
                  invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <ErrorMessage>{errors.lastName}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>

            <MDBInput
              className="mb-3"
              type="email"
              label="Email Address"
              value={userInfo.email}
              onChange={(e) => handleUserInfoChange("email", e.target.value)}
              invalid={!!errors.email}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

            <MDBInput
              className="mb-3"
              type="tel"
              label="Phone Number"
              value={userInfo.phone}
              onChange={(e) => handleUserInfoChange("phone", e.target.value)}
              invalid={!!errors.phone}
            />
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}

            <MDBInput
              className="mb-3"
              type="password"
              label="Password"
              value={userInfo.password}
              onChange={(e) => handleUserInfoChange("password", e.target.value)}
              invalid={!!errors.password}
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

            <MDBInput
              className="mb-4"
              type="password"
              label="Confirm Password"
              value={userInfo.confirmPassword}
              onChange={(e) =>
                handleUserInfoChange("confirmPassword", e.target.value)
              }
              invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
            )}

            <ButtonContainer>
              <MDBBtn
                onClick={handleNext}
                disabled={
                  !userInfo.firstName ||
                  !userInfo.lastName ||
                  !userInfo.email ||
                  !userInfo.password ||
                  !userInfo.confirmPassword ||
                  !userInfo.phone
                }
                className="mb-3"
                block
              >
                Next Step
                <MDBIcon fas icon="arrow-right" className="ms-2" />
              </MDBBtn>
            </ButtonContainer>
          </StepContainer>
        )}

        {/* Step 2: Site Information */}
        {step === 2 && (
          <StepContainer>
            <StepTitle>
              <MDBIcon fas icon="building" />
              Site Information
            </StepTitle>
            <StepSubtitle>Please provide your workplace details</StepSubtitle>

            <MDBInput
              className="mb-3"
              type="text"
              label="Site Name"
              value={siteInfo.siteName}
              onChange={(e) => handleSiteInfoChange("siteName", e.target.value)}
              invalid={!!errors.siteName}
            />
            {errors.siteName && <ErrorMessage>{errors.siteName}</ErrorMessage>}

            <MDBInput
              className="mb-3"
              type="text"
              label="Street Address"
              value={siteInfo.siteAddress}
              onChange={(e) =>
                handleSiteInfoChange("siteAddress", e.target.value)
              }
              invalid={!!errors.siteAddress}
            />
            {errors.siteAddress && (
              <ErrorMessage>{errors.siteAddress}</ErrorMessage>
            )}

            <FormGrid>
              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="City"
                  value={siteInfo.city}
                  onChange={(e) => handleSiteInfoChange("city", e.target.value)}
                  invalid={!!errors.city}
                />
                {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="State"
                  value={siteInfo.state}
                  onChange={(e) =>
                    handleSiteInfoChange("state", e.target.value)
                  }
                  invalid={!!errors.state}
                />
                {errors.state && <ErrorMessage>{errors.state}</ErrorMessage>}
              </InputGroup>
            </FormGrid>

            <FormGrid>
              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="ZIP Code"
                  value={siteInfo.zipCode}
                  onChange={(e) =>
                    handleSiteInfoChange("zipCode", e.target.value)
                  }
                  invalid={!!errors.zipCode}
                />
                {errors.zipCode && (
                  <ErrorMessage>{errors.zipCode}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <MDBInput
                  className="mb-3"
                  type="text"
                  label="Country"
                  value={siteInfo.country}
                  onChange={(e) =>
                    handleSiteInfoChange("country", e.target.value)
                  }
                  invalid={!!errors.country}
                />
                {errors.country && (
                  <ErrorMessage>{errors.country}</ErrorMessage>
                )}
              </InputGroup>
            </FormGrid>

            <ButtonContainer>
              <MDBBtn
                onClick={handleBack}
                outline
                className="mb-3 me-2"
                style={{ flex: 1 }}
              >
                <MDBIcon fas icon="arrow-left" className="me-2" />
                Back
              </MDBBtn>

              <MDBBtn
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !siteInfo.siteName ||
                  !siteInfo.siteAddress ||
                  !siteInfo.city ||
                  !siteInfo.state ||
                  !siteInfo.zipCode ||
                  !siteInfo.country
                }
                className="mb-3"
                style={{ flex: 2 }}
              >
                {loading ? (
                  <>
                    <MDBIcon fas icon="spinner" spin className="me-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="user-plus" className="me-2" />
                    Create Account
                  </>
                )}
              </MDBBtn>
            </ButtonContainer>
          </StepContainer>
        )}

        <div className="text-center mt-4">
          <p>
            Already have an account? <a href="/">Sign In</a>
          </p>
        </div>
      </RegisterCard>
    </RegisterContainer>
  );
}

// Styled Components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f0f0f0;
  padding: 20px;
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  background-color: ${(props) =>
    props.completed ? "#28a745" : props.active ? "#007bff" : "#e9ecef"};
  color: ${(props) => (props.completed || props.active ? "#fff" : "#6c757d")};
  transition: all 0.3s ease;
`;

const StepLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) =>
    props.completed ? "#28a745" : props.active ? "#007bff" : "#6c757d"};
  text-align: center;
  transition: all 0.3s ease;
`;

const ProgressLine = styled.div`
  width: 60px;
  height: 2px;
  background-color: ${(props) => (props.active ? "#007bff" : "#e9ecef")};
  margin: 0 20px;
  transition: all 0.3s ease;
`;

const StepContainer = styled.div`
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StepTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  i {
    color: #007bff;
  }
`;

const StepSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  text-align: left;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: -8px;
  margin-bottom: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;
