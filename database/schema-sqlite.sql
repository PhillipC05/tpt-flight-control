-- TPT Flight Control - SQLite-compatible schema
-- Combines core schema and demo/training tables into a single file

PRAGMA foreign_keys = OFF;

-- Users and Authentication

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Configuration

CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_enabled INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER REFERENCES roles(id),
    module_id INTEGER REFERENCES modules(id),
    permission VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    module_id INTEGER REFERENCES modules(id),
    permission VARCHAR(50) NOT NULL
);

-- Airlines and Aircraft

CREATE TABLE IF NOT EXISTS airlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    country VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS aircraft (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model VARCHAR(100) NOT NULL,
    registration VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL
);

-- Flights

CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    airline_id INTEGER REFERENCES airlines(id),
    aircraft_id INTEGER REFERENCES aircraft(id),
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    scheduled_departure TIMESTAMP NOT NULL,
    scheduled_arrival TIMESTAMP NOT NULL,
    actual_departure TIMESTAMP,
    actual_arrival TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled',
    gate VARCHAR(10),
    terminal VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passengers and Bookings

CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    passport_number VARCHAR(20),
    nationality VARCHAR(100),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_id INTEGER REFERENCES passengers(id),
    flight_id INTEGER REFERENCES flights(id),
    seat_number VARCHAR(10),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Baggage

CREATE TABLE IF NOT EXISTS baggage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER REFERENCES bookings(id),
    tag_number VARCHAR(20) UNIQUE NOT NULL,
    weight DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'checked',
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security and Check-in

CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER REFERENCES bookings(id),
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    boarding_pass_issued INTEGER DEFAULT 0,
    security_cleared INTEGER DEFAULT 0
);

