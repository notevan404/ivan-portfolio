// En este array guardamos las opciones de la ruleta.
// Cada opción tendrá un id único y un nombre.
let options = []

// Aquí guardamos el historial de ganadores.
let historyEntries = []

// Esta variable guarda cuántos grados ha girado la ruleta en total.
let currentRotation = 0

// Esta variable nos dice si la ruleta está girando ahora mismo.
// La usamos para evitar doble clic en Spin.
let isSpinning = false

// Tiempo del giro en milisegundos (3 segundos).
const SPIN_DURATION = 3000

// Claves para guardar datos en localStorage.
const STORAGE_KEYS = {
    options: "decisionSpinner.options",
    history: "decisionSpinner.history"
}

// Colores que usamos para los sectores de la ruleta.
const wheelPalette = [
    "#ff5da2",
    "#57a6ff",
    "#72f1a7",
    "#ffe347",
    "#ff8a5b",
    "#8b7bff",
    "#00c2a8",
    "#ff6f91"
]

// Cogemos referencias a elementos del HTML para no repetir getElementById todo el rato.
const input = document.getElementById("optionInput")
const addButton = document.getElementById("addButton")
const spinButton = document.getElementById("spinButton")
const clearButton = document.getElementById("clearButton")
const optionsContainer = document.getElementById("options")
const wheel = document.getElementById("wheel")
const labelsContainer = document.getElementById("wheel-labels")
const legend = document.getElementById("wheelLegend")
const resultText = document.getElementById("result")
const historyList = document.getElementById("history")
const tickSound = document.getElementById("tickSound")

// Esta función crea un id único para cada opción.
// Así, si dos personas se llaman igual, no se rompe nada.
function createUniqueId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Esta función limpia texto: quita espacios de inicio y final.
function cleanText(text) {
    return String(text || "").trim()
}

// Guardamos opciones e historial en localStorage.
function saveState() {
    localStorage.setItem(STORAGE_KEYS.options, JSON.stringify(options))
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(historyEntries))
}

// Cargamos opciones e historial al abrir la página.
function loadState() {
    try {
        const savedOptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.options) || "[]")
        const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]")

        // Solo aceptamos datos con formato correcto.
        options = Array.isArray(savedOptions)
            ? savedOptions
                .map(item => ({ id: cleanText(item.id), name: cleanText(item.name) }))
                .filter(item => item.id !== "" && item.name !== "")
            : []

        historyEntries = Array.isArray(savedHistory)
            ? savedHistory.map(item => cleanText(item)).filter(item => item !== "")
            : []
    } catch (error) {
        // Si localStorage tiene datos raros, empezamos limpio.
        options = []
        historyEntries = []
    }
}

// Esta función pinta todas las chips de nombres arriba.
// También puede marcar una como ganadora.
function renderOptions(winnerId = "") {
    optionsContainer.innerHTML = ""

    options.forEach(option => {
        const tag = document.createElement("span")
        tag.className = "option-tag"

        if (option.id === winnerId) {
            tag.classList.add("winner")
        }

        const text = document.createElement("span")
        text.className = "option-text"
        text.textContent = option.name
        text.title = "Doble clic para editar"

        // Doble clic para cambiar nombre rápido.
        text.addEventListener("dblclick", () => {
            if (isSpinning) return

            const newName = prompt("Escribe el nuevo nombre", option.name)

            if (newName === null) return

            const cleanName = cleanText(newName)
            if (cleanName === "") return

            options = options.map(item => {
                if (item.id === option.id) {
                    return { ...item, name: cleanName }
                }
                return item
            })

            saveState()
            renderOptions(winnerId)
            drawWheel()
        })

        const removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.className = "option-remove"
        removeButton.textContent = "x"
        removeButton.setAttribute("aria-label", `Quitar ${option.name}`)

        // Botón pequeño para borrar solo esta opción.
        removeButton.addEventListener("click", () => {
            if (isSpinning) return
            removeOptionById(option.id)
        })

        tag.appendChild(text)
        tag.appendChild(removeButton)
        optionsContainer.appendChild(tag)
    })
}

// Esta función pinta el historial de decisiones.
function renderHistory() {
    historyList.innerHTML = ""

    historyEntries.forEach(entry => {
        const item = document.createElement("li")
        item.textContent = entry
        historyList.appendChild(item)
    })
}

// Activa o desactiva controles cuando gira la ruleta.
function setControlsDisabled(disabled) {
    isSpinning = disabled
    input.disabled = disabled
    addButton.disabled = disabled
    spinButton.disabled = disabled
    clearButton.disabled = disabled

    // Desactivamos también todos los botones de borrar chips.
    document.querySelectorAll(".option-remove").forEach(button => {
        button.disabled = disabled
    })
}

// Sonido seguro: si falta el mp3 o el navegador bloquea autoplay, no rompe nada.
function playTickSafe() {
    if (!tickSound || !tickSound.src) return

    tickSound.currentTime = 0
    tickSound.play().catch(() => {
        // Aquí no hacemos nada: si no puede sonar, seguimos normal.
    })
}

// Añade una opción nueva con id único.
function addOption() {
    if (isSpinning) return

    const value = cleanText(input.value)

    if (value === "") {
        input.focus()
        return
    }

    options.push({
        id: createUniqueId(),
        name: value
    })

    input.value = ""
    resultText.textContent = ""

    saveState()
    renderOptions()
    drawWheel()
}

