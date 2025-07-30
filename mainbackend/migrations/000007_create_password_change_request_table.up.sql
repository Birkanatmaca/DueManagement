-- Create password change request table
CREATE TABLE IF NOT EXISTS password_change_request (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    code VARCHAR(10) NOT NULL,
    new_password VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_change_request_email ON password_change_request(email);
CREATE INDEX IF NOT EXISTS idx_password_change_request_phone ON password_change_request(phone);
CREATE INDEX IF NOT EXISTS idx_password_change_request_code ON password_change_request(code);
CREATE INDEX IF NOT EXISTS idx_password_change_request_expires_at ON password_change_request(expires_at); 