-- Ground Operations

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft_id INTEGER REFERENCES aircraft(id),
    maintenance_type VARCHAR(100),
    scheduled_date DATE,
    completed INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crew_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER REFERENCES flights(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ATC Tower

CREATE TABLE IF NOT EXISTS runways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    airport_id INTEGER,
    runway_number VARCHAR(10) NOT NULL,
    length INTEGER,
    width INTEGER,
    surface_type VARCHAR(20),
    centerline TEXT,
    threshold1 TEXT,
    threshold2 TEXT,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clearances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_plan_id INTEGER,
    clearance_number VARCHAR(20) UNIQUE NOT NULL,
    clearance_type VARCHAR(50) NOT NULL,
    issued_by VARCHAR(100),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    clearance_text TEXT NOT NULL,
    restrictions TEXT,
    frequency_assignments TEXT,
    squawk_code VARCHAR(4),
    runway_assignment VARCHAR(10),
    heading_assignments TEXT,
    altitude_assignments TEXT,
    speed_assignments TEXT,
    acknowledged INTEGER DEFAULT 0,
    acknowledged_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER REFERENCES flights(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location VARCHAR(100),
    temperature DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    visibility DECIMAL(5,2),
    conditions TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER REFERENCES flights(id),
    type VARCHAR(100),
    description TEXT,
    reported_by INTEGER REFERENCES users(id),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved INTEGER DEFAULT 0
);

-- ADS-B Aircraft Tracking

CREATE TABLE IF NOT EXISTS aircraft_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icao24 VARCHAR(6) NOT NULL,
    callsign VARCHAR(8),
    origin_country VARCHAR(100),
    time_position INTEGER,
    last_contact INTEGER,
    longitude DECIMAL(10,6),
    latitude DECIMAL(10,6),
    baro_altitude DECIMAL(7,1),
    on_ground INTEGER,
    velocity DECIMAL(5,1),
    true_track DECIMAL(5,1),
    vertical_rate DECIMAL(5,1),
    geo_altitude DECIMAL(7,1),
    squawk VARCHAR(4),
    spi INTEGER,
    position_source INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(icao24, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_scheduled_departure ON flights(scheduled_departure);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_baggage_booking_id ON baggage(booking_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_positions_icao24 ON aircraft_positions(icao24);
CREATE INDEX IF NOT EXISTS idx_aircraft_positions_time ON aircraft_positions(recorded_at);

-- Satellite Communications

CREATE TABLE IF NOT EXISTS satellite_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft_id VARCHAR(10) NOT NULL,
    satellite_type VARCHAR(20) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_data TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signal_strength INTEGER,
    frequency DECIMAL(10,2),
    processed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS satellite_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft_id VARCHAR(10) NOT NULL,
    command_type VARCHAR(50) NOT NULL,
    parameters TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    acknowledged_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft_registration VARCHAR(20),
    report_type VARCHAR(50),
    description TEXT,
    severity VARCHAR(20) DEFAULT 'low',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    satellite_transmission INTEGER DEFAULT 0,
    resolved INTEGER DEFAULT 0,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_satellite_messages_aircraft ON satellite_messages(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_satellite_messages_time ON satellite_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_satellite_commands_status ON satellite_commands(status);

-- AI Conflict Prediction

CREATE TABLE IF NOT EXISTS conflict_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft1 VARCHAR(10) NOT NULL,
    aircraft2 VARCHAR(10) NOT NULL,
    time_to_conflict INTEGER NOT NULL,
    min_horizontal_sep DECIMAL(6,2),
    min_vertical_sep DECIMAL(7,1),
    severity DECIMAL(5,2),
    confidence DECIMAL(5,2),
    resolved INTEGER DEFAULT 0,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft1 VARCHAR(10) NOT NULL,
    aircraft2 VARCHAR(10) NOT NULL,
    actual_conflict_time TIMESTAMP,
    min_horizontal_sep DECIMAL(6,2),
    min_vertical_sep DECIMAL(7,1),
    resolution_method TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conflict_predictions_time ON conflict_predictions(predicted_at);
CREATE INDEX IF NOT EXISTS idx_conflict_predictions_severity ON conflict_predictions(severity);

-- Performance Analytics

CREATE TABLE IF NOT EXISTS performance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    kpi_data TEXT,
    trends TEXT,
    recommendations TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_performance_reports_type ON performance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_performance_reports_period ON performance_reports(period_start, period_end);

-- Flight Plans

CREATE TABLE IF NOT EXISTS flight_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER REFERENCES flights(id),
    aircraft_id VARCHAR(10) NOT NULL,
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    route TEXT,
    altitude_profile TEXT,
    speed_profile TEXT,
    fuel_requirements DECIMAL(8,2),
    alternate_airports TEXT,
    pilot_in_command VARCHAR(100),
    filed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'filed',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cpdlc_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_plan_id INTEGER REFERENCES flight_plans(id),
    message_id VARCHAR(20) UNIQUE NOT NULL,
    direction VARCHAR(10) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP,
    acknowledged INTEGER DEFAULT 0,
    response_required INTEGER DEFAULT 0,
    response_message_id VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS acars_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_plan_id INTEGER REFERENCES flight_plans(id),
    message_id VARCHAR(20) UNIQUE NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    origin VARCHAR(10),
    destination VARCHAR(10),
    message_text TEXT NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed INTEGER DEFAULT 0,
    priority VARCHAR(10) DEFAULT 'normal'
);

-- Weather Radar

CREATE TABLE IF NOT EXISTS weather_radar_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    radar_station VARCHAR(10) NOT NULL,
    radar_type VARCHAR(20) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    altitude INTEGER,
    reflectivity DECIMAL(5,2),
    velocity DECIMAL(5,2),
    spectrum_width DECIMAL(5,2),
    precipitation_type VARCHAR(20),
    intensity VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    location_lat DECIMAL(10,6),
    location_lon DECIMAL(10,6),
    radius_km DECIMAL(6,2),
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    issued_by VARCHAR(100),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS metar_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id VARCHAR(4) NOT NULL,
    observation_time TIMESTAMP NOT NULL,
    wind_direction INTEGER,
    wind_speed INTEGER,
    wind_gust INTEGER,
    visibility DECIMAL(5,1),
    temperature DECIMAL(5,1),
    dewpoint DECIMAL(5,1),
    altimeter_setting DECIMAL(5,2),
    weather_conditions TEXT,
    sky_conditions TEXT,
    remarks TEXT,
    raw_text TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taf_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id VARCHAR(4) NOT NULL,
    issue_time TIMESTAMP NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    forecast_text TEXT,
    raw_text TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTAMs and Airspace

CREATE TABLE IF NOT EXISTS notams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notam_id VARCHAR(20) UNIQUE NOT NULL,
    notam_type VARCHAR(10) NOT NULL,
    series VARCHAR(5) NOT NULL,
    number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    fir_code VARCHAR(4),
    notam_code VARCHAR(10),
    traffic_type VARCHAR(20),
    purpose VARCHAR(20),
    scope VARCHAR(20),
    lower_limit INTEGER,
    upper_limit INTEGER,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    radius INTEGER,
    affected_area TEXT,
    item_a TEXT,
    item_b TEXT,
    item_c TEXT,
    item_d TEXT,
    item_e TEXT,
    item_f TEXT,
    item_g TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_end_time TIMESTAMP,
    permanent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airspace_restrictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restriction_id VARCHAR(20) UNIQUE NOT NULL,
    restriction_type VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    lower_altitude INTEGER,
    upper_altitude INTEGER,
    geometry_type VARCHAR(20),
    geometry_coordinates TEXT,
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    reason TEXT,
    controlling_agency VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS drone_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id VARCHAR(20) UNIQUE NOT NULL,
    operator_name VARCHAR(100),
    operator_contact VARCHAR(100),
    drone_type VARCHAR(50),
    max_altitude INTEGER,
    operation_area TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    emergency_contact VARCHAR(100),
    approved INTEGER DEFAULT 0,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flight_plans_flight_id ON flight_plans(flight_id);
CREATE INDEX IF NOT EXISTS idx_flight_plans_status ON flight_plans(status);
CREATE INDEX IF NOT EXISTS idx_clearances_flight_plan_id ON clearances(flight_plan_id);
CREATE INDEX IF NOT EXISTS idx_clearances_valid_from ON clearances(valid_from);
CREATE INDEX IF NOT EXISTS idx_cpdlc_messages_flight_plan_id ON cpdlc_messages(flight_plan_id);
CREATE INDEX IF NOT EXISTS idx_acars_messages_flight_plan_id ON acars_messages(flight_plan_id);
CREATE INDEX IF NOT EXISTS idx_weather_radar_location ON weather_radar_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_radar_time ON weather_radar_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON weather_alerts(active);
CREATE INDEX IF NOT EXISTS idx_metar_reports_station ON metar_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_metar_reports_time ON metar_reports(observation_time);
CREATE INDEX IF NOT EXISTS idx_taf_reports_station ON taf_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_notams_active ON notams(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_airspace_restrictions_active ON airspace_restrictions(active);

-- Airline API Integration

CREATE TABLE IF NOT EXISTS flight_search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_key VARCHAR(32) UNIQUE NOT NULL,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    passengers INTEGER NOT NULL,
    results TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airline_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    provider VARCHAR(20) NOT NULL,
    flight_data TEXT,
    passenger_data TEXT,
    api_response TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flight_search_cache_key ON flight_search_cache(search_key);
CREATE INDEX IF NOT EXISTS idx_flight_search_cache_route ON flight_search_cache(origin, destination, departure_date);
CREATE INDEX IF NOT EXISTS idx_airline_bookings_reference ON airline_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_airline_bookings_status ON airline_bookings(status);

-- Data Fusion Engine

CREATE TABLE IF NOT EXISTS data_fusion_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_timestamp TIMESTAMP NOT NULL,
    aircraft_count INTEGER NOT NULL DEFAULT 0,
    conflicts_count INTEGER NOT NULL DEFAULT 0,
    weather_summary TEXT,
    aircraft_summary TEXT,
    conflicts_data TEXT,
    system_status VARCHAR(20) DEFAULT 'operational',
    processing_time_seconds DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_fusion_timestamp ON data_fusion_reports(report_timestamp);
CREATE INDEX IF NOT EXISTS idx_data_fusion_status ON data_fusion_reports(system_status);

-- Compliance and Audit

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type VARCHAR(100) NOT NULL,
    report_data TEXT,
    generated_by INTEGER REFERENCES users(id),
    period_start DATE,
    period_end DATE,
    status VARCHAR(50) DEFAULT 'generated',
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_retention_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_type VARCHAR(100) NOT NULL,
    retention_period_days INTEGER NOT NULL,
    archival_required INTEGER DEFAULT 0,
    encryption_required INTEGER DEFAULT 1,
    deletion_method VARCHAR(50) DEFAULT 'hard_delete',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_deletion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_type VARCHAR(100) NOT NULL,
    record_count INTEGER NOT NULL,
    deletion_method VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    executed_by INTEGER REFERENCES users(id),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_data_deletion_logs_type ON data_deletion_logs(data_type);

-- Stream Processing Pipeline

CREATE TABLE IF NOT EXISTS stream_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name VARCHAR(100) UNIQUE NOT NULL,
    partitions INTEGER NOT NULL DEFAULT 1,
    replication_factor INTEGER NOT NULL DEFAULT 1,
    retention_hours INTEGER NOT NULL DEFAULT 168,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name VARCHAR(100) NOT NULL,
    partition_id INTEGER NOT NULL DEFAULT 0,
    message_key VARCHAR(255),
    message_data TEXT,
    message_offset INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_consumer_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id VARCHAR(100) NOT NULL,
    topic_name VARCHAR(100) NOT NULL,
    partition_id INTEGER NOT NULL,
    consumer_id VARCHAR(100) NOT NULL,
    last_offset INTEGER NOT NULL DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, topic_name, partition_id)
);

CREATE TABLE IF NOT EXISTS stream_processing_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    labels TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_processing_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name VARCHAR(100) UNIQUE NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'stopped',
    config TEXT,
    last_run TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_data_quality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_source VARCHAR(50) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    processing_time_avg DECIMAL(8,2),
    error_rate DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stream_topics_name ON stream_topics(topic_name);
CREATE INDEX IF NOT EXISTS idx_stream_messages_topic ON stream_messages(topic_name, partition_id, message_offset);
CREATE INDEX IF NOT EXISTS idx_stream_consumer_groups_group ON stream_consumer_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_stream_processing_jobs_status ON stream_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_stream_metrics_name ON stream_processing_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_stream_quality_source ON stream_data_quality(data_source);

-- Time-series position data (flat tables; partitioning not supported in SQLite)

CREATE TABLE IF NOT EXISTS aircraft_positions_ts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP NOT NULL,
    icao24 VARCHAR(6),
    callsign VARCHAR(8),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    altitude DECIMAL(7,1),
    speed DECIMAL(5,1),
    heading DECIMAL(5,1),
    vertical_rate DECIMAL(5,1),
    on_ground INTEGER,
    data_source VARCHAR(20),
    quality_score DECIMAL(3,2),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS radar_tracks_ts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP NOT NULL,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    altitude DECIMAL(7,1),
    reflectivity DECIMAL(5,2),
    velocity DECIMAL(5,2),
    spectrum_width DECIMAL(5,2),
    precipitation_type VARCHAR(20),
    intensity VARCHAR(20),
    radar_station VARCHAR(10),
    data_source VARCHAR(20),
    quality_score DECIMAL(3,2),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS satellite_positions_ts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP NOT NULL,
    aircraft_id VARCHAR(10),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    altitude DECIMAL(7,1),
    speed DECIMAL(5,1),
    heading DECIMAL(5,1),
    satellite_type VARCHAR(20),
    signal_strength INTEGER,
    data_source VARCHAR(20),
    quality_score DECIMAL(3,2),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_data_ts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP NOT NULL,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    temperature DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    visibility DECIMAL(5,2),
    precipitation DECIMAL(5,2),
    pressure DECIMAL(6,2),
    humidity DECIMAL(5,2),
    weather_conditions TEXT,
    station_id VARCHAR(10),
    data_source VARCHAR(20),
    quality_score DECIMAL(3,2),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flight_trajectories_ts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TIMESTAMP NOT NULL,
    flight_id INTEGER REFERENCES flights(id),
    icao24 VARCHAR(6),
    callsign VARCHAR(8),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    altitude DECIMAL(7,1),
    speed DECIMAL(5,1),
    heading DECIMAL(5,1),
    vertical_rate DECIMAL(5,1),
    phase VARCHAR(20),
    data_source VARCHAR(20),
    quality_score DECIMAL(3,2),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_series_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_aircraft_positions_ts_time ON aircraft_positions_ts(time);
CREATE INDEX IF NOT EXISTS idx_aircraft_positions_ts_icao24_time ON aircraft_positions_ts(icao24, time);
CREATE INDEX IF NOT EXISTS idx_aircraft_positions_ts_callsign ON aircraft_positions_ts(callsign);
CREATE INDEX IF NOT EXISTS idx_radar_tracks_ts_time ON radar_tracks_ts(time);
CREATE INDEX IF NOT EXISTS idx_radar_tracks_ts_station ON radar_tracks_ts(radar_station);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_ts_time ON satellite_positions_ts(time);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_ts_aircraft_time ON satellite_positions_ts(aircraft_id, time);
CREATE INDEX IF NOT EXISTS idx_weather_data_ts_time ON weather_data_ts(time);
CREATE INDEX IF NOT EXISTS idx_weather_data_ts_station ON weather_data_ts(station_id);
CREATE INDEX IF NOT EXISTS idx_flight_trajectories_ts_time ON flight_trajectories_ts(time);
CREATE INDEX IF NOT EXISTS idx_flight_trajectories_ts_flight_time ON flight_trajectories_ts(flight_id, time);
CREATE INDEX IF NOT EXISTS idx_flight_trajectories_ts_icao24_time ON flight_trajectories_ts(icao24, time);
CREATE INDEX IF NOT EXISTS idx_ts_metadata_table ON time_series_metadata(table_name, recorded_at);

-- Spatial / Geographic tables (geometry columns stored as TEXT in SQLite)

CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icao_code VARCHAR(4) UNIQUE NOT NULL,
    iata_code VARCHAR(3),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    elevation INTEGER,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    runway_count INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'airport',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airspace_sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id VARCHAR(20) UNIQUE NOT NULL,
    sector_name VARCHAR(100),
    sector_type VARCHAR(20),
    lower_limit INTEGER,
    upper_limit INTEGER,
    boundary TEXT,
    controlling_agency VARCHAR(100),
    frequency DECIMAL(6,3),
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navaids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100),
    type VARCHAR(20),
    frequency DECIMAL(8,3),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    elevation INTEGER,
    range INTEGER,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cell_id VARCHAR(20) UNIQUE NOT NULL,
    cell_type VARCHAR(20),
    severity VARCHAR(10),
    geometry TEXT,
    altitude_min INTEGER,
    altitude_max INTEGER,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restricted_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id VARCHAR(20) UNIQUE NOT NULL,
    area_name VARCHAR(100),
    restriction_type VARCHAR(20),
    lower_limit INTEGER,
    upper_limit INTEGER,
    boundary TEXT,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flight_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_id INTEGER REFERENCES flights(id),
    icao24 VARCHAR(6),
    callsign VARCHAR(8),
    path_geometry TEXT,
    altitude_profile TEXT,
    speed_profile TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    distance DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machine Learning for Route Optimization

CREATE TABLE IF NOT EXISTS ml_route_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_data TEXT,
    training_accuracy DECIMAL(5,4),
    validation_accuracy DECIMAL(5,4),
    last_trained TIMESTAMP,
    is_active INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_training_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_icao VARCHAR(4) NOT NULL,
    destination_icao VARCHAR(4) NOT NULL,
    aircraft_type VARCHAR(20),
    route_geometry TEXT,
    distance DECIMAL(8,2),
    flight_time INTEGER,
    fuel_consumption DECIMAL(8,2),
    weather_conditions TEXT,
    traffic_density INTEGER,
    cost_score DECIMAL(8,2),
    safety_score DECIMAL(5,2),
    efficiency_score DECIMAL(5,2),
    actual_flight_time INTEGER,
    delay_minutes INTEGER,
    success INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_route_optimizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    origin_lat DECIMAL(10,6),
    origin_lon DECIMAL(10,6),
    destination_lat DECIMAL(10,6),
    destination_lon DECIMAL(10,6),
    aircraft_type VARCHAR(20),
    optimization_criteria TEXT,
    constraints TEXT,
    original_route TEXT,
    optimized_route TEXT,
    waypoints TEXT,
    estimated_time INTEGER,
    estimated_fuel DECIMAL(8,2),
    confidence_score DECIMAL(5,2),
    model_used VARCHAR(100),
    processing_time DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_route_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER REFERENCES ml_training_routes(id),
    feature_vector TEXT,
    target_value DECIMAL(8,2),
    feature_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_model_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4),
    test_dataset_size INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ml_route_models_name ON ml_route_models(model_name);
