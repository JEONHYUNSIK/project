
// 버튼 이벤트
const scrollbtn = document.querySelector("#scroll");
const products = document.querySelector("#main_about");


// 타이틀 웨이브
const wave = document.querySelector(".title");
const waveall = document.querySelectorAll(".title");

console.log(waveall);
console.log(wave);

waveall.forEach((wave) => {
wave.innerHTML = wave.textContent
   .split("")
   .map((letter, idx) => {
      if (letter === "") return "";
      
      return `<span style="animation-delay:${idx * 15
         }ms" class="letter">${letter}</span>`
   })
   .join("");
});



scrollbtn.addEventListener("click", () => {
   products.scrollIntoView({ behavior: "smooth" });
});