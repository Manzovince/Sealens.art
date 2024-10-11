// Languages

let language = navigator.language.slice(0,2) || 'en';
// console.log(language);
// language = 'en';
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
            el.style.display = el.id === targetId ? 'flex' : 'none';
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

document.querySelectorAll('video').forEach(v => { v.setAttribute("playsinline", true) });

// Music

let player;
let hasPlayed = false; // Track whether a song has been played

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            listType: 'playlist',
            list: 'OLAK5uy_nrvFfUuv7EG61fs5p_ShH6UT4-b8DUSzg',
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady() {
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
}

const icons = {
    play: document.getElementById('playing-icon'),
    pause: document.getElementById('muted-icon')
};

// Toggle play/pause and play a random song if not yet played
function togglePlayPause() {
    if (!hasPlayed) {
        playRandomSong();
        hasPlayed = true;
    }

    const isPlaying = player.getPlayerState() === YT.PlayerState.PLAYING;
    isPlaying ? player.pauseVideo() : player.playVideo();
    icons.play.style.display = isPlaying ? "none" : "block";
    icons.pause.style.display = isPlaying ? "block" : "none";
}

// Play a random song from the playlist
function playRandomSong() {
    const randomIndex = Math.floor(Math.random() * player.getPlaylist().length);
    player.playVideoAt(randomIndex);
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

function startDisclaimer() {
    if (hasPlayed) {
        startStory();
    } else {
        document.getElementById('disclaimer').style.display = 'flex';
    }
}

function startStory() {
    console.log("Starting story");

    document.querySelector('header').style.display = 'none';
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    document.getElementById('intro').style.display = 'block';
    setTimeout(() => {
        document.getElementById('intro').classList.add('intro-out');
    }, 6000);
    setTimeout(() => {
        document.getElementById('intro').classList.remove('intro-out');
        document.getElementById('intro').style.display = 'none';
        document.getElementById('story').style.display = 'block';
        fullStory = new Array();
        storyTimeline.innerHTML = "";
        const introStories = storyData.filter(story => story.tags.includes("intro"));
        updateStory(introStories[Math.floor(Math.random() * introStories.length)]);
    }, 8000);
}

// const storyImage = document.getElementById('story-image');
const storyImageWEBP = document.getElementById('story-image-webp');
// const storyImagePNG1 = document.getElementById('story-image-png1');
const storyImagePNG2 = document.getElementById('story-image-png2');
const storyText = document.getElementById('story-text');

function updatePhoto(name) {
    console.log('Update photo');
    // storyImage.src = `./photos/${name}.png`;
    storyImageWEBP.srcset = `./photos/${name}.webp`;
    // storyImagePNG1.srcset = `./photos/${name}.png`;
    storyImagePNG2.src = `./photos/${name}.png`;
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

const endChoiceList = {
    fr: [
        "Prendre une nouvelle inspiration et replonger...",
        "Retourner à la page d'accueil"
    ],
    en: [
        "Take a new breath and dive again...",
        "Get back to home"
    ]
};

function restartOrQuit() {
    storyTimeline.appendChild(Object.assign(document.createElement("button"), {
        textContent: endChoiceList[language][0],
        classList: "story-choice story-reveal-in",
        onclick: () => {
            startStory();
        }
    }));
    storyTimeline.appendChild(Object.assign(document.createElement("button"), {
        textContent: endChoiceList[language][1],
        classList: "story-choice story-reveal-in",
        onclick: () => {
            document.querySelector('header').style.display = 'flex';
            document.querySelectorAll('section').forEach(section => section.style.display = 'none');
        }
    }));
}

const endTextList = {
    fr: [
        "Vous commencez à sentir des contractions, il est temps de sortir de l'eau.",
        "Attention, il ne vous reste plus beaucoup d'air.",
        "Mais la fin de ce voyage approche, prenez vite une décision.",
        "Il est temps de remonter, vous manquez d'oxygène.",
        "Mais ces rencontres ne durent qu'un instant, et il va falloir rentrer."
    ],
    en: [
        "You are starting to feel contractions, it's time to get out of the water.",
        "Be careful, you are running low on air.",
        "But the end of this journey is approaching, make a decision quickly.",
        "It's time to resurface, you're running out of oxygen.",
        "But these encounters last only a moment, and it's time to head back."
    ]
};

function endStory() {

    var endChoice = storyData
        .filter(s => s.tags.includes("outro"))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    document.getElementsByClassName('timeline-event')[document.getElementsByClassName('timeline-event').length - 1].textContent += "\n" + endTextList[language][Math.floor(Math.random() * endTextList[language].length)];

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