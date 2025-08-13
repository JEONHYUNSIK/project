package com.dg.bloodcenter.model;

public class Donor {
	private String doId; //헌혈자코드
	private String doName; //이름
	private String doRNum; //주민번호
	private String doGen; //성별
	private String doAddr; //주소
	private String doTel; //연락처
	private String doBloodType; //혈액형

	public Donor(String doId, String doName, String doRNum, String doGen, String doAddr, String doTel,
			String doBloodType) {
		super();
		this.doId = doId;
		this.doName = doName;
		this.doRNum = doRNum;
		this.doGen = doGen;
		this.doAddr = doAddr;
		this.doTel = doTel;
		this.doBloodType = doBloodType;
	}
	
	public Donor(String doId) {
		this.doId = doId;
	}
	
 
	public String getDoId() {
		return doId;
	}

	public void setDoId(String doId) {
		this.doId = doId;
	}

	public String getDoName() {
		return doName;
	}

	public void setDoName(String doName) {
		this.doName = doName;
	}

	public String getDoRNum() {
		return doRNum;
	}

	public void setDoRNum(String doRNum) {
		this.doRNum = doRNum;
	}

	public String getDoGen() {
		return doGen;
	}

	public void setDoGen(String doGen) {
		this.doGen = doGen;
	}

	public String getDoAddr() {
		return doAddr;
	}

	public void setDoAddr(String doAddr) {
		this.doAddr = doAddr;
	}

	public String getDoTel() {
		return doTel;
	}

	public void setDoTel(String doTel) {
		this.doTel = doTel;
	}

	public String getDoBloodType() {
		return doBloodType;
	}

	public void setDoBloodType(String doBloodType) {
		this.doBloodType = doBloodType;
	}

}
