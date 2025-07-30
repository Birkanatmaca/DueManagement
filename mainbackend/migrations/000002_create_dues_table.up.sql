-- Create dues table
CREATE TABLE IF NOT EXISTS dues (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dues_child_id ON dues(child_id);
CREATE INDEX IF NOT EXISTS idx_dues_month_year ON dues(month, year);
CREATE INDEX IF NOT EXISTS idx_dues_is_paid ON dues(is_paid);
CREATE INDEX IF NOT EXISTS idx_dues_due_date ON dues(due_date); 