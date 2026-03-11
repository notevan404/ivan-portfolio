# Decision Spinner

Mini app para tomar decisiones al azar con una ruleta.

## Que hace
- Añades nombres/opciones.
- La ruleta gira y elige una opción al azar.
- Guarda opciones e historial aunque recargues la pagina (localStorage).
- Si hay muchos nombres, muestra leyenda para que se lea mejor.

## Detalles utiles
- Puedes borrar una opcion con el boton `x` de cada chip.
- Puedes editar un nombre con doble clic en el texto de la chip.
- Durante el giro, los controles se bloquean para evitar errores.
- Si no existe `tick.mp3`, la app sigue funcionando sin romperse.

## Estructura
- `index.html`: estructura y accesibilidad basica.
- `style.css`: estilos visuales y responsive.
- `script.js`: logica de ruleta, guardado y renderizado.

## Como usar
1. Escribe una opcion.
2. Pulsa `Add`.
3. Repite con varias opciones.
4. Pulsa `Spin` para elegir.

## Ideas para mejorar
- Boton para limpiar historial.
- Exportar historial a `.txt`.
- Sonidos y animaciones extra configurables.
