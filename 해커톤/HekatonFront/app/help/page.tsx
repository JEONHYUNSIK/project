"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, HelpCircle, Search, Users, Trophy, Sparkles, MessageSquare, Settings, ChevronRight, BookOpen, Video, FileText } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

const faqData = {
  general: [
    {
      question: "이퀄로컬은 어떤 서비스인가요?",
      answer: "이퀄로컬은 공모전 정보를 제공하고 팀 매칭을 도와주는 플랫폼입니다. AI 추천 시스템을 통해 사용자에게 맞는 공모전을 찾아드리고, 완벽한 팀을 구성할 수 있도록 지원합니다."
    },
    {
      question: "회원가입은 무료인가요?",
      answer: "네, 이퀄로컬의 회원가입과 기본 서비스는 모두 무료입니다. 공모전 검색, 팀 매칭, AI 추천 등 모든 핵심 기능을 무료로 이용하실 수 있습니다."
    },
    {
      question: "어떤 종류의 공모전을 찾을 수 있나요?",
      answer: "창업, IT, 디자인, 마케팅, 사회, 환경, 교육, 문화, 예술 등 다양한 분야의 공모전 정보를 제공합니다. 정부기관, 기업, 대학교 등에서 주최하는 공모전을 포괄적으로 다룹니다."
    },
    {
      question: "모바일에서도 이용할 수 있나요?",
      answer: "네, 이퀄로컬은 반응형 웹사이트로 제작되어 PC, 태블릿, 스마트폰 등 모든 기기에서 최적화된 환경으로 이용하실 수 있습니다."
    }
  ],
  contest: [
    {
      question: "공모전은 어떻게 검색하나요?",
      answer: "메인 페이지나 '공모전 찾기' 페이지에서 키워드, 카테고리, 지역, 마감일 등 다양한 조건으로 검색할 수 있습니다. 고급 필터를 사용하면 더 정확한 결과를 얻을 수 있습니다."
    },
    {
      question: "공모전 정보는 얼마나 자주 업데이트되나요?",
      answer: "공모전 정보는 매일 업데이트됩니다. 새로운 공모전이 등록되거나 기존 공모전의 정보가 변경되면 실시간으로 반영됩니다."
    },
    {
      question: "마감된 공모전도 볼 수 있나요?",
      answer: "기본적으로는 진행 중인 공모전만 표시되지만, 필터 설정을 통해 마감된 공모전도 확인할 수 있습니다. 이는 향후 참고용으로 활용하실 수 있습니다."
    },
    {
      question: "공모전에 직접 지원할 수 있나요?",
      answer: "이퀄로컬은 공모전 정보 제공 플랫폼입니다. 실제 지원은 각 공모전의 공식 웹사이트나 지정된 방법을 통해 진행해야 합니다. 각 공모전 상세 페이지에서 지원 방법을 확인하실 수 있습니다."
    }
  ],
  team: [
    {
      question: "팀 매칭은 어떻게 작동하나요?",
      answer: "팀 매칭은 두 가지 방식으로 작동합니다. 1) 기존 팀에 지원하기: 모집 중인 팀을 찾아 지원할 수 있습니다. 2) 팀원 찾기: 개인 프로필을 등록하고 팀장이 연락할 수 있도록 합니다."
    },
    {
      question: "팀을 만들려면 어떻게 해야 하나요?",
      answer: "'팀 매칭' 페이지에서 '팀 만들기' 버튼을 클릭하여 팀을 생성할 수 있습니다. 팀명, 참가 공모전, 모집 역할, 필요 기술 등을 입력하면 됩니다."
    },
    {
      question: "팀원과는 어떻게 소통하나요?",
      answer: "팀 생성 시 설정한 연락 방법(플랫폼 내 메시지, 이메일, 카카오톡, 디스코드 등)을 통해 소통할 수 있습니다. 향후 플랫폼 내 채팅 기능도 추가될 예정입니다."
    },
    {
      question: "팀에서 나가고 싶으면 어떻게 하나요?",
      answer: "마이페이지의 '참여 중인 공모전' 섹션에서 해당 팀을 찾아 '팀 나가기' 기능을 이용하거나, 팀장에게 직접 연락하여 탈퇴 의사를 전달할 수 있습니다."
    }
  ],
  ai: [
    {
      question: "AI 추천은 어떤 기준으로 작동하나요?",
      answer: "AI 추천은 사용자의 프로필 정보(관심분야, 기술스택, 경력, 위치 등)를 분석하여 가장 적합한 공모전을 추천합니다. 사용자의 활동 패턴과 선호도도 학습하여 점점 더 정확한 추천을 제공합니다."
    },
    {
      question: "추천 결과가 마음에 들지 않으면 어떻게 하나요?",
      answer: "프로필 정보를 더 자세히 입력하거나 관심분야를 조정하면 더 정확한 추천을 받을 수 있습니다. 또한 '다시 추천받기' 버튼을 통해 새로운 추천 결과를 확인할 수 있습니다."
    },
    {
      question: "AI 추천 서비스는 유료인가요?",
      answer: "아니요, AI 추천 서비스는 완전 무료입니다. 회원가입 후 프로필을 작성하시면 언제든지 맞춤형 공모전 추천을 받을 수 있습니다."
    }
  ],
  account: [
    {
      question: "비밀번호를 잊어버렸어요.",
      answer: "로그인 페이지의 '비밀번호를 잊으셨나요?' 링크를 클릭하여 비밀번호 재설정을 진행할 수 있습니다. 가입 시 등록한 이메일로 재설정 링크가 발송됩니다."
    },
    {
      question: "회원탈퇴는 어떻게 하나요?",
      answer: "마이페이지 > 프로필 수정 > 계정 설정에서 회원탈퇴를 진행할 수 있습니다. 탈퇴 시 모든 개인정보는 즉시 삭제되며, 복구가 불가능합니다."
    },
    {
      question: "프로필 정보를 수정하고 싶어요.",
      answer: "마이페이지에서 '프로필 수정' 버튼을 클릭하여 언제든지 개인정보, 관심분야, 기술스택 등을 수정할 수 있습니다."
    },
    {
      question: "알림 설정을 변경하고 싶어요.",
      answer: "마이페이지 > 알림 설정에서 이메일 알림, 푸시 알림 등의 수신 여부를 설정할 수 있습니다."
    }
  ]
}