CREATE INDEX IF NOT EXISTS idx_ml_route_models_active ON ml_route_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ml_training_routes_origin_dest ON ml_training_routes(origin_icao, destination_icao);
CREATE INDEX IF NOT EXISTS idx_ml_training_routes_aircraft ON ml_training_routes(aircraft_type);
CREATE INDEX IF NOT EXISTS idx_ml_route_optimizations_request ON ml_route_optimizations(request_id);
CREATE INDEX IF NOT EXISTS idx_ml_route_optimizations_model ON ml_route_optimizations(model_used);
CREATE INDEX IF NOT EXISTS idx_ml_route_features_type ON ml_route_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_name ON ml_model_performance(model_name, recorded_at);

-- Predictive Conflict Detection

CREATE TABLE IF NOT EXISTS predicted_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conflict_id VARCHAR(50) UNIQUE NOT NULL,
    aircraft1_icao VARCHAR(6) NOT NULL,
    aircraft2_icao VARCHAR(6) NOT NULL,
    prediction_time TIMESTAMP NOT NULL,
    conflict_time TIMESTAMP NOT NULL,
    time_to_conflict INTEGER NOT NULL,
    horizontal_separation DECIMAL(6,2),
    vertical_separation DECIMAL(7,1),
    conflict_type VARCHAR(20),
    severity_level VARCHAR(10),
    confidence_score DECIMAL(5,2),
    prediction_model VARCHAR(50),
    location_lat DECIMAL(10,6),
    location_lon DECIMAL(10,6),
    altitude DECIMAL(7,1),
    status VARCHAR(20) DEFAULT 'predicted',
    resolution_method TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id VARCHAR(50) UNIQUE NOT NULL,
    aircraft_count INTEGER NOT NULL,
    time_window_start TIMESTAMP NOT NULL,
    time_window_end TIMESTAMP NOT NULL,
    geographic_bounds TEXT,
    risk_level VARCHAR(10),
    potential_conflicts INTEGER,
    weather_impact DECIMAL(5,2),
    traffic_density DECIMAL(5,2),
    mitigation_actions TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_resolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conflict_id VARCHAR(50) REFERENCES predicted_conflicts(conflict_id),
    resolution_type VARCHAR(30),
    resolution_details TEXT,
    effectiveness_score DECIMAL(5,2),
    implemented_by VARCHAR(100),
    implemented_at TIMESTAMP,
    outcome VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_prediction_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_parameters TEXT,
    accuracy_score DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    last_trained TIMESTAMP,
    is_active INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    conflict_id VARCHAR(50) REFERENCES predicted_conflicts(conflict_id),
    alert_type VARCHAR(30),
    alert_level VARCHAR(10),
    message TEXT,
    affected_aircraft TEXT,
    recommended_actions TEXT,
    acknowledged INTEGER DEFAULT 0,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time_period_start TIMESTAMP NOT NULL,
    time_period_end TIMESTAMP NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    true_positives INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    false_negatives INTEGER DEFAULT 0,
    average_time_to_conflict INTEGER,
    average_separation DECIMAL(6,2),
    resolution_success_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predicted_conflicts_id ON predicted_conflicts(conflict_id);
