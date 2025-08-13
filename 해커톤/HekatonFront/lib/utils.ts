import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 전화번호 자동 하이픈 함수
export function formatPhoneNumber(value: string): string {
  // 입력된 값에서 숫자가 아닌 모든 문자를 제거합니다.
  const rawValue = value.replace(/\D/g, "");

  // 가공된 전화번호를 저장할 변수
  let formattedValue = "";

  // 전화번호의 앞 3자리 (ex. 010)
  if (rawValue.length > 0) {
    formattedValue = rawValue.substring(0, 3);
  }

  // 전화번호 중간 4자리 (ex. 1234)
  if (rawValue.length > 3) {
    formattedValue += `-${rawValue.substring(3, 7)}`;
  }

  // 전화번호 마지막 4자리 (ex. 5678)
  if (rawValue.length > 7) {
    formattedValue += `-${rawValue.substring(7, 11)}`;
  }

  return formattedValue;
}