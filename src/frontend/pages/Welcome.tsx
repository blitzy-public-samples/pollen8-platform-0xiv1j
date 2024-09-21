import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomePage from 'src/frontend/components/WelcomePage';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';

export const Welcome: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      // TODO: Implement phone number submission logic
      console.log('Phone number submitted:', phoneNumber);
      // Navigate to verification page or next step
      navigate('/verify');
    } catch (error) {
      console.error('Error submitting phone number:', error);
      // TODO: Implement error handling
    }
  };

  return (
    <WelcomePage
      theme={theme}
      onPhoneSubmit={handlePhoneSubmit}
    />
  );
};