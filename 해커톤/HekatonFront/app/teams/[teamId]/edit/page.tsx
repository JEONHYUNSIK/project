"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, X, Users, Trophy, CheckCircle, Loader2 } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

// 백엔드 TeamsResponse DTO에 있는 필드들만을 기반으로 정의
interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  contestId: string;
  isRecruiting: boolean; // 모집중 여부
  isPublic: boolean;
  maxMembers: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  neededRoles: string[];
  skills: string[];
  location: string;
  requirements: string;
  contactMethod: "platform" | "email" | "kakao" | "discord";
  contactInfo: string;
  allowDirectApply: boolean;
}

const availableRoles = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "모바일 개발자",
  "UI/UX 디자이너",
  "그래픽 디자이너",
  "기획자",
  "마케터",
  "데이터 사이언티스트",
  "DevOps 엔지니어",
  "QA 엔지니어",
  "프로젝트 매니저"
];

const availableSkills = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
  "Flutter", "React Native", "Swift", "Kotlin", "Figma", "Sketch", "Photoshop",
  "마케팅", "SEO", "콘텐츠", "데이터분석", "머신러닝", "AWS", "Docker", "Kubernetes"
];

const contests = [
  { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", title: "2025 스타트업 아이디어 공모전" },
  { id: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d", title: "AI 혁신 아이디어 공모전" },
  { id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d", title: "모바일 앱 개발 공모전" },
  { id: "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d", title: "환경보호 캠페인 공모전" },
  { id: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d", title: "사회혁신 아이디어 공모전" }
];

function TeamEditContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // formData의 타입을 명시적으로 지정
  const [formData, setFormData] = useState<Team | null>(null);

  const [newRole, setNewRole] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const API_GATEWAY_URL = 'http://localhost:8080';

  // 1. 팀 데이터 불러오기
  const fetchTeamData = useCallback(async () => {
    if (!teamId) {
      setError("팀 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }
    
    // user 또는 isAuthenticated가 로드될 때까지 기다림
    if (!user && !isAuthenticated) {
      setIsLoading(true);
      return; 
    }
    
    if (!user) {
      setError("로그인이 필요합니다.");
      setIsLoading(false);
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization 헤더는 백엔드 세션/쿠키 또는 전역 인터셉터에서 처리한다고 가정
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("팀을 찾을 수 없습니다.");
        }
        if (response.status === 401 || response.status === 403) {
          setError("인증되지 않았거나 접근 권한이 없습니다. 다시 로그인해주세요.");
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 정보를 불러오는 데 실패했습니다.");
      }

      const data: Team = await response.json();

      if (user && data.leaderId !== user.id) {
        setError("팀 수정 권한이 없습니다.");
        router.push(`/teams/${teamId}`);
        return;
      }

      setFormData({
        ...data,
        neededRoles: data.neededRoles || [],
        skills: data.skills || [],
        location: data.location || "온라인",
        requirements: data.requirements || "",
        contactMethod: data.contactMethod || "platform",
        contactInfo: data.contactInfo || "",
        allowDirectApply: data.allowDirectApply !== undefined ? data.allowDirectApply : true,
      });

    } catch (err: any) {
      console.error("팀 정보 불러오기 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, user, isAuthenticated, router]);

  useEffect(() => {
    if (user || isAuthenticated) {
      fetchTeamData();
    }
  }, [user, isAuthenticated, fetchTeamData]);


  // 2. 팀 정보 업데이트 (저장)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!user || !formData) {
      setError("로그인이 필요하거나 팀 데이터가 없습니다.");
      setIsSaving(false);
      return;
    }

    // --- 수정된 부분: 모집 중일 때 역할 또는 기술 스택이 비어있는지 확인하는 유효성 검사 추가 ---
    if (formData.isRecruiting && formData.neededRoles.length === 0 && formData.skills.length === 0) {
      setError("모집 중인 팀의 경우, 모집하는 역할 또는 필요한 기술 스택 중 하나 이상을 입력해야 합니다.");
      setIsSaving(false);
      return;
    }
    // -------------------------------------------------------------------------------------

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        contestId: formData.contestId,
        location: formData.location,
        maxMembers: formData.maxMembers,
        neededRoles: formData.neededRoles,
        skills: formData.skills,
        requirements: formData.requirements,
        contactMethod: formData.contactMethod,
        contactInfo: formData.contactInfo,
        isPublic: formData.isPublic,
        isRecruiting: formData.isRecruiting,
        allowDirectApply: formData.allowDirectApply,
      };

      console.log("팀 수정 API 전송 데이터:", payload);

      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("인증되지 않았거나 접근 권한이 없습니다. 다시 로그인해주세요.");
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 정보 수정에 실패했습니다.");
      }

      console.log("팀 수정 성공!");
      setSuccess(true);

      setTimeout(() => {
        router.push(`/teams/${teamId}`);
      }, 3000);

    } catch (err: any) {
      console.error("팀 수정 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const addRole = () => {
    if (formData && newRole && !formData.neededRoles.includes(newRole)) {
      setFormData({
        ...formData,
        neededRoles: [...formData.neededRoles, newRole]
      });
    }
    setNewRole("");
  };

  const removeRole = (role: string) => {
    if (formData) {
      setFormData({
        ...formData,
        neededRoles: formData.neededRoles.filter(r => r !== role)
      });
    }
  };

  const addSkill = () => {
    if (formData && newSkill && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill]
      });
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    if (formData) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(s => s !== skill)
      });
    }
  };

  // 렌더링 로직
  if (!user && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">인증 정보를 확인 중...</p>
      </div>
    );
  }

  if (isLoading && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/teams">
          <Button>팀 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">팀 정보 수정 완료!</h2>
              <p className="text-gray-600 mb-6">
                팀 정보가 성공적으로 업데이트되었습니다.
              </p>
              <div className="flex gap-2">
                <Link href={`/teams/${teamId}`} className="flex-1">
                  <Button className="w-full">팀 상세보기</Button>
                </Link>
                <Link href="/mypage" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    마이페이지
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/teams/${teamId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">팀 정보 수정</h1>
              <p className="text-gray-600">{formData.name} 팀의 정보를 수정합니다</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    기본 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">팀명 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="팀명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">팀 소개 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="팀에 대한 소개와 목표를 작성해주세요"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contest">참가 공모전 *</Label>
                      <Select
                        value={formData.contestId}
                        onValueChange={(value) => setFormData({ ...formData, contestId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="공모전 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {contests.map((contest) => (
                            <SelectItem key={contest.id} value={contest.id}>
                              {contest.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">활동 지역 *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="서울">서울</SelectItem>
                          <SelectItem value="부산">부산</SelectItem>
                          <SelectItem value="대구">대구</SelectItem>
                          <SelectItem value="인천">인천</SelectItem>
                          <SelectItem value="광주">광주</SelectItem>
                          <SelectItem value="대전">대전</SelectItem>
                          <SelectItem value="온라인">온라인</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">최대 팀원 수</Label>
                    <Select
                      value={formData.maxMembers.toString()}
                      onValueChange={(value) => setFormData({ ...formData, maxMembers: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2명</SelectItem>
                        <SelectItem value="3">3명</SelectItem>
                        <SelectItem value="4">4명</SelectItem>
                        <SelectItem value="5">5명</SelectItem>
                        <SelectItem value="6">6명</SelectItem>
                        <SelectItem value="7">7명</SelectItem>
                        <SelectItem value="8">8명</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isRecruiting">모집 상태</Label>
                    <Select
                      value={formData.isRecruiting.toString()}
                      onValueChange={(value) => setFormData({ ...formData, isRecruiting: value === 'true' })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="모집 상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">모집중</SelectItem>
                        <SelectItem value="false">모집완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>모집 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>모집하는 역할</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.neededRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="flex items-center gap-1">
                          {role}
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="역할 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles
                            .filter(role => !formData.neededRoles.includes(role))
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addRole} disabled={!newRole} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>필요한 기술 스택</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newSkill} onValueChange={setNewSkill}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="기술 스택 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkills
                            .filter(skill => !formData.skills.includes(skill))
                            .map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addSkill} disabled={!newSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">지원 요구사항</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="팀원에게 바라는 점이나 필요한 경험을 작성해주세요"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>연락 방법</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>연락 방법</Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value: "platform" | "email" | "kakao" | "discord") => setFormData({ ...formData, contactMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">플랫폼 내 메시지</SelectItem>
                        <SelectItem value="email">이메일</SelectItem>
                        <SelectItem value="kakao">카카오톡</SelectItem>
                        <SelectItem value="discord">디스코드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.contactMethod !== "platform" && (
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">연락처</Label>
                      <Input
                        id="contactInfo"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        placeholder={
                          formData.contactMethod === "email" ? "이메일 주소" :
                          formData.contactMethod === "kakao" ? "카카오톡 ID" :
                          "디스코드 ID"
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>팀장 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-xl">{user?.username?.[0] || ""}</span>
                    </div>
                    <h3 className="font-medium">{user?.username}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>팀 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      팀을 공개적으로 표시
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowDirectApply"
                      checked={formData.allowDirectApply}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowDirectApply: checked as boolean })}
                    />
                    <Label htmlFor="allowDirectApply" className="text-sm">
                      직접 지원 허용
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        변경 사항 저장
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    변경 사항은 즉시 반영됩니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function TeamEditPage() {
  return (
    <ProtectedRoute>
      <TeamEditContent />
    </ProtectedRoute>
  );
}