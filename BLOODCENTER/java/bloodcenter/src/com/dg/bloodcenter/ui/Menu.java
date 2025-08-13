package com.dg.bloodcenter.ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import com.dg.bloodcenter.db.DbManager;
import com.dg.bloodcenter.model.BloodCenter;
import com.dg.bloodcenter.model.BloodDonee;
import com.dg.bloodcenter.model.DoneeBooking;
import com.dg.bloodcenter.model.Donor;
import com.dg.bloodcenter.model.KeepBlood;
import com.dg.bloodcenter.util.RandData;
import com.dg.bloodcenter.util.Util;

public class Menu {
	DbManager db = DbManager.getInst();
	RandData r = new RandData();
	public int mainMenu(Scanner s) {
		System.out.println("---------------------------------");
		System.out.println("헌혈 관리 App v1.0.0");
		System.out.println("---------------------------------");
		System.out.println("1.헌혈 예약");
		System.out.println("2.예약 변경/취소");
		System.out.println("3.나의 헌혈 내역 보기");
		System.out.println("4.현재 혈액형별 재고량");// 회원ID
		System.out.println("5.혈액 폐기 신청");
		System.out.println("6.관리자 메뉴");
		System.out.println("7.종료");
		System.out.println("---------------------------------");
		System.out.print("메뉴 선택: ");
		int m = s.nextInt();
		return m;
	}
	
