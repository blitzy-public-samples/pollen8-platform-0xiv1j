import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'src/frontend/components/ui/Button';
import { FormInput } from 'src/frontend/components/ui/Form';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { validatePhoneNumber } from 'src/shared/utils/index';
import { ANIMATION_DURATIONS } from 'src/shared/constants/index';

export const WelcomePage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [animationState, setAnimationState] = useState('fade-in');
  const [error, setError] = useState('');

  const { theme } = useThemeContext();
  const { sendVerificationCode } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimationState(prev => prev === 'fade-in' ? 'fade-out' : 'fade-in');
    }, ANIMATION_DURATIONS.PULSE);

    return () => clearInterval(animationInterval);
  }, []);

  const handlePhoneSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      await sendVerificationCode(phoneNumber);
      navigate('/verify', { state: { phoneNumber } });
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    }
  };

  const containerClasses = `min-h-screen flex flex-col items-center justify-center bg-${theme === 'light' ? 'white' : 'black'} text-${theme === 'light' ? 'black' : 'white'}`;
  const titleClasses = `text-6xl font-bold mb-8 ${animationState === 'fade-in' ? 'opacity-100' : 'opacity-50'} transition-opacity duration-${ANIMATION_DURATIONS.FADE}`;

  return (
    <div className={containerClasses}>
      <h1 className={titleClasses}>POLLEN8</h1>
      <Button 
        onClick={handlePhoneSubmit} 
        variant="primary" 
        size="large" 
        className="mb-4"
      >
        GET CONNECTED
      </Button>
      <FormInput
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter your phone number"
        className="mb-2"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <p className="text-sm">Enter your phone number to get started</p>
    </div>
  );
};