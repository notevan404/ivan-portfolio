const text = document.getElementById("text");
const character = document.getElementById("character");
const clickSound = document.getElementById("clickSound");
const bgMusic = document.getElementById("bgMusic");
const muteBtn = document.getElementById("muteBtn");

const BASE_VOLUME = 0.4;
const LOOP_END = 16;       // punto donde empieza el fade
const FADE_DURATION = 0.5; // segundos de fade
let isFading = false;

let isMuted = false;
let isTyping = false;
let lookTimeout = null;
let discovered = new Set();

const TOTAL_OBJECTS = 6;

/*  cORTE DEL LOOP */

const dialogues = {
   pc: "Aquí es donde paso gran parte de mi tiempo...\nMe encanta aprender y crear cosas desde cero ",

    coffee: "Curiosamente solo bebo café descafeinado… pero aun así no puede faltar mientras trabajo ",

    poster: "Desde pequeño, Japón siempre ha sido un sueño para mí. Me encanta su cultura, el anime y los videojuegos :) ",

    snes: "También me gusta desconectar jugando de vez en cuando. Siempre vuelvo a lo clásico ",

    window: "Me encantan los atardeceres… tienen algo que hace que todo se detenga por un momento ",

    bed: "No soy muy fan de dormir demasiado… siento que hay muchas cosas que hacer "
};

/* TEXTO */
function typeText(message) {
    if (isTyping) return;

    isTyping = true;
    let i = 0;
    text.innerHTML = "";

    character.classList.add("talking");

    const interval = setInterval(() => {
        text.innerHTML += message.charAt(i) === " " ? "&nbsp;" : message.charAt(i);
        i++;

        if (i >= message.length) {
            clearInterval(interval);
            isTyping = false;
            character.classList.remove("talking");
        }
    }, 25);
}

/* FUNCION PARA QUE MIRE */
function lookAt(direction) {
    const base = "translateX(-50%) scale(4)";
    character.style.transform =
        direction === "right"
            ? `${base} scaleX(1)`
            : `${base} scaleX(-1)`;
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

    // sonido (RESPETA MUTE)
    if (!isMuted && clickSound) {
        clickSound.currentTime = 0;
        clickSound.volume = 0.5;
        clickSound.play().catch(() => { });
    }

    // rogreso
    discovered.add(id);

    if (discovered.size === TOTAL_OBJECTS) {
        setTimeout(() => {
            typeText("Has descubierto todo sobre mí 👀 Gracias por jugar!");
        }, 2000);
    }

    // reset mirada
    if (lookTimeout) clearTimeout(lookTimeout);

    lookTimeout = setTimeout(() => {
        lookAt("right");
    }, 2000);
}

function fadeLoop() {
    if (!bgMusic || isFading) return;

    isFading = true;

    const fadeSteps = 20;
    const stepTime = (FADE_DURATION * 1000) / fadeSteps;

    let currentStep = 0;

    const fadeOut = setInterval(() => {
        if (currentStep >= fadeSteps) {
            clearInterval(fadeOut);

            // reiniciar canción
            bgMusic.currentTime = 0;

            // resetear volumen a 0 antes de subir
            bgMusic.volume = 0;

            // fade in 
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

        // bajamos hacia 0 
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

/* ANIMACIÓN IDLE */
const frames = [
    "assets/idle_1.png",
    "assets/idle_2.png",
    "assets/idle_3.png",
    "assets/idle_4.png"
];

let frameIndex = 0;

setInterval(() => {
    character.src = frames[frameIndex];
    frameIndex = (frameIndex + 1) % frames.length;
}, 200);

/* INICIAR MÚSICA */
document.addEventListener("click", () => {
    if (bgMusic && bgMusic.paused) {
        bgMusic.volume = 0.4; // 🔥 mejor nivel
        bgMusic.play().catch(() => { });
    }
}, { once: true });

/* LOOP  */
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