	public void subMenu(Scanner d) throws Exception {
		System.out.print("id를 입력해주세요 ");
		String id = d.next();
		System.out.print("pw를 입력해주세요 ");
		String pw = d.next().toString();
		
		boolean aa = true;
		int n=0;
		
		if(id.equals("admin") && pw.equals("1234")) {
		while(aa) {
		System.out.println("===관리자 메뉴===");
		System.out.println("1. 사용자 데이터 추가");
		System.out.println("2. 사용자 예약 데이터 추가");
		System.out.println("3. 혈액형별 헌혈자 검색");
		System.out.println("4. 헌혈예약 정보 전체검색");
		System.out.println("5. 기간이 만료된 혈액 폐기");
		System.out.println("6. 수동으로 수혈 날짜입력");
		System.out.println("7. 사용 가능 혈액 상세보기");
		System.out.println("8. 이전 메뉴로 돌아가기");
		System.out.println("---------------------------------");
		System.out.print("항목 선택:");
		int m = d.nextInt();

		switch(m) {
		case 1 : 
			System.out.print("생성할 사람의 수를 입력하세요");
			n=d.nextInt();
			
		
			//DONOR  생성
			String[] arrlist = new String[n];
			String[] randtel = new String[n];
			arrlist= r.getRandRr(n);
			randtel = r.getRandTel(n);
			for(int i=0;i<n;i++) {
				Donor dn = new Donor(db.getdid(),r.getRandName2() , 
						arrlist[i],r.getGender2(arrlist[i]) , r.getAddress2(), 
						randtel[i], r.getBloodType2());
				db.insertDonor(dn);
			}
			
			//DONEE 생성
			String[] arrlist2 = new String[n];
			String[] randtel2 = new String[n];
			arrlist2= r.getRandRr(n);
			randtel2 = r.getRandTel(n);
			for(int i=0;i<n;i++) {
				BloodDonee de = new BloodDonee(db.getDoneeId(), r.getRandName2(), 
						arrlist2[i], r.getGender2(arrlist2[i]), r.getAddress2(),
						randtel2[i], r.getBloodType2());
				db.insertDonee(de);
			}
			
			
			break;
		
		case 2 : 
			System.out.print("생성할 헌혈 예약 수를 입력하세요");
			int n2=d.nextInt();
			System.out.print("생성할 수혈 예약 수를 입력하세요");
			int bkn=d.nextInt();
			for(int i=0;i<n2;i++) {
				String bookid = db.getNextBookingId();	//부킹id
				String centerid = r.getRandCenterId();	//센터id
				String booktime = r.getRandBookTime();
				String dotype =  r.getRandDonationType();
				//book: 부킹id, 센터id, donorid, donationtype, bloodvolume, booktime, interview, gift
				db.RandBookingFull(bookid,centerid, r.getRandDonorId(n), dotype, r.getBloodVolume(dotype), booktime,
					"가능", r.getRandGift());
				//keep: bloodkey, 부킹id, 센터id, bankid, stdate, enddate, comment
				db.addBloodKeep(bookid, centerid, "BK01", booktime, null);
			}	
			
			//DONEE_BOOKING 생성
//			for(int i=0;i<bkn;i++) {
//				String dotype =  r.getRandDonationType();	//헌혈종류
//				
//				DoneeBooking bk = new DoneeBooking(db.getDoneeBookingId(),
//						r.getRandDoneeId(n), "BK01", dotype, 
//						r.getBloodVolume(dotype)*((int)(Math.random()*2)+1), r.getRandBookTime24donee());
//				
//				db.insertDoneeBooking(bk);
//			}
			
			//DONEE_BOOKING TYPE2
			int randnum=0;
			for(int i=0;i<bkn;i++) {
				String dotype =  r.getRandDonationType();	//헌혈종류
				String deeId = r.getRandDoneeId(n);			//DONEE ID
				randnum = ((int)(Math.random()*2)+1);		//필요한 수량
				
				DoneeBooking bk = new DoneeBooking(db.getDoneeBookingId(),
						deeId, "BK01", dotype, 
						r.getBloodVolume(dotype)*randnum, r.getRandBookTime24donee());
				
				db.insertDoneeBooking(bk);
				
				ArrayList<String> test1 = db.getDoneeBloodSK(deeId);
				
				for(int j=0;j<randnum;j++) {
					db.updateKeepDonee(deeId, test1.get(j));
				}
			
			}
			

			break;
		
		case 3 : {
			System.out.print("검색할 혈액형을 입력해주세요(A형, B형, O형, AB형): ");
			String bloodtype = d.next();
			db.getDonorsByBloodType(bloodtype);
			
			break;
		}
		case 4 : {
			db.showbooking();
			break;
		}
		case 5 : {
			db.adminBloodTrash();
			System.out.println("폐기처리되었습니다");
			break;
		}
		case 8 : {
			aa = false;
			System.out.println("메인메뉴로 돌아갑니다...");			
			break;
		}
		case 6:{
			System.out.println("id를 입력해주세요(ex:B_KEY-1)");
			String bookingId = d.next();			
			System.out.println("수혈할 날짜를 입력해주세요");
			String day = d.next();			
			db.bloodBring(bookingId, day);
			List<KeepBlood> KbListB = db.showBloodBring(bookingId);
			for(KeepBlood kb : KbListB) {
				kb.showBloodAll();				
			}
			break;
		}
		case 7 : {
			db.showAvailableBlood();
			break;
		}
		
		
		}}
		
		}}
	
	
	//전자문진 메뉴
	public String interviewMenu(Scanner s) {
		System.out.println("전자문진을 시작합니다!");
		System.out.println();
		String travel = Util.askYesNo(s, "최근 1개월 이내에 해외여행을 다녀온 적이 있습니까? (y/n): ");
	    String medicine = Util.askYesNo(s, "현재 복용 중인 약물이 있습니까? (y/n): ");
	    String cold = Util.askYesNo(s, "최근 1주일 내 감기 증상이 있었습니까? (y/n): ");
	    String fever = Util.askYesNo(s, "현재 체온이 37.5도 이상입니까? (y/n): ");
	    boolean isEligible =
	        travel.equals("n") &&
	        medicine.equals("n") &&
	        cold.equals("n") &&
	        fever.equals("n");
	    String result;
	    if (isEligible) {
	        result = "가능";
	    } else {
	        result = "불가";
	    }
	    System.out.println("--------------------------");
	    System.out.println("전자문진 결과: 헌혈" + result);
	    System.out.println("--------------------------");
	    return result;
	}
	
