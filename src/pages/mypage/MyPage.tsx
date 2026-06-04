import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: '친구 관리', path: '/mypage/friends' },
  { label: '내 방 둘러보기', path: '/mypage/rooms' },
  { label: '내 책 모아보기', path: '/mypage/books' },
  { label: '차단', path: '/mypage/blocked' },
];

const MyPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF]">

      {/* 프로필 영역 */}
      <div className="flex flex-col items-center pt-10 pb-6">

        {/* 프로필 이미지 */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-2 border-[#3B2E1E] bg-gray-200" />

          {/* 수정 버튼 */}
          <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#3B2E1E] rounded-full flex items-center justify-center">
            <FiEdit2 size={14} color="white" />
          </button>
        </div>

        {/* 이름 */}
        <p className="mt-4 text-lg font-semibold text-[#3B2E1E]">홍길동</p>
      </div>

      {/* 메뉴 목록 */}
      <div className="flex flex-col mt-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            <button 
              className="w-full text-left px-6 py-5 text-[#3B2E1E] text-base shadow-sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>

      {/* 로그아웃 / 회원탈퇴 */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          className="text-sm text-gray-400 underline hover:text-gray-600"
          onClick={handleLogout}
        >
          로그아웃
        </button>
        <button className="text-sm text-gray-400 underline hover:text-gray-600">
          회원탈퇴
        </button>
      </div>

    </div>
  );
};

export default MyPage;
