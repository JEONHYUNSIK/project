package com.dg.bloodcenter.util;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;

public class RandData {
	static String[] name1 = {"강","김","박","신","이","오","양"};
	static String[] name2 = {"수","경","진","민","유","신","명","재","은","서","라"};
	static String[] name3 = {"욱","진","수","아","우","경","서","빈","홍","민","율"};
	static String[] address = {"중구 동인동","중구 삼덕동","중구 성내동","중구 대신동","중구 남산동","중구 대봉동",
			"동구 신암동","동구 신천동","동구 효목동","동구 도평동","동구 불로봉무동","동구 지저동", "동구 동촌동",
			"동구 방촌동","동구 안심동","동구 혁신동","동구 공산동",
			"서구 내당동","서구 비산동","서구 평리동","서구 상중이동","서구 원대동",
			"남구 이천동","남구 봉덕동","남구 대명동",
			"북구 고성동","북구 칠성동","북구 침산동","북구 노원동","북구 산격동","북구 복현동","북구 대현동","북구 국우동",
			"북구 검단동","북구 무태조야동","북구 관문동","북구 태전동","북구 구암동","북구 관음동","북구 읍내동","북구 동천동",
			"수성구 범어동","수성구 만촌동","수성구 수성동","수성구 황금동","수성구 중동","수성구 상동",
			"수성구 파동","수성구 두산동","수성구 지산동", "수성구 범물동","수성구 고산동",
			"달서구 성당동","달서구 두류동","달서구 본리동","달서구 감삼동","달서구 죽전동","달서구 장기동","달서구 욘산동",
			"달서구 이곡동","달서구 신당동","달서구 월성동","달서구 진천동","달서구 유천동","달서구 상인동","달서구 도원동",
			"달서구 송현동","달서구 본동",
			"달성군 화원읍","달성군 논공읍","달성군 다사읍","달성군 유가읍","달성군 옥포읍","달성군 현풍읍",
			"달성군 가창면","달성군 하빈면","달성군 구지면",
			"군위군 군위읍","군위군 소보면","군위군 효령면","군위군 부계면","군위군 우보면","군위군 의홍면",
			"군위군 산성면","군위군 삼국유사면"};
	static String[] bloodtype = {"A형","B형","O형","AB형"};
	static String[] centerid= {"CT01","CT02","CT03","CT04","CT05","CT06","CT07","CT08","CT09"};
	static String[] donatype = {"전혈","혈소판 성분헌혈","혈장 성분헌혈"};
	static String[] giftlist = {"커피교환권(5000원)","영화관람권","손톱깎이세트","해당없음"};
	
	
	
//=====================================================================================================================	
	//랜덤데이터 넣기 (예약번호는 getNextBookingId 이거 사용하기, 
	//  예약시간 sysdate - randint, 
	// 지점코드는 내가 뽑아서 [], 헌혈자코드도 내가 뽑아서 [], 헌혈종류[],헌혈량[](매개변수),전자문진 값은 100% "헌혈가능",기념품신청[]
	
	
	
	
	//예약시간
	public static String getRandBookTime() throws Exception {
		SimpleDateFormat simpleDate = new SimpleDateFormat("yy/MM/dd");
		
		Date time = new Date();	//시스템 시간
		String today1 = simpleDate.format(time);	//출력하면 2025/04/30 이렇게 나옴
		Date selectDate = simpleDate.parse(today1);
		
		Calendar cal = new GregorianCalendar(Locale.KOREA);
		
		cal.setTime(selectDate);	//만들어진 cal의 time을 setTime(해당날짜)로 만듦
		
//		cal.add(Calendar.YEAR,-70);
//		cal.add(Calendar.DATE, +1);	// 만69세까지의 나이 구하는 값
		
		cal.add(Calendar.DATE,(int)(Math.random()*80)-50);	//날짜에서 -50일부터 +29일까지
		String findTime = simpleDate.format(cal.getTime());	//불러오기

		return findTime;
	}
	
