function Num_ck(obj) { 
    var val = obj.value; 
    if(isNaN(val)) { 
        alert("숫자만 입력해 주세요"); 
        obj.value = val.replace(/[^0-9]/gi, ''); 
    }  
}

function fmain_submit(f)
{
  if($("#prv_check").is(":checked") != true){
    alert("개인정보취급방침에 동의 해주세요.");
    $("#prv_check").focus();
    return false;
  }
}