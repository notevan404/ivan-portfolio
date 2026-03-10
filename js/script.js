// Obtiene el botón que abre/cierra el menú móvil
const menuToggle = document.getElementById("menu-toggle");
// Obtiene el contenedor de enlaces de navegación
const navLinks = document.getElementById("nav-links");

// Solo ejecuta la lógica del menú si ambos elementos existen en el DOM
if (menuToggle && navLinks) {
	// Alterna el estado del menú al hacer clic en el botón
	menuToggle.addEventListener("click", () => {
		// Agrega o quita la clase "open" y guarda si quedó abierto
		const isOpen = navLinks.classList.toggle("open");
		// Actualiza atributo ARIA para accesibilidad (lectores de pantalla)
		menuToggle.setAttribute("aria-expanded", String(isOpen));
	});

	// Cierra el menú cuando se hace clic en cualquier enlace
	navLinks.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			// Remueve clase de menú abierto
			navLinks.classList.remove("open");
			// Refleja estado cerrado en atributo ARIA
			menuToggle.setAttribute("aria-expanded", "false");
		});
	});
}

// Selecciona todos los elementos que deben aparecer con animación al entrar en vista
const revealItems = document.querySelectorAll(".reveal");

// Usa IntersectionObserver si el navegador lo soporta y hay elementos para observar
if ("IntersectionObserver" in window && revealItems.length) {
	// Crea observador para detectar cuando los elementos entran en pantalla
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				// Si el elemento ya es visible en viewport
				if (entry.isIntersecting) {
					// Activa clase que dispara transición CSS
					entry.target.classList.add("is-visible");
					// Deja de observar ese elemento para optimizar rendimiento
					observer.unobserve(entry.target);
				}
			});
		},
		// Umbral: dispara cuando al menos 15% del elemento entra en pantalla
		{ threshold: 0.15 }
	);

	// Inicia observación sobre cada elemento con clase .reveal
	revealItems.forEach((item) => observer.observe(item));
} else {
	// Fallback: si no hay soporte, muestra todo sin animación por scroll
	revealItems.forEach((item) => item.classList.add("is-visible"));
}