const guideData = [
  {
    id: 1,
    title: "이퀄로컬 시작하기",
    description: "회원가입부터 첫 공모전 찾기까지",
    icon: BookOpen,
    steps: ["회원가입", "프로필 작성", "관심분야 설정", "첫 공모전 검색"]
  },
  {
    id: 2,
    title: "완벽한 팀 만들기",
    description: "팀 생성부터 팀원 모집까지",
    icon: Users,
    steps: ["팀 생성", "역할 정의", "팀원 모집", "소통 시작"]
  },
  {
    id: 3,
    title: "AI 추천 활용하기",
    description: "맞춤형 공모전 추천 받는 방법",
    icon: Sparkles,
    steps: ["프로필 완성", "AI 추천 실행", "결과 확인", "지원하기"]
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("general")

  const filteredFAQ = faqData[activeCategory as keyof typeof faqData].filter(
    item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <HelpCircle className="w-8 h-8 mr-3" />
              도움말
            </h1>
            <p className="text-gray-600 mt-2">이퀄로컬 이용에 도움이 되는 정보를 찾아보세요</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 검색 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="궁금한 내용을 검색해보세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-center"
                />
              </div>
            </CardContent>
          </Card>

          {/* 빠른 가이드 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 시작 가이드</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guideData.map((guide) => {
                const IconComponent = guide.icon
                return (
                  <Card key={guide.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {guide.steps.map((step, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                              {index + 1}
                            </div>
                            {step}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        자세히 보기
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
            
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  일반
                </TabsTrigger>
                <TabsTrigger value="contest" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  공모전
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  팀 매칭
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI 추천
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  계정
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory}>
                <Card>
                  <CardContent className="p-6">
                    {filteredFAQ.length > 0 ? (
                      <Accordion type="single" collapsible className="space-y-2">
                        {filteredFAQ.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-4">
                            <AccordionTrigger className="text-left hover:no-underline">
                              <span className="font-medium">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">검색 결과가 없습니다.</p>
                        <p className="text-gray-400 text-sm mt-2">다른 키워드로 검색해보세요.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* 추가 도움말 */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">더 많은 도움이 필요하신가요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">동영상 가이드</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    단계별 사용법을 동영상으로 확인하세요
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    준비 중
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">1:1 문의</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    개별 문의사항을 직접 상담받으세요
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      문의하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">사용자 매뉴얼</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    상세한 사용법을 문서로 확인하세요
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    준비 중
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}