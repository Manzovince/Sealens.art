// Languages

const supportedLanguages = ['en', 'fr'];
const LANGUAGE_KEY = 'sealens-language';

function savedLanguage() {
    try { return localStorage.getItem(LANGUAGE_KEY); } catch { return null; }
}

const detectedLanguage = savedLanguage() || (navigator.language || 'en').slice(0, 2);
let language = supportedLanguages.includes(detectedLanguage) ? detectedLanguage : 'en';

// Bump with any change to the JSON files: browsers keep them for days
const DATA_VERSION = 3;

let translations = {};
let storyData = [];
let storyLoaded;

function loadLanguage() {
    document.documentElement.lang = language;
    const texts = fetch(`./languages/${language}.json?v=${DATA_VERSION}`)
        .then(response => response.json())
        .then(data => {
            translations = data;
            updatePageContent();
        });
    storyLoaded = fetch(`./story-${language}.json?v=${DATA_VERSION}`)
        .then(response => response.json())
        .then(data => { storyData = data; });
    return Promise.all([texts, storyLoaded]);
}
loadLanguage();

document.getElementById('nav-lang').addEventListener('click', () => {
    language = language === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { }
    document.getElementById('nav-checkbox').checked = false;
    // A dive in progress, or its log, switches language on the spot
    loadLanguage().then(relocalize);
});

function t(key) {
    return translations[key] || key;
}

function updatePageContent() {
    document.querySelectorAll('[data-lg]').forEach(element => {
        element.textContent = t(element.dataset.lg);
    });
    document.querySelectorAll('[data-lg-aria]').forEach(element => {
        element.setAttribute('aria-label', t(element.dataset.lgAria));
    });
    zenBtn.dataset.tooltip = t(isZen() ? 'zen-mode-tip-off' : 'zen-mode-tip');
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 0 : ms));

// Toggle pages

const bgVideo = document.getElementById('bg-video');
const navCheckbox = document.getElementById('nav-checkbox');

function showSection(id) {
    document.querySelectorAll('section, header').forEach(el => {
        el.classList.toggle('active', el.id === id);
    });
    document.querySelector('#nav-back').style.display = id === 'header' ? 'none' : 'block';
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.toggleAttribute('aria-current', item.dataset.section === id && id !== 'header');
        if (item.hasAttribute('aria-current')) item.setAttribute('aria-current', 'page');
    });
    document.body.classList.toggle('diving', id === 'intro' || id === 'story');
    if (id !== 'intro' && id !== 'story') setNavPeek(false);
    navCheckbox.checked = false;
    // The home loop keeps decoding behind other pages otherwise
    if (id === 'header') bgVideo.play().catch(() => { });
    else bgVideo.pause();
    if (id !== 'intro') cancelIntro();
    if (id !== 'recap') viewer.classList.remove('open');
    if (id !== 'story') setZen(false); // the bar and the sound must come back elsewhere
    window.scrollTo(0, 0);

    // One history entry for everything past the home page, so the phone's back button returns home
    if (id !== 'header' && !history.state?.sealens) history.pushState({ sealens: true }, '');
    if (id === 'header' && history.state?.sealens) history.back();
}

window.addEventListener('popstate', () => {
    if (!document.getElementById('header').classList.contains('active')) showSection('header');
});

document.querySelectorAll('.nav-item[data-section], #logo').forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
});
document.getElementById('nav-gallery').addEventListener('click', () => { navCheckbox.checked = false; });
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') navCheckbox.checked = false;
});

const navToggle = document.getElementById('nav-toggle');

function setNavPeek(on) {
    document.body.classList.toggle('nav-peek', on);
    navToggle.setAttribute('aria-expanded', on);
}
navToggle.addEventListener('click', () => setNavPeek(!document.body.classList.contains('nav-peek')));

