"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">이</span>
            </div>
            <span className="text-xl font-bold text-gray-900">이퀄로컬</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/contests" className="text-gray-700 hover:text-blue-600 font-medium">
              공모전 찾기
            </Link>
            <Link href="/teams" className="text-gray-700 hover:text-blue-600 font-medium">
              팀 매칭
            </Link>
            <Link href="/ai-recommend" className="text-gray-700 hover:text-blue-600 font-medium">
              AI추천 받기
            </Link>
          </nav>

          {/* 검색바 */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="공모전 검색..." className="pl-10 w-64" />
            </div>
          </div>

          {/* 로그인 상태에 따른 UI */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={/*user.avatar || */ "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback>{user?.username?.[0] || ""}</AvatarFallback>
                    </Avatar>
                    {/* <span className="font-medium">{user.name}님</span> */}
                    <span className="font-medium">{user?.username || "사용자"}님</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/mypage" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>회원가입</Button>
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="공모전 검색..." className="pl-10" />
              </div>
              <Link href="/contests" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                공모전 찾기
              </Link>
              <Link href="/teams" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                팀 매칭
              </Link>
              <Link href="/ai-recommend" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                AI추천 받기
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center space-x-2 py-2">
                      <Avatar className="w-8 h-8">
                          <AvatarImage src={/*user?.avatar || */"/placeholder.svg"} alt={user?.username || "사용자"} />
                          <AvatarFallback>{user?.username?.[0] || ""}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user?.username || "사용자"}님</span>
                    </div>
                    <Link href="/mypage">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        마이페이지
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">회원가입</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
