// Languages

let language = navigator.language.slice(0, 2) || 'fr';
language = 'fr';
fetch(`./languages/${language}.json`)
    .then(response => response.json())
    .then(translations => {
        // Store translations in a global variable or state management system
        window.translations = translations;
        updatePageContent();
    });

function updatePageContent() {
    document.querySelectorAll('[data-lg]').forEach(element => {
        const key = element.getAttribute('data-lg');
        element.textContent = window.translations[key] || key;
    });
}

// Toggle pages

document.querySelectorAll('.nav-item, #logo').forEach(item => {
    item.addEventListener('click', function () {
        const targetId = this.getAttribute('data-section');

        document.querySelectorAll('section, header').forEach(el => {
            el.style.display = el.id === targetId ? 'block' : 'none';
        });

        if (targetId === 'header' || targetId === 'gallery') {
            document.querySelector('header').style.display = 'flex';
        }

        if (targetId === 'story') {
            startStory();
        }
    });
});

// Initially show header, hide sections
document.querySelector('header').style.display = 'flex';
document.querySelectorAll('section').forEach(section => section.style.display = 'none');

// Music player

let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'cQEcydiTQdo',
        playerVars: {
            'controls': 0,
            'disablekb': 1,
            'autoplay': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.addEventListener('click', togglePlayPause);
}

const playIcon = document.getElementById('playing-icon');
const pauseIcon = document.getElementById('muted-icon');

function togglePlayPause() {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        player.playVideo();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
}

// Story

let storyData = [];
let fullStory = new Array();

fetch(`./story-${language}.json`)
    .then(response => response.json())
    .then(data => {
        storyData = data
    });

const storyTimeline = document.getElementById('story-timeline');

function startStory() {
    console.log("Starting story");

    document.querySelector('header').style.display = 'none';
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    document.getElementById('intro').style.display = 'block';
    setTimeout(() => {
        document.getElementById('intro').classList.add('intro-out');
    }, 4000);
    setTimeout(() => {
        document.getElementById('intro').classList.remove('intro-out');
        document.getElementById('intro').style.display = 'none';
        document.getElementById('story').style.display = 'block';
        fullStory = new Array();
        storyTimeline.innerHTML = "";
        const introStories = storyData.filter(story => story.tags.includes("intro"));
        updateStory(introStories[Math.floor(Math.random() * introStories.length)]);
    }, 6000);
}

const storyImage = document.getElementById('story-image');
const storyText = document.getElementById('story-text');

function updatePhoto(name) {
    storyImage.src = `./photos/${name}.png`;
}

function updateStory(story) {
    fullStory.push(story.name);
    console.log(fullStory);

    updatePhoto(story.name);

    storyTimeline.appendChild(Object.assign(document.createElement("div"), {
        textContent: story.text,
        classList: "timeline-event story-reveal-in"
    }));
    if (fullStory.length < 4) {
        var randomChoices = storyData
            .filter(s => !s.tags.includes("intro") && !s.tags.includes("outro") && !s.tags.includes("end") && !fullStory.includes(s.name) && s.choice)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        displayNextChoices(fullStory, randomChoices);
    } else {
        endStory();
    }

    document.getElementsByClassName('story-previous-choice')[fullStory.length - 2].classList.replace("story-reveal-in", "story-reveal-out");
    document.getElementsByClassName('story-previous-choice')[fullStory.length - 2].style.display = "none";
}

function displayNextChoices(fullStory, list) {
    setTimeout(() => {
        storyTimeline.appendChild(Object.assign(document.createElement("button"), {
            textContent: list[0].choice + "...",
            classList: "story-choice story-reveal-in",
            onclick: () => {
                document.getElementsByClassName('timeline-event')[fullStory.length - 1].style.display = "none";
                removeUnselectedChoice(0);
                updateStory(list[0]);
            }
        }));
        storyTimeline.appendChild(Object.assign(document.createElement("button"), {
            textContent: list[1].choice + "...",
            classList: "story-choice story-reveal-in",
            onclick: () => {
                document.getElementsByClassName('timeline-event')[fullStory.length - 1].style.display = "none";
                removeUnselectedChoice(1);
                updateStory(list[1]);
            }
        }));
    }, 6000);
}

function removeUnselectedChoice(selectedIndex) {
    const choices = document.querySelectorAll('.story-choice');
    choices.forEach((choice, index) => {
        if (index !== selectedIndex) {
            choice.remove();
        } else {
            choice.onclick = null;
            choice.classList.replace('story-choice', 'story-previous-choice');
            choice.textContent = choice.textContent.slice(0, -3);
        }
    });
}

function backToHome() {
    document.querySelector('header').style.display = 'flex';
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
}

function restartOrQuit() {
    storyTimeline.appendChild(Object.assign(document.createElement("button"), {
        textContent: "Prendre une nouvelle inspiration et replongez...",
        classList: "story-choice story-reveal-in",
        onclick: () => {
            startStory();
        }
    }));
    storyTimeline.appendChild(Object.assign(document.createElement("button"), {
        textContent: "Retourner à la page d'accueil",
        classList: "story-choice story-reveal-in",
        onclick: () => {
            document.querySelector('header').style.display = 'flex';
            document.querySelectorAll('section').forEach(section => section.style.display = 'none');
        }
    }));
}

const endTextList = [
    "Vous commencez à sentir des contractions, il est temps de sortir de l'eau.",
    "Attention, il ne vous reste plus beaucoup d'air.",
    "Mais la fin de ce voyage approche, prenez vite une décision.",
    "Il est temps de remonter, vous manquez d'oxygène.",
    "Mais ces rencontres ne durent qu'un instant, et il va falloir rentrer."]

function endStory() {

    var endChoice = storyData
        .filter(s => s.tags.includes("outro"))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    document.getElementsByClassName('timeline-event')[document.getElementsByClassName('timeline-event').length - 1].textContent += "\n" + endTextList[Math.floor(Math.random() * endTextList.length)];

    setTimeout(() => {
        storyTimeline.appendChild(Object.assign(document.createElement("button"), {
            textContent: endChoice[0].choice + "...",
            classList: "story-choice story-reveal-in",
            onclick: () => {
                document.getElementsByClassName('timeline-event')[fullStory.length - 1].style.display = "none";
                document.querySelectorAll('.story-choice').forEach(choice => choice.style.display = 'none');
                updatePhoto(endChoice[0].name);
                storyTimeline.appendChild(Object.assign(document.createElement("div"), {
                    textContent: endChoice[0].text,
                    classList: "timeline-event story-reveal-in"
                }));
                setTimeout(() => {
                    restartOrQuit();
                }, 4000);
            }
        }));
        storyTimeline.appendChild(Object.assign(document.createElement("button"), {
            textContent: endChoice[1].choice + "...",
            classList: "story-choice story-reveal-in",
            onclick: () => {
                document.getElementsByClassName('timeline-event')[fullStory.length - 1].style.display = "none";
                document.querySelectorAll('.story-choice').forEach(choice => choice.style.display = 'none');
                updatePhoto(endChoice[1].name);
                storyTimeline.appendChild(Object.assign(document.createElement("div"), {
                    textContent: endChoice[1].text,
                    classList: "timeline-event story-reveal-in"
                }));
                setTimeout(() => {
                    restartOrQuit();
                }, 4000);
            }
        }));
    }, 6000);

    console.log("End of story");
}