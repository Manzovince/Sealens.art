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
  document.getElementById('introduction').style.opacity = "0";
  setTimeout(() => {
    document.getElementById('introduction').style.display = "none";
  }, 1000);

  document.getElementById('start').style.display = "flex";
  setTimeout(() => {
    document.querySelector(`#start .story-text`).style.opacity = 1;
    textReveal('start');
  }, 500);

  setTimeout(() => {
    nextStep('photo-1');
  }, 10000);
}

// Next step
function nextStep(step) {
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById(step).style.display = "block";
  document.getElementById(step).style.opacity = 1;
  setTimeout(() => {
    document.querySelector(`#${step} .story-text`).style.opacity = 1;
    textReveal(step);
  }, 3000);
}

// Back to introduction
function backToIntro() {
  document.getElementById('start').style.display = "none";
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById('introduction').style.display = "flex";
}
