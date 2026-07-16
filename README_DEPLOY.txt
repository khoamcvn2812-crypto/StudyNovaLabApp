NOVALAB PWA — HƯỚNG DẪN TEST

1. Giải nén và upload NGUYÊN BỘ các file/thư mục lên GitHub hoặc Vercel:
   - index.html
   - studynova_writing_vault.html
   - manifest.webmanifest
   - service-worker.js
   - thư mục icons

2. PWA chỉ hoạt động đúng trên HTTPS hoặc localhost.
   Mở file index.html trực tiếp bằng file:// sẽ không cài được app.

3. Sau khi deploy:
   - Android/Chrome/Edge: mở web và bấm nút “Cài NovaLab”.
   - iPhone/iPad: bấm “Cài NovaLab”, sau đó Chia sẻ → Thêm vào Màn hình chính.
   - Máy tính: Chrome/Edge sẽ hiện tùy chọn Install app.

4. Mở web online ít nhất một lần để service worker lưu tài nguyên.
   Sau đó web chính và Writing Vault có thể mở offline ở mức cơ bản.

5. Dữ liệu học vẫn dùng localStorage như bản web hiện tại.
   Hãy xuất backup trước khi đổi domain, xóa dữ liệu trình duyệt hoặc chuyển thiết bị.


BACKUP TRÊN ĐIỆN THOẠI
- Copy mã sao lưu: dán vào Ghi chú, Drive, Gmail hoặc tin nhắn riêng.
- Chia sẻ: gửi file/mã qua bảng Share của điện thoại.
- Khôi phục bằng cách dán: mở Sao lưu, chọn Khôi phục bằng cách dán mã.
- Không đăng mã backup công khai vì nó chứa dữ liệu học cá nhân.
