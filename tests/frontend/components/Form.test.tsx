import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Form, FormInput, FormLabel, FormError } from 'src/frontend/components/ui/Form';
import { ThemeProvider } from 'src/shared/contexts/index';

const renderWithTheme = (ui: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Form Components', () => {
  test('Form component renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <Form data-testid="test-form">
        <div>Form content</div>
      </Form>
    );
    const formElement = getByTestId('test-form');
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveTextContent('Form content');
  });

  test('Form component calls onSubmit when submitted', () => {
    const mockSubmit = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Form onSubmit={mockSubmit} data-testid="test-form">
        <button type="submit">Submit</button>
      </Form>
    );
    const formElement = getByTestId('test-form');
    fireEvent.submit(formElement);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test('FormInput renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <FormInput
        type="text"
        name="testInput"
        value="Test Value"
        placeholder="Enter text"
        data-testid="test-input"
      />
    );
    const inputElement = getByTestId('test-input') as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.type).toBe('text');
    expect(inputElement.name).toBe('testInput');
    expect(inputElement.value).toBe('Test Value');
    expect(inputElement.placeholder).toBe('Enter text');
  });

  test('FormInput handles onChange event', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <FormInput
        type="text"
        name="testInput"
        onChange={mockOnChange}
        data-testid="test-input"
      />
    );
    const inputElement = getByTestId('test-input');
    fireEvent.change(inputElement, { target: { value: 'New Value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object));
  });

  test('FormLabel renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <FormLabel htmlFor="testInput" data-testid="test-label">
        Test Label
      </FormLabel>
    );
    const labelElement = getByTestId('test-label');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'testInput');
    expect(labelElement).toHaveTextContent('Test Label');
  });

  test('FormError renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <FormError data-testid="test-error">Error message</FormError>
    );
    const errorElement = getByTestId('test-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent('Error message');
    expect(errorElement).toHaveClass('text-red-500'); // Assuming error messages are styled with red text
  });

  test('Form components integrate correctly', () => {
    const mockSubmit = jest.fn();
    const { getByLabelText, getByText, getByTestId } = renderWithTheme(
      <Form onSubmit={mockSubmit} data-testid="test-form">
        <FormLabel htmlFor="testInput">Test Input</FormLabel>
        <FormInput
          type="text"
          name="testInput"
          id="testInput"
          data-testid="test-input"
        />
        <FormError data-testid="test-error">Input is required</FormError>
        <button type="submit">Submit</button>
      </Form>
    );

    const formElement = getByTestId('test-form');
    const inputElement = getByLabelText('Test Input');
    const errorElement = getByTestId('test-error');
    const submitButton = getByText('Submit');

    expect(formElement).toContainElement(inputElement);
    expect(formElement).toContainElement(errorElement);
    expect(formElement).toContainElement(submitButton);

    fireEvent.change(inputElement, { target: { value: 'Test Value' } });
    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test('Form components apply correct theme styles', () => {
    const { getByTestId, rerender } = renderWithTheme(
      <Form data-testid="test-form">
        <FormInput data-testid="test-input" />
      </Form>
    );

    const formElement = getByTestId('test-form');
    const inputElement = getByTestId('test-input');

    // Light theme
    expect(formElement).toHaveClass('bg-white');
    expect(inputElement).toHaveClass('border-gray-300');

    // Dark theme
    rerender(
      <ThemeProvider theme="dark">
        <Form data-testid="test-form">
          <FormInput data-testid="test-input" />
        </Form>
      </ThemeProvider>
    );

    expect(formElement).toHaveClass('bg-gray-800');
    expect(inputElement).toHaveClass('border-gray-600');
  });
});