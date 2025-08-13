"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, Users } from "lucide-react"

export default function ChatWidget() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatType, setChatType] = useState<"ai" | "team" | null>(null)

  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! 이퀄로컬 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?", isBot: true },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = { id: Date.now(), text: inputValue, isBot: false }
      setMessages((prev) => [...prev, newMessage])
      setInputValue("")

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: "죄송합니다. 현재 AI 기능은 개발 중입니다. 곧 더 나은 서비스로 찾아뵙겠습니다!",
          isBot: true,
        }
        setMessages((prev) => [...prev, botResponse])
      }, 1000)
    }
  }

  const openChat = (type: "ai" | "team") => {
    setChatType(type)
    setIsChatOpen(true)
    setIsMenuOpen(true)
  }

  const closeChat = () => {
    setIsChatOpen(false)
    setChatType(null)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* 플로팅 버튼 영역 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {/* 선택 메뉴 (AI, 팀) */}
        {isMenuOpen && (
          <>
            <Button 
              onClick={() => openChat('team')} 
              className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
            >
              <Users className="w-6 h-6" />
            </Button>
            <Button 
              onClick={() => openChat('ai')} 
              className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
            >
              <Bot className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* 메인 채팅 버튼 */}
        <Button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* 채팅 창 */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-24 z-50 w-[400px] h-[600px]">
          <Card className="h-full shadow-xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{chatType === 'ai' ? 'AI 어시스턴트' : '팀 채팅'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeChat}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              {chatType === 'ai' ? (
                <>
                  {/* 메시지 영역 */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.isBot ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>
    
                  {/* 입력 영역 */}
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center h-full">
                  <p className="text-gray-500">팀 채팅 기능은 준비 중입니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}