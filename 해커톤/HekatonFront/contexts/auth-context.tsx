"use client"
//0804 -참여 중인 팀 목록, 신청한 팀 목록 구현하기
//0805 - 프로필 호출 시 스킬 정보도 같이 가져오는 기능 구현하기
import { createContext, SetStateAction, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { UUID } from "crypto"
import { User } from "lucide-react"


interface User {
  id: string
  username: string
  email: string
  phoneNumber: string 
}

export interface Profile {   
    userId: string 
    fullName : string
    bio : string
    profileImageUrl : string
    education : string
    experience : string
    portfolioUrl : string
    isPublic?: boolean // 프로필 공개 여부
    skills?: UserSkills[] // 사용자의 스킬 정보
}

export interface UserSkills{
  userId: string
  skillId: number
  skillName: string
  category: string
  description: string
  
}

export interface Skills{  
  id: number
  name : string
  category : string  
  description : string  
}

export interface NcsCategory{
  id : string
  code : string
  name : string
  parent_code : string
  level : string
  description : string 
  
}

interface TeamDatas{
  id: UUID
  name: string
  description: string
  leaderId: UUID
  contestId: UUID
  isRecruiting: boolean
  isPublic: boolean
  maxMembers: number
  createdByUserId : UUID
  createdAt: Date
  updatedAt: Date
  neededRoles : string[]
  skills: string[]
  categoryIds: string[]
  location: string
  requirements: string
  contactMethod: string
  contactInfo: string
  allowDirectApply: boolean
}

interface TeamContextType{
  Teams: TeamDatas[] // 팀 목록
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  //팀 정보 조회
  getTeam: (teamId: UUID) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 생성
  createTeam: (teamData: TeamDatas) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 수정
  updateTeam: (teamId: UUID, teamData: Partial<TeamDatas>) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 삭제
  deleteTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 참여 신청
  applyToTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 참여 승인
  approveTeamApplication: (teamId: UUID, userId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 참여 거절
  rejectTeamApplication: (teamId: UUID, userId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 탈퇴
  leaveTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }>
  //팀장 변경
  changeTeamLeader: (teamId: UUID, newLeaderId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 목록 조회
  getAllTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] }>
  //사용자가 속한 팀 목록 조회
  getMyTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] }>
  //사용자가 신청한 팀 목록 조회
  getAppliedTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] }>
  //팀원 목록 조회
  getTeamMembers: (teamId: UUID) => Promise<{ success: boolean; message: string; data: User[] }>

}

