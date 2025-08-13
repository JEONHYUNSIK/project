// ----------------------헤더 검색----------------------

window.onload = function(){
   const sicon = document.querySelector('#i_search')
   sicon.onclick = btnClick
}

function btnClick(){
   const searchbox = document.querySelector('#search_box')

   if(searchbox.style.display == 'none'){
       searchbox.style.display = 'block'
   }
   else{
       searchbox.style.display = 'none'
   }
}



