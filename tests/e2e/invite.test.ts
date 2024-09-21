import cypress from 'cypress';
import { User } from 'src/backend/models/User';
import { Invite } from 'src/backend/models/Invite';
import { connectToDatabase, disconnectFromDatabase } from 'src/backend/config/database';

async function setupTestData(): Promise<void> {
  await connectToDatabase();
  // Clear existing test data
  await User.destroy({ where: {}, truncate: true });
  await Invite.destroy({ where: {}, truncate: true });
  
  // Create test users
  await User.create({
    phoneNumber: '+1234567890',
    username: 'testuser1',
    // Add other required fields
  });
  
  await disconnectFromDatabase();
}

async function cleanupTestData(): Promise<void> {
  await connectToDatabase();
  await User.destroy({ where: {}, truncate: true });
  await Invite.destroy({ where: {}, truncate: true });
  await disconnectFromDatabase();
}

function loginUser(phoneNumber: string): void {
  cy.visit('/login');
  cy.get('[data-testid="phone-input"]').type(phoneNumber);
  cy.get('[data-testid="login-submit"]').click();
  cy.get('[data-testid="verification-code"]').type('123456'); // Mocked verification code
  cy.get('[data-testid="verify-submit"]').click();
  cy.url().should('include', '/dashboard');
}

describe('Invite Functionality', () => {
  before(setupTestData);
  after(cleanupTestData);

  it('Create and share invite', () => {
    loginUser('+1234567890');
    cy.visit('/invite-management');
    cy.get('[data-testid="generate-invite"]').click();
    cy.get('[data-testid="invite-link"]').should('be.visible');
    cy.get('[data-testid="invite-link"]').invoke('val').then((inviteLink) => {
      cy.get('[data-testid="logout"]').click();
      cy.visit(inviteLink as string);
      cy.get('[data-testid="invite-landing"]').should('be.visible');
      cy.get('[data-testid="inviter-info"]').should('contain', 'testuser1');
    });
  });

  it('Accept invite and complete onboarding', () => {
    // Create a test invite
    cy.task('createTestInvite', { userId: 'testuser1' }).then((invite: Invite) => {
      cy.visit(`/invite/${invite.inviteCode}`);
      cy.get('[data-testid="accept-invite"]').click();
      cy.get('[data-testid="phone-input"]').type('+1987654321');
      cy.get('[data-testid="verify-submit"]').click();
      cy.url().should('include', '/onboarding');
      // Complete onboarding process
      cy.get('[data-testid="industry-select"]').select(['Technology', 'Finance']);
      cy.get('[data-testid="interest-select"]').select(['AI', 'Blockchain']);
      cy.get('[data-testid="zipcode-input"]').type('12345');
      cy.get('[data-testid="onboarding-submit"]').click();
      cy.url().should('include', '/dashboard');
      // Verify connection
      cy.get('[data-testid="connections"]').should('contain', 'testuser1');
      // Verify invite click count
      cy.task('getInviteClickCount', invite.id).should('eq', 1);
    });
  });

  it('View invite statistics', () => {
    loginUser('+1234567890');
    cy.visit('/invite-management');
    cy.get('[data-testid="invite-list"]').should('be.visible');
    cy.get('[data-testid="invite-item"]').each(($invite) => {
      cy.wrap($invite).find('[data-testid="click-count"]').should('be.visible');
      cy.wrap($invite).find('[data-testid="activity-graph"]').should('be.visible');
    });
    cy.get('[data-testid="activity-graph"]').first().click();
    cy.get('[data-testid="detailed-stats"]').should('be.visible');
    cy.get('[data-testid="conversion-rate"]').should('be.visible');
  });

  it('Deactivate and reactivate invite', () => {
    loginUser('+1234567890');
    cy.visit('/invite-management');
    cy.get('[data-testid="invite-item"]').first().as('firstInvite');
    cy.get('@firstInvite').find('[data-testid="deactivate-invite"]').click();
    cy.get('@firstInvite').find('[data-testid="invite-status"]').should('contain', 'Inactive');
    cy.get('@firstInvite').find('[data-testid="invite-link"]').invoke('val').then((inviteLink) => {
      cy.visit(inviteLink as string);
      cy.get('[data-testid="invite-invalid"]').should('be.visible');
    });
    cy.visit('/invite-management');
    cy.get('@firstInvite').find('[data-testid="reactivate-invite"]').click();
    cy.get('@firstInvite').find('[data-testid="invite-status"]').should('contain', 'Active');
    cy.get('@firstInvite').find('[data-testid="invite-link"]').invoke('val').then((inviteLink) => {
      cy.visit(inviteLink as string);
      cy.get('[data-testid="invite-landing"]').should('be.visible');
    });
  });

  it('Invite limit and error handling', () => {
    loginUser('+1234567890');
    cy.visit('/invite-management');
    // Assuming the max invite limit is 5
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="generate-invite"]').click();
    }
    cy.get('[data-testid="generate-invite"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Maximum invite limit reached');

    // Simulate offline state
    cy.intercept('POST', '/api/invites', { forceNetworkError: true }).as('createInvite');
    cy.get('[data-testid="generate-invite"]').click();
    cy.wait('@createInvite');
    cy.get('[data-testid="error-message"]').should('contain', 'Network error');
  });
});