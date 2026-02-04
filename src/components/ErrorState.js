import React from 'react';
import styled from 'styled-components';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../utils/errorHandler';

const Container = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  max-width: 420px;
  margin: 0 auto;
`;

const IconWrap = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${(p) => p.theme.colors.error}15;
  color: ${(p) => p.theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

const Title = styled.h3`
  font-size: ${(p) => p.theme.fontSize.xl};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: ${(p) => p.theme.fontSize.sm};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.textInverse};
  border: none;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: ${(p) => p.theme.fontWeight.medium};
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: ${(p) => p.theme.colors.primaryHover};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.colors.primary};
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

/**
 * Reusable error state with optional retry.
 * @param {string} title - Short title (e.g. "Something went wrong")
 * @param {string} message - User-friendly message (optional; derived from error if not provided)
 * @param {Function} onRetry - Called when user clicks Retry (optional; hides button if not provided)
 * @param {boolean} isRetrying - Disable button and show loading state
 * @param {Error|Object} error - Optional error object; message can be derived via getErrorMessage
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  isRetrying = false,
  error,
}) {
  const displayMessage =
    message ||
    (error && typeof error === 'object' ? getErrorMessage(error) : null) ||
    'Please try again.';

  return (
    <Container role="alert">
      <IconWrap>
        <AlertCircle size={28} aria-hidden />
      </IconWrap>
      <Title>{title}</Title>
      <Message>{displayMessage}</Message>
      {typeof onRetry === 'function' && (
        <RetryButton type="button" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Retrying…' : 'Try again'}
        </RetryButton>
      )}
    </Container>
  );
}
