CREATE EXTENSION IF NOT EXISTS timescaledb;
SELECT create_hypertable('"LocationEvent"', 'timestamp');