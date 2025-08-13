"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle,
  Edit,
  FileText,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { InviteMemberModal } from "./modal/InviteMemberModal";

interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  contestId: string;
  isRecruiting: boolean;
  isPublic: boolean;
  maxMembers: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  neededRoles: string[];
  skills: string[];
  categoryIds?: string[];

  contestTitle?: string;
  location?: string;
  currentMembers?: number;
  leaderUsername?: string;
  requirements?: string;
  contactMethod?: "platform" | "email" | "kakao" | "discord";
  contactInfo?: string;
  allowDirectApply?: boolean;
  status?: "모집중" | "마감임박" | "모집완료" | "활동중" | "활동종료";
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

interface Contest {
  id: string;
  title: string;
}

interface TeamMember {
  userId: string;
  fullName: string;
  // 💡 is_active 필드 추가
  is_active: boolean;
  // 다른 필요한 속성들
}

const contests = [
  { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", title: "2025 스타트업 아이디어 공모전" },
  { id: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d", title: "AI 혁신 아이디어 공모전" },
  { id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d", title: "모바일 앱 개발 공모전" },
  { id: "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d", title: "환경보호 캠페인 공모전" },
  { id: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d", title: "사회혁신 아이디어 공모전" }
];


function TeamDetailPageContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [leaderProfile, setLeaderProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false); // 💡 추가: 팀 지원 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

  const fetchTeamData = useCallback(async () => {
    if (!teamId) {
      setError("팀 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. 팀 기본 정보 가져오기
      const teamResponse = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}/detail`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!teamResponse.ok) {
        if (teamResponse.status === 404) {
          throw new Error("팀을 찾을 수 없습니다.");
        }
        const errorData = await teamResponse.json();
        throw new Error(errorData.message || `팀 정보를 불러오는 데 실패했습니다 (Status: ${teamResponse.status}).`);
      }

      const rawTeamData: Team = await teamResponse.json();
      const enrichedTeamData: Team = { ...rawTeamData };

      // 2. 팀원 목록 가져오기
      const membersResponse = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      let activeMembersList: TeamMember[] = [];
      if (membersResponse.ok) {
        const allMembers: TeamMember[] = await membersResponse.json();
        activeMembersList = allMembers.filter(member => member.is_active);
        setTeamMembers(activeMembersList);
        // 💡 수정: 리더를 포함하여 현재 멤버 수 계산
        enrichedTeamData.currentMembers = activeMembersList.length;
      } else {
        console.warn(`팀원 목록을 불러오는 데 실패했습니다 (Status: ${membersResponse.status}).`);
        setTeamMembers([]);
        // 💡 수정: 리더만 있을 경우를 고려하여 1로 설정
        enrichedTeamData.currentMembers = 1;
      }

      // 3. 팀장 정보 가져오기 (기존 로직 유지)
      let fetchedLeaderProfile: UserProfile | null = null;
      if (rawTeamData.leaderId) {
        try {
          const leaderResponse = await fetch(`${API_GATEWAY_URL}/api/users/${rawTeamData.leaderId}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (leaderResponse.ok) {
            const parsedData = await leaderResponse.json();
            if (parsedData && typeof parsedData === 'object' && 'username' in parsedData && 'email' in parsedData) {
              fetchedLeaderProfile = parsedData as UserProfile;
              enrichedTeamData.leaderUsername = fetchedLeaderProfile.username;
            } else {
              console.warn("팀장 사용자 정보 API 응답 형식이 올바르지 않거나 필수 필드가 누락되었습니다.", parsedData);
              enrichedTeamData.leaderUsername = "[팀장 이름 정보 없음]";
            }
          } else {
            console.warn(`팀장 사용자 정보 불러오기 실패 (ID: ${rawTeamData.leaderId}, Status: ${leaderResponse.status}, Text: ${await leaderResponse.text()})`);
            enrichedTeamData.leaderUsername = "[팀장 이름 정보 없음]";
          }
        } catch (leaderErr) {
          console.error("팀장 사용자 정보 불러오기 오류:", leaderErr);
          enrichedTeamData.leaderUsername = "[팀장 이름 정보 없음]";
        }
      } else {
          enrichedTeamData.leaderUsername = "[팀장 ID 없음]";
      }
      setLeaderProfile(fetchedLeaderProfile);

      // 4. 공모전 정보 가져오기 (기존 로직 유지)
      if (rawTeamData.contestId) {
        let foundContestTitle = "[알 수 없는 공모전]";
        let fetchedFromApiSuccessfully = false;

        try {
          const contestResponse = await fetch(`${API_GATEWAY_URL}/api/contests/${rawTeamData.contestId}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (contestResponse.ok) {
            const fetchedContest: Contest = await contestResponse.json();
            if (fetchedContest.title) {
              foundContestTitle = fetchedContest.title;
              fetchedFromApiSuccessfully = true;
            } else {
              console.warn(`[TeamDetail] 공모전 API 응답에 'title' 필드가 없습니다. (ID: ${rawTeamData.contestId}, 응답: ${JSON.stringify(fetchedContest)})`);
              foundContestTitle = "[공모전 제목 없음 (API 응답 오류)]";
            }
          } else {
            const errorText = await contestResponse.text();
            console.warn(`[TeamDetail] 공모전 정보 불러오기 실패 (ID: ${rawTeamData.contestId}, Status: ${contestResponse.status}, 응답 본문: ${errorText})`);
          }
        } catch (contestErr: any) {
          console.error("[TeamDetail] 공모전 정보 불러오기 오류 (네트워크/파싱):", contestErr.message || contestErr);
        }

        if (!fetchedFromApiSuccessfully) {
          const localContest = contests.find(c => c.id === rawTeamData.contestId);
          if (localContest) {
            foundContestTitle = localContest.title;
            console.info(`[TeamDetail] 공모전 정보 API 실패 후 로컬 목록에서 제목을 찾았습니다: ${localContest.title}`);
          } else {
            console.warn(`[TeamDetail] 로컬 공모전 목록에서도 ID ${rawTeamData.contestId}에 해당하는 공모전을 찾을 수 없습니다.`);
            foundContestTitle = "[알 수 없는 공모전 (정보 부족)]";
          }
        }
        enrichedTeamData.contestTitle = foundContestTitle;

      } else {
        console.info("[TeamDetail] 팀 데이터에 contestId가 없습니다.");
        enrichedTeamData.contestTitle = "[참가 공모전 없음]";
      }
      
      // 5. 모집 현황 상태 업데이트 (currentMembers를 기반으로 수정)
      if (enrichedTeamData.isRecruiting) {
        if (enrichedTeamData.currentMembers && enrichedTeamData.maxMembers && enrichedTeamData.currentMembers >= enrichedTeamData.maxMembers) {
          enrichedTeamData.status = "모집완료";
        } else if (enrichedTeamData.currentMembers && enrichedTeamData.maxMembers && enrichedTeamData.currentMembers >= enrichedTeamData.maxMembers - 1) {
          enrichedTeamData.status = "마감임박";
        } else {
          enrichedTeamData.status = "모집중";
        }
      } else {
        enrichedTeamData.status = "모집완료";
      }

      // 6. 상태 업데이트
      setTeam({
        ...enrichedTeamData,
        location: enrichedTeamData.location ?? "정보 없음",
        requirements: enrichedTeamData.requirements ?? "",
        contactMethod: enrichedTeamData.contactMethod ?? "platform",
        contactInfo: enrichedTeamData.contactInfo ?? "",
        allowDirectApply: enrichedTeamData.allowDirectApply ?? true,
        neededRoles: enrichedTeamData.neededRoles ?? [],
        skills: enrichedTeamData.skills ?? [],
      });
    } catch (err: any) {
      console.error("팀 정보 불러오기 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
      toast.error(`팀 정보 불러오기 실패: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, API_GATEWAY_URL]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("팀 삭제 권한이 없습니다. 로그인 상태를 확인해주세요.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 삭제에 실패했습니다.");
      }

      toast.success("팀이 성공적으로 비활성화(삭제)되었습니다.");
      router.push("/teams");
    } catch (err: any) {
      console.error("팀 삭제 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
      toast.error(err.message || "팀 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!isAuthenticated || !user) {
      toast.warning("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!team) {
      toast.error("팀 정보를 찾을 수 없습니다.");
      return;
    }

    // 팀장 본인인 경우
    if (user.id === team.leaderId) {
      toast.info("팀장은 본인 팀에 지원할 수 없습니다.");
      return;
    }

    // 이미 팀원인 경우
    const isAlreadyMember = teamMembers.some(member => member.userId === user.id) || (user.id === team.leaderId);
    if (isAlreadyMember) {
      toast.info("이미 팀원으로 참여 중입니다.");
      return;
    }

    // 직접 지원이 허용되지 않은 경우
    if (!team.allowDirectApply) {
      toast.warning("이 팀은 직접 지원이 허용되지 않습니다. 팀장에게 연락해주세요.");
      return;
    }

    // 모집이 완료되었거나 마감된 경우
    if (!team.isRecruiting || team.status === "모집완료") {
      toast.warning("이 팀은 현재 모집 중이 아닙니다.");
      return;
    }

    setIsJoining(true);
    try {
      // 💡 백엔드 API 호출: 팀 지원 신청
      // (이전에 저장된 ApplicationsController의 API 엔드포인트와 연결)
      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${team.id}/applyapplications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-USER-ID": user.id, // 사용자 ID를 헤더에 포함
        },
        // Request body는 지원 관련 추가 정보(예: 자기소개, 지원 동기 등)를 포함
        // 현재 코드에선 별도의 DTO가 없으므로 빈 객체를 보냄
        body: JSON.stringify({ /* 필요한 경우 추가 데이터 */ }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) { // HTTP 409 Conflict: 이미 지원했거나 팀원일 경우
          throw new Error("이미 이 팀에 지원했거나 팀원입니다.");
        }
        throw new Error(errorData.message || "팀 지원에 실패했습니다.");
      }

      toast.success("팀 지원 신청이 완료되었습니다!");
      // 지원 후 필요에 따라 페이지를 새로고침하거나 상태를 업데이트할 수 있습니다.
      // 여기서는 성공 메시지를 보여주고 끝냅니다.
    } catch (err: any) {
      console.error("팀 지원 오류:", err);
      toast.error(err.message || "팀 지원 중 오류가 발생했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadgeVariant = (status?: string, isRecruiting?: boolean) => {
    if (status === "모집완료" || !isRecruiting) return "secondary";
    if (status === "마감임박") return "destructive";
    if (status === "모집중") return "default";
    return "outline";
  };

  const getContactIcon = (method: string | undefined) => {
    if (!method) return <Info className="w-4 h-4 mr-2 text-gray-400" />;
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4 mr-2" />;
      case "kakao":
        return <MessageSquare className="w-4 h-4 mr-2" />;
      case "discord":
        return <MessageSquare className="w-4 h-4 mr-2" />;
      default:
        return <Info className="w-4 h-4 mr-2 text-gray-400" />;
    }
  };

  const isLeader = user?.id === team?.leaderId;
  // 💡 수정: 리더를 포함한 총 멤버 수 계산
  const totalMembers = teamMembers.length;
  const isTeamFull = team && team.currentMembers && team.maxMembers && team.currentMembers >= team.maxMembers;
  const isMemberOrLeader = teamMembers.some(member => member.userId === user?.id) || isLeader;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-lg text-gray-700">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/teams">
          <Button>팀 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-lg text-gray-700 mb-4">팀 정보를 찾을 수 없습니다.</p>
        <Link href="/teams">
          <Button>팀 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const displayLeaderName = team.leaderUsername || "알 수 없음";
  const displayLeaderInitial = displayLeaderName.trim().length > 0 ? displayLeaderName.trim()[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/teams">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600">{team.description}</p>
            </div>
          </div>
          {isLeader && (
            <div className="flex gap-2">
              <Button variant="default" onClick={() => setIsInviteModalOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                팀원 초대하기
              </Button>
              <Link href={`/teams/${team.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  팀 수정
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    팀 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 팀을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 팀과 관련된 모든 데이터가 영구적으로 삭제됩니다. (현재는 모집 중지 및 비공개 처리됩니다.)
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTeam} disabled={isDeleting}>
                      {isDeleting ? "삭제 중..." : "삭제"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">참가 공모전</p>
                    <p className="text-lg font-semibold flex items-center mt-1">
                      <Award className="w-4 h-4 mr-2 text-yellow-500" />
                      {team.contestTitle || "[공모전 정보 없음]"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">활동 지역</p>
                    <p className="text-lg font-semibold flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {team.location || "[활동 지역 정보 없음]"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">모집 현황</p>
                  <div className="text-lg font-semibold mt-1">
                    {/* 💡 수정: totalMembers 변수를 사용하여 리더를 포함한 총 인원 수 표시 */}
                    {`${totalMembers} / ${team.maxMembers} 명`}
                    <Badge variant={getStatusBadgeVariant(team.status, team.isRecruiting)} className="ml-2">
                      {team.status || (team.isRecruiting ? "모집중" : "모집완료")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">생성일</p>
                  <p className="text-md text-gray-700 mt-1">
                    {new Date(team.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>모집 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">모집하는 역할</p>
                  <div className="flex flex-wrap gap-2">
                    {team.neededRoles && team.neededRoles.length > 0 ? (
                      team.neededRoles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">모집하는 역할이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">필요한 기술 스택</p>
                  <div className="flex flex-wrap gap-2">
                    {team.skills && team.skills.length > 0 ? (
                      team.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">필요한 기술 스택이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">지원 요구사항</p>
                  <div className="flex items-start mt-1">
                    <FileText className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                    <p className="text-md text-gray-700 whitespace-pre-wrap">
                      {team.requirements || "특별한 요구사항이 없습니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>연락 방법</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">주요 연락 방법</p>
                  <p className="text-lg font-semibold flex items-center mt-1">
                    {getContactIcon(team.contactMethod)}
                    {team.contactMethod === "platform"
                      ? "플랫폼 내 메시지"
                      : team.contactMethod === "email"
                      ? "이메일"
                      : team.contactMethod === "kakao"
                      ? "카카오톡"
                      : team.contactMethod === "discord" // 수정된 부분
                      ? "디스코드"
                      : "[연락 방법 정보 없음]"}
                  </p>
                </div>
                {team.contactMethod && team.contactMethod !== "platform" && team.contactInfo ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">연락처 정보</p>
                    <p className="text-md text-gray-700">{team.contactInfo}</p>
                  </div>
                ) : (
                  team.contactMethod &&
                  team.contactMethod !== "platform" && (
                    <div>
                      <p className="text-gray-600">연락처 정보가 제공되지 않습니다.</p>
                    </div>
                  )
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
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xl">
                      {displayLeaderInitial}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{displayLeaderName}</h3>
                  {isLeader && leaderProfile && leaderProfile.email && (
                    <p className="text-sm text-gray-600">{leaderProfile.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>팀 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  {team.isPublic ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <p className="text-sm">
                    팀 공개 상태: <span className="font-semibold">{team.isPublic ? "공개" : "비공개"}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {team.allowDirectApply ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <p className="text-sm">
                    직접 지원 허용: <span className="font-semibold">{team.allowDirectApply ? "허용" : "불허"}</span>
                  </p>
                </div>
                {team.categoryIds && team.categoryIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">관련 카테고리</p>
                    <div className="flex flex-wrap gap-2">
                      {team.categoryIds.map((categoryId: string) => (
                        <Badge key={categoryId} variant="outline">
                          {categoryId.substring(0, 0)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isLeader && !isMemberOrLeader && team.isRecruiting && team.allowDirectApply && !isTeamFull && (
              <Card>
                <CardContent className="p-4">
                  <Button className="w-full" size="lg" onClick={handleJoinTeam} disabled={isJoining}>
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        지원하는 중...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        팀 지원하기
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">팀에 지원하여 함께 프로젝트를 시작해보세요!</p>
                </CardContent>
              </Card>
            )}
            
            {/* 지원 불가 상태 표시 */}
            {(!team.isRecruiting || !team.allowDirectApply || isTeamFull || isMemberOrLeader) && !isLeader && (
              <Card>
                <CardContent className="p-4 text-center text-gray-600">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p>
                    {isTeamFull && "이 팀은 이미 인원이 모두 찼습니다."}
                    {!team.isRecruiting && "이 팀은 현재 모집 중이 아닙니다."}
                    {!team.allowDirectApply && "이 팀은 직접 지원이 허용되지 않습니다."}
                    {isMemberOrLeader && "이미 이 팀의 멤버입니다."}
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      <Footer />
      
      {isLeader && team && (
        <InviteMemberModal
          teamId={team.id}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => { /* 성공 시 필요한 추가 액션 */ }}
        />
      )}
    </div>
  );
}

export default function TeamDetailPageWrapper() {
  return (
    <ProtectedRoute>
      <TeamDetailPageContent />
    </ProtectedRoute>
  );
}