CREATE INDEX IF NOT EXISTS idx_predicted_conflicts_time ON predicted_conflicts(prediction_time);
CREATE INDEX IF NOT EXISTS idx_predicted_conflicts_aircraft ON predicted_conflicts(aircraft1_icao, aircraft2_icao);
CREATE INDEX IF NOT EXISTS idx_predicted_conflicts_status ON predicted_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_predicted_conflicts_severity ON predicted_conflicts(severity_level);
CREATE INDEX IF NOT EXISTS idx_conflict_scenarios_id ON conflict_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_conflict_scenarios_risk ON conflict_scenarios(risk_level);
CREATE INDEX IF NOT EXISTS idx_conflict_scenarios_status ON conflict_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_conflict ON conflict_resolutions(conflict_id);
CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_type ON conflict_resolutions(resolution_type);
CREATE INDEX IF NOT EXISTS idx_conflict_prediction_models_name ON conflict_prediction_models(model_name);
CREATE INDEX IF NOT EXISTS idx_conflict_prediction_models_active ON conflict_prediction_models(is_active);
CREATE INDEX IF NOT EXISTS idx_conflict_alerts_id ON conflict_alerts(alert_id);
CREATE INDEX IF NOT EXISTS idx_conflict_alerts_conflict ON conflict_alerts(conflict_id);
CREATE INDEX IF NOT EXISTS idx_conflict_alerts_level ON conflict_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_conflict_alerts_acknowledged ON conflict_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_conflict_statistics_period ON conflict_statistics(time_period_start, time_period_end);

