package com.dg.bloodcenter.model;

public class DoneeBooking {

	private String de_booking_id;	//수혈번호
	private String donee_id;		//수혈자코드
	private String bank_id;			//은행코드
	private String de_donation;			//헌혈종류
	private int de_bloodvolume;	//수혈량
	private String de_booktime;		//예약시간 
	
	public DoneeBooking(String de_booking_id, String donee_id, String bank_id, String de_donation, int de_bloodvolume,
			String de_booktime) {
		super();
		this.de_booking_id = de_booking_id;
		this.donee_id = donee_id;
		this.bank_id = bank_id;
		this.de_donation = de_donation;
		this.de_bloodvolume = de_bloodvolume;
		this.de_booktime = de_booktime;
	}

	public String getDe_booking_id() {
		return de_booking_id;
	}

	public void setDe_booking_id(String de_booking_id) {
		this.de_booking_id = de_booking_id;
	}

	public String getDonee_id() {
		return donee_id;
	}

	public void setDonee_id(String donee_id) {
		this.donee_id = donee_id;
	}

	public String getBank_id() {
		return bank_id;
	}

	public void setBank_id(String bank_id) {
		this.bank_id = bank_id;
	}

	public String getDe_donation() {
		return de_donation;
	}

	public void setDe_donation(String de_donation) {
		this.de_donation = de_donation;
	}

	public int getDe_bloodvolume() {
		return de_bloodvolume;
	}

	public void setDe_bloodvolume(int de_bloodvolume) {
		this.de_bloodvolume = de_bloodvolume;
	}

	public String getDe_booktime() {
		return de_booktime;
	}

	public void setDe_booktime(String de_booktime) {
		this.de_booktime = de_booktime;
	}
	
	
	
	
}
