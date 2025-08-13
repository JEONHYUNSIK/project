"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth, Profile as AuthProfile } from "@/contexts/auth-context";

// Profile 타입이 auth-context에서 가져오는 Profile 타입과 다를 수 있으므로 별칭을 사용합니다.
// 여기서는 `userId`와 `fullName`을 포함하는 타입으로 가정합니다.
interface Profile {
  userId: string;
  fullName: string;
  // 추가적으로 id, username 등의 속성이 있을 수 있습니다.
  id?: string;
  username?: string;
}

// useDebounce 훅이 별도 파일로 없기 때문에, 여기에 직접 정의하여 사용합니다.
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


interface InviteMemberModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

export function InviteMemberModal({ teamId, isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  // `useAuth`에서 가져오는 `user` 객체와 `getAllUserProfiles` 함수를 구조 분해 할당으로 가져옵니다.
  const { user, getAllUserProfiles } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 현재 로그인한 사용자를 검색 결과에서 제외하는 함수
  const filterOutCurrentUser = useCallback((users: Profile[]) => {
    if (!user) return users;
    // user 객체에 `id` 또는 `userId` 속성이 있다고 가정하고 필터링합니다.
    const currentUserId = (user as any).id || (user as any).userId;
    if (!currentUserId) return users;
    return users.filter(member => (member.id || member.userId) !== currentUserId);
  }, [user]);

  const fetchInitialUsers = async () => {
    setIsSearching(true);
    try {
      const response = await getAllUserProfiles();

      if (!response.success) {
        throw new Error(response.message || "사용자 목록을 불러오는 데 실패했습니다.");
      }
      
      const filteredUsers = filterOutCurrentUser(response.data);
      setSearchResults(filteredUsers);
    } catch (err: any) {
      console.error("초기 사용자 목록 로딩 오류:", err);
      toast.error(`사용자 목록 로딩 실패: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setIsSearching(false);
    }
  };

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchInitialUsers();
      return;
    }

    setIsSearching(true);
    try {
      const response = await getAllUserProfiles();
      
      if (!response.success) {
        throw new Error(response.message || "사용자 목록을 불러오는 데 실패했습니다.");
      }

      const allUsers: Profile[] = response.data;
      
      const filteredUsers = filterOutCurrentUser(allUsers).filter(userProfile => 
        // fullName 또는 username 속성으로 검색하도록 수정
        (userProfile.fullName?.toLowerCase().includes(query.toLowerCase()) || 
        userProfile.username?.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filteredUsers);
    } catch (err: any) {
      console.error("사용자 검색 오류:", err);
      toast.error(`사용자 검색 실패: ${err.message || "알 수 없는 오류"}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getAllUserProfiles, filterOutCurrentUser]);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때만 초기 사용자 목록을 가져옵니다.
      fetchInitialUsers();
    } else {
      // 모달이 닫힐 때 상태를 초기화합니다.
      setSearchQuery("");
      setSearchResults([]);
      setSelectedMembers([]);
      setInviteMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      searchUsers(debouncedSearchQuery);
    } else if (isOpen) {
      // 검색어가 비어있을 때 초기 목록으로 돌아가도록 처리
      fetchInitialUsers();
    }
  }, [debouncedSearchQuery, searchUsers, isOpen]);

  const toggleSelectMember = (member: Profile) => {
    setSelectedMembers(prevSelected => {
      // userId 또는 id를 사용하여 선택 여부 확인
      const memberId = member.userId || member.id;
      if (!memberId) return prevSelected;
      
      if (prevSelected.some(m => (m.userId || m.id) === memberId)) {
        return prevSelected.filter(m => (m.userId || m.id) !== memberId);
      } else {
        return [...prevSelected, member];
      }
    });
  };

  const handleInviteMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      toast.warning("초대할 팀원을 한 명 이상 선택해주세요.");
      return;
    }
    if (!inviteMessage.trim()) {
      toast.warning("초대 메시지를 입력해주세요.");
      return;
    }

    setIsSendingInvite(true);
    let allInvitationsSuccess = true;

    for (const member of selectedMembers) {
      try {
        const memberIdentifier = member.userId || member.id;
        if (!memberIdentifier) {
          throw new Error("초대할 사용자의 ID를 찾을 수 없습니다.");
        }

        const response = await fetch(`${API_GATEWAY_URL}/api/invitations/teams/${teamId}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: memberIdentifier,
            message: inviteMessage,
          }),
        });

        if (!response.ok) {
          let errorBody = {};
          let memberName = member.fullName || member.username || "알 수 없는 사용자";
          let errorMessage = `[${memberName}] 초대 실패: ${response.status} ${response.statusText}`;

          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              errorBody = await response.json();
              errorMessage = (errorBody as any).message || errorMessage;
            } else {
              const text = await response.text();
              errorMessage = `[${memberName}] 초대 실패: ${text || response.statusText}`;
            }
          } catch (jsonError) {
            console.error("Failed to parse error response as JSON", jsonError);
          }

          throw new Error(errorMessage);
        }
        
      } catch (err: any) {
        allInvitationsSuccess = false;
        console.error("팀원 초대 오류:", err);
        const memberName = member.fullName || member.username || "알 수 없는 사용자";
        toast.error(err.message || `[${memberName}] 알 수 없는 오류로 초대 실패`);
      }
    }

    if (allInvitationsSuccess) {
      toast.success("초대장이 성공적으로 전송되었습니다!");
      onSuccess();
      onClose();
    } else {
        toast.error("일부 팀원 초대에 실패했습니다. 콘솔을 확인해주세요.");
    }

    setIsSendingInvite(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>팀원 초대하기</DialogTitle>
          <DialogDescription>
            초대할 팀원을 검색하고 선택한 후, 초대 메시지를 보내세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInviteMembers} className="space-y-4">
          <div className="space-y-2">
            <Label>팀원 검색</Label>
            <Command className="border rounded-lg shadow-sm">
              <CommandInput
                placeholder="이름으로 검색..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" />
                    <p>검색 중...</p>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      {searchQuery.length < 1 ? "검색어를 입력해주세요." : "검색 결과가 없습니다."}
                    </CommandEmpty>
                    <CommandGroup heading="검색 결과">
                      <ScrollArea className="h-[200px]">
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.userId || user.id}
                            onSelect={() => toggleSelectMember(user)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{(user.fullName || user.username)?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{user.fullName || user.username}</p>
                              </div>
                              {selectedMembers.some(m => (m.userId || m.id) === (user.userId || user.id)) && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </div>

          <div className="space-y-2">
            <Label>선택된 팀원</Label>
            <div className="flex flex-wrap gap-2 min-h-[40px] border rounded-lg p-2 bg-gray-50">
              {selectedMembers.length > 0 ? (
                selectedMembers.map(member => (
                  <Badge
                    key={member.userId || member.id}
                    className="cursor-pointer"
                    onClick={() => toggleSelectMember(member)}
                  >
                    {member.fullName || member.username}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">초대할 팀원을 검색하여 선택하세요.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteMessage">초대 메시지</Label>
            <Textarea
              id="inviteMessage"
              placeholder="함께 프로젝트를 시작해보아요!"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSendingInvite || selectedMembers.length === 0}>
              {isSendingInvite ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              초대장 보내기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}