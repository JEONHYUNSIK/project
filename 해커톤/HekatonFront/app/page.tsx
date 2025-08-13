"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from "lucide-react"
import Header from "@/components/header"
import ChatWidget from "@/components/chat-widget"
import Footer from "@/components/footer"
import Link from "next/link"

const heroPosters = [
  {
    id: 1,
    title: "2025 대한민국 디자인 공모전",
    subtitle: "창의적인 디자인으로 미래를 그려보세요",
    image: "/placeholder.svg?height=600&width=1200",
    deadline: "2025-03-15",
    prize: "총 상금 1억원",
  },
  {
    id: 2,
    title: "AI 혁신 아이디어 공모전",
    subtitle: "인공지능으로 세상을 바꿀 아이디어를 찾습니다",
    image: "/placeholder.svg?height=600&width=1200",
    deadline: "2025-04-20",
    prize: "총 상금 5천만원",
  },
  {
    id: 3,
    title: "환경보호 캠페인 공모전",
    subtitle: "지구를 지키는 창의적인 캠페인을 제안해주세요",
    image: "/placeholder.svg?height=600&width=1200",
    deadline: "2025-05-10",
    prize: "총 상금 3천만원",
  },
]

const contests = [
  {
    id: 1,
    title: "2025 스타트업 아이디어 공모전",
    category: "창업",
    location: "서울",
    deadline: "2025-02-28",
    image: "/placeholder.svg?height=200&width=300",
    participants: 156,
  },
  {
    id: 2,
    title: "대학생 광고 크리에이티브 공모전",
    category: "광고",
    location: "부산",
    deadline: "2025-03-05",
    image: "/placeholder.svg?height=200&width=300",
    participants: 89,
  },
  {
    id: 3,
    title: "모바일 앱 개발 공모전",
    category: "IT",
    location: "대구",
    deadline: "2025-03-12",
    image: "/placeholder.svg?height=200&width=300",
    participants: 234,
  },
  {
    id: 4,
    title: "사회혁신 아이디어 공모전",
    category: "사회",
    location: "인천",
    deadline: "2025-03-18",
    image: "/placeholder.svg?height=200&width=300",
    participants: 67,
  },
  {
    id: 5,
    title: "친환경 제품 디자인 공모전",
    category: "디자인",
    location: "광주",
    deadline: "2025-03-25",
    image: "/placeholder.svg?height=200&width=300",
    participants: 123,
  },
  {
    id: 6,
    title: "청년 정책 제안 공모전",
    category: "정책",
    location: "대전",
    deadline: "2025-04-01",
    image: "/placeholder.svg?height=200&width=300",
    participants: 45,
  },
]

const teamPosts = [
  { id: 4, category: "일반", title: "다람쥐헌쳇바퀴에 타고파", author: "asd", date: "2025-01-02", views: 15 },
  { id: 3, category: "팀원모집", title: "해커톤 팀원 모집", author: "asd1", date: "2025-01-01", views: 32 },
  { id: 2, category: "팀원모집", title: "2025 인권 공모전 팀원 모집", author: "asd2", date: "2024-12-31", views: 28 },
  { id: 1, category: "일반", title: "다람쥐헌쳇바퀴에 안탐", author: "asd3", date: "2024-12-30", views: 12 },
]

const regions = [
  "전체",
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedRegion, setSelectedRegion] = useState("전체")  
 
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 타이머를 시작하는 함수
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPosters.length)
    }, 5000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroPosters.length)
    startTimer() // 타이머 초기화
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroPosters.length) % heroPosters.length)
    startTimer() // 타이머 초기화
  }


  const filteredContests =
    selectedRegion === "전체" ? contests : contests.filter((contest) => contest.location === selectedRegion)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - 대형 포스터 슬라이드 */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="relative w-full h-full">
          {heroPosters.map((poster, index) => (
            <div
              key={poster.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0"
                  : index < currentSlide
                    ? "-translate-x-full"
                    : "translate-x-full"
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${poster.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-4xl px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">{poster.title}</h1>
                    <p className="text-xl md:text-2xl mb-6">{poster.subtitle}</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        <Clock className="w-4 h-4 mr-2" />
                        마감: {poster.deadline}
                      </Badge>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {poster.prize}
                      </Badge>
                    </div>
                    <Button size="lg" className="text-lg px-8 py-3">
                      공모전 탐색하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 슬라이드 컨트롤 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* 슬라이드 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroPosters.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 지역별 공모전 섹션 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">마감이 임박한 공모전</h2>
            <Button variant="outline">전체 보기</Button>
          </div>

          {/* 지역 필터링 버튼 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </Button>
            ))}
          </div>

          {/* 공모전 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <Link key={contest.id} href={`/contests/${contest.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img
                      src={contest.image || "/placeholder.svg"}
                      alt={contest.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2">{contest.category}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contest.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {contest.participants}명 참여
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-red-600">
                      <Clock className="w-4 h-4 mr-1" />
                      마감: {contest.deadline}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 팀 모집 커뮤니티 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">팀 모집중인 커뮤니티</h2>
            <Button variant="outline">더 보기</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        번호
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        분류
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        조회수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={post.category === "팀원모집" ? "default" : "secondary"}>
                            {post.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <ChatWidget />
      <Footer />
    </div>
  )
}