const nav = document.querySelector('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 24), { passive: true });

// Music

const PLAYLIST = 'OLAK5uy_nrvFfUuv7EG61fs5p_ShH6UT4-b8DUSzg';
const MUSIC_VOLUME = 60;
const playPauseBtn = document.getElementById('playPauseBtn');

let player;
let playerReady;
let hasPlayed = false; // A random song is only picked the first time
let musicOn = false;
let musicChosen = false; // The disclaimer is only asked once
let fadeTimer;

function setMusicIcon(on) {
    playPauseBtn.classList.toggle('is-playing', on);
    playPauseBtn.setAttribute('aria-pressed', on);
}

// The YouTube API weighs about 1 MB: it is fetched only once a visitor shows interest in music
function loadPlayer() {
    if (!playerReady) {
        playerReady = new Promise(resolve => {
            window.onYouTubeIframeAPIReady = () => {
                player = new YT.Player('player', {
                    height: '0',
                    width: '0',
                    playerVars: { listType: 'playlist', list: PLAYLIST },
                    events: {
                        onReady: () => resolve(player),
                        // The browser may refuse to play (no tap, iOS): the icon follows what is really heard
                        onStateChange: event => {
                            if (event.data === YT.PlayerState.PLAYING) setMusicIcon(musicOn);
                            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                musicOn = false;
                                setMusicIcon(false);
                            }
                        },
                    },
                });
            };
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);
        });
    }
    return playerReady;
}

function setMusic(on) {
    musicOn = on;
    setMusicIcon(on);
    // Called synchronously when the player is ready, so mobile browsers see the user's tap
    const apply = () => {
        clearInterval(fadeTimer);
        if (!on) return player.pauseVideo();
        player.setVolume(0);
        if (!hasPlayed && player.getPlaylist()) {
            player.playVideoAt(Math.floor(Math.random() * player.getPlaylist().length));
            hasPlayed = true;
        } else {
            player.playVideo();
        }
        fadeVolume();
    };
    player ? apply() : loadPlayer().then(() => musicOn === on && apply());
}

function fadeVolume() {
    let volume = 0;
    fadeTimer = setInterval(() => {
        volume = Math.min(MUSIC_VOLUME, volume + 3);
        player.setVolume(volume);
        if (volume === MUSIC_VOLUME) clearInterval(fadeTimer);
    }, 150);
}

playPauseBtn.addEventListener('pointerenter', loadPlayer, { once: true });
playPauseBtn.addEventListener('click', () => {
    musicChosen = true;
    setMusic(!musicOn);
});

// Story

const ROUNDS = 4; // intro + 3 encounters, then the way back up
const SIZES = [800, 1600, 2560];

let fullStory = [];
let lastChoice = null; // the story picked to get here
let diveLog = []; // what was seen, for the recap: { story, via }
let page = null; // what the timeline shows, so it can be redrawn in another language

// The same story in the current language; the English set is smaller, so it may fall back
const localized = story => storyData.find(s => s.name === story.name) || story;

const storySection = document.getElementById('story');
const storyTimeline = document.getElementById('story-timeline');
const storyAir = document.getElementById('story-air');
const layers = document.querySelectorAll('.story-layer');
let frontLayer = 0;

