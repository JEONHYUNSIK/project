"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Sparkles, Users, Trophy, ArrowRight } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

export default function SignupCompletePage() {

  const { user } = useAuth()

    if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 진행 단계 */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">약관동의</span>
              </div>
              <div className="w-8 h-0.5 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">정보입력</span>
              </div>
              <div className="w-8 h-0.5 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">가입완료</span>
              </div>
            </div>
          </div>

          {/* 완료 메시지 */}
          <Card className="text-center mb-8">
            <CardContent className="p-12">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입이 완료되었습니다!</h1>
                <p className="text-lg text-gray-600">이퀄로컬에 오신 것을 환영합니다</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">이제 이런 서비스를 이용할 수 있어요!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">공모전 탐색</h3>
                    <p className="text-sm text-gray-600">다양한 분야의 공모전을 찾아보세요</p>
                  </div>
                  <div className="p-4">
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">AI 맞춤 추천</h3>
                    <p className="text-sm text-gray-600">관심사에 맞는 공모전을 추천받으세요</p>
                  </div>
                  <div className="p-4">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">팀 매칭</h3>
                    <p className="text-sm text-gray-600">함께할 팀원을 찾아보세요</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button size="lg" className="w-full md:w-auto px-8">
                    로그인하러 가기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 다음 단계 안내 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">다음 단계를 추천해요</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">프로필 작성하기</h4>
                    <p className="text-sm text-gray-600">관심사와 기술 스택을 등록하여 더 정확한 추천을 받아보세요</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">관심 공모전 찾기</h4>
                    <p className="text-sm text-gray-600">
                      다양한 분야의 공모전을 탐색하고 관심 있는 공모전에 지원해보세요
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">팀원 모집하기</h4>
                    <p className="text-sm text-gray-600">팀 매칭 서비스를 통해 함께할 동료를 찾아보세요</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
