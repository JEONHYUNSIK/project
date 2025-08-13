"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, MapPin, Calendar, Plus, MessageSquare, Star, UserPlus, Clock, Trophy, Eye } from 'lucide-react'
import { Profile, Skills, useAuth, UserSkills } from "@/contexts/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("teams")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("전체")
  const [selectedSkill, setSelectedSkill] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체") // 팀에만 해당

  // 팀 데이터를 위한 상태
  const [teams, setTeams] = useState<any[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [errorTeams, setErrorTeams] = useState<string | null>(null)

  // 개인(팀원) 데이터를 위한 상태
  const [individuals, setIndividuals] = useState<Profile[]>([])
  const [isLoadingIndividuals, setIsLoadingIndividuals] = useState(true)
  const [errorIndividuals, setErrorIndividuals] = useState<string | null>(null)

  // 사용자 프로필 관련 API 호출 및 현재 사용자 정보 가져오기
  // ⭐️ useAuth 훅에서 로그인한 사용자 정보를 가져옵니다.
  const { getAllUserProfiles, user } = useAuth()
    
  const API_GATEWAY_URL = 'http://localhost:8080';

  // 팀 정보 가져오기
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true)
      setErrorTeams(null)

      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('keyword', searchTerm)
      }
      if (selectedLocation !== "전체") {
        params.append('location', selectedLocation)
      }
      if (selectedSkill !== "전체") {
        params.append('skill', selectedSkill)
      }
      if (selectedStatus !== "전체") {
        params.append('status', selectedStatus)
      }

      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/teams/list?${params.toString()}`, {
            method: 'GET',
            credentials: 'include',
        })

        if (!response.ok) {
          throw new Error("팀 목록을 불러오는 데 실패했습니다.")
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          setTeams(data)
        } else if (data && Array.isArray(data.content)) {
          setTeams(data.content)
        } else {
          console.error("API 응답이 배열 또는 예상되는 객체 구조가 아닙니다:", data)
          setTeams([])
        }
      } catch (error: any) {
        console.error("팀 데이터를 가져오는 중 오류 발생:", error)
        setErrorTeams(error.message)
        setTeams([])
      } finally {
        setIsLoadingTeams(false)
      }
    }

    if (activeTab === "teams") {
      fetchTeams()
    }
  }, [searchTerm, selectedLocation, selectedSkill, selectedStatus, activeTab])

  // 개인(팀원) 정보 가져오기
  useEffect(() => {
    const fetchIndividuals = async () => {
      setIsLoadingIndividuals(true)
      setErrorIndividuals(null)

      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('keyword', searchTerm)
      }
      if (selectedLocation !== "전체") {
        params.append('location', selectedLocation)
      }
      if (selectedSkill !== "전체") {
        params.append('skill', selectedSkill)
      }

      try {
        const profileResponse = await getAllUserProfiles()
        
        if (!profileResponse.success) {
          throw new Error(profileResponse.message + "팀원 목록을 불러오는 데 실패했습니다.")
        }

        const data = profileResponse.data

        // ⭐️ 현재 로그인한 사용자(user.id)를 제외하고 목록을 필터링합니다.
        const filteredIndividuals = data.filter((person: Profile) => person.userId !== user?.id)

        console.log("팀원 데이터 (로그인 사용자 제외):", filteredIndividuals)
        
        if (Array.isArray(filteredIndividuals)) {
          setIndividuals(filteredIndividuals)
        } else {
          console.error("API 응답이 예상되는 배열 구조가 아닙니다:", filteredIndividuals)
          setIndividuals([])
        }
      } catch (error: any) {
        console.error("팀원 데이터를 가져오는 중 오류 발생:", error)
        setErrorIndividuals(error.message)
        setIndividuals([])
      } finally {
        setIsLoadingIndividuals(false)
        console.log(individuals)
      }
    }

    // ⭐️ user 정보가 존재할 때만 API를 호출합니다.
    if (activeTab === "individuals" && user) {
      fetchIndividuals()
    }
  }, [searchTerm, selectedLocation, selectedSkill, activeTab, user]) // ⭐️ user를 의존성 배열에 추가

  // 팀 모집 상태에 따른 배지 색상 반환 함수
  const getStatusColor = (status: string) => {
    switch (status) {
      case "모집중":
        return "bg-green-100 text-green-800"
      case "마감임박":
        return "bg-yellow-100 text-yellow-800"
      case "모집완료":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">팀 매칭</h1>
            <p className="text-gray-600 mt-2">완벽한 팀을 찾거나 팀원을 모집해보세요</p>
          </div>
          <div className="flex gap-2">
            <Link href="/teams/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                팀 만들기
              </Button>
            </Link>
            <Link href="/mypage/profile">
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                프로필 등록
              </Button>
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* 검색 입력 필드 */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="팀명, 역할, 기술스택 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 지역 필터 셀렉트 박스 */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 지역</SelectItem>
                  <SelectItem value="서울">서울</SelectItem>
                  <SelectItem value="부산">부산</SelectItem>
                  <SelectItem value="대구">대구</SelectItem>
                  <SelectItem value="인천">인천</SelectItem>
                  <SelectItem value="광주">광주</SelectItem>
                  <SelectItem value="대전">대전</SelectItem>
                  {/* 다른 지역들을 필요에 따라 추가 */}
                </SelectContent>
              </Select>

              {/* 기술스택 필터 셀렉트 박스 */}
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="기술스택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 기술</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Node.js">Node.js</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Flutter">Flutter</SelectItem>
                  <SelectItem value="마케팅">마케팅</SelectItem>
                  {/* 다른 기술 스택들을 필요에 따라 추가 */}
                </SelectContent>
              </Select>

              {/* 상태 필터 (팀 탭에서만 활성화) */}
              {activeTab === "teams" && (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="모집상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체 상태</SelectItem>
                    <SelectItem value="모집중">모집중</SelectItem>
                    <SelectItem value="모집완료">모집완료</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              팀 찾기 ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="individuals" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              팀원 찾기 ({individuals.length})
            </TabsTrigger>
          </TabsList>

          {/* 팀 찾기 탭 콘텐츠 */}
          <TabsContent value="teams" className="space-y-6">
            {isLoadingTeams && <div className="text-center py-12 text-gray-500">팀 목록을 불러오는 중...</div>}
            {errorTeams && <div className="text-center py-12 text-red-500">오류 발생: {errorTeams}</div>}
            {!isLoadingTeams && !errorTeams && teams.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            <Badge className={getStatusColor(team.status)}>
                              {team.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1" />
                              <Link href={`/contests/${team.contestId}`} className="hover:underline">
                                {team.contestName}
                              </Link>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {team.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {team.currentMembers}/{team.maxMembers}명
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500" />
                              {team.rating || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 text-sm line-clamp-3">{team.description}</p>
                      {team.leader && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={team.leader.avatarUrl || "/placeholder.svg"} alt={team.leader.name} />
                            <AvatarFallback>{team.leader.name ? team.leader.name[0] : 'L'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{team.leader.name}</div>
                            <div className="text-xs text-gray-600">{team.leader.experience}</div>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">모집 중인 역할</div>
                        <div className="flex flex-wrap gap-1">
                          {team.neededRoles && team.neededRoles.map((role: string) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">기술 스택</div>
                        <div className="flex flex-wrap gap-1">
                          {team.skills && team.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {/* '지원하기' 버튼을 제거하고, '상세보기' 버튼만 남깁니다. */}
                        <Link href={`/teams/${team.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            상세보기
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div>{team.applications || 0}명 지원</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isLoadingTeams && !errorTeams && teams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">조건에 맞는 팀이 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 조건으로 검색해보거나 새로운 팀을 만들어보세요.</p>
                <Link href="/teams/create">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    팀 만들기
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 팀원 찾기 탭 콘텐츠 */}
          <TabsContent value="individuals" className="space-y-6">
            {isLoadingIndividuals && <div className="text-center py-12 text-gray-500">팀원 목록을 불러오는 중...</div>}
            {errorIndividuals && <div className="text-center py-12 text-red-500">오류 발생: {errorIndividuals}</div>}
            {!isLoadingIndividuals && !errorIndividuals && individuals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {individuals.map((person) => (
                  <Card key={person.userId} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={/*person.avatarUrl ||*/ "/placeholder.svg"} alt={person.fullName} />
                          <AvatarFallback className="text-lg">{person.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{person.fullName}</h3>
                        <p className="text-gray-600 text-sm">{'N/A'}</p>
                        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">                      
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {person.experience}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {'N/A'}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{person.bio}</p>
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">기술 스택</div>
                        <div className="flex flex-wrap gap-1">
                          {person.skills && person.skills.map((skill: UserSkills) => (
                               <Badge key={skill.skillId} variant="secondary" className="text-xs">
                                 {skill.skillName}
                               </Badge>
                             ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          disabled={!person.isPublic}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          연락하기
                        </Button>
                        <Link href={`/individuals/${person.userId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            프로필
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 개인(팀원) 빈 상태 */}
            {!isLoadingIndividuals && !errorIndividuals && individuals.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">조건에 맞는 팀원이 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 조건으로 검색해보거나 프로필을 등록해보세요.</p>
                <Link href="/mypage/profile">
                  <Button className="mt-4">
                    <UserPlus className="w-4 h-4 mr-2" />
                    프로필 등록
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}