	public static String getRandBookTime24donee() throws Exception {
		SimpleDateFormat simpleDate = new SimpleDateFormat("yy/MM/dd");
		
		Date time = new Date();	//시스템 시간
		String today1 = simpleDate.format(time);	//출력하면 2025/04/30 이렇게 나옴
		Date selectDate = simpleDate.parse(today1);
		
		Calendar cal = new GregorianCalendar(Locale.KOREA);
		
		cal.setTime(selectDate);	//만들어진 cal의 time을 setTime(해당날짜)로 만듦
		
		
		cal.add(Calendar.DATE,(int)(Math.random()*60)-30);	//날짜에서 -30일부터 29일까지
		String findTime = simpleDate.format(cal.getTime());	//불러오기

		return findTime;
	}
	

	//기념품신청
	public String getRandGift() {
		return giftlist[(int)(Math.random()*giftlist.length)];
	}
	
	//헌혈자코드
	public String getRandDonorId(int n) { //도너아이디 최대 숫자 넣기
		//전혈 헌혈은 8주 후, 성분 헌혈은 2주 후 (나중에 되면 더 추가하기)
		String Randdoid="DN-"+((int)(Math.random()*n)+1);
		return Randdoid;
	}
	
	//수혈자코드
	public String getRandDoneeId(int n) { //도니아이디 최대 숫자 넣기
		String RandDoneeId = "DE-" + ((int)(Math.random()*n)+1);
		return RandDoneeId;
	}
	
	//지점코드
	public String getRandCenterId() {
		return centerid[(int)(Math.random()*centerid.length)];
	}
	
	//헌혈종류
	public String getRandDonationType() {
		String dotype = donatype[(int)(Math.random()*donatype.length)];
		return dotype;
	}
	
	//헌혈량
	public int getBloodVolume(String donatype) {
		int blovolume = 0;
		switch(donatype) {
		case "전혈": blovolume = 400;
			break;
		case "혈소판 성분헌혈": blovolume = 250;
			break;
		case "혈장 성분헌혈": blovolume = 500;
			break;
		}
		return blovolume;
	}
	
	
//=====================================================================================================================	
	//주소
	public static String[] getAddress(int n) {
		String[] getAddr = new String[n];
		for(int i=0;i<n;i++) {
			getAddr[i]="대구광역시 "+ address[(int)(Math.random()*address.length)];
		}
		
		return getAddr;
	}
	
	public String getAddress2() {
		
		String 	getAddr="대구광역시 "+ address[(int)(Math.random()*address.length)];
		
		return getAddr;
	}
	
	//혈액형
	public static String[] getBloodType(int n) {
		String[] getBloodType = new String[n];
		for(int i=0;i<n;i++) {
			getBloodType[i] = bloodtype[(int)(Math.random()*bloodtype.length)];
		}
		return getBloodType;
	}
	
	public String getBloodType2() {
		
		String getBloodType = bloodtype[(int)(Math.random()*bloodtype.length)];
		
		return getBloodType;
	}
	
	
	// 성별 표출(주민등록번호와 연관됨)
	public static char[] getGender(String[] arrlist, int n) {
		char[] findgen = new char[n];
		for(int i=0;i<n;i++) {
			String try1=arrlist[i].substring(7, 8);
			int try2=Integer.parseInt(try1);
			if(try2==1 || try2==3) {
				findgen[i]='남';
			}
			else if(try2==2 || try2==4) {
				findgen[i]='여';
			}
		}
		return findgen;
	}
	
	public String getGender2(String arrlist) {
		String findgen = "";
		
			String try1=arrlist.substring(7, 8);
			int try2=Integer.parseInt(try1);
			if(try2==1 || try2==3) {
				findgen="남";
			}
			else if(try2==2 || try2==4) {
				findgen="여";
			}
		
		return findgen;
	}
	
	
	//이름 n개 만들기
	public static String[] getRandName(int n) {	//만들기 원하는 크기 n 
		String[] randname = new String[n];
		for(int i=0;i<n;i++) {
			randname[i] = name1[(int)(Math.random()*name1.length)]+
					name2[(int)(Math.random()*name2.length)]+
					name3[(int)(Math.random()*name3.length)];
		}	
		return randname;
	}
	
