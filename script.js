// Mouse turbulence effect
// let mouseFollow = document.getElementsByClassName('mouse-follow')[0];
// let hideTimeout;

// document.addEventListener('mousemove', (event) => {
//   let mouseX = event.clientX;
//   let mouseY = event.clientY;

//   mouseFollow.style.top = mouseY - mouseFollow.offsetHeight / 2 + "px";
//   mouseFollow.style.left = mouseX - mouseFollow.offsetWidth / 2 + "px";

//   mouseFollow.style.opacity = 1;

//   clearTimeout(hideTimeout);
//   hideTimeout = setTimeout(() => {
//     mouseFollow.style.opacity = 0;
//   }, 250);
// });

// Cards

function openProject() {
  document.getElementById("project-card").style.width = "80vw";
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.remove("rotate-title");
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "flex";
  document.getElementById("genesis-card").style.width = "10vw";
  // document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].style.opacity = 0;
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";
  document.getElementById("experience-card").style.width = "10vw";
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";
}

function openGenesis() {
  document.getElementById("genesis-card").style.width = "80vw";
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.remove("rotate-title");
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "flex";
  document.getElementById("project-card").style.width = "10vw";
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");;
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";
  document.getElementById("experience-card").style.width = "10vw";
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";
}

function openExperience() {
  document.getElementById("experience-card").style.width = "80vw";
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.remove("rotate-title");
  document.getElementById("experience-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "flex";
  document.getElementById("project-card").style.width = "10vw";
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");
  document.getElementById("project-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";
  document.getElementById("genesis-card").style.width = "10vw";
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("h2")[0].classList.add("rotate-title");
  document.getElementById("genesis-card").getElementsByClassName("card-main-content")[0].getElementsByTagName("p")[0].style.display = "none";

  document.getElementById("experience-card").getElementsByClassName("card-more-content")[0].style.display = "flex";
}

// Text reveal
function textReveal(step, interval = 40) {
  let element = document.querySelector(`#${step} .story-text`)
  let text = element.textContent;
  element.textContent = "";

  let i = 0;
  
  const revealInterval = setInterval(() => {
    if (i < text.length) {
      let span = document.createElement('span');
      span.classList.add('letter');
      span.innerText = text.charAt(i++);
      element.appendChild(span);
    }
    else { clearInterval(revealInterval); }
  }, interval);
}

// Initiate experience
function startExperience() {
  document.getElementById('introduction').style.display = "none";
  document.getElementById('start').style.display = "flex";

  textReveal('start');

  setTimeout(() => {
    nextStep('photo-1');
  }, 10000);
}

// Next step
function nextStep(step) {
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById(step).style.display = "block";
  document.getElementById(step).style.opacity = 1;
  textReveal(step);
}

// Back to introduction
function backToIntro() {
  document.getElementById('start').style.display = "none";
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById('introduction').style.display = "flex";
}
