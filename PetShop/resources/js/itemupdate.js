document.getElementById('update-button').addEventListener('click', function(event) {
    event.preventDefault(); // 기본 동작(링크 이동) 방지
    if (confirm('정말로 수정하시겠습니까?')) {
        window.location.href = this.href; // 사용자가 확인하면 링크로 이동
    }
});

document.getElementById('delete-button').addEventListener('click', function(event) {
    event.preventDefault(); // 기본 동작(링크 이동) 방지
    if (confirm('정말로 삭제하시겠습니까?')) {
        window.location.href = this.href; // 사용자가 확인하면 링크로 이동
    }
});