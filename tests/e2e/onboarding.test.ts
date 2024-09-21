import cypress from 'cypress';
import { User } from 'src/backend/models/User';
import { Industry } from 'src/backend/models/Industry';
import { Interest } from 'src/backend/models/Interest';
import { connectToDatabase, disconnectFromDatabase } from 'src/backend/config/database';

async function setupTestData(): Promise<void> {
  try {
    await connectToDatabase();
    await User.destroy({ where: {}, truncate: true });
    await Industry.destroy({ where: {}, truncate: true });
    await Interest.destroy({ where: {}, truncate: true });

    await Industry.bulkCreate([
      { name: 'Technology' },
      { name: 'Finance' },
      { name: 'Healthcare' },
      { name: 'Education' },
      { name: 'Marketing' },
    ]);

    await Interest.bulkCreate([
      { name: 'Artificial Intelligence' },
      { name: 'Blockchain' },
      { name: 'Data Science' },
      { name: 'Digital Marketing' },
      { name: 'Sustainable Development' },
    ]);
  } finally {
    await disconnectFromDatabase();
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    await connectToDatabase();
    await User.destroy({ where: {}, truncate: true });
    await Industry.destroy({ where: {}, truncate: true });
    await Interest.destroy({ where: {}, truncate: true });
  } finally {
    await disconnectFromDatabase();
  }
}

describe('Onboarding Process', () => {
  before(async () => {
    await setupTestData();
  });

  after(async () => {
    await cleanupTestData();
  });

  it('Complete onboarding flow', () => {
    cy.visit('/welcome');
    cy.get('[data-testid="phone-input"]').type('1234567890');
    cy.get('[data-testid="submit-phone"]').click();
    
    // Mock SMS verification
    cy.window().then((win) => {
      win.mockVerificationCode = '123456';
    });
    cy.get('[data-testid="verification-code-input"]').type('123456');
    cy.get('[data-testid="submit-verification"]').click();

    cy.url().should('include', '/onboarding');

    // Select industries
    cy.get('[data-testid="industry-checkbox"]').check(['Technology', 'Finance', 'Healthcare']);
    cy.get('[data-testid="next-button"]').click();

    // Select interests
    cy.get('[data-testid="interest-checkbox"]').check(['Artificial Intelligence', 'Blockchain', 'Data Science']);
    cy.get('[data-testid="next-button"]').click();

    // Enter ZIP code
    cy.get('[data-testid="zip-code-input"]').type('12345');
    cy.get('[data-testid="submit-onboarding"]').click();

    cy.url().should('include', '/dashboard');

    // Verify user profile in database
    cy.task('queryDb', { query: 'SELECT * FROM Users ORDER BY createdAt DESC LIMIT 1' })
      .then((user) => {
        expect(user.industries).to.have.members(['Technology', 'Finance', 'Healthcare']);
        expect(user.interests).to.have.members(['Artificial Intelligence', 'Blockchain', 'Data Science']);
        expect(user.zipCode).to.equal('12345');
      });
  });

  it('Validation errors', () => {
    cy.visit('/onboarding');

    // Try to proceed without selecting industries
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Select fewer than 3 industries
    cy.get('[data-testid="industry-checkbox"]').check(['Technology']);
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Complete industries step
    cy.get('[data-testid="industry-checkbox"]').check(['Finance', 'Healthcare']);
    cy.get('[data-testid="next-button"]').click();

    // Try to proceed without selecting interests
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Select fewer than 3 interests
    cy.get('[data-testid="interest-checkbox"]').check(['Artificial Intelligence']);
    cy.get('[data-testid="next-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Complete interests step
    cy.get('[data-testid="interest-checkbox"]').check(['Blockchain', 'Data Science']);
    cy.get('[data-testid="next-button"]').click();

    // Enter invalid ZIP code
    cy.get('[data-testid="zip-code-input"]').type('invalid');
    cy.get('[data-testid="submit-onboarding"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('Persistence between steps', () => {
    cy.visit('/onboarding');

    // Complete industries step
    cy.get('[data-testid="industry-checkbox"]').check(['Technology', 'Finance', 'Healthcare']);
    cy.get('[data-testid="next-button"]').click();

    // Complete interests step
    cy.get('[data-testid="interest-checkbox"]').check(['Artificial Intelligence', 'Blockchain', 'Data Science']);
    cy.get('[data-testid="next-button"]').click();

    // Go back to industries step
    cy.get('[data-testid="back-button"]').click();
    cy.get('[data-testid="back-button"]').click();

    // Assert previously selected industries are still selected
    cy.get('[data-testid="industry-checkbox"]').should('be.checked', ['Technology', 'Finance', 'Healthcare']);

    // Make changes to industries selection
    cy.get('[data-testid="industry-checkbox"]').uncheck('Finance');
    cy.get('[data-testid="industry-checkbox"]').check('Marketing');

    // Go forward to interests step
    cy.get('[data-testid="next-button"]').click();

    // Assert previously selected interests are still selected
    cy.get('[data-testid="interest-checkbox"]').should('be.checked', ['Artificial Intelligence', 'Blockchain', 'Data Science']);

    // Go back to industries step
    cy.get('[data-testid="back-button"]').click();

    // Assert changes are still present
    cy.get('[data-testid="industry-checkbox"]').should('be.checked', ['Technology', 'Healthcare', 'Marketing']);
    cy.get('[data-testid="industry-checkbox"]').should('not.be.checked', 'Finance');
  });

  it('Responsiveness', () => {
    const viewports = ['iphone-6', 'ipad-2', [1920, 1080]];

    viewports.forEach((viewport) => {
      cy.viewport(viewport);
      cy.visit('/onboarding');

      // Check layout for each step
      cy.get('[data-testid="onboarding-form"]').should('be.visible');
      cy.get('[data-testid="next-button"]').should('be.visible');

      // Industries step
      cy.get('[data-testid="industry-checkbox"]').check(['Technology', 'Finance', 'Healthcare']);
      cy.get('[data-testid="next-button"]').click();

      // Interests step
      cy.get('[data-testid="interest-checkbox"]').check(['Artificial Intelligence', 'Blockchain', 'Data Science']);
      cy.get('[data-testid="next-button"]').click();

      // ZIP code step
      cy.get('[data-testid="zip-code-input"]').should('be.visible');
      cy.get('[data-testid="submit-onboarding"]').should('be.visible');
    });
  });
});