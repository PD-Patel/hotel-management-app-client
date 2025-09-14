import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MDBIcon } from 'mdb-react-ui-kit';
import { useTheme } from '../contexts/ThemeContext';

const PinPromptModal = ({ 
  isOpen, 
  onClose, 
  onPinSubmit, 
  action = 'clock-in', 
  employeeName = '',
  siteId,
  loading = false 
}) => {
  const { isDarkMode } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const pinInputRef = useRef(null);
  const maxAttempts = 3;
  const lockoutDuration = 300000; // 5 minutes in milliseconds

  useEffect(() => {
    if (isOpen && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isLocked) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setAttempts(0);
            setError('');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked]);

  const handlePinChange = (e) => {
    const value = e.target.value;
    
    // Only allow 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
      setError('');
      
      // Auto-submit when 4 digits are entered
      if (value.length === 4) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (isLocked) {
      return;
    }

    try {
      const success = await onPinSubmit(pin, action, siteId);
      
      if (success) {
        setPin('');
        setError('');
        setAttempts(0);
        onClose();
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
      setLockoutTime(lockoutDuration);
      setError(`Too many failed attempts. Please wait ${Math.ceil(lockoutDuration / 60000)} minutes.`);
    } else {
      setError(`Invalid PIN. ${maxAttempts - newAttempts} attempts remaining.`);
    }
    
    setPin('');
    if (pinInputRef.current) {
      pinInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatLockoutTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} isDarkMode={isDarkMode}>
        <ModalHeader isDarkMode={isDarkMode}>
          <ModalTitle>
            <ActionIcon action={action}>
              <MDBIcon fas icon={action === 'clock-in' ? 'sign-in-alt' : 'sign-out-alt'} />
            </ActionIcon>
            {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
          </ModalTitle>
          <CloseButton onClick={onClose} disabled={isLocked}>
            <MDBIcon fas icon="times" />
          </CloseButton>
        </ModalHeader>

        <ModalBody isDarkMode={isDarkMode}>
          {employeeName && (
            <EmployeeInfo isDarkMode={isDarkMode}>
              <EmployeeName>{employeeName}</EmployeeName>
              <EmployeeLabel>Employee</EmployeeLabel>
            </EmployeeInfo>
          )}

          <PinSection isDarkMode={isDarkMode}>
            <PinLabel>Enter your 4-digit PIN</PinLabel>
            <PinInputContainer>
              <PinInput
                ref={pinInputRef}
                type="password"
                value={pin}
                onChange={handlePinChange}
                onKeyPress={handleKeyPress}
                placeholder="0000"
                maxLength={4}
                disabled={isLocked || loading}
                isDarkMode={isDarkMode}
                hasError={!!error}
              />
              <PinMask>
                {pin.split('').map((digit, index) => (
                  <PinDigit key={index} isDarkMode={isDarkMode}>
                    {digit}
                  </PinDigit>
                ))}
                {Array.from({ length: 4 - pin.length }).map((_, index) => (
                  <PinDigit key={`empty-${index}`} isDarkMode={isDarkMode} isEmpty>
                    ○
                  </PinDigit>
                ))}
              </PinMask>
            </PinInputContainer>

            {error && (
              <ErrorMessage>
                <MDBIcon fas icon="exclamation-triangle" />
                {error}
              </ErrorMessage>
            )}

            {isLocked && (
              <LockoutMessage>
                <MDBIcon fas icon="lock" />
                Account locked for {formatLockoutTime(lockoutTime)}
              </LockoutMessage>
            )}

            {attempts > 0 && !isLocked && (
              <AttemptsInfo>
                Failed attempts: {attempts}/{maxAttempts}
              </AttemptsInfo>
            )}
          </PinSection>

          <ActionButtons isDarkMode={isDarkMode}>
            <SubmitButton
              onClick={handleSubmit}
              disabled={pin.length !== 4 || isLocked || loading}
              isDarkMode={isDarkMode}
              action={action}
            >
              {loading ? (
                <>
                  <MDBIcon fas icon="spinner" spin />
                  Processing...
                </>
              ) : (
                <>
                  <MDBIcon fas icon={action === 'clock-in' ? 'sign-in-alt' : 'sign-out-alt'} />
                  {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
                </>
              )}
            </SubmitButton>
            
            <CancelButton onClick={onClose} disabled={isLocked}>
              Cancel
            </CancelButton>
          </ActionButtons>
        </ModalBody>

        <ModalFooter isDarkMode={isDarkMode}>
          <SecurityNote>
            <MDBIcon fas icon="shield-alt" />
            Your PIN is securely encrypted and never stored in plain text
          </SecurityNote>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ isDarkMode }) => isDarkMode ? 'var(--card-bg)' : 'white'};
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 20px;
  border-bottom: 1px solid ${({ isDarkMode }) => isDarkMode ? 'var(--border-primary)' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-primary)' : '#1e293b'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionIcon = styled.span`
  color: ${({ action }) => action === 'clock-in' ? '#10b981' : '#f59e0b'};
  font-size: 18px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-secondary)' : '#64748b'};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ isDarkMode }) => isDarkMode ? 'var(--bg-secondary)' : '#f1f5f9'};
    color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-primary)' : '#1e293b'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const EmployeeInfo = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: ${({ isDarkMode }) => isDarkMode ? 'var(--bg-secondary)' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${({ isDarkMode }) => isDarkMode ? 'var(--border-primary)' : '#e2e8f0'};
`;

const EmployeeName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-primary)' : '#1e293b'};
  margin-bottom: 4px;
`;

const EmployeeLabel = styled.div`
  font-size: 12px;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-secondary)' : '#64748b'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PinSection = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const PinLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-primary)' : '#1e293b'};
  margin-bottom: 16px;
`;

const PinInputContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const PinInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
`;

const PinMask = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
`;

const PinDigit = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid ${({ isDarkMode, isEmpty }) => 
    isEmpty 
      ? (isDarkMode ? 'var(--border-primary)' : '#e2e8f0')
      : (isDarkMode ? 'var(--btn-primary)' : '#3b82f6')
  };
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: ${({ isDarkMode, isEmpty }) => 
    isEmpty 
      ? (isDarkMode ? 'var(--text-muted)' : '#cbd5e1')
      : (isDarkMode ? 'var(--text-primary)' : '#1e293b')
  };
  background: ${({ isDarkMode, isEmpty }) => 
    isEmpty 
      ? (isDarkMode ? 'var(--bg-secondary)' : '#f8fafc')
      : (isDarkMode ? 'var(--bg-tertiary)' : '#eff6ff')
  };
  transition: all 0.2s ease;
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
  margin-bottom: 16px;
`;

const LockoutMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  color: #d97706;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const AttemptsInfo = styled.div`
  font-size: 12px;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-secondary)' : '#64748b'};
  margin-bottom: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const SubmitButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: ${({ action, isDarkMode }) => 
    action === 'clock-in' 
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  padding: 14px 20px;
  background: ${({ isDarkMode }) => isDarkMode ? 'var(--bg-tertiary)' : '#e2e8f0'};
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-primary)' : '#475569'};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ isDarkMode }) => isDarkMode ? 'var(--border-primary)' : '#cbd5e1'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 24px 24px;
  border-top: 1px solid ${({ isDarkMode }) => isDarkMode ? 'var(--border-primary)' : '#e2e8f0'};
  background: ${({ isDarkMode }) => isDarkMode ? 'var(--bg-secondary)' : '#f8fafc'};
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ isDarkMode }) => isDarkMode ? 'var(--text-secondary)' : '#64748b'};
  text-align: center;
  justify-content: center;
`;

export default PinPromptModal;
