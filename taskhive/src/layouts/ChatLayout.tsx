// src/layouts/ChatLayout.tsx
import Navbar from "../components/Navbar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // chiều cao Navbar thực tế (đang fixed). Nếu navbar bạn cao khác, đổi giá trị này.
  const NAVBAR_H_REM = 5.75; // 5rem = ~80px

  return (
    <>
      <Navbar />
      {/* spacer để không bị navbar che */}
      <div style={{ height: `${NAVBAR_H_REM}rem` }} />
      {/* vùng nội dung chiếm trọn chiều cao còn lại, khóa scroll toàn trang */}
      <main className="h-[calc(100vh-5.75rem)] overflow-hidden bg-gray-50">
        {children}
      </main>
    </>
  );
}
