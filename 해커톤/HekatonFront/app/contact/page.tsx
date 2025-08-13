"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2, AlertCircle, HelpCircle, Bug, Lightbulb, Shield } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

const inquiryTypes = [
  { value: "general", label: "일반 문의", icon: HelpCircle, color: "blue" },
  { value: "technical", label: "기술적 문제", icon: Bug, color: "red" },
  { value: "suggestion", label: "개선 제안", icon: Lightbulb, color: "yellow" },
  { value: "account", label: "계정 관련", icon: Shield, color: "green" },
  { value: "partnership", label: "제휴 문의", icon: MessageSquare, color: "purple" }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
    agreeToPrivacy: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요."
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요."
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = "문의 유형을 선택해주세요."
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "제목을 입력해주세요."
    }

    if (!formData.message.trim()) {
      newErrors.message = "문의 내용을 입력해주세요."
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "문의 내용을 10자 이상 입력해주세요."
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = "개인정보 수집 및 이용에 동의해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("문의 데이터:", formData)
      setSuccess(true)

      // 폼 초기화
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiryType: "",
        subject: "",
        message: "",
        agreeToPrivacy: false
      })
    } catch (error) {
      console.error("문의 전송 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">문의가 접수되었습니다!</h2>
              <p className="text-gray-600 mb-6">
                소중한 의견 감사합니다.
                <br />
                빠른 시일 내에 답변드리겠습니다.
              </p>
              <div className="space-y-2">
                <Link href="/help">
                  <Button className="w-full">도움말 보기</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    홈으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3" />
              문의하기
            </h1>
            <p className="text-gray-600 mt-2">궁금한 점이나 개선사항을 알려주세요</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 연락처 정보 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>연락처 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">이메일</div>
                      <div className="text-sm text-gray-600">contact@equallocal.com</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">전화번호</div>
                      <div className="text-sm text-gray-600">02-1234-5678</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">주소</div>
                      <div className="text-sm text-gray-600">서울특별시 강남구 테헤란로 123</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">운영시간</div>
                      <div className="text-sm text-gray-600">
                        평일 09:00 - 18:00
                        <br />
                        (주말 및 공휴일 휴무)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 문의 유형 안내 */}
              <Card>
                <CardHeader>
                  <CardTitle>문의 유형별 안내</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inquiryTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <div key={type.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`w-8 h-8 bg-${type.color}-100 rounded-full flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 text-${type.color}-600`} />
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* 응답 시간 안내 */}
              <Card>
                <CardHeader>
                  <CardTitle>응답 시간 안내</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>일반 문의</span>
                      <Badge variant="secondary">1-2일</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>기술적 문제</span>
                      <Badge variant="secondary">당일</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>계정 관련</span>
                      <Badge variant="secondary">당일</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>제휴 문의</span>
                      <Badge variant="secondary">3-5일</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 문의 폼 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>문의 작성</CardTitle>
                  <p className="text-sm text-gray-600">
                    정확한 답변을 위해 가능한 자세히 작성해주세요.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름 *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="이름을 입력하세요"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">이메일 *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="이메일을 입력하세요"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">전화번호</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="전화번호를 입력하세요 (선택사항)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">문의 유형 *</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) => handleInputChange("inquiryType", value)}
                      >
                        <SelectTrigger className={errors.inquiryType ? "border-red-500" : ""}>
                          <SelectValue placeholder="문의 유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.inquiryType && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.inquiryType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">제목 *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="문의 제목을 입력하세요"
                        className={errors.subject ? "border-red-500" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">문의 내용 *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="문의하실 내용을 자세히 작성해주세요"
                        rows={6}
                        className={errors.message ? "border-red-500" : ""}
                      />
                      <div className="flex justify-between items-center">
                        {errors.message ? (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.message}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">최소 10자 이상 입력해주세요</p>
                        )}
                        <span className="text-sm text-gray-400">
                          {formData.message.length}/1000
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* 개인정보 동의 */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="agreeToPrivacy"
                          checked={formData.agreeToPrivacy}
                          onChange={(e) => handleInputChange("agreeToPrivacy", e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="agreeToPrivacy" className="text-sm">
                            개인정보 수집 및 이용에 동의합니다 *
                          </Label>
                          <div className="text-xs text-gray-500 mt-1">
                            문의 처리를 위해 이름, 이메일, 전화번호를 수집하며, 
                            문의 처리 완료 후 즉시 삭제됩니다.
                            <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                              자세히 보기
                            </Link>
                          </div>
                        </div>
                      </div>
                      {errors.agreeToPrivacy && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.agreeToPrivacy}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          전송 중...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          문의 보내기
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}