-- user_interests table represents the many-to-many relationship between users and interests
CREATE TABLE user_interests (
    user_id UUID NOT NULL,
    interest_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_interests_user_id ON user_interests (user_id);
CREATE INDEX idx_user_interests_interest_id ON user_interests (interest_id);