-- Automated Decision Support

CREATE TABLE IF NOT EXISTS decision_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id VARCHAR(50) UNIQUE NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    priority_level VARCHAR(10),
    complexity_score DECIMAL(5,2),
    time_pressure DECIMAL(5,2),
    affected_aircraft TEXT,
    environmental_factors TEXT,
    operational_constraints TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recommendation_id VARCHAR(50) UNIQUE NOT NULL,
    scenario_id VARCHAR(50) REFERENCES decision_scenarios(scenario_id),
    recommendation_type VARCHAR(50),
    confidence_score DECIMAL(5,2),
    expected_outcome TEXT,
    alternative_options TEXT,
    implementation_steps TEXT,
    risk_assessment TEXT,
    time_to_implement INTEGER,
    priority_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_id VARCHAR(50) REFERENCES decision_recommendations(recommendation_id),
    actual_outcome TEXT,
    outcome_quality DECIMAL(5,2),
    controller_feedback TEXT,
    system_feedback TEXT,
    lessons_learned TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50),
    conditions TEXT,
    actions TEXT,
    priority INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_model_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,4),
    precision DECIMAL(5,4),
    recall DECIMAL(5,4),
    decision_quality DECIMAL(5,2),
    response_time_avg DECIMAL(8,2),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automated_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id VARCHAR(50) UNIQUE NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    trigger_scenario VARCHAR(50),
    affected_entities TEXT,
    action_parameters TEXT,
    execution_status VARCHAR(20),
    execution_result TEXT,
    executed_by VARCHAR(50),
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    alert_type VARCHAR(30),
    alert_level VARCHAR(10),
    title VARCHAR(200),
    message TEXT,
    recommended_actions TEXT,
    affected_parties TEXT,
    time_sensitivity VARCHAR(20),
    acknowledged INTEGER DEFAULT 0,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decision_scenarios_id ON decision_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_decision_scenarios_type ON decision_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_decision_scenarios_status ON decision_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_decision_scenarios_priority ON decision_scenarios(priority_level);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_id ON decision_recommendations(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_scenario ON decision_recommendations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_type ON decision_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_status ON decision_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_decision_recommendations_priority ON decision_recommendations(priority_score);
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_decision ON decision_outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_quality ON decision_outcomes(outcome_quality);
CREATE INDEX IF NOT EXISTS idx_decision_rules_id ON decision_rules(rule_id);
CREATE INDEX IF NOT EXISTS idx_decision_rules_type ON decision_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_decision_rules_active ON decision_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_decision_model_performance_name ON decision_model_performance(model_name);
CREATE INDEX IF NOT EXISTS idx_decision_model_performance_scenario ON decision_model_performance(scenario_type);
CREATE INDEX IF NOT EXISTS idx_automated_actions_id ON automated_actions(action_id);
CREATE INDEX IF NOT EXISTS idx_automated_actions_type ON automated_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_automated_actions_status ON automated_actions(execution_status);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_id ON decision_alerts(alert_id);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_type ON decision_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_level ON decision_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_acknowledged ON decision_alerts(acknowledged);

-- GDPR Compliance

CREATE TABLE IF NOT EXISTS data_subject_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consent_id VARCHAR(50) UNIQUE NOT NULL,
    data_subject_id VARCHAR(100) NOT NULL,
    data_subject_type VARCHAR(20) NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    consent_given INTEGER NOT NULL,
    consent_date TIMESTAMP,
    consent_expiry TIMESTAMP,
    consent_withdrawn INTEGER DEFAULT 0,
    withdrawal_date TIMESTAMP,
    consent_version VARCHAR(20),
    legal_basis VARCHAR(100),
    consent_scope TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_processing_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id VARCHAR(50) UNIQUE NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_description TEXT,
    legal_basis VARCHAR(100) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    data_categories TEXT,
    data_subjects TEXT,
    recipients TEXT,
    retention_period VARCHAR(50),
    automated_decision_making INTEGER DEFAULT 0,
    international_transfer INTEGER DEFAULT 0,
    transfer_countries TEXT,
    dpo_approval_required INTEGER DEFAULT 0,
    dpo_approved INTEGER DEFAULT 0,
    dpo_approval_date TIMESTAMP,
    risk_assessment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_subject_rights_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    data_subject_id VARCHAR(100) NOT NULL,
    data_subject_type VARCHAR(20) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    request_details TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'pending',
    completion_deadline TIMESTAMP,
    completed_date TIMESTAMP,
    response_provided TEXT,
    verification_method VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'pending',
    appeal_requested INTEGER DEFAULT 0,
    appeal_details TEXT,
    appeal_date TIMESTAMP,
    appeal_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_breach_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    breach_id VARCHAR(50) UNIQUE NOT NULL,
    breach_date TIMESTAMP NOT NULL,
    discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    breach_description TEXT NOT NULL,
    data_categories_affected TEXT,
    number_of_subjects_affected INTEGER,
    potential_consequences TEXT,
    measures_taken TEXT,
    supervisory_authority_notified INTEGER DEFAULT 0,
    notification_date TIMESTAMP,
    notification_reference VARCHAR(100),
    data_subjects_notified INTEGER DEFAULT 0,
    subjects_notification_date TIMESTAMP,
    risk_assessment TEXT,
    dpo_notified INTEGER DEFAULT 0,
    dpo_notification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_protection_officer VARCHAR(100),
    processing_activities TEXT,
    data_flows TEXT,
    risks_identified TEXT,
    mitigation_measures TEXT,
    residual_risks TEXT,
    recommendations TEXT,
    approval_status VARCHAR(20) DEFAULT 'pending',
    approval_date TIMESTAMP,
    review_date TIMESTAMP,
    next_review_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_retention_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id VARCHAR(50) UNIQUE NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    retention_purpose VARCHAR(200),
    retention_period VARCHAR(50) NOT NULL,
    retention_basis VARCHAR(100),
    disposal_method VARCHAR(50),
    review_frequency VARCHAR(20),
    last_review_date TIMESTAMP,
    next_review_date TIMESTAMP,
    legal_exceptions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cookie_consent_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preference_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    session_id VARCHAR(255),
    ip_address TEXT,
    user_agent TEXT,
    necessary_cookies INTEGER DEFAULT 1,
    analytics_cookies INTEGER DEFAULT 0,
    marketing_cookies INTEGER DEFAULT 0,
    functional_cookies INTEGER DEFAULT 0,
    preferences_cookies INTEGER DEFAULT 0,
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consent_expiry TIMESTAMP,
    consent_withdrawn INTEGER DEFAULT 0,
    withdrawal_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_anonymization_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(50) UNIQUE NOT NULL,
    data_subject_id VARCHAR(100),
    data_category VARCHAR(100),
    anonymization_method VARCHAR(50),
    anonymization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anonymization_reason VARCHAR(200),
    original_data_hash VARCHAR(128),
    anonymized_data_hash VARCHAR(128),
    reversibility INTEGER DEFAULT 0,
    retention_period VARCHAR(50),
    disposal_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gdpr_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id VARCHAR(50) UNIQUE NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    data_subject_id VARCHAR(100),
    user_id VARCHAR(100),
    action_details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    compliance_status VARCHAR(20) DEFAULT 'compliant'
);

