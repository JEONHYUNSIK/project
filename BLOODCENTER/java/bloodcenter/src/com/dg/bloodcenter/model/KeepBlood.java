package com.dg.bloodcenter.model;

public class KeepBlood {
	private String bldKey; // 혈액 코드
	private BloodCenter bh; // 헌혈의집 코드
	private BloodBank bk; // 은행 코드
	private String keepStDate; // 보관시작일
	private String keepEndDate; // 보관만료일
	private String status;	//상태
	private String comment; 	// 폐기사유
	private Booking booking; // 예약코드
	private BloodDonee bd; // 수혈자
	private DoneeBooking db; // 수혈
	
	
	public KeepBlood(String bldKey, BloodCenter bh, BloodBank bk, String keepStDate, String keepEndDate, String status,
			String comment) {
		super();
		this.bldKey = bldKey;
		this.bh = bh;
		this.bk = bk;
		this.keepStDate = keepStDate;
		this.keepEndDate = keepEndDate;
		this.status = status;
		this.comment = comment;
		
	}

	public KeepBlood(String bldKey, BloodCenter bh, BloodBank bk, String keepStDate, String keepEndDate, String comment, String status
			, BloodDonee bd) {
		super();
		this.bldKey = bldKey;
		this.bh = bh;
		this.bk = bk;
		this.keepStDate = keepStDate;
		this.keepEndDate = keepEndDate;
		this.comment = comment;	
		this.status = status;			
		this.bd = bd;
	}

	public KeepBlood(String bldKey, BloodCenter bh, BloodBank bk, String keepStDate, String keepEndDate, String comment) {

		super();
		this.bldKey = bldKey;
		this.bh = bh;
		this.bk = bk;
		this.keepStDate = keepStDate;
		this.keepEndDate = keepEndDate;
		this.comment = comment;
	}
	
	public KeepBlood(String bldKey, BloodCenter bh, BloodBank bk, String keepStDate, String keepEndDate, String comment,
			Booking booking) {
		super();
		this.bldKey = bldKey;
		this.bh = bh;
		this.bk = bk;
		this.keepStDate = keepStDate;
		this.keepEndDate = keepEndDate;
		this.comment = comment;
		this.booking = booking;
	}

	public KeepBlood() {
		
	}
	
	public KeepBlood(String bldKey, String comment) {
		this.bldKey = bldKey;
		this.comment = comment;
	}
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public BloodDonee getBd() {
		return bd;
	}

	public void setBd(BloodDonee bd) {
		this.bd = bd;
	}


	public String getBldKey() {
		return bldKey;
	}

	public void setBldKey(String bldKey) {
		this.bldKey = bldKey;
	}

	public BloodCenter getBh() {
		return bh;
	}

	public void setBh(BloodCenter bh) {
		this.bh = bh;
	}

	public BloodBank getBk() {
		return bk;
	}

	public void setBk(BloodBank bk) {
		this.bk = bk;
	}

	public String getKeepStDate() {
		return keepStDate;
	}

	public void setKeepStDate(String keepStDate) {
		this.keepStDate = keepStDate;
	}

	public String getKeepEndDate() {
		return keepEndDate;
	}

	public void setKeepEndDate(String keepEndDate) {
		this.keepEndDate = keepEndDate;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}
	
	public Booking getBooking() {
		return booking;
	}

	public void setBooking(Booking booking) {
		this.booking = booking;
	}
	
	public void showBloodInfo() {
		System.out.println("혈액ID: " + bldKey);
		System.out.println("사유: " + comment);
		System.out.println("헌혈의집: " + bh.getcName());
		System.out.println("혈액은행: " + bk.getBkname());
	}
	
	public void showBloodAll() {
		    System.out.println("🩸 혈액 코드: " + bldKey);
		    System.out.println("🗓 보관 시작일: " + keepStDate);
		    System.out.println("🗓 보관 만료일: " + keepEndDate);
		    System.out.println("📌 폐기 사유: " + comment);
		    System.out.println("   상태: " + status);

		    if (bh != null) {
		        System.out.println("🏥 헌혈의집 정보:");
		        System.out.println(" - 지점 코드: " + bh.getcId());
		        System.out.println(" - 지점명: " + bh.getcName());
		        System.out.println(" - 주소: " + bh.getcAddr());
		        System.out.println(" - 연락처: " + bh.getcTel());
		    }

		    if (bk != null) {
		        System.out.println("🏦 혈액은행 정보:");
		        System.out.println(" - 은행 ID: " + bk.getBkId());
		        System.out.println(" - 은행명: " + bk.getBkname());
		        System.out.println(" - 주소: " + bk.getBkAddr());
		        System.out.println(" - 연락처: " + bk.getBkTel());
		    }

		    System.out.println("------------------------------------------------");
		}
	}

