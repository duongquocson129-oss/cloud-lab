# Cloud Lab - MERN Multi-Container Deployment

## 1. Giới thiệu dự án

Dự án này là ứng dụng Quản lý sinh viên theo kiến trúc MERN (MongoDB, Express, React, Node.js), được xây dựng và triển khai theo mô hình multi-container trên Docker, và sau đó deploy lên nền tảng PaaS miễn phí Render.com.

Mục tiêu của lab là:
- Hiểu cách triển khai ứng dụng web theo mô hình container
- Kết nối backend với MongoDB Atlas trên cloud
- Triển khai frontend và backend lên Render
- Xử lý lỗi CORS trong môi trường production
- Quản lý biến môi trường an toàn và hiệu quả

---

## 2. Công nghệ sử dụng

- Node.js
- Express.js
- React + Vite
- MongoDB Atlas
- Docker
- Docker Hub
- Render.com
- GitHub

---

## 3. Cấu trúc thư mục

```text
cloud-lab/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.hub.yml
├── Dockerfile
├── README.md
├── mern-demo/
│   ├── package.json
│   ├── server/
│   │   ├── Dockerfile
│   │   └── server.js
│   └── client/
│       ├── Dockerfile
│       ├── package.json
│       ├── vite.config.js
│       └── src/
│           ├── App.jsx
│           ├── App.css
│           ├── main.jsx
│           └── index.css
├── docs/
├── backup/
└── permission-test/
```

---

## 4. Chức năng chính

- Xem danh sách sinh viên
- Thêm sinh viên mới
- Cập nhật thông tin sinh viên
- Xóa sinh viên
- Giao tiếp giữa frontend và backend qua API REST
- Kết nối tới MongoDB Atlas
- Cấu hình CORS cho production

---

## 5. Cài đặt local

### Bước 1: Clone dự án

```bash
git clone <repo-url>
cd cloud-lab
```

### Bước 2: Cài đặt dependencies

```bash
cd mern-demo
npm install
cd client
npm install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` dựa trên `.env.example`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

### Bước 4: Chạy ứng dụng local

Backend:

```bash
cd mern-demo
PORT=5000 node server/server.js
```

Frontend:

```bash
cd mern-demo/client
npm run dev -- --host 0.0.0.0
```

---

## 6. Chạy bằng Docker Compose

### Backend + Frontend

```bash
docker compose up --build
```

### Dùng image từ Docker Hub

```bash
docker compose -f docker-compose.hub.yml up
```

---

## 7. Docker Hub và Render

### 7.1 Push image lên Docker Hub

```bash
docker build -t <dockerhub-username>/mern-backend:1.0 ./mern-demo

docker push <dockerhub-username>/mern-backend:1.0

docker build -t <dockerhub-username>/mern-frontend:2.0 ./mern-demo/client

docker push <dockerhub-username>/mern-frontend:2.0
```

### 7.2 Deploy backend trên Render

- Chọn Web Service
- Chọn Deploy an existing image from a registry
- Nhập image URL:

```text
<dockerhub-username>/mern-backend:1.0
```

- Thiết lập port nội bộ: `5000`
- Thêm environment variables:
  - `MONGODB_URI`
  - `PORT=5000`
  - `NODE_ENV=production`
  - `CLIENT_URL=https://<frontend-url>`

### 7.3 Deploy frontend trên Render

- Chọn Web Service
- Nhập image URL:

```text
<dockerhub-username>/mern-frontend:2.0
```

- Thiết lập port nội bộ: `4173` hoặc `80` tùy cấu hình Docker
- Thêm environment variables:
  - `VITE_API_URL=https://<backend-url>`

---

## 8. Cấu hình CORS cho production

Để tránh lỗi CORS khi frontend chạy trên domain khác với backend, backend cần cho phép origin tương ứng.

Ví dụ trong file `mern-demo/server/server.js`:

```js
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

Điều này giúp frontend trên Render có thể gọi API backend trên Render mà không bị chặn bởi trình duyệt.

---

## 9. Kiểm thử API

### Hello endpoint

```bash
curl http://localhost:5000/api/hello
```

Kết quả mong đợi:

```json
{"message":"Backend is running successfully."}
```

### Student endpoint

```bash
curl http://localhost:5000/api/students
```

---

## 10. Kết quả triển khai mong đợi

Sau khi deploy thành công, hệ thống sẽ có dạng:

```text
Browser
  └──> Render Frontend
         └──> Render Backend
                 └──> MongoDB Atlas
```

Các URL mong đợi:

- GitHub Repository: `https://github.com/<username>/cloud-lab`
- Docker Hub Backend: `https://hub.docker.com/r/<username>/mern-backend`
- Render Backend: `https://mern-backend-<student-id>.onrender.com`
- Render Frontend: `https://mern-frontend-<student-id>.onrender.com`

---

## 11. Ghi chú quan trọng

- Không commit file `.env` lên GitHub
- Sử dụng `.env.example` để lưu mẫu cấu hình an toàn
- MongoDB Atlas cần cho phép IP `0.0.0.0/0` nếu backend chạy trên Render
- Render Free Tier có thể gặp cold start, nên request đầu tiên có thể chậm hơn

---

## 12. Tóm tắt

Dự án cho thấy cách xây dựng một ứng dụng web MERN theo hướng production-ready, chạy trong container, lưu trữ trên Docker Hub và triển khai lên Render. Đây là mô hình phổ biến trong thực tế cho các ứng dụng web nhỏ và vừa trên nền tảng PaaS.

---

## 13. Thông tin người thực hiện

- Học phần: Cloud Lab
- Chủ đề: MERN Deployment on Render
- Môi trường: Docker + MongoDB Atlas + Render

Nếu cần, bạn có thể chỉnh sửa phần này theo tên của bạn, mã số sinh viên và các URL thật sau khi triển khai lên môi trường cloud.
