import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Onboarding } from 'src/frontend/pages/Onboarding';
import { AuthContext, ThemeContext } from 'src/shared/contexts/index';
import { MemoryRouter } from 'react-router-dom';
import { useApi } from 'src/shared/hooks/index';

// Mock the useApi hook
jest.mock('src/shared/hooks/index', () => ({
  useApi: jest.fn(),
}));

const renderWithContexts = (props = {}) => {
  const mockAuthContext = {
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockThemeContext = {
    theme: 'light',
    toggleTheme: jest.fn(),
  };

  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <ThemeContext.Provider value={mockThemeContext}>
        <MemoryRouter>
          <Onboarding {...props} />
        </MemoryRouter>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

describe('Onboarding Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue({ data: null, error: null, isLoading: false });
  });

  test('renders onboarding form correctly', () => {
    renderWithContexts();
    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    expect(screen.getByText('Select Your Industries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('handles industry selection correctly', () => {
    renderWithContexts();
    const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
    fireEvent.click(industryOptions[0]);
    fireEvent.click(industryOptions[1]);
    expect(industryOptions[0]).toBeChecked();
    expect(industryOptions[1]).toBeChecked();

    // Assuming MAX_INDUSTRIES is 3
    fireEvent.click(industryOptions[2]);
    fireEvent.click(industryOptions[3]);
    expect(industryOptions[3]).not.toBeChecked();
  });

  test('navigates to interest selection step', () => {
    renderWithContexts();
    const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
    fireEvent.click(industryOptions[0]);
    fireEvent.click(industryOptions[1]);
    fireEvent.click(industryOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Select Your Interests')).toBeInTheDocument();
  });

  test('handles interest selection correctly', () => {
    renderWithContexts();
    // Navigate to interest step
    const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
    fireEvent.click(industryOptions[0]);
    fireEvent.click(industryOptions[1]);
    fireEvent.click(industryOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    const interestOptions = screen.getAllByRole('checkbox', { name: /interest/i });
    fireEvent.click(interestOptions[0]);
    fireEvent.click(interestOptions[1]);
    expect(interestOptions[0]).toBeChecked();
    expect(interestOptions[1]).toBeChecked();

    // Assuming MAX_INTERESTS is 3
    fireEvent.click(interestOptions[2]);
    fireEvent.click(interestOptions[3]);
    expect(interestOptions[3]).not.toBeChecked();
  });

  test('navigates to ZIP code input step', () => {
    renderWithContexts();
    // Navigate to interest step
    const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
    fireEvent.click(industryOptions[0]);
    fireEvent.click(industryOptions[1]);
    fireEvent.click(industryOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Select interests
    const interestOptions = screen.getAllByRole('checkbox', { name: /interest/i });
    fireEvent.click(interestOptions[0]);
    fireEvent.click(interestOptions[1]);
    fireEvent.click(interestOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Enter Your ZIP Code')).toBeInTheDocument();
  });

  test('handles ZIP code input correctly', () => {
    renderWithContexts();
    // Navigate to ZIP code step
    act(() => {
      const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
      fireEvent.click(industryOptions[0]);
      fireEvent.click(industryOptions[1]);
      fireEvent.click(industryOptions[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      const interestOptions = screen.getAllByRole('checkbox', { name: /interest/i });
      fireEvent.click(interestOptions[0]);
      fireEvent.click(interestOptions[1]);
      fireEvent.click(interestOptions[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    const zipCodeInput = screen.getByLabelText('ZIP Code');
    fireEvent.change(zipCodeInput, { target: { value: '12345' } });
    expect(zipCodeInput).toHaveValue('12345');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  test('submits form data correctly', async () => {
    const mockHandleOnboardingSubmit = jest.fn();
    renderWithContexts({ handleOnboardingSubmit: mockHandleOnboardingSubmit });

    // Complete all steps
    act(() => {
      const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
      fireEvent.click(industryOptions[0]);
      fireEvent.click(industryOptions[1]);
      fireEvent.click(industryOptions[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      const interestOptions = screen.getAllByRole('checkbox', { name: /interest/i });
      fireEvent.click(interestOptions[0]);
      fireEvent.click(interestOptions[1]);
      fireEvent.click(interestOptions[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      const zipCodeInput = screen.getByLabelText('ZIP Code');
      fireEvent.change(zipCodeInput, { target: { value: '12345' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    expect(mockHandleOnboardingSubmit).toHaveBeenCalledWith({
      industries: ['Industry 1', 'Industry 2', 'Industry 3'],
      interests: ['Interest 1', 'Interest 2', 'Interest 3'],
      zipCode: '12345',
    });
  });

  test('displays error for invalid inputs', () => {
    renderWithContexts();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Please select at least 3 industries')).toBeInTheDocument();

    // Navigate to interest step
    const industryOptions = screen.getAllByRole('checkbox', { name: /industry/i });
    fireEvent.click(industryOptions[0]);
    fireEvent.click(industryOptions[1]);
    fireEvent.click(industryOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Please select at least 3 interests')).toBeInTheDocument();

    // Navigate to ZIP code step
    const interestOptions = screen.getAllByRole('checkbox', { name: /interest/i });
    fireEvent.click(interestOptions[0]);
    fireEvent.click(interestOptions[1]);
    fireEvent.click(interestOptions[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByText('Please enter a valid ZIP code')).toBeInTheDocument();
  });

  test('applies correct theme styles', () => {
    const { rerender } = renderWithContexts();
    expect(screen.getByTestId('onboarding-container')).toHaveClass('bg-white text-black');

    rerender(
      <AuthContext.Provider value={{ user: null, login: jest.fn(), logout: jest.fn() }}>
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: jest.fn() }}>
          <MemoryRouter>
            <Onboarding />
          </MemoryRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('onboarding-container')).toHaveClass('bg-gray-900 text-white');
  });

  test('handles API errors gracefully', async () => {
    (useApi as jest.Mock).mockReturnValue({ data: null, error: 'API Error', isLoading: false });
    renderWithContexts();

    expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});