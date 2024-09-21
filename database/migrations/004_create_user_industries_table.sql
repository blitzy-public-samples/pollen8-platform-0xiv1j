-- user_industries table represents the many-to-many relationship between users and industries
CREATE TABLE user_industries (
    user_id UUID NOT NULL,
    industry_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, industry_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_industries_user_id ON user_industries (user_id);
CREATE INDEX idx_user_industries_industry_id ON user_industries (industry_id);