const pick = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => list.map(item => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(pair => pair[1]);

document.getElementById('cta-experience').addEventListener('click', startDisclaimer);
document.getElementById('disclaimer-music-on').addEventListener('click', () => {
    musicChosen = true;
    setMusic(true);
    startStory();
});
document.getElementById('disclaimer-music-off').addEventListener('click', () => {
    musicChosen = true;
    startStory();
});

function startDisclaimer() {
    // The intro video starts loading while the visitor reads the disclaimer
    document.getElementById('intro-video').preload = 'auto';
    if (musicChosen) {
        startStory();
    } else {
        loadPlayer();
        showSection('disclaimer');
    }
}

// Photos

// object-fit: cover crops the 3:2 photos on portrait screens, so the height matters too
function photoUrl(name) {
    const needed = Math.max(innerWidth, innerHeight * 1.5) * Math.min(devicePixelRatio || 1, 1.25);
    const width = SIZES.find(size => size >= needed) || SIZES[SIZES.length - 1];
    return `./photos/${width}/${name}.webp`;
}

const preloaded = {};
function preloadPhoto(name) {
    if (!preloaded[name]) {
        const img = new Image();
        img.src = photoUrl(name);
        preloaded[name] = img.decode().catch(() => { });
    }
    return preloaded[name];
}

// Two stacked layers: the new photo is decoded off screen, then fades in over the previous one
let photoRequest = 0;
async function showPhoto(name) {
    const request = ++photoRequest;
    await preloadPhoto(name);
    const back = layers[1 - frontLayer];
    back.src = photoUrl(name);
    await back.decode().catch(() => { });
    if (request !== photoRequest) return; // a newer photo was asked for meanwhile
    back.classList.remove('drift');
    void back.offsetWidth; // restart the slow zoom
    back.classList.add('drift', 'visible');
    layers[frontLayer].classList.remove('visible');
    frontLayer = 1 - frontLayer;
}

function clearPhotos() {
    photoRequest++;
    layers.forEach(layer => layer.classList.remove('visible'));
}

// Waits for the photo, but never longer than a slow connection deserves
const photoReady = name => Promise.race([preloadPhoto(name), wait(1500)]);

// 1 = full lungs, 0 = empty
function setAir(level) {
    storyAir.style.setProperty('--air', level);
    storyAir.classList.toggle('low', level < 0.3);
}

// Intro

const INTRO_FADE = 5800; // the sentence has been read
const INTRO_END = 7400; // the screen has gone dark

const intro = document.getElementById('intro');
const introVideo = document.getElementById('intro-video');
let introTimers = [];
let introNext = null;

function cancelIntro() {
    introTimers.forEach(clearTimeout);
    introTimers = [];
    intro.classList.remove('intro-out');
    introVideo.pause();
}

function startStory() {
    showSection('intro');
    introVideo.currentTime = 0;
    introVideo.play().catch(() => { });

    fullStory = [];
    lastChoice = null;
    diveLog = [];
    page = null;
    storyTimeline.replaceChildren();
    setZen(false);
    clearPhotos();
    setAir(1);

    storyLoaded.then(() => {
        introNext = pick(storyData.filter(story => story.tags.includes('intro')));
        preloadPhoto(introNext.name);
    });

    introTimers = [
        setTimeout(() => intro.classList.add('intro-out'), INTRO_FADE),
        setTimeout(endIntro, INTRO_END),
    ];
}

async function endIntro() {
    cancelIntro();
    await storyLoaded;
    showSection('story');
    updateStory(introNext);
}

function skipIntro() {
    if (intro.classList.contains('active') && introTimers.length) endIntro();
}
intro.addEventListener('click', skipIntro);
document.addEventListener('keydown', event => {
    if (['Escape', 'Enter', ' '].includes(event.key)) skipIntro();
});

// Timeline

// Each line waits for the previous one, so the eye reads them in order
let revealDelay = 0;
let revealScale = 1; // 0 when redrawing in another language: everything at once
function reveal(element, after) {
    revealDelay += after * revealScale;
    element.classList.add('story-reveal-in');
    element.style.animationDelay = `${revealDelay}ms`;
    // Played once: coming back from the recap must not hide the lines again
    element.addEventListener('animationend', () => {
        element.classList.remove('story-reveal-in');
        element.style.animationDelay = '';
    }, { once: true });
    storyTimeline.appendChild(element);
}

function addText(text, after = 150) {
    reveal(Object.assign(document.createElement('div'), {
        textContent: text,
        className: 'timeline-event',
    }), after);
}

function addChoice(label, onclick, after = 150) {
    reveal(Object.assign(document.createElement('button'), {
        textContent: label,
        className: 'story-choice',
        // A second quick click would count as another encounter
        onclick: () => storyTimeline.classList.contains('leaving') || onclick(),
    }), after);
}

function addPreviousChoice() {
    if (!lastChoice) return;
    reveal(Object.assign(document.createElement('div'), {
        textContent: localized(lastChoice).choice,
        className: 'story-previous-choice',
    }), 0);
}

// The old lines fade away while the next photo arrives, then the new ones come in
let pageTurn = 0;
async function turnPage(photo) {
    const turn = ++pageTurn;
    storyTimeline.classList.add('leaving');
    await Promise.all([photoReady(photo), wait(storyTimeline.children.length ? 450 : 0)]);
    if (turn !== pageTurn) return;
    showPhoto(photo);
    storyTimeline.classList.remove('leaving');
    renderPage();
    // Keyboard visitors keep their place; a mouse click shows no focus ring
    storyTimeline.querySelector('button')?.focus({ preventScroll: true });
}

function renderPage() {
    storyTimeline.replaceChildren();
    revealDelay = 0;
    addPreviousChoice();
    addText(localized(page.story).text);

    if (page.kind === 'step') {
        page.choices.forEach((choice, i) => {
            addChoice(localized(choice).choice + '...', () => {
                lastChoice = choice;
                updateStory(choice);
            }, i ? 150 : 900);
        });
    } else if (page.kind === 'end') {
        // The warning comes after a breath, and the way up a little later
        addText(endTextList[language][page.endText], 1400);
        page.choices.forEach((choice, i) => {
            addChoice(localized(choice).choice + '...', () => resurface(choice), i ? 150 : 1800);
        });
    } else {
        restartOrQuit();
    }
}

// A choice still on offer that has no text in the new language is swapped for one that has
function swapMissingChoices() {
    if (page?.kind !== 'step') return;
    const exists = story => storyData.some(s => s.name === story.name);
    const spare = shuffle(storyData.filter(s =>
        !s.tags.includes('intro') && !s.tags.includes('outro') && !s.tags.includes('end') && s.choice
        && !fullStory.includes(s.name) && !page.choices.some(c => c.name === s.name)
    ));
    page.choices = page.choices.map(choice => exists(choice) ? choice : spare.shift() || choice);
    page.choices.forEach(choice => preloadPhoto(choice.name));
}

function relocalize() {
    swapMissingChoices();
    if (storySection.classList.contains('active') && page && !storyTimeline.classList.contains('leaving')) {
        revealScale = 0;
        renderPage();
        revealScale = 1;
    }
    if (recap.classList.contains('active')) renderRecap();
    if (isViewerOpen()) showInViewer(viewerIndex);
}

function updateStory(story) {
    fullStory.push(story.name);
    diveLog.push({ story, via: lastChoice });
    setAir(1 - (fullStory.length - 1) / ROUNDS);

    if (fullStory.length < ROUNDS) {
        const choices = shuffle(storyData.filter(s =>
            !s.tags.includes('intro') && !s.tags.includes('outro') && !s.tags.includes('end')
            && !fullStory.includes(s.name) && s.choice
        )).slice(0, 2);
        choices.forEach(choice => preloadPhoto(choice.name));
        page = { kind: 'step', story, choices };
    } else {
        endStory(story);
    }
    turnPage(story.name);
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
    addChoice(endChoiceList[language][0], startStory, 1200);
    addChoice(endChoiceList[language][1], () => showSection('header'));
    addChoice(t('recap-open'), openRecap);
    storyTimeline.lastChild.classList.add('recap-open');
}

// Zen mode

const zenBtn = document.getElementById('zen-mode');
const isZen = () => document.body.classList.contains('zen');

function setZen(on) {
    document.body.classList.toggle('zen', on);
    document.body.classList.remove('zen-peek');
    zenBtn.setAttribute('aria-pressed', on);
    zenBtn.dataset.tooltip = t(on ? 'zen-mode-tip-off' : 'zen-mode-tip');
}

zenBtn.addEventListener('click', event => {
    event.stopPropagation();
    setZen(!isZen());
});
// Touch screens have no hover: a tap on the mark shows the text, a tap on the photo hides it
document.getElementById('zen-peek').addEventListener('click', event => {
    event.stopPropagation();
    document.body.classList.toggle('zen-peek');
});
storySection.addEventListener('click', event => {
    if (isZen() && !event.target.closest('#story-content, button')) document.body.classList.remove('zen-peek');
});
document.addEventListener('keydown', event => {
    if (!storySection.classList.contains('active') || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'z' || event.key === 'Z') setZen(!isZen());
    if (event.key === 'Escape') setZen(false);
});

// Dive log

const recap = document.getElementById('recap');
const recapLog = document.getElementById('recap-log');

function logStep(i) {
    if (i === 0) return t('log-start');
    if (i === diveLog.length - 1) return t('log-end');
    return `${t('log-encounter')} ${i}`;
}

function openRecap() {
    renderRecap();
    showSection('recap');
    document.getElementById('recap-title').focus({ preventScroll: true });
}

function renderRecap() {
    document.getElementById('recap-date').textContent = new Date()
        .toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
    recapLog.replaceChildren(...diveLog.map((entry, i) => {
        const item = document.createElement('li');
        item.className = 'log-entry';
        item.style.animationDelay = `${200 + i * 120}ms`;
        const text = document.createElement('div');
        text.className = 'log-text';
        if (entry.via) text.appendChild(Object.assign(document.createElement('em'), { textContent: localized(entry.via).choice }));
        text.appendChild(Object.assign(document.createElement('p'), { textContent: localized(entry.story).text }));
        item.append(
            Object.assign(document.createElement('span'), { className: 'log-step', textContent: logStep(i) }),
            logPhoto(entry, i),
            text,
        );
        return item;
    }));
}

function logPhoto(entry, i) {
    const button = Object.assign(document.createElement('button'), {
        className: 'log-photo',
        ariaLabel: `${t('viewer-open')} : ${logStep(i)}`,
        onclick: () => openViewer(i),
    });
    button.appendChild(Object.assign(document.createElement('img'), {
        src: `./photos/800/${entry.story.name}.webp`, alt: '', decoding: 'async', loading: 'lazy',
    }));
    return button;
}

function closeRecap() {
    showSection('story');
}

document.getElementById('recap-close').addEventListener('click', closeRecap);

// Full-screen photo

const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewer-img');
const viewerPrev = document.getElementById('viewer-prev');
const viewerNext = document.getElementById('viewer-next');
let viewerIndex = 0;
let viewerOpener = null;

function showInViewer(i) {
    viewerIndex = Math.max(0, Math.min(diveLog.length - 1, i));
    const name = diveLog[viewerIndex].story.name;
    // The thumbnail is already there: it stands in until the large file is decoded
    viewerImg.src = `./photos/800/${name}.webp`;
    const large = new Image();
    large.src = photoUrl(name);
    large.decode().then(() => {
        if (diveLog[viewerIndex]?.story.name === name) viewerImg.src = large.src;
    }).catch(() => { });
    document.getElementById('viewer-caption').textContent = logStep(viewerIndex);
    viewerPrev.disabled = viewerIndex === 0;
    viewerNext.disabled = viewerIndex === diveLog.length - 1;
}

function openViewer(i) {
    viewerOpener = document.activeElement;
    showInViewer(i);
    viewer.classList.add('open');
    document.getElementById('viewer-close').focus({ preventScroll: true });
}

function closeViewer() {
    viewer.classList.remove('open');
    viewerOpener?.focus({ preventScroll: true });
}

const isViewerOpen = () => viewer.classList.contains('open');

viewer.addEventListener('click', event => {
    if (!event.target.closest('.viewer-arrow')) closeViewer();
});
viewerPrev.addEventListener('click', () => showInViewer(viewerIndex - 1));
viewerNext.addEventListener('click', () => showInViewer(viewerIndex + 1));

let touchX = null;
viewer.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
        showInViewer(viewerIndex + (dx < 0 ? 1 : -1));
        event.preventDefault(); // a swipe is not a tap that closes
    }
});

document.addEventListener('keydown', event => {
    if (!recap.classList.contains('active')) return;
    if (isViewerOpen()) {
        if (event.key === 'Escape') closeViewer();
        if (event.key === 'ArrowLeft') showInViewer(viewerIndex - 1);
        if (event.key === 'ArrowRight') showInViewer(viewerIndex + 1);
    } else if (event.key === 'Escape') {
        closeRecap();
    }
});

// End of the dive

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

function endStory(story) {
    const choices = shuffle(storyData.filter(s => s.tags.includes('outro'))).slice(0, 2);
    choices.forEach(choice => preloadPhoto(choice.name));
    page = { kind: 'end', story, choices, endText: Math.floor(Math.random() * endTextList[language].length) };
    // The gauge empties as the warning appears
    setTimeout(() => page?.kind === 'end' && setAir(0.12), 1600);
}

function resurface(choice) {
    fullStory.push(choice.name);
    lastChoice = choice;
    diveLog.push({ story: choice, via: choice });
    setAir(1);
    page = { kind: 'final', story: choice };
    turnPage(choice.name);
}
