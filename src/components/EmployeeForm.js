import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MDBInput, MDBTextArea, MDBIcon } from "mdb-react-ui-kit";
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
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

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        position: initialData.position || "",
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
  }, [initialData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings to null for optional fields before submitting
      const cleanFormData = { ...formData };

      // Convert empty strings to null for optional fields
      const optionalFields = [
        "gender",
        "role",
        "status",
        "payMethod",
        "address",
        "position",
        "department",
        "payRate",
        "pin",
      ];
      optionalFields.forEach((field) => {
        if (cleanFormData[field] === "") {
          cleanFormData[field] = null;
        }
      });

      await onSubmit(cleanFormData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{title}</FormTitle>
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
            <SelectWrapper>
              <SelectLabel>Gender</SelectLabel>
              <SelectInput
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </SelectInput>
            </SelectWrapper>
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
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
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
            <SelectWrapper>
              <SelectLabel>Role</SelectLabel>
              <SelectInput
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                {
                  // If current user is manager, hide Admin option
                  createdBy && window?.CURRENT_USER_ROLE === "manager" ? (
                    <>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </>
                  ) : (
                    <>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </>
                  )
                }
              </SelectInput>
            </SelectWrapper>
          </FormGroup>
          <FormGroup>
            <SelectWrapper>
              <SelectLabel>Status</SelectLabel>
              <SelectInput
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectInput>
            </SelectWrapper>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <MDBInput
              label="Pay Rate"
              name="payRate"
              value={formData.payRate}
              onChange={handleInputChange}
              placeholder="e.g., $15.00/hour"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <SelectWrapper>
              <SelectLabel>Pay Method</SelectLabel>
              <SelectInput
                name="payMethod"
                value={formData.payMethod}
                onChange={handleInputChange}
              >
                <option value="">Select Pay Method</option>
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
                <option value="commission">Commission</option>
              </SelectInput>
            </SelectWrapper>
          </FormGroup>
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

        <PhotoUploadSection>
          <PhotoLabel>Employee Photo</PhotoLabel>
          <PhotoInputWrapper>
            <PhotoInput
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              id="photo-upload"
            />
            <PhotoInputLabel htmlFor="photo-upload">
              <PhotoIcon>
                <MDBIcon fas icon="camera" />
              </PhotoIcon>
              <PhotoText>
                {formData.photo ? formData.photo.name : "Choose a photo"}
              </PhotoText>
            </PhotoInputLabel>
          </PhotoInputWrapper>
        </PhotoUploadSection>

        <ButtonGroup>
          <SubmitButton type="submit">{submitButtonText}</SubmitButton>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default EmployeeForm;

// Styled Components
const FormContainer = styled.div`
  background-color: #ffffff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
`;

const FormTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #1976d2, #42a5f5);
    border-radius: 1px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FormGroup = styled.div`
  flex: 1;

  /* Override MDBInput font sizes to match other inputs */
  .form-outline .form-control {
    font-size: 13px !important;
  }

  .form-outline .form-label {
    font-size: 13px !important;
  }

  .form-outline .form-control::placeholder {
    font-size: 13px !important;
  }
`;

const PhotoUploadSection = styled.div`
  margin-bottom: 12px;
`;

const PhotoLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
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
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
  height: 36px;
  box-sizing: border-box;

  &:hover {
    border-color: #1976d2;
  }
`;

const PhotoIcon = styled.div`
  font-size: 14px;
  color: #666;
`;

const PhotoText = styled.span`
  font-size: 13px;
  color: #333;
  flex: 1;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectLabel = styled.label`
  position: absolute;
  top: -8px;
  left: 12px;
  background: white;
  padding: 0 4px;
  font-size: 12px;
  color: #666;
  z-index: 1;
`;

const DateWrapper = styled.div`
  position: relative;
`;

const DateLabel = styled.label`
  position: absolute;
  top: -8px;
  left: 12px;
  background: white;
  padding: 0 4px;
  font-size: 12px;
  color: #666;
  z-index: 1;
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  color: #333;
  transition: border-color 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  padding-right: 30px;
  height: 36px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }

  &:hover {
    border-color: #1976d2;
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  color: #333;
  transition: border-color 0.2s ease;
  height: 36px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }

  &:hover {
    border-color: #1976d2;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  &::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const SubmitButton = styled.button`
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1565c0;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5a6268;
  }
`;
