import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 소개 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">이</span>
              </div>
              <span className="text-xl font-bold">이퀄로컬</span>
            </div>
            <p className="text-gray-400 mb-4">
              공모전과 팀 매칭을 통해 여러분의 꿈을 실현해보세요. AI 추천 시스템으로 맞춤형 공모전을 찾아드립니다.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contests" className="text-gray-400 hover:text-white">
                  공모전 찾기
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-gray-400 hover:text-white">
                  팀 매칭
                </Link>
              </li>
              <li>
                <Link href="/ai-recommend" className="text-gray-400 hover:text-white">
                  AI 추천
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-gray-400 hover:text-white">
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 이퀄로컬. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
