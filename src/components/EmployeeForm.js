import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { MDBInput, MDBTextArea, MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";
import imageCompression from "browser-image-compression";

const EmployeeForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  title = "Add New Employee",
  submitButtonText = "Add Employee",
  siteId,
  createdBy,
  action,
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    role: "",
    phone: "",
    address: "",
    status: "",
    gender: "",
    payRate: "",
    payMethod: "",
    pin: "",
    photo: null,
    password: "",
    createdBy: createdBy,
    siteId: siteId,
  });

  // Dropdown states
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isPayMethodOpen, setIsPayMethodOpen] = useState(false);

  // Refs for click outside functionality
  const roleRef = useRef(null);
  const statusRef = useRef(null);
  const genderRef = useRef(null);
  const payMethodRef = useRef(null);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        department: initialData.department || "",
        role: initialData.role || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        status: initialData.status || "",
        gender: initialData.gender || "",
        payRate: initialData.payRate || "",
        payMethod: initialData.payMethod || "",
        pin: initialData.pin || "",
        photo: null,
        siteId: siteId,
        createdBy: createdBy,
        password: initialData.password || "",
      });
    }
  }, [initialData, createdBy, siteId]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
      if (
        payMethodRef.current &&
        !payMethodRef.current.contains(event.target)
      ) {
        setIsPayMethodOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special validation for PIN field
    if (name === "pin") {
      // Only allow numbers and limit to 4 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compression options
        const options = {
          maxSizeMB: 1, // Max file size 1MB
          maxWidthOrHeight: 800, // Max width/height 800px
          useWebWorker: true,
          fileType: "image/jpeg",
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // File compression completed

        setFormData((prev) => ({
          ...prev,
          photo: compressedFile,
        }));
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original file if compression fails
        setFormData((prev) => ({
          ...prev,
          photo: file,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer isDarkMode={isDarkMode}>
      <FormTitle isDarkMode={isDarkMode}>{title}</FormTitle>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <MDBInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <MDBInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </FormRow>
        {action === "edit" ? (
          <></>
        ) : (
          <FormRow>
            <FormGroup>
              <MDBInput
                label="Password "
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </FormRow>
        )}

        <FormRow>
          <FormGroup>
            <CustomDropdown
              ref={genderRef}
              isOpen={isGenderOpen}
              setIsOpen={setIsGenderOpen}
              label="Gender"
              value={formData.gender}
              onChange={(value) => handleDropdownChange("gender", value)}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              placeholder="Select Gender"
              isDarkMode={isDarkMode}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <MDBInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <MDBInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <MDBTextArea
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <MDBInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <CustomDropdown
              ref={roleRef}
              isOpen={isRoleOpen}
              setIsOpen={setIsRoleOpen}
              label="Role"
              value={formData.role}
              onChange={(value) => handleDropdownChange("role", value)}
              options={
                // If current user is manager, hide Admin option
                createdBy && window?.CURRENT_USER_ROLE === "manager"
                  ? [
                      { value: "manager", label: "Manager" },
                      { value: "frontdesk", label: "Front Desk" },
                      { value: "housekeeping", label: "Housekeeping" },
                    ]
                  : [
                      { value: "admin", label: "Admin" },
                      { value: "manager", label: "Manager" },
                      { value: "frontdesk", label: "Front Desk" },
                      { value: "housekeeping", label: "Housekeeping" },
                    ]
              }
              placeholder="Select Role"
              isDarkMode={isDarkMode}
            />
          </FormGroup>
          <FormGroup>
            <CustomDropdown
              ref={statusRef}
              isOpen={isStatusOpen}
              setIsOpen={setIsStatusOpen}
              label="Status"
              value={formData.status}
              onChange={(value) => handleDropdownChange("status", value)}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              placeholder="Select Status"
              isDarkMode={isDarkMode}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <MDBInput
              label="Pay Rate"
              name="payRate"
              value={formData.payRate}
              onChange={handleInputChange}
              placeholder="e.g., $15.00/hour or $5.00/room"
            />
          </FormGroup>
          <FormGroup>
            <CustomDropdown
              ref={payMethodRef}
              isOpen={isPayMethodOpen}
              setIsOpen={setIsPayMethodOpen}
              label="Pay Method"
              value={formData.payMethod}
              onChange={(value) => handleDropdownChange("payMethod", value)}
              options={[
                { value: "hourly", label: "Hourly Check" },
                { value: "hourly_cash", label: "Hourly Cash" },
                { value: "per_room_rate", label: "Per Room Rate" },
              ]}
              placeholder="Select Pay Method"
              isDarkMode={isDarkMode}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <MDBInput
              label="PIN"
              name="pin"
              type="password"
              value={formData.pin}
              onChange={handleInputChange}
              placeholder="Enter 4-digit PIN"
            />
          </FormGroup>
        </FormRow>

        <PhotoUploadSection isDarkMode={isDarkMode}>
          <PhotoLabel isDarkMode={isDarkMode}>Employee Photo</PhotoLabel>
          <PhotoInputWrapper>
            <PhotoInput
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              id="photo-upload"
            />
            <PhotoInputLabel htmlFor="photo-upload" isDarkMode={isDarkMode}>
              <PhotoIcon>
                <MDBIcon fas icon="camera" />
              </PhotoIcon>
              <PhotoText isDarkMode={isDarkMode}>
                {formData.photo ? formData.photo.name : "Choose a photo"}
              </PhotoText>
            </PhotoInputLabel>
          </PhotoInputWrapper>
        </PhotoUploadSection>

        <ButtonGroup isDarkMode={isDarkMode}>
          <SubmitButton type="submit">{submitButtonText}</SubmitButton>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

// Custom Dropdown Component
const CustomDropdown = React.forwardRef(
  (
    {
      isOpen,
      setIsOpen,
      label,
      value,
      onChange,
      options,
      placeholder,
      isDarkMode,
    },
    ref
  ) => {
    return (
      <DropdownContainer ref={ref}>
        <DropdownLabel isDarkMode={isDarkMode}>{label}</DropdownLabel>
        <DropdownButton
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          isDarkMode={isDarkMode}
          isOpen={isOpen}
        >
          <DropdownButtonText isDarkMode={isDarkMode}>
            {value
              ? options.find((opt) => opt.value === value)?.label
              : placeholder}
          </DropdownButtonText>
          <DropdownArrow isOpen={isOpen}>
            <MDBIcon fas icon="chevron-down" />
          </DropdownArrow>
        </DropdownButton>

        {isOpen && (
          <DropdownMenu isDarkMode={isDarkMode}>
            {options.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                isDarkMode={isDarkMode}
                isSelected={value === option.value}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </DropdownContainer>
    );
  }
);

export default EmployeeForm;

// Styled Components with Dark Mode Support
const FormContainer = styled.div`
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-bg)" : "#ffffff"};
  border-radius: 12px;
  padding: 32px;
  box-shadow: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-shadow)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"};
  max-width: 800px;
  width: 100%;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--card-border)" : "#e2e8f0")};

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 8px;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 28px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#0f172a"};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 48px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 2px;
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.75rem;
    text-align: center;

    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }

  /* Tablet Layout */
  @media (min-width: 769px) and (max-width: 1024px) {
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 0.75rem;
  }

  /* Override MDBInput font sizes to match other inputs */
  .form-outline .form-control {
    font-size: 15px !important;
    padding: 14px 18px !important;
    border-radius: 8px !important;
    border: 1px solid
      ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")} !important;
    transition: all 0.3s ease !important;
    min-height: 48px !important;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#ffffff"} !important;
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1e293b"} !important;
    font-weight: 400 !important;
  }

  .form-outline .form-control:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#ffffff"} !important;
  }

  .form-outline .form-control:hover {
    border-color: #60a5fa !important;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#ffffff"} !important;
  }

  .form-outline .form-label {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#374151"} !important;
    margin-bottom: 0.5rem !important;
    letter-spacing: -0.025em !important;
  }

  .form-outline .form-control::placeholder {
    font-size: 14px !important;
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-muted)" : "#9ca3af"} !important;
  }

  /* Ensure textarea also gets dark mode styling */
  .form-outline .form-control.form-control-lg {
    min-height: 100px !important;
    resize: vertical !important;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#ffffff"} !important;
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1e293b"} !important;
    border: 1px solid
      ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")} !important;
  }

  /* Force dark mode styles for all MDB components */
  ${({ isDarkMode }) =>
    isDarkMode &&
    `
    .form-outline .form-control,
    .form-outline .form-control:focus,
    .form-outline .form-control:hover,
    .form-outline .form-control.form-control-lg {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-primary) !important;
    }
    
    .form-outline .form-label {
      color: var(--text-primary) !important;
    }
    
    .form-outline .form-control::placeholder {
      color: var(--text-muted) !important;
    }
  `}

  /* TextArea specific styles */
  .form-outline .form-control.form-control-lg {
    min-height: 100px !important;
    resize: vertical !important;
  }

  /* Additional dark mode overrides for MDB components */
  ${({ isDarkMode }) =>
    isDarkMode &&
    `
    /* Force all form controls to use dark mode */
    .form-outline .form-control,
    .form-outline .form-control:focus,
    .form-outline .form-control:hover,
    .form-outline .form-control.form-control-lg,
    .form-outline .form-control:not(:placeholder-shown) {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-primary) !important;
    }
    
    /* Ensure labels are visible */
    .form-outline .form-label,
    .form-outline .form-label.active {
      color: var(--text-primary) !important;
    }
    
    /* Placeholder text */
    .form-outline .form-control::placeholder {
      color: var(--text-muted) !important;
    }
    
    /* Focus state */
    .form-outline .form-control:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    /* Hover state */
    .form-outline .form-control:hover {
      border-color: #60a5fa !important;
    }
  `}
`;

const PhotoUploadSection = styled.div`
  margin-bottom: 20px;
  padding: 24px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"};
  border-radius: 10px;
  border: 2px dashed
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-accent)" : "#cbd5e1")};
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    background: ${({ isDarkMode }) =>
      isDarkMode
        ? "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)"
        : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"};
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const PhotoLabel = styled.label`
  display: block;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  letter-spacing: -0.025em;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
`;

const PhotoInputWrapper = styled.div`
  position: relative;
`;

const PhotoInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const PhotoInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px dashed
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-accent)" : "#cbd5e1")};
  border-radius: 8px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--card-bg)" : "white"};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
  box-sizing: border-box;

  &:hover {
    border-color: #3b82f6;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-secondary)" : "#f0f9ff"};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.1);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 48px;
    gap: 10px;
  }
`;

const PhotoIcon = styled.div`
  font-size: 18px;
  color: #64748b;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const PhotoText = styled.span`
  font-size: 15px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-tertiary)" : "#475569"};
  flex: 1;
  font-weight: 500;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* Mobile Layout */
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const DropdownLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#374151"};
  margin-bottom: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  /* Mobile Layout */
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "white"};
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  box-sizing: border-box;
  font-weight: 500;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #3b82f6;
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-tertiary)" : "#f8fafc"};
  }

  /* Force dark mode styles for all MDB components */
  ${({ isDarkMode }) =>
    isDarkMode &&
    `
    .form-outline .form-control,
    .form-outline .form-control:focus,
    .form-outline .form-control:hover,
    .form-outline .form-control.form-control-lg {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-primary) !important;
    }
    
    .form-outline .form-label {
      color: var(--text-primary) !important;
    }
    
    .form-outline .form-control::placeholder {
      color: var(--text-muted) !important;
    }
  `}
`;

const DropdownButtonText = styled.span`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropdownArrow = styled.span`
  font-size: 14px;
  color: ${({ isOpen }) => (isOpen ? "#3b82f6" : "#9ca3af")};
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--bg-secondary)" : "white"};
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  max-height: 160px;
  overflow-y: auto;
  margin-top: 4px;
  padding: 4px 0;
  list-style: none;
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  font-weight: 400;

  /* Force dark mode styles for all MDB components */
  ${({ isDarkMode }) =>
    isDarkMode &&
    `
    .form-outline .form-control,
    .form-outline .form-control:focus,
    .form-outline .form-control:hover,
    .form-outline .form-control.form-control-lg {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-primary) !important;
    }
    
    .form-outline .form-label {
      color: var(--text-primary) !important;
    }
    
    .form-outline .form-control::placeholder {
      color: var(--text-muted) !important;
    }
  `}
`;

const DropdownItem = styled.li`
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: ${({ isSelected, isDarkMode }) =>
    isSelected
      ? isDarkMode
        ? "var(--bg-tertiary)"
        : "#f0f9ff"
      : "transparent"};
  color: ${({ isSelected, isDarkMode }) =>
    isSelected
      ? isDarkMode
        ? "var(--text-primary)"
        : "#1d4ed8"
      : isDarkMode
      ? "var(--text-primary)"
      : "#1e293b"};
  font-weight: ${({ isSelected }) => (isSelected ? 600 : 400)};
  font-size: 13px;
  line-height: 1.4;

  &:hover {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--bg-tertiary)" : "#f0f9ff"};
    color: ${({ isDarkMode }) =>
      isDarkMode ? "var(--text-primary)" : "#1d4ed8"};
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  /* Force dark mode styles for all MDB components */
  ${({ isDarkMode }) =>
    isDarkMode &&
    `
    .form-outline .form-control,
    .form-outline .form-control:focus,
    .form-outline .form-control:hover,
    .form-outline .form-control.form-control-lg {
      background-color: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-primary) !important;
    }
    
    .form-outline .form-label {
      color: var(--text-primary) !important;
    }
    
    .form-outline .form-control::placeholder {
      color: var(--text-muted) !important;
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "var(--border-primary)" : "#e2e8f0")};

  /* Mobile Layout */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2),
    0 2px 4px -1px rgba(59, 130, 246, 0.1);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.3),
      0 4px 6px -2px rgba(59, 130, 246, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    padding: 16px 24px;
    font-size: 1rem;
    min-height: 52px;
  }
`;

const CancelButton = styled.button`
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  box-shadow: 0 4px 6px -1px rgba(100, 116, 139, 0.2),
    0 2px 4px -1px rgba(100, 116, 139, 0.1);

  &:hover {
    background: linear-gradient(135deg, #475569 0%, #374151 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(100, 116, 139, 0.3),
      0 4px 6px -2px rgba(100, 116, 139, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    width: 100%;
    padding: 16px 24px;
    font-size: 1rem;
    min-height: 52px;
  }
`;
