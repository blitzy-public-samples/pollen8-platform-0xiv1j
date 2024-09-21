-- invites table stores user-generated invite links
-- invite_code is a unique 8-character code for each invite
-- clicks tracks the number of times the invite link has been accessed
-- is_active allows for deactivation of invites without deletion
-- expires_at can be set to automatically expire invites after a certain time

CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_invites_creator_id ON invites (creator_id);
CREATE UNIQUE INDEX idx_invites_invite_code ON invites (invite_code);
CREATE INDEX idx_invites_is_active ON invites (is_active);