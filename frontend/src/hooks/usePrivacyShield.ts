import { useState, useEffect } from 'react';

/**
 * Custom hook that detects user idleness or tab switching
 * and triggers a privacy shield to protect PII (Personally Identifiable Information).
 * @param timeoutMs Time in milliseconds before the screen blurs due to inactivity.
 */
export function usePrivacyShield(timeoutMs = 15000) {
  const [isObscured, setIsObscured] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (isObscured) setIsObscured(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsObscured(true), timeoutMs);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsObscured(true);
      } else {
        resetTimer();
      }
    };

    // Listeners for active usage
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer, true);
    document.addEventListener('visibilitychange', handleVisibility);

    // Initial setup
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(timeoutId);
    };
  }, [timeoutMs, isObscured]);

  return isObscured;
}
