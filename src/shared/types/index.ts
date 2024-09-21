// Shared TypeScript type definitions for the Pollen8 application

// User interface representing a user in the Pollen8 system
export interface User {
  id: string;
  phoneNumber: string;
  username: string;
  location: string;
  industries: Industry[];
  interests: Interest[];
  createdAt: Date;
  lastLogin: Date;
}

// Industry interface representing an industry category
export interface Industry {
  id: string;
  name: string;
}

// Interest interface representing an interest category
export interface Interest {
  id: string;
  name: string;
}

// Connection interface representing a connection between two users
export interface Connection {
  id: string;
  userId1: string;
  userId2: string;
  connectedAt: Date;
}

// Invite interface representing an invite created by a user
export interface Invite {
  id: string;
  creatorId: string;
  inviteCode: string;
  createdAt: Date;
  clicks: number;
  isActive: boolean;
}

// NetworkValue interface representing the calculated network value for a user
export interface NetworkValue {
  id: string;
  userId: string;
  value: number;
  calculatedAt: Date;
}

// AuthPayload interface representing the payload returned after successful authentication
export interface AuthPayload {
  token: string;
  user: User;
}

// Generic type for API responses
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// TODO: Consider adding more specific types for phone number format and username constraints
// TODO: Evaluate the need for additional utility types or type guards