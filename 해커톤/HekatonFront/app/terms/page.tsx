"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function TermsPage() {
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
              <FileText className="w-8 h-8 mr-3" />
              이용약관
            </h1>
            <p className="text-gray-600 mt-2">이퀄로컬 서비스 이용약관</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 약관 정보 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">이퀄로컬 이용약관</h2>
                  <p className="text-sm text-gray-600">본 약관은 이퀄로컬 서비스 이용에 관한 조건을 규정합니다.</p>
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

          {/* 약관 내용 */}
          <Card>
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    본 약관은 이퀄로컬(이하 "회사")이 제공하는 공모전 플랫폼 및 팀 매칭 서비스(이하 "서비스")의 이용과 관련하여 
                    회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>"서비스"란 회사가 제공하는 공모전 정보 제공, 팀 매칭, AI 추천 등의 모든 서비스를 의미합니다.</li>
                    <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                    <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                    <li>"비회원"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
                    <li>회사는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력을 발생합니다.</li>
                    <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원탈퇴를 할 수 있습니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                    <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                        <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                        <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공 및 변경)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>회사는 다음과 같은 업무를 수행합니다:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>공모전 정보 제공 서비스</li>
                        <li>팀 매칭 및 팀원 모집 서비스</li>
                        <li>AI 기반 맞춤 공모전 추천 서비스</li>
                        <li>커뮤니티 및 소통 서비스</li>
                        <li>기타 회사가 정하는 업무</li>
                      </ul>
                    </li>
                    <li>회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 현재의 서비스의 내용을 게시한 곳에 즉시 공지합니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (서비스의 중단)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                    <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지 않습니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (회원의 의무)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>이용자는 다음 행위를 하여서는 안 됩니다:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>신청 또는 변경 시 허위내용의 등록</li>
                        <li>타인의 정보 도용</li>
                        <li>회사가 게시한 정보의 변경</li>
                        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                        <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                        <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                        <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (저작권의 귀속 및 이용제한)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                    <li>이용자는 회사를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (분쟁해결)</h2>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
                    <li>회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</li>
                    <li>본 약관에 명시되지 않은 사항은 전기통신기본법, 전기통신사업법 및 기타 관련법령의 규정에 따릅니다.</li>
                  </ol>
                </section>

                <Separator className="my-6" />

                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">제10조 (재판권 및 준거법)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    회사와 이용자 간에 발생한 서비스 이용에 관한 분쟁에 대하여는 대한민국 법을 적용하며, 
                    본 분쟁으로 인한 소는 민사소송법상의 관할을 가지는 대한민국의 법원에 제기합니다.
                  </p>
                </section>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">부칙</h3>
                  <p className="text-sm text-gray-600">
                    본 약관은 2025년 1월 1일부터 적용됩니다.
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