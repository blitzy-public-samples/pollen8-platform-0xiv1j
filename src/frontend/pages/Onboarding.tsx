import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from 'src/frontend/components/OnboardingForm';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';

const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleOnboardingSubmit = async (formData: object) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/onboarding', formData);
      updateUser({ ...user, ...response.data, onboardingCompleted: true });
      navigate('/dashboard');
    } catch (err) {
      setError('An error occurred during onboarding. Please try again.');
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`onboarding-container ${theme}`}>
      <h1>Welcome to Pollen8</h1>
      <p>Let's get your profile set up!</p>
      {error && <div className="error-message">{error}</div>}
      <OnboardingForm
        onSubmit={handleOnboardingSubmit}
        isLoading={isLoading}
        theme={theme}
      />
    </div>
  );
};

export default Onboarding;