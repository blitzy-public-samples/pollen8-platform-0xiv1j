import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Modal } from 'src/frontend/components/ui/Modal';
import { ThemeProvider } from 'src/shared/contexts/index';

const renderWithTheme = (ui: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Modal component', () => {
  test('renders modal when isOpen is true', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('opacity-100');
  });

  test('does not render modal when isOpen is false', () => {
    renderWithTheme(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    renderWithTheme(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('renders modal title correctly', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}} title="Custom Title">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('renders modal content correctly', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Custom content</p>
        <button>Action button</button>
      </Modal>
    );
    
    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(screen.getByText('Action button')).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" className="custom-class">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('custom-class');
  });

  test('handles keyboard events correctly', () => {
    const onCloseMock = jest.fn();
    renderWithTheme(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('focuses on first focusable element when opened', () => {
    const { rerender } = renderWithTheme(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );

    rerender(
      <ThemeProvider>
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      </ThemeProvider>
    );

    expect(screen.getByText('First button')).toHaveFocus();
  });
});