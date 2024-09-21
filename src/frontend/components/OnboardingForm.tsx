import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormInput, FormLabel, FormError } from 'src/frontend/components/ui/Form';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import { useApi } from 'src/shared/hooks/index';
import { Industry, Interest } from 'src/shared/types/index';
import { MAX_INDUSTRIES, MAX_INTERESTS } from 'src/shared/constants/index';

interface OnboardingFormData {
  industries: string[];
  interests: string[];
  zipCode: string;
}

export const OnboardingForm: React.FC = () => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    industries: [],
    interests: [],
    zipCode: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  const { theme } = useThemeContext();
  const { user, updateUser } = useAuthContext();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    if (user && user.industries && user.interests) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const industriesData = await api.get<Industry[]>('/industries');
        const interestsData = await api.get<Interest[]>('/interests');
        setIndustries(industriesData);
        setInterests(interestsData);
      } catch (error) {
        setErrors(['Failed to fetch industries and interests. Please try again.']);
      }
    };
    fetchData();
  }, [api]);

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        await updateUser(formData);
        navigate('/dashboard');
      } catch (error) {
        setErrors(['Failed to update user profile. Please try again.']);
      }
    }
  };

  const validateStep = () => {
    const newErrors: string[] = [];
    switch (currentStep) {
      case 0:
        if (formData.industries.length === 0) {
          newErrors.push('Please select at least one industry.');
        } else if (formData.industries.length > MAX_INDUSTRIES) {
          newErrors.push(`Please select no more than ${MAX_INDUSTRIES} industries.`);
        }
        break;
      case 1:
        if (formData.interests.length === 0) {
          newErrors.push('Please select at least one interest.');
        } else if (formData.interests.length > MAX_INTERESTS) {
          newErrors.push(`Please select no more than ${MAX_INTERESTS} interests.`);
        }
        break;
      case 2:
        if (!formData.zipCode) {
          newErrors.push('Please enter a ZIP code.');
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
          newErrors.push('Please enter a valid ZIP code.');
        }
        break;
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const renderIndustryStep = () => (
    <>
      <FormLabel htmlFor="industries">Select your industries (max {MAX_INDUSTRIES})</FormLabel>
      {industries.map((industry) => (
        <Button
          key={industry.id}
          onClick={() => {
            const updatedIndustries = formData.industries.includes(industry.id)
              ? formData.industries.filter((id) => id !== industry.id)
              : [...formData.industries, industry.id];
            setFormData({ ...formData, industries: updatedIndustries });
          }}
          variant={formData.industries.includes(industry.id) ? 'primary' : 'secondary'}
        >
          {industry.name}
        </Button>
      ))}
    </>
  );

  const renderInterestStep = () => (
    <>
      <FormLabel htmlFor="interests">Select your interests (max {MAX_INTERESTS})</FormLabel>
      {interests.map((interest) => (
        <Button
          key={interest.id}
          onClick={() => {
            const updatedInterests = formData.interests.includes(interest.id)
              ? formData.interests.filter((id) => id !== interest.id)
              : [...formData.interests, interest.id];
            setFormData({ ...formData, interests: updatedInterests });
          }}
          variant={formData.interests.includes(interest.id) ? 'primary' : 'secondary'}
        >
          {interest.name}
        </Button>
      ))}
    </>
  );

  const renderZipCodeStep = () => (
    <>
      <FormLabel htmlFor="zipCode">Enter your ZIP code</FormLabel>
      <FormInput
        type="text"
        id="zipCode"
        value={formData.zipCode}
        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
        placeholder="Enter ZIP code"
      />
    </>
  );

  const renderProgressIndicator = () => (
    <div className="flex justify-between mb-4">
      {['Industries', 'Interests', 'ZIP Code'].map((step, index) => (
        <div
          key={step}
          className={`w-1/3 text-center ${
            index === currentStep ? 'text-primary font-bold' : 'text-gray-400'
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`max-w-md mx-auto p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {renderProgressIndicator()}
      <Form onSubmit={(e) => e.preventDefault()}>
        {currentStep === 0 && renderIndustryStep()}
        {currentStep === 1 && renderInterestStep()}
        {currentStep === 2 && renderZipCodeStep()}
        {errors.map((error, index) => (
          <FormError key={index}>{error}</FormError>
        ))}
        <div className="flex justify-between mt-4">
          {currentStep > 0 && (
            <Button onClick={handlePreviousStep} variant="secondary">
              Previous
            </Button>
          )}
          {currentStep < 2 && (
            <Button onClick={handleNextStep} variant="primary">
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button onClick={handleSubmit} variant="primary">
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};