// Languages

let language = navigator.language.slice(0, 2) || 'fr';
// language = 'fr';
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

        if (targetId === 'header') {
            document.querySelector('header').style.display = 'flex';
        }

        if (targetId === 'story') {
            startStory();
        }
    });
});

// Initially show header, hide sections
// document.querySelector('header').style.display = 'flex';
// document.querySelectorAll('section').forEach(section => section.style.display = 'none');

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
let i = 0;

fetch('./story.json')
    .then(response => response.json())
    .then(data => {
        storyData = data;
        startStory();
    });

function startStory() {
    i = 0;
    fullStory = new Array();
    const introStories = storyData.filter(story => story.tags.includes("intro"));
    updateStory(introStories[Math.floor(Math.random() * introStories.length)]);
}

const storyImage = document.getElementById('story-image');
const storyText = document.getElementById('story-text');

function updateStory(story) {
    i++;
    fullStory.push(story.name);
    console.log(story, fullStory);

    if (i > 5) {
        console.log("End story!");
        endStory();
        return;
    }
    storyImage.src = `./photos/${story.name}.png`;
    storyText.innerHTML = story.text;
    selectNextChoices();
}

const storyChoice1 = document.getElementById('story-choice-1');
const storyChoice2 = document.getElementById('story-choice-2');

function selectNextChoices() {
    const availableStories = storyData.filter(story =>
        !story.tags.includes("intro") &&
        !story.tags.includes("end") &&
        !fullStory.includes(story.name) &&
        story.choice // Ensure the story has a choice text
    );

    // Shuffle and select 2 stories
    const selectedChoices = availableStories
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    // Update choices content
    storyChoice1.innerHTML = selectedChoices[0].choice;
    storyChoice2.innerHTML = selectedChoices[1].choice;
    storyChoice1.onclick = () => updateStory(selectedChoices[0]);
    storyChoice2.onclick = () => updateStory(selectedChoices[1]);
}

function endStory() {
    const endStories = storyData.filter(story => story.tags.includes("end"));
    console.log(endStories[Math.floor(Math.random() * endStories.length)]);

    // Shuffle and select 2 stories
    const selectedChoices = endStories
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    // Update choices content
    storyChoice1.innerHTML = selectedChoices[0].choice;
    storyChoice2.innerHTML = selectedChoices[1].choice;
    storyChoice1.onclick = () => updateStory(selectedChoices[0]);
    storyChoice2.onclick = () => updateStory(selectedChoices[1]);
}

// on click of a choice (id)
//     updateStory (id)
//     select next choices


// Get next story

function getNextStory() {
    // take 2 random objects from story.json
}