CREATE TABLE td_user_roles (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE td_client_shopes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    email VARCHAR(150),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE td_users_data (
    id BIGINT PRIMARY key AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_shop Foreign Key (shop_id) REFERENCES td_client_shopes(id),
    CONSTRAINT fk_users_role Foreign Key (role_id) REFERENCES td_user_roles(id)
);

CREATE TABLE td_product_categories(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_categories_shop FOREIGN KEY (shop_id) REFERENCES td_client_shopes(id),
    CONSTRAINT uq_product_category_shop_name UNIQUE (shop_id, name)
);

CREATE TABLE td_products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_shop FOREIGN KEY (shop_id) REFERENCES td_client_shopes(id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES td_product_categories(id)
);

CREATE TABLE td_product_variants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    variant_group_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    barcode VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES td_products(id),
    CONSTRAINT uq_product_variant_sku UNIQUE (sku),
    CONSTRAINT uq_product_variant_barcode UNIQUE (barcode),
    CONSTRAINT fk_product_variants_group FOREIGN KEY (variant_group_id) REFERENCES td_product_variant_groups(id) ON DELETE CASCADE;

);

CREATE TABLE td_product_variant_groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_groups_product FOREIGN KEY (product_id) REFERENCES td_products(id) ON DELETE CASCADE,
    CONSTRAINT uq_variant_group_product_name UNIQUE (product_id, name)
);

CREATE TABLE td_product_variant_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    variant_group_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_images_group FOREIGN KEY (variant_group_id) REFERENCES td_product_variant_groups(id) ON DELETE CASCADE
);

CREATE TABLE td_customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_shop FOREIGN KEY (shop_id) REFERENCES td_client_shopes(id) ON DELETE CASCADE,
    CONSTRAINT uq_customer_shop_email UNIQUE (shop_id, email)
);

CREATE TABLE td_customer_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(150),
    address_type ENUM('HOME', 'WORK', 'OTHER') NOT NULL DEFAULT 'HOME',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES td_customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_addresses_shop FOREIGN KEY (shop_id) REFERENCES td_client_shopes(id) ON DELETE CASCADE
);

CREATE TABLE td_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_charges DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) NOT NULL DEFAULT 'PENDING' order_status ENUM(
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES td_client_shopes(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES td_customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES td_customer_addresses(id) ON DELETE RESTRICT,
    CONSTRAINT uq_orders_shop_order_number UNIQUE (shop_id, order_number)
);

CREATE TABLE td_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES td_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES td_products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES td_product_variants(id) ON DELETE RESTRICT
);