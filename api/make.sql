CREATE TABLE shibafes2024 (
    id SERIAL PRIMARY KEY,
    sub_key CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_dev BOOLEAN NOT NULL,
    answers JSON, 
    gpt_result JSON
);
