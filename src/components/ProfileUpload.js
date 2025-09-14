import React, { useState, useRef } from "react";
import styled from "styled-components";
import { MDBIcon } from "mdb-react-ui-kit";
import { useTheme } from "../contexts/ThemeContext";
import { getProfilePictureUrl } from "../utils/profilePicture";

const ProfileUpload = ({
  employeeId,
  currentPhoto,
  onPhotoUpload,
  onPhotoRemove,
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG or PNG)");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(
        `/api/profile-picture/upload/${employeeId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload photo");
      }

      const result = await response.json();
      onPhotoUpload(result.data.profilePictureUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhoto) return;

    try {
      const response = await fetch(`/api/profile-picture/${employeeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove photo");
      }

      onPhotoRemove();
    } catch (err) {
      setError(err.message);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <Title>Profile Picture</Title>

      <UploadArea
        isDarkMode={isDarkMode}
        isDragging={isDragging}
        hasPhoto={!!currentPhoto}
        onClick={!disabled ? openFileDialog : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
      >
        {currentPhoto ? (
          <PhotoPreview>
            <PhotoImage
              src={getProfilePictureUrl(currentPhoto)}
              alt="Profile"
            />
            {!disabled && (
              <PhotoOverlay>
                <UploadIcon>
                  <MDBIcon fas icon="camera" />
                </UploadIcon>
                <UploadText>Click to change photo</UploadText>
              </PhotoOverlay>
            )}
          </PhotoPreview>
        ) : (
          <UploadPrompt isDarkMode={isDarkMode}>
            <UploadIcon>
              <MDBIcon fas icon="user-plus" />
            </UploadIcon>
            <UploadText>
              {isDragging ? "Drop image here" : "Click to upload or drag image"}
            </UploadText>
            <UploadSubtext>JPG or PNG, max 2MB</UploadSubtext>
          </UploadPrompt>
        )}

        {uploading && (
          <LoadingOverlay>
            <MDBIcon fas icon="spinner" spin size="2x" />
            <LoadingText>Uploading...</LoadingText>
          </LoadingOverlay>
        )}
      </UploadArea>

      {error && (
        <ErrorMessage>
          <MDBIcon fas icon="exclamation-triangle" />
          {error}
        </ErrorMessage>
      )}

      {currentPhoto && !disabled && (
        <ActionButtons isDarkMode={isDarkMode}>
          <ChangeButton onClick={openFileDialog}>
            <MDBIcon fas icon="camera" />
            Change Photo
          </ChangeButton>
          <RemoveButton onClick={handleRemovePhoto}>
            <MDBIcon fas icon="trash" />
            Remove
          </RemoveButton>
        </ActionButtons>
      )}

      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInputChange}
        disabled={disabled || uploading}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
  margin: 0;
`;

const UploadArea = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed
    ${({ isDarkMode, isDragging, hasPhoto }) =>
      isDragging
        ? isDarkMode
          ? "var(--btn-primary)"
          : "#3b82f6"
        : hasPhoto
        ? "transparent"
        : isDarkMode
        ? "var(--border-primary)"
        : "#e2e8f0"};
  border-radius: 16px;
  background: ${({ isDarkMode, hasPhoto }) =>
    hasPhoto ? "transparent" : isDarkMode ? "var(--bg-secondary)" : "#f8fafc"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover:not(:disabled) {
    border-color: ${({ isDarkMode, hasPhoto }) =>
      hasPhoto ? "transparent" : isDarkMode ? "var(--btn-primary)" : "#3b82f6"};
    background: ${({ isDarkMode, hasPhoto }) =>
      hasPhoto ? "transparent" : isDarkMode ? "var(--bg-tertiary)" : "#f1f5f9"};
  }

  ${({ isDragging }) =>
    isDragging &&
    `
    border-color: #3b82f6;
    background: #eff6ff;
    transform: scale(1.02);
  `}
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
`;

const PhotoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 14px;

  ${UploadArea}:hover & {
    opacity: 1;
  }
`;

const UploadPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 20px;
  text-align: center;
`;

const UploadIcon = styled.div`
  font-size: 32px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
`;

const UploadText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-primary)" : "#1e293b"};
`;

const UploadSubtext = styled.div`
  font-size: 12px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? "var(--text-secondary)" : "#64748b"};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  border-radius: 14px;
`;

const LoadingText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ChangeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-1px);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

export default ProfileUpload;
