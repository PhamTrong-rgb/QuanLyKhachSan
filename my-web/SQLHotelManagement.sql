USE [Hotel Management];
GO

-- 1. Bảng Users (Tài khoản hệ thống)
CREATE TABLE Users (
    id NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20),
    avatar NVARCHAR(max)
);

-- 2. Bảng Staff (Nhân viên - tách biệt với Users theo cấu trúc API)
CREATE TABLE Staff (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100),
    role NVARCHAR(50),
    avatar NVARCHAR(max)
);

-- 3. Bảng Rooms (Phòng)
CREATE TABLE Rooms (
    id NVARCHAR(50) PRIMARY KEY,
    roomNumber INT NOT NULL,
    type NVARCHAR(50),
    price DECIMAL(18, 2),
    status NVARCHAR(20),
    image NVARCHAR(max)
);

-- 4. Bảng Customers (Khách hàng)
CREATE TABLE Customers (
    id NVARCHAR(50) PRIMARY KEY,
    fullName NVARCHAR(100),
    phonenumber VARCHAR(20),
    email VARCHAR(100),
    idCard VARCHAR(20)
);

-- 5. Bảng Services (Dịch vụ)
CREATE TABLE Services (
    id NVARCHAR(50) PRIMARY KEY,
    serviceName NVARCHAR(100),
    price DECIMAL(18, 2),
    description NVARCHAR(255)
);

-- 6. Bảng Bookings (Đặt phòng)
CREATE TABLE Bookings (
    id NVARCHAR(50) PRIMARY KEY,
    roomId INT, -- Lưu ý: Trong API schema để kiểu number (có thể tham chiếu tới roomNumber)
    customerName NVARCHAR(100), -- API lưu trực tiếp tên khách vào booking
    checkIn DATETIME,
    checkOut DATETIME,
    totalAmount DECIMAL(18, 2)
);

-- 7. Bảng Transactions (Giao dịch/Thanh toán)
CREATE TABLE Transactions (
    id INT PRIMARY KEY IDENTITY(1,1),
    type NVARCHAR(50), -- Ví dụ: Thu/Chi
    amount DECIMAL(18, 2),
    category NVARCHAR(50),
    bookingId INT,
    description NVARCHAR(max),
    createdAt DATETIME DEFAULT GETDATE()
);