	//기념품 메뉴
	public String giftMenu(Scanner s) {
		String[] giftOptions = {
				"커피교환권(5000원)",
				"영화관람권",
				"손톱깎이세트",
				"기념품을 선택하지 않겠습니다."
		};
	    System.out.println("헌혈 기념품을 선택해주세요!");
	    System.out.println();
	    System.out.println("---------------------------------");
	    for (int i = 0; i<giftOptions.length; i++) {
	    	System.out.println((i+1) + ". " + giftOptions[i]);
	    }
	    System.out.println("---------------------------------");
	    System.out.print("기념품 선택: ");
	    int choice = s.nextInt();
	    s.nextLine();
	    
	    if(choice >= 1 && choice <=giftOptions.length) {
	    	if(choice == giftOptions.length) {
	    		return "해당없음";
	    	} else {
	    		return giftOptions[choice - 1];
	    	}
	    } else {
	    	return "해당없음";
	    }
	    
	}
	//유효한 헌혈자 ID 검사
	public String askValidDonorId(Scanner s, DbManager db) {
	    while (true) {
	        System.out.print("사용자 ID 입력(ex DN-1): ");
	        String donorId = s.next();
	        if (db.findDonorId(donorId)) {
	            return donorId;
	        } else {
	            System.out.println("※ 존재하지 않는 사용자 ID입니다. 다시 입력해주세요.");
	        }
	    }
	}
	//유효한 헌혈의집 ID 검사
	public String askValidCenterId(Scanner s, DbManager db) {
	    List<BloodCenter> bhList = db.showBloodCenter();
	    System.out.println("헌혈의 집 목록");
	    System.out.println("===================");
	    int num = 1;
	    for (BloodCenter b : bhList) {
	        System.out.println(num++);
	        System.out.println("지점코드: " + b.getcId());
	        System.out.println("지점명: " + b.getcName());
	        System.out.println("주소: " + b.getcAddr());
	        System.out.println("연락처: " + b.getcTel());
	        System.out.println("===================");
	    }

	    while (true) {
	        System.out.print("예약할 지점 번호를 선택하세요 (예: 1~" + bhList.size() + "): ");
	        int selectBC = s.nextInt();
	        s.nextLine();
	        if (selectBC >= 1 && selectBC <= bhList.size()) {
	            return bhList.get(selectBC - 1).getcId(); // CT01, CT02 등
	        } else {
	            System.out.println("잘못된 입력입니다. 다시 선택해주세요.");
	        }
	    }
	}


	


	// 예약 변경 취소 메뉴 (이전 수정 내용 그대로 유지)
	public int modifyDonationMenu (Scanner s) {
		   System.out.println("예약 변경 취소 선택");
		    System.out.println("---------------------------------");
		    System.out.println("1. 예약변경"); // 1번: 예약변경
		    System.out.println("2. 예약취소"); // 2번: 예약취소
		    System.out.println("---------------------------------");
		    System.out.print("선택: "); // 사용자가 입력할 곳을 명확히
		    int choice = s.nextInt();

		    // 입력받은 숫자를 그대로 반환
		    switch (choice) {
	        case 1:
	        	return 1; // 1번 선택 시 숫자 1 반환
	        case 2:
	        	return 2; // 2번 선택 시 숫자 2 반환
	        default:
	        	System.out.println("잘못된 입력입니다. 다시 확인해주세요."); // 잘못된 입력일 때 안내 메시지
	        	return -1; // 그 외의 경우 (잘못된 입력) -1 같은 특정 값을 반환
	    }
	}
	
	//menu5
	public static int DeleteMenu(Scanner s) {
		System.out.println("---------------------------------");
		System.out.println("폐기사유 항목 선택");
		System.out.println("---------------------------------");
		System.out.println("1.사용자요구");
		System.out.println("2.급성 질병");
		System.out.println("3.감염발생 지역방문");
		System.out.println("4.기타사유");
		System.out.println("---------------------------------");
		System.out.println("항목 선택:");
		int m = s.nextInt();
		return m;
	}

	
	
	
	
	
	
	

}
