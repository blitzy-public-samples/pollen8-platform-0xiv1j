import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Welcome } from 'src/frontend/pages/Welcome';
import { AuthContext, ThemeContext } from 'src/shared/contexts/index';
import { MemoryRouter } from 'react-router-dom';

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
          <Welcome {...props} />
        </MemoryRouter>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

describe('Welcome Page', () => {
  test('renders welcome page correctly', () => {
    renderWithContexts();
    expect(screen.getByText('POLLEN8')).toBeInTheDocument();
    expect(screen.getByText('GET CONNECTED')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
  });

  test('animates POLLEN8 text', async () => {
    jest.useFakeTimers();
    renderWithContexts();
    const pollen8Text = screen.getByText('POLLEN8');
    expect(pollen8Text).toHaveClass('animate-fade-in');
    act(() => {
      jest.advanceTimersByTime(1000); // Assuming 1000ms animation duration
    });
    expect(pollen8Text).toHaveClass('animate-pulse');
    jest.useRealTimers();
  });

  test('handles phone number input correctly', () => {
    renderWithContexts();
    const input = screen.getByPlaceholderText('Enter your phone number');
    fireEvent.change(input, { target: { value: '1234567890' } });
    expect(input).toHaveValue('1234567890');
  });

  test('submits phone number when GET CONNECTED is clicked', () => {
    const mockHandlePhoneSubmit = jest.fn();
    renderWithContexts({ handlePhoneSubmit: mockHandlePhoneSubmit });
    const input = screen.getByPlaceholderText('Enter your phone number');
    const button = screen.getByText('GET CONNECTED');
    fireEvent.change(input, { target: { value: '1234567890' } });
    fireEvent.click(button);
    expect(mockHandlePhoneSubmit).toHaveBeenCalledWith('1234567890');
  });

  test('displays error for invalid phone number', () => {
    renderWithContexts();
    const input = screen.getByPlaceholderText('Enter your phone number');
    const button = screen.getByText('GET CONNECTED');
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });

  test('applies correct theme styles', () => {
    const { rerender } = renderWithContexts();
    expect(screen.getByTestId('welcome-container')).toHaveClass('bg-white text-black');
    
    const darkThemeContext = {
      theme: 'dark',
      toggleTheme: jest.fn(),
    };

    rerender(
      <AuthContext.Provider value={{ user: null, login: jest.fn(), logout: jest.fn() }}>
        <ThemeContext.Provider value={darkThemeContext}>
          <MemoryRouter>
            <Welcome />
          </MemoryRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('welcome-container')).toHaveClass('bg-black text-white');
  });

  test('redirects authenticated users', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    const authenticatedAuthContext = {
      user: { id: '123', phoneNumber: '1234567890' },
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(
      <AuthContext.Provider value={authenticatedAuthContext}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
          <MemoryRouter>
            <Welcome />
          </MemoryRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});