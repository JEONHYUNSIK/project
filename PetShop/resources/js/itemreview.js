document.getElementById('itemreview-create-btn').addEventListener('click', function() {
    const nickname = document.getElementById('new-itemreview-nickname').value;
    const body = document.getElementById('new-itemreview-body').value;

    if (nickname && body) {
        const commentSection = document.getElementById('comments-section');

        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `<strong>${nickname}</strong><p>${body}</p>`;

        commentSection.appendChild(commentDiv);

        // 입력 필드 초기화
        document.getElementById('new-itemreview-nickname').value = '';
        document.getElementById('new-itemreview-body').value = '';
    }
});
