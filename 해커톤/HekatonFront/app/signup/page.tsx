"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, Phone, Lock, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TermsModal from "@/components/terms-modal"
import { formatPhoneNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreements, setAgreements] = useState<Record<string, boolean>>({})

  const { signUp, isAuthenticated } = useAuth()

  // 약관 동의 정보 확인
  useEffect(() => {
    const savedAgreements = sessionStorage.getItem("signup_agreements")
    if (!savedAgreements) {
      // 약관 동의를 하지 않은 경우 약관 페이지로 리다이렉트
      router.push("/signup/terms")
      return
    }

    try {
      const parsedAgreements = JSON.parse(savedAgreements)
      setAgreements(parsedAgreements)
    } catch (error) {
      console.error("약관 정보 파싱 오류:", error)
      router.push("/signup/terms")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // 유효성 검사
      if (formData.password !== formData.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.")
        return
      }

      if (formData.password.length < 8) {
        setError("비밀번호는 8자 이상이어야 합니다.")
        return
      }

      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // DB 전송을 위해 하이픈 등 숫자가 아닌 문자 모두 제거
      const phoneForDB = formData.phone.replace(/\D/g, "");
      console.log("DB 전송 직전 값:", phoneForDB);

      // 회원가입 API 호출
      const response = await signUp(formData.email, formData.password, formData.username, phoneForDB)


      if (response.success) {
        // 회원가입 성공 후 사용자 정보 저장
        // 성공 시 프로필 페이지로 이동
        sessionStorage.removeItem("signup_agreements") // 임시 저장된 약관 동의 정보 삭제
        router.push("/mypage/profile")
      }
      else {
        // 회원가입 실패
        setError(response.message || "회원가입에 실패했습니다. 다시 시도해주세요.")
      }

      
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  // 약관 동의 정보가 없으면 로딩 표시
  if (Object.keys(agreements).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">약관 동의 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/signup/terms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              약관동의로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">회원가입 정보입력</h1>
            <p className="text-gray-600 mt-2">기본 정보를 입력하여 회원가입을 완료하세요</p>
          </div>
        </div>

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
              <div className="w-8 h-0.5 bg-blue-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">정보입력</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-500">가입완료</span>
              </div>
            </div>
          </div>

          {/* 약관 동의 확인 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">약관 동의 완료</span>
                  <Badge variant="secondary" className="text-xs">
                    {Object.values(agreements).filter(Boolean).length}개 항목 동의
                  </Badge>
                </div>
                <TermsModal>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    약관 다시보기
                  </Button>
                </TermsModal>
              </div>
              <p className="text-sm text-green-700 mt-1 ml-7">이용약관 및 개인정보처리방침에 동의하셨습니다.</p>
            </CardContent>
          </Card>

          {/* 회원가입 폼 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                회원 정보 입력
              </CardTitle>
              <p className="text-sm text-gray-600">이퀄로컬 서비스 이용을 위한 기본 정보를 입력해주세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        아이디 *
                      </Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="영문, 숫자 조합 4-20자"
                        required
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">영문, 숫자를 조합하여 4-20자로 입력해주세요</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        이메일 *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@email.com"
                        required
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">로그인 및 알림 수신에 사용됩니다</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      전화번호 *
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const formattedPhone = formatPhoneNumber(e.target.value);
                          setFormData({ ...formData, phone: formattedPhone });
                        }}
                        placeholder="하이픈(-)제외하고 입력"
                        required
                        disabled={isLoading}
                        maxLength={13}
                      />
                    <p className="text-xs text-gray-500">본인 확인 및 중요 알림 발송에 사용됩니다</p>
                  </div>
                </div>

                {/* 비밀번호 설정 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">비밀번호 설정</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center">
                        <Lock className="w-4 h-4 mr-1" />
                        비밀번호 *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="8자 이상 입력"
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">영문, 숫자, 특수문자 조합 8자 이상</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center">
                        <Lock className="w-4 h-4 mr-1" />
                        비밀번호 확인 *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="비밀번호를 다시 입력"
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="text-xs text-green-500">비밀번호가 일치합니다</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">회원가입 완료 후</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 다양한 공모전 정보를 확인할 수 있습니다</li>
                    <li>• AI 추천 서비스로 맞춤 공모전을 받아보세요</li>
                    <li>• 팀 매칭을 통해 함께할 동료를 찾아보세요</li>
                    <li>• 프로필을 작성하여 더 정확한 추천을 받으세요</li>
                  </ul>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <Link href="/signup/terms" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                      이전 단계
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      "회원가입 완료"
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    로그인
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