	public String getRandName2() {	//만들기 원하는 크기 n 
		String	randname = name1[(int)(Math.random()*name1.length)]+
					name2[(int)(Math.random()*name2.length)]+
					name3[(int)(Math.random()*name3.length)];
		return randname;
	}
	
	//전화번호 n개 만들기
	public String[] getRandTel(int n) {
		String[] randtel= new String[n];
		
		for(int i=0;i<n;i++) {
			String str1 = String.format("%04d", (int)(Math.random()*9999)+0);
			String str2 = String.format("%04d", (int)(Math.random()*9999)+0);
			
			
			randtel[i]=String.format("010-%s-%s", str1, str2);					
			for(int j=0;j<i;j++) {
				if(randtel[i].equals(randtel[j])) {		//문장 비교는 equals로 해야함
					i--;
					break;
				}
			}
		}	
		return randtel; 
	}
	
	
//---------------------------------------------------------------------------------------------------
	//주민등록번호 n개 만들기
	//헌혈 가능 조건은 만16세~만69세임 (2009~1955/5/1) ->시간구하는거 만듦
	//그 이상은 예약은 안되겠지만 기록은 남을 수 있으니 연도 신경안씀. 최소나이만 신경쓰기

	public String[] getRandRr(int n) {
		String[] getRR = new String[n];
		
		for(int i=0;i<n;i++) {
			String try1=getRrNumber(55, 99, "old");
			String try2=getRrNumber(00, 10, "new");
			String[] rrlist = {try1, try2};
			getRR[i] = rrlist[(int)(Math.random()*2)];
			
			for(int j=0;j<i;j++) {
				if(getRR[i].equals(getRR[j])) {
					i--;
					break;
				}
			}
		}
		return getRR;
	}
	
	public static String getRrNumber(int startYear, int endYear, String type){
			
		/** 주민등록번호 랜덤 생성 **/
					
		String frontNumber = makeFrontNumber(startYear, endYear); // 주민 앞번호
		String backNumber = makeBackNumber(frontNumber, type);    // 주민 뒷번호
					
		String result = frontNumber + "-" + backNumber; // 앞번호 - 뒷번호
	
		return result;
		}
		
		
//	
//	public String[] makeRandomRegistrationNumber(
//			int count,int startYear, int endYear, String type){
//		
//		String[] getRR =new String[count];
//
//			/** 주민등록번호 랜덤 생성 **/
//			for (int i = 0; i < count; i++) {
//				
//				String frontNumber = makeFrontNumber(startYear, endYear); // 주민 앞번호
//				String backNumber = makeBackNumber(frontNumber, type);    // 주민 뒷번호
//				
//				String result = frontNumber + "-" + backNumber; // 앞번호 - 뒷번호
//
//				getRR[i] = result;
//
//			}
//			
//			return getRR;
//	}
	
	/**
	 * @param frontNumber 주민번호 앞자리
	 * @param type        old - 1900년 ~ 1999년 / new - 2000년 이후
	 * @return 주민번호 뒷자리 생성
	 */
	private static String makeBackNumber(String frontNumber ,String type) {
		
		int gender = 1; 
		
		if(type.equals("new")) gender = ((int) (Math.random() * 2 + 3));
		else if(type.equals("old")) gender = ((int) (Math.random() * 2 + 1));
		
		int birthCode = ((int) (Math.random() * 9599 + 1));
		int birthRegisterOrderNum = ((int) (Math.random() * 3 + 1));

		String birthCodeStr = "";
		
		if (birthCode < 10) birthCodeStr = "000" + String.valueOf(birthCode);
		else if (birthCode < 100) birthCodeStr = "00" + String.valueOf(birthCode);
		else if (birthCode < 1000) birthCodeStr = "0" + String.valueOf(birthCode);
		else birthCodeStr = String.valueOf(birthCode);
		
		String backNumber = String.valueOf(gender) + birthCodeStr + String.valueOf(birthRegisterOrderNum);

		int lastNumber = makeLastNum(frontNumber, backNumber);
		backNumber += String.valueOf(lastNumber);
		
		return backNumber;
		
	}
	
