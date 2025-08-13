package com.dg.bloodcenter.model;

public class BloodJaego {
	private String bloodType;
	private int bloodAmount;
	
	public BloodJaego(String bloodType, int bloodAmount) {
		super();
		this.bloodType = bloodType;
		this.bloodAmount = bloodAmount;
	}

	public String getBloodType() {
		return bloodType;
	}

	public void setBloodType(String bloodType) {
		this.bloodType = bloodType;
	}

	public int getBloodAmount() {
		return bloodAmount;
	}

	public void setBloodAmount(int bloodAmount) {
		this.bloodAmount = bloodAmount;
	}
}
