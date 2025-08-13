"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Calendar, Lock, Eye, Database, UserCheck } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              개인정보처리방침
            </h1>
            <p className="text-gray-600 mt-2">이퀄로컬 개인정보 보호 정책</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 정책 정보 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">개인정보처리방침</h2>
                  <p className="text-sm text-gray-600">이용자의 개인정보 보호를 위한 처리방침입니다.</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    시행일: 2025년 1월 1일
                  </div>
                  <div className="mt-1">버전: 1.0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인정보 처리 현황 요약 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                개인정보 처리 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-900">수집 목적</div>
                  <div className="text-sm text-blue-700">서비스 제공 및 운영</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-900">보유 기간</div>
                  <div className="text-sm text-green-700">회원 탈퇴 시까지</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-900">제3자 제공</div>
                  <div className="text-sm text-purple-700">원칙적 금지</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 정책 내용 */}
          <Card>
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보의 처리목적</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이퀄로컬(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 
                    처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                    이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                    <li>서비스 제공: 공모전 정보 제공, 팀 매칭 서비스, AI 추천 서비스 제공</li>
                    <li>마케팅 및 광고에의 활용: 이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                    <li>민원사무 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지</li>
                  </ul>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">2. 개인정보의 처리 및 보유기간</h2>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Badge variant="secondary" className="mb-2">필수 정보</Badge>
                    <div className="space-y-2 text-sm">
                      <div><strong>수집항목:</strong> 이름, 이메일, 비밀번호, 전화번호</div>
                      <div><strong>보유기간:</strong> 회원 탈퇴 시까지</div>
                      <div><strong>처리목적:</strong> 회원 식별, 서비스 제공, 고객 지원</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Badge variant="outline" className="mb-2">선택 정보</Badge>
                    <div className="space-y-2 text-sm">
                      <div><strong>수집항목:</strong> 프로필 사진, 관심분야, 기술스택, 경력사항</div>
                      <div><strong>보유기간:</strong> 회원 탈퇴 시까지</div>
                      <div><strong>처리목적:</strong> 맞춤형 서비스 제공, 팀 매칭</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    ※ 관계법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
                  </p>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보의 제3자 제공</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                    다만, 아래의 경우에는 예외로 합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>이용자들이 사전에 동의한 경우</li>
                    <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    <li>통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 알아볼 수 없는 형태로 제공하는 경우</li>
                  </ul>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보처리의 위탁</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left">수탁업체</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">위탁업무</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">개인정보 보유기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">AWS</td>
                          <td className="border border-gray-300 px-4 py-2">클라우드 서버 운영</td>
                          <td className="border border-gray-300 px-4 py-2">위탁계약 종료시까지</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                          <td className="border border-gray-300 px-4 py-2">서비스 이용 분석</td>
                          <td className="border border-gray-300 px-4 py-2">26개월</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">5. 정보주체의 권리·의무 및 행사방법</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>개인정보 처리정지 요구권</li>
                    <li>개인정보 열람요구권</li>
                    <li>개인정보 정정·삭제요구권</li>
                    <li>개인정보 처리정지 요구권</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>권리 행사 방법:</strong> 개인정보보호법 시행령 제41조에 따라 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 
                      회사는 이에 대해 지체없이 조치하겠습니다.
                    </p>
                  </div>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">6. 개인정보의 파기</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">전자적 파일</h4>
                      <p className="text-sm text-gray-700">기술적 방법을 사용하여 기록을 재생할 수 없도록 영구삭제</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">종이 문서</h4>
                      <p className="text-sm text-gray-700">분쇄기로 분쇄하거나 소각을 통하여 파기</p>
                    </div>
                  </div>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">7. 개인정보의 안전성 확보조치</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">기술적 조치</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        <li>개인정보처리시스템 등의 접근권한 관리</li>
                        <li>접근통제시스템 설치</li>
                        <li>개인정보의 암호화</li>
                        <li>보안프로그램 설치 및 갱신</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">관리적 조치</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        <li>개인정보 취급직원의 최소화 및 교육</li>
                        <li>개인정보 취급방침의 수립 및 시행</li>
                        <li>개인정보 취급직원에 대한 정기적 교육</li>
                        <li>내부관리계획의 수립 및 시행</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">8. 개인정보 보호책임자</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">개인정보 보호책임자</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <div><strong>성명:</strong> 김개인정보</div>
                          <div><strong>직책:</strong> 개인정보보호팀장</div>
                          <div><strong>연락처:</strong> privacy@equallocal.com</div>
                          <div><strong>전화:</strong> 02-1234-5678</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">개인정보 보호담당부서</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <div><strong>부서명:</strong> 개인정보보호팀</div>
                          <div><strong>담당자:</strong> 이담당자</div>
                          <div><strong>연락처:</strong> privacy@equallocal.com</div>
                          <div><strong>전화:</strong> 02-1234-5679</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">9. 개인정보 처리방침 변경</h2>
                  <p className="text-gray-700 leading-relaxed">
                    이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                    변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                  </p>
                </section>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">부칙</h3>
                  <p className="text-sm text-gray-600">
                    본 방침은 2025년 1월 1일부터 시행됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}