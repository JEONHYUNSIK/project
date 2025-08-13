"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  X,
  Plus,
  Upload,
  Save,
  ArrowRight,
  CheckCircle,
  Loader2,
  User,
  Heart,
  Code,
  MapPin,
  Sparkles,
  SkipBackIcon as Skip,
} from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Profile, Skills, useAuth, UserSkills } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"

function ProfileEditContent() {
   const { viewProfile, saveProfile, user, 
    viewUserSkills, saveUserSkills,  getSkills } = useAuth()

   const [isLoading, setIsLoading] = useState(false)
 
   //선택된 스킬 데이터 저장
   const [selectSkill, setSelectSkill] = useState<Skills[]>([]); // 빈 Skills 배열로 초기화
 
   //모든 스킬 데이터를 가지고 있음
   const [arraySkills, setArraySkills] = useState<Skills[]>([])
 
   const [profile, setProfile] = useState<Profile>({
      userId: user?.id || "",
      fullName: "",
      bio: "",
      profileImageUrl: "/placeholder.svg",
      education: "",
      experience: "",
      portfolioUrl: "",
   })
 
   const [isSelectOpen, setIsSelectOpen] = useState(false); // Select 컴포넌트의 열림 상태를 관리하는 새 상태
 
 
   const router = useRouter()
   
   useEffect(() => {

     setIsLoading(true)     

     if (user) { // 인증되었고 사용자가 존재할 때만 데이터 가져오기

       fetchUserData(); 

     } else {
  
      router.push("/")

     }
       
     setIsLoading(false)
     
     
   }, [user]); // 와 user에 의존


   //프로필 및 스킬 정보를 가져옴
  const fetchUserData = async () => {

    try {

      const [profileResult, userSkillsResult, skillsResult] = await Promise.all([
        viewProfile(),
        viewUserSkills(),
        getSkills(),
      ]);

      if(profileResult?.success){
        setProfile(profileResult.profile)
      }else{
        console.warn("프로필 정보가 일부 누락되었거나 실패함");
      }

      let allSkills; //DB에 저장된 모든 스킬 정보 저장
      
      if (skillsResult?.success) {

        allSkills = skillsResult.data ?? []; // ✅ 안전하게 처리
        setArraySkills(allSkills);

      } else {
        console.warn("스킬 정보가 불러오기 실패함");
      }

      if(userSkillsResult?.success){

        const userSkillIds = userSkillsResult.data?.map((us) => us.skillId) ?? [];
        allSkills = skillsResult.data ?? []; // ✅ 안전하게 처리
        const selectedSkills = allSkills.filter((skill) =>
        userSkillIds.includes(skill.id)); // 

        setSelectSkill(selectedSkills); // ✅ 선택된 것만 저장

      }else{
        console.warn("사용자의 스킬 정보가 불러오기 실패함");
      }

    } catch (error) {
      console.error("프로필 또는 스킬 정보 로딩 중 오류:", error);
    }
  };



  // 프로필 저장 핸들러
  // 이 함수는 실제 API 호출을 시뮬레이션합니다.
  const handleSave = async () => {

    if (profile == null || user == null) {
      return;
    }
    setIsLoading(true)

    try {
      
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // 스킬 변환
    const userSkills: UserSkills[] = selectSkill.map((skill) => ({
      userId: user.id,
      skillId: skill.id,
      skillName: skill.name,
      skillCategory: skill.category,
      skillDescription: skill.description,
      category: skill.category,
      description: skill.description,
      proficiency: 3, // set a default or actual proficiency value if available
    }));


      const [saveProfileResult, saveUserSkillsResult] = await Promise.all([
        saveProfile(profile),
        saveUserSkills(userSkills),
      ]);

      if (
        saveProfileResult?.success &&
        saveUserSkillsResult?.success
      ) {

        console.log("프로필 업데이트 성공:")
        router.push("/mypage")
      }
      else{
        console.error("프로필 업데이트에 실패했습니다.")
        return;   
      }
     
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = (skillToAdd: Skills) => {

     if (!selectSkill.some(s => s.id === skillToAdd.id)) {
      setSelectSkill((prev) => [...prev, skillToAdd]);
    }
  }

  const removeSkill = (id: number) => {
    setSelectSkill((prev) => prev.filter((skill) => skill.id !== id));
  }

  const handleSkip = () => {
    router.push("/")
  }
  
  if (!user) {
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로딩 중...</h3>
            <p className="text-gray-600">사용자 정보를 확인하고 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">로딩 중...</h3>
            <p className="text-gray-600">프로필 정보를 불러오는 중입니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 설정</h1>
          <p className="text-gray-600">{user.username}님만의 프로필을 만들어 더 정확한 공모전 추천을 받아보세요</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">종합 프로필 정보</CardTitle>
                  <p className="text-sm text-gray-600">모든 프로필 정보를 한 곳에서 입력하고 관리하세요.</p>
                </div>
                <Button variant="ghost" onClick={handleSkip} className="shrink-0">
                  나중에 작성하기
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* 기본 정보 섹션 */}
              <div className="space-y-6 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold flex items-center"><User className="w-5 h-5 mr-2" />기본 정보</h3>
                {/* 프로필 사진 */}
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={"/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="text-2xl">{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" disabled className="bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    사진 업로드 (준비중)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG 파일만 업로드 가능합니다</p>
                </div>

                {/* 자기소개 */}
                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="자신을 간단히 소개해주세요..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">팀원들에게 보여질 소개글입니다</p>
                </div>

                {/* 지역 */}
                {/* <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    활동 지역
                  </Label>
                  <Select
                    value={profile.location}
                    onValueChange={(value) => setProfile({ ...profile, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지역을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">주로 활동하는 지역을 선택해주세요</p>
                </div> */}
              </div>

              {/* 관심 분야 & 기술 스택 섹션 */}
              <div className="space-y-6 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold flex items-center"><Heart className="w-5 h-5 mr-2" />관심 분야 & 기술 스택</h3>
                {/* 관심 분야 */}
                {/* <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">관심 분야</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newInterest} onValueChange={setNewInterest}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="관심 분야 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInterests
                          .filter((interest) => !profile.interests.includes(interest))
                          .map((interest) => (
                            <SelectItem key={interest} value={interest}>
                              {interest}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => addInterest(newInterest)} disabled={!newInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">관심 있는 공모전 분야를 선택해주세요</p>
                </div> */}

                {/* 기술 스택 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">기술 스택</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectSkill?.map((skill) => (
                      <Badge key={skill.id} variant="outline" className="flex items-center gap-1">
                        {skill.name}
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      // 1. open 상태를 직접 관리
                      open={isSelectOpen}
                      // 2. onOpenChange를 사용하여 상태 변경을 감지
                      onOpenChange={setIsSelectOpen}

                      onValueChange={(skillName: string) => {
                        const foundSkill = arraySkills.find((s) => s.name === skillName);
                        if (foundSkill) {
                          addSkill(foundSkill); // 찾은 Skills 객체를 addSkill에 전달

                          // --- 이 부분이 핵심입니다 ---
                          // 아이템을 선택한 후에도 Select가 열려있도록 강제합니다.
                          // onValueChange가 발생한 후 Select 내부적으로 닫히려고 할 수 있으므로,
                          // 명시적으로 다시 열린 상태로 설정해 줍니다.
                          setIsSelectOpen(true);
                          
                        }
                        //console.log(isSelectOpen)
                      }}>
                      
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="기술 스택 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {/*모든 스킬 불러옴*/}
                      {arraySkills?.map((skill) => (
                          <SelectItem key={skill.id} value={skill.name}>
                            {skill.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                    {/* <Button onClick={() => addSkill(newSkill)} disabled={!newSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button> */}
                  </div>
                  <p className="text-xs text-gray-500">보유하고 있는 기술이나 도구를 선택해주세요</p>
                </div>
              </div>

              {/* 추가 정보 섹션 */}
              <div className="space-y-6 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold flex items-center"><Code className="w-5 h-5 mr-2" />추가 정보 (선택)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="예: 홍길동"
                    />
                  </div>                  
                  <div className="space-y-2">
                    <Label htmlFor="education">학력</Label>
                    <Input
                      id="education"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      placeholder="예: 컴퓨터공학과 학사"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">경력</Label>
                    <Input
                      id="experience"
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      placeholder="예: 프론트엔드 개발자 2년"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">포트폴리오 URL</Label>
                    <Input
                      id="portfolio"
                      value={profile.portfolioUrl}
                      onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                      placeholder="https://portfolio.example.com"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      placeholder="https://github.com/username"
                    />
                  </div> */}
                </div>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  프로필을 더 자세히 작성할수록 더 정확한 공모전 추천을 받을 수 있습니다!
                </AlertDescription>
              </Alert>

              {/* 최종 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button variant="outline" onClick={handleSkip} className="flex-1 bg-transparent">
                  <Skip className="w-4 h-4 mr-2" />
                  나중에 설정
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      프로필 저장
                    </>
                  )}
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



export default function ProfileEditPage() {
  return (
    <ProtectedRoute>
      <ProfileEditContent />
    </ProtectedRoute>
  )
}