// Preloader js
let loader = document.getElementById('preloader');
window.addEventListener('load' , function (){
  loader.style.display = 'none';
})
// Preloader js




// Navbar Scroll action

window.addEventListener('scroll' , function(){
    var header = document.querySelector('header');
    header.classList.toggle('sticky',window.scrollY > 0);

});

// Navbar Scroll action




// Time navbar

setInterval(displayTime,100)

function displayTime(){
  const timeNow = new Date();
  
  let hours = timeNow.getHours();
  let minutes = timeNow.getMinutes();
  let seconds = timeNow.getSeconds();
  
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  
  let timeStr = hours + " : " + minutes + " : " + seconds;
  
  try {
    document.getElementById('clock').innerText = timeStr;
  } catch (error) {
    
  }
}

displayTime();


// Time navbar




// Slider 
$('.slider-cont').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000
});
// Slider 









gsap.registerPlugin(ScrollTrigger);


gsap.to(".namemain1" , {
  x: 300 , 
  duration: 3 , 
  ease : "none",
  scrollTrigger: {
    trigger: '.namemain1',
    start: " 160px center" ,
    end: "+=300",
    scrub : true,
    // markers : true,
    toggleActions: "restart pause reverse pause"
  }
})
gsap.to(".namemain2" , {
  x: 300 , 
  duration: 3 , 
  ease : "none",
  scrollTrigger: {
    trigger: '.namemain2',
    start: " 250px center" ,
    end: "+=300",
    scrub : true,
    // markers : true,
    toggleActions: "restart pause reverse pause"
  }
})
gsap.to(".namemain3" , {
  x: 500 , 
  duration: 3 , 
  ease : "none",
  scrollTrigger: {
    trigger: '.namemain3',
    start: " 360px center" ,
    end: "+=300",
    scrub : true,
    // markers : true,
    toggleActions: "restart pause reverse pause"
  }
})







const filterItem = document.querySelector(".items");
const filterImg = document.querySelectorAll(".gallery .image");
window.onload = ()=>{ 
  filterItem.onclick = (selectedItem)=>{ 
    if(selectedItem.target.classList.contains("item")){ 
      filterItem.querySelector(".active").classList.remove("active"); 
      selectedItem.target.classList.add("active"); 
      let filterName = selectedItem.target.getAttribute("data-name");
      filterImg.forEach((image) => {
        let filterImges = image.getAttribute("data-name"); 
        if((filterImges == filterName) || (filterName == "Hammasi")){
          image.classList.remove("hide"); 
          image.classList.add("show"); 
        }else{
          image.classList.add("hide"); 
          image.classList.remove("show"); 
        }
      });
    }
  }
  for (let i = 0; i < filterImg.length; i++) {
    filterImg[i].setAttribute("onclick", "preview(this)");
  }
}
const previewBox = document.querySelector(".preview-box"),
categoryName = previewBox.querySelector(".title p"),
previewImg = previewBox.querySelector("img"),
closeIcon = previewBox.querySelector(".icon"),
shadow = document.querySelector(".shadow");
function preview(element){
  document.querySelector("body").style.overflow = "hidden";
  let selectedPrevImg = element.querySelector("img").src; 
  let selectedImgCategory = element.getAttribute("data-name"); 
  previewImg.src = selectedPrevImg; 
  categoryName.textContent = selectedImgCategory;
  previewBox.classList.add("show"); 
  shadow.classList.add("show"); 
  closeIcon.onclick = ()=>{ 
    previewBox.classList.remove("show"); 
    shadow.classList.remove("show"); 
    document.querySelector("body").style.overflow = "auto"; 
  }
}










function getPageList(totalPages, page, maxLength){
  function range(start, end){
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }

  var sideWidth = maxLength < 9 ? 1 : 2;
  var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  var rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

  if(totalPages <= maxLength){
    return range(1, totalPages);
  }

  if(page <= maxLength - sideWidth - 1 - rightWidth){
    return range(1, maxLength - sideWidth - 1).concat(0, range(totalPages - sideWidth + 1, totalPages));
  }

  if(page >= totalPages - sideWidth - 1 - rightWidth){
    return range(1, sideWidth).concat(0, range(totalPages- sideWidth - 1 - rightWidth - leftWidth, totalPages));
  }

  return range(1, sideWidth).concat(0, range(page - leftWidth, page + rightWidth), 0, range(totalPages - sideWidth + 1, totalPages));
}

$(function(){
  var numberOfItems = $(".card-content .card").length;
  var limitPerPage = 6; //How many card items visible per a page
  var totalPages = Math.ceil(numberOfItems / limitPerPage);
  var paginationSize = 10; //How many page elements visible in the pagination
  var currentPage;

  function showPage(whichPage){
    if(whichPage < 1 || whichPage > totalPages) return false;

    currentPage = whichPage;

    $(".card-content .card").hide().slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage).show();

    $(".pagination li").slice(1, -1).remove();

    getPageList(totalPages, currentPage, paginationSize).forEach(item => {
      $("<li>").addClass("page-item").addClass(item ? "current-page" : "dots")
      .toggleClass("active", item === currentPage).append($("<a>").addClass("page-link")
      .attr({href: "javascript:void(0)"}).text(item || "...")).insertBefore(".next-page");
    });

    $(".previous-page").toggleClass("disable", currentPage === 1);
    $(".next-page").toggleClass("disable", currentPage === totalPages);
    return true;
  }

  $(".pagination").append(
    $("<li>").addClass("page-item").addClass("previous-page").append($("<a>").addClass("page-link").attr({href: "javascript:void(0)"}).text("Prev")),
    $("<li>").addClass("page-item").addClass("next-page").append($("<a>").addClass("page-link").attr({href: "javascript:void(0)"}).text("Next"))
  );

  $(".card-content").show();
  showPage(1);

  $(document).on("click", ".pagination li.current-page:not(.active)", function(){
    return showPage(+$(this).text());
  });

  $(".next-page").on("click", function(){
    return showPage(currentPage + 1);
  });

  $(".previous-page").on("click", function(){
    return showPage(currentPage - 1);
  });
});








var btn = $('#button');

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});

btn.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '300');
});





let like = document.querySelectorAll('.like');
let icon_num = document.querySelectorAll('.icon-num');
let p = 0
let count = 0
like.forEach((likefont) => {
  likefont.addEventListener("click" , (e)=>{
    likefont.querySelector('i').classList.toggle("actives"); 
    if(likefont.querySelector('a').innerHTML == '0'){
      likefont.querySelector('a').innerHTML= '1'
      count = 1
    }else{
      likefont.querySelector('a').innerHTML= '0'
      count = 0
    }

    })
})



let menu = document.getElementById('menu')
let bars = document.getElementById('bars')


bars.addEventListener('click' , ()=> {
  
})