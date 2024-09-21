-- connections table stores the relationships between users
-- strength represents the connection strength (0 to 1)
-- CHECK constraint ensures user_id_1 is always less than user_id_2 to prevent duplicate connections

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL,
    user_id_2 UUID NOT NULL,
    strength FLOAT NOT NULL DEFAULT 0 CHECK (strength >= 0 AND strength <= 1),
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_connections_user_id_1 ON connections (user_id_1);
CREATE INDEX idx_connections_user_id_2 ON connections (user_id_2);
CREATE INDEX idx_connections_strength ON connections (strength);