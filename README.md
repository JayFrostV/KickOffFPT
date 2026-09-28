# ⚡ QuizApp - Online Quiz & Exam Platform

Hệ thống thi trắc nghiệm trực tuyến toàn diện, phân quyền 3 tác tử (**Guest**, **User**, **Administrator**), xây dựng bằng **.NET 9 Clean Architecture** và **Angular 18 Standalone**.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

### 🔹 Backend (.NET 9 Web API)
- **Kiến trúc:** Clean / Onion Architecture (Domain, Infrastructure, Application, API).
- **Cơ sở dữ liệu:** SQL Server (EF Core Code First, Migrations).
- **Bảo mật:** JWT Bearer Authentication, BCrypt Password Hashing.
- **Tiện ích:** AutoMapper, Swagger / OpenAPI.

### 🔹 Frontend (Angular 18)
- **Kiến trúc:** Standalone Components, Angular Signals (Reactive State), Functional Guards & Interceptors.
- **Giao diện:** Tailwind CSS Dark Space Theme (`#0a0a14`), Glassmorphism, Google Fonts (*Space Grotesk* + *Inter*).
- **Xử lý form:** Reactive Forms, Custom Validators.

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy (Quick Start)

### 1. Yêu cầu môi trường
- .NET 8.0 hoặc .NET 9.0 SDK
- Node.js (v18+) & Angular CLI (`npm install -g @angular/cli`)
- SQL Server (Local / Express)

### 2. Cấu hình Cơ sở dữ liệu & Chạy Backend
```powershell
# Chuyển vào thư mục Backend
cd QuizApp

# Cập nhật database SQL Server (nếu cần)
dotnet ef database update --project QuizApp.Infrastructure --startup-project QuizApp.API

# Chạy API server
dotnet run --project QuizApp.API
```
> API Server lắng nghe tại: `http://localhost:5000` (Swagger: `http://localhost:5000/swagger`)

### 3. Cài đặt & Chạy Frontend
```powershell
# Mở một cửa sổ Terminal mới, chuyển vào thư mục Frontend
cd quiz-frontend

# Cài đặt thư viện dependencies
npm install

# Khởi chạy giao diện
ng serve
```
> Ứng dụng chạy tại: `http://localhost:4200`

---

## 🔑 Tài khoản mẫu (Demo Accounts)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 🛡️ **Administrator** | `devillhardgamer@gmail.com` | `Admin@123` |
| 👤 **User** | `test@test.com` | `Password123!` |
| 🌐 **Guest** | Không cần đăng nhập | Tối đa 3 lượt thi thử nghiệm miễn phí |

---

## 📚 Tính năng chính
- **Guest Trial:** Làm bài thi thử 3 lần không cần đăng ký.
- **Question Banks:** Ngân hàng câu hỏi cá nhân và công khai (Single Choice, Multiple Choice, True/False).
- **Quiz Management:** Tạo đề thi, hẹn giờ (phút), lấy câu hỏi từ ngân hàng, xuất bản (Publish).
- **Take Quiz & Grading:** Chấm điểm tự động, giao diện làm bài hiện đại, đếm ngược thời gian, xem lại đáp án đúng/sai.
- **Admin Dashboard:** Quản trị thành viên (Active/Inactive), kiểm duyệt và gỡ đề thi vi phạm.
