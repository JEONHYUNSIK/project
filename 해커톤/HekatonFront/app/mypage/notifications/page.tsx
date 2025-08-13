"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bell, Trophy, Users, MessageSquare, Settings, Check, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"

const notifications = [
  {
    id: 1,
    type: "contest",
    icon: Trophy,
    title: "공모전 마감 알림",
    message: "2025 스타트업 아이디어 공모전 마감이 7일 남았습니다.",
    time: "2시간 전",
    isRead: false,
    category: "공모전",
  },
  {
    id: 2,
    type: "team",
    icon: Users,
    title: "팀 가입 승인",
    message: "모바일 앱 개발 공모전 팀에 가입이 승인되었습니다.",
    time: "1일 전",
    isRead: true,
    category: "팀",
  },
  {
    id: 3,
    type: "application",
    icon: MessageSquare,
    title: "새로운 팀원 신청",
    message: "김철수님이 AI 혁신 아이디어 공모전 팀에 가입을 신청했습니다.",
    time: "2일 전",
    isRead: false,
    category: "신청",
  },
  {
    id: 4,
    type: "contest",
    icon: Trophy,
    title: "새로운 공모전 추천",
    message: "귀하의 관심사에 맞는 새로운 공모전이 등록되었습니다.",
    time: "3일 전",
    isRead: true,
    category: "공모전",
  },
  {
    id: 5,
    type: "system",
    icon: Bell,
    title: "프로필 업데이트 완료",
    message: "프로필 정보가 성공적으로 업데이트되었습니다.",
    time: "5일 전",
    isRead: true,
    category: "시스템",
  },
  {
    id: 6,
    type: "team",
    icon: Users,
    title: "팀 채팅 메시지",
    message: "스타트업 아이디어 공모전 팀에 새로운 메시지가 있습니다.",
    time: "1주 전",
    isRead: false,
    category: "팀",
  },
]

function NotificationsContent() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [activeTab, setActiveTab] = useState("all")

  const markAsRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notificationList.filter((n) => !n.isRead)
      case "contest":
        return notificationList.filter((n) => n.category === "공모전")
      case "team":
        return notificationList.filter((n) => n.category === "팀")
      case "application":
        return notificationList.filter((n) => n.category === "신청")
      default:
        return notificationList
    }
  }

  const unreadCount = notificationList.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/mypage">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-8 h-8" />
                알림
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600">모든 알림을 확인하고 관리하세요</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              모두 읽음 처리
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              알림 설정
            </Button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">전체 ({notificationList.length})</TabsTrigger>
            <TabsTrigger value="unread">읽지 않음 ({unreadCount})</TabsTrigger>
            <TabsTrigger value="contest">공모전</TabsTrigger>
            <TabsTrigger value="team">팀</TabsTrigger>
            <TabsTrigger value="application">신청</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getFilteredNotifications().length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
                  <p className="text-gray-500">새로운 알림이 오면 여기에 표시됩니다.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredNotifications().map((notification) => {
                const IconComponent = notification.icon
                return (
                  <Card
                    key={notification.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            notification.type === "contest"
                              ? "bg-yellow-100 text-yellow-600"
                              : notification.type === "team"
                                ? "bg-green-100 text-green-600"
                                : notification.type === "application"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                                >
                                  {notification.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                                {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              </div>
                              <p className={`text-sm ${!notification.isRead ? "text-gray-700" : "text-gray-600"}`}>
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">{notification.time}</span>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead && (
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                    <Check className="w-4 h-4 mr-2" />
                                    읽음 처리
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  )
}
