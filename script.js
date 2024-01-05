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

// Show page

function showPage(page) {
  document.getElementById('introduction').style.display = "none";
  document.getElementById('project').style.display = "none";
  document.getElementById('about-us').style.display = "none";
  document.getElementById('experience').style.display = "none";
  document.getElementById('story').style.display = "none";
  document.getElementById('gallery').style.display = "none";
  if (page == 'introduction') {
    backToIntro();
  } else if (page == 'gallery') {
    document.getElementsByTagName('body')[0].style.overflow = "auto";
    document.getElementById(page).style.display = "flex";
  } else {
    document.getElementsByTagName('body')[0].style.overflow = "hidden";
    document.getElementById(page).style.display = "flex";
  }
}

// Text reveal
function textReveal(step, interval = 25) {
  let element = document.querySelector(`#${step} .story-text`)
  let text = element.textContent;
  element.textContent = "";
  element.style.opacity = 1;

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

  setTimeout(() => {
    document.querySelector(`#${step} .story-choices`).style.opacity = "1";
  }, (interval * text.length) + 1000);

  setTimeout(() => {
    element.textContent = text;
  }, (interval * text.length) + 2000);
}

// Initiate experience
function startExperience() {
  showPage('story');
  document.getElementById('nav').style.background = "transparent";
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
  document.getElementById('nav-list').style.display = "none";
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById(step).style.display = "block";
  document.getElementById(step).style.opacity = 1;

  setTimeout(() => {
    document.querySelector(`#${step} .previous-choice`).style.opacity = 1;
    textReveal(step);
  }, 2500);

}

// Back to introduction
function backToIntro() {
  document.getElementById('nav-list').style.display = "flex";
  document.getElementById('nav').style.background = "linear-gradient(180deg, rgba(0,26,27,1) 0%, rgba(0,26,27,0) 100%)";
  document.getElementById('start').style.display = "none";
  Array.from(document.getElementsByTagName('main')[0].children).forEach(e => { e.style.display = "none"; });
  document.getElementById('introduction').style.display = "flex";
  document.getElementById('introduction').style.opacity = 1;
}

// Show details cards
let detailsOpened = 0;

function toggleDetails() {
  if (!detailsOpened) {
    document.getElementById('project-details').style.display = "flex";
    detailsOpened = 1;
  } else {
    document.getElementById('project-details').style.display = "none";
    detailsOpened = 0;
  }
}

// Gallery

const images = [
  'sealens-1',
  'sealens-2',
  'sealens-3',
  'sealens-4',
  'sealens-5',
  'sealens-6',
  'sealens-7',
  'sealens-8',
  'sealens-9',
  'sealens-10',
  'sealens-11',
  'sealens-12',
  'sealens-13',
  'sealens-14',
  'sealens-15',
  'sealens-16',
  'sealens-17',
  'sealens-18',
  'sealens-19',
  'sealens-20',
  'sealens-21',
  'sealens-22'
];

function displayGalleryLayout(imageArray) {
  const galleryLayout = document.getElementById('galleryLayout');
  const shuffledImages = imageArray.sort(() => 0.5 - Math.random());

  shuffledImages.forEach((src, index) => {
    const box = document.createElement('div');
    box.classList.add("box");
    box.style.height = (Math.random() * 300) + 400 + "px";

    const img = document.createElement('img');
    img.src = "./assets/photos/" + src + ".webp";
    img.loading = "lazy";

    galleryLayout.appendChild(box);
    box.appendChild(img);

  });
}

displayGalleryLayout(images);