CREATE INDEX IF NOT EXISTS idx_data_subject_consents_subject ON data_subject_consents(data_subject_id, data_subject_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_consents_type ON data_subject_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_consents_withdrawn ON data_subject_consents(consent_withdrawn);
CREATE INDEX IF NOT EXISTS idx_data_processing_activities_id ON data_processing_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_activities_basis ON data_processing_activities(legal_basis);
CREATE INDEX IF NOT EXISTS idx_data_subject_rights_requests_subject ON data_subject_rights_requests(data_subject_id, data_subject_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_rights_requests_type ON data_subject_rights_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_rights_requests_status ON data_subject_rights_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_rights_requests_deadline ON data_subject_rights_requests(completion_deadline);
CREATE INDEX IF NOT EXISTS idx_data_breach_notifications_id ON data_breach_notifications(breach_id);
CREATE INDEX IF NOT EXISTS idx_data_breach_notifications_date ON data_breach_notifications(breach_date);
CREATE INDEX IF NOT EXISTS idx_privacy_impact_assessments_id ON privacy_impact_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_privacy_impact_assessments_status ON privacy_impact_assessments(approval_status);
CREATE INDEX IF NOT EXISTS idx_data_retention_schedules_id ON data_retention_schedules(schedule_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_schedules_category ON data_retention_schedules(data_category);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_preferences_user ON cookie_consent_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_preferences_session ON cookie_consent_preferences(session_id);
CREATE INDEX IF NOT EXISTS idx_data_anonymization_logs_subject ON data_anonymization_logs(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_anonymization_logs_category ON data_anonymization_logs(data_category);
CREATE INDEX IF NOT EXISTS idx_gdpr_audit_logs_action ON gdpr_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_audit_logs_subject ON gdpr_audit_logs(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_audit_logs_timestamp ON gdpr_audit_logs(timestamp);

-- Data Retention Lifecycle

CREATE TABLE IF NOT EXISTS data_archival_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archival_id VARCHAR(50) UNIQUE NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    record_count INTEGER NOT NULL,
    archival_method VARCHAR(50),
    storage_location VARCHAR(200),
    archival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retention_period VARCHAR(50),
    disposal_date TIMESTAMP,
    checksum VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_disposal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disposal_id VARCHAR(50) UNIQUE NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    record_count INTEGER NOT NULL,
    disposal_method VARCHAR(50),
    disposal_reason VARCHAR(200),
    disposal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disposed_by VARCHAR(100),
    verification_method VARCHAR(50),
    compliance_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retention_policy_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(50) UNIQUE NOT NULL,
    policy_id VARCHAR(50) NOT NULL,
    execution_type VARCHAR(30),
    records_processed INTEGER NOT NULL DEFAULT 0,
    execution_status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    next_execution_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_retention_exceptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exception_id VARCHAR(50) UNIQUE NOT NULL,
    data_subject_id VARCHAR(100),
    data_category VARCHAR(100) NOT NULL,
    exception_type VARCHAR(50),
    exception_reason TEXT,
    exception_duration VARCHAR(50),
    approved_by VARCHAR(100),
    approval_date TIMESTAMP,
    expiry_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_lifecycle_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    data_subject_id VARCHAR(100),
    data_category VARCHAR(100) NOT NULL,
    event_type VARCHAR(30),
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    ip_address TEXT,
    user_agent TEXT,
    event_details TEXT,
    compliance_status VARCHAR(20) DEFAULT 'compliant'
);

CREATE TABLE IF NOT EXISTS storage_optimization_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_id VARCHAR(50) UNIQUE NOT NULL,
    data_category VARCHAR(100) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    active_records INTEGER NOT NULL DEFAULT 0,
    archived_records INTEGER NOT NULL DEFAULT 0,
    deleted_records INTEGER NOT NULL DEFAULT 0,
    storage_size_bytes INTEGER NOT NULL DEFAULT 0,
    compression_ratio DECIMAL(5,2),
    last_optimization_date TIMESTAMP,
    next_optimization_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_archival_logs_category ON data_archival_logs(data_category);
CREATE INDEX IF NOT EXISTS idx_data_archival_logs_date ON data_archival_logs(archival_date);
CREATE INDEX IF NOT EXISTS idx_data_disposal_logs_category ON data_disposal_logs(data_category);
CREATE INDEX IF NOT EXISTS idx_data_disposal_logs_date ON data_disposal_logs(disposal_date);
CREATE INDEX IF NOT EXISTS idx_retention_policy_executions_policy ON retention_policy_executions(policy_id);
CREATE INDEX IF NOT EXISTS idx_retention_policy_executions_status ON retention_policy_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_data_retention_exceptions_subject ON data_retention_exceptions(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_exceptions_category ON data_retention_exceptions(data_category);
CREATE INDEX IF NOT EXISTS idx_data_retention_exceptions_status ON data_retention_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_subject ON data_lifecycle_events(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_category ON data_lifecycle_events(data_category);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_type ON data_lifecycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_data_lifecycle_events_timestamp ON data_lifecycle_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_storage_optimization_metrics_category ON storage_optimization_metrics(data_category);

-- Demo / Training Mode Tables

CREATE TABLE IF NOT EXISTS demo_achievements (
    achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    points_earned INTEGER DEFAULT 0,
    badge_icon VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'common',
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT DEFAULT '{}',
    UNIQUE(user_id, achievement_type, achievement_name)
);

CREATE TABLE IF NOT EXISTS demo_scenario_attempts (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    scenario_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    time_taken INTEGER,
    success INTEGER DEFAULT 0,
    feedback TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scenario_id, started_at)
);

CREATE TABLE IF NOT EXISTS demo_user_progress (
    progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    scenarios_completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_time INTEGER,
    skill_level VARCHAR(20) DEFAULT 'beginner',
    experience_points INTEGER DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences TEXT DEFAULT '{}',
    UNIQUE(user_id, role_name)
);

CREATE TABLE IF NOT EXISTS demo_leaderboard_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    total_score INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    scenarios_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, user_id)
);

CREATE TABLE IF NOT EXISTS demo_scenarios (
    scenario_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    estimated_duration INTEGER,
    max_score INTEGER DEFAULT 1000,
    objectives TEXT DEFAULT '[]',
    required_roles TEXT DEFAULT '[]',
    prerequisites TEXT DEFAULT '[]',
    config TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_score INTEGER DEFAULT 0,
    scenarios_played INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    session_duration INTEGER,
    feedback_rating INTEGER,
    feedback_text TEXT,
    metadata TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS demo_tutorial_progress (
    progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tutorial_id VARCHAR(50) NOT NULL,
    step_completed INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, tutorial_id)
);

CREATE TABLE IF NOT EXISTS demo_feature_flags (
    flag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled INTEGER DEFAULT 0,
    rollout_percentage INTEGER DEFAULT 0,
    target_roles TEXT DEFAULT '[]',
    conditions TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_analytics (
    analytics_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    event_data TEXT DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_demo_achievements_user ON demo_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_achievements_type ON demo_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_demo_scenario_attempts_user ON demo_scenario_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_scenario_attempts_scenario ON demo_scenario_attempts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_demo_user_progress_user ON demo_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_leaderboard_date ON demo_leaderboard_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user ON demo_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_analytics_event ON demo_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_demo_analytics_timestamp ON demo_analytics(timestamp);

-- Seed data

INSERT OR IGNORE INTO roles (id, name, description) VALUES (1, 'admin', 'System Administrator');
INSERT OR IGNORE INTO roles (id, name, description) VALUES (4, 'super_admin', 'System super administrator');

INSERT OR IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role_id, is_active)
VALUES (1, 'admin', 'admin@tptflightcontrol.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 1, 1);

-- Core modules (all enabled for demo)
INSERT OR IGNORE INTO modules (id, name, description, is_enabled) VALUES
(1,  'flights',          'Flight management and scheduling',         1),
(2,  'passengers',       'Passenger and booking management',         1),
(3,  'baggage',          'Baggage tracking system',                  1),
(4,  'security',         'Security and check-in operations',         1),
(5,  'ground_ops',       'Ground operations and maintenance',        1),
(6,  'analytics',        'Reporting and analytics',                  1),
(7,  'admin',            'System administration',                    1),
(8,  'infrastructure',   'Infrastructure management',                1),
(9,  'drones',           'Drone operations',                         1),
(10, 'customs',          'Customs and border protection',            1),
(11, 'cargo',            'Cargo operations',                         1),
(12, 'commercial',       'Commercial operations',                    1),
(13, 'emergency',        'Emergency management',                     1),
(14, 'sustainability',   'Sustainability and environment',           1),
(15, 'virtual_assistant','Virtual assistant / AI',                   1);

-- Admin role: full access to all modules
INSERT OR IGNORE INTO role_permissions (role_id, module_id, permission)
SELECT 1, id, p.permission FROM modules, (
    SELECT 'read'  AS permission UNION ALL
    SELECT 'write' UNION ALL
    SELECT 'admin'
) p;

-- Super admin role: full access to all modules
INSERT OR IGNORE INTO role_permissions (role_id, module_id, permission)
SELECT 4, id, p.permission FROM modules, (
    SELECT 'read'  AS permission UNION ALL
    SELECT 'write' UNION ALL
    SELECT 'admin'
) p;

INSERT OR IGNORE INTO demo_scenarios (scenario_id, title, description, category, difficulty, estimated_duration, max_score, objectives, required_roles) VALUES
('morning_rush', 'Morning Rush Hour', 'Handle peak morning traffic with multiple arrivals and departures', 'peak_hours', 'intermediate', 15, 1000,
 '["Process 20 flights on time", "Handle 2 gate changes efficiently", "Maintain passenger satisfaction above 85%"]',
 '["controller", "dispatcher", "operator"]'),
('weather_diversion', 'Weather Emergency Diversion', 'Manage flight diversions due to sudden weather changes', 'emergency', 'advanced', 20, 1500,
 '["Divert 5 flights safely", "Rebook 200+ passengers", "Communicate effectively with airlines"]',
 '["controller", "emergency_coordinator", "dispatcher"]'),
('security_threat', 'Security Threat Response', 'Respond to a security incident and coordinate emergency procedures', 'security', 'advanced', 18, 1200,
 '["Secure affected areas within 5 minutes", "Evacuate 500+ passengers safely", "Coordinate with authorities"]',
 '["security_officer", "emergency_coordinator", "controller"]'),
('cargo_crisis', 'Perishable Cargo Emergency', 'Handle temperature-sensitive cargo that needs immediate attention', 'cargo', 'intermediate', 12, 800,
 '["Identify affected cargo containers", "Coordinate alternative routing", "Minimize financial losses"]',
 '["cargo_manager", "infrastructure_manager", "dispatcher"]'),
('vip_handling', 'VIP Passenger Arrival', 'Manage high-profile passenger arrival with special requirements', 'passenger', 'intermediate', 10, 600,
 '["Coordinate special services team", "Ensure passenger privacy", "Manage media presence"]',
 '["passenger_services_rep", "security_officer", "commercial_manager"]'),
('infrastructure_failure', 'Building Systems Failure', 'Respond to critical infrastructure failure affecting operations', 'infrastructure', 'advanced', 16, 1100,
 '["Identify system failure cause", "Implement backup systems", "Minimize operational disruption"]',
 '["infrastructure_manager", "emergency_coordinator", "dispatcher"]'),
('drone_incident', 'UAV Airspace Violation', 'Handle unauthorized drone activity in controlled airspace', 'drones', 'intermediate', 14, 900,
 '["Detect drone intrusion", "Coordinate interception", "Ensure flight safety"]',
 '["drone_operator", "controller", "security_officer"]'),
('customs_rush', 'International Flight Wave', 'Process high volume of international arrivals efficiently', 'customs', 'beginner', 12, 700,
 '["Process 150+ passengers", "Identify high-risk items", "Maintain processing speed"]',
 '["customs_officer", "security_officer", "passenger_services_rep"]'),
('sustainability_crisis', 'Environmental Incident', 'Respond to environmental emergency affecting airport operations', 'sustainability', 'intermediate', 10, 650,
 '["Assess environmental impact", "Implement containment procedures", "Coordinate cleanup efforts"]',
 '["sustainability_officer", "emergency_coordinator", "infrastructure_manager"]'),
('ai_system_failure', 'AI System Malfunction', 'Handle failure of automated systems requiring manual intervention', 'ai', 'advanced', 18, 1300,
 '["Identify system failure", "Switch to manual operations", "Restore automated systems"]',
 '["ai_analyst", "infrastructure_manager", "dispatcher"]');

PRAGMA foreign_keys = ON;
