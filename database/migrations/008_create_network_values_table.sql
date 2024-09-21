-- network_values table stores the calculated network value for each user
-- value represents the user's network value, which must be non-negative
-- calculated_at tracks when the network value was last updated

CREATE TABLE network_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    value FLOAT NOT NULL CHECK (value >= 0),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_network_values_user_id ON network_values (user_id);
CREATE INDEX idx_network_values_value ON network_values (value DESC);