// Borra una opción por id.
function removeOptionById(id) {
    options = options.filter(option => option.id !== id)

    saveState()
    renderOptions()
    drawWheel()
}

// Borra todas las opciones y limpia resultado.
function clearOptions() {
    if (isSpinning) return

    options = []
    resultText.textContent = ""

    saveState()
    renderOptions()
    drawWheel()
}

// Hace el giro y decide ganador.
function spinDecision() {
    if (isSpinning) return

    if (options.length === 0) {
        resultText.textContent = "Añade opciones primero"
        return
    }

    setControlsDisabled(true)
    renderOptions()
    resultText.textContent = "Girando..."

    // Empezamos sonido de "tic" mientras gira.
    const soundInterval = setInterval(() => {
        playTickSafe()
    }, 120)

    // Elegimos ganador al azar.
    const winnerIndex = Math.floor(Math.random() * options.length)
    const winnerOption = options[winnerIndex]

    // Calculamos dónde está el centro del sector ganador.
    const slice = 360 / options.length
    const winnerAngle = winnerIndex * slice + slice / 2

    // La flecha está arriba (0 grados), así que alineamos el giro a eso.
    const targetAngle = (360 - winnerAngle + 360) % 360
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360
    const deltaToTarget = (targetAngle - normalizedCurrent + 360) % 360

    // Le metemos 5 vueltas extra para que se vea más divertido.
    const spinRotation = 360 * 5 + deltaToTarget
    currentRotation += spinRotation

    wheel.style.transform = `rotate(${currentRotation}deg)`

    // Cuando termina el giro, marcamos ganador y guardamos historial.
    setTimeout(() => {
        clearInterval(soundInterval)

        renderOptions(winnerOption.id)
        resultText.textContent = `Decision: ${winnerOption.name}`

        historyEntries.unshift(winnerOption.name)

        // Dejamos el historial con máximo 20 elementos.
        historyEntries = historyEntries.slice(0, 20)

        saveState()
        renderHistory()
        setControlsDisabled(false)
    }, SPIN_DURATION)
}

// Dibuja la ruleta y los textos por sector.
function drawWheel() {
    labelsContainer.innerHTML = ""
    legend.innerHTML = ""

    if (options.length === 0) {
        wheel.style.background = "#1e293b"
        legend.classList.remove("is-visible")
        return
    }

    const slice = 360 / options.length
    const showLegend = options.length > 10
    const useVerticalLabels = options.length > 8 && options.length <= 14

    if (showLegend) {
        legend.classList.add("is-visible")
    } else {
        legend.classList.remove("is-visible")
    }

    let gradient = "conic-gradient("

    options.forEach((option, index) => {
        const start = slice * index
        const end = slice * (index + 1)
        const color = wheelPalette[index % wheelPalette.length]

        gradient += `${color} ${start}deg ${end}deg`
        if (index < options.length - 1) {
            gradient += ","
        }

        // Creamos la etiqueta visual del sector.
        const label = document.createElement("div")
        label.classList.add("wheel-label")
        if (useVerticalLabels) {
            label.classList.add("vertical")
        }

        const angle = start + slice / 2

        // Ajuste de distancia y tamaño según cantidad de opciones.
        const radius =
            options.length <= 3 ? 82 :
            options.length <= 6 ? 98 :
            options.length <= 10 ? 112 :
            options.length <= 14 ? 120 :
            126

        const approxArc = (2 * Math.PI * radius) * (slice / 360)
        const maxWidth =
            options.length <= 3
                ? Math.min(110, Math.floor(approxArc * 0.6))
                : Math.min(130, Math.floor(approxArc - 8))

        // Si hay muchas opciones, acortamos dentro de la ruleta.
        const wheelText =
            options.length <= 8 ? option.name :
            options.length <= 14 ? option.name.slice(0, 6) :
            String(index + 1)

        label.style.width = `${maxWidth}px`
        label.style.fontSize =
            options.length <= 3 ? "16px" :
            options.length <= 6 ? "14px" :
            options.length <= 10 ? "11px" :
            options.length <= 14 ? "10px" :
            "9px"
        label.textContent = wheelText

        // Pasamos el ángulo a coordenadas x/y para centrar mejor etiquetas.
        const radians = ((angle - 90) * Math.PI) / 180
        const x = Math.cos(radians) * radius
        const y = Math.sin(radians) * radius

        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        labelsContainer.appendChild(label)

        // Si hay demasiados nombres, mostramos leyenda completa abajo.
        if (showLegend) {
            const legendItem = document.createElement("div")
            legendItem.classList.add("legend-item")

            const dot = document.createElement("span")
            dot.classList.add("legend-dot")
            dot.style.backgroundColor = color

            const text = document.createElement("span")
            text.classList.add("legend-text")
            text.textContent = `${index + 1}. ${option.name}`

            legendItem.appendChild(dot)
            legendItem.appendChild(text)
            legend.appendChild(legendItem)
        }
    })

    gradient += ")"
    wheel.style.background = gradient
}

// Permite añadir opción con la tecla Enter.
input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault()
        addOption()
    }
})

// Cargamos datos guardados y pintamos todo al iniciar.
loadState()
renderOptions()
renderHistory()
drawWheel()