	/** 검증식 참고자료 **/
	// https://blog.naver.com/PostView.nhn?isHttpsRedirect=true&blogId=mumasa&logNo=222102707153 

	/**
	 * @param frontNumber - 주민 앞번호
	 * @param backNumber  - 주민 뒷번호
	 * @return 주민앞번호 및 뒷번호을 이용한 검증식으로 주민등록번호 맨 마지막 숫자 생성
	 */
	private static int makeLastNum(String frontNumber, String backNumber) {

		int lastNumber;
		
		int f0 = frontNumber.charAt(0) * 2;
		int f1 = frontNumber.charAt(1) * 3;
		int f2 = frontNumber.charAt(2) * 4;
		int f3 = frontNumber.charAt(3) * 5;
		int f4 = frontNumber.charAt(4) * 6;
		int f5 = frontNumber.charAt(5) * 7;

		
		int b0 = backNumber.charAt(0) * 8;
		int b1 = backNumber.charAt(1) * 9;
		int b2 = backNumber.charAt(2) * 2;
		int b3 = backNumber.charAt(3) * 3;
		int b4 = backNumber.charAt(4) * 4;
		int b5 = backNumber.charAt(5) * 5;

		int sum = f0 + f1 + f2 + f3 + f4 + f5 + b0 + b1 + b2 + b3 + b4 + b5;
		int minus = sum % 11;
		

		if (minus == 0 || minus == 1) lastNumber = 0; // 나머지가 0 또는 1인 경우 - 0으로 분기처리 
		else lastNumber = 11 - minus;
		
		return lastNumber;
	}
	
	/**
	 * @param  startYear 시작년도
	 * @param  endYear   종료년도 
	 * @return 주민등록번호 앞자리 (※ 윤년 고려 X)
	 */
	private static String makeFrontNumber(int startYear, int endYear) {
		
		/** ---- 년도 생성 ---- **/
		int rangeYear = endYear - startYear;
		int year = ((int) ((Math.random() * rangeYear) + startYear));

		String yearStr = "";
		if(year < 10) yearStr = "0" + String.valueOf(year);
		else yearStr = String.valueOf(year);
		
		/** ---- 월 생성 ---- **/
		int month = ((int) (Math.random() * 12) + 1);

		String monthStr = "";
		if (month < 10) monthStr = "0" + String.valueOf(month);
		else monthStr = String.valueOf(month);

		
		/** ---- 일 생성 ---- **/
		int day = 0;

		switch (month) {
		case 1:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 2:
			day = ((int) (Math.random() * 28 + 1));
			break;
		case 3:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 4:
			day = ((int) (Math.random() * 29 + 1));
			break;
		case 5:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 6:
			day = ((int) (Math.random() * 29 + 1));
			break;
		case 7:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 8:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 9:
			day = ((int) (Math.random() * 29 + 1));
			break;
		case 10:
			day = ((int) (Math.random() * 30 + 1));
			break;
		case 11:
			day = ((int) (Math.random() * 29 + 1));
			break;
		case 12:
			day = ((int) (Math.random() * 30 + 1));
			break;
		}

		String dayStr = "";
		
		if (day < 10) dayStr = "0" + String.valueOf(day);
		else dayStr = String.valueOf(day);

		String frontNumber = yearStr + monthStr + dayStr; // 주민번호 앞 자리
		
		return frontNumber;
	}	

	
	
	
	
	
	
}
