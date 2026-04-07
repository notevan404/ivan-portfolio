const text = document.getElementById("text");
const character = document.getElementById("character");
const clickSound = document.getElementById("clickSound");
const bgMusic = document.getElementById("bgMusic");
const muteBtn = document.getElementById("muteBtn");
const textSound = document.getElementById("textSound");

const BASE_VOLUME = 0.4;
const LOOP_END = 46;
const FADE_DURATION = 3;
let isFading = false;

let isMuted = false;
let isTyping = false;
let isWalking = false; // 🔥 NUEVO
let walkInterval = null; // 🔥 NUEVO
let currentX = 30; // 🔥 NUEVO (posición inicial)

let lookTimeout = null;
let discovered = new Set();

const TOTAL_OBJECTS = 6;

/* WALK FRAMES */
const walkFrames = [
    "assets/walk_1.png",
    "assets/walk_2.png",
    "assets/walk_3.png"
];

/* DIALOGOS */
const dialogues = {
    pc: "This is where I spend most of my time...\nI love learning new things and building ideas from scratch ",
    coffee: "Fun fact: I only drink decaf coffee… but I still can't work without it ",
    poster: "Since I was a kid, Japan has always been a dream of mine. I love its culture, anime and video games :) ",
    snes: "I also like to disconnect by playing games from time to time. I always come back to the classics ",
    window: "I love sunsets… there's something about them that makes everything slow down for a moment ",
    bed: "I'm not a big fan of sleeping too much… it feels like there's always something to do "
};

/* TEXTO */
function typeText(message) {
    if (isTyping) return;

    isTyping = true;
    let i = 0;
    text.innerHTML = "";

    character.classList.add("talking");

    const interval = setInterval(() => {

        const char = message.charAt(i);
        text.innerHTML += char === " " ? "&nbsp;" : char;

        if (
            !isMuted &&
            textSound &&
            ![" ", "\n", ".", ",", "!", "?"].includes(char)
        ) {
            if (i % 2 === 0) {
                const sound = textSound.cloneNode();
                sound.volume = 0.15;
                sound.playbackRate = 0.9 + Math.random() * 0.2;
                sound.play().catch(() => { });
            }
        }

        i++;

        if (i >= message.length) {
            clearInterval(interval);
            isTyping = false;
            character.classList.remove("talking");
        }

    }, 25);
}

/* MIRAR */
function lookAt(direction) {
    const currentTransform = window.getComputedStyle(character).transform;

    let scale = 4;

    if (currentTransform !== "none") {
        const values = currentTransform.split("(")[1].split(")")[0].split(",");
        const scaleX = values[0];
        scale = Math.abs(scaleX);
    }

    character.style.transform =
        direction === "right"
            ? `translateX(-50%) scale(${scale}) scaleX(1)`
            : `translateX(-50%) scale(${scale}) scaleX(-1)`;
}

/* DIRECCIÓN */
function getDirection(element) {
    const rect = element.getBoundingClientRect();
    const charRect = character.getBoundingClientRect();
    return rect.left > charRect.left ? "right" : "left";
}

/* INTERACCIÓN */
function interact(element, dialogue, id) {
    const dir = getDirection(element);

    lookAt(dir);
    typeText(dialogue);

    if (!isMuted && clickSound) {
        clickSound.currentTime = 0;
        clickSound.volume = 0.5;
        clickSound.play().catch(() => { });
    }

    discovered.add(id);

    if (discovered.size === TOTAL_OBJECTS) {
        setTimeout(() => {
            typeText("You've discovered everything! Thanks for playing.");
        }, 2000);
    }

    if (lookTimeout) clearTimeout(lookTimeout);

    lookTimeout = setTimeout(() => {
        lookAt("right");
    }, 2000);
}

/* WALK  */
function startWalking() {
    if (isWalking || isTyping) return;

    isWalking = true;

    const direction = Math.random() > 0.5 ? "right" : "left";
    const distance = 5 + Math.random() * 10;

    let targetX = direction === "right"
        ? currentX + distance
        : currentX - distance;

    targetX = Math.max(10, Math.min(80, targetX));

    lookAt(direction);

    let frameIndexWalk = 0;

    let stepCounter = 0;

    walkInterval = setInterval(() => {

        //  cambiar frame MÁS lento
        if (stepCounter % 4 === 0) {
            character.src = walkFrames[frameIndexWalk];
            frameIndexWalk = (frameIndexWalk + 1) % walkFrames.length;
        }

        //  movimiento más lento
        const speed = 0.50;

        if (direction === "right") currentX += speed;
        else currentX -= speed;

        character.style.left = currentX + "%";

        stepCounter++;

        // llegada
        if (
            (direction === "right" && currentX >= targetX) ||
            (direction === "left" && currentX <= targetX)
        ) {
            stopWalking();
        }

    }, 60);
}

    function stopWalking() {
        clearInterval(walkInterval);
        isWalking = false;
    }

    /* LOOP SUAVE */
    function fadeLoop() {
        if (!bgMusic || isFading) return;

        isFading = true;

        const fadeSteps = 40;
        const stepTime = (FADE_DURATION * 1000) / fadeSteps;

        let currentStep = 0;

        const fadeOut = setInterval(() => {
            if (currentStep >= fadeSteps) {
                clearInterval(fadeOut);

                bgMusic.currentTime = 0;
                bgMusic.volume = 0;

                let fadeInStep = 0;
                const volumeStep = BASE_VOLUME / fadeSteps;

                const fadeIn = setInterval(() => {
                    if (fadeInStep >= fadeSteps) {
                        clearInterval(fadeIn);
                        bgMusic.volume = BASE_VOLUME;
                        isFading = false;
                        return;
                    }

                    bgMusic.volume += volumeStep;
                    fadeInStep++;
                }, stepTime);

                return;
            }

            bgMusic.volume = Math.max(
                0,
                bgMusic.volume - (BASE_VOLUME / fadeSteps)
            );

            currentStep++;
        }, stepTime);
    }

    /* EVENTOS */
    ["pc", "coffee", "poster", "snes", "window", "bed"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("click", (e) => {
                interact(e.target, dialogues[id], id);
            });
        }
    });

    /* IDLE */
    const frames = [
        "assets/idle_1.png",
        "assets/idle_2.png",
        "assets/idle_3.png",
        "assets/idle_4.png"
    ];

    let frameIndex = 0;

    setInterval(() => {
        if (isWalking) return; // 🔥 CLAVE
        character.src = frames[frameIndex];
        frameIndex = (frameIndex + 1) % frames.length;
    }, 200);

    /* WALK RANDOM 🔥 */
    setInterval(() => {
        if (!isWalking && !isTyping) {
            if (Math.random() < 0.3) {
                startWalking();
            }
        }
    }, 4000);

    /* INICIAR MÚSICA */
    document.addEventListener("click", () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = BASE_VOLUME;
            bgMusic.play().catch(() => { });
        }
    }, { once: true });

    /* LOOP */
    if (bgMusic) {
        bgMusic.addEventListener("timeupdate", () => {
            if (bgMusic.currentTime >= LOOP_END && !isFading) {
                fadeLoop();
            }
        });
    }

    /* MUTE */
    if (muteBtn) {
        muteBtn.addEventListener("click", () => {
            isMuted = !isMuted;

            if (bgMusic) bgMusic.muted = isMuted;

            muteBtn.textContent = isMuted ? "🔇" : "🔊";
        });
    }