"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Shield, CheckCircle, AlertCircle } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function SignupTermsPage() {
   const { user } = useAuth()
  
      if (user) return null
      
  const router = useRouter()
  const [agreements, setAgreements] = useState({
    terms1: false,
    terms2: false,
    privacy: false,
    marketing: false,
    age: false,
  })

  const requiredAgreements = ["terms1", "terms2", "privacy", "age"]
  const allRequiredAgreed = requiredAgreements.every((key) => agreements[key as keyof typeof agreements])

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSelectAll = () => {
    const allChecked = Object.values(agreements).every(Boolean)
    const newState = !allChecked
    setAgreements({
      terms1: newState,
      terms2: newState,
      privacy: newState,
      marketing: newState,
      age: newState,
    })
  }

  const handleNext = () => {
    if (allRequiredAgreed) {
      // 동의 정보를 sessionStorage에 저장
      sessionStorage.setItem("signup_agreements", JSON.stringify(agreements))
      router.push("/signup")
    }
  }

  const allChecked = Object.values(agreements).every(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/login">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              로그인으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">회원가입 약관동의</h1>
            <p className="text-gray-600 mt-2">서비스 이용을 위해 약관에 동의해주세요</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 진행 단계 */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">약관동의</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-500">정보입력</span>
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

          {/* 약관 동의 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                서비스 이용약관 동의
              </CardTitle>
              <p className="text-sm text-gray-600">이퀄로컬 서비스 이용을 위해 아래 약관에 동의해주세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 전체 동의 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox id="selectAll" checked={allChecked} onCheckedChange={handleSelectAll} className="w-5 h-5" />
                  <label htmlFor="selectAll" className="text-lg font-semibold text-blue-900 cursor-pointer">
                    전체 동의하기
                  </label>
                </div>
                <p className="text-sm text-blue-700 mt-2 ml-8">선택항목에 대한 동의 포함</p>
              </div>

              <Separator />

              {/* 개별 약관 */}
              <div className="space-y-4">
                {/* 이용약관 1 (필수) */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="terms1"
                    checked={agreements.terms1}
                    onCheckedChange={(checked) => handleAgreementChange("terms1", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="terms1" className="font-medium cursor-pointer">
                        이퀄로컬 이용약관 동의
                      </label>
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">서비스 이용에 관한 기본 약관입니다.</p>
                    <Link href="/terms" target="_blank">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        약관 전문 보기
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 이용약관 2 (필수) */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="terms2"
                    checked={agreements.terms2}
                    onCheckedChange={(checked) => handleAgreementChange("terms2", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="terms2" className="font-medium cursor-pointer">
                        공모전 및 팀 매칭 서비스 이용약관 동의
                      </label>
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      공모전 정보 제공 및 팀 매칭 서비스 이용에 관한 약관입니다.
                    </p>
                    <Link href="/terms" target="_blank">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        약관 전문 보기
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 개인정보처리방침 (필수) */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={(checked) => handleAgreementChange("privacy", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="privacy" className="font-medium cursor-pointer">
                        개인정보 수집 및 이용 동의
                      </label>
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      회원가입 및 서비스 제공을 위한 개인정보 처리에 동의합니다.
                    </p>
                    <Link href="/privacy" target="_blank">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        <Shield className="w-3 h-3 mr-1" />
                        개인정보처리방침 보기
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 마케팅 정보 수신 (선택) */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="marketing"
                    checked={agreements.marketing}
                    onCheckedChange={(checked) => handleAgreementChange("marketing", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="marketing" className="font-medium cursor-pointer">
                        마케팅 정보 수신 동의
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        선택
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      새로운 공모전 정보, 이벤트, 프로모션 등의 마케팅 정보를 이메일로 받아보실 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 만 14세 이상 (필수) */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id="age"
                    checked={agreements.age}
                    onCheckedChange={(checked) => handleAgreementChange("age", checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="age" className="font-medium cursor-pointer">
                        만 14세 이상입니다
                      </label>
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">만 14세 미만은 회원가입이 제한됩니다.</p>
                  </div>
                </div>
              </div>

              {/* 안내 메시지 */}
              {!allRequiredAgreed && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">필수 약관에 모두 동의해야 회원가입을 진행할 수 있습니다.</p>
                </div>
              )}

              {allRequiredAgreed && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-800">모든 필수 약관에 동의하셨습니다. 회원가입을 계속 진행하세요.</p>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    취소
                  </Button>
                </Link>
                <Button onClick={handleNext} disabled={!allRequiredAgreed} className="flex-1">
                  다음 단계
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
