import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from 'src/backend/routes/auth';
import usersRouter from 'src/backend/routes/users';
import connectionsRouter from 'src/backend/routes/connections';
import invitesRouter from 'src/backend/routes/invites';
import networkValueRouter from 'src/backend/routes/networkValue';
import errorHandler from 'src/backend/middleware/errorHandler';
import createRateLimiter from 'src/backend/middleware/rateLimiter';

const app: express.Application = express();

function configureApp(app: express.Application): void {
  // Apply helmet middleware for security headers
  app.use(helmet());

  // Apply CORS middleware with appropriate configuration
  app.use(cors());

  // Apply morgan middleware for request logging
  app.use(morgan('combined'));

  // Apply express.json() middleware for parsing JSON request bodies
  app.use(express.json());

  // Apply express.urlencoded() middleware for parsing URL-encoded request bodies
  app.use(express.urlencoded({ extended: true }));

  // Apply rate limiter middleware to all routes
  app.use(createRateLimiter());

  // Mount auth routes
  app.use('/api/auth', authRouter);

  // Mount users routes
  app.use('/api/users', usersRouter);

  // Mount connections routes
  app.use('/api/connections', connectionsRouter);

  // Mount invites routes
  app.use('/api/invites', invitesRouter);

  // Mount network value routes
  app.use('/api/network-value', networkValueRouter);

  // Apply error handling middleware
  app.use(errorHandler);
}

configureApp(app);

export { app };