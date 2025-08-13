document.getElementById('search-input').addEventListener('keydown', function(event) {
    // Enter 키가 눌렸는지 확인
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작(폼 제출) 방지
        performSearch();
    }
});

document.querySelector('.button.is-info').addEventListener('click', function(event) {
    event.preventDefault(); // 기본 동작(폼 제출) 방지
    performSearch();
});

function performSearch() {
    var query = document.getElementById('search-input').value.toLowerCase();
    var items = document.querySelectorAll('.items_list .item');
    
    items.forEach(function(item) {
        var itemName = item.querySelector('.name').textContent.toLowerCase();
        if (itemName.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}