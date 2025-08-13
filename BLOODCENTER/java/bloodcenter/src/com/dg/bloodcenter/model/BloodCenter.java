package com.dg.bloodcenter.model;

//헌혈의집 모델
public class BloodCenter {
	private String cId; //지점코드
	private String cName; //지점명
	private String cAddr; //주소
	private String cTel; //연락처

	public BloodCenter(String cId, String cName, String cAddr, String cTel) {
		super();
		this.cId = cId;
		this.cName = cName;
		this.cAddr = cAddr;
		this.cTel = cTel;
	}

	public String getcId() {
		return cId;
	}

	public void setcId(String cId) {
		this.cId = cId;
	}

	public String getcName() {
		return cName;
	}

	public void setcName(String cName) {
		this.cName = cName;
	}

	public String getcAddr() {
		return cAddr;
	}

	public void setcAddr(String cAddr) {
		this.cAddr = cAddr;
	}

	public String getcTel() {
		return cTel;
	}

	public void setcTel(String cTel) {
		this.cTel = cTel;
	}

}
