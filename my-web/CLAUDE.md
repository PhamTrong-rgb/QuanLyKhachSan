# Lệnh thực thi & Khởi chạy (Commands)

- **Môi trường phát triển**: `npm run dev` (Khởi chạy trên http://localhost:3000)
- **Build production**: `npm run build`
- **Khởi chạy production**: `npm run start`
- **Chạy Linter**: `npm run lint`
- **Cài đặt package**: Khuyến khích dùng `npm install <tên-package>`

# Kiến trúc & Công nghệ (Tech Stack)

- **Framework Core**: Next.js 16.x (Sử dụng App Router)
- **UI Framework/Library**: React 19.x
- **Styling**: Tailwind CSS v4 (Sử dụng các class utility của Tailwind, hạn chế viết CSS thuần trừ khi cần custom animation/glassmorphism nâng cao)
- **Ngôn ngữ**: TypeScript (Luôn định nghĩa interface/type rõ ràng cho các props và state)

# Quy chuẩn viết Code (Code Style & Guidelines)

## 1. Cấu trúc và Đặt tên (Naming Conventions)
- **Thư mục & File định tuyến (Routing)**: Theo chuẩn của Next.js App Router (sử dụng `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Đặt tên thư mục routing dạng `kebab-case` (VD: `/app/room-details/[id]`).
- **File Components**: Tên file theo dạng `kebab-case` (VD: `hotel-card.tsx`).
- **React Components / Interfaces**: Sử dụng `PascalCase` (VD: `HotelCard`, `RoomDetailsType`).
- **Biến & Hàm (Variables & Functions)**: Sử dụng `camelCase` (VD: `fetchRooms`, `isAvailable`).
- **Hằng số (Constants)**: Sử dụng `UPPER_SNAKE_CASE` (VD: `MAX_GUESTS_PER_ROOM`, `API_BASE_URL`).

## 2. Thiết kế UI/UX & Giao diện (Aesthetics & Design)
- **Mỹ thuật và Thẩm mỹ (Premium Design)**: Giao diện quản lý khách sạn cần mang lại cảm giác sang trọng, cao cấp, và thân thiện.
  - Tận dụng hệ thống màu hiện đại, thiết kế có sự tương phản tốt.
  - Áp dụng các hiệu ứng Hover, Micro-animations, bóng đổ (Shadows), hoặc Glassmorphism nếu phù hợp.
  - Tuyệt đối tránh thiết kế nhạt nhòa, phối màu mặc định (đỏ tươi, xanh lam cơ bản). Ưu tiên các palette màu hài hòa (Ví dụ: Midnight Blue, Gold/Bronze nhạt cho khách sạn sang trọng, hoặc Neutral/Minimalism).
- **Font chữ**: Sử dụng các font hiện đại như Inter, Roboto, hoặc Outfit (được cung cấp bởi `next/font`).

## 3. Quản lý trạng thái và Logic (State Management)
- **Ưu tiên Server Components**: Component nào không cần tương tác trực tiếp/state từ phía client thì MẶC ĐỊNH là Server Component (không dùng `"use client"`).
- **Client Components**: Chỉ gắn `'use client'` khi thực sự cần dùng React Hooks (`useState`, `useEffect`, `useRef`) hoặc xử lý các event DOM (`onClick`, `onChange`).
- Tách biệt rõ ràng phần biểu diễn giao diện (UI) và phần xử lý logic/gọi API.

## 4. Tối ưu hóa SEO (SEO Best Practices)
- Đối với trang chính của khách sạn, mỗi `page.tsx` hoặc `layout.tsx` nên export hằng số `metadata` chuẩn của Next.js.
- Cấu trúc thẻ HTML rõ ràng, sử dụng đúng ngữ nghĩa HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Đảm bảo mỗi trang chỉ có 1 thẻ `<h1>` duy nhất mang tính tổng quát nhất của trang.
- Đặt thuộc tính `id` rõ ràng và duy nhất đối với các phân khúc tương tác để hỗ trợ testing.

## 5. Nguyên tắc dành cho AI
- Bắt buộc trả lời, phân tích, đặt tên biến tự do (trong các ngữ cảnh hợp lý), và viết tài liệu bằng **Tiếng Việt** phục vụ cho người dùng.
- Giữ nguyên tất cả các comments/docstrings không liên quan khi sửa đổi một file hiện có.
- Tránh thay thế toàn bộ file nếu chỉ cần sửa đổi từng phần lẻ (tiết kiệm tài nguyên).
- Xây dựng component sao cho chúng tái sử dụng được và độc lập tối đa. Đoán trước và sử dụng ảnh/videos minh họa nếu cần bằng công cụ tạo ảnh.
