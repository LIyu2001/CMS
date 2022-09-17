var xm = document.querySelectorAll(".xm")
var menu = document.querySelectorAll(".menu")
console.log(xm, menu);
for (let i = 0; i < xm.length; i++) {
  xm[i].onmouseenter = function () {
    menu[i].style.display = "block"
  }
  xm[i].onmouseleave = function () {
    menu[i].style.display = "none"
  }
}