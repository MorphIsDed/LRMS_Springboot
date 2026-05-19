CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_hash VARCHAR(64) NOT NULL,
    partner_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    system_user_id BIGINT NOT NULL,
    CONSTRAINT fk_api_key_system_user FOREIGN KEY (system_user_id) REFERENCES users(user_id)
);

CREATE UNIQUE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

CREATE TABLE api_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    api_key_id BIGINT NOT NULL,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    http_status INTEGER NOT NULL,
    response_time_ms BIGINT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_api_usage_log_api_key FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);

CREATE INDEX idx_api_usage_logs_requested_at ON api_usage_logs(requested_at);
CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
