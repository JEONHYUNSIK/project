package com.dg.bloodcenter.model;

public class BloodDonee {
	String doneeId;
	String deeName;
	String deeRrnumber;
	String deeGender;
	String deeAddress;
	String deeTel;
	String deeBloodtype;
	
	public BloodDonee(String doneeId, String deeName, String deeRrnumber, String deeGender,
			String deeAddress, String deeTel, String deeBloodtype) {
		super();
		this.doneeId = doneeId;
		this.deeName = deeName;
		this.deeRrnumber = deeRrnumber;
		this.deeGender = deeGender;
		this.deeAddress = deeAddress;
		this.deeTel = deeTel;
		this.deeBloodtype = deeBloodtype;
	}
	public String getDoneeId() {
		return doneeId;
	}
	public void setDoneeId(String doneeId) {
		this.doneeId = doneeId;
	}
	
	public String getDeeName() {
		return deeName;
	}
	public void setDeeName(String deeName) {
		this.deeName = deeName;
	}

	public String getDeeRrnumber() {
		return deeRrnumber;
	}
	public void setDeeRrnumber(String deeRrnumber) {
		this.deeRrnumber = deeRrnumber;
	}
	public String getDeeGender() {
		return deeGender;
	}
	public void setDeeGender(String deeGender) {
		this.deeGender = deeGender;
	}
	public String getDeeAddress() {
		return deeAddress;
	}
	public void setDeeAddress(String deeAddress) {
		this.deeAddress = deeAddress;
	}
	public String getDeeTel() {
		return deeTel;
	}
	public void setDeeTel(String deeTel) {
		this.deeTel = deeTel;
	}
	public String getDeeBloodtype() {
		return deeBloodtype;
	}
	public void setDeeBloodtype(String deeBloodtype) {
		this.deeBloodtype = deeBloodtype;
	}
	
}
