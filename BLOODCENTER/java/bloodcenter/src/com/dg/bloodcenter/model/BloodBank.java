package com.dg.bloodcenter.model;

public class BloodBank {
	private String bkId; //혈액은행 id
	private String bkname; // 은행명
	private String bkAddr; // 주소
	private String bkTel; // 연락처

	public BloodBank(String bkId, String bkname, String bkAddr, String bkTel) {
		super();
		this.bkId = bkId;
		this.bkname = bkname;
		this.bkAddr = bkAddr;
		this.bkTel = bkTel;
	}

	public BloodBank() {
		super();
	}

	public String getBkId() {
		return bkId;
	}

	public void setBkId(String bkId) {
		this.bkId = bkId;
	}

	public String getBkname() {
		return bkname;
	}

	public void setBkname(String bkname) {
		this.bkname = bkname;
	}

	public String getBkAddr() {
		return bkAddr;
	}

	public void setBkAddr(String bkAddr) {
		this.bkAddr = bkAddr;
	}

	public String getBkTel() {
		return bkTel;
	}

	public void setBkTel(String bkTel) {
		this.bkTel = bkTel;
	}

}
