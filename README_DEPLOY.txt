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


TỰ CHUYỂN CÂU & LÀM LẠI
- Ôn tập và Kiểm tra: trả lời đúng sẽ tự chuyển câu tiếp theo.
- Trả lời sai: câu hỏi được giữ nguyên để làm lại.
- Trong bài kiểm tra, câu từng trả lời sai vẫn được ghi là câu cần ôn,
  dù người học đã sửa đúng ở lần thử sau.


NOVALAB COMPLETE LEARNING SYSTEM v5
1. Smart Review:
   - Mỗi từ có lịch ôn riêng.
   - Ôn theo mức Again / Hard / Good / Easy.
   - Từ đến hạn được ưu tiên trên Dashboard và trang Ôn tập.

2. Practice / Exam:
   - Luyện tập: sai được làm lại, đúng tự chuyển.
   - Thi thật: mỗi câu một lần, không hiện đáp án ngay.
   - Kết quả tách điểm lần đầu và kết quả sau khi sửa.

3. Writing Error Review:
   - Writing Vault có bài ôn lỗi theo lịch 1-3-7-14-30 ngày.
   - Đúng tự chuyển, sai làm lại.
   - Có thể thêm câu đúng vào Vocabulary hoặc làm chunk.

4. Today Center:
   - Tổng hợp từ đến hạn, từ mới, lỗi Writing, Speaking và Reading.

5. Pronunciation & Shadowing:
   - Nghe từ/câu bằng giọng tiếng Anh.
   - Điều chỉnh tốc độ, ghi âm và nghe lại.

6. Safe Cloud Sync:
   - So sánh dữ liệu máy/cloud.
   - Chọn giữ máy, giữ cloud hoặc gộp.
   - Tự tạo backup cục bộ trước khi ghi đè.

7. PWA Update:
   - Khi có bản mới, web hiện nút Cập nhật.
   - Service worker cache: v5.

DEPLOY
- Giải nén ZIP.
- Upload toàn bộ nội dung vào thư mục gốc GitHub/Vercel.
- Không upload riêng file ZIP.


NOVALAB v6 — MISTAKE SCANNER + COMPLETE LANGUAGE CHECK
1. Writing Mistake Scanner
   - Automatically compares the current essay with saved Mistake Bank items.
   - Detects full incorrect sentences and smaller incorrect fragments.
   - Shows context, correction, explanation, source essay, and occurrence count.
   - Can replace the detected phrase directly in the essay.
   - Auto-scan while typing can be turned on/off.
   - Mastered mistakes can be included optionally.

2. Vietnamese / English interface
   - Writing Vault now has its own language switch.
   - Language is synchronised between index.html and Writing Vault.
   - Added translations for Complete Learning System v5 features.
   - Runtime translation audit functions:
       snTranslationAudit(true)
       wvTranslationAudit(true)

3. PWA
   - Service worker cache upgraded to v6.


NOVALAB v8 — v6 REFINED
- Built directly from v6. The expandable v6 navigation is unchanged.
- Replaced “Hôm nay nên học gì?” on the Home page with a compact “Hôm nay”
  panel that recommends one priority task and shows daily progress.
- Added a carefully aligned floating + button:
  Desktop: bottom-right.
  Mobile: positioned above the existing v6 bottom navigation.
- Added data-only global search with Ctrl + K.
  Search covers:
  Vocabulary and chunks
  Main Mistake Bank
  Writing essays and corrections
  Reading data
  Speaking logs
  It does not search or display app features.
- Added shortcuts:
  Ctrl + Shift + 1: Theme
  Ctrl + Shift + 2: Language
  Ctrl + Shift + 3: Backup
  Ctrl + Shift + 4: Add word
  Ctrl + Shift + 5: Add mistake
  Ctrl + Shift + 6: Add essay
  Ctrl + Shift + 7: Open Writing Vault
  Ctrl + Shift + 8: Open word library
- Added Search and Shortcuts buttons inside the existing expandable top menu.
- Service worker cache upgraded to v8.
- Existing localStorage keys and all v6 functions are retained.
