CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'RECEPTIONIST', 'WAITER', 'CHEF', 'GUEST')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE')),
    floor SMALLINT NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
    max_occupancy SMALLINT NOT NULL CHECK (max_occupancy > 0)
);

CREATE TABLE bookings (
    booking_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL REFERENCES users(user_id),
    room_id INT NOT NULL REFERENCES rooms(room_id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('RESERVED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    total_room_charges DECIMAL(10, 2) DEFAULT 0,
    created_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out > check_in),
    UNIQUE (room_id, check_in, check_out)
);

CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('STARTER', 'MAIN', 'DESSERT', 'BEVERAGE')),
    price DECIMAL(8, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES users(user_id)
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(booking_id),
    waiter_id BIGINT NOT NULL REFERENCES users(user_id),
    table_number VARCHAR(10),
    status VARCHAR(20) CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED')),
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('DIRECT', 'ROOM_TAB')),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES menu_items(item_id) ON DELETE RESTRICT,
    quantity SMALLINT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(8, 2) NOT NULL,
    line_total DECIMAL(10, 2)
);

CREATE TABLE invoices (
    invoice_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(booking_id),
    order_id BIGINT REFERENCES orders(order_id),
    invoice_type VARCHAR(30) CHECK (invoice_type IN ('ROOM_FOLIO', 'RESTAURANT_DIRECT', 'ROOM_TAB_SETTLEMENT')),
    amount_due DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'CARD', 'UPI', 'BANK_TRANSFER')),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP,
    issued_by BIGINT REFERENCES users(user_id)
);
