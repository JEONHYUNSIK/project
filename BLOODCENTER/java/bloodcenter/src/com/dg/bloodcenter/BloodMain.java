package com.dg.bloodcenter;

import java.util.List;
import java.util.Scanner;

import com.dg.bloodcenter.db.DbManager;
import com.dg.bloodcenter.model.BloodJaego;
import com.dg.bloodcenter.model.KeepBlood;
import com.dg.bloodcenter.ui.Menu;
import com.dg.bloodcenter.util.RandData;
import com.dg.bloodcenter.util.Util;

public class BloodMain {
//	public static final String DEFAULT_BANK_ID = "BK01"; // 혈액은행 상수
	public static void main(String[] args) throws Exception {
		DbManager db = DbManager.getInst();
		Scanner s = new Scanner(System.in);
		Menu m = new Menu();
		RandData r = new RandData();

		while (true) {
			switch (m.mainMenu(s)) {
			case 1:
				// 헌혈자 id 입력 실행
				String donorId = m.askValidDonorId(s, db);			
				// 헌혈의집 출력 및 선택
				String centerId = m.askValidCenterId(s, db);
				// 전자문진 실행
				String resultView = m.interviewMenu(s);
				// 기념품 선택 (전자문진 결과에 따라 선택)
				String resultGift;
				if (resultView.equals("가능")) {
					resultGift = m.giftMenu(s);
				} else {
					System.out.println("※ 헌혈 불가로 기념품 선택이 취소됩니다.");
					resultGift = "선택불가";
				}
				// 최종 결과
				String doType = r.getRandDonationType();
				String bookingId = db.tryDonation(centerId, donorId, doType, r.getBloodVolume(doType), Util.getCurTime(), resultView,
						resultGift);
				System.out.println("예약 정보가 추가되었습니다!");

				if (resultView.equals("가능") && bookingId != null) {
					db.addBloodKeep(bookingId, centerId, "BK01", Util.getCurTime(), null);
					System.out.println("혈액 정보가 추가되었습니다!");
				} else {
					System.out.println("※ 헌혈이 불가능한 사용자입니다. 혈액 정보가 추가되지 않습니다.");
				}
				break;

			case 2: // 예약 변경 또는 취소 선택
				while (true) {
					// modifyDonationMenu에서 int 값을 받아와 (1: 예약변경, 2: 예약취소, -1: 잘못된 입력)
					int mf = m.modifyDonationMenu(s);

					if (mf == 1) { // 사용자가 1번 (예약 변경)을 선택했을 때
						System.out.println("--- 예약 변경 ---");

						System.out.print("변경할 예약의 ID를 입력하세요(ex BO-1): ");
						String bookingIdToModify = s.next();

						// 이제 변경할 정보들을 사용자에게 입력받아야 해.
						System.out.print("새로운 헌혈 종류 (예: 전혈, 성분헌혈)를 입력하세요: "); // 사용자 입력 프롬프트 추가
						String newDonationType = s.next(); // 사용자 입력 받기

						System.out.print("새로운 혈액량 (ml 단위, 예: 400)을 입력하세요: "); // 사용자 입력 프롬프트 추가
						int newBloodVolume = s.nextInt(); // 사용자 입력 받기
						s.nextLine(); // int 입력 후 남은 개행 문자 처리

						System.out.print("새로운 예약 날짜(YY/MM/DD, bo_booktime)를 입력하세요: ");
						String newBookDate = s.next();

						System.out.print("새로운 사은품 (예: 문화상품권)을 입력하세요: "); // 사용자 입력 프롬프트 추가
						String newGift = s.next(); // 사용자 입력 받기

						// **** modifyDonation 메소드 호출! ****
						// 사용자에게 입력받은 값들을 modifyDonation 메소드의 인자로 전달
						db.modifyDonation(bookingIdToModify, newDonationType, newBloodVolume, newBookDate, newGift);


						break; 

					} else if (mf == 2) { // 사용자가 2번 (예약 취소)를 선택했을 때
						System.out.println("--- 예약 취소---");
						System.out.println("--- 수동으로 예약한사람중 헌혈불가능판정된경우만 예약취소가능 ---");
						System.out.print("취소할 예약의 ID를 입력하세요(ex BO-1): ");
						String bookingIdToCancel = s.next();

						// cancelDonation 메소드 호출
						db.cancelDonation(bookingIdToCancel);
				

						break; 

					} else { 
						
						
					}
				} 
				break; 


			case 3:
				System.out.print("헌혈 아이디 입력하세요(ex DN-1):");
				String id = s.next();
				db.bloodInfo(id);
				break;


			case 4:
			{
				List<BloodJaego> list = db.bloodJaego3();
				for (int i=0; i<list.size(); i++) {

//					System.out.println("번호:" + (i+1));
					System.out.println("혈액타입:" + list.get(i).getBloodType());
					System.out.println("혈액양:" + list.get(i).getBloodAmount() + "ml");
					System.out.println("=============================");
				}
				break;
			}
			case 5:
				while (true) {
					int n = Menu.DeleteMenu(s);

					if (n == 1) {
						System.out.println("사용자요구");
						System.out.println("id를 입력해주세요(ex:B_KEY-1)");
						String bloodkey = s.next();
						String sau = "사용자폐기 요구";
						db.bloodTrash(bloodkey, sau);
						List<KeepBlood> KbList = db.showBloodTrash(bloodkey);
						for (KeepBlood kb : KbList) {
							kb.showBloodAll();
						}
					} else if (n == 2) {
						System.out.println("id를 입력해주세요(ex:B_KEY-1)");
						String bloodkey = s.next();
						System.out.println("어떤 질병에 걸리셨나요?");
						String sau = s.next();
						db.bloodTrash(bloodkey, sau);
						List<KeepBlood> KbList = db.showBloodTrash(bloodkey);
						for (KeepBlood kb : KbList) {
							kb.showBloodAll();
						}
					} else if (n == 3) {
						System.out.println("id를 입력해주세요(ex:B_KEY-1)");
						String bloodkey = s.next();
						System.out.println("어느 지역에 방문하셨나요?");
						String sau = s.next();
						db.bloodTrash(bloodkey, sau);
						List<KeepBlood> KbList = db.showBloodTrash(bloodkey);
						for (KeepBlood kb : KbList) {
							kb.showBloodAll();
						}
					} else if (n == 4) {
						System.out.println("id를 입력해주세요(ex:B_KEY-1)");
						String bloodkey = s.next();
						System.out.println("사유를 입력해주세요");
						String sau = s.next();
						db.bloodTrash(bloodkey, sau);
						List<KeepBlood> KbList = db.showBloodTrash(bloodkey);
						for (KeepBlood kb : KbList) {
							kb.showBloodAll();
						}
					} else {
						System.out.println("잘못된 항목 선택!");
					}
					break;
				}
				break;
			case 6: {
				m.subMenu(s);
				break;
			}
			case 7: {
				db.dbClose();
				s.close();
				System.exit(0);
			}
			}
		}
	}
}

