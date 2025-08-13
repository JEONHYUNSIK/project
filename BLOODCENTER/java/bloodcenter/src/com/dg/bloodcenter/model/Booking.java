package com.dg.bloodcenter.model;

public class Booking {
	private String bokingId; //예약번호
	private BloodCenter bh; //헌혈의집 ID
	private Donor dn; //헌혈자 ID
	private String doBldType; // 헌혈종류
	private int bldVol; // 혈액량
	private String bokTime; // 예약시간
	private String interview; // 전자문진
	private String gift; // 기념품

	public Booking(String bokingId, BloodCenter bh, Donor dn, String doBldType, int bldVol, String bokTime,
			String interview, String gift) {
		super();
		this.bokingId = bokingId;
		this.bh = bh;
		this.dn = dn;
		this.doBldType = doBldType;
		this.bldVol = bldVol;
		this.bokTime = bokTime;
		this.interview = interview;
		this.gift = gift;
	}

	public String getBokingId() {
		return bokingId;
	}

	public void setBokingId(String bokingId) {
		this.bokingId = bokingId;
	}

	public BloodCenter getBh() {
		return bh;
	}

	public void setBh(BloodCenter bh) {
		this.bh = bh;
	}

	public Donor getDn() {
		return dn;
	}

	public void setDn(Donor dn) {
		this.dn = dn;
	}

	public String getDoBldType() {
		return doBldType;
	}

	public void setDoBldType(String doBldType) {
		this.doBldType = doBldType;
	}

	public int getBldVol() {
		return bldVol;
	}

	public void setBldVol(int bldVol) {
		this.bldVol = bldVol;
	}

	public String getBokTime() {
		return bokTime;
	}

	public void setBokTime(String bokTime) {
		this.bokTime = bokTime;
	}

	public String getInterview() {
		return interview;
	}

	public void setInterview(String interview) {
		this.interview = interview;
	}

	public String getGift() {
		return gift;
	}

	public void setGift(String gift) {
		this.gift = gift;
	}

}