interface AuthContextType {
  user: User | null 
  isLoading: boolean
  isAuthenticated: boolean
  viewProfile: () => Promise<{ success: boolean; message: string; profile: Profile;}>
  //프로필 데이터를 DB에 저장
  saveProfile: (profile: Profile) => Promise<{ success: boolean; message: string;}>  
  getOtherUserProfile :( userId : string ) => Promise<{ success: boolean; otherUserProfile?: Profile | null; message?: string  } | null>
  getAllUserProfiles: () => Promise<{ success: boolean; message: string; data: Profile[] }>  
  signUp: (email: string, password: string, username: string, phone: string) => Promise<{ success: boolean; message: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  viewUserSkills : () => Promise<{ success: boolean; message: string; data : UserSkills[] | [] } >
  getSkills : () => Promise<{ success: boolean; message: string;  data : Skills[]} >
  getNcsCategory : () => Promise<{success:boolean; message: string}>
  saveUserSkills: (skills : UserSkills[]) => Promise<{ success: boolean; message: string }>
  
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

  // 팀 컨텍스트 생성
const TeamContext = createContext<TeamContextType | undefined>(undefined)

const AUTH_SERVER_URL = 'http://localhost:60000'; // auth-server 직접 호출
const API_GATEWAY_URL = 'http://localhost:8080'; // api-gateway 호출

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)    
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  //컴포넌트 마운트 시 저장된 세션 확인
  useEffect(() => {
    setIsLoading(true)
    const checkSession = async () => {
        //console.log("세션 확인 중...")
      try {
        
        const res = await fetch(`${AUTH_SERVER_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {

          const data = await res.json();
          //console.log("세션 확인 성공:", data);

          // 자동 로그인 후 사용자 정보 가져오기
          const meRes = await fetch(`${API_GATEWAY_URL}/api/users/me`, {
            method: 'GET',
            credentials: 'include' // JWT 쿠키 포함
          });

          if (!meRes.ok) {
            console.error("사용자 정보 불러오기 실패");
            setUser(null);
            
            return;
          }

          const userData = await meRes.json();
          setUser(userData);
          
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("세션 확인 실패", err);
        setUser(null);
      }
      finally {
        setIsLoading(false);
      }


    };

  checkSession(); // 앱 최초 실행 시 호출
   
  }, [])

  // 자동 로그아웃 타이머 설정
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    if (user) {
      logoutTimer = setTimeout(() => {
        logout(); // 액세스 토큰 만료되었을 수 있음
      }, 1000 * 60 * 60); // 예: 1시간 후 로그아웃
    }

    return () => clearTimeout(logoutTimer);
  }, [user]);

  //회원가입 요청
  const signUp = async (email: string, password: string, username: string, phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        phone_number : phoneNumber
                    })
                });

      if (response.ok) {

        console.log("회원가입 성공:")

        const msRes = await login(username, password)
        if(!msRes.success){
          return msRes
        }else
        {
           console.log("자동 로그인 실행")
        }

        return { success: true, message: "회원가입에 성공했습니다." }
      } else {
        const msg = await response.text()
        
        return { success: false, message: msg || "회원가입에 실패했습니다." }
      }
    } catch (error) {
     
      return { success: false, message: "회원가입 중 오류가 발생했습니다." }
    }
    finally {
      setIsLoading(false)
    }
  }
  
  // 로그인 함수
  // 이메일과 비밀번호를 받아서 로그인 처리
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    try {
      // 로그인 확인
      const response = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
      
      if (response.ok) {
        // 로그인 성공 시 사용자 정보 받아오기 (예: /api/users/me)
        const meRes = await fetch(`${API_GATEWAY_URL}/api/users/me`, {
                    method: 'GET',
                    credentials: 'include' // JWT 쿠키 포함
        });

        if (!meRes.ok) {
         
          return { success: false, message: "사용자 정보를 불러오지 못했습니다." }
        }
        const userData = await meRes.json()
        setUser(userData)
        
        console.log(userData)
        return { success: true, message: "로그인에 성공했습니다." }
      } else {
        const msg = await response.text()
        
        return { success: false, message: msg +  "이메일 또는 비밀번호가 올바르지 않습니다." || "이메일 또는 비밀번호가 올바르지 않습니다." }
      }

    } catch (error) {
     
      return { success: false, message: "로그인 중 오류가 발생했습니다." }
    }
    finally{
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)

    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    try {
      // 로그인 확인
      const response = await fetch(`${AUTH_SERVER_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함                    
                });
      
      if (response.ok) {

        setUser(null)

        return { success: true, message: "로그아웃 완료." }

      } else {

        const msg = await response.text()

        return { success: false, message: msg +  "오류가 발생하였습니다." }

      }

    } catch (error) {
      
      return { success: false, message: "오류가 발생하였습니다." }
    }
    finally{
      setIsLoading(false)
    }

  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      //localStorage.setItem("EqualLocal_user", JSON.stringify(updatedUser))
    }
  }

  //프로필 데이터가 없을 경우
  const FallbackProfile = (): Profile => ({
    userId: "",
    fullName: "",
    bio: "",
    profileImageUrl: "/placeholder.svg",
    education: "",
    experience: "",
    portfolioUrl: "",
    isPublic: false, // 기본값으로 false 설정
  });

  //자신의 프로필 정보 불러오기
  const viewProfile = async () : Promise<{success: boolean; message: string; profile: Profile;}> => {    
    if (!user) return {
          success: false,
          message: "사용자 정보가 없습니다.",
          profile : FallbackProfile()       
        } 

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/me`, {
                    method: 'GET',
                    credentials: 'include'
      });     
      //데이터가 없으면
      if (!response.ok) {
        return {
          success: false,
          message: "사용자 정보를 불러오지 못했습니다.",
          profile : FallbackProfile()       
        }        
      }
      else{
        
      const profileData = await response.json()     
      
      if (profileData) { 

        const parsedProfile: Profile = {
          userId: profileData.userId || user.id, // user.id를 기본값으로 사용
          fullName: profileData.fullName || "",
          bio: profileData.bio || "",
          profileImageUrl: profileData.profileImageUrl || "/placeholder.svg",
          education: profileData.education || "",
          experience: profileData.experience || "",
          portfolioUrl: profileData.portfolioUrl || "",
          isPublic: profileData.isPublic !== undefined ? profileData.isPublic : false, // isPublic이 없으면 기본값 false
        };
        
        return {
          success: true,
          message: "프로필 불러오기 성공",  
          profile : parsedProfile                
        }

      }
      else{
          return {
            success: false,
            message: "받은 데이터 정보가 없습니다.",  
            profile : FallbackProfile()               
          }
        }
      }

    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
          success: false,
          message: "프로필 불러오기 오류", 
          profile : FallbackProfile()       
      }

    }
    
  }

  //프로필 추가/수정
  const saveProfile = async (profile: Profile): Promise<{ success: boolean; message: string;}> => {
    if (!user) return { success: false, message: "사용자 정보가 없습니다." }    
    try {      
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        userId: user.id,                       
                        fullName: profile.fullName,
                        bio: profile?.bio,
                        profileImageUrl: profile?.profileImageUrl, //| 'https://example.com/profile.jpg',
                        education: profile?.education,
                        experience: profile?.experience,
                        portfolioUrl: profile?.portfolioUrl, //'https://example.com/portfolio'
                        isPublic: profile?.isPublic
                    })
                });

      if (!response.ok) {
        const msg = await response.text()
        return {success: false, message: "프로필 업데이트에 실패했습니다. " + msg }
      }
      // Optionally update user state here if needed
      return { success: true, message: "프로필이 성공적으로 업데이트되었습니다." }

    } catch (error) {

      console.error("프로필 업데이트 오류:", error)
      
      return { success: false, message: "프로필 업데이트 중 오류가 발생했습니다." }
    }

  }
  /*
    특정 사용자의 프로필 조회
    프로필이 없으면 null 리턴
  */
  const getOtherUserProfile = async (userId : string) => {
    
    if (!user) return null

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
      });

      //데이터가 없으면
      if (!response.ok) {         
        
        return{ 
          success: false, 
          otherUserProfile: null,
          message : "프로필 데이터가 없습니다." } 
      }

      const profileData = await response.json()     
 
      if (profileData) { 

        const parsedProfile: Profile = {
          userId: profileData.userId,
          fullName: profileData.fullName,
          bio: profileData.bio,
          profileImageUrl: profileData.profileImageUrl,
          education: profileData.education ,
          experience: profileData.experience ,
          portfolioUrl: profileData.portfolioUrl,
          isPublic: profileData.isPublic, // isPublic이 없으면 기본값 false
        };

        return {
          success: true,
          otherUserProfile: parsedProfile,
          message : "프로필 데이터를 찾았습니다."           
        }

      }
      else{
          return {
            success: false,
            otherUserProfile: null,
            message: "받은 데이터 정보가 없습니다.",            
          }
        }

    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        otherUserProfile: null,
        message: "프로필 불러오기 오류",        
      }

    }
  }
  /*모든 사용자의 프로필을 가져옴*/
  const getAllUserProfiles = async (): Promise<{ success: boolean; message: string; data: Profile[] }> => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles`, {
                    method: 'GET',
                    credentials: 'include'
      });      

      if (!response.ok) {
        return { success: false, message: "사용자 프로필 데이터를 불러오지 못했습니다.", data: [] }
      }

      const userSkillResponse = await fetch(`${API_GATEWAY_URL}/api/users/skills`, {
                    method: 'GET',
                    credentials: 'include'
      }); 

      if (!userSkillResponse.ok) {
        return { success: false, message: "사용자 스킬 데이터를 불러오지 못했습니다.", data: [] }
      }else {
        console.log("사용자 스킬 데이터 불러오기 성공")
        
      }
      const profilesData = await response.json();

      const userSkillData = await userSkillResponse.json();

      //console.log(userSkillData)

      const profiles: Profile[] = profilesData.map((profile: any) => ({
        userId: profile.userId,
        fullName: profile.fullName,
        bio: profile.bio,
        profileImageUrl: profile.profileImageUrl || "/placeholder.svg",
        education: profile.education || "",
        experience: profile.experience || "",
        portfolioUrl: profile.portfolioUrl || "",
        isPublic: profile.isPublic !== undefined ? profile.isPublic : false, // isPublic이 없으면 기본값 false
        skills: userSkillData.filter((skill: any) => skill.userId === profile.userId)
      }));

      return { success: true, message: "사용자 프로필 데이터를 성공적으로 불러왔습니다.", data: profiles }

    } catch (error) {

      console.error("사용자 프로필 데이터 불러오기 오류:", error)

      return { success: false, message: "사용자 프로필 데이터를 불러오는 중 오류가 발생했습니다.", data: [] }

    }
  }
  //사용자가 등록한 스킬 정보를 가져옵니다.
  const viewUserSkills = async (): Promise< { success: boolean; message: string; data: UserSkills[] | [] }> => {
    //사용자 정보 체크
    if (!user) return { success: false, message: "사용자 정보가 없습니다.", data:[] }   

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/skills`, {
                    method: 'GET',
                    credentials: 'include'
      });
     
      //데이터가 없으면
      if (!response.ok) {
        return{ 
          success: false,
          message : "사용자 스킬 데이터가 없습니다.",
          data : []
        } 
      }

      const rawSkills: any[] = await response.json();

      // 데이터 파싱 (string → number 변환)
      const userSkills: UserSkills[] = rawSkills.map((skill: any) => ({
        id: skill.id || "",
        userId: skill.userId || user.id, // user.id를 기본값으로 사용
        skillId: skill.skillId || 0, // skillId가 없으면 기본값
        skillName: skill.skillName || "",
        category: skill.category || "",
        description: skill.description || "",
        proficiency: skill.proficiency || 0, // 프로피션시 기본값
        created_at: skill.created_at || new Date().toISOString(), // created_at이 없으면 현재 시간

      }));

      return {
        success: true,
        message: "사용자 스킬 데이터를 불러왔습니다.",
        data: userSkills,
      }
    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        message: "프로필 불러오기 오류",
        data : []        
      }

    }

  }

  const saveUserSkills = async (skills : UserSkills[]): Promise<{ success: boolean; message: string }> => {
     if (!user) return {
        success: false,
        message: "사용자 정보가 없습니다.",        
      }
      console.log("사용자 스킬 정보 저장 요청:", skills)

      if (skills.length === 0) {
        return {
          success: false,
          message: "저장할 스킬 정보가 없습니다.",
        }
      }


    const requestBody = {
    userId: user.id,
    skills: skills.map(skill => ({
      skillId: skill.skillId,
      proficiency: 3, // ← 예시. 실제론 사용자 입력값이 있어야 함
    })),
  };

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/skills`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody), // 💡 핵심: skills 배열 그대로 전송
      });
     
      //데이터가 없으면
      if (!response.ok) {
        return {
          success: false,
          message : "사용자 스킬 데이터가 없습니다."
        }
      }

      return {
        success: true,
        message: "사용자 스킬 데이터를 불러왔습니다.",   
      }

    } catch (error) {
      
        console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        message: "프로필 불러오기 오류",        
      }

    }

  }

  const getNcsCategory = async (): Promise<{success:boolean; message: string}>=> {

    return { success: true, message: "프로필이 성공적으로 업데이트되었습니다." }
    
  }

  //DB에 저장된 모든 스킬 정보 불러오기
  const getSkills = async (): Promise<{ success: boolean; message: string;  data : Skills[] | [] }> => {

    try{
      const response = await fetch(`${API_GATEWAY_URL}/skills`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',                   
                });      

      if (!response.ok) {        
        return { success: false, message: "기술 데이터를 불러오기에 실패했습니다.", data : [] }
      }
      const skillsData = await response.json()      

      const allSkills: Skills[] = skillsData.map((skill: any) => ({
        id: skill.id || "",
        name: skill.name || "",
        category: skill.category || "",
        description: skill.description || "",
      }));

      return { 
        success : true, 
        message: "기술 데이터를 성공적으로 불러왔습니다.", 
        data: allSkills, 
      }

    } catch (error) {

      console.error("기술 데이터 불러오기 오류:", error)

      return { success : false, message: "기술 데이터를 불러오는 중 오류가 발생했습니다.", data: [] }

    }
    
  }

  const value: AuthContextType = {
    //사용자 정보 관련 기능
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading, // user가 존재하고 로딩 중이 아닐 때 인증됨
    signUp,
    login,
    logout,
    viewProfile,
    saveProfile,
    updateUser,
    viewUserSkills,
    saveUserSkills,
    getSkills,
    getNcsCategory,
    getOtherUserProfile,
    getAllUserProfiles,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  
}

