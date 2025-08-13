"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, User, MapPin, Clock, Users } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

const recommendedContests = [
  {
    id: 1,
    title: "2025 스타트업 아이디어 공모전",
    category: "창업",
    location: "서울",
    deadline: "2025-02-28",
    image: "/placeholder.svg?height=200&width=300",
    participants: 156,
    prize: "1억원",
    matchScore: 95,
    reason: "귀하의 창업 경험과 비즈니스 관심사에 완벽히 부합합니다",
  },
  {
    id: 2,
    title: "모바일 앱 개발 공모전",
    category: "IT",
    location: "대구",
    deadline: "2025-03-12",
    image: "/placeholder.svg?height=200&width=300",
    participants: 234,
    prize: "3천만원",
    matchScore: 88,
    reason: "귀하의 프로그래밍 기술과 모바일 개발 경험이 활용될 수 있습니다",
  },
  {
    id: 3,
    title: "친환경 제품 디자인 공모전",
    category: "디자인",
    location: "광주",
    deadline: "2025-03-25",
    image: "/placeholder.svg?height=200&width=300",
    participants: 123,
    prize: "4천만원",
    matchScore: 82,
    reason: "환경에 대한 관심과 디자인 역량이 잘 어울립니다",
  },
]

function AIRecommendContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(true)
  const { user } = useAuth()

  const handleGetRecommendations = () => {
    setIsLoading(true)
    // AI 추천 로직 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      setShowRecommendations(true)
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">AI 추천 서비스</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Equal:Local의 AI추천 서비스를 이용해보세요!
            <br />
            {user.username}님에게 맞는 공모전을 찾아드립니다.
          </p>
        </div>

        {/* 사용자 정보 카드 */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              {user.username}님의 프로필
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">관심 분야</h4>
                <div className="flex flex-wrap gap-2">
                  {/* {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest) => <Badge key={interest}>{interest}</Badge>)
                  ) : (
                    <span className="text-sm text-gray-500">관심 분야를 설정해주세요</span>
                  )} */}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">기술 스택</h4>
                <div className="flex flex-wrap gap-2">
                  {/* {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">기술 스택을 설정해주세요</span>
                  )} */}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">경력</h4>
                <p className="text-sm text-gray-600">프론트엔드 개발자 2년</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">선호 지역</h4>
                <p className="text-sm text-gray-600">{/*user.location || */"지역 미설정"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 추천 버튼 */}
        {!showRecommendations && (
          <div className="text-center mb-12">
            <Button size="lg" onClick={handleGetRecommendations} disabled={isLoading} className="px-8 py-3 text-lg">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI가 분석 중입니다...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  맞춤 공모전 추천받기
                </>
              )}
            </Button>
          </div>
        )}

        {/* 추천 결과 */}
        {showRecommendations && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{user.username}님을 위한 맞춤 추천 공모전</h2>
              <Button variant="outline" onClick={handleGetRecommendations}>
                <Sparkles className="w-4 h-4 mr-2" />
                다시 추천받기
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedContests.map((contest, index) => (
                <Card key={contest.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={contest.image || "/placeholder.svg"}
                      alt={contest.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge>{contest.category}</Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        매칭도 {contest.matchScore}%
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500">#{index + 1} 추천</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 추천 이유 */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <Sparkles className="w-4 h-4 inline mr-1" />
                          {contest.reason}
                        </p>
                      </div>

                      {/* 공모전 정보 */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {contest.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {contest.participants}명
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-red-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {contest.deadline}
                          </div>
                          <div className="font-semibold text-blue-600">상금 {contest.prize}</div>
                        </div>
                      </div>

                      <Button className="w-full">지원하기</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 추가 정보 */}
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">더 정확한 추천을 원하시나요?</h3>
                <p className="text-gray-600 mb-4">
                  프로필을 더 자세히 작성하시면 더욱 정확한 맞춤 추천을 받을 수 있습니다.
                </p>
                <Button variant="outline">프로필 업데이트하기</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function AIRecommendPage() {
  return (
    <ProtectedRoute>
      <AIRecommendContent />
    </ProtectedRoute>
  )
}
