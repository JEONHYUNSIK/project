function myAlert(element, msg) {
    Swal.fire({
        icon: "error",
        text: `${msg}`,
        confirmButtonColor: "#b94343",
        confirmButtonText: "확인",
        width: "350px",
        didClose: () => {
            element.focus();
        }
    });
}

// form 태그 ID
let signSubmit = document.getElementById('s_done');

// 회원가입 버튼(submit)을 클릭하면 동작
signSubmit.addEventListener('submit', (event) => {
    event.preventDefault();

    // 약관 체크했는지 검사
    let checkInfo = document.querySelector('#check_info');
    if (!checkInfo.checked) {
        myAlert(checkInfo, '이용약관을 체크해주세요');
        return false;
    }

    // 아이디 공백 검사
    let id = document.querySelector('#id');
    if (id.value.trim() === '') {
        myAlert(id, '아이디를 입력하세요');
        return false;
    }

    // 아이디 길이는 6~14자 사이만 허용
    if (id.value.length < 6 || id.value.length > 14) {
        myAlert(id, '아이디 길이를 6~14자로 입력하세요');
        return false;
    }

    // 아이디 패턴 정규표현식
    const idPat = /^(?=.*[a-z0-9])[a-z0-9]{6,14}$/;
    if (!idPat.test(id.value)) {
        myAlert(id, '정상적인 아이디를 입력하세요');
        return false;
    }

    // 비밀번호 동일한지 비교 검사
    let passwd = document.querySelector('#password');
    if (passwd.value.trim() === '') {
        myAlert(passwd, '비밀번호를 입력하세요');
        return false;
    }

    let passwdChk = document.querySelector('#password_check');
    if (passwdChk.value.trim() === '') {
        myAlert(passwdChk, '비밀번호 확인을 입력하세요');
        return false;
    }

    if (passwd.value !== passwdChk.value) {
        myAlert(passwd, '비밀번호가 일치하지 않습니다');
        return false;
    }

    // 암호 패턴 정규표현식
    const passwdPat = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@$^&*()._-]{6,16}$/;
    if (!passwdPat.test(passwd.value)) {
        myAlert(passwd, '정상적인 암호를 입력하세요');
        return false;
    }

    // 이름 검사
    let name = document.querySelector('#name');
    if (name.value.trim() === '') {
        myAlert(name, '이름을 입력해주세요');
        return false;
    }
    const korean = /^[가-힣]+$/;
    if (!korean.test(name.value)) {
        myAlert(name, '정상적인 한글 이름을 입력하세요');
        return false;
    }

    // 닉네임 검사
    let nik_name = document.querySelector('#nik_name');
    if (nik_name.value.trim() === '') {
        myAlert(nik_name, '닉네임을 입력해주세요');
        return false;
    }
    const nickPat = /^(?=.*[a-z0-9가-힣])[가-힣0-9a-z]{2,16}$/;
    if (!nickPat.test(nik_name.value)) {
        myAlert(nik_name, '정상적인 닉네임을 입력하세요');
        return false;
    }

    // 전화번호 자리수 체크
    let telNumber = document.querySelector('#hp');
    if (telNumber.value.length !== 8) {
        myAlert(telNumber, '전화번호는 8자리로 입력해주세요');
        return false;
    }

    // 인증번호 확인
    let inumber = document.querySelector('#inumber');
    if (inumber.value.trim() === '') {
        myAlert(inumber, '인증번호를 입력해주세요');
        return false;
    }

    // 이메일 검사
    let emailId = document.querySelector('.email_id');
    let emailAdd = document.querySelector('.email_add');

    if (emailId.value.trim() === '' || emailAdd.value.trim() === '') {
        myAlert(emailId, '이메일 주소를 입력해주세요');
        return false;
    }

    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let email = `${emailId.value}@${emailAdd.value}`;
    if (!emailPattern.test(email)) {
        myAlert(emailId, '올바른 이메일 주소를 입력해주세요');
        return false;
    }

    // 회원가입 성공 시
    Swal.fire('회원가입 성공!', '잠시후 로그인 페이지로 이동합니다', 'success');

    // 2초 뒤에 login.html 으로 이동
    setTimeout(() => {
        location.href = 'login.html';
    }, 2000);
});
