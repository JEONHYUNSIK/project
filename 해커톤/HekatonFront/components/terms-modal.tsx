"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Shield, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface TermsModalProps {
  children: React.ReactNode
  onAgree?: (agreements: Record<string, boolean>) => void
  showAgreementForm?: boolean
}

export default function TermsModal({ children, onAgree, showAgreementForm = false }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [agreements, setAgreements] = useState({
    terms1: false,
    terms2: false,
    privacy: false,
    marketing: false,
    age: false,
  })

  const requiredAgreements = ["terms1", "terms2", "privacy", "age"]
  const allRequiredAgreed = requiredAgreements.every((key) => agreements[key as keyof typeof agreements])

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSelectAll = () => {
    const allChecked = Object.values(agreements).every(Boolean)
    const newState = !allChecked
    setAgreements({
      terms1: newState,
      terms2: newState,
      privacy: newState,
      marketing: newState,
      age: newState,
    })
  }

  const handleAgree = () => {
    if (allRequiredAgreed && onAgree) {
      onAgree(agreements)
      setIsOpen(false)
    }
  }

  const allChecked = Object.values(agreements).every(Boolean)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            이용약관 및 개인정보처리방침
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* 약관 내용 */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* 이용약관 */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    이퀄로컬 이용약관
                  </h3>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      전문보기
                    </a>
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">제1조 (목적)</h4>
                    <p>
                      본 약관은 이퀄로컬이 제공하는 공모전 플랫폼 및 팀 매칭 서비스의 이용과 관련하여 회사와 이용자 간의
                      권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">제2조 (서비스의 제공)</h4>
                    <p>
                      회사는 공모전 정보 제공, 팀 매칭, AI 추천 서비스 등을 제공하며, 서비스의 품질 향상을 위해 내용을
                      변경할 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">제3조 (회원의 의무)</h4>
                    <p>
                      이용자는 허위정보 등록, 타인의 정보 도용, 회사 및 제3자의 지적재산권 침해 등의 행위를 하여서는 안
                      됩니다.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 italic">※ 상세한 내용은 전문을 확인해주세요.</p>
                </div>
              </section>

              <Separator />

              {/* 개인정보처리방침 */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    개인정보처리방침
                  </h3>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      전문보기
                    </a>
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">개인정보 수집 및 이용목적</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>회원 가입 및 관리</li>
                      <li>서비스 제공 (공모전 정보, 팀 매칭, AI 추천)</li>
                      <li>마케팅 및 광고 활용</li>
                      <li>민원사무 처리</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">수집하는 개인정보 항목</h4>
                    <p>
                      <strong>필수:</strong> 이름, 이메일, 비밀번호, 전화번호
                    </p>
                    <p>
                      <strong>선택:</strong> 프로필 사진, 관심분야, 기술스택, 경력사항
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">개인정보 보유 및 이용기간</h4>
                    <p>회원 탈퇴 시까지 (관계법령에 따라 일정기간 보관)</p>
                  </div>
                  <p className="text-xs text-gray-500 italic">※ 상세한 내용은 전문을 확인해주세요.</p>
                </div>
              </section>

              {showAgreementForm && (
                <>
                  <Separator />

                  {/* 동의 체크박스 */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4">약관 동의</h3>
                    <div className="space-y-4">
                      {/* 전체 동의 */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-selectAll"
                            checked={allChecked}
                            onCheckedChange={handleSelectAll}
                            className="w-5 h-5"
                          />
                          <label htmlFor="modal-selectAll" className="font-semibold text-blue-900 cursor-pointer">
                            전체 동의하기
                          </label>
                        </div>
                      </div>

                      {/* 개별 약관 */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-terms1"
                            checked={agreements.terms1}
                            onCheckedChange={(checked) => handleAgreementChange("terms1", checked as boolean)}
                          />
                          <label htmlFor="modal-terms1" className="text-sm cursor-pointer flex-1">
                            이퀄로컬 이용약관 동의
                          </label>
                          <Badge variant="destructive" className="text-xs">
                            필수
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-terms2"
                            checked={agreements.terms2}
                            onCheckedChange={(checked) => handleAgreementChange("terms2", checked as boolean)}
                          />
                          <label htmlFor="modal-terms2" className="text-sm cursor-pointer flex-1">
                            공모전 및 팀 매칭 서비스 이용약관 동의
                          </label>
                          <Badge variant="destructive" className="text-xs">
                            필수
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-privacy"
                            checked={agreements.privacy}
                            onCheckedChange={(checked) => handleAgreementChange("privacy", checked as boolean)}
                          />
                          <label htmlFor="modal-privacy" className="text-sm cursor-pointer flex-1">
                            개인정보 수집 및 이용 동의
                          </label>
                          <Badge variant="destructive" className="text-xs">
                            필수
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-marketing"
                            checked={agreements.marketing}
                            onCheckedChange={(checked) => handleAgreementChange("marketing", checked as boolean)}
                          />
                          <label htmlFor="modal-marketing" className="text-sm cursor-pointer flex-1">
                            마케팅 정보 수신 동의
                          </label>
                          <Badge variant="secondary" className="text-xs">
                            선택
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="modal-age"
                            checked={agreements.age}
                            onCheckedChange={(checked) => handleAgreementChange("age", checked as boolean)}
                          />
                          <label htmlFor="modal-age" className="text-sm cursor-pointer flex-1">
                            만 14세 이상입니다
                          </label>
                          <Badge variant="destructive" className="text-xs">
                            필수
                          </Badge>
                        </div>
                      </div>

                      {/* 상태 메시지 */}
                      {!allRequiredAgreed && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">필수 약관에 모두 동의해주세요.</p>
                        </div>
                      )}

                      {allRequiredAgreed && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-800">모든 필수 약관에 동의하셨습니다.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>

          {/* 하단 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1 bg-transparent">
              닫기
            </Button>
            {showAgreementForm && (
              <Button onClick={handleAgree} disabled={!allRequiredAgreed} className="flex-1">
                동의하고 계속하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
