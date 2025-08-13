package com.dg.bloodcenter.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class Util {
	
	//Y/N 중 어느쪽도 아닐 경우(즉, 키 입력이 올바르지 않을 경우) 출력
	//trim (공백제거), toLowerCase(대소문자 구분)
	public static String askYesNo(Scanner s, String question) {
	    while (true) {
	        System.out.print(question);
	        String input = s.nextLine().trim().toLowerCase();
	        if (input.equals("y") || input.equals("n")) {
	            return input;
	        } else {
	            System.out.println("잘못된 입력입니다. 'y' 또는 'n'으로 응답해주세요.");
	        }
	    }
	}
	// 로컬 타임 불러오기
	public static String getCurTime() {
		LocalDateTime now = LocalDateTime.now();
		String curTime =
				now.format(DateTimeFormatter.ofPattern("yy/MM/dd"));
		return curTime;
	}

}