export function TeamProvider({ children }: { children: React.ReactNode }) {

  const teamContextValue: TeamContextType = {
    Teams: [], // 초기값은 빈 배열로 설정
    isLoading: false,
    setIsLoading: () => { },
    getTeam: async (teamId: UUID) => {
      return { success: false, message: "팀 정보를 불러오는 기능은 아직 구현되지 않았습니다.", team: null }
    },
    createTeam: function (teamData: TeamDatas): Promise<{ success: boolean; message: string; team: TeamDatas | null }> {
      throw new Error("Function not implemented.")
    },
    updateTeam: function (teamId: UUID, teamData: Partial<TeamDatas>): Promise<{ success: boolean; message: string; team: TeamDatas | null }> {
      throw new Error("Function not implemented.")
    },
    deleteTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    applyToTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    approveTeamApplication: function (teamId: UUID, userId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    rejectTeamApplication: function (teamId: UUID, userId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    leaveTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    changeTeamLeader: function (teamId: UUID, newLeaderId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    getAllTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
      throw new Error("Function not implemented.")
    },
    getMyTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
       try {
        const response = fetch(`${API_GATEWAY_URL}/api/teams`, {
          method: 'GET',
          credentials: 'include' // JWT 쿠키 포함
        });
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            return { success: false, message: msg || "팀 목록을 불러오지 못했습니다.", data: [] }
          }
          const data = await res.json()          
          
          const teams: TeamDatas[] = data.content.map((team: TeamDatas) => ({

            id: team.id,
            name: team.name,
            description: team.description,
            leaderId: team.leaderId,
            contestId: team.contestId,
            isRecruiting: team.isRecruiting,
            isPublic: team.isPublic,
            maxMembers: team.maxMembers,
            createdAt: new Date(team.createdAt),
            updatedAt: new Date(team.updatedAt),
            allowDirectApply: team.allowDirectApply,
            categoryIds: team.categoryIds || [],
            contactInfo: team.contactInfo || "",
            contactMethod: team.contactMethod || "",
            createdByUserId: team.createdByUserId,
            location: team.location || "",
            neededRoles: team.neededRoles || [],
            requirements: team.requirements || [],
            skills: team.skills || []
          }))
          
          return { success: true, message: "팀 목록을 성공적으로 불러왔습니다.", data: teams }
        })
      } catch (error) {
        console.error("팀 목록 불러오기 오류:", error)
        return Promise.resolve({
          success: false,
          message: "팀 목록을 불러오는 중 오류가 발생했습니다.",
          data: []
        })
      }
    },
    //내가 신청한 팀 목록 조회 구현
    getAppliedTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
       try {
        const response = fetch(`${API_GATEWAY_URL}/api/teams/users/me/applications`, {
          method: 'GET',
          credentials: 'include'       
        });

        
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            return { success: false, message: msg + " 팀 목록을 불러오지 못했습니다.", data: [] }
          }
          const data = await res.json()         

          return { success: true, message: "팀 목록을 성공적으로 불러왔습니다.", data: [] }
        })
      } catch (error) {
        console.error("팀 목록 불러오기 오류:", error)
        return Promise.resolve({
          success: false,
          message: "팀 목록을 불러오는 중 오류가 발생했습니다.",
          data: []
        })
      }
    },
    getTeamMembers: function (teamId: UUID): Promise<{ success: boolean; message: string; data: User[] }> {
      throw new Error("Function not implemented.")
    }
  }

  return (
    <TeamContext.Provider value={teamContextValue}>
      {children}
    </TeamContext.Provider>
  )
}


export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}