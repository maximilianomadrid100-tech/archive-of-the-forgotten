
/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NASA SPACE APPS CHALLENGE

   SCRIPT.JS — NEW VERSION

   PART 1:
   CONFIGURATION, VARIABLES, AND BASE FUNCTIONS
========================================================== */

"use strict";


/* ==========================================================
   1. GENERAL CONFIGURATION
========================================================== */

const CONFIGURACION = {
    nombreProyecto: "ARCHIVE OF THE FORGOTTEN",

    equipo: "LOS RATATOPOS MARCIANOS",

    totalObjetos: 24,

    objetosLuna: 12,

    objetosMarte: 12,

    porcentajeDescubrimientos: 90,

    porcentajeCuestionario: 10,

    duracionViaje: 2600,

    cantidadPreguntas: 10,

    sonidoInicial: false,

    animaciones: true,

    apiNASA: "https://images-api.nasa.gov/search"
};


/* ==========================================================
   2. HISTORICAL DATABASE

   The 24 objects will be added
   in the NEW PART 2.

   IMPORTANT:
   Do not declare ARCHIVO again.
========================================================== */

const ARCHIVO = [];


/* ==========================================================
   3. HISTORICAL DOSSIERS

   The individual stories of each
   mission will be added here.
========================================================== */

const DOSSIER = {};


/* ==========================================================
   4. QUIZ QUESTIONS

   These will be completed in the
   section dedicated to the space challenge.
========================================================== */

const PREGUNTAS = [];


/* ==========================================================
   5. GENERAL APPLICATION STATE
========================================================== */

const ESTADO = {

    // Navigation
    pantallaActual: "portada",

    seccionActual: "seleccionMundos",

    seccionAnterior: "seleccionMundos",

    viajeEnCurso: false,

    destinoActual: null,

    // Exploration
    objetoActual: null,

    descubiertos: new Set(),

    // Quiz
    preguntaActual: 0,

    aciertos: 0,

    respuestaSeleccionada: null,

    cuestionarioTerminado: false,

    mejorQuiz: 0,

    // Timelines
    mundoCronologia: "luna",

    // Comics
    paginaComic: 0,

    paginasComic: [],

    // NASA images
    cacheImagenes: new Map(),

    // Sound
    sonidoActivado:
        CONFIGURACION.sonidoInicial,

    contextoAudio: null,

    // Space scene
    escenaEspacial: null,

    // 3D planets
    escenaLuna: null,

    escenaMarte: null,

    // Assistant
    ratatopoAbierto: false,

    // Initialization
    aplicacionIniciada: false
};


/* ==========================================================
   6. HTML SELECTORS
========================================================== */

/**
 * Gets the first element that
 * matches a CSS selector.
 */
function $(selector) {
    return document.querySelector(selector);
}


/**
 * Gets all elements that
 * match a CSS selector.
 */
function $$(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


/* ==========================================================
   7. GENERAL UTILITIES
========================================================== */

/**
 * Keeps a number within
 * a specified range.
 */
function limitar(valor, minimo, maximo) {
    return Math.min(
        maximo,
        Math.max(minimo, valor)
    );
}


/**
 * Waits for a specified
 * number of milliseconds.
 */
function esperar(milisegundos) {
    return new Promise(resolve => {
        setTimeout(resolve, milisegundos);
    });
}


/**
 * Writes text into an element.
 *
 * Does not use innerHTML to prevent
 * text from being interpreted as HTML code.
 */
function escribirTexto(selector, texto) {
    const elemento = $(selector);

    if (!elemento) {
        return false;
    }

    elemento.textContent =
        String(texto ?? "");

    return true;
}


/**
 * Shows or hides an element.
 */
function establecerVisibilidad(
    selector,
    visible
) {
    const elemento = $(selector);

    if (!elemento) {
        return false;
    }

    elemento.hidden = !visible;

    return true;
}


/**
 * Creates an HTML element
 * with an optional class.
 */
function crearElemento(
    etiqueta,
    clase = "",
    texto = ""
) {
    const elemento =
        document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== "") {
        elemento.textContent = texto;
    }

    return elemento;
}


/* ==========================================================
   8. HISTORICAL ARCHIVE QUERIES
========================================================== */

/**
 * Searches for an object by its identifier.
 *
 * Examples:
 * luna-01
 * marte-12
 */
function obtenerObjeto(id) {
    return ARCHIVO.find(
        objeto => objeto.id === id
    ) || null;
}


/**
 * Returns the objects from a world.
 *
 * World:
 * "luna" or "marte"
 */
function obtenerObjetosMundo(mundo) {
    return ARCHIVO.filter(
        objeto => objeto.mundo === mundo
    );
}


/**
 * Gets the historical dossier
 * of an object.
 */
function obtenerDossier(id) {
    return DOSSIER[id] || null;
}


/**
 * Checks whether an object exists.
 */
function existeObjeto(id) {
    return obtenerObjeto(id) !== null;
}


/**
 * Counts the objects from each world.
 */
function contarObjetosMundo(mundo) {
    return obtenerObjetosMundo(mundo).length;
}


/* ==========================================================
   9. DISCOVERY SYSTEM
========================================================== */

/**
 * Checks whether an object has already
 * been recovered during this visit.
 */
function estaDescubierto(id) {
    return ESTADO.descubiertos.has(id);
}


/**
 * Counts the discovered objects
 * from a specific world.
 */
function contarDescubiertosMundo(mundo) {
    return obtenerObjetosMundo(mundo)
        .filter(objeto => {
            return estaDescubierto(objeto.id);
        })
        .length;
}


/**
 * Returns a summary of the exploration.
 */
function obtenerResumenExploracion() {
    const total = ARCHIVO.length;

    const descubiertos =
        ESTADO.descubiertos.size;

    return {
        total,

        descubiertos,

        pendientes:
            Math.max(0, total - descubiertos),

        luna:
            contarDescubiertosMundo("luna"),

        marte:
            contarDescubiertosMundo("marte")
    };
}


/* ==========================================================
   10. PROGRESS RESET

   FUNDAMENTAL RULE:

   Every time the page is reloaded,
   progress starts at 0%.

   NO localStorage.
   NO sessionStorage.
========================================================== */

function recuperarProgreso() {

    // Reset discoveries.
    ESTADO.descubiertos.clear();

    // Reset quiz.
    ESTADO.preguntaActual = 0;

    ESTADO.aciertos = 0;

    ESTADO.respuestaSeleccionada = null;

    ESTADO.cuestionarioTerminado = false;

    ESTADO.mejorQuiz = 0;

    // Reset historical record.
    ESTADO.objetoActual = null;

    // Reset comic.
    ESTADO.paginaComic = 0;

    ESTADO.paginasComic = [];

    // Reset navigation.
    ESTADO.seccionActual =
        "seleccionMundos";

    ESTADO.seccionAnterior =
        "seleccionMundos";

    console.log(
        "[ARCHIVO] Progress reset: 0%"
    );
}


/**
 * We do not save progress
 * in the browser.
 *
 * This function is kept for
 * compatibility with other modules.
 */
function guardarProgreso() {
    // Intentionally empty.
}


/* ==========================================================
   11. PROGRESS CALCULATION

   90% = 24 discoveries.
   10% = perfect quiz score.

   Maximum total: 100%.
========================================================== */

function calcularProgreso() {

    const totalObjetos =
        CONFIGURACION.totalObjetos;

    const cantidadDescubierta =
        ESTADO.descubiertos.size;

    const porcentajeObjetos =
        (
            cantidadDescubierta /
            totalObjetos
        ) *
        CONFIGURACION.porcentajeDescubrimientos;

    const porcentajeQuiz =
        (
            ESTADO.mejorQuiz /
            CONFIGURACION.cantidadPreguntas
        ) *
        CONFIGURACION.porcentajeCuestionario;

    return Math.round(
        limitar(
            porcentajeObjetos + porcentajeQuiz,
            0,
            100
        )
    );
}


/* ==========================================================
   12. UPDATE PROGRESS BAR
========================================================== */

function actualizarProgreso() {

    const porcentaje =
        calcularProgreso();

    const indicador =
        $("#porcentajeProgreso");

    const relleno =
        $("#rellenoProgreso");

    const texto =
        $("#textoProgreso");

    const barra =
        $(".barra-progreso");

    if (indicador) {
        indicador.textContent =
            `${porcentaje}%`;
    }

    if (relleno) {
        relleno.style.width =
            `${porcentaje}%`;
    }

    if (barra) {
        barra.setAttribute(
            "aria-valuenow",
            String(porcentaje)
        );
    }

    if (texto) {

        const cantidad =
            ESTADO.descubiertos.size;

        if (porcentaje === 100) {

            texto.textContent =
                "MISSION COMPLETED! " +
                "You have recovered all historical records " +
                "and completed the space challenge.";

        } else if (cantidad === 0) {

            texto.textContent =
                "Discover the objects in the archive " +
                "to begin your exploration.";

        } else {

            texto.textContent =
                `You have recovered ${cantidad} of ` +
                `${CONFIGURACION.totalObjetos} ` +
                "historical records.";
        }
    }

    return porcentaje;
}


/* ==========================================================
   13. EXPLORATION INDICATORS
========================================================== */

function actualizarIndicadoresExploracion() {

    const resumen =
        obtenerResumenExploracion();

    // These elements will be updated
    // if they exist in the HTML.

    escribirTexto(
        "#contadorDescubiertos",
        resumen.descubiertos
    );

    escribirTexto(
        "#contadorPendientes",
        resumen.pendientes
    );

    escribirTexto(
        "#contadorLuna",
        resumen.luna
    );

    escribirTexto(
        "#contadorMarte",
        resumen.marte
    );

    actualizarProgreso();
}


/* ==========================================================
   14. COORDINATE FORMATTING
========================================================== */

function formatearCoordenadas(
    latitud,
    longitud
) {

    if (
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud)
    ) {
        return "Coordinates unavailable";
    }

    const direccionLatitud =
        latitud >= 0 ? "N" : "S";

    const direccionLongitud =
        longitud >= 0 ? "E" : "W";

    return (
        `${Math.abs(latitud).toFixed(2)}° ` +
        `${direccionLatitud}, ` +
        `${Math.abs(longitud).toFixed(2)}° ` +
        direccionLongitud
    );
}


/* ==========================================================
   15. SAFE IMAGE CREATION
========================================================== */

function crearImagen(
    fuente,
    descripcion,
    clase = ""
) {

    const imagen =
        document.createElement("img");

    imagen.src = fuente;

    imagen.alt =
        descripcion || "Space image";

    imagen.loading = "lazy";

    imagen.decoding = "async";

    if (clase) {
        imagen.className = clase;
    }

    return imagen;
}


/* ==========================================================
   16. HTML ELEMENT VERIFICATION
========================================================== */

function verificarEstructuraHTML() {

    const elementosNecesarios = [
        "portada",
        "hiperespacio",
        "museo",
        "seleccionMundos",
        "vistaLuna",
        "vistaMarte",
        "lineasTiempo",
        "detalleObjeto",
        "comparacionMundos",
        "objetosOcultos",
        "cuestionario",
        "escena3d",
        "luna3d",
        "marte3d",
        "objetosLuna",
        "objetosMarte",
        "porcentajeProgreso",
        "rellenoProgreso",
        "botonInicio"
    ];

    const faltantes =
        elementosNecesarios.filter(id => {
            return !document.getElementById(id);
        });

    if (faltantes.length > 0) {

        console.warn(
            "[ARCHIVO] Missing HTML elements:",
            faltantes
        );

        return false;
    }

    console.log(
        "[ARCHIVO] Main HTML structure verified."
    );

    return true;
}


/* ==========================================================
   END OF NEW PART 1

   DO NOT ADD iniciarAplicacion() YET.

   Final initialization will be
   added once all museum modules
   are complete.
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 2
   THE 24 HISTORICAL OBJECTS

   IMPORTANT:
   ARCHIVO already exists from PART 1.
   Do not declare it again.
========================================================== */


/* ==========================================================
   17. THE 12 MOON RECORDS
========================================================== */

ARCHIVO.push(

    {
        id: "luna-01",
        mundo: "luna",
        nombre: "Luna 2",
        mision: "Luna 2",
        fecha: "September 13, 1959",
        ubicacion: "Palus Putredinis region",
        estado: "Impacted the surface",
        categoria: "First robotic arrival",
        lat: 29.1,
        lon: 0,
        icono: "☄️",
        descripcion:
            "The first human-made spacecraft " +
            "to reach the lunar surface.",
        historia:
            "Luna 2 was a Soviet Union mission. " +
            "It did not make a soft landing: it crashed " +
            "into the Moon and demonstrated that it was " +
            "possible to send a spacecraft to another " +
            "celestial body. Its arrival opened a new " +
            "chapter in space exploration."
    },

    {
        id: "luna-02",
        mundo: "luna",
        nombre: "Luna 9",
        mision: "Luna 9",
        fecha: "February 3, 1966",
        ubicacion: "Oceanus Procellarum",
        estado: "Mission completed",
        categoria: "Lander",
        lat: 7.1,
        lon: -64.4,
        icono: "📡",
        descripcion:
            "The first spacecraft to make a " +
            "soft landing on the Moon.",
        historia:
            "Luna 9, from the Soviet Union, sent " +
            "photographs from the lunar surface. " +
            "Its images helped confirm that " +
            "the terrain could support a spacecraft, " +
            "a fundamental step before " +
            "crewed missions."
    },

    {
        id: "luna-03",
        mundo: "luna",
        nombre: "Surveyor 1",
        mision: "Surveyor 1",
        fecha: "June 2, 1966",
        ubicacion: "Oceanus Procellarum",
        estado: "Mission completed",
        categoria: "NASA lander",
        lat: -2.5,
        lon: -43.3,
        icono: "📷",
        descripcion:
            "The first American soft landing " +
            "on the Moon.",
        historia:
            "Surveyor 1 made it possible to study " +
            "the lunar surface directly. It transmitted " +
            "thousands of photographs and helped prepare " +
            "for future astronaut landings during " +
            "the Apollo program."
    },

    {
        id: "luna-04",
        mundo: "luna",
        nombre: "Apollo 11: Eagle",
        mision: "Apollo 11",
        fecha: "July 20, 1969",
        ubicacion: "Mare Tranquillitatis",
        estado:
            "Descent stage remains on the Moon",
        categoria: "Lunar module",
        lat: 0.674,
        lon: 23.473,
        icono: "🛬",
        descripcion:
            "The descent stage of the first lunar module " +
            "to carry humans to the Moon.",
        historia:
            "Neil Armstrong and Buzz Aldrin landed " +
            "in the Eagle module. After exploring " +
            "the surface, they lifted off in the " +
            "ascent stage, while the descent stage " +
            "remained on the Moon as a reminder " +
            "of the first human visit."
    },

    {
        id: "luna-05",
        mundo: "luna",
        nombre: "Apollo 11: retroreflector",
        mision: "Apollo 11",
        fecha: "July 21, 1969",
        ubicacion: "Mare Tranquillitatis",
        estado:
            "Passive experiment on the surface",
        categoria: "Scientific instrument",
        lat: 0.674,
        lon: 23.473,
        icono: "🔬",
        descripcion:
            "An array of reflectors used to " +
            "measure the distance between Earth and the Moon.",
        historia:
            "The Apollo 11 astronauts installed " +
            "a laser retroreflector. Observatories " +
            "on Earth can send pulses of light " +
            "and analyze their return to measure " +
            "the distance to the Moon with " +
            "extremely high precision."
    },

    {
        id: "luna-06",
        mundo: "luna",
        nombre: "Apollo 12: Intrepid",
        mision: "Apollo 12",
        fecha: "November 19, 1969",
        ubicacion: "Oceanus Procellarum",
        estado:
            "Descent stage remains on the Moon",
        categoria: "Lunar module",
        lat: -3.012,
        lon: -23.421,
        icono: "🛬",
        descripcion:
            "The lunar module of the second mission " +
            "to carry humans to the surface.",
        historia:
            "Pete Conrad and Alan Bean landed " +
            "near Surveyor 3. Apollo 12 demonstrated " +
            "the ability to perform a precision landing " +
            "and recover components from " +
            "an earlier robotic spacecraft."
    },

    {
        id: "luna-07",
        mundo: "luna",
        nombre: "Surveyor 3",
        mision: "Surveyor 3 / Apollo 12",
        fecha: "April 20, 1967",
        ubicacion: "Oceanus Procellarum",
        estado: "Remains on the Moon",
        categoria: "Robotic lander",
        lat: -3.016,
        lon: -23.417,
        icono: "📡",
        descripcion:
            "A probe visited by astronauts more than " +
            "two years after its landing.",
        historia:
            "Surveyor 3 landed in 1967. During " +
            "Apollo 12, the astronauts walked " +
            "to the spacecraft, removed some components, " +
            "and brought them back to Earth to study " +
            "how they had endured the lunar environment."
    },

    {
        id: "luna-08",
        mundo: "luna",
        nombre: "Lunokhod 1",
        mision: "Luna 17",
        fecha: "November 17, 1970",
        ubicacion: "Mare Imbrium",
        estado: "Inactive rover",
        categoria: "Lunar vehicle",
        lat: 38.3,
        lon: -35,
        icono: "🛞",
        descripcion:
            "One of the first robotic vehicles " +
            "to travel across another world.",
        historia:
            "Lunokhod 1, from the Soviet Union, " +
            "explored the Moon for several months. " +
            "Its wheels left tracks in the " +
            "regolith, and its instruments made " +
            "observations of the surface."
    },

    {
        id: "luna-09",
        mundo: "luna",
        nombre: "Apollo 14: Antares",
        mision: "Apollo 14",
        fecha: "February 5, 1971",
        ubicacion: "Fra Mauro",
        estado:
            "Descent stage remains on the Moon",
        categoria: "Lunar module",
        lat: -3.646,
        lon: -17.472,
        icono: "🛬",
        descripcion:
            "The landing module of the Apollo 14 mission.",
        historia:
            "Alan Shepard and Edgar Mitchell explored " +
            "the Fra Mauro region. They used a " +
            "handcart to transport instruments " +
            "and samples, leaving scientific equipment " +
            "and the descent stage on the surface."
    },

    {
        id: "luna-10",
        mundo: "luna",
        nombre: "Apollo 15: lunar rover",
        mision: "Apollo 15",
        fecha: "July 30, 1971",
        ubicacion: "Hadley-Apennine",
        estado:
            "Vehicle parked on the Moon",
        categoria: "Lunar vehicle",
        lat: 26.132,
        lon: 3.634,
        icono: "🚙",
        descripcion:
            "The first lunar vehicle driven " +
            "by astronauts.",
        historia:
            "David Scott and James Irwin used " +
            "the Lunar Roving Vehicle to travel " +
            "greater distances than on previous " +
            "missions. The vehicle remained on the Moon " +
            "when the astronauts returned " +
            "to Earth."
    },

    {
        id: "luna-11",
        mundo: "luna",
        nombre: "Apollo 16: lunar rover",
        mision: "Apollo 16",
        fecha: "April 21, 1972",
        ubicacion: "Descartes Highlands",
        estado:
            "Vehicle parked on the Moon",
        categoria: "Lunar vehicle",
        lat: -8.973,
        lon: 15.501,
        icono: "🚙",
        descripcion:
            "A vehicle that made it possible to explore " +
            "the lunar highlands.",
        historia:
            "John Young and Charles Duke used " +
            "the Apollo 16 rover to transport " +
            "instruments, explore geological " +
            "formations, and collect samples. " +
            "The vehicle remains near " +
            "the landing site."
    },

    {
        id: "luna-12",
        mundo: "luna",
        nombre: "Apollo 17: lunar rover",
        mision: "Apollo 17",
        fecha: "December 11, 1972",
        ubicacion: "Taurus-Littrow",
        estado:
            "Vehicle parked on the Moon",
        categoria: "Lunar vehicle",
        lat: 20.191,
        lon: 30.772,
        icono: "🚙",
        descripcion:
            "The vehicle from the last Apollo mission " +
            "to carry humans to the Moon.",
        historia:
            "Gene Cernan and Harrison Schmitt traveled " +
            "through the Taurus-Littrow valley in " +
            "December 1972. Their rover remains there, " +
            "along with other scientific equipment " +
            "and traces of the expedition."
    }

);


/* ==========================================================
   18. THE 12 MARS RECORDS
========================================================== */

ARCHIVO.push(

    {
        id: "marte-01",
        mundo: "marte",
        nombre: "Mars 2",
        mision: "Mars 2",
        fecha: "November 27, 1971",
        ubicacion: "Approximate impact region",
        estado: "Impacted Mars",
        categoria: "Soviet probe",
        lat: -45,
        lon: 313,
        icono: "☄️",
        descripcion:
            "The first human-made object " +
            "to reach the Martian surface.",
        historia:
            "The Mars 2 descent module failed " +
            "to land in a controlled manner. Even so, " +
            "its arrival marked a historic moment: " +
            "a human-made spacecraft had reached Mars. " +
            "The exact impact location " +
            "has not been confirmed."
    },

    {
        id: "marte-02",
        mundo: "marte",
        nombre: "Mars 3",
        mision: "Mars 3",
        fecha: "December 2, 1971",
        ubicacion: "Martian southern hemisphere",
        estado: "Mission completed",
        categoria: "Soviet lander",
        lat: -45,
        lon: 202,
        icono: "📡",
        descripcion:
            "The first spacecraft to achieve " +
            "a soft landing on Mars.",
        historia:
            "Mars 3 reached the surface and began " +
            "transmitting, but the signal was interrupted " +
            "shortly afterward. Although it did not " +
            "complete its objectives, it demonstrated " +
            "that a soft landing on Mars was possible. " +
            "Its location is approximate."
    },

    {
        id: "marte-03",
        mundo: "marte",
        nombre: "Viking 1",
        mision: "Viking 1",
        fecha: "July 20, 1976",
        ubicacion: "Chryse Planitia",
        estado: "Inactive lander",
        categoria: "NASA lander",
        lat: 22.48,
        lon: -49.97,
        icono: "🛬",
        descripcion:
            "The first successful American lander " +
            "on Mars.",
        historia:
            "Viking 1 sent photographs and conducted " +
            "experiments to investigate the soil " +
            "and atmosphere. It operated for years and " +
            "provided some of the first " +
            "long-term observations of the " +
            "Martian surface."
    },

    {
        id: "marte-04",
        mundo: "marte",
        nombre: "Viking 2",
        mision: "Viking 2",
        fecha: "September 3, 1976",
        ubicacion: "Utopia Planitia",
        estado: "Inactive lander",
        categoria: "NASA lander",
        lat: 47.97,
        lon: 134.25,
        icono: "🛬",
        descripcion:
            "The second exploration station " +
            "of the Viking program.",
        historia:
            "Viking 2 investigated a different region " +
            "of Mars. Its cameras and sensors provided " +
            "data about the climate, soil, and " +
            "surface conditions."
    },

    {
        id: "marte-05",
        mundo: "marte",
        nombre: "Mars Pathfinder",
        mision: "Mars Pathfinder",
        fecha: "July 4, 1997",
        ubicacion: "Ares Vallis",
        estado: "Inactive lander",
        categoria: "NASA lander",
        lat: 19.13,
        lon: -33.22,
        icono: "🛬",
        descripcion:
            "The landing platform that carried " +
            "the Sojourner rover.",
        historia:
            "Pathfinder used airbags " +
            "to cushion its arrival. Its platform " +
            "transmitted images and weather data " +
            "while Sojourner explored the " +
            "nearby terrain."
    },

    {
        id: "marte-06",
        mundo: "marte",
        nombre: "Sojourner",
        mision: "Mars Pathfinder",
        fecha: "July 4, 1997",
        ubicacion: "Ares Vallis",
        estado: "Inactive rover",
        categoria: "First NASA rover on Mars",
        lat: 19.13,
        lon: -33.22,
        icono: "🤖",
        descripcion:
            "NASA's first robotic vehicle " +
            "to travel across Mars.",
        historia:
            "Sojourner was a small six-wheeled " +
            "rover. It analyzed rocks and demonstrated " +
            "that a mobile vehicle could explore " +
            "Mars effectively. Its mission " +
            "paved the way for much larger rovers."
    },

    {
        id: "marte-07",
        mundo: "marte",
        nombre: "Spirit",
        mision: "Mars Exploration Rover",
        fecha: "January 4, 2004",
        ubicacion: "Gusev Crater",
        estado: "Inactive rover",
        categoria: "NASA rover",
        lat: -14.57,
        lon: 175.48,
        icono: "🤖",
        descripcion:
            "A rover that explored Mars for " +
            "more than six years.",
        historia:
            "Spirit found evidence of processes " +
            "related to water in the Martian " +
            "past. It eventually became trapped " +
            "in sandy terrain and lost contact, " +
            "but it far exceeded the planned " +
            "duration of its mission."
    },

    {
        id: "marte-08",
        mundo: "marte",
        nombre: "Opportunity",
        mision: "Mars Exploration Rover",
        fecha: "January 25, 2004",
        ubicacion: "Meridiani Planum",
        estado: "Inactive rover",
        categoria: "NASA rover",
        lat: -1.95,
        lon: -5.53,
        icono: "🤖",
        descripcion:
            "A rover that operated for nearly " +
            "fifteen years on Mars.",
        historia:
            "Opportunity found minerals that " +
            "helped reconstruct Mars's wet " +
            "past. It traveled more than 45 kilometers " +
            "and stopped communicating after a major " +
            "dust storm in 2018."
    },

    {
        id: "marte-09",
        mundo: "marte",
        nombre: "Phoenix",
        mision: "Phoenix Mars Lander",
        fecha: "May 25, 2008",
        ubicacion: "Vastitas Borealis",
        estado: "Inactive lander",
        categoria: "Polar lander",
        lat: 68.22,
        lon: -125.75,
        icono: "❄️",
        descripcion:
            "A mission that studied water ice " +
            "near the north pole.",
        historia:
            "Phoenix dug into the Martian soil with " +
            "a robotic arm and confirmed the presence " +
            "of water ice. Its observations " +
            "helped scientists better understand the " +
            "polar environment of Mars."
    },

    {
        id: "marte-10",
        mundo: "marte",
        nombre: "Curiosity",
        mision: "Mars Science Laboratory",
        fecha: "August 6, 2012",
        ubicacion: "Gale Crater",
        estado:
            "Active mission according to recent historical data",
        categoria: "NASA rover",
        lat: -4.59,
        lon: 137.44,
        icono: "🔬",
        descripcion:
            "A mobile laboratory studying " +
            "the ancient habitability of Mars.",
        historia:
            "Curiosity investigates rocks and sediments " +
            "to understand whether Mars may once have " +
            "had conditions favorable for " +
            "microbial life. It is included as a " +
            "historical explorer, not as an abandoned object."
    },

    {
        id: "marte-11",
        mundo: "marte",
        nombre: "InSight",
        mision: "InSight",
        fecha: "November 26, 2018",
        ubicacion: "Elysium Planitia",
        estado: "Mission ended in 2022",
        categoria: "Geophysical lander",
        lat: 4.5,
        lon: 135.6,
        icono: "📡",
        descripcion:
            "A station that studied the interior " +
            "of Mars through seismic activity.",
        historia:
            "InSight used a seismometer to " +
            "record Martian earthquakes. " +
            "Its data helped scientists study the " +
            "crust, mantle, and core of Mars. " +
            "The mission ended when dust " +
            "reduced the available power."
    },

    {
        id: "marte-12",
        mundo: "marte",
        nombre: "Ingenuity",
        mision: "Mars 2020",
        fecha: "April 19, 2021",
        ubicacion: "Jezero Crater",
        estado: "Flights ended in 2024",
        categoria: "NASA helicopter",
        lat: 18.44,
        lon: 77.45,
        icono: "🚁",
        descripcion:
            "The first vehicle to perform " +
            "controlled flights on another planet.",
        historia:
            "Ingenuity demonstrated that it was possible " +
            "to fly in the thin atmosphere of Mars. " +
            "It completed 72 flights before suffering damage " +
            "to its rotor blades. Its resting place is " +
            "inside Jezero Crater; the marker " +
            "represents a region, not an exact position."
    }

);


/* ==========================================================
   19. HISTORICAL ARCHIVE VERIFICATION
========================================================== */

/**
 * Checks that there are:
 * - 24 objects in total
 * - 12 lunar objects
 * - 12 Martian objects
 * - 24 different identifiers
 */
function verificarArchivoHistorico() {

    const total = ARCHIVO.length;

    const luna =
        obtenerObjetosMundo("luna").length;

    const marte =
        obtenerObjetosMundo("marte").length;

    const identificadores =
        ARCHIVO.map(objeto => objeto.id);

    const identificadoresUnicos =
        new Set(identificadores);

    const correcto =
        total === CONFIGURACION.totalObjetos &&
        luna === CONFIGURACION.objetosLuna &&
        marte === CONFIGURACION.objetosMarte &&
        identificadoresUnicos.size === total;

    if (!correcto) {

        console.error(
            "[ARCHIVO] Error in the historical database.",
            {
                total,
                luna,
                marte,
                identificadoresUnicos:
                    identificadoresUnicos.size
            }
        );

        return false;
    }

    console.log(
        "[ARCHIVO] Historical database verified: " +
        "12 lunar objects and 12 Martian objects."
    );

    return true;
}


/* ==========================================================
   END OF NEW PART 2
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 3
   NAVIGATION AND SPACE TRAVEL

   Compatible with PARTS 1 and 2.
========================================================== */


/* ==========================================================
   20. MAIN SCREENS
========================================================== */

const PANTALLAS_MUSEO = [
    "portada",
    "hiperespacio",
    "museo"
];

const SECCIONES_MUSEO = [
    "seleccionMundos",
    "vistaLuna",
    "vistaMarte",
    "lineasTiempo",
    "detalleObjeto",
    "comparacionMundos",
    "objetosOcultos",
    "cuestionario"
];


/**
 * Switches between the three main screens.
 *
 * The original CSS uses .pantalla.activa
 * to control their visibility.
 */
function mostrarPantalla(idPantalla) {
    if (!PANTALLAS_MUSEO.includes(idPantalla)) {
        console.warn(
            "[ARCHIVO] Unknown screen:",
            idPantalla
        );
        return false;
    }

    const destino = document.getElementById(idPantalla);

    if (!destino) {
        console.warn(
            "[ARCHIVO] Screen does not exist:",
            idPantalla
        );
        return false;
    }

    PANTALLAS_MUSEO.forEach(id => {
        const pantalla = document.getElementById(id);

        if (!pantalla) return;

        const activa = id === idPantalla;

        pantalla.classList.toggle("activa", activa);

        // CSS controls display through .activa.
        // We do not use hidden here to avoid conflicts.
        pantalla.setAttribute(
            "aria-hidden",
            String(!activa)
        );
    });

    ESTADO.pantallaActual = idPantalla;

    return true;
}


/* ==========================================================
   21. INTERNAL MUSEUM NAVIGATION
========================================================== */

/**
 * Displays only one museum section.
 *
 * Keeps the other sections hidden
 * using the hidden attribute.
 */
function mostrarSeccion(idSeccion) {
    if (!SECCIONES_MUSEO.includes(idSeccion)) {
        console.warn(
            "[ARCHIVO] Unknown section:",
            idSeccion
        );
        return false;
    }

    const destino = document.getElementById(idSeccion);

    if (!destino) {
        console.warn(
            "[ARCHIVO] Section does not exist:",
            idSeccion
        );
        return false;
    }

    if (ESTADO.seccionActual !== idSeccion) {
        ESTADO.seccionAnterior =
            ESTADO.seccionActual;
    }

    SECCIONES_MUSEO.forEach(id => {
        const seccion = document.getElementById(id);

        if (!seccion) return;

        const visible = id === idSeccion;

        seccion.hidden = !visible;

        seccion.classList.toggle(
            "seccion-activa",
            visible
        );
    });

    ESTADO.seccionActual = idSeccion;

    // The museum must be visible before
    // displaying any of its sections.
    mostrarPantalla("museo");

    actualizarNavegacionActiva();

    actualizarContenidoSeccion(idSeccion);

    // Return to the beginning of the section.
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    return true;
}


/* ==========================================================
   22. UPDATE NAVIGATION BUTTONS
========================================================== */

function actualizarNavegacionActiva() {
    const botones = $$(
        ".navegacion-museo [data-ir]"
    );

    botones.forEach(boton => {
        const destino = boton.dataset.ir;

        const activo =
            destino === ESTADO.seccionActual;

        boton.classList.toggle(
            "activo",
            activo
        );

        if (activo) {
            boton.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            boton.removeAttribute(
                "aria-current"
            );
        }
    });
}


/* ==========================================================
   23. UPDATE CONTENT DURING NAVIGATION

   The following parts will add
   the card, timeline, inventory,
   and quiz functions here.

   We use checks to ensure navigation
   does not fail while we continue
   building the project.
========================================================== */

function actualizarContenidoSeccion(idSeccion) {
    switch (idSeccion) {

        case "vistaLuna":
        case "vistaMarte":

            if (
                typeof dibujarTarjetasMundo ===
                "function"
            ) {
                dibujarTarjetasMundo(
                    idSeccion === "vistaLuna"
                        ? "luna"
                        : "marte"
                );
            }

            break;

        case "lineasTiempo":

            if (
                typeof dibujarCronologias ===
                "function"
            ) {
                dibujarCronologias();
            }

            break;

        case "comparacionMundos":

            if (
                typeof actualizarComparacion ===
                "function"
            ) {
                actualizarComparacion();
            }

            break;

        case "objetosOcultos":

            if (
                typeof actualizarObjetosOcultos ===
                "function"
            ) {
                actualizarObjetosOcultos();
            }

            break;

        case "cuestionario":

            if (
                typeof actualizarVistaCuestionario ===
                "function"
            ) {
                actualizarVistaCuestionario();
            }

            break;
    }

    if (
        typeof orientarRatatopo === "function"
    ) {
        orientarRatatopo(idSeccion);
    }
}


/* ==========================================================
   24. NAVIGATION THROUGH data-ir BUTTONS

   Actual examples from your HTML:

   data-ir="vistaLuna"
   data-ir="vistaMarte"
   data-ir="lineasTiempo"
   data-ir="seleccionMundos"
========================================================== */

function prepararNavegacion() {
    const botones = $$("[data-ir]");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const destino = boton.dataset.ir;

            if (!SECCIONES_MUSEO.includes(destino)) {
                return;
            }

            // Buttons leading to a timeline
            // also specify the world.
            if (destino === "lineasTiempo") {
                const mundo =
                    boton.dataset.destinoTiempo;

                if (
                    mundo === "luna" ||
                    mundo === "marte"
                ) {
                    ESTADO.mundoCronologia = mundo;
                }
            }

            if (destino === "vistaLuna") {
                abrirExploradorLunar();
                return;
            }

            if (destino === "vistaMarte") {
                abrirExploradorMarciano();
                return;
            }

            mostrarSeccion(destino);
        });
    });

    actualizarNavegacionActiva();

    console.log(
        "[ARCHIVO] Navigation prepared:",
        botones.length,
        "buttons."
    );
}


/* ==========================================================
   25. SPACESHIP DESTINATIONS
========================================================== */

const DESTINOS_ESPACIALES = {
    museo: {
        nombre: "INTERPLANETARY ARCHIVE",
        seccion: "seleccionMundos"
    },

    luna: {
        nombre: "THE MOON",
        seccion: "vistaLuna"
    },

    marte: {
        nombre: "MARS",
        seccion: "vistaMarte"
    }
};


/**
 * Updates the destination indicator
 * displayed in the spaceship interface.
 */
function actualizarDestinoNave(destino) {
    const datos = DESTINOS_ESPACIALES[destino];

    if (!datos) return;

    escribirTexto(
        "#destinoNave",
        `DESTINATION: ${datos.nombre}`
    );
}


/* ==========================================================
   26. HYPERSPACE MESSAGES
========================================================== */

const MENSAJES_HIPERESPACIO = [
    "ACTIVATING PROPULSION SYSTEMS...",
    "CALCULATING SPACE TRAJECTORY...",
    "STABILIZING NAVIGATION FIELD...",
    "ACCESSING THE INTERPLANETARY ARCHIVE...",
    "PREPARING FOR ARRIVAL..."
];


/**
 * Displays the travel messages.
 *
 * The total duration depends on
 * CONFIGURACION.duracionViaje.
 */
async function reproducirMensajesViaje() {
    const duracion =
        CONFIGURACION.duracionViaje;

    const intervalo =
        duracion / MENSAJES_HIPERESPACIO.length;

    for (const mensaje of MENSAJES_HIPERESPACIO) {
        escribirTexto("#mensajeViaje", mensaje);

        await esperar(intervalo);
    }
}


/* ==========================================================
   27. HYPERSPACE JUMP
========================================================== */

/**
 * Starts a journey to:
 * - museo
 * - luna
 * - marte
 *
 * Prevents multiple journeys from
 * running at the same time.
 */
async function iniciarViaje(destino = "museo") {
    if (ESTADO.viajeEnCurso) {
        return false;
    }

    const datos = DESTINOS_ESPACIALES[destino];

    if (!datos) {
        console.warn(
            "[ARCHIVO] Unknown space destination:",
            destino
        );
        return false;
    }

    ESTADO.viajeEnCurso = true;
    ESTADO.destinoActual = destino;

    const botonInicio = $("#botonInicio");

    if (botonInicio) {
        botonInicio.disabled = true;
    }

    try {
        actualizarDestinoNave(destino);

        mostrarPantalla("hiperespacio");

        escribirTexto(
            "#mensajeViaje",
            "INITIATING HYPERSPACE JUMP..."
        );

        // The 3D engine will be added
        // in a later part.
        if (
            typeof establecerHiperespacio ===
            "function"
        ) {
            establecerHiperespacio(true);
        }

        if (
            typeof sonidoInicioViaje ===
            "function"
        ) {
            sonidoInicioViaje();
        }

        await reproducirMensajesViaje();

        if (
            typeof establecerHiperespacio ===
            "function"
        ) {
            establecerHiperespacio(false);
        }

        if (
            typeof sonidoLlegada === "function"
        ) {
            sonidoLlegada();
        }

        mostrarSeccion(datos.seccion);

        escribirTexto(
            "#mensajeViaje",
            "DESTINATION REACHED"
        );

        return true;

    } catch (error) {
        console.error(
            "[ARCHIVO] Error during the journey:",
            error
        );

        mostrarSeccion("seleccionMundos");

        return false;

    } finally {
        ESTADO.viajeEnCurso = false;

        if (botonInicio) {
            botonInicio.disabled = false;
        }

        if (
            typeof establecerHiperespacio ===
            "function"
        ) {
            establecerHiperespacio(false);
        }
    }
}


/* ==========================================================
   28. LUNAR EXPLORATION
========================================================== */

function abrirExploradorLunar() {
    if (ESTADO.viajeEnCurso) {
        return;
    }

    ESTADO.destinoActual = "luna";

    actualizarDestinoNave("luna");

    mostrarSeccion("vistaLuna");

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   29. MARTIAN EXPLORATION
========================================================== */

function abrirExploradorMarciano() {
    if (ESTADO.viajeEnCurso) {
        return;
    }

    ESTADO.destinoActual = "marte";

    actualizarDestinoNave("marte");

    mostrarSeccion("vistaMarte");

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   30. RETURN TO WORLD SELECTION
========================================================== */

function regresarSeleccionMundos() {
    ESTADO.destinoActual = "museo";

    actualizarDestinoNave("museo");

    mostrarSeccion("seleccionMundos");
}


/* ==========================================================
   31. OPEN A TIMELINE
========================================================== */

function abrirCronologiaMundo(mundo) {
    if (
        mundo !== "luna" &&
        mundo !== "marte"
    ) {
        return false;
    }

    ESTADO.mundoCronologia = mundo;

    const resultado =
        mostrarSeccion("lineasTiempo");

    if (
        resultado &&
        typeof seleccionarMundoCronologia ===
        "function"
    ) {
        seleccionarMundoCronologia(mundo);
    }

    return resultado;
}


/* ==========================================================
   32. PREPARE START BUTTON
========================================================== */

function prepararBotonInicio() {
    const boton = $("#botonInicio");

    if (!boton) {
        console.warn(
            "[ARCHIVO] #botonInicio does not exist."
        );
        return;
    }

    boton.addEventListener("click", () => {
        iniciarViaje("museo");
    });

    console.log(
        "[ARCHIVO] Start button prepared."
    );
}


/* ==========================================================
   33. GENERAL NAVIGATION SETUP

   This will be called only once from
   iniciarAplicacion() during final integration.
========================================================== */

function prepararSistemaNavegacion() {
    prepararNavegacion();

    prepararBotonInicio();

    actualizarDestinoNave("museo");

    // Ensure the museum starts by
    // displaying the world selection.
    SECCIONES_MUSEO.forEach(id => {
        const seccion = document.getElementById(id);

        if (!seccion) return;

        seccion.hidden =
            id !== "seleccionMundos";
    });

    ESTADO.seccionActual =
        "seleccionMundos";

    ESTADO.seccionAnterior =
        "seleccionMundos";

    mostrarPantalla("portada");

    console.log(
        "[ARCHIVO] Navigation system ready."
    );
}


/* ==========================================================
   END OF NEW PART 3
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 4

   EXPLORATION AND DISCOVERIES

   Compatible with PARTS 1, 2, and 3.

   Does not use localStorage or sessionStorage.
========================================================== */


/* ==========================================================
   34. EXPLORATION CONFIGURATION
========================================================== */

const CONFIGURACION_EXPLORACION = {
    luna: {
        nombre: "MOON",
        icono: "🌕",
        tarjetas: "#objetosLuna",
        marcadores: "#marcadoresLuna",
        seccion: "vistaLuna"
    },

    marte: {
        nombre: "MARS",
        icono: "🔴",
        tarjetas: "#objetosMarte",
        marcadores: "#marcadoresMarte",
        seccion: "vistaMarte"
    }
};


/* ==========================================================
   35. VALIDATE IDENTIFIERS
========================================================== */

/**
 * Interaction is only allowed with
 * records that exist in ARCHIVO.
 */
function validarIdObjeto(id) {
    return (
        typeof id === "string" &&
        existeObjeto(id)
    );
}


/* ==========================================================
   36. CREATE HISTORICAL CARDS
========================================================== */

/**
 * Creates a card for an object.
 *
 * In PART 5, we will add
 * real NASA photographs.
 *
 * For now, we display the icon
 * corresponding to each mission.
 */
function crearTarjetaObjeto(objeto) {

    const descubierto =
        estaDescubierto(objeto.id);

    const tarjeta =
        crearElemento(
            "article",
            "tarjeta-objeto"
        );

    tarjeta.dataset.objeto = objeto.id;
    tarjeta.dataset.mundo = objeto.mundo;

    tarjeta.classList.toggle(
        "descubierto",
        descubierto
    );

    // ----------------------------------------
    // Image or representation
    // ----------------------------------------

    const imagen =
        crearElemento(
            "div",
            "imagen-tarjeta-objeto"
        );

    const representacion =
        crearElemento(
            "span",
            "icono-objeto",
            objeto.icono || "🛰️"
        );

    representacion.setAttribute(
        "aria-hidden",
        "true"
    );

    imagen.appendChild(representacion);

    // ----------------------------------------
    // Information
    // ----------------------------------------

    const contenido =
        crearElemento(
            "div",
            "contenido-tarjeta-objeto"
        );

    const categoria =
        crearElemento(
            "span",
            "categoria-tarjeta",
            objeto.categoria
        );

    const nombre =
        crearElemento(
            "h4",
            "nombre-tarjeta",
            objeto.nombre
        );

    const mision =
        crearElemento(
            "p",
            "mision-tarjeta",
            objeto.mision
        );

    const descripcion =
        crearElemento(
            "p",
            "descripcion-tarjeta",
            objeto.descripcion
        );

    const estado =
        crearElemento(
            "span",
            "estado-tarjeta"
        );

    estado.textContent = descubierto
        ? "✓ DISCOVERED"
        : "○ PENDING";

    estado.classList.toggle(
        "estado-descubierto",
        descubierto
    );

    // ----------------------------------------
    // Button to open the historical record
    // ----------------------------------------

    const boton =
        crearElemento(
            "button",
            "boton-ver-objeto",
            "EXPLORE RECORD"
        );

    boton.type = "button";

    boton.setAttribute(
        "aria-label",
        `Explore the record of ${objeto.nombre}`
    );

    boton.addEventListener("click", () => {
        solicitarAperturaObjeto(objeto.id);
    });

    contenido.append(
        categoria,
        nombre,
        mision,
        descripcion,
        estado,
        boton
    );

    tarjeta.append(imagen, contenido);

    return tarjeta;
}


/* ==========================================================
   37. RENDER CARDS FOR A WORLD
========================================================== */

function dibujarTarjetasMundo(mundo) {

    const configuracion =
        CONFIGURACION_EXPLORACION[mundo];

    if (!configuracion) {
        console.warn(
            "[ARCHIVO] Unknown world:",
            mundo
        );
        return false;
    }

    const contenedor =
        $(configuracion.tarjetas);

    if (!contenedor) {
        console.warn(
            "[ARCHIVO] Missing container:",
            configuracion.tarjetas
        );
        return false;
    }

    const objetos =
        obtenerObjetosMundo(mundo);

    const fragmento =
        document.createDocumentFragment();

    objetos.forEach(objeto => {
        fragmento.appendChild(
            crearTarjetaObjeto(objeto)
        );
    });

    // Replace previous cards
    // to avoid duplicates.
    contenedor.replaceChildren(fragmento);

    console.log(
        `[ARCHIVO] ${objetos.length} cards ` +
        `prepared for ${mundo}.`
    );

    return true;
}


/* ==========================================================
   38. RENDER ALL 24 CARDS
========================================================== */

function dibujarTodasLasTarjetas() {

    dibujarTarjetasMundo("luna");

    dibujarTarjetasMundo("marte");
}


/* ==========================================================
   39. CREATE HISTORICAL MARKERS
========================================================== */

/**
 * Each marker provides access
 * to a mission's historical record.
 *
 * Markers are HTML buttons.
 * In a later part, we will be able
 * to synchronize them with the 3D planets.
 */
function crearMarcadorMundo(objeto) {

    const descubierto =
        estaDescubierto(objeto.id);

    const boton =
        crearElemento(
            "button",
            "marcador-historico"
        );

    boton.type = "button";

    boton.dataset.objeto = objeto.id;
    boton.dataset.mundo = objeto.mundo;

    boton.classList.toggle(
        "descubierto",
        descubierto
    );

    // Icon
    const icono =
        crearElemento(
            "span",
            "icono-marcador",
            objeto.icono || "📍"
        );

    icono.setAttribute(
        "aria-hidden",
        "true"
    );

    // Name
    const nombre =
        crearElemento(
            "strong",
            "nombre-marcador",
            objeto.nombre
        );

    // Location
    const ubicacion =
        crearElemento(
            "span",
            "ubicacion-marcador",
            objeto.ubicacion
        );

    // Coordinates
    const coordenadas =
        crearElemento(
            "small",
            "coordenadas-marcador",
            formatearCoordenadas(
                objeto.lat,
                objeto.lon
            )
        );

    // Status
    const estado =
        crearElemento(
            "span",
            "estado-marcador",
            descubierto
                ? "✓ REGISTERED"
                : "○ UNDISCOVERED"
        );

    boton.append(
        icono,
        nombre,
        ubicacion,
        coordenadas,
        estado
    );

    boton.setAttribute(
        "aria-label",
        `Open ${objeto.nombre}, ` +
        `${objeto.ubicacion}`
    );

    boton.addEventListener("click", () => {
        solicitarAperturaObjeto(objeto.id);
    });

    return boton;
}


/* ==========================================================
   40. RENDER MARKERS FOR A WORLD
========================================================== */

function dibujarMarcadoresMundo(mundo) {

    const configuracion =
        CONFIGURACION_EXPLORACION[mundo];

    if (!configuracion) {
        return false;
    }

    const contenedor =
        $(configuracion.marcadores);

    if (!contenedor) {
        console.warn(
            "[ARCHIVO] Missing:",
            configuracion.marcadores
        );
        return false;
    }

    const fragmento =
        document.createDocumentFragment();

    obtenerObjetosMundo(mundo).forEach(
        objeto => {
            fragmento.appendChild(
                crearMarcadorMundo(objeto)
            );
        }
    );

    contenedor.replaceChildren(fragmento);

    return true;
}


/* ==========================================================
   41. RENDER ALL MARKERS
========================================================== */

function dibujarTodosLosMarcadores() {

    dibujarMarcadoresMundo("luna");

    dibujarMarcadoresMundo("marte");
}


/* ==========================================================
   42. REQUEST TO OPEN A HISTORICAL RECORD
========================================================== */

/**
 * The complete historical record system
 * will be implemented in PART 5.
 *
 * This function prevents objects
 * from being registered automatically
 * when clicked.
 */
function solicitarAperturaObjeto(id) {

    if (!validarIdObjeto(id)) {
        console.warn(
            "[ARCHIVO] Object does not exist:",
            id
        );
        return false;
    }

    if (typeof abrirObjeto !== "function") {
        console.warn(
            "[ARCHIVO] Historical record opening " +
            "will be connected in PART 5."
        );

        return false;
    }

    abrirObjeto(id);

    return true;
}


/* ==========================================================
   43. REGISTER A DISCOVERY
========================================================== */

/**
 * This is the only function that adds
 * objects to ESTADO.descubiertos.
 *
 * The user must press the
 * REGISTER DISCOVERY button.
 */
function registrarDescubrimiento(id) {

    if (!validarIdObjeto(id)) {
        console.warn(
            "[ARCHIVO] Cannot register " +
            "an object that does not exist:",
            id
        );

        return false;
    }

    // Prevent duplicate discoveries.
    if (estaDescubierto(id)) {
        actualizarEstadoDescubrimiento();
        return false;
    }

    // Save only in memory.
    ESTADO.descubiertos.add(id);

    // Update progress.
    actualizarIndicadoresExploracion();

    // Update cards and markers.
    actualizarTarjetasDescubiertas();

    actualizarMarcadoresDescubiertos();

    // Update the record button.
    actualizarEstadoDescubrimiento();

    // Update future sections.
    if (
        typeof actualizarPanelesExploracion ===
        "function"
    ) {
        actualizarPanelesExploracion();
    }

    if (
        typeof actualizarEstadoCronologias ===
        "function"
    ) {
        actualizarEstadoCronologias();
    }

    // Optional effects.
    if (
        typeof sonidoDescubrimiento ===
        "function"
    ) {
        sonidoDescubrimiento();
    }

    if (
        typeof celebrarDescubrimientoRatatopo ===
        "function"
    ) {
        celebrarDescubrimientoRatatopo(
            obtenerObjeto(id)
        );
    }

    console.log(
        "[ARCHIVO] Discovery registered:",
        id
    );

    console.log(
        "[ARCHIVO] Progress:",
        calcularProgreso() + "%"
    );

    return true;
}


/* ==========================================================
   44. UPDATE DISCOVERED CARDS
========================================================== */

function actualizarTarjetasDescubiertas() {

    $$(".tarjeta-objeto[data-objeto]").forEach(
        tarjeta => {

            const id = tarjeta.dataset.objeto;

            const descubierto =
                estaDescubierto(id);

            tarjeta.classList.toggle(
                "descubierto",
                descubierto
            );

            const estado =
                tarjeta.querySelector(
                    ".estado-tarjeta"
                );

            if (estado) {
                estado.textContent = descubierto
                    ? "✓ DISCOVERED"
                    : "○ PENDING";

                estado.classList.toggle(
                    "estado-descubierto",
                    descubierto
                );
            }
        }
    );
}


/* ==========================================================
   45. UPDATE DISCOVERED MARKERS
========================================================== */

function actualizarMarcadoresDescubiertos() {

    $$(".marcador-historico[data-objeto]").forEach(
        marcador => {

            const id = marcador.dataset.objeto;

            const descubierto =
                estaDescubierto(id);

            marcador.classList.toggle(
                "descubierto",
                descubierto
            );

            const estado =
                marcador.querySelector(
                    ".estado-marcador"
                );

            if (estado) {
                estado.textContent = descubierto
                    ? "✓ REGISTERED"
                    : "○ UNDISCOVERED";
            }
        }
    );
}


/* ==========================================================
   46. UPDATE HISTORICAL RECORD STATUS
========================================================== */

function actualizarEstadoDescubrimiento() {

    const objeto = ESTADO.objetoActual;

    const boton =
        $("#botonDescubierto");

    const mensaje =
        $("#estadoDescubrimiento");

    if (!objeto) {

        if (boton) {
            boton.disabled = true;

            boton.textContent =
                "SELECT AN OBJECT";
        }

        if (mensaje) {
            mensaje.textContent =
                "Select a historical record " +
                "to register a discovery.";
        }

        return;
    }

    const descubierto =
        estaDescubierto(objeto.id);

    if (boton) {

        boton.disabled = descubierto;

        boton.textContent = descubierto
            ? "✓ DISCOVERY REGISTERED"
            : "REGISTER DISCOVERY ✦";

        boton.classList.toggle(
            "descubierto",
            descubierto
        );
    }

    if (mensaje) {

        mensaje.textContent = descubierto
            ? "This object is already part " +
              "of your exploration archive."
            : "This object has not yet been " +
              "registered in your exploration.";
    }
}


/* ==========================================================
   47. PREPARE DISCOVERY BUTTON
========================================================== */

function prepararBotonDescubrimiento() {

    const boton =
        $("#botonDescubierto");

    if (!boton) {
        console.warn(
            "[ARCHIVO] Could not find " +
            "#botonDescubierto."
        );

        return;
    }

    boton.addEventListener("click", () => {

        const objeto = ESTADO.objetoActual;

        if (!objeto) {
            return;
        }

        registrarDescubrimiento(objeto.id);
    });

    actualizarEstadoDescubrimiento();
}


/* ==========================================================
   48. PREPARE VISUAL ARCHIVE
========================================================== */

/**
 * This function will be called only
 * once from iniciarAplicacion().
 */
function prepararArchivoVisual() {

    // Check the 24 records.
    if (!verificarArchivoHistorico()) {
        console.error(
            "[ARCHIVO] Cannot prepare " +
            "the historical archive."
        );

        return false;
    }

    // Create cards.
    dibujarTodasLasTarjetas();

    // Create markers.
    dibujarTodosLosMarcadores();

    // Connect the discovery button.
    prepararBotonDescubrimiento();

    // Display initial progress.
    actualizarIndicadoresExploracion();

    console.log(
        "[ARCHIVO] Visual archive prepared: " +
        "24 objects available."
    );

    return true;
}


/* ==========================================================
   END OF NEW PART 4
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 5

   HISTORICAL RECORDS
   NASA GALLERIES
   DOCUMENTARY SOURCES

   Compatible with PARTS 1, 2, 3, and 4.
========================================================== */


/* ==========================================================
   49. PHOTOGRAPHIC ARCHIVE CONFIGURATION
========================================================== */

const CONFIGURACION_FOTOGRAFIAS = {
    cantidadGaleria: 6,
    resultadosConsulta: 40,
    tiempoEspera: 12000,
    bibliotecaNASA: "https://images.nasa.gov/"
};


/* ==========================================================
   50. SPECIFIC SEARCHES FOR THE 24 MISSIONS
========================================================== */

const BUSQUEDAS_FOTOGRAFICAS = {
    "luna-01": "Luna 2 spacecraft",
    "luna-02": "Luna 9 spacecraft",
    "luna-03": "Surveyor 1 lunar lander",
    "luna-04": "Apollo 11 lunar module Eagle",
    "luna-05": "Apollo 11 laser retroreflector",
    "luna-06": "Apollo 12 lunar module Intrepid",
    "luna-07": "Surveyor 3 spacecraft",
    "luna-08": "Lunokhod 1 lunar rover",
    "luna-09": "Apollo 14 lunar module Antares",
    "luna-10": "Apollo 15 lunar rover",
    "luna-11": "Apollo 16 lunar rover",
    "luna-12": "Apollo 17 lunar rover",

    "marte-01": "Mars 2 spacecraft",
    "marte-02": "Mars 3 spacecraft",
    "marte-03": "Viking 1 Mars lander",
    "marte-04": "Viking 2 Mars lander",
    "marte-05": "Mars Pathfinder lander",
    "marte-06": "Sojourner Mars rover",
    "marte-07": "Spirit Mars rover",
    "marte-08": "Opportunity Mars rover",
    "marte-09": "Phoenix Mars lander",
    "marte-10": "Curiosity Mars rover",
    "marte-11": "InSight Mars lander",
    "marte-12": "Ingenuity Mars helicopter"
};


/* ==========================================================
   51. PHOTOGRAPHIC VIEWER STATE
========================================================== */

const ESTADO_FOTOGRAFIAS = {
    imagenesActuales: [],
    imagenAmpliada: null,
    solicitudActual: 0,
    controlador: null,
    focoAnterior: null,
    controlesPreparados: false
};


/* ==========================================================
   52. LINK SECURITY UTILITIES
========================================================== */

/**
 * Checks whether an address uses
 * HTTP or HTTPS.
 */
function esURLWebValida(direccion) {
    try {
        const url = new URL(direccion);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );
    } catch {
        return false;
    }
}


/**
 * Creates a secure external link.
 */
function crearEnlaceExterno(
    direccion,
    texto,
    clase = ""
) {
    if (!esURLWebValida(direccion)) {
        return null;
    }

    const enlace =
        crearElemento("a", clase, texto);

    enlace.href = direccion;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    return enlace;
}


/* ==========================================================
   53. EDITORIAL INFORMATION FOR HISTORICAL RECORDS
========================================================== */

/**
 * In PART 1, we declared DOSSIER = {}.
 *
 * If an editorial record contains
 * antes, durante, despues, and aprendizaje,
 * we will use those texts.
 *
 * Until the 24 expanded stories
 * have been added, we will use
 * the historical data from ARCHIVO.
 */
function construirContenidoExpediente(objeto) {

    const expediente =
        obtenerDossier(objeto.id);

    if (expediente) {
        return {
            titulo:
                expediente.titulo ||
                objeto.nombre,

            antes:
                expediente.antes || "",

            durante:
                expediente.durante ||
                objeto.historia,

            despues:
                expediente.despues || "",

            aprendizaje:
                expediente.aprendizaje ||
                objeto.descripcion
        };
    }

    return {
        titulo: objeto.nombre,

        antes:
            `The ${objeto.mision} mission is ` +
            "part of the history of " +
            `exploration of ${
                objeto.mundo === "luna"
                    ? "the Moon"
                    : "Mars"
            }.`,

        durante: objeto.historia,

        despues:
            `Historical record: ${objeto.estado}. ` +
            `Location: ${objeto.ubicacion}.`,

        aprendizaje: objeto.descripcion
    };
}


/* ==========================================================
   54. CREATE STORY BLOCKS
========================================================== */

function crearBloqueHistoria(
    titulo,
    contenido
) {
    const bloque =
        crearElemento(
            "article",
            "bloque-historia"
        );

    const encabezado =
        crearElemento(
            "h4",
            "titulo-bloque-historia",
            titulo
        );

    const parrafo =
        crearElemento(
            "p",
            "texto-bloque-historia",
            contenido
        );

    bloque.append(
        encabezado,
        parrafo
    );

    return bloque;
}


/* ==========================================================
   55. FILL HISTORICAL RECORD
========================================================== */

function rellenarExpediente(objeto) {

    if (!objeto) {
        return false;
    }

    escribirTexto(
        "#categoriaObjeto",
        objeto.categoria
    );

    escribirTexto(
        "#nombreObjeto",
        objeto.nombre
    );

    escribirTexto(
        "#descripcionObjeto",
        objeto.descripcion
    );

    escribirTexto(
        "#misionObjeto",
        objeto.mision
    );

    escribirTexto(
        "#fechaObjeto",
        objeto.fecha
    );

    escribirTexto(
        "#ubicacionObjeto",
        objeto.ubicacion
    );

    escribirTexto(
        "#estadoObjeto",
        objeto.estado
    );

    // Temporary representation of the artifact.
    // The 3D models will be added later.
    const modelo =
        $("#modeloObjeto");

    if (modelo) {

        const icono =
            crearElemento(
                "span",
                "icono-modelo-objeto",
                objeto.icono || "🛰️"
            );

        icono.setAttribute(
            "aria-hidden",
            "true"
        );

        const nombre =
            crearElemento(
                "p",
                "nombre-modelo-objeto",
                objeto.nombre
            );

        modelo.replaceChildren(
            icono,
            nombre
        );
    }

    const historia =
        $("#historiaCompleta");

    const contenido =
        construirContenidoExpediente(objeto);

    if (historia) {

        const fragmento =
            document.createDocumentFragment();

        const titulo =
            crearElemento(
                "h4",
                "titulo-expediente",
                contenido.titulo
            );

        fragmento.appendChild(titulo);

        if (contenido.antes) {
            fragmento.appendChild(
                crearBloqueHistoria(
                    "BEFORE THE MISSION",
                    contenido.antes
                )
            );
        }

        if (contenido.durante) {
            fragmento.appendChild(
                crearBloqueHistoria(
                    "DURING THE MISSION",
                    contenido.durante
                )
            );
        }

        if (contenido.despues) {
            fragmento.appendChild(
                crearBloqueHistoria(
                    "AFTER THE MISSION",
                    contenido.despues
                )
            );
        }

        historia.replaceChildren(fragmento);
    }

    // Educational conclusion of the comic.
    escribirTexto(
        "#aprendizajeComic",
        contenido.aprendizaje
    );

    return true;
}


/* ==========================================================
   56. OPEN HISTORICAL RECORD
========================================================== */

/**
 * This function is called by the
 * cards and markers from PART 4.
 */
function abrirObjeto(id) {

    const objeto = obtenerObjeto(id);

    if (!objeto) {
        console.warn(
            "[ARCHIVO] Object not found:",
            id
        );

        return false;
    }

    // Remember where it was opened from.
    if (
        ESTADO.seccionActual !==
        "detalleObjeto"
    ) {
        ESTADO.seccionAnterior =
            ESTADO.seccionActual;
    }

    ESTADO.objetoActual = objeto;

    // Close any previously opened image.
    cerrarImagenAmpliada();

    // Display the historical record.
    const resultado =
        mostrarSeccion("detalleObjeto");

    if (!resultado) {
        return false;
    }

    // Fill in the information.
    rellenarExpediente(objeto);

    // Update discovery status.
    actualizarEstadoDescubrimiento();

    // Display sources.
    mostrarFuentesObjeto(objeto);

    // Load photographs.
    cargarGaleriaObjeto(objeto);

    // Prepare the comic when
    // its corresponding module exists.
    if (
        typeof prepararComicObjeto ===
        "function"
    ) {
        prepararComicObjeto(objeto);
    }

    console.log(
        "[ARCHIVO] Historical record opened:",
        objeto.nombre
    );

    return true;
}


/* ==========================================================
   57. RETURN TO THE ARCHIVE
========================================================== */

function regresarDesdeExpediente() {

    cerrarImagenAmpliada();

    // Cancel previous requests.
    ESTADO_FOTOGRAFIAS.solicitudActual++;

    if (ESTADO_FOTOGRAFIAS.controlador) {
        ESTADO_FOTOGRAFIAS.controlador.abort();

        ESTADO_FOTOGRAFIAS.controlador = null;
    }

    const anterior =
        ESTADO.seccionAnterior;

    const destino =
        anterior &&
        anterior !== "detalleObjeto" &&
        SECCIONES_MUSEO.includes(anterior)
            ? anterior
            : (
                ESTADO.objetoActual?.mundo ===
                "marte"
                    ? "vistaMarte"
                    : "vistaLuna"
            );

    mostrarSeccion(destino);
}

/* ==========================================================
   61. GALLERY MESSAGES
========================================================== */

function mostrarMensajeGaleria(
    mensaje,
    clase = "mensaje-galeria"
) {

    const contenedor =
        $("#imagenesObjeto");

    if (!contenedor) {
        return;
    }

    const aviso =
        crearElemento(
            "p",
            clase,
            mensaje
        );

    contenedor.replaceChildren(aviso);
}


/* ==========================================================
   62. CREATE PHOTOGRAPHIC CARD
========================================================== */

function crearTarjetaFotografia(imagen) {

    const tarjeta =
        crearElemento(
            "figure",
            "tarjeta-fotografia"
        );

    const boton =
        crearElemento(
            "button",
            "boton-ampliar-fotografia"
        );

    boton.type = "button";

    boton.setAttribute(
        "aria-label",
        `Enlarge photograph: ${imagen.titulo}`
    );

    const fotografia =
        crearImagen(
            imagen.src,
            imagen.titulo,
            "fotografia-nasa"
        );

    // If the image becomes unavailable,
    // hide the broken record.
    fotografia.addEventListener(
        "error",
        () => {
            tarjeta.remove();
        },
        { once: true }
    );

    boton.appendChild(fotografia);

    boton.addEventListener("click", () => {
        abrirImagenAmpliada(imagen);
    });

    const pie =
        crearElemento(
            "figcaption",
            "pie-fotografia"
        );

    const titulo =
        crearElemento(
            "strong",
            "titulo-fotografia",
            imagen.titulo
        );

    const credito =
        crearElemento(
            "span",
            "credito-fotografia",
            "NASA Image and Video Library"
        );

    pie.append(
        titulo,
        credito
    );

    tarjeta.append(
        boton,
        pie
    );

    return tarjeta;
}


/* ==========================================================
   63. LOAD AN OBJECT'S GALLERY
========================================================== */

async function cargarGaleriaObjeto(objeto) {

    if (!objeto) {
        return;
    }

    // Identifier used to discard responses
    // from records that have already been closed.
    const solicitud =
        ++ESTADO_FOTOGRAFIAS.solicitudActual;

    if (ESTADO_FOTOGRAFIAS.controlador) {
        ESTADO_FOTOGRAFIAS.controlador.abort();
    }

    const controlador =
        new AbortController();

    ESTADO_FOTOGRAFIAS.controlador =
        controlador;

    ESTADO_FOTOGRAFIAS.imagenesActuales = [];

    mostrarMensajeGaleria(
        "Searching NASA's photographic archive...",
        "mensaje-galeria cargando"
    );

    escribirTexto(
        "#creditoImagenesObjeto",
        "Searching for visual records of the mission."
    );

    const imagenes =
        await buscarImagenesNASA(
            objeto.id,
            CONFIGURACION_FOTOGRAFIAS
                .cantidadGaleria,
            controlador.signal
        );

    // Do not modify the gallery if the user
    // has opened another record.
    if (
        solicitud !==
        ESTADO_FOTOGRAFIAS.solicitudActual
    ) {
        return;
    }

    if (
        ESTADO.objetoActual?.id !==
        objeto.id
    ) {
        return;
    }

    ESTADO_FOTOGRAFIAS.controlador = null;

    ESTADO_FOTOGRAFIAS.imagenesActuales =
        imagenes;

    const contenedor =
        $("#imagenesObjeto");

    if (!contenedor) {
        return;
    }

    if (imagenes.length === 0) {

        mostrarMensajeGaleria(
            "No photographs were found " +
            "with metadata sufficiently " +
            "related to this mission. " +
            "You can consult the official " +
            "catalog through the sources link."
        );

        escribirTexto(
            "#creditoImagenesObjeto",
            "There are no confirmed photographs " +
            "to display for this search."
        );

        return;
    }

    const fragmento =
        document.createDocumentFragment();

    imagenes.forEach(imagen => {
        fragmento.appendChild(
            crearTarjetaFotografia(imagen)
        );
    });

    contenedor.replaceChildren(fragmento);

    escribirTexto(
        "#creditoImagenesObjeto",
        `Displaying ${imagenes.length} ` +
        "photographic records related " +
        "to the mission, obtained from the " +
        "NASA Image and Video Library catalog. " +
        "These may include historical images, " +
        "preparation photographs, or " +
        "representations of the mission."
    );
}

/* ==========================================================
   64. OPEN ENLARGED IMAGE
========================================================== */

function abrirImagenAmpliada(imagen) {

    if (!imagen?.src) {
        return;
    }

    const visor =
        $("#visorImagenAmpliada");

    const fotografia =
        $("#imagenAmpliada");

    const pie =
        $("#pieImagenAmpliada");

    if (!visor || !fotografia) {
        return;
    }

    ESTADO_FOTOGRAFIAS.imagenAmpliada =
        imagen;

    ESTADO_FOTOGRAFIAS.focoAnterior =
        document.activeElement;

    fotografia.src = imagen.src;

    fotografia.alt = imagen.titulo;

    if (pie) {

        pie.textContent =
            imagen.titulo +
            " · Source: NASA Image and Video Library";
    }

    visor.hidden = false;

    visor.classList.add("activo");

    document.body.classList.add(
        "visor-abierto"
    );

    const cerrar =
        $("#cerrarImagenAmpliada");

    if (cerrar) {
        cerrar.focus();
    }
}


/* ==========================================================
   65. CLOSE ENLARGED IMAGE
========================================================== */

function cerrarImagenAmpliada() {

    const visor =
        $("#visorImagenAmpliada");

    if (!visor) {
        return;
    }

    const estabaAbierto = !visor.hidden;

    visor.hidden = true;

    visor.classList.remove("activo");

    document.body.classList.remove(
        "visor-abierto"
    );

    const fotografia =
        $("#imagenAmpliada");

    if (fotografia) {
        fotografia.removeAttribute("src");
    }

    ESTADO_FOTOGRAFIAS.imagenAmpliada =
        null;

    if (estabaAbierto) {

        const foco =
            ESTADO_FOTOGRAFIAS.focoAnterior;

        if (
            foco &&
            foco.isConnected &&
            typeof foco.focus === "function"
        ) {
            foco.focus();
        }
    }

    ESTADO_FOTOGRAFIAS.focoAnterior = null;
}


/* ==========================================================
   66. PREPARE IMAGE VIEWER CONTROLS
========================================================== */

function prepararVisorImagenes() {

    const boton =
        $("#cerrarImagenAmpliada");

    const visor =
        $("#visorImagenAmpliada");

    if (boton) {

        boton.addEventListener(
            "click",
            cerrarImagenAmpliada
        );
    }

    if (visor) {

        visor.addEventListener(
            "click",
            evento => {

                if (evento.target === visor) {
                    cerrarImagenAmpliada();
                }
            }
        );
    }

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key !== "Escape" ||
                !visor ||
                visor.hidden
            ) {
                return;
            }

            cerrarImagenAmpliada();
        }
    );

    // Keep focus inside the viewer
    // while it is open.
    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key !== "Tab" ||
                !visor ||
                visor.hidden
            ) {
                return;
            }

            const controles =
                Array.from(
                    visor.querySelectorAll(
                        "button, a[href], " +
                        "[tabindex]:not([tabindex='-1'])"
                    )
                ).filter(elemento => {
                    return !elemento.disabled;
                });

            if (!controles.length) {
                evento.preventDefault();
                return;
            }

            const primero = controles[0];

            const ultimo =
                controles[controles.length - 1];

            if (
                evento.shiftKey &&
                document.activeElement === primero
            ) {
                evento.preventDefault();
                ultimo.focus();

            } else if (
                !evento.shiftKey &&
                document.activeElement === ultimo
            ) {
                evento.preventDefault();
                primero.focus();
            }
        }
    );
}


/* ==========================================================
   67. OFFICIAL REFERENCE LINKS
========================================================== */

/**
 * We generate official searches
 * for each mission.
 *
 * We do not invent links to specific
 * documents that we have not verified.
 */
function obtenerFuentesObjeto(objeto) {

    const consulta =
        BUSQUEDAS_FOTOGRAFICAS[objeto.id] ||
        objeto.mision;

    return [
        {
            nombre:
                "NASA Image and Video Library",
            descripcion:
                "Photographs and visual records.",
            url:
                "https://images.nasa.gov/search?" +
                new URLSearchParams({
                    q: consulta
                }).toString()
        },

        {
            nombre:
                "NASA Science",
            descripcion:
                "NASA scientific information.",
            url:
                "https://science.nasa.gov/"
        },

        {
            nombre:
                "NASA History",
            descripcion:
                "History of space missions.",
            url:
                "https://www.nasa.gov/history/"
        }
    ];
}


/* ==========================================================
   68. DISPLAY RECORD SOURCES
========================================================== */

function mostrarFuentesObjeto(objeto) {

    const contenedor =
        $("#enlacesFuentesObjeto");

    if (!contenedor || !objeto) {
        return;
    }

    const fuentes =
        obtenerFuentesObjeto(objeto);

    const fragmento =
        document.createDocumentFragment();

    fuentes.forEach(fuente => {

        const enlace =
            crearEnlaceExterno(
                fuente.url,
                "",
                "enlace-fuente"
            );

        if (!enlace) {
            return;
        }

        const titulo =
            crearElemento(
                "strong",
                "titulo-fuente",
                fuente.nombre
            );

        const descripcion =
            crearElemento(
                "span",
                "descripcion-fuente",
                fuente.descripcion
            );

        enlace.append(
            titulo,
            descripcion
        );

        fragmento.appendChild(enlace);
    });

    contenedor.replaceChildren(fragmento);
}


/* ==========================================================
   69. PREPARE RETURN FROM RECORD
========================================================== */

function prepararRegresoExpediente() {

    const boton =
        $("#regresarObjetos");

    if (!boton) {
        console.warn(
            "[ARCHIVO] Missing #regresarObjetos."
        );
        return;
    }

    boton.addEventListener(
        "click",
        regresarDesdeExpediente
    );
}


/* ==========================================================
   70. PREPARE HISTORICAL RECORD SYSTEM
========================================================== */

/**
 * This function will be called only once
 * from iniciarAplicacion().
 */
function prepararSistemaExpedientes() {

    if (
        ESTADO_FOTOGRAFIAS.controlesPreparados
    ) {
        return;
    }

    prepararRegresoExpediente();

    prepararVisorImagenes();

    actualizarEstadoDescubrimiento();

    ESTADO_FOTOGRAFIAS.controlesPreparados =
        true;

    console.log(
        "[ARCHIVO] Historical record system ready."
    );
}


/* ==========================================================
   END OF NEW PART 5
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 6
   RATATOPO'S INTERACTIVE COMICS

   Compatible with PARTS 1 TO 5.
========================================================== */


/* ==========================================================
   71. DIALOGUES FOR THE 24 COMICS

   Recovered from the previous project.

   Each mission has four moments:
   challenge, journey, discovery, and legacy.
========================================================== */

const ESCENAS_COMIC = {

    "luna-01": {
        desafio: "We have to reach the Moon!",
        mision: "Luna 2 travels toward our natural satellite.",
        momento: "Impact confirmed! We've arrived.",
        legado: "Humanity has just touched another world."
    },

    "luna-02": {
        desafio: "Can we land without destroying the spacecraft?",
        mision: "Luna 9 descends and deploys its capsule.",
        momento: "Images are arriving from the surface!",
        legado: "Now we can observe the Moon from the ground."
    },

    "luna-03": {
        desafio: "Before sending astronauts, we need to understand the terrain.",
        mision: "Surveyor 1 approaches Oceanus Procellarum.",
        momento: "First American soft landing completed!",
        legado: "Every photograph helps prepare for Apollo."
    },

    "luna-04": {
        desafio: "Two astronauts are about to descend.",
        mision: "Eagle separates and begins its approach.",
        momento: "The lunar module has reached the surface!",
        legado: "Its descent stage will remain here."
    },

    "luna-05": {
        desafio: "How can we measure the distance to the Moon?",
        mision: "Apollo 11 installs a retroreflector.",
        momento: "A laser pulse can return to Earth!",
        legado: "A passive instrument continues to help science."
    },

    "luna-06": {
        desafio: "This time, we must land precisely.",
        mision: "Apollo 12 aims for a site near Surveyor 3.",
        momento: "We've landed very close to the old probe!",
        legado: "Exploration can return to specific locations."
    },

    "luna-07": {
        desafio: "A probe has been waiting on the Moon for years.",
        mision: "Apollo 12 approaches Surveyor 3.",
        momento: "We can recover components from the spacecraft!",
        legado: "The materials will reveal how they endured the lunar environment."
    },

    "luna-08": {
        desafio: "What if we send a vehicle with wheels?",
        mision: "Luna 17 carries Lunokhod 1.",
        momento: "The rover begins traveling across the surface!",
        legado: "Mobile robots expand our ability to investigate."
    },

    "luna-09": {
        desafio: "We must explore the Fra Mauro region.",
        mision: "Apollo 14 descends with the Antares module.",
        momento: "The astronauts are collecting samples!",
        legado: "Every rock preserves clues to lunar history."
    },

    "luna-10": {
        desafio: "Walking limits how far we can travel.",
        mision: "Apollo 15 carries the first crewed lunar rover.",
        momento: "The astronauts are driving!",
        legado: "Mobility makes it possible to explore much more terrain."
    },

    "luna-11": {
        desafio: "We want to investigate the lunar highlands.",
        mision: "Apollo 16 lands in the Descartes region.",
        momento: "The rover moves across a different landscape!",
        legado: "Comparing regions helps reconstruct lunar history."
    },

    "luna-12": {
        desafio: "This is the final lunar expedition of the Apollo program.",
        mision: "Apollo 17 reaches the Taurus-Littrow valley.",
        momento: "The rover carries astronauts and instruments!",
        legado: "The vehicle remains as a testament to exploration."
    },

    "marte-01": {
        desafio: "Our next destination is Mars!",
        mision: "Mars 2 approaches the Martian atmosphere.",
        momento: "The spacecraft impacts the surface.",
        legado: "Even a failed mission can open new paths."
    },

    "marte-02": {
        desafio: "We need to achieve a soft landing.",
        mision: "Mars 3 descends toward the Red Planet.",
        momento: "The spacecraft lands, but the transmission stops!",
        legado: "Arriving is only the first step of a mission."
    },

    "marte-03": {
        desafio: "What secrets does the Martian soil hold?",
        mision: "Viking 1 reaches Chryse Planitia.",
        momento: "The laboratory begins its experiments!",
        legado: "Its data will change our understanding of the planet."
    },

    "marte-04": {
        desafio: "We need to explore another region of Mars.",
        mision: "Viking 2 heads toward Utopia Planitia.",
        momento: "We have photographs of a new landscape!",
        legado: "Comparing two locations reveals regional differences."
    },

    "marte-05": {
        desafio: "Can we land using airbags?",
        mision: "Pathfinder descends toward Ares Vallis.",
        momento: "The platform has survived the landing!",
        legado: "New technology makes it possible to explore Mars."
    },

    "marte-06": {
        desafio: "I want to see what's behind those rocks!",
        mision: "Sojourner leaves the Pathfinder platform.",
        momento: "A small rover is traveling across Mars!",
        legado: "Its adventure prepares the explorers of the future."
    },

    "marte-07": {
        desafio: "Was there water in this region of Mars?",
        mision: "Spirit begins exploring Gusev Crater.",
        momento: "We've found minerals that tell a story!",
        legado: "The mission exceeds its planned duration by years."
    },

    "marte-08": {
        desafio: "Let's search for clues to Mars's wet past.",
        mision: "Opportunity travels across Meridiani Planum.",
        momento: "The rocks show signs of ancient water-related processes!",
        legado: "Nearly fifteen years of exploration leave an extraordinary archive."
    },

    "marte-09": {
        desafio: "Could ice be hidden beneath the ground?",
        mision: "Phoenix lands in the polar regions.",
        momento: "The robotic arm discovers water ice!",
        legado: "The Red Planet also holds frozen water."
    },

    "marte-10": {
        desafio: "Could Mars have been habitable in the past?",
        mision: "Curiosity explores the layers of Gale Crater.",
        momento: "Its instruments analyze rocks and sediments!",
        legado: "Understanding habitability is different from finding life."
    },

    "marte-11": {
        desafio: "How can we study the interior of Mars?",
        mision: "InSight deploys a seismometer.",
        momento: "We're recording Martian earthquakes!",
        legado: "Seismic waves reveal clues about the planet's interior."
    },

    "marte-12": {
        desafio: "Is it possible to fly in such a thin atmosphere?",
        mision: "Ingenuity prepares its rotor blades on Mars.",
        momento: "The first powered flight on another planet!",
        legado: "Seventy-two flights open a new era of exploration."
    }

};


/* ==========================================================
   72. GENERATE THE FOUR COMIC PAGES

   Uses data from ARCHIVO and DOSSIER.

   If the expanded dossier does not yet exist,
   uses historical information from ARCHIVO.
========================================================== */

function generarPaginasComic(objeto) {

    if (!objeto) {
        return [];
    }

    const escenas =
        ESCENAS_COMIC[objeto.id];

    if (!escenas) {
        return [];
    }

    const dossier =
        construirContenidoExpediente(objeto);

    return [
        {
            numero: 1,
            titulo: "THE GREAT CHALLENGE",
            narracion: dossier.antes,
            dialogo: escenas.desafio,
            personaje: "RATATOPO",
            tipo: "desafio",
            efecto: "THE MISSION BEGINS!"
        },

        {
            numero: 2,
            titulo: "HEADING TO ANOTHER WORLD",
            narracion: dossier.durante,
            dialogo: escenas.mision,
            personaje: "MISSION CONTROL",
            tipo: "viaje",
            efecto: "LIFTOFF!"
        },

        {
            numero: 3,
            titulo: "THE HISTORIC MOMENT",
            narracion: objeto.historia,
            dialogo: escenas.momento,
            personaje: "RATATOPO",
            tipo: "descubrimiento",
            efecto: "HISTORIC MILESTONE!"
        },

        {
            numero: 4,
            titulo: "A MARK ON HISTORY",
            narracion: dossier.despues,
            dialogo: escenas.legado,
            personaje: "RATATOPO",
            tipo: "legado",
            efecto: "MISSION DOCUMENTED!"
        }
    ];
}


/* ==========================================================
   73. PREPARE AN OBJECT'S COMIC

   This function is already connected to
   abrirObjeto() from PART 5.
========================================================== */

function prepararComicObjeto(objeto) {

    if (!objeto) {
        return;
    }

    ESTADO.paginasComic =
        generarPaginasComic(objeto);

    ESTADO.paginaComic = 0;

    escribirTexto(
        "#numeroExpedienteComic",
        objeto.id.toUpperCase()
    );

    escribirTexto(
        "#tituloComic",
        "THE CHRONICLES OF " +
        objeto.nombre.toUpperCase()
    );

    escribirTexto(
        "#introduccionComic",
        "Join Ratatopo to discover " +
        `the story of ${objeto.nombre}. ` +
        "The dialogues are educational " +
        "recreations based on historical events."
    );

    const contenido =
        construirContenidoExpediente(objeto);

    escribirTexto(
        "#aprendizajeComic",
        contenido.aprendizaje
    );

    mostrarPaginaComic();
}


/* ==========================================================
   74. DISPLAY A COMIC PAGE
========================================================== */

function mostrarPaginaComic() {

    const contenedor =
        $("#paginasComic");

    if (!contenedor) {
        return;
    }

    const pagina =
        ESTADO.paginasComic[
            ESTADO.paginaComic
        ];

    const objeto =
        ESTADO.objetoActual;

    if (!pagina || !objeto) {
        contenedor.replaceChildren();
        actualizarControlesComic();
        return;
    }

    const paginaVisual =
        crearElemento(
            "article",
            `pagina-comic pagina-${pagina.tipo}`
        );

    // ----------------------------------------
    // Page header
    // ----------------------------------------

    const encabezado =
        crearElemento(
            "header",
            "encabezado-pagina-comic"
        );

    const numero =
        crearElemento(
            "span",
            "numero-pagina-comic",
            "CHAPTER " +
            String(pagina.numero).padStart(2, "0")
        );

    const titulo =
        crearElemento(
            "h4",
            "",
            pagina.titulo
        );

    encabezado.append(
        numero,
        titulo
    );

    // ----------------------------------------
    // Comic panel grid
    // ----------------------------------------

    const rejilla =
        crearElemento(
            "div",
            "rejilla-vinetas"
        );

    rejilla.append(
        crearVinetaComic(pagina, objeto),
        crearVinetaNarrativa(pagina, objeto)
    );

    paginaVisual.append(
        encabezado,
        rejilla
    );

    contenedor.replaceChildren(
        paginaVisual
    );

    actualizarControlesComic();
}

/* ==========================================================
   75. DRAW RATATOPO USING HTML ELEMENTS

   Uses the existing visual classes
   from the project's CSS.

   Does not require external images.
========================================================== */

function crearPersonajeComic() {

    const personaje =
        crearElemento(
            "div",
            "ratatopo-comic"
        );

    personaje.setAttribute(
        "role",
        "img"
    );

    personaje.setAttribute(
        "aria-label",
        "Ratatopo, space explorer mouse"
    );

    const casco =
        crearElemento(
            "div",
            "casco-ratatopo"
        );

    const orejaIzquierda =
        crearElemento(
            "div",
            "oreja-ratatopo oreja-izquierda"
        );

    const orejaDerecha =
        crearElemento(
            "div",
            "oreja-ratatopo oreja-derecha"
        );

    const cara =
        crearElemento(
            "div",
            "cara-ratatopo"
        );

    const ojoIzquierdo =
        crearElemento(
            "span",
            "ojo-ratatopo"
        );

    const ojoDerecho =
        crearElemento(
            "span",
            "ojo-ratatopo"
        );

    const nariz =
        crearElemento(
            "span",
            "nariz-ratatopo"
        );

    cara.append(
        ojoIzquierdo,
        ojoDerecho,
        nariz
    );

    casco.append(
        orejaIzquierda,
        orejaDerecha,
        cara
    );

    const traje =
        crearElemento(
            "div",
            "traje-ratatopo"
        );

    const insignia =
        crearElemento(
            "span",
            "insignia-ratatopo",
            "R"
        );

    traje.appendChild(insignia);

    personaje.append(
        casco,
        traje
    );

    return personaje;
}


/* ==========================================================
   76. MAIN COMIC PANEL

   Setting, planet, spaceship, Ratatopo,
   speech bubble, and visual effect.
========================================================== */

function crearVinetaComic(
    pagina,
    objeto
) {

    const vineta =
        crearElemento(
            "section",
            `vineta-comic vineta-${pagina.tipo}`
        );

    const escenario =
        crearElemento(
            "div",
            "escenario-comic " +
            `escenario-${objeto.mundo}`
        );

    escenario.setAttribute(
        "aria-label",
        "Educational illustration of " +
        objeto.nombre
    );

    const estrellas =
        crearElemento(
            "div",
            "estrellas-comic"
        );

    const planeta =
        crearElemento(
            "div",
            "planeta-comic " +
            `planeta-${objeto.mundo}`
        );

    const nave =
        crearElemento(
            "div",
            "nave-comic"
        );

    estrellas.setAttribute(
        "aria-hidden",
        "true"
    );

    planeta.setAttribute(
        "aria-hidden",
        "true"
    );

    nave.setAttribute(
        "aria-hidden",
        "true"
    );

    const personaje =
        crearPersonajeComic();

    // ----------------------------------------
    // Speech bubble
    // ----------------------------------------

    const globo =
        crearElemento(
            "div",
            "globo-dialogo-comic"
        );

    const hablante =
        crearElemento(
            "strong",
            "",
            pagina.personaje
        );

    const dialogo =
        crearElemento(
            "p",
            "",
            pagina.dialogo
        );

    globo.append(
        hablante,
        dialogo
    );

    // ----------------------------------------
    // Comic-book effect
    // ----------------------------------------

    const efecto =
        crearElemento(
            "span",
            "onomatopeya-comic",
            pagina.efecto
        );

    escenario.append(
        estrellas,
        planeta,
        nave,
        personaje,
        globo,
        efecto
    );

    vineta.appendChild(escenario);

    return vineta;
}


/* ==========================================================
   77. NARRATIVE PANEL

   Contains the historical account.
========================================================== */

function crearVinetaNarrativa(
    pagina,
    objeto
) {

    const vineta =
        crearElemento(
            "section",
            "vineta-comic vineta-narrativa"
        );

    const etiqueta =
        crearElemento(
            "span",
            "etiqueta-vineta",
            objeto.mundo === "luna"
                ? "LUNAR ARCHIVE"
                : "MARTIAN ARCHIVE"
        );

    const titulo =
        crearElemento(
            "h5",
            "",
            objeto.nombre
        );

    const narracion =
        crearElemento(
            "p",
            "narracion-vineta",
            pagina.narracion
        );

    const nota =
        crearElemento(
            "span",
            "nota-historica-comic",
            "EDUCATIONAL RECONSTRUCTION"
        );

    vineta.append(
        etiqueta,
        titulo,
        narracion,
        nota
    );

    return vineta;
}


/* ==========================================================
   78. ADVANCE TO THE NEXT PANEL
========================================================== */

function siguientePaginaComic() {

    const ultima =
        ESTADO.paginasComic.length - 1;

    if (
        ESTADO.paginaComic >= ultima
    ) {
        return;
    }

    ESTADO.paginaComic++;

    mostrarPaginaComic();

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   79. RETURN TO THE PREVIOUS PANEL
========================================================== */

function anteriorPaginaComic() {

    if (
        ESTADO.paginaComic <= 0
    ) {
        return;
    }

    ESTADO.paginaComic--;

    mostrarPaginaComic();

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   80. UPDATE BUTTONS AND COUNTER
========================================================== */

function actualizarControlesComic() {

    const anterior =
        $("#comicAnterior");

    const siguiente =
        $("#comicSiguiente");

    const contador =
        $("#contadorComic");

    const total =
        ESTADO.paginasComic.length;

    const actual =
        ESTADO.paginaComic;

    if (anterior) {
        anterior.disabled =
            total === 0 ||
            actual === 0;
    }

    if (siguiente) {
        siguiente.disabled =
            total === 0 ||
            actual >= total - 1;
    }

    if (contador) {

        contador.textContent =
            total > 0
                ? `PANEL ${actual + 1} OF ${total}`
                : "NO PANELS";
    }
}


/* ==========================================================
   81. PREPARE COMIC CONTROLS

   Events are registered only once.
========================================================== */

function prepararControlesComic() {

    const anterior =
        $("#comicAnterior");

    const siguiente =
        $("#comicSiguiente");

    if (anterior) {

        anterior.addEventListener(
            "click",
            anteriorPaginaComic
        );
    }

    if (siguiente) {

        siguiente.addEventListener(
            "click",
            siguientePaginaComic
        );
    }

    actualizarControlesComic();
}


/* ==========================================================
   82. VERIFY THE 24 COMICS
========================================================== */

function verificarComics() {

    const faltantes =
        ARCHIVO.filter(objeto => {
            return !ESCENAS_COMIC[objeto.id];
        });

    if (faltantes.length > 0) {

        console.warn(
            "[ARCHIVO] Missing dialogues for:",
            faltantes.map(objeto => objeto.id)
        );

        return false;
    }

    console.log(
        "[ARCHIVO] All 24 comics have dialogues."
    );

    return true;
}


/* ==========================================================
   83. INITIALIZE THE COMIC SYSTEM

   This will be called only once from
   iniciarAplicacion() at the end.
========================================================== */

function prepararSistemaComics() {

    verificarComics();

    prepararControlesComic();

    console.log(
        "[ARCHIVO] Comic system ready."
    );
}


/* ==========================================================
   END OF NEW PART 6
========================================================== */

/* ==========================================================
   84. TIMELINE AND INVENTORY STATE
========================================================== */

const ESTADO_PANELES = {
    filtroInventario: "todos",
    mundoInventario: "todos",
    eventoActual: null,
    controlesPreparados: false
};


/* ==========================================================
   85. SORT OBJECTS CHRONOLOGICALLY
========================================================== */

function obtenerAnioObjeto(objeto) {
    const coincidencia =
        String(objeto.fecha || "")
            .match(/\b(?:19|20)\d{2}\b/);

    return coincidencia
        ? Number(coincidencia[0])
        : 9999;
}


function obtenerCronologiaOrdenada(mundo) {
    return obtenerObjetosMundo(mundo)
        .slice()
        .sort((a, b) => {
            const diferencia =
                obtenerAnioObjeto(a) -
                obtenerAnioObjeto(b);

            return diferencia ||
                a.id.localeCompare(b.id);
        });
}


/* ==========================================================
   86. CREATE TIMELINE EVENT
========================================================== */

function crearEventoCronologia(objeto, indice) {

    const tarjeta =
        crearElemento(
            "article",
            "evento-tiempo"
        );

    tarjeta.dataset.objeto = objeto.id;

    const numero =
        crearElemento(
            "span",
            "numero-evento-tiempo",
            String(indice + 1).padStart(2, "0")
        );

    const visual =
        crearElemento(
            "div",
            "imagen-evento"
        );

    visual.appendChild(
        crearElemento(
            "span",
            "icono-evento",
            objeto.icono || "🛰️"
        )
    );

    const fecha =
        crearElemento(
            "span",
            "fecha-evento-tiempo",
            objeto.fecha
        );

    const titulo =
        crearElemento(
            "h4",
            "titulo-evento-tiempo",
            objeto.nombre
        );

    const descripcion =
        crearElemento(
            "p",
            "descripcion-evento-tiempo",
            objeto.descripcion
        );

    const estado =
        crearElemento(
            "span",
            "estado-evento-tiempo",
            estaDescubierto(objeto.id)
                ? "RECORD RECOVERED"
                : "RECORD PENDING"
        );

    const boton =
        crearElemento(
            "button",
            "boton-evento-tiempo",
            "EXPLORE EVENT"
        );

    boton.type = "button";

    boton.addEventListener("click", () => {
        abrirEvento(objeto.id);
    });

    tarjeta.append(
        numero,
        visual,
        fecha,
        titulo,
        descripcion,
        estado,
        boton
    );

    tarjeta.classList.toggle(
        "descubierto",
        estaDescubierto(objeto.id)
    );

    return tarjeta;
}


/* ==========================================================
   87. RENDER A TIMELINE
========================================================== */

function dibujarCronologiaMundo(mundo) {

    const contenedor = $(
        mundo === "luna"
            ? "#eventosLuna"
            : "#eventosMarte"
    );

    if (!contenedor) {
        return false;
    }

    const fragmento =
        document.createDocumentFragment();

    obtenerCronologiaOrdenada(mundo)
        .forEach((objeto, indice) => {
            fragmento.appendChild(
                crearEventoCronologia(
                    objeto,
                    indice
                )
            );
        });

    contenedor.replaceChildren(fragmento);

    return true;
}


/* ==========================================================
   88. RENDER BOTH TIMELINES
========================================================== */

function dibujarCronologias() {

    dibujarCronologiaMundo("luna");

    dibujarCronologiaMundo("marte");

    seleccionarMundoCronologia(
        ESTADO.mundoCronologia
    );

    actualizarEstadoCronologias();
}


/* ==========================================================
   89. SELECT MOON OR MARS
========================================================== */

function seleccionarMundoCronologia(mundo) {

    if (
        mundo !== "luna" &&
        mundo !== "marte"
    ) {
        mundo = "luna";
    }

    ESTADO.mundoCronologia = mundo;

    const luna = $("#cronologiaLuna");
    const marte = $("#cronologiaMarte");

    if (luna) {
        luna.hidden = mundo !== "luna";
    }

    if (marte) {
        marte.hidden = mundo !== "marte";
    }

    const botonLuna =
        $("#botonTiempoLuna");

    const botonMarte =
        $("#botonTiempoMarte");

    if (botonLuna) {
        botonLuna.setAttribute(
            "aria-pressed",
            String(mundo === "luna")
        );

        botonLuna.classList.toggle(
            "activo",
            mundo === "luna"
        );
    }

    if (botonMarte) {
        botonMarte.setAttribute(
            "aria-pressed",
            String(mundo === "marte")
        );

        botonMarte.classList.toggle(
            "activo",
            mundo === "marte"
        );
    }

    const detalle =
        $("#detalleEventoTiempo");

    if (detalle) {
        detalle.hidden = true;
    }
}


/* ==========================================================
   90. UPDATE TIMELINE STATUSES
========================================================== */

function actualizarEstadoCronologias() {

    $$(".evento-tiempo[data-objeto]")
        .forEach(tarjeta => {

            const descubierto =
                estaDescubierto(
                    tarjeta.dataset.objeto
                );

            tarjeta.classList.toggle(
                "descubierto",
                descubierto
            );

            const estado =
                tarjeta.querySelector(
                    ".estado-evento-tiempo"
                );

            if (estado) {
                estado.textContent =
                    descubierto
                        ? "RECORD RECOVERED"
                        : "RECORD PENDING";
            }
        });
}


/* ==========================================================
   91. OPEN AN EVENT
========================================================== */

function abrirEvento(id) {

    const objeto =
        typeof id === "string"
            ? obtenerObjeto(id)
            : id;

    if (!objeto) {
        return false;
    }

    ESTADO_PANELES.eventoActual =
        objeto.id;

    const detalle =
        $("#detalleEventoTiempo");

    if (!detalle) {
        return abrirObjeto(objeto.id);
    }

    detalle.hidden = false;
    detalle.dataset.objeto = objeto.id;

    escribirTexto(
        "#fechaEventoTiempo",
        objeto.fecha
    );

    escribirTexto(
        "#tituloEventoTiempo",
        objeto.nombre
    );

    const dossier =
        obtenerDossier(objeto.id);

    escribirTexto(
        "#descripcionEventoTiempo",
        dossier?.durante ||
        objeto.historia
    );

    escribirTexto(
        "#datosEventoTiempo",
        [
            `MISSION: ${objeto.mision}`,
            `LOCATION: ${objeto.ubicacion}`,
            `STATUS: ${objeto.estado}`
        ].join(" · ")
    );

    const visual =
        $("#imagenEventoTiempo");

    if (visual) {
        visual.replaceChildren(
            crearElemento(
                "span",
                "icono-evento-ampliado",
                objeto.icono || "🛰️"
            )
        );
    }

    const boton =
        $("#abrirObjetoEvento");

    if (boton) {
        boton.hidden = false;
    }

    detalle.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

    return true;
}


/* ==========================================================
   92. SCIENTIFIC COMPARISON DATA

   We preserve the characteristics
   described in the original HTML.
========================================================== */

const DATOS_COMPARACION = [
    [
        "TYPE OF WORLD",
        "NATURAL SATELLITE",
        "PLANET"
    ],
    [
        "EXPLORATION",
        "CREWED AND ROBOTIC",
        "ROBOTIC"
    ],
    [
        "ATMOSPHERE",
        "EXTREMELY THIN EXOSPHERE",
        "THIN CO₂ ATMOSPHERE"
    ],
    [
        "SURFACE GRAVITY",
        "APPROX. 1.62 m/s²",
        "APPROX. 3.71 m/s²"
    ],
    [
        "WIND AND DUST",
        "NO ATMOSPHERIC WIND",
        "WIND AND DUST STORMS"
    ],
    [
        "PRESERVATION OF FOOTPRINTS",
        "VERY LONG-LASTING",
        "AFFECTED BY WIND AND DUST"
    ]
];


/* ==========================================================
   93. CREATE COMPARISON ROW
========================================================== */

function crearFilaComparacion(
    caracteristica,
    luna,
    marte,
    encabezado = false
) {

    const fila =
        crearElemento(
            "div",
            encabezado
                ? "fila-comparacion fila-encabezado"
                : "fila-comparacion"
        );

    [caracteristica, luna, marte]
        .forEach(valor => {
            fila.appendChild(
                crearElemento(
                    "span",
                    "",
                    valor
                )
            );
        });

    return fila;
}

/* ==========================================================
   94. UPDATE COMPARISON
========================================================== */

function actualizarComparacion() {

    const contenedor =
        $("#datosComparacion");

    if (!contenedor) {
        return;
    }

    const fragmento =
        document.createDocumentFragment();

    fragmento.appendChild(
        crearFilaComparacion(
            "FEATURE",
            "THE MOON",
            "MARS",
            true
        )
    );

    DATOS_COMPARACION.forEach(datos => {
        fragmento.appendChild(
            crearFilaComparacion(...datos)
        );
    });

    // Comparison of museum records.
    fragmento.appendChild(
        crearFilaComparacion(
            "MUSEUM RECORDS",
            String(contarObjetosMundo("luna")),
            String(contarObjetosMundo("marte"))
        )
    );

    fragmento.appendChild(
        crearFilaComparacion(
            "RECOVERED RECORDS",
            String(
                contarDescubiertosMundo("luna")
            ),
            String(
                contarDescubiertosMundo("marte")
            )
        )
    );

    contenedor.replaceChildren(fragmento);
}


/* ==========================================================
   95. INVENTORY STATISTICS
========================================================== */

function obtenerEstadisticasInventario() {

    const total = ARCHIVO.length;

    const recuperados =
        ESTADO.descubiertos.size;

    return {
        total,
        recuperados,
        pendientes:
            Math.max(0, total - recuperados)
    };
}


/* ==========================================================
   96. FILTER FORGOTTEN OBJECTS
========================================================== */

function filtrarObjetosOlvidados() {

    return ARCHIVO.filter(objeto => {

        const coincideMundo =
            ESTADO_PANELES.mundoInventario ===
                "todos" ||
            objeto.mundo ===
                ESTADO_PANELES.mundoInventario;

        const descubierto =
            estaDescubierto(objeto.id);

        const coincideEstado =
            ESTADO_PANELES.filtroInventario ===
                "todos" ||
            (
                ESTADO_PANELES.filtroInventario ===
                    "recuperados" &&
                descubierto
            ) ||
            (
                ESTADO_PANELES.filtroInventario ===
                    "pendientes" &&
                !descubierto
            );

        return coincideMundo && coincideEstado;
    });
}


/* ==========================================================
   97. CREATE FILTER BUTTON
========================================================== */

function crearBotonFiltroInventario(
    texto,
    valor,
    tipo
) {

    const activo =
        ESTADO_PANELES[tipo] === valor;

    const boton =
        crearElemento(
            "button",
            activo
                ? "filtro-inventario activo"
                : "filtro-inventario",
            texto
        );

    boton.type = "button";

    boton.setAttribute(
        "aria-pressed",
        String(activo)
    );

    boton.addEventListener("click", () => {

        ESTADO_PANELES[tipo] = valor;

        actualizarObjetosOcultos();
    });

    return boton;
}


/* ==========================================================
   98. CREATE INVENTORY FILTERS
========================================================== */

function crearFiltrosObjetosOlvidados() {

    const filtros =
        crearElemento(
            "div",
            "filtros-inventario"
        );

    const estados =
        crearElemento(
            "div",
            "grupo-filtros-inventario"
        );

    [
        ["ALL", "todos"],
        ["PENDING", "pendientes"],
        ["RECOVERED", "recuperados"]
    ].forEach(([texto, valor]) => {

        estados.appendChild(
            crearBotonFiltroInventario(
                texto,
                valor,
                "filtroInventario"
            )
        );
    });

    const mundos =
        crearElemento(
            "div",
            "grupo-filtros-inventario"
        );

    [
        ["BOTH WORLDS", "todos"],
        ["🌕 MOON", "luna"],
        ["🔴 MARS", "marte"]
    ].forEach(([texto, valor]) => {

        mundos.appendChild(
            crearBotonFiltroInventario(
                texto,
                valor,
                "mundoInventario"
            )
        );
    });

    filtros.append(
        estados,
        mundos
    );

    return filtros;
}


/* ==========================================================
   99. CREATE INVENTORY RECORD
========================================================== */

function crearRegistroInventario(objeto) {

    const descubierto =
        estaDescubierto(objeto.id);

    const tarjeta =
        crearElemento(
            "article",
            "registro-inventario"
        );

    tarjeta.dataset.objeto = objeto.id;

    tarjeta.classList.toggle(
        "descubierto",
        descubierto
    );

    const icono =
        crearElemento(
            "span",
            "icono-registro-inventario",
            objeto.icono || "🛰️"
        );

    const nombre =
        crearElemento(
            "h4",
            "",
            objeto.nombre
        );

    const ubicacion =
        crearElemento(
            "p",
            "",
            objeto.ubicacion
        );

    const fecha =
        crearElemento(
            "span",
            "fecha-registro-inventario",
            objeto.fecha
        );

    const estado =
        crearElemento(
            "span",
            "estado-registro-inventario",
            descubierto
                ? "✓ RECOVERED"
                : "○ PENDING"
        );

    const boton =
        crearElemento(
            "button",
            "boton-registro-inventario",
            "OPEN RECORD"
        );

    boton.type = "button";

    boton.addEventListener("click", () => {
        abrirObjeto(objeto.id);
    });

    tarjeta.append(
        icono,
        nombre,
        fecha,
        ubicacion,
        estado,
        boton
    );

    return tarjeta;
}


/* ==========================================================
   100. UPDATE INVENTORY
========================================================== */

function actualizarObjetosOcultos() {

    const contenedor =
        $("#listaObjetosOcultos");

    if (!contenedor) {
        return;
    }

    const estadisticas =
        obtenerEstadisticasInventario();

    const encabezado =
        crearElemento(
            "header",
            "encabezado-inventario"
        );

    encabezado.append(
        crearElemento(
            "h3",
            "",
            "THE INVENTORY OF THE FORGOTTEN"
        ),

        crearElemento(
            "p",
            "contador-inventario",
            `${estadisticas.recuperados} recovered · ` +
            `${estadisticas.pendientes} pending · ` +
            `${estadisticas.total} historical records`
        )
    );

    const filtros =
        crearFiltrosObjetosOlvidados();

    const rejilla =
        crearElemento(
            "div",
            "rejilla-inventario"
        );

    const objetos =
        filtrarObjetosOlvidados();

    if (objetos.length === 0) {

        rejilla.appendChild(
            crearElemento(
                "p",
                "mensaje-inventario-vacio",
                "No records match " +
                "the selected filters."
            )
        );

    } else {

        const fragmento =
            document.createDocumentFragment();

        objetos.forEach(objeto => {
            fragmento.appendChild(
                crearRegistroInventario(objeto)
            );
        });

        rejilla.appendChild(fragmento);
    }

    contenedor.replaceChildren(
        encabezado,
        filtros,
        rejilla
    );
}


/* ==========================================================
   101. UPDATE AFTER A DISCOVERY

   This function is already called from
   registrarDescubrimiento() in PART 4.
========================================================== */

function actualizarPanelesExploracion() {

    actualizarEstadoCronologias();

    actualizarComparacion();

    actualizarObjetosOcultos();
}


/* ==========================================================
   102. PREPARE TIMELINE CONTROLS
========================================================== */

function prepararControlesCronologia() {

    const botonLuna =
        $("#botonTiempoLuna");

    const botonMarte =
        $("#botonTiempoMarte");

    if (botonLuna) {
        botonLuna.addEventListener(
            "click",
            () => {
                seleccionarMundoCronologia("luna");
            }
        );
    }

    if (botonMarte) {
        botonMarte.addEventListener(
            "click",
            () => {
                seleccionarMundoCronologia("marte");
            }
        );
    }

    const abrirExpediente =
        $("#abrirObjetoEvento");

    if (abrirExpediente) {

        abrirExpediente.addEventListener(
            "click",
            () => {

                const id =
                    ESTADO_PANELES.eventoActual;

                if (id) {
                    abrirObjeto(id);
                }
            }
        );
    }
}


/* ==========================================================
   103. PREPARE COMPARISON AND INVENTORY
========================================================== */

function prepararComparacionEInventario() {

    if (ESTADO_PANELES.controlesPreparados) {
        return;
    }

    dibujarCronologias();

    prepararControlesCronologia();

    actualizarComparacion();

    actualizarObjetosOcultos();

    ESTADO_PANELES.controlesPreparados = true;

    console.log(
        "[ARCHIVO] Timelines, comparison " +
        "and inventory ready."
    );
}


/* ==========================================================
   END OF NEW PART 7
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 8
   EXPLORER QUIZ

   Compatible with PARTS 1 TO 7.
========================================================== */


/* ==========================================================
   104. THE TEN ORIGINAL QUESTIONS

   PREGUNTAS was already declared as []
   in PART 1.

   Here we add its elements.
========================================================== */

PREGUNTAS.push(

    {
        pregunta:
            "Which mission first brought " +
            "humans to the lunar surface?",

        opciones: [
            "Apollo 11",
            "Apollo 17",
            "Viking 1",
            "Surveyor 1"
        ],

        correcta: 0,

        explicacion:
            "Apollo 11 brought Neil Armstrong " +
            "and Buzz Aldrin to the surface " +
            "of the Moon in July 1969."
    },

    {
        pregunta:
            "Which vehicle was NASA's first " +
            "rover to travel across Mars?",

        opciones: [
            "Curiosity",
            "Sojourner",
            "Opportunity",
            "Spirit"
        ],

        correcta: 1,

        explicacion:
            "Sojourner arrived on Mars with " +
            "Mars Pathfinder in 1997."
    },

    {
        pregunta:
            "Which mission delivered the " +
            "Lunokhod 1 rover to the Moon?",

        opciones: [
            "Apollo 12",
            "Luna 17",
            "Viking 2",
            "Surveyor 3"
        ],

        correcta: 1,

        explicacion:
            "The Soviet Luna 17 mission " +
            "transported Lunokhod 1 in 1970."
    },

    {
        pregunta:
            "On which planet did Viking 1 land?",

        opciones: [
            "Venus",
            "Mercury",
            "Mars",
            "Jupiter"
        ],

        correcta: 2,

        explicacion:
            "Viking 1 landed on Mars, " +
            "in the Chryse Planitia region, " +
            "on July 20, 1976."
    },

    {
        pregunta:
            "Which mission studied " +
            "Martian earthquakes?",

        opciones: [
            "InSight",
            "Phoenix",
            "Apollo 14",
            "Luna 9"
        ],

        correcta: 0,

        explicacion:
            "InSight used a seismometer " +
            "to study the internal " +
            "structure of Mars."
    },

    {
        pregunta:
            "Which vehicle performed " +
            "controlled flights on Mars?",

        opciones: [
            "Spirit",
            "Ingenuity",
            "Lunokhod 1",
            "Sojourner"
        ],

        correcta: 1,

        explicacion:
            "Ingenuity performed the first " +
            "powered and controlled flight " +
            "on another planet in April 2021."
    },

    {
        pregunta:
            "Which Apollo mission used " +
            "a lunar rover for the first time?",

        opciones: [
            "Apollo 11",
            "Apollo 12",
            "Apollo 15",
            "Apollo 14"
        ],

        correcta: 2,

        explicacion:
            "Apollo 15 was the first Apollo " +
            "mission to use a crewed " +
            "lunar vehicle."
    },

    {
        pregunta:
            "Which lander investigated " +
            "ice near the Martian " +
            "north pole?",

        opciones: [
            "Phoenix",
            "Viking 1",
            "InSight",
            "Pathfinder"
        ],

        correcta: 0,

        explicacion:
            "Phoenix excavated the polar soil " +
            "of Mars and confirmed the " +
            "presence of water ice."
    },

    {
        pregunta:
            "Which mission made the first " +
            "soft landing on the Moon?",

        opciones: [
            "Surveyor 1",
            "Luna 9",
            "Apollo 11",
            "Luna 2"
        ],

        correcta: 1,

        explicacion:
            "The Soviet Luna 9 probe " +
            "made the first lunar " +
            "soft landing in February 1966."
    },

    {
        pregunta:
            "Which rover traveled more than " +
            "45 kilometers on Mars?",

        opciones: [
            "Spirit",
            "Sojourner",
            "Opportunity",
            "Lunokhod 1"
        ],

        correcta: 2,

        explicacion:
            "Opportunity traveled more than " +
            "45 kilometers during nearly " +
            "fifteen years of exploration."
    }

);


/* ==========================================================
   105. QUIZ CONFIGURATION
========================================================== */

const CONFIGURACION_QUIZ = {
    puntosPorRespuesta: 1,
    mostrarExplicacion: true,
    permitirReintentar: true
};


/* ==========================================================
   106. ADDITIONAL QUIZ STATE
========================================================== */

const ESTADO_QUIZ = {
    respuestaConfirmada: false,
    controlesPreparados: false
};


/* ==========================================================
   107. VERIFY THE QUESTIONS
========================================================== */

function verificarPreguntas() {

    const cantidadCorrecta =
        PREGUNTAS.length ===
        CONFIGURACION.cantidadPreguntas;

    const estructuraCorrecta =
        PREGUNTAS.every(pregunta => {

            return (
                typeof pregunta.pregunta ===
                    "string" &&

                Array.isArray(
                    pregunta.opciones
                ) &&

                pregunta.opciones.length === 4 &&

                Number.isInteger(
                    pregunta.correcta
                ) &&

                pregunta.correcta >= 0 &&

                pregunta.correcta <
                    pregunta.opciones.length
            );
        });

    if (
        !cantidadCorrecta ||
        !estructuraCorrecta
    ) {
        console.error(
            "[ARCHIVO] The quiz questions " +
            "are incorrect."
        );

        return false;
    }

    console.log(
        "[ARCHIVO] Quiz verified: " +
        PREGUNTAS.length +
        " questions."
    );

    return true;
}


/* ==========================================================
   108. DISPLAY A QUESTION
========================================================== */

function mostrarPregunta() {

    if (ESTADO.cuestionarioTerminado) {
        return;
    }

    const pregunta =
        PREGUNTAS[ESTADO.preguntaActual];

    if (!pregunta) {
        return;
    }

    ESTADO.respuestaSeleccionada = null;

    ESTADO_QUIZ.respuestaConfirmada = false;

    escribirTexto(
        "#numeroPregunta",
        `QUESTION ${ESTADO.preguntaActual + 1} ` +
        `OF ${PREGUNTAS.length}`
    );

    escribirTexto(
        "#puntuacionActual",
        `POINTS: ${ESTADO.aciertos}`
    );

    escribirTexto(
        "#textoPregunta",
        pregunta.pregunta
    );

    const progreso =
        $("#avancePreguntas");

    if (progreso) {

        progreso.style.width =
            (
                ESTADO.preguntaActual /
                PREGUNTAS.length *
                100
            ) + "%";
    }

    const opciones =
        $("#opcionesPregunta");

    if (opciones) {

        const fragmento =
            document.createDocumentFragment();

        pregunta.opciones.forEach(
            (opcion, indice) => {

                fragmento.appendChild(
                    crearOpcionPregunta(
                        opcion,
                        indice
                    )
                );
            }
        );

        opciones.replaceChildren(fragmento);
    }

    const siguiente =
        $("#botonSiguientePregunta");

    if (siguiente) {

        siguiente.disabled = true;

        siguiente.textContent =
            ESTADO.preguntaActual ===
                PREGUNTAS.length - 1
                ? "VIEW RESULTS →"
                : "NEXT QUESTION →";
    }

    const resultado =
        $("#resultadoCuestionario");

    if (resultado) {
        resultado.hidden = true;
    }

    const contenedor =
        $("#contenedorPregunta");

    if (contenedor) {
        contenedor.hidden = false;
    }

    eliminarRetroalimentacionQuiz();
}


/* ==========================================================
   109. CREATE ANSWER OPTIONS
========================================================== */

function crearOpcionPregunta(
    texto,
    indice
) {

    const boton =
        crearElemento(
            "button",
            "opcion-pregunta"
        );

    boton.type = "button";

    boton.dataset.indice = String(indice);

    const letra =
        crearElemento(
            "span",
            "letra-opcion",
            String.fromCharCode(65 + indice)
        );

    const contenido =
        crearElemento(
            "span",
            "texto-opcion",
            texto
        );

    boton.append(
        letra,
        contenido
    );

    boton.addEventListener(
        "click",
        () => {
            seleccionarRespuesta(indice);
        }
    );

    return boton;
}

/* ==========================================================
   110. SELECT AN ANSWER

   Each question is graded only once.
========================================================== */

function seleccionarRespuesta(indice) {

    if (
        ESTADO.cuestionarioTerminado ||
        ESTADO_QUIZ.respuestaConfirmada
    ) {
        return false;
    }

    const pregunta =
        PREGUNTAS[ESTADO.preguntaActual];

    if (
        !pregunta ||
        !Number.isInteger(indice) ||
        indice < 0 ||
        indice >= pregunta.opciones.length
    ) {
        return false;
    }

    ESTADO.respuestaSeleccionada = indice;

    ESTADO_QUIZ.respuestaConfirmada = true;

    const esCorrecta =
        indice === pregunta.correcta;

    if (esCorrecta) {

        ESTADO.aciertos +=
            CONFIGURACION_QUIZ
                .puntosPorRespuesta;
    }

    // ----------------------------------------
    // Show correct and incorrect options
    // ----------------------------------------

    $$("#opcionesPregunta .opcion-pregunta")
        .forEach(boton => {

            const numero =
                Number(boton.dataset.indice);

            boton.disabled = true;

            boton.classList.toggle(
                "correcta",
                numero === pregunta.correcta
            );

            boton.classList.toggle(
                "incorrecta",
                numero === indice &&
                !esCorrecta
            );

            boton.classList.toggle(
                "seleccionada",
                numero === indice
            );

            boton.setAttribute(
                "aria-pressed",
                String(numero === indice)
            );
        });

    escribirTexto(
        "#puntuacionActual",
        `POINTS: ${ESTADO.aciertos}`
    );

    mostrarRetroalimentacionQuiz(
        esCorrecta,
        pregunta
    );

    const siguiente =
        $("#botonSiguientePregunta");

    if (siguiente) {
        siguiente.disabled = false;
    }

    if (esCorrecta) {

        if (
            typeof sonidoRespuestaCorrecta ===
            "function"
        ) {
            sonidoRespuestaCorrecta();
        }

    } else {

        if (
            typeof sonidoRespuestaIncorrecta ===
            "function"
        ) {
            sonidoRespuestaIncorrecta();
        }
    }

    return true;
}


/* ==========================================================
   111. EDUCATIONAL FEEDBACK
========================================================== */

function mostrarRetroalimentacionQuiz(
    esCorrecta,
    pregunta
) {

    const contenedor =
        $("#contenedorPregunta");

    if (!contenedor) {
        return;
    }

    eliminarRetroalimentacionQuiz();

    const bloque =
        crearElemento(
            "div",
            esCorrecta
                ? "retroalimentacion-quiz correcta"
                : "retroalimentacion-quiz incorrecta"
        );

    bloque.id = "retroalimentacionQuiz";

    bloque.setAttribute(
        "role",
        "status"
    );

    const titulo =
        crearElemento(
            "strong",
            "",
            esCorrecta
                ? "✓ CORRECT ANSWER!"
                : "✕ INCORRECT ANSWER"
        );

    const explicacion =
        crearElemento(
            "p",
            "",
            pregunta.explicacion ||
            (
                "Correct answer: " +
                pregunta.opciones[
                    pregunta.correcta
                ]
            )
        );

    bloque.append(
        titulo,
        explicacion
    );

    contenedor.appendChild(bloque);
}


/* ==========================================================
   112. REMOVE PREVIOUS FEEDBACK
========================================================== */

function eliminarRetroalimentacionQuiz() {

    const anterior =
        $("#retroalimentacionQuiz");

    if (anterior) {
        anterior.remove();
    }
}


/* ==========================================================
   113. ADVANCE TO THE NEXT QUESTION
========================================================== */

function siguientePregunta() {

    if (
        ESTADO.cuestionarioTerminado ||
        !ESTADO_QUIZ.respuestaConfirmada
    ) {
        return;
    }

    ESTADO.preguntaActual++;

    if (
        ESTADO.preguntaActual >=
        PREGUNTAS.length
    ) {

        finalizarCuestionario();

    } else {

        mostrarPregunta();
    }

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   114. RESULT MESSAGE
========================================================== */

function obtenerMensajeResultado(
    aciertos,
    total
) {

    if (aciertos === total) {

        return (
            "LEGENDARY EXPLORER! " +
            "Ratatopo is impressed. " +
            "You have answered all " +
            "the archive questions correctly."
        );
    }

    if (aciertos >= 8) {

        return (
            "EXCELLENT EXPLORATION! " +
            "You know the historic missions " +
            "to the Moon and Mars very well."
        );
    }

    if (aciertos >= 6) {

        return (
            "GOOD JOB, EXPLORER! " +
            "You have learned a lot. " +
            "There are still some " +
            "secrets left to discover."
        );
    }

    if (aciertos >= 4) {

        return (
            "KEEP INVESTIGATING! " +
            "Ratatopo recommends visiting " +
            "the historical dossiers " +
            "before trying again."
        );
    }

    return (
        "YOUR ADVENTURE IS JUST BEGINNING! " +
        "Explore the missions, read their " +
        "stories, and return to the challenge."
    );
}


/* ==========================================================
   115. FINISH THE QUIZ
========================================================== */

function finalizarCuestionario() {

    if (ESTADO.cuestionarioTerminado) {
        return;
    }

    ESTADO.cuestionarioTerminado = true;

    // Save only the best result
    // from this visit, in memory.
    ESTADO.mejorQuiz = Math.max(
        ESTADO.mejorQuiz,
        ESTADO.aciertos
    );

    // Nothing is saved in the browser.
    guardarProgreso();

    // Update museum progress.
    actualizarProgreso();

    const contenedor =
        $("#contenedorPregunta");

    const resultado =
        $("#resultadoCuestionario");

    const siguiente =
        $("#botonSiguientePregunta");

    if (contenedor) {
        contenedor.hidden = true;
    }

    if (resultado) {
        resultado.hidden = false;
    }

    if (siguiente) {
        siguiente.hidden = true;
    }

    const avance =
        $("#avancePreguntas");

    if (avance) {
        avance.style.width = "100%";
    }

    escribirTexto(
        "#numeroPregunta",
        "CHALLENGE COMPLETED"
    );

    escribirTexto(
        "#puntuacionActual",
        `POINTS: ${ESTADO.aciertos}`
    );

    escribirTexto(
        "#mensajeResultado",
        obtenerMensajeResultado(
            ESTADO.aciertos,
            PREGUNTAS.length
        )
    );

    escribirTexto(
        "#calificacionFinal",
        `${ESTADO.aciertos} / ` +
        `${PREGUNTAS.length} CORRECT ANSWERS`
    );

    if (
        typeof celebrarResultadoRatatopo ===
        "function"
    ) {
        celebrarResultadoRatatopo(
            ESTADO.aciertos
        );
    }

    console.log(
        "[ARCHIVO] Quiz completed:",
        ESTADO.aciertos,
        "out of",
        PREGUNTAS.length
    );
}


/* ==========================================================
   116. RESTART THE QUIZ

   Restarts only the quiz.

   Discoveries remain available
   during the current visit.

   The highest score also remains
   until the page is reloaded.
========================================================== */

function reiniciarCuestionario() {

    ESTADO.preguntaActual = 0;

    ESTADO.aciertos = 0;

    ESTADO.respuestaSeleccionada = null;

    ESTADO.cuestionarioTerminado = false;

    ESTADO_QUIZ.respuestaConfirmada = false;

    const siguiente =
        $("#botonSiguientePregunta");

    if (siguiente) {
        siguiente.hidden = false;
        siguiente.disabled = true;
    }

    const resultado =
        $("#resultadoCuestionario");

    if (resultado) {
        resultado.hidden = true;
    }

    const contenedor =
        $("#contenedorPregunta");

    if (contenedor) {
        contenedor.hidden = false;
    }

    mostrarPregunta();

    actualizarProgreso();

    console.log(
        "[ARCHIVO] Quiz restarted."
    );
}


/* ==========================================================
   117. UPDATE QUIZ VIEW

   This function is called from
   mostrarSeccion("cuestionario").
========================================================== */

function actualizarVistaCuestionario() {

    if (ESTADO.cuestionarioTerminado) {

        const resultado =
            $("#resultadoCuestionario");

        const contenedor =
            $("#contenedorPregunta");

        if (resultado) {
            resultado.hidden = false;
        }

        if (contenedor) {
            contenedor.hidden = true;
        }

        return;
    }

    // If the user is already answering a question,
    // preserve its current state.
    const opciones =
        $("#opcionesPregunta");

    if (
        opciones &&
        opciones.children.length > 0
    ) {
        return;
    }

    mostrarPregunta();
}


/* ==========================================================
   118. QUIZ SUMMARY
========================================================== */

function obtenerResumenCuestionario() {

    return {
        total: PREGUNTAS.length,

        preguntaActual:
            ESTADO.preguntaActual,

        aciertos:
            ESTADO.aciertos,

        mejorResultado:
            ESTADO.mejorQuiz,

        terminado:
            ESTADO.cuestionarioTerminado,

        porcentajeMejorResultado:
            PREGUNTAS.length > 0
                ? Math.round(
                    ESTADO.mejorQuiz /
                    PREGUNTAS.length *
                    100
                )
                : 0
    };
}


/* ==========================================================
   119. PREPARE QUIZ CONTROLS

   This will be called only once from
   iniciarAplicacion().
========================================================== */

function prepararCuestionario() {

    if (ESTADO_QUIZ.controlesPreparados) {
        return;
    }

    if (!verificarPreguntas()) {
        return;
    }

    const siguiente =
        $("#botonSiguientePregunta");

    const reiniciar =
        $("#reiniciarCuestionario");

    if (siguiente) {

        siguiente.addEventListener(
            "click",
            siguientePregunta
        );
    }

    if (reiniciar) {

        reiniciar.addEventListener(
            "click",
            reiniciarCuestionario
        );
    }

    // Ensure the initial state.
    ESTADO.preguntaActual = 0;

    ESTADO.aciertos = 0;

    ESTADO.respuestaSeleccionada = null;

    ESTADO.cuestionarioTerminado = false;

    ESTADO_QUIZ.respuestaConfirmada = false;

    mostrarPregunta();

    ESTADO_QUIZ.controlesPreparados = true;

    console.log(
        "[ARCHIVO] Quiz ready: " +
        PREGUNTAS.length +
        " questions."
    );
}


/* ==========================================================
   END OF NEW PART 8
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 9
   INTERACTIVE RATATOPO AND SPACE AUDIO

   Compatible with PARTS 1 TO 8.
   Does not use external audio files.
========================================================== */


/* ==========================================================
   120. ASSISTANT AND AUDIO STATE
========================================================== */

const ESTADO_RATATOPO = {
    preparado: false,
    ultimoConsejo: -1,
    temporizador: null,
    focoAnterior: null
};

const ESTADO_AUDIO = {
    preparado: false,
    volumen: 0.12,
    ultimoClick: 0
};


/* ==========================================================
   121. RATATOPO'S EDUCATIONAL MESSAGES
========================================================== */

const AYUDAS_RATATOPO = {

    luna:
        "The Moon is a museum of exploration! " +
        "We have 12 historical records, " +
        "from Luna 2 to the Apollo vehicles. " +
        "Explore the cards, open the dossiers, " +
        "and record your discoveries.",

    marte:
        "Mars holds many stories! " +
        "You will find 12 records of landers, " +
        "rovers, and even a helicopter. " +
        "Discover what happened to each mission.",

    progreso:
        "To make progress, open a dossier and press " +
        "RECORD DISCOVERY. The 24 objects " +
        "contribute 90% of the progress. " +
        "The quiz contributes the remaining 10%. " +
        "Everything starts over when you reload the page.",

    comic:
        "Every object has its own comic! " +
        "Inside the dossier, you will find four " +
        "panels. Use PREVIOUS and NEXT to " +
        "discover the challenge, the journey, " +
        "the historical moment, and its legacy.",

    tiempo:
        "The timelines show how " +
        "space exploration progressed. " +
        "You can compare Moon and Mars missions, " +
        "select events, " +
        "and open their dossiers."
};

const CONSEJOS_RATATOPO = [
    "Space tip! Not every mission ended as expected. Mistakes also teach us science.",

    "Fun fact! On the Moon, there is no atmospheric wind to erase footprints as happens on Earth.",

    "Remember! A photograph from a mission does not always show the object as it is today.",

    "Explore the comics! Their dialogues are educational recreations, not historical transcripts.",

    "A good explorer compares sources! Check the institutional links in each dossier.",

    "Special mission! Try to recover all 12 lunar records and all 12 Martian records."
];


/* ==========================================================
   122. OPEN RATATOPO ASSISTANT
========================================================== */

function abrirRatatopo() {

    const ventana = $("#ventanaRatatopo");
    const boton = $("#botonRatatopo");

    if (!ventana) return false;

    if (ventana.hidden) {
        ESTADO_RATATOPO.focoAnterior =
            document.activeElement;
    }

    ventana.hidden = false;
    ventana.classList.add("activo");

    ESTADO.ratatopoAbierto = true;

    if (boton) {
        boton.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    return true;
}


/* ==========================================================
   123. CLOSE RATATOPO ASSISTANT
========================================================== */

function cerrarRatatopo() {

    const ventana = $("#ventanaRatatopo");
    const boton = $("#botonRatatopo");

    if (!ventana) return false;

    ventana.hidden = true;
    ventana.classList.remove("activo");

    ESTADO.ratatopoAbierto = false;

    if (boton) {
        boton.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    const foco =
        ESTADO_RATATOPO.focoAnterior;

    if (
        foco &&
        foco.isConnected &&
        typeof foco.focus === "function"
    ) {
        foco.focus();
    }

    ESTADO_RATATOPO.focoAnterior = null;

    return true;
}


/* ==========================================================
   124. TOGGLE ASSISTANT
========================================================== */

function alternarRatatopo() {

    if (ESTADO.ratatopoAbierto) {
        cerrarRatatopo();
    } else {
        abrirRatatopo();
    }

    sonidoClick();
}


/* ==========================================================
   125. DISPLAY RATATOPO MESSAGE
========================================================== */

function mensajeRatatopo(
    mensaje,
    abrirPanel = true
) {

    const contenedor = $("#mensajeRatatopo");

    if (!contenedor) return;

    // textContent prevents HTML from being interpreted
    // if accidentally included in a message.
    contenedor.textContent = String(mensaje);

    if (abrirPanel) {
        abrirRatatopo();
    }

    const asistente = $("#asistenteRatatopo");

    if (!asistente) return;

    asistente.classList.remove(
        "ratatopo-hablando"
    );

    // Restart the CSS animation.
    void asistente.offsetWidth;

    asistente.classList.add(
        "ratatopo-hablando"
    );

    if (ESTADO_RATATOPO.temporizador) {
        clearTimeout(
            ESTADO_RATATOPO.temporizador
        );
    }

    ESTADO_RATATOPO.temporizador =
        setTimeout(() => {

            asistente.classList.remove(
                "ratatopo-hablando"
            );

            ESTADO_RATATOPO.temporizador =
                null;

        }, 1200);
}


/* ==========================================================
   126. RESPOND TO HELP BUTTONS
========================================================== */

function responderAyudaRatatopo(tipo) {

    const respuesta =
        AYUDAS_RATATOPO[tipo];

    if (!respuesta) return false;

    mensajeRatatopo(respuesta);

    sonidoClick();

    return true;
}


/* ==========================================================
   127. RANDOM TIPS
========================================================== */

function darConsejoRatatopo() {

    if (!CONSEJOS_RATATOPO.length) {
        return;
    }

    let indice = Math.floor(
        Math.random() *
        CONSEJOS_RATATOPO.length
    );

    if (CONSEJOS_RATATOPO.length > 1) {

        while (
            indice ===
            ESTADO_RATATOPO.ultimoConsejo
        ) {
            indice = Math.floor(
                Math.random() *
                CONSEJOS_RATATOPO.length
            );
        }
    }

    ESTADO_RATATOPO.ultimoConsejo = indice;

    mensajeRatatopo(
        CONSEJOS_RATATOPO[indice]
    );

    sonidoClick();
}


/* ==========================================================
   128. GIVE A HINT ABOUT A PENDING OBJECT
========================================================== */

function darPistaRatatopo() {

    const pendientes =
        ARCHIVO.filter(objeto => {
            return !estaDescubierto(objeto.id);
        });

    if (pendientes.length === 0) {

        mensajeRatatopo(
            "Incredible, explorer! " +
            "You have recovered all 24 records. " +
            "Now try to score " +
            "10 out of 10 on the quiz!"
        );

        return;
    }

    const indice = Math.floor(
        Math.random() * pendientes.length
    );

    const objeto = pendientes[indice];

    const mundo =
        objeto.mundo === "luna"
            ? "the Moon"
            : "Mars";

    mensajeRatatopo(
        `I have a hint! On ${mundo} ` +
        `you can still discover ${objeto.nombre}. ` +
        `Look for the ${objeto.mision} mission ` +
        "and open its dossier."
    );
}


/* ==========================================================
   129. REPORT CURRENT PROGRESS
========================================================== */

function informarProgresoRatatopo() {

    const resumen =
        obtenerResumenExploracion();

    const porcentaje =
        calcularProgreso();

    mensajeRatatopo(
        `Exploration report! ` +
        `You have recovered ${resumen.descubiertos} ` +
        `out of ${resumen.total} objects: ` +
        `${resumen.luna} lunar and ` +
        `${resumen.marte} Martian. ` +
        `Your overall progress is ${porcentaje}%. ` +
        `Your best quiz score ` +
        `is ${ESTADO.mejorQuiz} out of 10.`
    );
}


/* ==========================================================
   130. MESSAGES BASED ON THE SECTION
========================================================== */

function orientarRatatopo(seccion) {

    const mensajes = {

        seleccionMundos:
            "Welcome to the archive! " +
            "Choose the Moon or Mars to begin.",

        vistaLuna:
            "We are on the Moon! " +
            "Investigate its 12 historical objects.",

        vistaMarte:
            "We have arrived on Mars! " +
            "Explore the 12 Martian records.",

        lineasTiempo:
            "Travel through history! " +
            "Select an event " +
            "from the timeline.",

        detalleObjeto:
            "You have found a dossier! " +
            "Read its story, view the images, " +
            "and record the discovery.",

        comparacionMundos:
            "Time to compare! " +
            "The Moon and Mars preserve " +
            "traces in different ways.",

        objetosOcultos:
            "This is our inventory. " +
            "Filter the recovered " +
            "and pending records.",

        cuestionario:
            "Space challenge! " +
            "Answer the ten questions " +
            "and show what you have learned."
    };

    const mensaje = mensajes[seccion];

    if (mensaje) {
        // Do not automatically open the panel
        // on every section change.
        mensajeRatatopo(mensaje, false);
    }
}


/* ==========================================================
   131. CELEBRATE A DISCOVERY

   Connected from registrarDescubrimiento()
   in PART 4.
========================================================== */

function celebrarDescubrimientoRatatopo(objeto) {

    if (!objeto) return;

    const total =
        ESTADO.descubiertos.size;

    const porcentaje =
        calcularProgreso();

    mensajeRatatopo(
        `Record recovered! ${objeto.nombre} ` +
        "is now part of your archive. " +
        `You have made ${total} out of 24 discoveries ` +
        `and your overall progress is ${porcentaje}%.`
    );

    if (total === ARCHIVO.length) {
        sonidoMisionCompletada();
    }
}


/* ==========================================================
   132. CELEBRATE QUIZ RESULT

   Connected from finalizarCuestionario()
   in PART 8.
========================================================== */

function celebrarResultadoRatatopo(aciertos) {

    const total = PREGUNTAS.length;

    mensajeRatatopo(
        obtenerMensajeResultado(
            aciertos,
            total
        ) +
        ` Your best score is ` +
        `${ESTADO.mejorQuiz} out of ${total}.`
    );

    if (aciertos === total) {
        sonidoMisionCompletada();
    }
}


/* ==========================================================
   133. PREPARE RATATOPO SYSTEM
========================================================== */

function prepararSistemaRatatopo() {

    if (ESTADO_RATATOPO.preparado) {
        return;
    }

    const abrir = $("#botonRatatopo");
    const cerrar = $("#cerrarRatatopo");
    const ventana = $("#ventanaRatatopo");

    if (ventana) {
        ventana.hidden = true;
    }

    if (abrir) {
        abrir.addEventListener(
            "click",
            alternarRatatopo
        );
    }

    if (cerrar) {
        cerrar.addEventListener(
            "click",
            cerrarRatatopo
        );
    }

    $$("[data-ayuda]").forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                responderAyudaRatatopo(
                    boton.dataset.ayuda
                );
            }
        );
    });

    // Add two useful options to the panel
    // without manually modifying the HTML.
    const opciones =
        $("#ventanaRatatopo .opciones-ratatopo");

    if (opciones) {

        const consejo =
            crearElemento(
                "button",
                "",
                "💡 GIVE ME A TIP"
            );

        consejo.type = "button";

        consejo.addEventListener(
            "click",
            darConsejoRatatopo
        );

        const pista =
            crearElemento(
                "button",
                "",
                "🔎 GIVE ME A HINT"
            );

        pista.type = "button";

        pista.addEventListener(
            "click",
            darPistaRatatopo
        );

        opciones.append(
            consejo,
            pista
        );
    }

    ESTADO_RATATOPO.preparado = true;

    mensajeRatatopo(
        "Hello, explorer! I'm Ratatopo. " +
        "I will accompany you throughout the mission. " +
        "Choose a question or ask me for a hint.",
        false
    );

    console.log(
        "[ARCHIVO] Ratatopo ready."
    );
}

/* ==========================================================
   134. WEB AUDIO ENGINE

   It is created only when the visitor
   enables sound by clicking.
========================================================== */

function obtenerContextoAudio() {

    if (!ESTADO.sonidoActivado) {
        return null;
    }

    const ConstructorAudio =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!ConstructorAudio) {
        return null;
    }

    if (!ESTADO.contextoAudio) {

        try {
            ESTADO.contextoAudio =
                new ConstructorAudio();

        } catch (error) {

            console.warn(
                "[ARCHIVO] Audio unavailable:",
                error
            );

            return null;
        }
    }

    return ESTADO.contextoAudio;
}


/* ==========================================================
   135. PLAY A SPACE TONE
========================================================== */

function reproducirTono({
    frecuencia = 440,
    frecuenciaFinal = frecuencia,
    duracion = 0.15,
    volumen = 0.3,
    tipo = "sine",
    retraso = 0
} = {}) {

    if (!ESTADO.sonidoActivado) {
        return false;
    }

    const audio = obtenerContextoAudio();

    if (!audio) {
        return false;
    }

    if (audio.state === "suspended") {
        audio.resume().catch(() => {});
    }

    try {

        const inicio =
            audio.currentTime +
            Math.max(0, retraso);

        const final =
            inicio +
            Math.max(0.02, duracion);

        const oscilador =
            audio.createOscillator();

        const ganancia =
            audio.createGain();

        const frecuenciaInicial =
            Math.max(20, frecuencia);

        const frecuenciaDestino =
            Math.max(20, frecuenciaFinal);

        oscilador.type = tipo;

        oscilador.frequency.setValueAtTime(
            frecuenciaInicial,
            inicio
        );

        oscilador.frequency.exponentialRampToValueAtTime(
            frecuenciaDestino,
            final
        );

        const amplitud =
            limitar(
                volumen *
                ESTADO_AUDIO.volumen,
                0,
                0.15
            );

        ganancia.gain.setValueAtTime(
            0.0001,
            inicio
        );

        ganancia.gain.linearRampToValueAtTime(
            Math.max(0.0001, amplitud),
            inicio + 0.015
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.0001,
            final
        );

        oscilador.connect(ganancia);

        ganancia.connect(
            audio.destination
        );

        oscilador.start(inicio);
        oscilador.stop(final + 0.02);

        oscilador.onended = () => {
            oscilador.disconnect();
            ganancia.disconnect();
        };

        return true;

    } catch (error) {

        console.warn(
            "[ARCHIVO] Could not play the tone:",
            error
        );

        return false;
    }
}


/* ==========================================================
   136. CLICK SOUND
========================================================== */

function sonidoClick() {

    const ahora = performance.now();

    if (
        ahora - ESTADO_AUDIO.ultimoClick < 65
    ) {
        return;
    }

    ESTADO_AUDIO.ultimoClick = ahora;

    reproducirTono({
        frecuencia: 620,
        frecuenciaFinal: 480,
        duracion: 0.065,
        volumen: 0.22
    });
}


/* ==========================================================
   137. DISCOVERY SOUND
========================================================== */

function sonidoDescubrimiento() {

    [440, 554, 659, 880].forEach(
        (frecuencia, indice) => {

            reproducirTono({
                frecuencia,
                frecuenciaFinal:
                    frecuencia * 1.03,
                duracion: 0.18,
                retraso: indice * 0.12,
                volumen: 0.35
            });
        }
    );
}


/* ==========================================================
   138. CORRECT ANSWER
========================================================== */

function sonidoRespuestaCorrecta() {

    [523, 659, 784].forEach(
        (frecuencia, indice) => {

            reproducirTono({
                frecuencia,
                duracion: 0.14,
                retraso: indice * 0.1,
                volumen: 0.3
            });
        }
    );
}


/* ==========================================================
   139. INCORRECT ANSWER
========================================================== */

function sonidoRespuestaIncorrecta() {

    reproducirTono({
        frecuencia: 330,
        frecuenciaFinal: 180,
        duracion: 0.3,
        volumen: 0.22,
        tipo: "triangle"
    });
}


/* ==========================================================
   140. JOURNEY START SOUND
========================================================== */

function sonidoInicioViaje() {

    reproducirTono({
        frecuencia: 110,
        frecuenciaFinal: 720,
        duracion: 0.8,
        volumen: 0.42,
        tipo: "sawtooth"
    });

    reproducirTono({
        frecuencia: 220,
        frecuenciaFinal: 900,
        duracion: 0.6,
        retraso: 0.2,
        volumen: 0.2
    });
}


/* ==========================================================
   141. HYPERSPACE SOUND
========================================================== */

function sonidoHiperespacio() {

    reproducirTono({
        frecuencia: 260,
        frecuenciaFinal: 1100,
        duracion: 0.55,
        volumen: 0.22,
        tipo: "triangle"
    });
}


/* ==========================================================
   142. ARRIVAL SOUND
========================================================== */

function sonidoLlegada() {

    [784, 587, 440].forEach(
        (frecuencia, indice) => {

            reproducirTono({
                frecuencia,
                duracion: 0.2,
                retraso: indice * 0.14,
                volumen: 0.28
            });
        }
    );
}


/* ==========================================================
   143. MISSION COMPLETED
========================================================== */

function sonidoMisionCompletada() {

    [392, 523, 659, 784, 1047].forEach(
        (frecuencia, indice) => {

            reproducirTono({
                frecuencia,
                duracion: 0.25,
                retraso: indice * 0.14,
                volumen: 0.32
            });
        }
    );
}


/* ==========================================================
   144. ENABLE OR DISABLE SOUND
========================================================== */

function alternarSonido() {

    ESTADO.sonidoActivado =
        !ESTADO.sonidoActivado;

    actualizarBotonSonido();

    if (ESTADO.sonidoActivado) {

        const audio = obtenerContextoAudio();

        if (audio?.state === "suspended") {
            audio.resume().catch(() => {});
        }

        sonidoClick();
    }

    console.log(
        "[ARCHIVO] Sound:",
        ESTADO.sonidoActivado
            ? "enabled"
            : "disabled"
    );
}


/* ==========================================================
   145. UPDATE SOUND BUTTON
========================================================== */

function actualizarBotonSonido() {

    const boton = $("#botonSonido");

    if (!boton) return;

    const activado =
        ESTADO.sonidoActivado;

    boton.textContent = activado
        ? "🔊 SOUND ON"
        : "🔇 SOUND OFF";

    boton.setAttribute(
        "aria-pressed",
        String(activado)
    );

    boton.setAttribute(
        "aria-label",
        activado
            ? "Disable sound effects"
            : "Enable sound effects"
    );
}


/* ==========================================================
   146. CREATE SOUND BUTTON

   The original HTML does not need
   another button added manually.
========================================================== */

function crearBotonSonido() {

    let boton = $("#botonSonido");

    if (boton) {
        return boton;
    }

    boton =
        crearElemento(
            "button",
            "boton-sonido-espacial"
        );

    boton.id = "botonSonido";
    boton.type = "button";

    const asistente =
        $("#asistenteRatatopo");

    if (asistente) {

        asistente.appendChild(boton);

    } else {

        document.body.appendChild(boton);
    }

    return boton;
}


/* ==========================================================
   147. PREPARE AUDIO SYSTEM
========================================================== */

function prepararSistemaAudio() {

    if (ESTADO_AUDIO.preparado) {
        return;
    }

    const boton =
        crearBotonSonido();

    boton.addEventListener(
        "click",
        alternarSonido
    );

    actualizarBotonSonido();

    ESTADO_AUDIO.preparado = true;

    console.log(
        "[ARCHIVO] Space audio ready."
    );
}


/* ==========================================================
   148. GENERAL MUSEUM EFFECTS
========================================================== */

function reproducirEfectoMuseo(tipo) {

    switch (tipo) {

        case "click":
            sonidoClick();
            break;

        case "descubrimiento":
            sonidoDescubrimiento();
            break;

        case "correcta":
            sonidoRespuestaCorrecta();
            break;

        case "incorrecta":
            sonidoRespuestaIncorrecta();
            break;

        case "despegue":
            sonidoInicioViaje();
            break;

        case "hiperespacio":
            sonidoHiperespacio();
            break;

        case "llegada":
            sonidoLlegada();
            break;

        case "completado":
            sonidoMisionCompletada();
            break;
    }
}


/* ==========================================================
   149. PREPARE RATATOPO AND AUDIO

   Runs only once from
   iniciarAplicacion() during final integration.
========================================================== */

function prepararRatatopoYAudio() {

    prepararSistemaRatatopo();

    prepararSistemaAudio();

    console.log(
        "[ARCHIVO] Ratatopo and audio ready."
    );
}


/* ==========================================================
   END OF NEW PART 9
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 10
   SPACESHIP, HYPERSPACE, MOON AND MARS IN 3D

   Requires Three.js r128, already included
   in the original HTML.

   Compatible with PARTS 1 TO 9.
========================================================== */


/* ==========================================================
   150. 3D ENGINE CONFIGURATION
========================================================== */

const CONFIGURACION_3D = {
    estrellas: 850,
    velocidadNormal: 0.12,
    velocidadHiperespacio: 2.5,
    radioPlaneta: 1.8,
    distanciaCamara: 5.4,
    distanciaMinima: 2.8,
    distanciaMaxima: 9,
    giroAutomatico: 0.002,
    calidadTextura: 512
};

const MOTOR_3D = {
    preparado: false,
    hiperespacio: false,
    nave: null,
    luna: null,
    marte: null,
    animacion: null,
    ultimoTiempo: 0,
    eventosGlobalesPreparados: false
};


/* ==========================================================
   151. CHECK THREE.JS
========================================================== */

function verificarThreeJS() {

    if (typeof THREE === "undefined") {

        console.error(
            "[ARCHIVO] Three.js is not available. " +
            "Check the CDN script in the HTML."
        );

        return false;
    }

    return true;
}


/* ==========================================================
   152. CREATE RENDERER
========================================================== */

function crearRenderizador3D(
    contenedor,
    transparencia = true
) {

    const renderizador =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: transparencia,
            powerPreference: "default"
        });

    renderizador.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderizador.setSize(
        Math.max(1, contenedor.clientWidth),
        Math.max(1, contenedor.clientHeight),
        false
    );

    renderizador.outputEncoding =
        THREE.sRGBEncoding;

    renderizador.domElement.style.display =
        "block";

    renderizador.domElement.style.width =
        "100%";

    renderizador.domElement.style.height =
        "100%";

    return renderizador;
}


/* ==========================================================
   153. THREE-DIMENSIONAL STAR FIELD
========================================================== */

function crearCampoEstrellas(
    cantidad = CONFIGURACION_3D.estrellas
) {

    const posiciones =
        new Float32Array(cantidad * 3);

    for (let i = 0; i < cantidad; i++) {

        posiciones[i * 3] =
            (Math.random() - 0.5) * 80;

        posiciones[i * 3 + 1] =
            (Math.random() - 0.5) * 55;

        posiciones[i * 3 + 2] =
            -Math.random() * 100;
    }

    const geometria =
        new THREE.BufferGeometry();

    geometria.setAttribute(
        "position",
        new THREE.BufferAttribute(
            posiciones,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xdcecff,
            size: 0.13,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

    return new THREE.Points(
        geometria,
        material
    );
}


/* ==========================================================
   154. BUILD A 3D SPACESHIP

   The museum's original stylized spaceship.
========================================================== */

function crearNaveEspacial3D() {

    const nave = new THREE.Group();

    const metal =
        new THREE.MeshStandardMaterial({
            color: 0xb9c9dc,
            metalness: 0.65,
            roughness: 0.35
        });

    const oscuro =
        new THREE.MeshStandardMaterial({
            color: 0x20364e,
            metalness: 0.45,
            roughness: 0.4
        });

    const cristal =
        new THREE.MeshStandardMaterial({
            color: 0x65c8ff,
            emissive: 0x0c3650,
            metalness: 0.3,
            roughness: 0.2
        });

    const motor =
        new THREE.MeshBasicMaterial({
            color: 0x47cfff
        });

    // Main body.
    const cuerpo =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.35, 0.55, 2.4, 16
            ),
            metal
        );

    cuerpo.rotation.x = Math.PI / 2;

    nave.add(cuerpo);

    // Spaceship nose.
    const punta =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.35, 0.85, 16
            ),
            metal
        );

    punta.rotation.x = -Math.PI / 2;
    punta.position.z = -1.6;

    nave.add(punta);

    // Cockpit.
    const cabina =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.34, 20, 12
            ),
            cristal
        );

    cabina.scale.set(1, 0.55, 1.35);
    cabina.position.set(0, 0.35, -0.35);

    nave.add(cabina);

    // Wings.
    [-1, 1].forEach(lado => {

        const ala =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.6, 0.1, 0.85
                ),
                oscuro
            );

        ala.position.set(
            lado * 0.85,
            -0.12,
            0.45
        );

        ala.rotation.z =
            lado * 0.1;

        nave.add(ala);
    });

    // Thrusters.
    [-0.28, 0.28].forEach(x => {

        const propulsor =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.17, 0.17, 0.45, 12
                ),
                oscuro
            );

        propulsor.rotation.x =
            Math.PI / 2;

        propulsor.position.set(
            x, -0.15, 1.2
        );

        nave.add(propulsor);

        const luz =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13, 12, 8
                ),
                motor
            );

        luz.position.set(
            x, -0.15, 1.48
        );

        nave.add(luz);
    });

    nave.rotation.y = -0.3;
    nave.rotation.x = 0.12;

    return nave;
}


/* ==========================================================
   155. PREPARE SPACESHIP SCENE
========================================================== */

function prepararEscenaEspacial() {

    if (!verificarThreeJS()) {
        return false;
    }

    if (MOTOR_3D.nave) {
        return true;
    }

    const contenedor = $("#escena3d");

    if (!contenedor) {
        return false;
    }

    const escena = new THREE.Scene();

    const camara =
        new THREE.PerspectiveCamera(
            65, 1, 0.1, 200
        );

    camara.position.set(0, 0, 8);

    const renderizador =
        crearRenderizador3D(
            contenedor,
            true
        );

    const estrellas =
        crearCampoEstrellas();

    escena.add(estrellas);

    const nave =
        crearNaveEspacial3D();

    nave.position.set(0, -1.0, 0);

    nave.scale.setScalar(0.85);

    escena.add(nave);

    escena.add(
        new THREE.AmbientLight(
            0xffffff,
            0.7
        )
    );

    const luz =
        new THREE.DirectionalLight(
            0x9ad6ff,
            2
        );

    luz.position.set(4, 6, 8);

    escena.add(luz);

    // Insert behind the spaceship
    // navigation interface.
    contenedor.prepend(
        renderizador.domElement
    );

    MOTOR_3D.nave = {
        contenedor,
        escena,
        camara,
        renderizador,
        estrellas,
        objeto: nave
    };

    ESTADO.escenaEspacial =
        MOTOR_3D.nave;

    return true;
}


/* ==========================================================
   156. ACTIVATE HYPERSPACE

   Connected to iniciarViaje()
   from PART 3.
========================================================== */

function establecerHiperespacio(activo) {

    MOTOR_3D.hiperespacio =
        Boolean(activo);

    const escena = $("#escena3d");

    if (escena) {

        escena.classList.toggle(
            "hiperespacio-activo",
            MOTOR_3D.hiperespacio
        );
    }

    if (
        MOTOR_3D.hiperespacio &&
        typeof sonidoHiperespacio ===
        "function"
    ) {
        sonidoHiperespacio();
    }
}

/* ==========================================================
   157. PROCEDURAL PLANET TEXTURES

   We generate original visual maps
   using Canvas. These are not scientific
   topographic maps or NASA photographs.
========================================================== */

function crearTexturaPlaneta(tipo) {

    const ancho =
        CONFIGURACION_3D.calidadTextura * 2;

    const alto =
        CONFIGURACION_3D.calidadTextura;

    const lienzo =
        document.createElement("canvas");

    lienzo.width = ancho;
    lienzo.height = alto;

    const ctx =
        lienzo.getContext("2d");

    if (!ctx) return null;

    // Background.
    ctx.fillStyle =
        tipo === "luna"
            ? "#777b80"
            : "#aa5035";

    ctx.fillRect(0, 0, ancho, alto);

    // Reproducible generator for each planet.
    let semilla =
        tipo === "luna"
            ? 1972
            : 2021;

    function aleatorio() {

        semilla =
            (semilla * 1664525 +
                1013904223) >>> 0;

        return semilla / 4294967296;
    }

    // Surface variations.
    for (let i = 0; i < 7000; i++) {

        const x = aleatorio() * ancho;
        const y = aleatorio() * alto;

        const radio =
            1 + aleatorio() * 17;

        const brillo =
            Math.floor(
                25 + aleatorio() * 85
            );

        ctx.fillStyle =
            tipo === "luna"
                ? `rgba(${brillo},${brillo},${brillo},0.14)`
                : (
                    aleatorio() > 0.5
                        ? "rgba(255,179,105,0.12)"
                        : "rgba(65,29,22,0.17)"
                );

        ctx.beginPath();

        ctx.arc(
            x, y, radio, 0,
            Math.PI * 2
        );

        ctx.fill();
    }

    if (tipo === "luna") {

        // Stylized craters.
        for (let i = 0; i < 270; i++) {

            const x = aleatorio() * ancho;
            const y = aleatorio() * alto;

            const radio =
                2 + aleatorio() * 17;

            ctx.beginPath();

            ctx.arc(
                x, y, radio,
                0, Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(35,39,46,0.22)";

            ctx.fill();

            ctx.lineWidth =
                1 + radio * 0.12;

            ctx.strokeStyle =
                "rgba(230,233,238,0.25)";

            ctx.stroke();
        }

    } else {

        // Dark regions of Mars.
        for (let i = 0; i < 85; i++) {

            const x = aleatorio() * ancho;
            const y = aleatorio() * alto;

            ctx.beginPath();

            ctx.ellipse(
                x,
                y,
                8 + aleatorio() * 75,
                3 + aleatorio() * 20,
                aleatorio() * Math.PI,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(72,30,27,0.16)";

            ctx.fill();
        }

        // Illustrative polar ice caps.
        ctx.fillStyle =
            "rgba(235,219,205,0.72)";

        ctx.fillRect(0, 0, ancho, 17);

        ctx.fillRect(
            0, alto - 13,
            ancho, 13
        );
    }

    const textura =
        new THREE.CanvasTexture(lienzo);

    textura.wrapS =
        THREE.RepeatWrapping;

    textura.colorSpace =
        undefined;

    textura.encoding =
        THREE.sRGBEncoding;

    textura.anisotropy = 4;

    return textura;
}


/* ==========================================================
   158. CREATE PLANET SCENE
========================================================== */

function crearEscenaPlaneta(mundo) {

    if (!verificarThreeJS()) {
        return null;
    }

    const id =
        mundo === "luna"
            ? "#luna3d"
            : "#marte3d";

    const contenedor = $(id);

    if (!contenedor) {
        return null;
    }

    const escena =
        new THREE.Scene();

    const camara =
        new THREE.PerspectiveCamera(
            42, 1, 0.1, 100
        );

    camara.position.z =
        CONFIGURACION_3D.distanciaCamara;

    const renderizador =
        crearRenderizador3D(
            contenedor,
            true
        );

    const textura =
        crearTexturaPlaneta(mundo);

    const geometria =
        new THREE.SphereGeometry(
            CONFIGURACION_3D.radioPlaneta,
            96,
            64
        );

    const material =
        new THREE.MeshStandardMaterial({
            map: textura,
            roughness: 1,
            metalness: 0
        });

    const planeta =
        new THREE.Mesh(
            geometria,
            material
        );

    escena.add(planeta);

    escena.add(
        new THREE.AmbientLight(
            0xffffff,
            0.35
        )
    );

    const sol =
        new THREE.DirectionalLight(
            0xffffff,
            2.1
        );

    sol.position.set(5, 3, 6);

    escena.add(sol);

    // Illustrative atmospheric halo.
    // Mars has a thin atmosphere.
    if (mundo === "marte") {

        const halo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.86, 48, 32
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xd36b43,
                    transparent: true,
                    opacity: 0.055,
                    side: THREE.BackSide,
                    depthWrite: false
                })
            );

        escena.add(halo);
    }

    // Replace the previous Mars iframe
    // with the Three.js viewer.
    contenedor.replaceChildren(
        renderizador.domElement
    );

    renderizador.domElement.style.touchAction =
        "none";

    const datos = {
        mundo,
        contenedor,
        escena,
        camara,
        renderizador,
        planeta,
        distancia:
            CONFIGURACION_3D.distanciaCamara,
        giroAutomatico: true,
        arrastrando: false,
        ultimoX: 0,
        ultimoY: 0,
        rotacionX: 0.1,
        rotacionY: 0
    };

    configurarInteraccionPlaneta(datos);

    return datos;
}


/* ==========================================================
   159. MOUSE AND TOUCHSCREEN INTERACTION
========================================================== */

function configurarInteraccionPlaneta(datos) {

    const lienzo =
        datos.renderizador.domElement;

    lienzo.addEventListener(
        "pointerdown",
        evento => {

            datos.arrastrando = true;

            datos.ultimoX = evento.clientX;
            datos.ultimoY = evento.clientY;

            lienzo.setPointerCapture(
                evento.pointerId
            );
        }
    );

    lienzo.addEventListener(
        "pointermove",
        evento => {

            if (!datos.arrastrando) {
                return;
            }

            const dx =
                evento.clientX -
                datos.ultimoX;

            const dy =
                evento.clientY -
                datos.ultimoY;

            datos.rotacionY += dx * 0.006;

            datos.rotacionX = limitar(
                datos.rotacionX +
                    dy * 0.006,
                -Math.PI / 2,
                Math.PI / 2
            );

            datos.ultimoX = evento.clientX;
            datos.ultimoY = evento.clientY;
        }
    );

    const detener = () => {
        datos.arrastrando = false;
    };

    lienzo.addEventListener(
        "pointerup",
        detener
    );

    lienzo.addEventListener(
        "pointercancel",
        detener
    );

    lienzo.addEventListener(
        "lostpointercapture",
        detener
    );

    lienzo.addEventListener(
        "wheel",
        evento => {

            evento.preventDefault();

            acercarPlaneta(
                datos.mundo,
                evento.deltaY > 0
                    ? 0.35
                    : -0.35
            );
        },
        { passive: false }
    );
}


/* ==========================================================
   160. ZOOM IN OR OUT ON A PLANET
========================================================== */

function acercarPlaneta(
    mundo,
    cambio
) {

    const datos =
        mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) return;

    datos.distancia = limitar(
        datos.distancia + cambio,
        CONFIGURACION_3D.distanciaMinima,
        CONFIGURACION_3D.distanciaMaxima
    );

    datos.camara.position.z =
        datos.distancia;
}

/* ==========================================================
   161. ENABLE OR PAUSE ROTATION
========================================================== */

function alternarGiroPlaneta(mundo) {

    const datos =
        mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) return;

    datos.giroAutomatico =
        !datos.giroAutomatico;

    const boton = $(
        mundo === "luna"
            ? "#girarLuna"
            : "#girarMarte"
    );

    if (boton) {

        boton.setAttribute(
            "aria-pressed",
            String(datos.giroAutomatico)
        );

        boton.textContent =
            datos.giroAutomatico
                ? "⟳ AUTO ROTATION"
                : "▶ RESUME ROTATION";
    }

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }
}


/* ==========================================================
   162. RESET VIEW
========================================================== */

function reiniciarVistaPlaneta(mundo) {

    const datos =
        mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) return;

    datos.distancia =
        CONFIGURACION_3D.distanciaCamara;

    datos.rotacionX = 0.1;
    datos.rotacionY = 0;

    datos.camara.position.z =
        datos.distancia;

    datos.giroAutomatico = true;

    const boton = $(
        mundo === "luna"
            ? "#girarLuna"
            : "#girarMarte"
    );

    if (boton) {

        boton.textContent =
            "⟳ AUTO ROTATION";

        boton.setAttribute(
            "aria-pressed",
            "true"
        );
    }
}


/* ==========================================================
   163. PREPARE THE EIGHT BUTTONS
========================================================== */

function prepararControlesPlanetas() {

    const controles = [

        ["#acercarLuna", () =>
            acercarPlaneta("luna", -0.45)],

        ["#alejarLuna", () =>
            acercarPlaneta("luna", 0.45)],

        ["#girarLuna", () =>
            alternarGiroPlaneta("luna")],

        ["#reiniciarLuna", () =>
            reiniciarVistaPlaneta("luna")],

        ["#acercarMarte", () =>
            acercarPlaneta("marte", -0.45)],

        ["#alejarMarte", () =>
            acercarPlaneta("marte", 0.45)],

        ["#girarMarte", () =>
            alternarGiroPlaneta("marte")],

        ["#reiniciarMarte", () =>
            reiniciarVistaPlaneta("marte")]
    ];

    controles.forEach(
        ([selector, accion]) => {

            const boton = $(selector);

            if (boton) {

                boton.addEventListener(
                    "click",
                    accion
                );
            }
        }
    );
}


/* ==========================================================
   164. ADJUST SCENE SIZES
========================================================== */

function ajustarEscena3D(datos) {

    if (!datos) return;

    const ancho =
        datos.contenedor.clientWidth;

    const alto =
        datos.contenedor.clientHeight;

    if (ancho <= 0 || alto <= 0) {
        return;
    }

    const lienzo =
        datos.renderizador.domElement;

    if (
        lienzo.width === 0 ||
        lienzo.height === 0 ||
        datos.ancho !== ancho ||
        datos.alto !== alto
    ) {

        datos.ancho = ancho;
        datos.alto = alto;

        datos.camara.aspect =
            ancho / alto;

        datos.camara.updateProjectionMatrix();

        datos.renderizador.setSize(
            ancho,
            alto,
            false
        );
    }
}


/* ==========================================================
   165. SPACESHIP ANIMATION
========================================================== */

function animarNave3D(
    datos,
    delta,
    tiempo
) {

    if (!datos) return;

    const velocidad =
        MOTOR_3D.hiperespacio
            ? CONFIGURACION_3D
                .velocidadHiperespacio
            : CONFIGURACION_3D
                .velocidadNormal;

    const posiciones =
        datos.estrellas.geometry
            .attributes.position;

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        let z =
            posiciones.getZ(i);

        z += velocidad * delta * 60;

        if (z > 8) {
            z = -100;
        }

        posiciones.setZ(i, z);
    }

    posiciones.needsUpdate = true;

    datos.objeto.position.y =
        -1 + Math.sin(tiempo * 1.4) * 0.08;

    datos.objeto.rotation.z =
        Math.sin(tiempo * 0.6) * 0.035;

    datos.objeto.rotation.y =
        -0.3 + Math.sin(tiempo * 0.4) * 0.1;

    datos.camara.fov =
        MOTOR_3D.hiperespacio
            ? 78
            : 65;

    datos.camara.updateProjectionMatrix();
}


/* ==========================================================
   166. PLANET ANIMATION
========================================================== */

function animarPlaneta3D(
    datos,
    delta
) {

    if (!datos) return;

    if (
        datos.giroAutomatico &&
        !datos.arrastrando
    ) {

        datos.rotacionY +=
            CONFIGURACION_3D
                .giroAutomatico *
            delta * 60;
    }

    datos.planeta.rotation.x =
        datos.rotacionX;

    datos.planeta.rotation.y =
        datos.rotacionY;
}


/* ==========================================================
   167. MAIN 3D LOOP
========================================================== */

function ejecutarAnimacion3D(
    tiempoMilisegundos
) {

    if (!MOTOR_3D.preparado) {
        return;
    }

    MOTOR_3D.animacion =
        requestAnimationFrame(
            ejecutarAnimacion3D
        );

    const tiempo =
        tiempoMilisegundos / 1000;

    const delta = limitar(
        MOTOR_3D.ultimoTiempo
            ? tiempo -
              MOTOR_3D.ultimoTiempo
            : 0.016,
        0,
        0.05
    );

    MOTOR_3D.ultimoTiempo = tiempo;

    if (document.hidden) {
        return;
    }

    // Spaceship scene.
    if (
        MOTOR_3D.nave &&
        (
            ESTADO.pantallaActual === "portada" ||
            ESTADO.pantallaActual === "hiperespacio"
        )
    ) {

        ajustarEscena3D(
            MOTOR_3D.nave
        );

        animarNave3D(
            MOTOR_3D.nave,
            delta,
            tiempo
        );

        MOTOR_3D.nave.renderizador.render(
            MOTOR_3D.nave.escena,
            MOTOR_3D.nave.camara
        );
    }

    // Moon.
    if (
        MOTOR_3D.luna &&
        ESTADO.seccionActual === "vistaLuna" &&
        ESTADO.pantallaActual === "museo"
    ) {

        ajustarEscena3D(
            MOTOR_3D.luna
        );

        animarPlaneta3D(
            MOTOR_3D.luna,
            delta
        );

        MOTOR_3D.luna.renderizador.render(
            MOTOR_3D.luna.escena,
            MOTOR_3D.luna.camara
        );
    }

    // Mars.
    if (
        MOTOR_3D.marte &&
        ESTADO.seccionActual === "vistaMarte" &&
        ESTADO.pantallaActual === "museo"
    ) {

        ajustarEscena3D(
            MOTOR_3D.marte
        );

        animarPlaneta3D(
            MOTOR_3D.marte,
            delta
        );

        MOTOR_3D.marte.renderizador.render(
            MOTOR_3D.marte.escena,
            MOTOR_3D.marte.camara
        );
    }
}


/* ==========================================================
   168. PREPARE THE THREE-DIMENSIONAL ENGINE
========================================================== */

function prepararSistema3D() {

    if (MOTOR_3D.preparado) {
        return true;
    }

    if (!verificarThreeJS()) {
        return false;
    }

    try {

        prepararEscenaEspacial();

        MOTOR_3D.luna =
            crearEscenaPlaneta("luna");

        MOTOR_3D.marte =
            crearEscenaPlaneta("marte");

        ESTADO.escenaLuna =
            MOTOR_3D.luna;

        ESTADO.escenaMarte =
            MOTOR_3D.marte;

        prepararControlesPlanetas();

        // Prevent the spaceship interface
        // from covering the museum content.
        const interfaz =
            $("#interfazNave");

        if (interfaz) {
            interfaz.style.pointerEvents =
                "none";
        }

        // Source clarification.
        escribirTexto(
            "#creditoTexturaLuna",
            "ILLUSTRATIVE 3D SURFACE " +
            "GENERATED BY THE MUSEUM. " +
            "NOT A NASA CARTOGRAPHIC TEXTURE."
        );

        MOTOR_3D.preparado = true;

        MOTOR_3D.animacion =
            requestAnimationFrame(
                ejecutarAnimacion3D
            );

        console.log(
            "[ARCHIVO] Spaceship, Moon and Mars 3D ready."
        );

        return true;

    } catch (error) {

        console.error(
            "[ARCHIVO] Error initializing Three.js:",
            error
        );

        return false;
    }
}


/* ==========================================================
   END OF NEW PART 10
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 11

   HISTORICAL MARKERS ON
   THE MOON AND MARS IN 3D

   Compatible with PARTS 1 TO 10.
========================================================== */


/* ==========================================================
   169. 3D MARKER CONFIGURATION
========================================================== */

const CONFIGURACION_MARCADORES_3D = {
    radioMarcador: 0.055,
    alturaMarcador: 0.055,
    toleranciaClick: 7,
    colorPendiente: 0x64d8ff,
    colorDescubierto: 0x68ffb1,
    colorSeleccionado: 0xffd166
};

const MARCADORES_3D = {
    luna: [],
    marte: [],
    preparados: false,
    raycaster: null,
    puntero: null,
    seleccionado: null,
    tooltip: null
};


/* ==========================================================
   170. NORMALIZE COORDINATES

   Longitudes may be expressed
   between -180 and 180 degrees or
   between 0 and 360 degrees.

   Example:
   313° is equivalent to -47°.
========================================================== */

function normalizarLongitud(longitud) {

    const numero = Number(longitud);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return (
        ((numero + 180) % 360 + 360) %
        360
    ) - 180;
}


/* ==========================================================
   171. CONVERT LATITUDE AND LONGITUDE TO 3D

   Coordinate system:
   Positive Y = north pole
   Latitude 0 = equator
   Longitude 0 = +Z direction

   These are approximate geographic
   positions taken from the project archive.

   The procedural textures from PART 10
   are not georeferenced maps.
========================================================== */

function coordenadasASuperficie3D(
    latitud,
    longitud,
    radio = CONFIGURACION_3D.radioPlaneta
) {

    const lat = limitar(
        Number(latitud) || 0,
        -90,
        90
    ) * Math.PI / 180;

    const lon =
        normalizarLongitud(longitud) *
        Math.PI / 180;

    return new THREE.Vector3(
        radio * Math.cos(lat) * Math.sin(lon),
        radio * Math.sin(lat),
        radio * Math.cos(lat) * Math.cos(lon)
    );
}


/* ==========================================================
   172. CREATE MARKER GEOMETRY
========================================================== */

function crearMarcadorHistorico3D(objeto) {

    const geometria =
        new THREE.SphereGeometry(
            CONFIGURACION_MARCADORES_3D
                .radioMarcador,
            14,
            10
        );

    const descubierto =
        estaDescubierto(objeto.id);

    const material =
        new THREE.MeshBasicMaterial({
            color: descubierto
                ? CONFIGURACION_MARCADORES_3D
                    .colorDescubierto
                : CONFIGURACION_MARCADORES_3D
                    .colorPendiente
        });

    const marcador =
        new THREE.Mesh(
            geometria,
            material
        );

    const radio =
        CONFIGURACION_3D.radioPlaneta +
        CONFIGURACION_MARCADORES_3D
            .alturaMarcador;

    marcador.position.copy(
        coordenadasASuperficie3D(
            objeto.lat,
            objeto.lon,
            radio
        )
    );

    marcador.userData = {
        idObjeto: objeto.id,
        mundo: objeto.mundo,
        nombre: objeto.nombre,
        marcadorHistorico: true
    };

    // Ring around the point.
    const anillo =
        new THREE.Mesh(
            new THREE.RingGeometry(
                0.085,
                0.105,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: descubierto
                    ? CONFIGURACION_MARCADORES_3D
                        .colorDescubierto
                    : CONFIGURACION_MARCADORES_3D
                        .colorPendiente,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );

    // The face of the ring points outward
    // from the center of the planet.
    const normal =
        marcador.position
            .clone()
            .normalize();

    anillo.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
    );

    anillo.position.copy(
        normal.multiplyScalar(
            radio + 0.006
        )
    );

    anillo.userData = {
        idObjeto: objeto.id,
        marcadorHistorico: true
    };

    marcador.userData.anillo = anillo;

    return marcador;
}


/* ==========================================================
   173. ADD MARKERS TO A PLANET

   The points are children of a group
   that rotates together with the planet.
========================================================== */

function colocarMarcadoresPlaneta(mundo) {

    const datos =
        mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) {
        return false;
    }

    // The group will share the rotation
    // of the planet from PART 10.
    if (!datos.grupoMarcadores) {

        datos.grupoMarcadores =
            new THREE.Group();

        datos.escena.add(
            datos.grupoMarcadores
        );
    }

    // Prevent duplicates.
    datos.grupoMarcadores.children
        .slice()
        .forEach(elemento => {

            datos.grupoMarcadores.remove(
                elemento
            );

            elemento.geometry?.dispose();

            if (
                Array.isArray(elemento.material)
            ) {
                elemento.material.forEach(
                    material => material.dispose()
                );
            } else {
                elemento.material?.dispose();
            }
        });

    MARCADORES_3D[mundo] = [];

    obtenerObjetosMundo(mundo)
        .forEach(objeto => {

            const marcador =
                crearMarcadorHistorico3D(objeto);

            datos.grupoMarcadores.add(
                marcador
            );

            datos.grupoMarcadores.add(
                marcador.userData.anillo
            );

            MARCADORES_3D[mundo].push(
                marcador
            );
        });

    datos.grupoMarcadores.rotation.copy(
        datos.planeta.rotation
    );

    console.log(
        `[ARCHIVO] ${mundo} markers:`,
        MARCADORES_3D[mundo].length
    );

    return true;
}


/* ==========================================================
   174. SYNCHRONIZE ROTATION WITH THE PLANET

   Runs on every 3D frame.
========================================================== */

function sincronizarMarcadores3D(datos) {

    if (
        !datos ||
        !datos.grupoMarcadores
    ) {
        return;
    }

    datos.grupoMarcadores.rotation.copy(
        datos.planeta.rotation
    );
}


/* ==========================================================
   175. UPDATE DISCOVERY COLORS
========================================================== */

function actualizarMarcadores3D() {

    ["luna", "marte"].forEach(mundo => {

        MARCADORES_3D[mundo]
            .forEach(marcador => {

                const id =
                    marcador.userData.idObjeto;

                const descubierto =
                    estaDescubierto(id);

                const seleccionado =
                    MARCADORES_3D.seleccionado ===
                    id;

                const color = seleccionado
                    ? CONFIGURACION_MARCADORES_3D
                        .colorSeleccionado
                    : descubierto
                        ? CONFIGURACION_MARCADORES_3D
                            .colorDescubierto
                        : CONFIGURACION_MARCADORES_3D
                            .colorPendiente;

                marcador.material.color.setHex(
                    color
                );

                const anillo =
                    marcador.userData.anillo;

                if (anillo) {
                    anillo.material.color.setHex(
                        color
                    );
                }
            });
    });
}


/* ==========================================================
   176. CHECK WHETHER THE POINT IS FACING FORWARD

   Prevents selecting points hidden
   behind the sphere.
========================================================== */

function marcadorEstaVisible(
    marcador,
    datos
) {

    const posicion =
        new THREE.Vector3();

    marcador.getWorldPosition(
        posicion
    );

    const direccionCamara =
        datos.camara.position
            .clone()
            .sub(posicion)
            .normalize();

    const normal =
        posicion.clone().normalize();

    return (
        normal.dot(direccionCamara) > 0
    );
}

/* ==========================================================
   177. DETECT A MARKER WITH RAYCASTER
========================================================== */

function detectarMarcador3D(
    mundo,
    evento
) {

    const datos =
        mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) {
        return null;
    }

    const lienzo =
        datos.renderizador.domElement;

    const rectangulo =
        lienzo.getBoundingClientRect();

    if (
        rectangulo.width <= 0 ||
        rectangulo.height <= 0
    ) {
        return null;
    }

    const x =
        (
            (evento.clientX -
                rectangulo.left) /
            rectangulo.width
        ) * 2 - 1;

    const y =
        -(
            (evento.clientY -
                rectangulo.top) /
            rectangulo.height
        ) * 2 + 1;

    MARCADORES_3D.puntero.set(x, y);

    datos.camara.updateMatrixWorld();

    datos.grupoMarcadores?.updateMatrixWorld(
        true
    );

    MARCADORES_3D.raycaster.setFromCamera(
        MARCADORES_3D.puntero,
        datos.camara
    );

    const intersecciones =
        MARCADORES_3D.raycaster
            .intersectObjects(
                MARCADORES_3D[mundo],
                false
            );

    for (const interseccion of intersecciones) {

        const marcador =
            interseccion.object;

        if (
            marcadorEstaVisible(
                marcador,
                datos
            )
        ) {
            return marcador;
        }
    }

    return null;
}


/* ==========================================================
   178. CREATE MARKER LABEL
========================================================== */

function crearEtiquetaMarcador3D(datos) {

    const etiqueta =
        crearElemento(
            "div",
            "etiqueta-marcador-3d"
        );

    etiqueta.hidden = true;

    etiqueta.style.position = "absolute";
    etiqueta.style.zIndex = "5";
    etiqueta.style.pointerEvents = "none";
    etiqueta.style.padding = "8px 12px";
    etiqueta.style.borderRadius = "9px";
    etiqueta.style.background =
        "rgba(8, 17, 35, 0.94)";
    etiqueta.style.border =
        "1px solid rgba(100,216,255,0.6)";
    etiqueta.style.color = "#ffffff";
    etiqueta.style.fontSize = "13px";
    etiqueta.style.fontWeight = "700";
    etiqueta.style.maxWidth = "220px";
    etiqueta.style.transform =
        "translate(-50%, -120%)";

    const estilo =
        window.getComputedStyle(
            datos.contenedor
        );

    if (estilo.position === "static") {
        datos.contenedor.style.position =
            "relative";
    }

    datos.contenedor.appendChild(
        etiqueta
    );

    return etiqueta;
}


/* ==========================================================
   179. DISPLAY AN OBJECT'S LABEL
========================================================== */

function mostrarEtiquetaMarcador3D(
    datos,
    marcador
) {

    if (!datos.etiquetaMarcador) {
        return;
    }

    const etiqueta =
        datos.etiquetaMarcador;

    if (!marcador) {
        etiqueta.hidden = true;
        return;
    }

    const objeto =
        obtenerObjeto(
            marcador.userData.idObjeto
        );

    if (!objeto) {
        etiqueta.hidden = true;
        return;
    }

    const posicion =
        new THREE.Vector3();

    marcador.getWorldPosition(
        posicion
    );

    posicion.project(
        datos.camara
    );

    const ancho =
        datos.contenedor.clientWidth;

    const alto =
        datos.contenedor.clientHeight;

    etiqueta.style.left =
        ((posicion.x + 1) / 2 * ancho) +
        "px";

    etiqueta.style.top =
        ((1 - posicion.y) / 2 * alto) +
        "px";

    etiqueta.textContent =
        objeto.nombre +
        " · " +
        (
            estaDescubierto(objeto.id)
                ? "RECOVERED"
                : "PENDING"
        );

    etiqueta.hidden = false;
}


/* ==========================================================
   180. SELECT A MARKER
========================================================== */

function seleccionarMarcador3D(id) {

    const objeto =
        obtenerObjeto(id);

    if (!objeto) {
        return false;
    }

    MARCADORES_3D.seleccionado =
        objeto.id;

    actualizarMarcadores3D();

    if (
        typeof sonidoClick === "function"
    ) {
        sonidoClick();
    }

    // Opens the same dossier as the
    // historical cards and buttons.
    return abrirObjeto(objeto.id);
}


/* ==========================================================
   181. CONFIGURE CLICKS ON THE SPHERE

   We distinguish dragging from clicking.
   Dragging will not open a dossier.
========================================================== */

function prepararInteraccionMarcadores3D(
    datos
) {

    if (!datos) {
        return;
    }

    const lienzo =
        datos.renderizador.domElement;

    let inicioX = 0;
    let inicioY = 0;
    let pulsando = false;
    let movimientoMaximo = 0;

    datos.etiquetaMarcador =
        crearEtiquetaMarcador3D(datos);

    lienzo.addEventListener(
        "pointerdown",
        evento => {

            if (evento.button !== 0) {
                return;
            }

            inicioX = evento.clientX;
            inicioY = evento.clientY;

            movimientoMaximo = 0;
            pulsando = true;
        }
    );

    lienzo.addEventListener(
        "pointermove",
        evento => {

            if (pulsando) {

                const distancia =
                    Math.hypot(
                        evento.clientX - inicioX,
                        evento.clientY - inicioY
                    );

                movimientoMaximo =
                    Math.max(
                        movimientoMaximo,
                        distancia
                    );

                mostrarEtiquetaMarcador3D(
                    datos,
                    null
                );

                return;
            }

            const marcador =
                detectarMarcador3D(
                    datos.mundo,
                    evento
                );

            lienzo.style.cursor =
                marcador
                    ? "pointer"
                    : "grab";

            mostrarEtiquetaMarcador3D(
                datos,
                marcador
            );
        }
    );

    lienzo.addEventListener(
        "pointerup",
        evento => {

            if (!pulsando) {
                return;
            }

            pulsando = false;

            const distancia =
                Math.max(
                    movimientoMaximo,
                    Math.hypot(
                        evento.clientX - inicioX,
                        evento.clientY - inicioY
                    )
                );

            if (
                distancia >
                CONFIGURACION_MARCADORES_3D
                    .toleranciaClick
            ) {
                return;
            }

            const marcador =
                detectarMarcador3D(
                    datos.mundo,
                    evento
                );

            if (marcador) {

                seleccionarMarcador3D(
                    marcador.userData.idObjeto
                );
            }
        }
    );

    lienzo.addEventListener(
        "pointercancel",
        () => {
            pulsando = false;
        }
    );

    lienzo.addEventListener(
        "pointerleave",
        () => {

            mostrarEtiquetaMarcador3D(
                datos,
                null
            );
        }
    );
}


/* ==========================================================
   182. CENTER AN OBJECT ON THE PLANET

   Allows rotating the sphere to show
   a historical point at the front.
========================================================== */

function enfocarObjetoEnPlaneta(id) {

    const objeto =
        obtenerObjeto(id);

    if (!objeto) {
        return false;
    }

    const datos =
        objeto.mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) {
        return false;
    }

    const marcador =
        MARCADORES_3D[objeto.mundo]
            .find(elemento => {
                return (
                    elemento.userData.idObjeto ===
                    id
                );
            });

    if (!marcador) {
        return false;
    }

    // Point the marker's normal
    // toward the camera (+Z).
    const direccion =
        marcador.position
            .clone()
            .normalize();

    const rotacion =
        new THREE.Quaternion()
            .setFromUnitVectors(
                direccion,
                new THREE.Vector3(0, 0, 1)
            );

    datos.planeta.quaternion.copy(
        rotacion
    );

    const euler =
        new THREE.Euler()
            .setFromQuaternion(
                rotacion,
                "XYZ"
            );

    datos.rotacionX = euler.x;
    datos.rotacionY = euler.y;

    datos.planeta.rotation.set(
        datos.rotacionX,
        datos.rotacionY,
        0
    );

    sincronizarMarcadores3D(datos);

    return true;
}


/* ==========================================================
   183. UPDATE MARKERS AFTER A DISCOVERY

   Connects to the existing
   registrarDescubrimiento() function.
========================================================== */

function actualizarEstadoMarcadores3D() {

    actualizarMarcadores3D();
}


/* ==========================================================
   184. PREPARE THE 24 3D POINTS
========================================================== */

function prepararMarcadores3D() {

    if (MARCADORES_3D.preparados) {
        return true;
    }

    if (
        !MOTOR_3D.luna ||
        !MOTOR_3D.marte
    ) {

        console.warn(
            "[ARCHIVO] The 3D system from " +
            "PART 10 must be initialized first."
        );

        return false;
    }

    MARCADORES_3D.raycaster =
        new THREE.Raycaster();

    MARCADORES_3D.puntero =
        new THREE.Vector2();

    colocarMarcadoresPlaneta("luna");

    colocarMarcadoresPlaneta("marte");

    prepararInteraccionMarcadores3D(
        MOTOR_3D.luna
    );

    prepararInteraccionMarcadores3D(
        MOTOR_3D.marte
    );

    actualizarMarcadores3D();

    MARCADORES_3D.preparados = true;

    console.log(
        "[ARCHIVO] 24 3D markers ready."
    );

    return true;
}


/* ==========================================================
   185. INTEGRATION WITH THE EXISTING ANIMATION

   Instead of creating a second
   requestAnimationFrame loop, we add
   synchronization to the function
   from PART 10.

   We save the previous version.
========================================================== */

const animarPlaneta3DOriginal =
    animarPlaneta3D;

animarPlaneta3D = function(datos, delta) {

    animarPlaneta3DOriginal(
        datos,
        delta
    );

    sincronizarMarcadores3D(
        datos
    );
};


/* ==========================================================
   186. INTEGRATION WITH DISCOVERIES

   We reuse the mechanism from
   PART 4 without duplicating its logic.
========================================================== */

const registrarDescubrimientoOriginal =
    registrarDescubrimiento;

registrarDescubrimiento = function(id) {

    const resultado =
        registrarDescubrimientoOriginal(id);

    actualizarEstadoMarcadores3D();

    return resultado;
};


/* ==========================================================
   187. CHECK THE NUMBER OF MARKERS
========================================================== */

function verificarMarcadores3D() {

    const luna =
        MARCADORES_3D.luna.length;

    const marte =
        MARCADORES_3D.marte.length;

    const correcto =
        luna === CONFIGURACION.objetosLuna &&
        marte === CONFIGURACION.objetosMarte;

    if (!correcto) {

        console.warn(
            "[ARCHIVO] Unexpected number " +
            "of 3D markers:",
            { luna, marte }
        );

        return false;
    }

    console.log(
        "[ARCHIVO] Verified:",
        luna,
        "lunar markers and",
        marte,
        "Martian markers."
    );

    return true;
}


/* ==========================================================
   188. INITIALIZE THE 3D HISTORICAL MAP

   Will be called from iniciarAplicacion()
   after prepararSistema3D().
========================================================== */

function prepararMapaHistorico3D() {

    const preparado =
        prepararMarcadores3D();

    if (!preparado) {
        return false;
    }

    verificarMarcadores3D();

    return true;
}


/* ==========================================================
   END OF NEW PART 11
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 12

   GENERAL INTEGRATION
   COMPATIBILITY FIXES
   DIAGNOSTICS
   APPLICATION STARTUP

   Compatible with PARTS 1 TO 11.

   THIS BLOCK GOES AT THE END OF script.js.
========================================================== */


/* ==========================================================
   189. INTEGRATION STATE
========================================================== */

const INTEGRACION_MUSEO = {
    iniciando: false,
    iniciada: false,
    errores: [],
    advertencias: [],
    reparacionesPreparadas: false
};


/* ==========================================================
   190. LOG WARNINGS
========================================================== */

function advertenciaIntegracion(mensaje) {

    INTEGRACION_MUSEO.advertencias.push(
        mensaje
    );

    console.warn(
        "[ARCHIVO] " + mensaje
    );
}


/* ==========================================================
   191. FIX DOSSIER OPENING

   In PART 5, the value returned by
   mostrarSeccion() was checked.

   We do not need to depend on that value:
   we directly check the navigation state
   after opening.
========================================================== */

abrirObjeto = function(id) {

    const objeto = obtenerObjeto(id);

    if (!objeto) {
        return false;
    }

    // Remember the previous section.
    if (
        ESTADO.seccionActual !==
        "detalleObjeto"
    ) {
        ESTADO.seccionAnterior =
            ESTADO.seccionActual;
    }

    ESTADO.objetoActual = objeto;

    cerrarImagenAmpliada();

    mostrarSeccion("detalleObjeto");

    if (
        ESTADO.seccionActual !==
        "detalleObjeto"
    ) {
        console.error(
            "[ARCHIVO] Could not open " +
            "the dossier section."
        );

        return false;
    }

    rellenarExpediente(objeto);

    actualizarEstadoDescubrimiento();

    mostrarFuentesObjeto(objeto);

    cargarGaleriaObjeto(objeto);

    prepararComicObjeto(objeto);

    console.log(
        "[ARCHIVO] Dossier:",
        objeto.nombre
    );

    return true;
};


/* ==========================================================
   192. SYNCHRONIZE MARKERS AND PLANETS

   We replace the animation adapter
   from PART 11 with a version that
   synchronizes the marker group
   immediately after rotation.
========================================================== */

function sincronizarPlanetaConMarcadores(datos) {

    if (!datos) return;

    if (
        datos.giroAutomatico &&
        !datos.arrastrando
    ) {
        datos.rotacionY +=
            CONFIGURACION_3D.giroAutomatico *
            datos.deltaAnimacion * 60;
    }

    datos.planeta.rotation.set(
        datos.rotacionX,
        datos.rotacionY,
        0
    );

    sincronizarMarcadores3D(datos);
}


/* ==========================================================
   193. FIX 3D ANIMATION

   We do not create another requestAnimationFrame.
   We only replace the function
   called by the loop in PART 10.
========================================================== */

animarPlaneta3D = function(datos, delta) {

    if (!datos) return;

    datos.deltaAnimacion = delta;

    sincronizarPlanetaConMarcadores(
        datos
    );
};


/* ==========================================================
   194. FIX MARKER FOCUS

   Instead of converting the quaternion
   into two angles and losing part of the
   orientation, we calculate a rotation
   compatible with the existing viewer.
========================================================== */

enfocarObjetoEnPlaneta = function(id) {

    const objeto = obtenerObjeto(id);

    if (!objeto) return false;

    const datos =
        objeto.mundo === "luna"
            ? MOTOR_3D.luna
            : MOTOR_3D.marte;

    if (!datos) return false;

    const marcador =
        MARCADORES_3D[objeto.mundo]
            .find(elemento => {
                return (
                    elemento.userData.idObjeto ===
                    id
                );
            });

    if (!marcador) return false;

    const direccion =
        marcador.position.clone().normalize();

    const latitud =
        Math.asin(
            limitar(direccion.y, -1, 1)
        );

    const longitud =
        Math.atan2(
            direccion.x,
            direccion.z
        );

    datos.rotacionX = -latitud;

    datos.rotacionY = -longitud;

    datos.giroAutomatico = false;

    datos.planeta.rotation.set(
        datos.rotacionX,
        datos.rotacionY,
        0
    );

    sincronizarMarcadores3D(datos);

    return true;
};


/* ==========================================================
   195. FIX QUIZ REENTRY

   When the visitor returns to a
   question they have already answered,
   we must not erase their answer
   or their score.
========================================================== */

actualizarVistaCuestionario = function() {

    const terminado =
        ESTADO.cuestionarioTerminado;

    const resultado =
        $("#resultadoCuestionario");

    const contenedor =
        $("#contenedorPregunta");

    const siguiente =
        $("#botonSiguientePregunta");

    if (terminado) {

        if (resultado) {
            resultado.hidden = false;
        }

        if (contenedor) {
            contenedor.hidden = true;
        }

        if (siguiente) {
            siguiente.hidden = true;
        }

        return;
    }

    if (resultado) {
        resultado.hidden = true;
    }

    if (contenedor) {
        contenedor.hidden = false;
    }

    if (siguiente) {
        siguiente.hidden = false;

        siguiente.disabled =
            !ESTADO_QUIZ.respuestaConfirmada;
    }

    const opciones =
        $("#opcionesPregunta");

    if (
        !opciones ||
        opciones.children.length === 0
    ) {
        mostrarPregunta();
    }
};


/* ==========================================================
   196. FIX QUIZ RESTART

   When restarting, the best score
   from the current visit is preserved,
   but the quiz returns to question 1.
========================================================== */

const reiniciarCuestionarioBase =
    reiniciarCuestionario;

reiniciarCuestionario = function() {

    reiniciarCuestionarioBase();

    const siguiente =
        $("#botonSiguientePregunta");

    if (siguiente) {
        siguiente.hidden = false;
    }

    const resultado =
        $("#resultadoCuestionario");

    if (resultado) {
        resultado.hidden = true;
    }

    const contenedor =
        $("#contenedorPregunta");

    if (contenedor) {
        contenedor.hidden = false;
    }
};

/* ==========================================================
   197. COMPATIBILITY STYLES

   These are small adjustments for elements
   created dynamically by JavaScript.

   They do not replace your style.css file.
========================================================== */

function instalarEstilosIntegracion() {

    if ($("#estilosIntegracionMuseo")) {
        return;
    }

    const estilo =
        document.createElement("style");

    estilo.id = "estilosIntegracionMuseo";

    estilo.textContent = `
        /* Section visibility */

        #museo > section[hidden] {
            display: none !important;
        }

        #cronologiaLuna[hidden],
        #cronologiaMarte[hidden],
        #detalleEventoTiempo[hidden],
        #resultadoCuestionario[hidden],
        #contenedorPregunta[hidden],
        #visorImagenAmpliada[hidden],
        #ventanaRatatopo[hidden] {
            display: none !important;
        }

        /* Three-dimensional scenes */

        #escena3d,
        #luna3d,
        #marte3d {
            position: relative;
            overflow: hidden;
        }

        #luna3d,
        #marte3d {
            min-height: 340px;
        }

        #escena3d canvas,
        #luna3d canvas,
        #marte3d canvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        /* Labels over the planets */

        .etiqueta-marcador-3d {
            box-sizing: border-box;
            text-align: center;
        }

        /* Exploration cards */

        .tarjeta-objeto,
        .registro-inventario,
        .evento-tiempo {
            min-width: 0;
        }

        /* Quiz options */

        .opcion-pregunta.correcta {
            border-color: #52dca1 !important;
        }

        .opcion-pregunta.incorrecta {
            border-color: #ff7c85 !important;
        }

        .opcion-pregunta:disabled {
            cursor: default;
        }

        /* Photographs */

        .fotografia-nasa {
            display: block;
            width: 100%;
            height: 180px;
            object-fit: cover;
        }

        .boton-ampliar-fotografia {
            display: block;
            width: 100%;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: zoom-in;
        }

        /* Inventory */

        .filtros-inventario {
            display: grid;
            gap: 12px;
            margin-bottom: 22px;
        }

        .grupo-filtros-inventario {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .filtro-inventario {
            cursor: pointer;
        }

        .filtro-inventario.activo {
            border-color: #64d8ff;
        }

        /* Sound button */

        .boton-sonido-espacial {
            margin-top: 10px;
            padding: 9px 12px;
            border-radius: 10px;
            border: 1px solid #64d8ff;
            background: rgba(8, 17, 35, 0.9);
            color: #ffffff;
            font-size: 11px;
            cursor: pointer;
        }

        /* Reduce motion when requested */

        @media (prefers-reduced-motion: reduce) {
            .ratatopo-hablando,
            .pagina-comic,
            .tarjeta-objeto {
                animation: none !important;
                transition: none !important;
            }
        }
    `;

    document.head.appendChild(estilo);
}


/* ==========================================================
   198. CHECK MAIN CONTAINERS
========================================================== */

function verificarContenedoresIntegracion() {

    const necesarios = [
        "portada",
        "hiperespacio",
        "museo",
        "seleccionMundos",
        "vistaLuna",
        "vistaMarte",
        "lineasTiempo",
        "detalleObjeto",
        "comparacionMundos",
        "objetosOcultos",
        "cuestionario",
        "escena3d",
        "luna3d",
        "marte3d",
        "objetosLuna",
        "objetosMarte",
        "paginasComic",
        "opcionesPregunta",
        "botonInicio",
        "botonDescubierto",
        "botonRatatopo"
    ];

    const faltantes =
        necesarios.filter(id => {
            return !document.getElementById(id);
        });

    if (faltantes.length) {

        faltantes.forEach(id => {

            advertenciaIntegracion(
                "Missing HTML element #" + id
            );
        });

        return false;
    }

    return true;
}


/* ==========================================================
   199. REVIEW HISTORICAL DATA
========================================================== */

function verificarDatosIntegracion() {

    let correcto = true;

    if (!verificarArchivoHistorico()) {
        correcto = false;
    }

    if (!verificarComics()) {
        correcto = false;
    }

    if (!verificarPreguntas()) {
        correcto = false;
    }

    return correcto;
}


/* ==========================================================
   200. SAFELY PREPARE A MODULE

   An error in one module should not prevent
   the others from being diagnosed.
========================================================== */

function ejecutarModuloIntegracion(
    nombre,
    funcion
) {

    try {

        const resultado = funcion();

        if (resultado === false) {

            advertenciaIntegracion(
                `Module ${nombre} was not completed.`
            );

            return false;
        }

        console.log(
            `[ARCHIVO] ✓ ${nombre}`
        );

        return true;

    } catch (error) {

        INTEGRACION_MUSEO.errores.push({
            modulo: nombre,
            mensaje: error.message
        });

        console.error(
            `[ARCHIVO] Error in ${nombre}:`,
            error
        );

        return false;
    }
}


/* ==========================================================
   201. RESTORE INITIAL VISIBILITY
========================================================== */

function prepararVisibilidadInicial() {

    // Keep only the home screen visible.
    ["portada", "hiperespacio", "museo"]
        .forEach(id => {

            const pantalla =
                document.getElementById(id);

            if (!pantalla) return;

            const activa =
                id === "portada";

            pantalla.classList.toggle(
                "activa",
                activa
            );

            pantalla.setAttribute(
                "aria-hidden",
                String(!activa)
            );
        });

    // World selection will be the
    // first section of the museum.
    SECCIONES_MUSEO.forEach(id => {

        const seccion =
            document.getElementById(id);

        if (!seccion) return;

        const visible =
            id === "seleccionMundos";

        seccion.hidden = !visible;

        seccion.classList.toggle(
            "seccion-activa",
            visible
        );
    });

    ESTADO.pantallaActual = "portada";

    ESTADO.seccionActual =
        "seleccionMundos";

    ESTADO.seccionAnterior =
        "seleccionMundos";
}


/* ==========================================================
   202. PREPARE 3D SCENES AND MARKERS
========================================================== */

function prepararExploracionTridimensional() {

    if (!verificarThreeJS()) {

        advertenciaIntegracion(
            "Three.js is not available. " +
            "The HTML records will remain " +
            "the alternative exploration option."
        );

        return false;
    }

    const escenas =
        prepararSistema3D();

    if (!escenas) {
        return false;
    }

    const marcadores =
        prepararMapaHistorico3D();

    if (!marcadores) {

        advertenciaIntegracion(
            "Not all 3D markers " +
            "could be prepared."
        );
    }

    return true;
}


/* ==========================================================
   203. RESET VISIT PROGRESS

   We DO NOT use localStorage or sessionStorage.

   Each reload starts from zero.
========================================================== */

function prepararProgresoInicial() {

    recuperarProgreso();

    actualizarIndicadoresExploracion();

    ESTADO.mejorQuiz = 0;

    ESTADO.aciertos = 0;

    ESTADO.preguntaActual = 0;

    ESTADO.cuestionarioTerminado = false;

    actualizarProgreso();
}


/* ==========================================================
   204. UPDATE ALL VIEWS
========================================================== */

function actualizarMuseoCompleto() {

    actualizarIndicadoresExploracion();

    actualizarTarjetasDescubiertas();

    actualizarMarcadoresDescubiertos();

    actualizarEstadoCronologias();

    actualizarComparacion();

    actualizarObjetosOcultos();

    actualizarMarcadores3D();

    actualizarEstadoDescubrimiento();
}

/* ==========================================================
   205. GENERAL DIAGNOSTICS
========================================================== */

function diagnosticarMuseo() {

    const diagnostico = {

        proyecto:
            CONFIGURACION.nombreProyecto,

        objetos:
            ARCHIVO.length,

        luna:
            contarObjetosMundo("luna"),

        marte:
            contarObjetosMundo("marte"),

        preguntas:
            PREGUNTAS.length,

        comics:
            Object.keys(
                ESCENAS_COMIC
            ).length,

        threeJS:
            typeof THREE !== "undefined",

        nave3D:
            Boolean(MOTOR_3D.nave),

        luna3D:
            Boolean(MOTOR_3D.luna),

        marte3D:
            Boolean(MOTOR_3D.marte),

        marcadoresLuna3D:
            MARCADORES_3D.luna.length,

        marcadoresMarte3D:
            MARCADORES_3D.marte.length,

        progreso:
            calcularProgreso(),

        errores:
            INTEGRACION_MUSEO.errores.length,

        advertencias:
            INTEGRACION_MUSEO.advertencias.length
    };

    console.table(diagnostico);

    return diagnostico;
}


/* ==========================================================
   206. PRE-STARTUP FIXES
========================================================== */

function prepararReparacionesIntegracion() {

    if (
        INTEGRACION_MUSEO.reparacionesPreparadas
    ) {
        return;
    }

    instalarEstilosIntegracion();

    INTEGRACION_MUSEO.reparacionesPreparadas =
        true;
}


/* ==========================================================
   207. START THE COMPLETE APPLICATION

   Important order:

   1. Fixes and data
   2. Progress
   3. Navigation
   4. Archive and dossiers
   5. Comics
   6. Timelines and inventory
   7. Quiz
   8. Ratatopo and sound
   9. 3D planets and markers
   10. Diagnostics
========================================================== */

function iniciarAplicacion() {

    if (
        ESTADO.aplicacionIniciada ||
        INTEGRACION_MUSEO.iniciando
    ) {
        return;
    }

    INTEGRACION_MUSEO.iniciando = true;

    console.log(
        "================================"
    );

    console.log(
        "ARCHIVE OF THE FORGOTTEN"
    );

    console.log(
        "LOS RATATOPOS MARCIANOS"
    );

    console.log(
        "STARTING INTERPLANETARY MUSEUM"
    );

    console.log(
        "================================"
    );

    // ----------------------------------------
    // A. Compatibility
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Integration fixes",
        prepararReparacionesIntegracion
    );

    // ----------------------------------------
    // B. Checks
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "HTML structure",
        verificarContenedoresIntegracion
    );

    ejecutarModuloIntegracion(
        "Historical data",
        verificarDatosIntegracion
    );

    // ----------------------------------------
    // C. Progress from zero
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Initial progress",
        prepararProgresoInicial
    );

    // ----------------------------------------
    // D. Navigation
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Navigation",
        prepararSistemaNavegacion
    );

    ejecutarModuloIntegracion(
        "Initial visibility",
        prepararVisibilidadInicial
    );

    // ----------------------------------------
    // E. Historical objects
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Visual archive",
        prepararArchivoVisual
    );

    ejecutarModuloIntegracion(
        "Dossiers",
        prepararSistemaExpedientes
    );

    // ----------------------------------------
    // F. Comics
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Ratatopo comics",
        prepararSistemaComics
    );

    // ----------------------------------------
    // G. Timelines and inventory
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Timelines and comparison",
        prepararComparacionEInventario
    );

    // ----------------------------------------
    // H. Quiz
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Quiz",
        prepararCuestionario
    );

    // ----------------------------------------
    // I. Ratatopo and audio
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Ratatopo and sound",
        prepararRatatopoYAudio
    );

    // ----------------------------------------
    // J. 3D scenes
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "3D exploration",
        prepararExploracionTridimensional
    );

    // ----------------------------------------
    // K. Synchronization
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "General update",
        actualizarMuseoCompleto
    );

    // ----------------------------------------
    // L. Welcome screen
    // ----------------------------------------

    ejecutarModuloIntegracion(
        "Home screen",
        () => {
            mostrarPantalla("portada");
        }
    );

    // ----------------------------------------
    // M. Finish
    // ----------------------------------------

    ESTADO.aplicacionIniciada = true;

    INTEGRACION_MUSEO.iniciada = true;

    INTEGRACION_MUSEO.iniciando = false;

    diagnosticarMuseo();

    console.log(
        "[ARCHIVO] Initialization complete."
    );

    console.log(
        "[ARCHIVO] You can begin the journey."
    );
}


/* ==========================================================
   208. AUTOMATIC STARTUP

   This is the ONLY DOMContentLoaded
   in the new script.js.
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacion,
        { once: true }
    );

} else {

    iniciarAplicacion();
}


/* ==========================================================
   END OF NEW PART 12

   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   PART 13 — ARCHIVE REDESIGN

   1. Timeline with one card and arrows
   2. Photographs on object cards
   3. More complete historical explanations
   4. Moon and Mars separately

   PASTE AFTER PART 12
========================================================== */

const REDISENO = {
    mundo: "luna",
    indice: 0,
    fotos: new Map(),
    consultas: new Map(),
    iniciado: false
};


/* ==========================================================
   A. EXPANDED HISTORICAL CONTENT

   These explanations complement the
   archive; they do not replace the
   original mission documents.
========================================================== */

const RELATOS_AMPLIADOS = {

    "luna-01":
        "Luna 2 was the first human-made spacecraft to reach the lunar surface. Its impact in 1959 demonstrated that it was possible to send an object from Earth to another celestial body. It did not perform a controlled landing, but it paved the way for later missions.",

    "luna-02":
        "Luna 9 achieved the first soft landing of a spacecraft on the Moon in 1966. After descending, it transmitted panoramic images of the surface. Its photographs helped demonstrate that the lunar terrain could support a vehicle.",

    "luna-03":
        "Surveyor 1 was the first American spacecraft to make a soft landing on the Moon. In 1966, it transmitted thousands of images and made it possible to study surface conditions. Its results were important in preparing for later human lunar landings.",

    "luna-04":
        "The Eagle lunar module carried Neil Armstrong and Buzz Aldrin to the surface in July 1969. While the astronauts returned to orbit in its ascent stage, the descent stage remained on the Moon as physical evidence of that mission.",

    "luna-05":
        "The Apollo 11 astronauts installed a set of laser retroreflectors on the Moon. This instrument reflects pulses of light sent from Earth, allowing the distance between the two bodies to be measured with great precision. It is one of the lasting scientific legacies of lunar exploration.",

    "luna-06":
        "Intrepid was the lunar module of Apollo 12, the second mission to take astronauts to walk on the Moon. In November 1969, it made a precise descent near Surveyor 3. Its lower stage remained on the surface when the astronauts departed.",

    "luna-07":
        "Surveyor 3 landed on the Moon in 1967 to study the terrain and take photographs. Two years later, Apollo 12 astronauts visited the spacecraft and recovered some of its components for examination on Earth. The rest remains on the lunar surface.",

    "luna-08":
        "Lunokhod 1 was one of the first robotic vehicles to travel across another world. It reached the Moon in 1970 and was controlled from Earth. During its mission, it explored the terrain, took photographs, and carried out scientific observations before becoming motionless on the surface.",

    "luna-09":
        "Antares was the lunar module used by Apollo 14 in 1971. It transported Alan Shepard and Edgar Mitchell to the Fra Mauro region. After completing their scientific activities, the astronauts lifted off using the upper stage and left the descent structure on the Moon.",

    "luna-10":
        "Apollo 15 carried the first crewed lunar rover used on an Apollo mission in 1971. The rover made it possible to travel much greater distances than could be covered on foot and to transport instruments and samples. At the end of the expedition, the vehicle remained parked on the surface.",

    "luna-11":
        "The Apollo 16 rover allowed John Young and Charles Duke to explore the lunar highlands in 1972. The vehicle extended the reach of geological investigations and helped transport scientific materials. It has remained on the Moon since the mission ended.",

    "luna-12":
        "Apollo 17 was the last mission of the Apollo program to take humans to the lunar surface. Its rover made it possible to explore the Taurus-Littrow valley in December 1972. The vehicle remained there after completing one of the program's most extensive geological expeditions.",

    "marte-01":
        "Mars 2 was part of the Soviet Mars exploration program. In 1971, its descent module reached Mars but crashed and was unable to operate on the surface. Despite the failed landing, it was one of the first human-made objects to reach the planet.",

    "marte-02":
        "Mars 3 achieved the first soft landing on Mars in December 1971. However, communication with its surface module ended shortly after it began. Its story illustrates how difficult it was to operate a spacecraft in an environment about which very little was still known.",

    "marte-03":
        "Viking 1 landed on Mars in 1976 and conducted an extensive investigation of the surface. It transmitted images, studied the soil, and carried out experiments related to the search for possible signs of life. It was a fundamental mission for understanding the Martian environment.",

    "marte-04":
        "Viking 2 reached Mars in 1976 and complemented Viking 1's investigations from another region of the planet. It analyzed the soil, recorded atmospheric conditions, and transmitted photographs. Its observations helped compare different environments on the Martian surface.",

    "marte-05":
        "Mars Pathfinder landed on Mars in 1997 using an airbag system to cushion its descent. Its platform, called the Carl Sagan Memorial Station, served as a base for communications and scientific experiments conducted by the small Sojourner rover.",

    "marte-06":
        "Sojourner was the first robotic vehicle to travel across the surface of Mars. In 1997, it investigated rocks near the Pathfinder lander and demonstrated that a rover could operate remotely on another planet. Its success helped prepare later generations of explorers.",

    "marte-07":
        "Spirit reached Mars in 2004 to study rocks and soil. Although designed for a much shorter mission, it operated for several years. Its discoveries provided evidence of ancient processes related to water. Eventually, it became immobilized in the Martian terrain.",

    "marte-08":
        "Opportunity landed on Mars in 2004 and explored the planet for almost fifteen years. It traveled an extraordinary distance for a vehicle of its era and found evidence of ancient environments where water had existed. Its mission ended after an intense dust storm in 2018.",

    "marte-09":
        "Phoenix landed near the north polar region of Mars in 2008. It used a robotic arm to examine the soil and confirmed the presence of water ice near the surface. The arrival of the Martian winter brought its operations to an end.",

    "marte-10":
        "Curiosity landed in Gale Crater in 2012. This mobile laboratory investigates the rocks, climate, and environmental history of Mars. Its instruments have found evidence that the planet once had environments that may have provided conditions favorable for microbial life.",

    "marte-11":
        "InSight reached Mars in 2018 to investigate the planet's interior. Its seismometer recorded numerous marsquakes and made it possible to study the internal structure of Mars. The accumulation of dust on its solar panels progressively reduced its energy until the mission ended.",

    "marte-12":
        "Ingenuity was the first vehicle to achieve powered, controlled flight on another planet. It reached Mars alongside Perseverance and completed 72 flights between 2021 and 2024. Its demonstration opened new possibilities for aerial exploration of other worlds."
};


/* ==========================================================
   B. NASA PHOTOGRAPH SEARCH

   Images are requested when needed
   and stored in memory.

   Invented images are not presented
   as historical photographs.
========================================================== */

const TERMINOS_FOTOS = {
    "luna-01": "Luna 2 spacecraft",
    "luna-02": "Luna 9 spacecraft",
    "luna-03": "Surveyor 1 moon lander",
    "luna-04": "Apollo 11 lunar module Eagle",
    "luna-05": "Apollo 11 laser retroreflector",
    "luna-06": "Apollo 12 Intrepid lunar module",
    "luna-07": "Surveyor 3 lunar spacecraft",
    "luna-08": "Lunokhod 1 rover",
    "luna-09": "Apollo 14 Antares lunar module",
    "luna-10": "Apollo 15 lunar rover",
    "luna-11": "Apollo 16 lunar rover",
    "luna-12": "Apollo 17 lunar rover",
    "marte-01": "Mars 2 Soviet spacecraft",
    "marte-02": "Mars 3 Soviet lander",
    "marte-03": "Viking 1 Mars lander",
    "marte-04": "Viking 2 Mars lander",
    "marte-05": "Mars Pathfinder lander",
    "marte-06": "Sojourner Mars rover",
    "marte-07": "Spirit Mars rover",
    "marte-08": "Opportunity Mars rover",
    "marte-09": "Phoenix Mars lander",
    "marte-10": "Curiosity Mars rover",
    "marte-11": "InSight Mars lander",
    "marte-12": "Ingenuity Mars helicopter"
};

async function obtenerFotoArchivo(id) {

    if (REDISENO.fotos.has(id)) {
        return REDISENO.fotos.get(id);
    }

    if (REDISENO.consultas.has(id)) {
        return REDISENO.consultas.get(id);
    }

    const consulta = (async () => {

        const termino = TERMINOS_FOTOS[id];

        if (!termino) return null;

        try {

            const url = new URL(
                "https://images-api.nasa.gov/search"
            );

            url.searchParams.set("q", termino);
            url.searchParams.set("media_type", "image");
            url.searchParams.set("page_size", "30");

            const respuesta = await fetch(
                url.toString()
            );

            if (!respuesta.ok) {
                throw new Error(
                    "NASA responded with " + respuesta.status
                );
            }

            const datos = await respuesta.json();

            const elementos =
                datos.collection?.items || [];

            // Avoid using images from different
            // missions just because they share
            // a generic word.
            const palabras =
                termino.toLowerCase()
                    .replace(
                        /spacecraft|lander|rover|lunar|mars|moon|soviet|module|helicopter/g,
                        ""
                    )
                    .trim()
                    .split(/\s+/)
                    .filter(p => p.length > 1);

            for (const item of elementos) {

                const informacion =
                    item.data?.[0] || {};

                const texto = (
                    (informacion.title || "") + " " +
                    (informacion.description || "")
                ).toLowerCase();

                if (
                    palabras.length &&
                    !palabras.every(
                        palabra => texto.includes(palabra)
                    )
                ) {
                    continue;
                }

                const enlace =
                    (item.links || []).find(
                        enlace =>
                            enlace.rel === "preview" &&
                            /^https:\/\//.test(
                                enlace.href || ""
                            )
                    );

                if (!enlace) continue;

                const foto = {
                    src: enlace.href,
                    titulo:
                        informacion.title ||
                        termino,
                    credito: "NASA Image and Video Library",
                    pagina:
                        item.href || ""
                };

                REDISENO.fotos.set(id, foto);

                return foto;
            }

        } catch (error) {

            console.warn(
                "[ARCHIVO] Photograph unavailable:",
                id,
                error.message
            );
        }

        REDISENO.fotos.set(id, null);

        return null;

    })();

    REDISENO.consultas.set(id, consulta);

    try {
        return await consulta;
    } finally {
        REDISENO.consultas.delete(id);
    }
}

/* ==========================================================
   C. PHOTOGRAPHS ON OBJECT CARDS
========================================================== */

function instalarFotoEnTarjeta(tarjeta) {

    const id = tarjeta.dataset.objeto;

    if (!id || tarjeta.dataset.fotoSolicitada) {
        return;
    }

    tarjeta.dataset.fotoSolicitada = "true";

    const contenedor =
        tarjeta.querySelector(
            ".imagen-tarjeta-objeto"
        );

    if (!contenedor) return;

    obtenerFotoArchivo(id).then(foto => {

        if (!tarjeta.isConnected) {
            return;
        }

        if (!foto) {

            // Keep the original icon.
            contenedor.title =
                "No verified photograph was found " +
                "for this mission.";

            return;
        }

        const imagen =
            document.createElement("img");

        imagen.src = foto.src;
        imagen.alt =
            "Archive image: " + foto.titulo;

        imagen.loading = "lazy";
        imagen.decoding = "async";

        imagen.onerror = () => {
            imagen.remove();
        };

        const icono =
            contenedor.querySelector(
                ".icono-objeto"
            );

        if (icono) {
            icono.style.display = "none";
        }

        imagen.onload = () => {
            if (icono) {
                icono.style.display = "none";
            }
        };

        contenedor.prepend(imagen);

        const credito =
            document.createElement("span");

        credito.className =
            "credito-tarjeta-archivo";

        credito.textContent =
            "NASA ARCHIVE";

        contenedor.appendChild(credito);
    });
}

function enriquecerTarjetasArchivo() {

    document.querySelectorAll(
        ".tarjeta-objeto[data-objeto]"
    ).forEach(tarjeta => {

        const id = tarjeta.dataset.objeto;

        const relato =
            RELATOS_AMPLIADOS[id];

        if (relato) {

            const descripcion =
                tarjeta.querySelector(
                    ".descripcion-tarjeta"
                );

            if (descripcion) {

                descripcion.textContent =
                    relato;
            }
        }

        instalarFotoEnTarjeta(tarjeta);
    });
}


/* ==========================================================
   D. COMPLETE TIMELINE REDESIGN

   One large card.
   Left arrow.
   Photograph.
   Name and explanation.
   Right arrow.

   Reuses:
   #eventosLuna
   #eventosMarte
========================================================== */

function ordenarArchivoCronologico(mundo) {

    return obtenerObjetosMundo(mundo)
        .slice()
        .sort((a, b) => {

            const anioA =
                Number(
                    String(a.fecha).match(
                        /\b(?:19|20)\d{2}\b/
                    )?.[0] || 0
                );

            const anioB =
                Number(
                    String(b.fecha).match(
                        /\b(?:19|20)\d{2}\b/
                    )?.[0] || 0
                );

            return anioA - anioB;
        });
}

function crearBotonCronologia(
    simbolo,
    descripcion,
    accion
) {

    const boton =
        document.createElement("button");

    boton.type = "button";
    boton.className =
        "flecha-cronologia-nueva";

    boton.textContent = simbolo;
    boton.setAttribute(
        "aria-label",
        descripcion
    );

    boton.addEventListener(
        "click",
        accion
    );

    return boton;
}

function cambiarEventoCronologia(cambio) {

    const objetos =
        ordenarArchivoCronologico(
            REDISENO.mundo
        );

    if (!objetos.length) return;

    REDISENO.indice =
        (
            REDISENO.indice +
            cambio +
            objetos.length
        ) % objetos.length;

    pintarCronologiaNueva();
}

function pintarCronologiaNueva() {

    const mundo = REDISENO.mundo;

    const contenedor = document.getElementById(
        mundo === "luna"
            ? "eventosLuna"
            : "eventosMarte"
    );

    if (!contenedor) return;

    const objetos =
        ordenarArchivoCronologico(mundo);

    if (!objetos.length) return;

    REDISENO.indice =
        Math.max(
            0,
            Math.min(
                REDISENO.indice,
                objetos.length - 1
            )
        );

    const objeto =
        objetos[REDISENO.indice];

    const indiceActual =
        REDISENO.indice;

    contenedor.replaceChildren();

    const cuadro =
        document.createElement("article");

    cuadro.className =
        "cronologia-carrusel";

    const titulo =
        document.createElement("h3");

    titulo.className =
        "titulo-carrusel";

    titulo.textContent =
        "TIMELINE";

    const subtitulo =
        document.createElement("p");

    subtitulo.className =
        "subtitulo-carrusel";

    subtitulo.textContent =
        mundo === "luna"
            ? "MOON EXPLORATION"
            : "MARS EXPLORATION";

    const fila =
        document.createElement("div");

    fila.className =
        "fila-carrusel";

    const anterior =
        crearBotonCronologia(
            "❮",
            "Previous event",
            () => cambiarEventoCronologia(-1)
        );

    const siguiente =
        crearBotonCronologia(
            "❯",
            "Next event",
            () => cambiarEventoCronologia(1)
        );

    const contenido =
        document.createElement("div");

    contenido.className =
        "contenido-carrusel";

    const imagenMarco =
        document.createElement("div");

    imagenMarco.className =
        "foto-carrusel";

    const mensaje =
        document.createElement("p");

    mensaje.textContent =
        "SEARCHING PHOTOGRAPHIC ARCHIVE…";

    imagenMarco.appendChild(mensaje);

    const fecha =
        document.createElement("span");

    fecha.className =
        "fecha-carrusel";

    fecha.textContent =
        objeto.fecha || "DATE NOT RECORDED";

    const nombre =
        document.createElement("h4");

    nombre.className =
        "nombre-carrusel";

    nombre.textContent =
        objeto.nombre;

    const mision =
        document.createElement("p");

    mision.className =
        "mision-carrusel";

    mision.textContent =
        objeto.mision || "";

    const descripcion =
        document.createElement("p");

    descripcion.className =
        "descripcion-carrusel";

    descripcion.textContent =
        RELATOS_AMPLIADOS[objeto.id] ||
        objeto.historia ||
        objeto.descripcion ||
        "";

    const contador =
        document.createElement("p");

    contador.className =
        "contador-carrusel";

    contador.textContent =
        String(indiceActual + 1)
            .padStart(2, "0") +
        " / " +
        String(objetos.length)
            .padStart(2, "0");

    const abrir =
        document.createElement("button");

    abrir.type = "button";

    abrir.className =
        "abrir-carrusel";

    abrir.textContent =
        "EXPLORE DOSSIER →";

    abrir.addEventListener(
        "click",
        () => abrirObjeto(objeto.id)
    );

    contenido.append(
        imagenMarco,
        fecha,
        nombre,
        mision,
        descripcion,
        abrir,
        contador
    );

    fila.append(
        anterior,
        contenido,
        siguiente
    );

    cuadro.append(
        titulo,
        subtitulo,
        fila
    );

    contenedor.appendChild(cuadro);

    // Request the photograph without blocking
    // the arrows or navigation.
    obtenerFotoArchivo(objeto.id).then(
        foto => {

            if (!cuadro.isConnected) {
                return;
            }

            imagenMarco.replaceChildren();

            if (!foto) {

                const aviso =
                    document.createElement("p");

                aviso.textContent =
                    "PHOTOGRAPH NOT AVAILABLE " +
                    "FOR THIS SEARCH";

                imagenMarco.appendChild(
                    aviso
                );

                return;
            }

            const imagen =
                document.createElement("img");

            imagen.src = foto.src;
            imagen.alt = foto.titulo;
            imagen.loading = "lazy";

            imagen.onerror = () => {
                imagen.replaceWith(
                    document.createTextNode(
                        "IMAGE NOT AVAILABLE"
                    )
                );
            };

            imagenMarco.appendChild(imagen);

            const credito =
                document.createElement("span");

            credito.textContent =
                foto.credito;

            credito.className =
                "credito-carrusel";

            imagenMarco.appendChild(
                credito
            );
        }
    );
}


/* ==========================================================
   E. REPLACE THE OLD TIMELINE
========================================================== */

dibujarCronologias = function() {

    // Remove the old layout.
    const luna =
        document.getElementById(
            "eventosLuna"
        );

    const marte =
        document.getElementById(
            "eventosMarte"
        );

    if (luna) {
        luna.replaceChildren();
    }

    if (marte) {
        marte.replaceChildren();
    }

    pintarCronologiaNueva();
};

seleccionarMundoCronologia = function(mundo) {

    if (
        mundo !== "luna" &&
        mundo !== "marte"
    ) {
        return;
    }

    REDISENO.mundo = mundo;
    REDISENO.indice = 0;

    ESTADO.mundoCronologia = mundo;

    const luna =
        document.getElementById(
            "cronologiaLuna"
        );

    const marte =
        document.getElementById(
            "cronologiaMarte"
        );

    if (luna) {
        luna.hidden = mundo !== "luna";
    }

    if (marte) {
        marte.hidden = mundo !== "marte";
    }

    [
        ["botonTiempoLuna", "luna"],
        ["botonTiempoMarte", "marte"]
    ].forEach(([id, valor]) => {

        const boton =
            document.getElementById(id);

        if (boton) {

            boton.setAttribute(
                "aria-pressed",
                String(valor === mundo)
            );
        }
    });

    pintarCronologiaNueva();
};

/* ==========================================================
   F. NEW STYLES

   These styles are injected to prevent
   the old timeline rules from distorting
   our carousel.
========================================================== */

function instalarEstilosRediseno() {

    if (
        document.getElementById(
            "estilosRediseno13"
        )
    ) {
        return;
    }

    const estilo =
        document.createElement("style");

    estilo.id = "estilosRediseno13";

    estilo.textContent = `

        /* ==============================
           NEW TIMELINE
        ============================== */

        #eventosLuna,
        #eventosMarte {
            display: block !important;
            width: 100% !important;
            max-width: 920px !important;
            margin: 25px auto !important;
            padding: 0 !important;
        }

        #eventosLuna::before,
        #eventosMarte::before,
        #eventosLuna::after,
        #eventosMarte::after {
            display: none !important;
            content: none !important;
        }

        .cronologia-carrusel {
            position: relative;
            width: 100%;
            box-sizing: border-box;
            padding: 30px 24px;
            border: 1px solid #2777a5;
            border-radius: 20px;
            background:
                linear-gradient(
                    145deg,
                    #0c1a34,
                    #050c1d
                );
            box-shadow:
                0 15px 45px
                rgba(0,0,0,.3);
            text-align: center;
        }

        .titulo-carrusel {
            margin: 0 0 8px;
            color: #f5faff;
            font-size: clamp(
                22px, 4vw, 36px
            );
            letter-spacing: 2px;
            line-height: 1.2;
        }

        .subtitulo-carrusel {
            margin: 0 0 25px;
            color: #64d8ff;
            font-size: 12px;
            letter-spacing: 2px;
        }

        .fila-carrusel {
            display: grid;
            grid-template-columns:
                54px minmax(0, 1fr) 54px;
            align-items: center;
            gap: 15px;
        }

        .flecha-cronologia-nueva {
            display: grid;
            place-items: center;
            width: 54px;
            height: 70px;
            border: 1px solid #2777a5;
            border-radius: 12px;
            background: #102543;
            color: #64d8ff;
            font-size: 28px;
            cursor: pointer;
            transition: .2s;
        }

        .flecha-cronologia-nueva:hover {
            background: #17456b;
            color: white;
            transform: scale(1.04);
        }

        .contenido-carrusel {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .foto-carrusel {
            position: relative;
            width: 100%;
            max-width: 580px;
            height: 290px;
            overflow: hidden;
            display: grid;
            place-items: center;
            border: 1px solid #24527c;
            border-radius: 14px;
            background:
                radial-gradient(
                    circle,
                    #183252,
                    #081326
                );
            color: #b5c9dd;
            font-size: 12px;
        }

        .foto-carrusel img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        .credito-carrusel {
            position: absolute;
            right: 8px;
            bottom: 8px;
            padding: 4px 7px;
            background: rgba(0,0,0,.7);
            border-radius: 4px;
            color: white;
            font-size: 10px;
        }

        .fecha-carrusel {
            margin-top: 22px;
            color: #ffd27d;
            font-size: 13px;
            letter-spacing: 1px;
        }

        .nombre-carrusel {
            margin: 8px 0;
            color: #f4f8ff;
            font-size: clamp(
                23px, 4vw, 36px
            );
            line-height: 1.2;
        }

        .mision-carrusel {
            color: #64d8ff;
            font-size: 14px;
            margin: 0 0 14px;
        }

        .descripcion-carrusel {
            max-width: 650px;
            color: #c5d3e5;
            font-size: 15px;
            line-height: 1.85;
            text-align: center;
            overflow-wrap: break-word;
        }

        .abrir-carrusel {
            margin-top: 22px;
            padding: 13px 22px;
            border: 1px solid #64d8ff;
            border-radius: 10px;
            background: #0e3856;
            color: white;
            font-size: 12px;
            cursor: pointer;
        }

        .abrir-carrusel:hover {
            background: #185c80;
        }

        .contador-carrusel {
            margin: 18px 0 0;
            color: #8ba6c4;
            font-size: 13px;
            letter-spacing: 2px;
        }

        /* ==============================
           CARDS WITH PHOTOGRAPHS
        ============================== */

        .imagen-tarjeta-objeto {
            position: relative;
            height: 175px !important;
            min-height: 175px;
            overflow: hidden;
        }

        .imagen-tarjeta-objeto img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #091426;
            display: block;
        }

        .credito-tarjeta-archivo {
            position: absolute;
            right: 7px;
            bottom: 7px;
            background: rgba(0,0,0,.78);
            color: white;
            font-size: 9px;
            padding: 4px 6px;
            border-radius: 4px;
        }

        .tarjeta-objeto {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .contenido-tarjeta-objeto {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 8px;
        }

        .descripcion-tarjeta {
            font-size: 13px;
            line-height: 1.65;
            color: #b8c9dd;
        }

        .boton-ver-objeto {
            margin-top: auto;
            align-self: flex-start;
            padding: 10px 13px;
            border-radius: 8px;
            background: #123c5d;
            border: 1px solid #42bce8;
            color: #fff;
            cursor: pointer;
            font-size: 11px;
        }

        /* ==============================
           MOBILE DEVICES
        ============================== */

        @media (max-width: 650px) {

            .cronologia-carrusel {
                padding: 22px 10px;
            }

            .fila-carrusel {
                grid-template-columns:
                    34px minmax(0,1fr) 34px;
                gap: 5px;
            }

            .flecha-cronologia-nueva {
                width: 34px;
                height: 58px;
                font-size: 20px;
            }

            .foto-carrusel {
                height: 190px;
            }

            .descripcion-carrusel {
                font-size: 13px;
                line-height: 1.7;
            }

            .abrir-carrusel {
                font-size: 10px;
                padding: 10px;
            }
        }
    `;

    document.head.appendChild(estilo);
}


/* ==========================================================
   G. CONNECT REGENERATED CARDS

   If the museum redraws the cards,
   we also add photographs to the new ones.
========================================================== */

const dibujarTarjetasMundoBase =
    dibujarTarjetasMundo;

dibujarTarjetasMundo = function(mundo) {

    const resultado =
        dibujarTarjetasMundoBase(mundo);

    enriquecerTarjetasArchivo();

    return resultado;
};


/* ==========================================================
   H. INITIALIZE THE REDESIGN
========================================================== */

function iniciarRediseno13() {

    if (REDISENO.iniciado) {
        return;
    }

    REDISENO.iniciado = true;

    instalarEstilosRediseno();

    REDISENO.mundo =
        ESTADO.mundoCronologia === "marte"
            ? "marte"
            : "luna";

    REDISENO.indice = 0;

    // Prevent the old handlers
    // of the selectors from rebuilding
    // the vertical timeline.
    document.querySelectorAll(
        "#botonTiempoLuna, #botonTiempoMarte"
    ).forEach(boton => {

        boton.addEventListener(
            "click",
            evento => {

                evento.stopImmediatePropagation();

                seleccionarMundoCronologia(
                    boton.id === "botonTiempoLuna"
                        ? "luna"
                        : "marte"
                );

            },
            true
        );
    });

    seleccionarMundoCronologia(
        REDISENO.mundo
    );

    enriquecerTarjetasArchivo();

    console.log(
        "[ARCHIVO] Redesign 13 ready."
    );
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarRediseno13,
        { once: true }
    );

} else {

    iniciarRediseno13();
}

/* ==========================================================
   END OF PART 13
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 14
   EXPANDED HISTORICAL DOSSIERS

   - 24 individual stories
   - Before, during, and after
   - Scientific learning
   - Main NASA photograph
   - Improved reading design

   PASTE BELOW PART 13.
   DO NOT DELETE PREVIOUS CODE.
========================================================== */


/* ==========================================================
   209. HISTORICAL DOSSIERS OF THE 24 MISSIONS

   We recover the editorial content
   from the project's original archive.

   We do not confuse active missions
   with abandoned artifacts.
========================================================== */

Object.assign(DOSSIER, {

    /* ======================
       MOON STORIES
    ====================== */

    "luna-01": {
        titulo: "THE RACE TO THE MOON",
        antes:
            "In 1959, no human-made object had reached another world. The Soviet Union prepared Luna 2 to travel directly toward our natural satellite. It did not have a system for landing softly: its objective was to reach the surface.",
        durante:
            "On September 13, 1959, Luna 2 impacted the Moon. The spacecraft did not survive, but it confirmed that an interplanetary trajectory could carry an object built on Earth to another celestial body.",
        despues:
            "The impact marked a milestone in space history. During the journey, the instruments also collected information about the space environment.",
        aprendizaje:
            "The first arrival on the Moon was not a soft landing. It was an impact that paved the way for later missions."
    },

    "luna-02": {
        titulo: "A CAMERA ON ANOTHER WORLD",
        antes:
            "After the first lunar impacts, the challenge was to make a spacecraft survive contact with the ground. Luna 9 included a capsule designed to cushion the descent and deploy its mechanisms upon arrival.",
        durante:
            "On February 3, 1966, it achieved the first soft landing of a spacecraft on the Moon. From the surface, it transmitted panoramic images that allowed the lunar terrain to be observed directly.",
        despues:
            "The images helped scientists study the appearance and characteristics of the surface, while also demonstrating the usefulness of a robotic station on the Moon.",
        aprendizaje:
            "A photograph taken from the ground can answer questions that cannot be resolved simply by observing from Earth."
    },

    "luna-03": {
        titulo: "THE TERRAIN BEFORE APOLLO",
        antes:
            "Before sending people to the Moon, NASA needed to understand the terrain better and verify that its descent systems could work. Surveyor 1 was a robotic mission intended to reduce those uncertainties.",
        durante:
            "It launched on May 30, 1966, and landed on June 2 in Oceanus Procellarum. Its cameras transmitted numerous images of the region.",
        despues:
            "Its results helped prepare later missions and demonstrated the importance of studying a location before attempting a crewed expedition.",
        aprendizaje:
            "Exploration robots can prepare the way for human beings to visit other worlds."
    },

    "luna-04": {
        titulo: "THE MODULE LEFT BEHIND",
        antes:
            "Apollo 11 carried Neil Armstrong and Buzz Aldrin to the lunar surface, while Michael Collins remained in orbit. The Eagle module had a descent stage and an ascent stage.",
        durante:
            "On July 20, 1969, Eagle landed in the Sea of Tranquility. After their activities on the surface, the astronauts used the upper stage to return to lunar orbit.",
        despues:
            "The lower stage remained on the Moon. Today, it represents physical evidence of the first mission that allowed human beings to walk on another world.",
        aprendizaje:
            "Different parts of a spacecraft can perform different functions and have different destinations."
    },

    "luna-05": {
        titulo: "A MIRROR TO MEASURE THE MOON",
        antes:
            "The Apollo 11 astronauts carried a set of laser retroreflectors. These devices contain optical elements that return light toward the direction from which it came.",
        durante:
            "From observatories on Earth, laser pulses are sent toward the instrument, and the time it takes for the light to return is measured.",
        despues:
            "For decades, the experiment has helped measure the distance between Earth and the Moon with great precision and study the motion of both bodies.",
        aprendizaje:
            "A scientific instrument can remain useful long after the mission that installed it has ended."
    },

    "luna-06": {
        titulo: "LANDING WITH PRECISION",
        antes:
            "After Apollo 11, NASA wanted to demonstrate that it was possible to descend near a specific target. Apollo 12 selected an area close to the Surveyor 3 spacecraft.",
        durante:
            "Pete Conrad and Alan Bean landed in November 1969 and carried out scientific activities in Oceanus Procellarum.",
        despues:
            "Their proximity to Surveyor 3 made it possible to visit a robotic spacecraft that had been exposed to the lunar environment for more than two years.",
        aprendizaje:
            "Precise navigation makes it possible to return to specific locations to study objects and materials."
    },

    "luna-07": {
        titulo: "A SPACECRAFT VISITED BY HUMANS",
        antes:
            "Surveyor 3 landed in April 1967 and studied the surface using cameras and a small device for digging into the terrain.",
        durante:
            "In November 1969, the Apollo 12 astronauts walked to the spacecraft and removed some components to bring back to Earth.",
        despues:
            "Analysis of the recovered parts helped researchers investigate how the materials had withstood exposure to the lunar environment.",
        aprendizaje:
            "Robotic and crewed missions can complement each other in answering scientific questions."
    },

    "luna-08": {
        titulo: "WHEELS ON THE REGOLITH",
        antes:
            "Lunokhod 1 traveled to the Moon aboard Luna 17. It was designed as a robotic vehicle capable of moving across the surface and examining different locations.",
        durante:
            "It arrived in November 1970. Its movements were controlled from Earth, while its cameras and instruments recorded information about the terrain.",
        despues:
            "The mission demonstrated that a mobile vehicle could considerably expand the reach of lunar research.",
        aprendizaje:
            "Moving scientific instruments between several locations makes it possible to study differences that a fixed station cannot observe."
    },

    "luna-09": {
        titulo: "EXPLORING FRA MAURO",
        antes:
            "Apollo 14 resumed crewed lunar exploration after the problems experienced by Apollo 13. Its destination was the Fra Mauro region.",
        durante:
            "Alan Shepard and Edgar Mitchell descended in the Antares module in February 1971. During their excursions, they used a cart to transport equipment and samples.",
        despues:
            "The samples and observations obtained helped investigate the geological history of that lunar region.",
        aprendizaje:
            "Each landing site makes it possible to study a different part of the Moon's history."
    },

    "luna-10": {
        titulo: "THE FIRST LUNAR CAR",
        antes:
            "Apollo 15 was the first Apollo mission to carry a crewed lunar vehicle. The rover had to be folded for the journey to the surface.",
        durante:
            "David Scott and James Irwin used the vehicle in 1971 to explore the Hadley-Apennine region and travel between different sites of geological interest.",
        despues:
            "The rover made it possible to transport instruments and samples, as well as visit areas farther away from the lunar module.",
        aprendizaje:
            "Mobility changes the scale of an expedition and makes it possible to study a much larger region."
    },

    "luna-11": {
        titulo: "JOURNEY TO THE HIGHLANDS",
        antes:
            "Apollo 16 was directed toward the Descartes Highlands, a region different from the lunar maria explored during previous missions.",
        durante:
            "John Young and Charles Duke used a lunar vehicle to travel across the terrain in April 1972.",
        despues:
            "The samples and observations helped scientists better understand the materials of the lunar highlands.",
        aprendizaje:
            "Comparing different geological regions makes it possible to reconstruct the history of a world."
    },

    "luna-12": {
        titulo: "THE LAST ROVER OF THE APOLLO PROGRAM",
        antes:
            "Apollo 17 was the last Apollo mission to bring human beings to the lunar surface. Its crew included geologist Harrison Schmitt.",
        durante:
            "In December 1972, Schmitt and Gene Cernan used the rover to explore the Taurus-Littrow valley.",
        despues:
            "The vehicle remained on the Moon, while the samples and scientific records returned to Earth to be studied.",
        aprendizaje:
            "Samples and records collected during an expedition can continue to provide knowledge for generations."
    },

    /* ======================
       MARS STORIES
    ====================== */

    "marte-01": {
        titulo: "A DIFFICULT FIRST CONTACT",
        antes:
            "In 1971, the Soviet Union attempted to place a module on Mars. Entering its atmosphere and descending to the surface presented major technical challenges.",
        durante:
            "The Mars 2 module impacted the surface in November 1971 without completing a controlled landing.",
        despues:
            "Although it could not operate from the ground, the attempt provided lessons about the difficulties of reaching a distant planet.",
        aprendizaje:
            "A technical failure can also reveal the problems that future missions must solve."
    },

    "marte-02": {
        titulo: "A MESSAGE LASTING ONLY SECONDS",
        antes:
            "Mars 3 included a module designed to descend softly onto Mars, something that had not yet been achieved.",
        durante:
            "On December 2, 1971, it successfully landed on the planet and began transmitting, but communication ended quickly.",
        despues:
            "The success of the descent contrasted with the limited information received from the surface.",
        aprendizaje:
            "Landing is only the beginning: a mission also needs reliable power, instruments, and communications."
    },

    "marte-03": {
        titulo: "THE FIRST LONG-LASTING LABORATORY",
        antes:
            "Viking 1 combined an orbiter with a surface module. NASA wanted to investigate geology, the atmosphere, and possible biological processes.",
        durante:
            "It landed on July 20, 1976, in Chryse Planitia. Its instruments conducted experiments and took photographs during an extended mission.",
        despues:
            "Its observations became a fundamental reference for understanding Martian soil and the environment.",
        aprendizaje:
            "A fixed station can record changes over a long period and produce scientifically valuable data."
    },

    "marte-04": {
        titulo: "ANOTHER LANDSCAPE OF MARS",
        antes:
            "Viking 2 complemented Viking 1's investigations by studying a different region of the planet: Utopia Planitia.",
        durante:
            "It arrived in September 1976 and obtained photographs, atmospheric measurements, and soil analyses.",
        despues:
            "Comparing the data from both landers made it possible to identify differences between Martian regions.",
        aprendizaje:
            "What we observe in one location does not necessarily represent the conditions of an entire planet."
    },

    "marte-05": {
        titulo: "LANDING WITH AIRBAGS",
        antes:
            "Mars Pathfinder tested a more economical approach to exploration and a landing system that used airbags to cushion the impact.",
        durante:
            "It landed in Ares Vallis on July 4, 1997, and deployed the small Sojourner rover.",
        despues:
            "The platform operated as a scientific and communications station while the rover investigated its surroundings.",
        aprendizaje:
            "An innovation in landing technology can open new possibilities for exploring other worlds."
    },

    "marte-06": {
        titulo: "THE LITTLE EXPLORER",
        antes:
            "Sojourner was a compact six-wheeled vehicle that traveled to Mars with Pathfinder. It was much smaller than later rovers.",
        durante:
            "In 1997, it traveled across the terrain near the lander and studied rocks using a scientific instrument.",
        despues:
            "It demonstrated that mobile vehicles could operate on Mars and take measurements directly on the ground.",
        aprendizaje:
            "Early technology demonstrations can pave the way for larger and more complex machines."
    },

    "marte-07": {
        titulo: "SPIRIT'S LONG JOURNEY",
        antes:
            "Spirit landed in Gusev Crater in January 2004. Its initial mission was planned to last approximately three months.",
        durante:
            "The rover continued working for years and found materials showing the influence of water in ancient geological processes.",
        despues:
            "After becoming trapped in soft soil, contact with the vehicle was eventually lost.",
        aprendizaje:
            "A mission that exceeds its planned duration can multiply scientific discoveries."
    },

    "marte-08": {
        titulo: "FIFTEEN YEARS SEARCHING FOR CLUES",
        antes:
            "Opportunity landed in Meridiani Planum in January 2004 to investigate rocks and search for evidence of ancient water.",
        durante:
            "It studied sedimentary layers and minerals and traveled more than 45 kilometers. In 2018, a major dust storm interrupted communications.",
        despues:
            "The mission officially ended in 2019, leaving an enormous archive of observations of the Martian surface.",
        aprendizaje:
            "Rocks can preserve chemical and geological clues about environments that existed millions of years ago."
    },

    "marte-09": {
        titulo: "ICE BENEATH THE GROUND",
        antes:
            "Phoenix was sent to the high northern latitudes of Mars to investigate the soil and ice near the surface.",
        durante:
            "It landed in May 2008 and used a robotic arm to dig and analyze samples.",
        despues:
            "It confirmed the presence of water ice and provided important information about the Martian polar environment.",
        aprendizaje:
            "Water can remain frozen and hidden beneath a layer of soil."
    },

    "marte-10": {
        titulo: "A ROLLING LABORATORY",
        antes:
            "Curiosity arrived at Gale Crater in August 2012 with instruments designed to investigate ancient environments and their habitability conditions.",
        durante:
            "The rover has analyzed rocks, sediments, and chemical compounds while studying different geological layers of Mount Sharp.",
        despues:
            "Its story must be presented as an exploration mission, not automatically as an abandoned vehicle. Its operational status should be checked using up-to-date sources.",
        aprendizaje:
            "Finding conditions that may have supported life does not mean that life has been found."
    },

    "marte-11": {
        titulo: "LISTENING TO THE INTERIOR OF MARS",
        antes:
            "InSight was designed to study the internal structure of Mars through geophysical measurements rather than traveling across the surface.",
        durante:
            "It landed in Elysium Planitia in November 2018 and recorded numerous marsquakes.",
        despues:
            "The mission ended in 2022 due to a loss of power, but its data remains useful for investigating the planet's interior.",
        aprendizaje:
            "Seismic waves make it possible to study internal layers that we cannot observe directly."
    },

    "marte-12": {
        titulo: "THE FIRST FLIGHT ON ANOTHER PLANET",
        antes:
            "Ingenuity traveled to Mars alongside Perseverance to demonstrate that controlled flight was possible in an extremely thin atmosphere.",
        durante:
            "On April 19, 2021, it completed the first powered, controlled flight on another planet. It completed 72 flights before ending its mission in 2024.",
        despues:
            "Its experience opened new possibilities for using aerial vehicles in future planetary expeditions.",
        aprendizaje:
            "A technology demonstration can transform the way space exploration is planned."
    }

});

/* ==========================================================
   210. PRESENT THE STORY AS A NARRATIVE

   We use the DOSSIER data,
   rather than repeating the short description.
========================================================== */

function pintarHistoriaAmpliada14(objeto) {

    const contenedor =
        document.getElementById(
            "historiaCompleta"
        );

    const dossier = DOSSIER[objeto.id];

    if (!contenedor || !dossier) {
        return;
    }

    contenedor.replaceChildren();

    const cabecera =
        document.createElement("div");

    cabecera.className =
        "cabecera-historia-14";

    const etiqueta =
        document.createElement("span");

    etiqueta.textContent =
        "RECOVERED HISTORICAL DOSSIER";

    const titulo =
        document.createElement("h4");

    titulo.textContent =
        dossier.titulo;

    const introduccion =
        document.createElement("p");

    introduccion.textContent =
        `Discover the story of ${objeto.nombre}: ` +
        "why its mission was carried out, " +
        "what happened during the exploration " +
        "and what its legacy was.";

    cabecera.append(
        etiqueta,
        titulo,
        introduccion
    );

    contenedor.appendChild(
        cabecera
    );

    const etapas = [
        {
            numero: "01",
            titulo: "BEFORE THE MISSION",
            subtitulo: "The challenge",
            texto: dossier.antes
        },
        {
            numero: "02",
            titulo: "DURING THE MISSION",
            subtitulo: "What happened",
            texto: dossier.durante
        },
        {
            numero: "03",
            titulo: "AFTER THE MISSION",
            subtitulo: "The consequences",
            texto: dossier.despues
        }
    ];

    const rejilla =
        document.createElement("div");

    rejilla.className =
        "etapas-historia-14";

    etapas.forEach(etapa => {

        const tarjeta =
            document.createElement("section");

        tarjeta.className =
            "etapa-historia-14";

        const numero =
            document.createElement("span");

        numero.className =
            "numero-etapa-14";

        numero.textContent =
            etapa.numero;

        const encabezado =
            document.createElement("div");

        const subtitulo =
            document.createElement("span");

        subtitulo.className =
            "subtitulo-etapa-14";

        subtitulo.textContent =
            etapa.subtitulo;

        const nombre =
            document.createElement("h5");

        nombre.textContent =
            etapa.titulo;

        encabezado.append(
            subtitulo,
            nombre
        );

        const texto =
            document.createElement("p");

        texto.textContent =
            etapa.texto;

        tarjeta.append(
            numero,
            encabezado,
            texto
        );

        rejilla.appendChild(
            tarjeta
        );
    });

    contenedor.appendChild(
        rejilla
    );

    const conclusion =
        document.createElement("aside");

    conclusion.className =
        "conclusion-historia-14";

    const tituloConclusion =
        document.createElement("h5");

    tituloConclusion.textContent =
        "WHAT DID WE LEARN?";

    const textoConclusion =
        document.createElement("p");

    textoConclusion.textContent =
        dossier.aprendizaje;

    conclusion.append(
        tituloConclusion,
        textoConclusion
    );

    contenedor.appendChild(
        conclusion
    );

    // Also update the conclusion
    // displayed after the comic.
    escribirTexto(
        "#aprendizajeComic",
        dossier.aprendizaje
    );
}


/* ==========================================================
   211. PHOTOGRAPH IN THE MAIN VIEWER

   Uses obtenerFotoArchivo()
   from PART 13.

   If no suitable image is available,
   the original representation is preserved.
========================================================== */

function mejorarVisorExpediente14(objeto) {

    const visor =
        document.getElementById(
            "modeloObjeto"
        );

    if (!visor) return;

    const idSolicitado = objeto.id;

    visor.dataset.objetoFoto14 =
        idSolicitado;

    obtenerFotoArchivo(idSolicitado)
        .then(foto => {

            // If the visitor opened another
            // dossier, ignore this response.
            if (
                visor.dataset.objetoFoto14 !==
                idSolicitado
            ) {
                return;
            }

            if (!foto) {
                return;
            }

            const figura =
                document.createElement("figure");

            figura.className =
                "foto-principal-14";

            const imagen =
                document.createElement("img");

            imagen.src = foto.src;

            imagen.alt =
                "Historical archive image " +
                "associated with " + objeto.nombre +
                ": " + foto.titulo;

            imagen.loading = "lazy";

            const pie =
                document.createElement("figcaption");

            pie.textContent =
                foto.titulo +
                " · NASA Image and Video Library";

            imagen.onload = () => {

                if (
                    visor.dataset.objetoFoto14 !==
                    idSolicitado
                ) {
                    return;
                }

                figura.replaceChildren(
                    imagen,
                    pie
                );

                visor.replaceChildren(
                    figura
                );
            };

            // If loading fails, leave
            // the previous viewer unchanged.
            imagen.onerror = () => {};

        })
        .catch(error => {

            console.warn(
                "[ARCHIVO] Main photograph:",
                error.message
            );
        });
}

/* ==========================================================
   212. IMPROVE THE UPPER DESCRIPTION
========================================================== */

function mejorarDescripcionExpediente14(objeto) {

    const dossier = DOSSIER[objeto.id];

    if (!dossier) return;

    const descripcion =
        document.getElementById(
            "descripcionObjeto"
        );

    if (!descripcion) return;

    const resumen =
        RELATOS_AMPLIADOS[objeto.id] ||
        objeto.descripcion;

    descripcion.textContent = resumen;
}


/* ==========================================================
   213. CONNECT THE IMPROVEMENTS TO THE
        EXISTING DOSSIERS

   The click event is not duplicated.
   We extend rellenarExpediente().
========================================================== */

const rellenarExpedienteBase14 =
    rellenarExpediente;

rellenarExpediente = function(objeto) {

    if (!objeto) return;

    // First, run the system
    // that already existed.
    rellenarExpedienteBase14(objeto);

    // Then apply the improvements.
    mejorarDescripcionExpediente14(
        objeto
    );

    pintarHistoriaAmpliada14(
        objeto
    );

    mejorarVisorExpediente14(
        objeto
    );
};


/* ==========================================================
   214. STYLES FOR THE NEW DOSSIERS

   There is no need to modify style.css.
========================================================== */

function instalarEstilosExpedientes14() {

    if (
        document.getElementById(
            "estilosExpedientes14"
        )
    ) {
        return;
    }

    const estilo =
        document.createElement("style");

    estilo.id =
        "estilosExpedientes14";

    estilo.textContent = `

        /* ==========================
           PHOTOGRAPH VIEWER
        ========================== */

        #modeloObjeto {
            position: relative;
            overflow: hidden;
            min-height: 280px;
        }

        .foto-principal-14 {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 280px;
            margin: 0;
            background: #071225;
        }

        .foto-principal-14 img {
            display: block;
            width: 100%;
            height: 260px;
            object-fit: contain;
            background: #071225;
        }

        .foto-principal-14 figcaption {
            padding: 10px 12px;
            color: #a9c5dd;
            font-size: 11px;
            line-height: 1.5;
            text-align: center;
        }

        /* ==========================
           HISTORICAL HEADER
        ========================== */

        #historiaCompleta {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
        }

        .cabecera-historia-14 {
            margin: 0 auto 28px;
            padding: 26px;
            border: 1px solid
                rgba(80,190,235,.35);
            border-radius: 16px;
            background:
                linear-gradient(
                    135deg,
                    rgba(13,33,62,.95),
                    rgba(5,13,29,.95)
                );
            text-align: center;
        }

        .cabecera-historia-14 > span {
            display: block;
            margin-bottom: 12px;
            color: #ffd17b;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .cabecera-historia-14 h4 {
            margin: 0 0 14px;
            color: #fff;
            font-size: clamp(
                20px, 3vw, 30px
            );
            line-height: 1.3;
        }

        .cabecera-historia-14 p {
            max-width: 700px;
            margin: 0 auto;
            color: #bbccdf;
            font-size: 14px;
            line-height: 1.8;
        }

        /* ==========================
           THREE STAGES OF THE STORY
        ========================== */

        .etapas-historia-14 {
            display: grid;
            grid-template-columns:
                repeat(
                    3,
                    minmax(0, 1fr)
                );
            gap: 18px;
            align-items: stretch;
        }

        .etapa-historia-14 {
            min-width: 0;
            padding: 24px;
            border: 1px solid
                rgba(68,167,218,.45);
            border-radius: 16px;
            background: #0b1932;
            box-shadow:
                0 12px 28px
                rgba(0,0,0,.15);
        }

        .numero-etapa-14 {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            margin-bottom: 20px;
            border: 1px solid #64d8ff;
            border-radius: 50%;
            color: #64d8ff;
            font-size: 15px;
            font-weight: 700;
        }

        .subtitulo-etapa-14 {
            color: #ffd17b;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .etapa-historia-14 h5 {
            margin: 8px 0 16px;
            color: #f5faff;
            font-size: 17px;
            line-height: 1.4;
        }

        .etapa-historia-14 p {
            margin: 0;
            color: #c5d3e5;
            font-size: 14px;
            line-height: 1.9;
            overflow-wrap: break-word;
        }

        /* ==========================
           EDUCATIONAL CONCLUSION
        ========================== */

        .conclusion-historia-14 {
            margin-top: 22px;
            padding: 24px 28px;
            border-left: 4px solid
                #64d8ff;
            border-radius: 0 14px 14px 0;
            background: #102543;
        }

        .conclusion-historia-14 h5 {
            margin: 0 0 12px;
            color: #64d8ff;
            font-size: 15px;
            letter-spacing: 1px;
        }

        .conclusion-historia-14 p {
            margin: 0;
            color: #e0e9f5;
            font-size: 15px;
            line-height: 1.8;
        }

        /* ==========================
           UPPER DESCRIPTION
        ========================== */

        #descripcionObjeto {
            font-size: 14px;
            line-height: 1.85;
            overflow-wrap: break-word;
        }

        /* ==========================
           TABLETS
        ========================== */

        @media (max-width: 850px) {

            .etapas-historia-14 {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .etapa-historia-14:last-child {
                grid-column: 1 / -1;
            }
        }

        /* ==========================
           PHONES
        ========================== */

        @media (max-width: 580px) {

            .etapas-historia-14 {
                grid-template-columns: 1fr;
            }

            .etapa-historia-14:last-child {
                grid-column: auto;
            }

            .etapa-historia-14 {
                padding: 20px;
            }

            .cabecera-historia-14 {
                padding: 20px;
            }

            .conclusion-historia-14 {
                padding: 20px;
            }

            .foto-principal-14 img {
                height: 210px;
            }
        }
    `;

    document.head.appendChild(
        estilo
    );
}


/* ==========================================================
   215. VERIFY THE 24 DOSSIERS
========================================================== */

function verificarDossieres14() {

    const incompletos =
        ARCHIVO.filter(objeto => {

            const dossier =
                DOSSIER[objeto.id];

            return (
                !dossier ||
                !dossier.antes ||
                !dossier.durante ||
                !dossier.despues ||
                !dossier.aprendizaje
            );
        });

    if (incompletos.length) {

        console.warn(
            "[ARCHIVO] Incomplete dossiers:",
            incompletos.map(
                objeto => objeto.id
            )
        );

        return false;
    }

    console.log(
        "[ARCHIVO] 24 expanded " +
        "historical dossiers available."
    );

    return true;
}


/* ==========================================================
   216. INITIALIZE DOSSIER IMPROVEMENTS
========================================================== */

function iniciarExpedientes14() {

    instalarEstilosExpedientes14();

    verificarDossieres14();

    // If the visitor already had
    // a dossier open, update it.
    if (
        ESTADO.seccionActual ===
        "detalleObjeto" &&
        ESTADO.objetoActual
    ) {

        rellenarExpediente(
            ESTADO.objetoActual
        );
    }

    console.log(
        "[ARCHIVO] PART 14 ready."
    );
}


/* ==========================================================
   217. START PART 14

   We do not create another application.
   We only install the improvements.
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarExpedientes14,
        { once: true }
    );

} else {

    iniciarExpedientes14();
}


/* ==========================================================
   END OF NEW PART 14
========================================================== */

/* ==========================================================
   ARCHIVE OF THE FORGOTTEN
   LOS RATATOPOS MARCIANOS

   NEW PART 15
   VISUAL REPAIR OF COMICS AND CONTROLS

   APPEND AFTER PART 14.
   DO NOT DELETE ANY PREVIOUS PART.
========================================================== */


/* ==========================================================
   218. REPAIR STATE
========================================================== */

const REPARACION_15 = {
    iniciada: false,
    observador: null
};


/* ==========================================================
   219. COMPATIBILITY STYLES

   The original CSS uses some classes
   that differ from those produced by
   the new comic generator.

   These rules connect both designs.
========================================================== */

function instalarEstilosReparacion15() {

    if (document.getElementById(
        "estilosReparacion15"
    )) {
        return;
    }

    const estilo = document.createElement(
        "style"
    );

    estilo.id = "estilosReparacion15";

    estilo.textContent = `

        /* =================================
           1. COMIC CONTAINER
        ================================= */

        #comicObjeto {
            width: 100%;
            max-width: 1120px;
            margin: 55px auto;
            padding: 0 18px;
            box-sizing: border-box;
        }

        #comicObjeto,
        #comicObjeto * {
            box-sizing: border-box;
        }

        .portada-comic {
            max-width: 900px;
            margin: 0 auto 28px;
            padding: 28px;
            text-align: center;
        }

        #tituloComic {
            max-width: 760px;
            margin: 12px auto;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }

        #introduccionComic {
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.8;
        }

        /* =================================
           2. CURRENT PAGE
        ================================= */

        #paginasComic {
            display: block !important;
            width: 100%;
            max-width: 980px;
            margin: 0 auto;
            padding: 0;
        }

        #paginasComic .pagina-comic {
            width: 100%;
            min-width: 0;
            padding: 24px;
            border: 1px solid
                rgba(100,216,255,.45);
            border-radius: 20px;
            background:
                linear-gradient(
                    145deg,
                    #101f3e,
                    #071225
                );
            box-shadow:
                0 16px 40px
                rgba(0,0,0,.24);
            overflow: hidden;
        }

        #paginasComic .pagina-comic h3,
        #paginasComic .pagina-comic h4 {
            color: #f5faff;
            line-height: 1.4;
            overflow-wrap: anywhere;
        }

        /* =================================
           3. PANEL LAYOUT
        ================================= */

        #paginasComic .rejilla-vinetas {
            display: grid !important;
            grid-template-columns:
                minmax(0, 1.15fr)
                minmax(0, 1fr);
            align-items: stretch;
            gap: 20px;
            width: 100%;
            margin-top: 20px;
        }

        #paginasComic .vineta-comic,
        #paginasComic .vineta-narrativa {
            display: flex;
            flex-direction: column;
            position: relative;
            width: 100%;
            min-width: 0;
            min-height: 310px;
            margin: 0;
            padding: 20px;
            border: 1px solid
                rgba(100,216,255,.3);
            border-radius: 16px;
            background: #102140;
            overflow: hidden;
        }

        /* =================================
           4. ILLUSTRATED SCENE
        ================================= */

        #paginasComic .escenario-comic {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            min-height: 190px;
            margin-bottom: 18px;
            border: 1px solid
                rgba(100,216,255,.22);
            border-radius: 12px;
            background:
                radial-gradient(
                    circle at 50% 70%,
                    #243e66,
                    #070f24 70%
                );
            overflow: hidden;
            isolation: isolate;
        }

        #paginasComic .escenario-luna {
            background:
                radial-gradient(
                    circle at 50% 90%,
                    #56647a,
                    #152440 52%,
                    #050b1d 85%
                );
        }

        #paginasComic .escenario-marte {
            background:
                radial-gradient(
                    circle at 50% 90%,
                    #8a4a39,
                    #34223a 52%,
                    #050b1d 85%
                );
        }

        #paginasComic .estrellas-comic {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image:
                radial-gradient(
                    white 1px,
                    transparent 1px
                );
            background-size: 39px 37px;
            opacity: .28;
        }

        #paginasComic .planeta-comic {
            position: absolute;
            right: 12%;
            top: 12%;
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background:
                radial-gradient(
                    circle at 35% 30%,
                    #d9e0ea,
                    #67778e 65%,
                    #263247
                );
            box-shadow:
                0 0 24px
                rgba(200,220,255,.16);
        }

        #paginasComic .planeta-marte {
            background:
                radial-gradient(
                    circle at 35% 30%,
                    #dca080,
                    #a35439 60%,
                    #502b29
                );
        }

        #paginasComic .nave-comic {
            position: absolute;
            left: 15%;
            top: 22%;
            width: 48px;
            height: 20px;
            border-radius: 60% 60% 35% 35%;
            background: #b7cce1;
            box-shadow:
                0 0 12px
                rgba(100,216,255,.4);
            transform: rotate(-18deg);
        }

        /* =================================
           5. COMIC RATATOPO
        ================================= */

        #paginasComic .ratatopo-comic {
            position: relative;
            z-index: 2;
            display: block;
            width: 115px;
            height: 150px;
            flex-shrink: 0;
        }

        #paginasComic .casco-ratatopo {
            position: absolute;
            inset: 4px 10px 40px;
            border: 5px solid
                rgba(190,235,255,.75);
            border-radius: 50%;
            background:
                rgba(180,220,255,.12);
        }

        #paginasComic .cara-ratatopo {
            position: absolute;
            top: 36px;
            left: 30px;
            width: 55px;
            height: 52px;
            border-radius: 48%;
            background: #c7a1a1;
        }

        #paginasComic .oreja-ratatopo {
            position: absolute;
            top: 28px;
            width: 25px;
            height: 30px;
            border-radius: 50%;
            background: #e2a6b7;
        }

        #paginasComic .oreja-ratatopo:first-child {
            left: 18px;
        }

        #paginasComic .oreja-ratatopo:nth-child(2) {
            right: 18px;
        }

        #paginasComic .ojo-ratatopo {
            position: absolute;
            top: 58px;
            width: 7px;
            height: 9px;
            border-radius: 50%;
            background: #15243b;
        }

        #paginasComic .ojo-ratatopo:nth-of-type(1) {
            left: 43px;
        }

        #paginasComic .ojo-ratatopo:nth-of-type(2) {
            right: 43px;
        }

        #paginasComic .nariz-ratatopo {
            position: absolute;
            top: 76px;
            left: 54px;
            width: 9px;
            height: 7px;
            border-radius: 50%;
            background: #e9789c;
        }

        #paginasComic .traje-ratatopo {
            position: absolute;
            left: 25px;
            bottom: 0;
            width: 65px;
            height: 67px;
            border: 3px solid #78d8f2;
            border-radius: 18px 18px 12px 12px;
            background: #e5edf8;
        }

        #paginasComic .insignia-ratatopo {
            position: absolute;
            left: 48px;
            bottom: 34px;
            z-index: 3;
            font-size: 16px;
        }

        /* =================================
           6. SPEECH BUBBLE
        ================================= */

        #paginasComic .globo-dialogo-comic {
            position: relative;
            z-index: 3;
            width: 100%;
            max-width: 450px;
            margin: 8px auto 0;
            padding: 18px 20px;
            border: 2px solid #8bdcff;
            border-radius: 18px;
            background: #f3f8ff;
            color: #12203a !important;
            font-size: 15px;
            font-weight: 600;
            line-height: 1.7;
            text-align: center;
            overflow-wrap: anywhere;
            box-shadow:
                0 8px 22px
                rgba(0,0,0,.2);
        }

        #paginasComic .onomatopeya-comic {
            display: inline-block;
            align-self: flex-start;
            margin: 10px 0;
            padding: 6px 12px;
            border-radius: 8px;
            background: #ffd36b;
            color: #18213a;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 1px;
        }

        /* =================================
           7. NARRATION PANEL
        ================================= */

        #paginasComic .vineta-narrativa {
            justify-content: center;
            gap: 18px;
            padding: 28px;
            background:
                linear-gradient(
                    155deg,
                    #13294b,
                    #0a1730
                );
        }

        #paginasComic .etiqueta-vineta {
            display: inline-block;
            align-self: flex-start;
            padding: 8px 12px;
            border: 1px solid #64d8ff;
            border-radius: 8px;
            color: #64d8ff;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        #paginasComic .narracion-vineta {
            margin: 0;
            color: #eef4ff;
            font-size: 16px;
            line-height: 1.9;
            overflow-wrap: anywhere;
        }

        #paginasComic .nota-historica-comic {
            margin-top: auto;
            padding: 14px;
            border-left: 3px solid #ffd36b;
            border-radius: 0 8px 8px 0;
            background:
                rgba(255,211,107,.08);
            color: #d9e5f2;
            font-size: 13px;
            line-height: 1.7;
        }

        /* =================================
           8. COMIC CONTROLS
        ================================= */

        #comicObjeto .controles-comic {
            display: grid !important;
            grid-template-columns:
                minmax(0,1fr) auto minmax(0,1fr);
            align-items: center;
            gap: 16px;
            width: 100%;
            max-width: 980px;
            margin: 22px auto;
        }

        #comicAnterior,
        #comicSiguiente {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 12px 18px;
            border: 1px solid #64d8ff;
            border-radius: 10px;
            background: #103554;
            color: #f4faff;
            font-size: 12px;
            font-weight: 700;
            line-height: 1.5;
            text-align: center;
            white-space: normal;
            overflow-wrap: anywhere;
            cursor: pointer;
        }

        #comicAnterior:hover:not(:disabled),
        #comicSiguiente:hover:not(:disabled) {
            background: #19577c;
        }

        #comicAnterior:disabled,
        #comicSiguiente:disabled {
            opacity: .4;
            cursor: not-allowed;
        }

        #contadorComic {
            color: #ffd36b;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
        }

        /* =================================
           9. ARCHIVE CARDS
        ================================= */

        .tarjeta-objeto {
            min-width: 0;
            overflow: hidden;
        }

        .contenido-tarjeta-objeto {
            min-width: 0;
            padding: 16px !important;
        }

        .tarjeta-objeto .nombre-tarjeta {
            font-size: clamp(
                15px, 1.7vw, 19px
            );
            line-height: 1.4;
            overflow-wrap: anywhere;
        }

        .tarjeta-objeto .mision-tarjeta {
            font-size: 12px;
            line-height: 1.5;
        }

        .tarjeta-objeto .descripcion-tarjeta {
            font-size: 13px;
            line-height: 1.75;
            overflow-wrap: anywhere;
        }

        .tarjeta-objeto .estado-tarjeta {
            display: block;
            margin: 12px 0;
            font-size: 11px;
            line-height: 1.5;
        }

        .tarjeta-objeto .boton-ver-objeto {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 42px;
            margin: 12px 0 0;
            padding: 10px 12px;
            border: 1px solid #64d8ff;
            border-radius: 9px;
            background: #103554;
            color: #fff !important;
            font-size: 11px !important;
            font-weight: 700;
            line-height: 1.4;
            text-align: center;
            white-space: normal !important;
            overflow-wrap: anywhere;
            cursor: pointer;
        }

        .tarjeta-objeto .boton-ver-objeto:hover {
            background: #19577c;
        }

        /* =================================
           10. TIMELINE BUTTONS
        ================================= */

        .abrir-carrusel {
            min-height: 44px;
            max-width: 100%;
            white-space: normal;
            line-height: 1.5;
            overflow-wrap: anywhere;
        }

        .flecha-cronologia-nueva {
            flex-shrink: 0;
            touch-action: manipulation;
        }

        /* =================================
           11. ACCESSIBILITY
        ================================= */

        #comicObjeto button:focus-visible,
        .tarjeta-objeto button:focus-visible,
        .cronologia-carrusel button:focus-visible {
            outline: 3px solid #ffd36b;
            outline-offset: 3px;
        }

        /* =================================
           12. TABLETS
        ================================= */

        @media (max-width: 820px) {

            #paginasComic .rejilla-vinetas {
                grid-template-columns: 1fr;
            }

            #paginasComic .vineta-comic,
            #paginasComic .vineta-narrativa {
                min-height: 240px;
            }

            #paginasComic .escenario-comic {
                min-height: 210px;
            }
        }

        /* =================================
           13. PHONES
        ================================= */

        @media (max-width: 560px) {

            #comicObjeto {
                padding: 0 10px;
            }

            #paginasComic .pagina-comic {
                padding: 14px;
            }

            #paginasComic .vineta-comic,
            #paginasComic .vineta-narrativa {
                padding: 16px;
            }

            #paginasComic .globo-dialogo-comic {
                padding: 14px;
                font-size: 13px;
            }

            #paginasComic .narracion-vineta {
                font-size: 14px;
            }

            #comicObjeto .controles-comic {
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            #contadorComic {
                grid-column: 1 / -1;
                grid-row: 1;
            }

            #comicAnterior,
            #comicSiguiente {
                min-height: 48px;
                padding: 10px 8px;
                font-size: 10px;
            }

            .tarjeta-objeto .boton-ver-objeto {
                font-size: 11px !important;
            }
        }

        @media (prefers-reduced-motion: reduce) {

            #paginasComic *,
            .tarjeta-objeto *,
            .cronologia-carrusel * {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

    document.head.appendChild(estilo);
}


/* ==========================================================
   220. IMPROVE EXISTING BUTTONS

   We do not add new handlers:
   we preserve the click events from
   previous parts.
========================================================== */

function mejorarControles15() {

    document.querySelectorAll(
        ".boton-ver-objeto"
    ).forEach(boton => {

        boton.type = "button";

        boton.textContent =
            "EXPLORE DOSSIER";

        const tarjeta =
            boton.closest(
                ".tarjeta-objeto"
            );

        const id =
            tarjeta?.dataset.objeto;

        const objeto =
            id ? obtenerObjeto(id) : null;

        if (objeto) {

            boton.setAttribute(
                "aria-label",
                "Explore dossier of " +
                objeto.nombre
            );
        }
    });

    const anterior =
        document.getElementById(
            "comicAnterior"
        );

    const siguiente =
        document.getElementById(
            "comicSiguiente"
        );

    if (anterior) {
        anterior.textContent =
            "← PREVIOUS";
    }

    if (siguiente) {
        siguiente.textContent =
            "NEXT →";
    }
}


/* ==========================================================
   221. SYNCHRONIZE THE COMIC COUNTER

   Uses the state from PART 6.
   Does not change the pages or their stories.
========================================================== */

function sincronizarContadorComic15() {

    const contador =
        document.getElementById(
            "contadorComic"
        );

    if (!contador) return;

    const total =
        ESTADO.paginasComic.length;

    if (!total) {
        return;
    }

    const actual =
        ESTADO.paginaComic + 1;

    contador.textContent =
        `PANEL ${actual} OF ${total}`;

    const anterior =
        document.getElementById(
            "comicAnterior"
        );

    const siguiente =
        document.getElementById(
            "comicSiguiente"
        );

    if (anterior) {
        anterior.disabled =
            actual <= 1;
    }

    if (siguiente) {
        siguiente.disabled =
            actual >= total;
    }
}


/* ==========================================================
   222. IMPROVE COMIC RENDERING

   We execute the previous function
   and then adjust the controls.

   We do not duplicate its events.
========================================================== */

const mostrarPaginaComicBase15 =
    mostrarPaginaComic;

mostrarPaginaComic = function() {

    const resultado =
        mostrarPaginaComicBase15();

    sincronizarContadorComic15();

    mejorarControles15();

    return resultado;
};


/* ==========================================================
   223. UPDATE CONTROLS WHEN CARDS
        ARE REGENERATED

   Preserves the improvements from PART 13.
========================================================== */

const dibujarTarjetasMundoBase15 =
    dibujarTarjetasMundo;

dibujarTarjetasMundo = function(mundo) {

    const resultado =
        dibujarTarjetasMundoBase15(mundo);

    mejorarControles15();

    return resultado;
};


/* ==========================================================
   224. CHECK COMIC ELEMENTS
========================================================== */

function verificarComic15() {

    const ids = [
        "comicObjeto",
        "paginasComic",
        "comicAnterior",
        "comicSiguiente",
        "contadorComic",
        "tituloComic",
        "introduccionComic",
        "aprendizajeComic"
    ];

    const faltantes =
        ids.filter(id => {
            return !document.getElementById(
                id
            );
        });

    if (faltantes.length) {

        console.warn(
            "[ARCHIVO] Comic elements " +
            "not found:",
            faltantes
        );

        return false;
    }

    console.log(
        "[ARCHIVO] Comic structure " +
        "verified."
    );

    return true;
}


/* ==========================================================
   225. INITIALIZE VISUAL REPAIR

   Does not restart the application.
   Does not reset progress.
   Does not modify the 3D system.
========================================================== */

function iniciarReparacion15() {

    if (REPARACION_15.iniciada) {
        return;
    }

    REPARACION_15.iniciada = true;

    instalarEstilosReparacion15();

    verificarComic15();

    mejorarControles15();

    sincronizarContadorComic15();

    console.log(
        "[ARCHIVO] PART 15 ready."
    );
}


/* ==========================================================
   226. START PART 15
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarReparacion15,
        { once: true }
    );

} else {

    iniciarReparacion15();
}


/* ==========================================================
   END OF NEW PART 15
========================================================== */

/* CORRECTED PART 16 — 24 ILLUSTRATED COMICS (12 MOON + 12 MARS)
   If you already pasted the previous PART 16, DELETE IT and paste this version.
   Keep the comics_ratatopos folder alongside index.html and script.js. */
(function () {
  "use strict";
  const COMICS_ILUSTRADOS = Object.fromEntries(
    ["luna", "marte"].flatMap(mundo =>
      Array.from({ length: 12 }, (_, i) => {
        const id = `${mundo}-${String(i + 1).padStart(2, "0")}`;
        return [id, `comics_ratatopos/${id}.webp`];
      })
    )
  );

  if (typeof prepararComicObjeto !== "function") {
    console.error("[COMICS] prepararComicObjeto was not found. Place PART 16 after the previous parts.");
    return;
  }

  const estilo = document.createElement("style");
  estilo.textContent = '#comicObjeto .controles-comic[hidden]{display:none!important}';
  document.head.appendChild(estilo);

  const prepararComicOriginal = prepararComicObjeto;
  prepararComicObjeto = function (objeto) {
    const resultado = prepararComicOriginal.apply(this, arguments);
    const contenedor = document.getElementById("paginasComic");
    const controles = document.querySelector("#comicObjeto .controles-comic");
    if (controles) controles.hidden = false;
    if (!objeto || !contenedor || !COMICS_ILUSTRADOS[objeto.id]) return resultado;

    const imagen = document.createElement("img");
    imagen.src = COMICS_ILUSTRADOS[objeto.id];
    imagen.alt = `English illustrated mission comic about ${objeto.nombre}, by Los Ratatopos Marcianos`;
    imagen.loading = "lazy";
    imagen.decoding = "async";
    imagen.style.cssText = "display:block;width:100%;height:auto;border-radius:14px;";
    imagen.onerror = () => {
      contenedor.replaceChildren();
      const aviso = document.createElement("p");
      aviso.textContent = `Comic image missing: ${imagen.src}. Check the comics_ratatopos folder.`;
      contenedor.appendChild(aviso);
    };
    contenedor.replaceChildren(imagen);
    if (controles) controles.hidden = true;
    const titulo = document.getElementById("tituloComic");
    if (titulo) titulo.textContent = `${objeto.nombre} — Illustrated mission dossier`;
    const intro = document.getElementById("introduccionComic");
    if (intro) intro.textContent = "An illustrated story by Los Ratatopos Marcianos.";
    return resultado;
  };

  if (typeof mostrarPaginaComic === "function") {
    const mostrarPaginaOriginal = mostrarPaginaComic;
    mostrarPaginaComic = function () {
      if (typeof ESTADO !== "undefined" && ESTADO.objetoActual &&
          COMICS_ILUSTRADOS[ESTADO.objetoActual.id]) return;
      return mostrarPaginaOriginal.apply(this, arguments);
    };
  }
  console.log("[ARCHIVO] 24 illustrated comics registered: 12 Moon + 12 Mars.");
})();

/* PART 17 — COSMIC COVER / LOS RATATOPOS MARCIANOS
   Paste at the END of script.js, after PART 16. Does not modify HTML or CSS.
   ES/EN translates the cover and common controls; complete dossiers require their own translations.
*/
(function () {
  'use strict';
  function montar() {
    const portada = document.getElementById('portada');
    if (!portada || document.getElementById('rt-cosmos')) return;
    const css = document.createElement('style');
    css.textContent = `
      #portada { position:relative; overflow:hidden; isolation:isolate; }
      #portada .contenido-portada { position:relative; z-index:4; }
      #rt-cosmos { position:absolute; inset:0; z-index:1; overflow:hidden; pointer-events:none; }
      #rt-cosmos * { box-sizing:border-box; }
      #rt-lang { position:absolute; top:clamp(16px,4vw,36px); right:clamp(14px,4vw,44px); z-index:20; display:flex; align-items:center; gap:6px; padding:6px; border:1px solid #4cd9ff77; background:#06162bdf; border-radius:50px; box-shadow:0 0 20px #0bdcff33; }
      #rt-lang button { pointer-events:auto; cursor:pointer; color:#b6cbe6; background:transparent; border:0; border-radius:24px; padding:8px 13px; font:700 12px system-ui; letter-spacing:1px; }
      #rt-lang button[aria-pressed=true] { color:#001424; background:#58e8ff; box-shadow:0 0 12px #58e8ff88; }
      #rt-lang .rt-globe { padding:0 5px; font-size:16px; }
      .rt-planet { position:absolute; display:block; border-radius:50%; filter:drop-shadow(0 0 16px #78bfff44); animation:rt-float 9s ease-in-out infinite alternate; }
      .rt-mars { width:clamp(65px,10vw,155px); height:clamp(65px,10vw,155px); left:7%; top:18%; background:radial-gradient(circle at 30% 24%,#ffbb79 0%,#e77846 24%,#a92f31 61%,#361326 100%); box-shadow:inset -16px -14px 26px #19081b99; opacity:.9; }
      .rt-moon { width:clamp(46px,6vw,90px); height:clamp(46px,6vw,90px); right:11%; top:25%; background:radial-gradient(circle at 30% 26%,#f2f7ff,#8b9ebd 60%,#354d73); box-shadow:inset -12px -8px 17px #101a37aa; animation-delay:-3s; }
      .rt-saturn { width:clamp(48px,7vw,90px); height:clamp(48px,7vw,90px); right:19%; bottom:15%; background:radial-gradient(circle at 25% 20%,#f6d6a0,#bd806c 55%,#594462); transform:rotate(-24deg); opacity:.8; }
      .rt-saturn:after { content:''; position:absolute; width:160%; height:32%; border:5px solid #e8b58d9e; border-radius:50%; left:-30%; top:33%; transform:rotate(-24deg); }
      .rt-andromeda { position:absolute; width:clamp(130px,21vw,320px); height:clamp(60px,9vw,145px); left:5%; bottom:13%; border-radius:50%; transform:rotate(-23deg); background:radial-gradient(ellipse,#ffeac58a 0%,#aa8fe65e 14%,#5168cb3d 32%,transparent 69%); filter:blur(8px); opacity:.65; animation:rt-pulse 9s ease-in-out infinite alternate; }
      .rt-constellation { position:absolute; width:180px; height:115px; right:6%; top:47%; opacity:.55; }
      .rt-comet { position:absolute; width:6px; height:6px; border-radius:50%; background:#fff; box-shadow:0 0 10px 3px #b9f6ff; opacity:0; animation:rt-comet 12s linear infinite; }
      .rt-comet:before { content:''; position:absolute; right:0; top:2px; width:115px; height:2px; background:linear-gradient(to left,#fff9,transparent); transform-origin:right; }
      .rt-comet.a { top:12%; left:-20%; animation-delay:1s; }
      .rt-comet.b { top:39%; left:-20%; animation-delay:7s; animation-duration:17s; }
      .rt-comet.c { top:72%; left:-20%; animation-delay:11s; animation-duration:19s; }
      .rt-ship { position:absolute; left:9%; bottom:16%; width:112px; height:84px; animation:rt-shipfly 8s ease-in-out infinite alternate; filter:drop-shadow(0 0 13px #2bceff99); }
      .rt-dome { position:absolute; left:28px; top:0; width:58px; height:55px; background:linear-gradient(125deg,#d9fbffdf,#327bb8bb); border:3px solid #c7f4ff; border-radius:50% 50% 34% 34%; overflow:hidden; }
      .rt-rat { position:absolute; left:8px; top:13px; font-size:38px; line-height:1; animation:rt-wave 2.5s ease-in-out infinite; }
      .rt-saucer { position:absolute; top:47px; left:0; width:112px; height:29px; border-radius:50%; background:linear-gradient(#f9c6a4,#ff6d78 40%,#733c9a 70%,#14234b); border:2px solid #a5efff; }
      .rt-saucer:after { content:'✦   ✦   ✦'; color:#c7faff; font-size:12px; position:absolute; top:4px; left:27px; }
      .rt-flame { position:absolute; top:70px; left:40px; width:33px; height:15px; border-radius:0 0 50% 50%; background:linear-gradient(#65eeff,#318cff,transparent); animation:rt-flame .4s infinite alternate; }
      #rt-secret { position:absolute; left:2.5%; top:52%; width:29px; height:29px; border:2px solid #a77dfc55; border-radius:50%; background:radial-gradient(circle,#000 25%,#241240 46%,#ff9c5244 61%,transparent 72%); pointer-events:auto; cursor:pointer; opacity:.28; transition:opacity .3s,transform .3s; }
      #rt-secret:hover,#rt-secret:focus-visible { opacity:1; transform:scale(1.6) rotate(30deg); }
      #rt-secret.rt-found { opacity:1; width:90px; height:90px; box-shadow:0 0 32px #ba69ff66; animation:rt-pulse 2s infinite alternate; }
      #rt-secret-note { position:absolute; left:5%; top:66%; padding:8px 12px; border:1px solid #b69aff88; border-radius:8px; background:#0a0b23eb; color:#e5d5ff; font:12px system-ui; max-width:240px; pointer-events:none; z-index:6; }
      @keyframes rt-float { to { translate:0 18px; } }
      @keyframes rt-pulse { to { opacity:1; filter:blur(3px); } }
      @keyframes rt-comet { 0%,6% { opacity:0; transform:translate(0,0) rotate(-19deg); } 10% {opacity:1;} 29% {opacity:0; transform:translate(140vw,30vh) rotate(-19deg);} 100% {opacity:0;} }
      @keyframes rt-shipfly { to { transform:translate(35px,-24px) rotate(7deg); } }
      @keyframes rt-wave { 50% { transform:rotate(8deg) translateY(-2px); } }
      @keyframes rt-flame { to { height:23px; opacity:.65; } }
      @media(max-width:650px) { .rt-ship {left:2%; bottom:7%; transform:scale(.65); transform-origin:left bottom;} .rt-mars {left:-4%;top:12%;opacity:.55;} .rt-moon {right:3%;top:18%;opacity:.55;} .rt-constellation {right:-35px;opacity:.25;} #rt-lang {top:10px;right:10px;} }
      @media(prefers-reduced-motion:reduce) { #rt-cosmos *,#rt-cosmos *:before,#rt-cosmos *:after {animation:none!important;} }
    `;
    document.head.appendChild(css);
    const cosmos = document.createElement('div');
    cosmos.id = 'rt-cosmos';
    cosmos.setAttribute('aria-hidden', 'true');
    cosmos.innerHTML = '<span class="rt-planet rt-mars"></span><span class="rt-planet rt-moon"></span><span class="rt-planet rt-saturn"></span><span class="rt-andromeda"></span><span class="rt-comet a"></span><span class="rt-comet b"></span><span class="rt-comet c"></span><svg class="rt-constellation" viewBox="0 0 180 115"><path d="M10 75 L51 19 L96 58 L150 10 L171 89 L96 58" fill="none" stroke="#9feaff" stroke-width="1"/><g fill="#fff"><circle cx="10" cy="75" r="3"/><circle cx="51" cy="19" r="4"/><circle cx="96" cy="58" r="3"/><circle cx="150" cy="10" r="4"/><circle cx="171" cy="89" r="3"/></g></svg><div class="rt-ship"><span class="rt-flame"></span><span class="rt-dome"><span class="rt-rat">🐭</span></span><span class="rt-saucer"></span></div>';
    portada.prepend(cosmos);
    const secreto = document.createElement('button');
    secreto.id = 'rt-secret'; secreto.type = 'button'; secreto.title = '???'; secreto.setAttribute('aria-label','Discover space secret');
    cosmos.appendChild(secreto);
    secreto.addEventListener('click', () => {
      secreto.classList.toggle('rt-found');
      document.getElementById('rt-secret-note')?.remove();
      if (secreto.classList.contains('rt-found')) {
        const nota = document.createElement('div'); nota.id='rt-secret-note';
        nota.textContent = idioma === 'en' ? '🕳️ Secret found! A hidden black hole!' : '🕳️ Secret discovered! A hidden black hole!';
        cosmos.appendChild(nota);
      }
    });
    const selector = document.createElement('div'); selector.id='rt-lang';
    selector.setAttribute('role','group'); selector.setAttribute('aria-label','Language / Language');
    selector.innerHTML='<span class="rt-globe">🌐</span><button type="button" data-rt-lang="es">ES</button><button type="button" data-rt-lang="en">EN</button>';
    portada.appendChild(selector);
    selector.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>cambiarIdioma(b.dataset.rtLang)));
    cambiarIdioma(idioma);
  }
  const originales = new WeakMap();
  let idioma = localStorage.getItem('rt-idioma') === 'en' ? 'en' : 'es';
  const textos = [
    ['.subtitulo-portada','A JOURNEY THROUGH THE HISTORY OF SPACE EXPLORATION','A JOURNEY THROUGH THE HISTORY OF SPACE EXPLORATION'],
    ['.descripcion-portada','Some explorers returned. Others remained on distant worlds. But none should be forgotten.','Some explorers returned. Others remained on distant worlds. But none should be forgotten.'],
    ['#botonInicio','START EXPLORING ✦','START EXPLORING ✦'],
    ['.instruccion-portada','GET READY TO DISCOVER WHAT SPACE HAS LEFT BEHIND','GET READY TO DISCOVER WHAT SPACE HAS LEFT BEHIND']
  ];
  function cambiarIdioma(lang) {
    idioma = lang; localStorage.setItem('rt-idioma',lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('#rt-lang button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rtLang===lang)));
    const titulo = document.querySelector('#portada .contenido-portada h1');
    if (titulo) titulo.innerHTML = lang === 'en' ? 'ARCHIVE OF <span>THE FORGOTTEN</span>' : 'ARCHIVE OF <span>THE FORGOTTEN</span>';
    const destinos = document.querySelectorAll('#portada .destinos-portada span:not(.separador-destinos)');
    if(destinos[0]) destinos[0].textContent=lang==='en'?'THE MOON':'THE MOON';
    if(destinos[1]) destinos[1].textContent=lang==='en'?'MARS':'MARS';
    textos.forEach(([selector,es,en])=>{const el=document.querySelector('#portada '+selector);if(el)el.textContent=lang==='en'?en:es;});
    // Event so a future complete translation of dossiers/quizzes can connect without conflicts.
    document.dispatchEvent(new CustomEvent('ratatopos:idioma',{detail:{idioma:lang}}));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',montar);
  else montar();
})();

/* ================================================================
 PART 17 ULTRA — ARCHIVE OF THE FORGOTTEN / LOS RATATOPOS MARCIANOS
 Replace the ENTIRE previous Part 17 with this block. Keep Parts 1–16.
 Additional file: RATATOPO_NAVE_PRO.webp alongside index.html.
 No external libraries. 2D Canvas + 3D CSS transformations.
 The Ratatopo is a 2D illustration with movement and depth.
================================================================ */
(function () {
  "use strict";

  if (window.__RATATOPOS_ULTRA_17__) return;
  window.__RATATOPOS_ULTRA_17__ = true;

  const CONFIG = {
    planetas: 85,
    cometas: 72,
    estrellas: 320,
    constelaciones: 5,
    imagenRatatopo: "RATATOPO_NAVE_PRO.webp"
  };

  let idioma = localStorage.getItem("rt-idioma") === "en" ? "en" : "es";
  let portada, escenario, canvas, ctx, nave, secreto, selector;
  let estrellas = [], planetas = [], cometas = [], puntosConstelaciones = [];
  let ancho = 0, alto = 0, tiempoAnterior = 0, cuadro = 0;
  let activo = true, ratonX = 0, ratonY = 0;
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");

  const traducciones = [
    [".subtitulo-portada",
      "A JOURNEY THROUGH THE HISTORY OF SPACE EXPLORATION",
      "A JOURNEY THROUGH THE HISTORY OF SPACE EXPLORATION"],
    [".descripcion-portada",
      "Some explorers returned. Others remained on distant worlds. But none should be forgotten.",
      "Some explorers returned. Others remained on distant worlds. But none should be forgotten."],
    ["#botonInicio", "START EXPLORING ✦", "START EXPLORING ✦"],
    [".instruccion-portada",
      "GET READY TO DISCOVER WHAT SPACE HAS LEFT BEHIND",
      "GET READY TO DISCOVER WHAT SPACE HAS LEFT BEHIND"]
  ];

  function azar(min, max) {
    return min + Math.random() * (max - min);
  }

  function limitar(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function crearElemento(etiqueta, clase, padre) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (padre) padre.appendChild(elemento);
    return elemento;
  }

  function agregarEstilos() {
    if (document.getElementById("rt-ultra-estilos")) return;

    const style = document.createElement("style");
    style.id = "rt-ultra-estilos";
    style.textContent = `
      #portada {
        position: relative !important;
        overflow: hidden !important;
        isolation: isolate;
      }

      #portada .contenido-portada {
        position: relative !important;
        z-index: 10 !important;
      }

      #rt-ultra-escenario {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 2;
        pointer-events: none;
        perspective: 1000px;
      }

      #rt-ultra-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }

      #rt-ultra-andromeda {
        position: absolute;
        width: clamp(180px, 27vw, 460px);
        height: clamp(75px, 12vw, 190px);
        left: 3%;
        bottom: 10%;
        border-radius: 50%;
        transform: rotate(-27deg);
        background:
          radial-gradient(ellipse at center,
            #fff1d8c7 0%,
            #f7bbec9a 8%,
            #ac8ce47c 22%,
            #6475dc53 40%,
            #25449d19 60%,
            transparent 74%);
        filter: blur(11px);
        mix-blend-mode: screen;
        opacity: .75;
        animation: rt-ultra-galaxia 11s ease-in-out infinite alternate;
      }

      #rt-ultra-nebulosa {
        position: absolute;
        width: 55%;
        height: 80%;
        right: -15%;
        top: -25%;
        background:
          radial-gradient(ellipse,
            #7428bb28 0%,
            #2364bd17 35%,
            transparent 70%);
        filter: blur(28px);
        animation: rt-ultra-galaxia 16s ease-in-out infinite alternate-reverse;
      }

      #rt-ultra-nave {
        position: absolute;
        left: 5%;
        bottom: 8%;
        width: clamp(120px, 19vw, 270px);
        aspect-ratio: 1.55;
        z-index: 5;
        transform-style: preserve-3d;
        transform-origin: center;
        animation: rt-ultra-vuelo 8s ease-in-out infinite alternate;
        filter: drop-shadow(0 0 20px #25d9ff70);
        pointer-events: none;
        will-change: transform;
      }

      #rt-ultra-nave img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        position: relative;
        z-index: 2;
        animation: rt-ultra-balanceo 5s ease-in-out infinite alternate;
      }

      #rt-ultra-nave .rt-ultra-motor {
        position: absolute;
        width: 38%;
        height: 32%;
        left: -10%;
        top: 49%;
        z-index: 1;
        border-radius: 50%;
        background:
          radial-gradient(ellipse,
            #faffff 0%,
            #66efff 22%,
            #138bff9e 48%,
            transparent 76%);
        filter: blur(10px);
        transform: rotate(-13deg);
        animation: rt-ultra-propulsor .28s ease-in-out infinite alternate;
      }

      #rt-ultra-nave .rt-ultra-aura {
        position: absolute;
        inset: 13%;
        border-radius: 50%;
        background: radial-gradient(ellipse, #3fdfff36, transparent 72%);
        filter: blur(18px);
        z-index: 0;
        animation: rt-ultra-galaxia 3s ease-in-out infinite alternate;
      }

      #rt-ultra-idiomas {
        position: absolute;
        top: clamp(14px, 3vw, 34px);
        right: clamp(12px, 3vw, 38px);
        z-index: 30;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 6px;
        border: 1px solid #61dfff99;
        border-radius: 40px;
        background: #061326eb;
        box-shadow: 0 0 22px #00d5ff30;
        backdrop-filter: blur(10px);
      }

      #rt-ultra-idiomas span {
        padding: 0 5px;
        font-size: 16px;
      }

      #rt-ultra-idiomas button {
        border: none;
        background: transparent;
        color: #b5c9e7;
        font: 800 12px system-ui, sans-serif;
        letter-spacing: 1px;
        border-radius: 25px;
        padding: 9px 13px;
        cursor: pointer;
      }

      #rt-ultra-idiomas button[aria-pressed="true"] {
        background: #5deaff;
        color: #001522;
        box-shadow: 0 0 12px #5deaff77;
      }

      #rt-ultra-agujero {
        position: absolute;
        left: 2.5%;
        top: 49%;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        z-index: 8;
        opacity: .22;
        background:
          radial-gradient(circle,
            #000 0 29%,
            #261042 33%,
            #a35be2 48%,
            #ffac5277 58%,
            transparent 75%);
        transition: opacity .3s, width .5s, height .5s, transform .5s;
      }

      #rt-ultra-agujero:hover,
      #rt-ultra-agujero:focus-visible {
        opacity: 1;
        transform: rotate(30deg) scale(1.4);
        outline: 2px solid #c59aff;
      }

      #rt-ultra-agujero.rt-descubierto {
        width: 100px;
        height: 100px;
        opacity: 1;
        animation: rt-ultra-agujero-giro 8s linear infinite;
        box-shadow: 0 0 35px #a65aff66;
      }

      #rt-ultra-secreto-mensaje {
        position: absolute;
        left: 5%;
        top: 66%;
        z-index: 9;
        max-width: 250px;
        padding: 11px 14px;
        color: #efe4ff;
        font: 13px system-ui, sans-serif;
        background: #080c26ee;
        border: 1px solid #b48aff99;
        border-radius: 10px;
        box-shadow: 0 0 20px #b48aff33;
        pointer-events: none;
      }

      @keyframes rt-ultra-vuelo {
        0% {
          transform: translate3d(0, 0, 0)
                     rotateY(-10deg) rotateZ(-4deg);
        }
        50% {
          transform: translate3d(34px, -26px, 50px)
                     rotateY(10deg) rotateZ(3deg);
        }
        100% {
          transform: translate3d(65px, -12px, 10px)
                     rotateY(-5deg) rotateZ(-2deg);
        }
      }

      @keyframes rt-ultra-balanceo {
        from { transform: rotate(-2deg) translateY(0); }
        to   { transform: rotate(3deg) translateY(-5px); }
      }

      @keyframes rt-ultra-propulsor {
        from { opacity: .55; transform: scaleX(.8); }
        to   { opacity: 1; transform: scaleX(1.4); }
      }

      @keyframes rt-ultra-galaxia {
        from { opacity: .4; transform: scale(.96) rotate(-25deg); }
        to   { opacity: .9; transform: scale(1.08) rotate(-29deg); }
      }

      @keyframes rt-ultra-agujero-giro {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 700px) {
        #rt-ultra-nave {
          left: 0%;
          bottom: 4%;
          width: 125px;
          opacity: .9;
        }

        #rt-ultra-andromeda {
          bottom: 5%;
          opacity: .5;
        }

        #rt-ultra-idiomas {
          top: 9px;
          right: 9px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #rt-ultra-escenario *,
        #rt-ultra-escenario *::before,
        #rt-ultra-escenario *::after {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function prepararObjetos() {
    estrellas = [];
    planetas = [];
    cometas = [];
    puntosConstelaciones = [];

    for (let i = 0; i < CONFIG.estrellas; i++) {
      estrellas.push({
        x: Math.random(),
        y: Math.random(),
        radio: azar(.3, 1.8),
        brillo: azar(.2, .95),
        velocidad: azar(.5, 2),
        fase: azar(0, Math.PI * 2),
        tono: Math.random() > .8 ? 195 : 220
      });
    }

    const coloresPlanetas = [
      ["#ffe1b1", "#d58d59", "#51324b"],
      ["#9deaff", "#357cb6", "#172953"],
      ["#ffb18d", "#d95339", "#642438"],
      ["#c9a8ff", "#8252cb", "#342054"],
      ["#c4ffce", "#4aab8b", "#21475c"],
      ["#f7e2a0", "#ad986b", "#5c4561"],
      ["#f4a9d9", "#aa508f", "#462652"],
      ["#b8c7ff", "#5367b8", "#263365"]
    ];

    for (let i = 0; i < CONFIG.planetas; i++) {
      const paleta = coloresPlanetas[i % coloresPlanetas.length];
      const profundidad = azar(.35, 1);
      planetas.push({
        x: Math.random(),
        y: Math.random(),
        radio: azar(4, 25) * profundidad,
        profundidad,
        paleta,
        anillos: Math.random() < .26,
        fase: azar(0, Math.PI * 2),
        movimiento: azar(.1, .55),
        inclinacion: azar(-.7, .7),
        crateres: Math.random() < .5
      });
    }

    // The largest planets remain away from the central title.
    [
      {x:.10, y:.25, radio:52, paleta:coloresPlanetas[2], anillos:false},
      {x:.89, y:.30, radio:40, paleta:coloresPlanetas[1], anillos:true},
      {x:.85, y:.79, radio:48, paleta:coloresPlanetas[0], anillos:true},
      {x:.12, y:.82, radio:27, paleta:coloresPlanetas[3], anillos:false}
    ].forEach(p => {
      planetas.push({
        ...p,
        profundidad: 1,
        fase: azar(0, 6),
        movimiento: .2,
        inclinacion: -.25,
        crateres: true
      });
    });

    for (let i = 0; i < CONFIG.cometas; i++) {
      cometas.push({
        x: azar(-ancho, ancho),
        y: azar(-alto, alto),
        velocidad: azar(90, 320),
        largo: azar(25, 130),
        radio: azar(.7, 2.5),
        fase: azar(0, 25),
        intervalo: azar(4, 22),
        angulo: azar(.12, .48)
      });
    }

    for (let i = 0; i < CONFIG.constelaciones; i++) {
      const centroX = i % 2 ? .82 : .17;
      const centroY = .12 + i * .18;
      const puntos = [];

      for (let j = 0; j < 5; j++) {
        puntos.push({
          x: centroX + azar(-.085, .085),
          y: centroY + azar(-.055, .055)
        });
      }
      puntosConstelaciones.push(puntos);
    }
  }

  function ajustarCanvas() {
    if (!portada || !canvas) return;

    const rect = portada.getBoundingClientRect();
    ancho = Math.max(1, rect.width);
    alto = Math.max(1, rect.height);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    prepararObjetos();
    dibujar(performance.now() / 1000);
  }

  function dibujarEstrellas(t) {
    for (const e of estrellas) {
      const brillo = e.brillo *
        (.68 + .32 * Math.sin(t * e.velocidad + e.fase));

      ctx.beginPath();
      ctx.fillStyle = `hsla(${e.tono},95%,90%,${brillo})`;
      ctx.arc(e.x * ancho, e.y * alto, e.radio, 0, Math.PI * 2);
      ctx.fill();

      if (e.radio > 1.4 && brillo > .65) {
        ctx.strokeStyle = `rgba(190,235,255,${brillo * .4})`;
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(e.x * ancho - 5, e.y * alto);
        ctx.lineTo(e.x * ancho + 5, e.y * alto);
        ctx.moveTo(e.x * ancho, e.y * alto - 5);
        ctx.lineTo(e.x * ancho, e.y * alto + 5);
        ctx.stroke();
      }
    }
  }

  function dibujarPlaneta(p, t) {
    const x = p.x * ancho +
      Math.sin(t * p.movimiento + p.fase) * 4 * p.profundidad;

    const y = p.y * alto +
      Math.cos(t * p.movimiento + p.fase) * 6 * p.profundidad;

    const r = p.radio * limitar(ancho / 1100, .55, 1.2);

    // Prevent small planets from covering the central title.
    if (x > ancho * .32 && x < ancho * .69 &&
        y > alto * .32 && y < alto * .73 && r > 12) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    if (p.anillos) {
      ctx.save();
      ctx.rotate(p.inclinacion);
      ctx.strokeStyle = p.paleta[0] + "88";
      ctx.lineWidth = Math.max(1.3, r * .13);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.65, r * .43, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const degradado = ctx.createRadialGradient(
      -r * .38, -r * .43, r * .06,
      r * .20, r * .20, r * 1.35
    );

    degradado.addColorStop(0, p.paleta[0]);
    degradado.addColorStop(.46, p.paleta[1]);
    degradado.addColorStop(1, p.paleta[2]);

    ctx.shadowColor = p.paleta[1];
    ctx.shadowBlur = r * .3;
    ctx.fillStyle = degradado;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (p.crateres && r > 10) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.clip();

      for (let j = 0; j < 4; j++) {
        const cx = Math.sin(j * 2.7 + p.fase) * r * .57;
        const cy = Math.cos(j * 3.1 + p.fase) * r * .48;
        ctx.beginPath();
        ctx.fillStyle = "rgba(20,22,53,.12)";
        ctx.ellipse(cx, cy, r * .16, r * .09, -.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  function dibujarCometas(t) {
    for (const c of cometas) {
      const ciclo = (t + c.fase) % c.intervalo;
      const progreso = ciclo / c.intervalo;

      // Each comet appears during only part of its cycle.
      if (progreso > .3) continue;

      const desplazamiento = progreso * c.velocidad * 5;
      const x = c.x + desplazamiento;
      const y = c.y + desplazamiento * c.angulo;

      if (x < -150 || x > ancho + 150 ||
          y < -150 || y > alto + 150) continue;

      const opacidad = Math.sin((progreso / .3) * Math.PI);
      const colaX = x - c.largo;
      const colaY = y - c.largo * c.angulo;

      const grad = ctx.createLinearGradient(colaX, colaY, x, y);
      grad.addColorStop(0, "rgba(80,160,255,0)");
      grad.addColorStop(.7, `rgba(93,213,255,${opacidad * .35})`);
      grad.addColorStop(1, `rgba(255,255,255,${opacidad})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = c.radio * 1.6;
      ctx.beginPath();
      ctx.moveTo(colaX, colaY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255,255,255,${opacidad})`;
      ctx.beginPath();
      ctx.arc(x, y, c.radio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function dibujarConstelaciones(t) {
    ctx.save();
    ctx.lineWidth = .8;

    for (const puntos of puntosConstelaciones) {
      const alpha = .18 + .10 * Math.sin(t * .5);
      ctx.strokeStyle = `rgba(120,213,255,${alpha})`;

      ctx.beginPath();
      puntos.forEach((p, i) => {
        const x = p.x * ancho;
        const y = p.y * alto;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      for (const p of puntos) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(212,241,255,.75)";
        ctx.arc(p.x * ancho, p.y * alto, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function dibujar(t) {
    if (!ctx) return;

    ctx.clearRect(0, 0, ancho, alto);

    dibujarEstrellas(t);
    dibujarConstelaciones(t);

    planetas
      .slice()
      .sort((a, b) => a.profundidad - b.profundidad)
      .forEach(p => dibujarPlaneta(p, t));

    dibujarCometas(t);
  }

  function animar(timestamp) {
    if (!activo) return;

    // Approximately 30 FPS to preserve performance.
    if (timestamp - tiempoAnterior >= 33) {
      tiempoAnterior = timestamp;
      dibujar(timestamp / 1000);
    }

    cuadro = requestAnimationFrame(animar);
  }

  function cambiarIdioma(nuevo) {
    idioma = nuevo === "en" ? "en" : "es";

    try {
      localStorage.setItem("rt-idioma", idioma);
    } catch (error) {
      console.warn("Could not save the language:", error);
    }

    document.documentElement.lang = idioma;

    document.querySelectorAll("#rt-ultra-idiomas button")
      .forEach(boton => {
        boton.setAttribute(
          "aria-pressed",
          String(boton.dataset.idioma === idioma)
        );
      });

    const titulo = document.querySelector(
      "#portada .contenido-portada h1"
    );

    if (titulo) {
      titulo.innerHTML = idioma === "en"
        ? "ARCHIVE OF <span>THE FORGOTTEN</span>"
        : "ARCHIVE OF <span>THE FORGOTTEN</span>";
    }

    const destinos = document.querySelectorAll(
      "#portada .destinos-portada span:not(.separador-destinos)"
    );

    if (destinos[0]) {
      destinos[0].textContent =
        idioma === "en" ? "THE MOON" : "THE MOON";
    }

    if (destinos[1]) {
      destinos[1].textContent =
        idioma === "en" ? "MARS" : "MARS";
    }

    traducciones.forEach(([selectorCSS, es, en]) => {
      const elemento = document.querySelector(
        "#portada " + selectorCSS
      );

      if (elemento) {
        elemento.textContent = idioma === "en" ? en : es;
      }
    });

    const nota = document.getElementById(
      "rt-ultra-secreto-mensaje"
    );

    if (nota) {
      nota.textContent = idioma === "en"
        ? "🕳️ Secret discovered! A hidden black hole!"
        : "🕳️ Secret discovered! A hidden black hole!";
    }

    document.dispatchEvent(new CustomEvent(
      "ratatopos:idioma",
      { detail: { idioma } }
    ));
  }

  function crearSelector() {
    selector = crearElemento("div", "", portada);
    selector.id = "rt-ultra-idiomas";
    selector.setAttribute("role", "group");
    selector.setAttribute("aria-label", "Language / Language");

    const globo = crearElemento("span", "", selector);
    globo.textContent = "🌐";

    ["es", "en"].forEach(codigo => {
      const boton = crearElemento("button", "", selector);
      boton.type = "button";
      boton.dataset.idioma = codigo;
      boton.textContent = codigo.toUpperCase();

      boton.addEventListener("click", () => {
        cambiarIdioma(codigo);
      });
    });
  }

  function crearNave() {
    nave = crearElemento("div", "", escenario);
    nave.id = "rt-ultra-nave";
    nave.setAttribute("aria-hidden", "true");

    crearElemento("div", "rt-ultra-aura", nave);
    crearElemento("div", "rt-ultra-motor", nave);

    const imagen = crearElemento("img", "", nave);
    imagen.src = CONFIG.imagenRatatopo;
    imagen.alt = "Ratatopo astronaut piloting a spaceship";
    imagen.decoding = "async";

    imagen.onerror = () => {
      // If the illustration is missing, a simple backup spaceship appears.
      imagen.style.display = "none";
      nave.style.background =
        "radial-gradient(ellipse at 50% 40%,#7deaff,#2768a4 48%,#11254d 70%,transparent 71%)";
      nave.style.borderRadius = "50%";
      nave.style.height = "110px";

      const respaldo = crearElemento("div", "", nave);
      respaldo.textContent = "🐭🚀";
      respaldo.style.cssText =
        "font-size:52px;text-align:center;padding-top:18px";
    };
  }

  function crearSecreto() {
    secreto = crearElemento("button", "", escenario);
    secreto.id = "rt-ultra-agujero";
    secreto.type = "button";
    secreto.title = "???";
    secreto.setAttribute(
      "aria-label",
      "Discover a space secret"
    );

    secreto.addEventListener("click", () => {
      const descubierto = secreto.classList.toggle(
        "rt-descubierto"
      );

      document.getElementById(
        "rt-ultra-secreto-mensaje"
      )?.remove();

      if (descubierto) {
        const mensaje = crearElemento("div", "", escenario);
        mensaje.id = "rt-ultra-secreto-mensaje";
        mensaje.textContent = idioma === "en"
          ? "🕳️ Secret discovered! A hidden black hole!"
          : "🕳️ Secret discovered! A hidden black hole!";
      }
    });
  }

  function montar() {
    portada = document.getElementById("portada");

    if (!portada) {
      console.warn(
        "[RATATOPOS] #portada was not found."
      );
      return;
    }

    if (document.getElementById("rt-ultra-escenario")) {
      return;
    }

    // Remove decorations from a previous Part 17,
    // without touching the museum's main content.
    document.getElementById("rt-cosmos")?.remove();
    document.getElementById("rt-lang")?.remove();

    agregarEstilos();

    escenario = document.createElement("div");
    escenario.id = "rt-ultra-escenario";
    escenario.setAttribute("aria-label", "Animated universe");

    portada.prepend(escenario);

    crearElemento("div", "", escenario).id =
      "rt-ultra-andromeda";

    crearElemento("div", "", escenario).id =
      "rt-ultra-nebulosa";

    canvas = crearElemento("canvas", "", escenario);
    canvas.id = "rt-ultra-canvas";
    canvas.setAttribute("aria-hidden", "true");

    ctx = canvas.getContext("2d");

    crearNave();
    crearSecreto();
    crearSelector();

    ajustarCanvas();
    cambiarIdioma(idioma);

    if (!movimientoReducido.matches) {
      activo = true;
      cuadro = requestAnimationFrame(animar);
    }

    window.addEventListener("resize", ajustarCanvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        activo = false;
        cancelAnimationFrame(cuadro);
      } else if (!movimientoReducido.matches && !activo) {
        activo = true;
        tiempoAnterior = 0;
        cuadro = requestAnimationFrame(animar);
      }
    });

    movimientoReducido.addEventListener?.("change", evento => {
      activo = !evento.matches;
      cancelAnimationFrame(cuadro);

      if (activo) {
        tiempoAnterior = 0;
        cuadro = requestAnimationFrame(animar);
      } else {
        dibujar(performance.now() / 1000);
      }
    });

    console.log(
      "[RATATOPOS] PART 17 ULTRA activated:",
      CONFIG.planetas + " planets,",
      CONFIG.cometas + " comets,",
      CONFIG.estrellas + " stars."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar, {
      once: true
    });
  } else {
    montar();
  }

})();

/* ============================================================
   ARCHIVE OF THE FORGOTTEN
   PART 18 — INTERFACE, LANGUAGE AND RATATOPO FIXES
   LOS RATATOPOS MARCIANOS

   PASTE AFTER PART 17.
   DO NOT PASTE ANOTHER PREVIOUS PART 18.
============================================================ */

(function () {
  "use strict";

  if (window.RATATOPOS_PARTE18_CORREGIDA) return;
  window.RATATOPOS_PARTE18_CORREGIDA = true;

  const CLAVE_IDIOMA = "rt-idioma";

  let idioma = "es";
  let observador = null;
  let traduciendo = false;

  try {
    idioma = localStorage.getItem(CLAVE_IDIOMA) === "en"
      ? "en"
      : "es";
  } catch (_) {}

  /* ============================================================
     1. INTERFACE DICTIONARY

     Translates HTML text and text generated by JavaScript.
     Mission proper names are preserved.
  ============================================================ */

  const TRADUCCIONES = {
    "EXPLORAR MUNDOS": "EXPLORE WORLDS",
    "LÍNEAS DEL TIEMPO": "TIMELINES",
    "LINEAS DEL TIEMPO": "TIMELINES",
    "COMPARACIÓN": "COMPARISON",
    "DESAFÍO": "CHALLENGE",
    "INICIO": "HOME",
    "VOLVER": "BACK",
    "REGRESAR": "GO BACK",
    "CONTINUAR": "CONTINUE",
    "SIGUIENTE": "NEXT",
    "ANTERIOR": "PREVIOUS",
    "CERRAR": "CLOSE",
    "ABRIR": "OPEN",
    "VER MÁS": "SEE MORE",
    "VER DETALLES": "VIEW DETAILS",
    "VER EXPEDIENTE": "VIEW DOSSIER",
    "VER HISTORIA": "READ STORY",
    "DESCUBRIR": "DISCOVER",
    "DESCUBIERTO": "DISCOVERED",
    "DESCUBIERTOS": "DISCOVERED",
    "PENDIENTES": "REMAINING",
    "EXPLORAR LUNA": "EXPLORE THE MOON",
    "EXPLORAR MARTE": "EXPLORE MARS",
    "EXPLORAR LA LUNA": "EXPLORE THE MOON",
    "EXPLORAR MARTE →": "EXPLORE MARS →",
    "LA LUNA": "THE MOON",
    "MARTE": "MARS",

    "CENTRO DE MEMORIA INTERPLANETARIA":
      "INTERPLANETARY MEMORY CENTER",

    "NO ESTÁN PERDIDOS.":
      "THEY ARE NOT LOST.",

    "ESTÁN ESPERANDO SER RECORDADOS.":
      "THEY ARE WAITING TO BE REMEMBERED.",

    "Explora los rastros de las misiones espaciales, descubre sus historias y conoce los objetos que permanecen en otros mundos.":
      "Explore the traces of space missions, discover their stories, and learn about the objects that remain on other worlds.",

    "PROGRESO DE EXPLORACIÓN":
      "EXPLORATION PROGRESS",

    "Descubre los objetos del archivo para comenzar tu exploración.":
      "Discover the objects in the archive to begin your exploration.",

    "90% DESCUBRIMIENTOS · 10% CUESTIONARIO":
      "90% DISCOVERIES · 10% QUIZ",

    "SELECCIONA TU DESTINO":
      "CHOOSE YOUR DESTINATION",

    "DOS MUNDOS, INNUMERABLES HISTORIAS":
      "TWO WORLDS, COUNTLESS STORIES",

    "¿QUÉ SIGNIFICA DEJAR ALGO ATRÁS?":
      "WHAT DOES IT MEAN TO LEAVE SOMETHING BEHIND?",

    "DE DÓNDE VIENEN NUESTRAS HISTORIAS":
      "WHERE OUR STORIES COME FROM",

    "OBJETOS HISTÓRICOS":
      "HISTORICAL OBJECTS",

    "MISIONES ESPACIALES":
      "SPACE MISSIONS",

    "ARCHIVO INTERPLANETARIO":
      "INTERPLANETARY ARCHIVE",

    "EXPLORACIÓN LUNAR":
      "LUNAR EXPLORATION",

    "EXPLORACIÓN MARCIANA":
      "MARTIAN EXPLORATION",

    "CRONOLOGÍA":
      "TIMELINE",

    "LÍNEA DEL TIEMPO":
      "TIMELINE",

    "COMPARACIÓN DE MUNDOS":
      "WORLD COMPARISON",

    "OBJETOS OCULTOS":
      "HIDDEN OBJECTS",

    "CUESTIONARIO":
      "QUIZ",

    "DESAFÍO ESPACIAL":
      "SPACE CHALLENGE",

    "PREGUNTA":
      "QUESTION",

    "RESPUESTA CORRECTA":
      "CORRECT ANSWER",

    "RESPUESTA INCORRECTA":
      "INCORRECT ANSWER",

    "COMPROBAR RESPUESTA":
      "CHECK ANSWER",

    "SIGUIENTE PREGUNTA":
      "NEXT QUESTION",

    "REINTENTAR":
      "TRY AGAIN",

    "REINICIAR":
      "RESTART",

    "RESULTADOS":
      "RESULTS",

    "PUNTUACIÓN":
      "SCORE",

    "MISIÓN COMPLETADA":
      "MISSION COMPLETED",

    "¡MISIÓN COMPLETADA!":
      "MISSION COMPLETED!",

    "EXPEDIENTE HISTÓRICO":
      "HISTORICAL DOSSIER",

    "HISTORIA":
      "STORY",

    "DESCRIPCIÓN":
      "DESCRIPTION",

    "MISIÓN":
      "MISSION",

    "FECHA":
      "DATE",

    "UBICACIÓN":
      "LOCATION",

    "ESTADO":
      "STATUS",

    "CATEGORÍA":
      "CATEGORY",

    "COORDENADAS":
      "COORDINATES",

    "DESCUBRIMIENTO":
      "DISCOVERY",

    "CÓMIC":
      "COMIC",

    "LEER CÓMIC":
      "READ COMIC",

    "PÁGINA":
      "PAGE",

    "IMAGEN":
      "IMAGE",

    "FUENTE":
      "SOURCE",

    "ACTIVANDO SISTEMAS DE PROPULSIÓN...":
      "ACTIVATING PROPULSION SYSTEMS...",

    "CALCULANDO TRAYECTORIA ESPACIAL...":
      "CALCULATING SPACE TRAJECTORY...",

    "ESTABILIZANDO EL CAMPO DE NAVEGACIÓN...":
      "STABILIZING NAVIGATION FIELD...",

    "CONSULTANDO EL ARCHIVO INTERPLANETARIO...":
      "ACCESSING THE INTERPLANETARY ARCHIVE...",

    "PREPARANDO LA LLEGADA...":
      "PREPARING FOR ARRIVAL...",

    "INICIANDO SALTO HIPERESPACIAL...":
      "INITIATING HYPERSPACE JUMP...",

    "DESTINO ALCANZADO":
      "DESTINATION REACHED",

    "COORDENADAS NO DISPONIBLES":
      "COORDINATES UNAVAILABLE",

    "Misión finalizada":
      "Mission completed",

    "Rover inactivo":
      "Inactive rover",

    "Aterrizador inactivo":
      "Inactive lander",

    "Módulo lunar":
      "Lunar module",

    "Vehículo lunar":
      "Lunar vehicle",

    "Instrumento científico":
      "Scientific instrument",

    "Aterrizador robótico":
      "Robotic lander",

    "Aterrizador NASA":
      "NASA lander",

    "Rover NASA":
      "NASA rover",

    "Sonda soviética":
      "Soviet probe",

    "Aterrizador soviético":
      "Soviet lander",

    "Aterrizador polar":
      "Polar lander",

    "Aterrizador geofísico":
      "Geophysical lander",

    "Helicóptero NASA":
      "NASA helicopter"
  };

  const INVERSAS = new Map(
    Object.entries(TRADUCCIONES).map(
      ([es, en]) => [en, es]
    )
  );

  /* ============================================================
     2. RESPONSIVE DESKTOP STYLES

     Global zoom is NOT applied because it can break
     canvases, 3D planets, and button positions.
  ============================================================ */

  const CSS = `
    /* LANGUAGE BUTTON ALWAYS VISIBLE */
    #rt-ultra-idiomas {
      position: fixed !important;
      top: 16px !important;
      right: 18px !important;
      left: auto !important;
      bottom: auto !important;
      z-index: 2147483000 !important;
      display: flex !important;
      align-items: center !important;
      gap: 7px !important;
      padding: 8px !important;
      background: rgba(3, 12, 34, .96) !important;
      border: 2px solid #51eaff !important;
      border-radius: 15px !important;
      box-shadow: 0 0 25px #22dfff66 !important;
      backdrop-filter: blur(12px);
      pointer-events: auto !important;
    }

    #rt-ultra-idiomas button {
      font: 800 14px system-ui, sans-serif !important;
      min-width: 92px !important;
      min-height: 44px !important;
      padding: 10px 14px !important;
      letter-spacing: .5px !important;
      cursor: pointer !important;
    }

    #rt-ultra-idiomas button[aria-pressed="true"] {
      background: #5ceaff !important;
      color: #041427 !important;
    }

    /* REMOVE THE OLD SPACESHIP */
    #rt-ultra-nave {
      display: none !important;
    }

    /* MORE READABLE MAIN CONTENT */
    @media (min-width: 1000px) {

      #museo {
        font-size: 16px;
      }

      #museo h1 {
        font-size: clamp(34px, 3.3vw, 58px);
        line-height: 1.15;
      }

      #museo h2 {
        font-size: clamp(27px, 2.5vw, 43px);
        line-height: 1.2;
      }

      #museo h3 {
        font-size: clamp(20px, 1.6vw, 29px);
      }

      #museo p {
        font-size: clamp(15px, 1.1vw, 19px);
        line-height: 1.7;
      }

      #museo button,
      #museo .boton {
        min-height: 42px;
      }

      #seleccionMundos,
      #vistaLuna,
      #vistaMarte,
      #lineasTiempo,
      #comparacionMundos,
      #objetosOcultos,
      #cuestionario,
      #detalleObjeto {
        width: min(94%, 1320px);
        max-width: 1320px;
        margin-left: auto;
        margin-right: auto;
      }

      #museo .tarjeta-objeto {
        font-size: 16px;
      }

      #museo .tarjeta-objeto p {
        font-size: 15px;
      }
    }

    /* RATATOPO PILOT */
    #rt18-piloto {
      position: absolute;
      left: 3%;
      bottom: 6%;
      width: clamp(235px, 25vw, 390px);
      z-index: 8;
      pointer-events: none;
      animation: rt18-flotar 6s ease-in-out infinite;
      filter: drop-shadow(0 16px 25px #0008);
    }

    #rt18-piloto svg {
      width: 100%;
      display: block;
      overflow: visible;
    }

    #rt18-piloto .motor {
      transform-origin: 15% 70%;
      animation: rt18-impulso .35s infinite alternate;
    }

    #rt18-piloto .mano {
      transform-box: fill-box;
      transform-origin: 30% 90%;
      animation: rt18-saludo 3s infinite;
    }

    @keyframes rt18-flotar {
      0%, 100% {
        transform: translateY(0) rotate(-3deg);
      }
      50% {
        transform: translateY(-23px) rotate(3deg);
      }
    }

    @keyframes rt18-impulso {
      from {
        opacity: .6;
        transform: scaleX(.8);
      }
      to {
        opacity: 1;
        transform: scaleX(1.18);
      }
    }

    @keyframes rt18-saludo {
      0%, 35%, 100% { transform: rotate(0); }
      50% { transform: rotate(-22deg); }
      65% { transform: rotate(12deg); }
      80% { transform: rotate(-16deg); }
    }

    @media (max-width: 750px) {
      #rt-ultra-idiomas {
        top: 8px !important;
        right: 8px !important;
        padding: 4px !important;
      }

      #rt-ultra-idiomas button {
        min-width: 70px !important;
        min-height: 36px !important;
        font-size: 11px !important;
        padding: 6px !important;
      }

      #rt18-piloto {
        width: 165px;
        left: -12px;
        bottom: 3%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #rt18-piloto,
      #rt18-piloto * {
        animation: none !important;
      }
    }
  `;

  /* ============================================================
     3. TEXT NODE TRANSLATION

     Also works for content generated after
     clicking on missions, timelines, or quizzes.
  ============================================================ */

  function traducirFrase(texto) {
    const original = String(texto || "");
    const limpio = original.trim();

    if (!limpio) return original;

    let resultado = limpio;

    if (idioma === "en") {
      resultado = TRADUCCIONES[limpio] || limpio;

      if (resultado === limpio) {
        resultado = limpio
          .replace(/^DESTINO:\s*/i, "DESTINATION: ")
          .replace(/^PREGUNTA\s+(\d+)/i, "QUESTION $1")
          .replace(/^PÁGINA\s+(\d+)/i, "PAGE $1")
          .replace(
            /^Has recuperado (\d+) de (\d+) registros históricos\.$/i,
            "You have recovered $1 of $2 historical records."
          );
      }
    } else {
      resultado = INVERSAS.get(limpio) || limpio;

      resultado = resultado
        .replace(/^DESTINATION:\s*/i, "DESTINO: ")
        .replace(/^QUESTION\s+(\d+)/i, "PREGUNTA $1")
        .replace(/^PAGE\s+(\d+)/i, "PÁGINA $1")
        .replace(
          /^You have recovered (\d+) of (\d+) historical records\.$/i,
          "Has recuperado $1 de $2 registros históricos."
        );
    }

    if (resultado === limpio) return original;

    return original.replace(limpio, resultado);
  }

  function traducirElemento(elemento) {
    if (!elemento || elemento.nodeType !== 1) return;

    if (
      elemento.closest(
        "script,style,textarea,code,pre,svg," +
        "#rt-ultra-canvas,#rt18-piloto"
      )
    ) {
      return;
    }

    const walker = document.createTreeWalker(
      elemento,
      NodeFilter.SHOW_TEXT
    );

    const nodos = [];

    while (walker.nextNode()) {
      nodos.push(walker.currentNode);
    }

    nodos.forEach(nodo => {
      const padre = nodo.parentElement;

      if (!padre) return;

      if (
        padre.closest(
          "script,style,textarea,code,pre,svg," +
          "#rt18-piloto"
        )
      ) {
        return;
      }

      const nuevo = traducirFrase(nodo.nodeValue);

      if (nuevo !== nodo.nodeValue) {
        nodo.nodeValue = nuevo;
      }
    });

    elemento.querySelectorAll(
      "[placeholder],[title],[aria-label]"
    ).forEach(nodo => {
      ["placeholder", "title", "aria-label"].forEach(
        atributo => {
          const valor = nodo.getAttribute(atributo);

          if (!valor) return;

          const nuevo = traducirFrase(valor);

          if (nuevo !== valor) {
            nodo.setAttribute(atributo, nuevo);
          }
        }
      );
    });
  }

  function aplicarIdioma() {
    if (traduciendo) return;

    traduciendo = true;

    try {
      document.documentElement.lang = idioma;

      // The Part 17 selector already exists.
      const selector = document.getElementById(
        "rt-ultra-idiomas"
      );

      if (selector) {
        document.body.appendChild(selector);

        selector.querySelectorAll("button").forEach(
          boton => {
            const codigo = boton.dataset.idioma;

            boton.textContent =
              codigo === "en" ? "ENGLISH" : "ESPAÑOL";

            boton.setAttribute(
              "aria-pressed",
              String(codigo === idioma)
            );
          }
        );
      }

      traducirElemento(document.body);

      // Original messages from the space journey.
      if (
        typeof MENSAJES_HIPERESPACIO !== "undefined" &&
        Array.isArray(MENSAJES_HIPERESPACIO)
      ) {
        for (
          let i = 0;
          i < MENSAJES_HIPERESPACIO.length;
          i++
        ) {
          MENSAJES_HIPERESPACIO[i] =
            traducirFrase(MENSAJES_HIPERESPACIO[i]);
        }
      }

    } finally {
      traduciendo = false;
    }
  }

  /* ============================================================
     4. LANGUAGE SWITCHING
  ============================================================ */

  function cambiarIdioma(nuevo) {
    idioma = nuevo === "en" ? "en" : "es";

    try {
      localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch (_) {}

    aplicarIdioma();

    document.dispatchEvent(
      new CustomEvent("ratatopos:idioma-global", {
        detail: { idioma }
      })
    );
  }

  /* ============================================================
     5. RATATOPO INSIDE A SPACESHIP
     SVG drawn in code; no PNG required.
  ============================================================ */

  function crearRatatopo() {
    const escenario =
      document.getElementById("rt-ultra-escenario") ||
      document.getElementById("portada");

    if (!escenario) return;

    document.getElementById("rt18-piloto")?.remove();

    const piloto = document.createElement("div");
    piloto.id = "rt18-piloto";
    piloto.setAttribute("aria-hidden", "true");

    piloto.innerHTML = `
      <svg viewBox="0 0 500 350"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rt18-metal" x2="0.8" y2="1">
            <stop stop-color="#f4fbff"/>
            <stop offset=".5" stop-color="#80b8df"/>
            <stop offset="1" stop-color="#24547c"/>
          </linearGradient>

          <linearGradient id="rt18-glass" x2="1" y2="1">
            <stop stop-color="#b5f7ff" stop-opacity=".48"/>
            <stop offset=".6" stop-color="#3c94d5"
                  stop-opacity=".14"/>
            <stop offset="1" stop-color="#09284c"
                  stop-opacity=".6"/>
          </linearGradient>

          <linearGradient id="rt18-fire">
            <stop stop-color="#fff"/>
            <stop offset=".3" stop-color="#5df5ff"/>
            <stop offset=".8" stop-color="#137cff"/>
            <stop offset="1" stop-color="#137cff"
                  stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- ENGINES -->
        <g class="motor">
          <path d="M142 256 Q68 229 8 270
                   Q70 274 142 286Z"
                fill="url(#rt18-fire)"/>
          <path d="M142 278 Q78 270 20 310
                   Q91 309 142 298Z"
                fill="url(#rt18-fire)"/>
        </g>

        <!-- FINS -->
        <path d="M168 251 L95 321 L214 303Z"
              fill="#f07e50" stroke="#14294b"
              stroke-width="8"/>

        <path d="M343 251 L419 321 L302 303Z"
              fill="#f07e50" stroke="#14294b"
              stroke-width="8"/>

        <!-- SPACESHIP HULL -->
        <path d="M112 259 Q250 201 390 259
                 Q430 282 394 309
                 Q252 363 112 309
                 Q82 281 112 259Z"
              fill="url(#rt18-metal)"
              stroke="#112746"
              stroke-width="10"/>

        <!-- ORANGE TRIM -->
        <path d="M116 295 Q251 347 390 295"
              fill="none"
              stroke="#f18555"
              stroke-width="12"/>

        <!-- COCKPIT INTERIOR -->
        <path d="M157 242 Q150 92 250 70
                 Q352 92 345 242
                 Q251 267 157 242Z"
              fill="#173e6d"
              stroke="#9beaff"
              stroke-width="10"/>

        <!-- EARS -->
        <circle cx="203" cy="143" r="31"
                fill="#82add2"
                stroke="#2d537c" stroke-width="5"/>
        <circle cx="203" cy="143" r="18"
                fill="#f5a2bf"/>

        <circle cx="296" cy="143" r="31"
                fill="#82add2"
                stroke="#2d537c" stroke-width="5"/>
        <circle cx="296" cy="143" r="18"
                fill="#f5a2bf"/>

        <!-- ASTRONAUT SUIT -->
        <path d="M202 234 Q196 198 222 190
                 L279 190 Q306 199 300 234Z"
              fill="#f2f7ff"
              stroke="#284c74" stroke-width="6"/>

        <!-- BLUE HEAD -->
        <ellipse cx="250" cy="170" rx="65" ry="62"
                 fill="#8db8dd"
                 stroke="#345e88"
                 stroke-width="5"/>

        <!-- EYES -->
        <ellipse cx="225" cy="163" rx="11" ry="15"
                 fill="#17253b"/>
        <ellipse cx="275" cy="163" rx="11" ry="15"
                 fill="#17253b"/>
        <circle cx="229" cy="157" r="4" fill="white"/>
        <circle cx="279" cy="157" r="4" fill="white"/>

        <!-- NOSE -->
        <path d="M236 188 Q250 180 264 188
                 Q263 202 250 203
                 Q237 202 236 188Z"
              fill="#f18eb3"
              stroke="#9a557d"
              stroke-width="3"/>

        <!-- SMILE -->
        <path d="M250 203 Q237 221 222 210
                 M250 203 Q263 221 278 210"
              fill="none"
              stroke="#344765"
              stroke-width="3"
              stroke-linecap="round"/>

        <!-- WHISKERS -->
        <g fill="none" stroke="#375b7e"
           stroke-width="3">
          <path d="M203 193 L183 186"/>
          <path d="M203 202 L182 205"/>
          <path d="M297 193 L317 186"/>
          <path d="M297 202 L318 205"/>
        </g>

        <!-- WAVING HAND -->
        <g class="mano">
          <path d="M295 213 Q324 191 331 165"
                fill="none" stroke="#f3f7ff"
                stroke-width="17"
                stroke-linecap="round"/>
          <ellipse cx="334" cy="155" rx="15" ry="19"
                   fill="#f2a1c1"
                   stroke="#a55b86"
                   stroke-width="4"/>
        </g>

        <!-- TRANSPARENT CANOPY -->
        <path d="M157 242 Q150 92 250 70
                 Q352 92 345 242
                 Q251 267 157 242Z"
              fill="url(#rt18-glass)"
              stroke="#b6efff"
              stroke-width="5"/>

        <path d="M187 128 Q210 91 245 89"
              fill="none"
              stroke="#fff"
              stroke-width="9"
              stroke-linecap="round"
              opacity=".48"/>

        <!-- CONTROL PANEL -->
        <path d="M185 250 Q250 237 318 250
                 L308 281 Q249 292 194 281Z"
              fill="#173453"
              stroke="#91cfe9"
              stroke-width="5"/>

        <rect x="221" y="256" width="58" height="18"
              rx="5" fill="#071b32"/>
        <rect x="227" y="261" width="29" height="8"
              rx="2" fill="#4ceaff"/>
        <circle cx="269" cy="265" r="4"
                fill="#ffb259"/>

        <!-- SPACE EMBLEM -->
        <circle cx="250" cy="310" r="14"
                fill="#153455"
                stroke="#f5a14f"
                stroke-width="3"/>
        <circle cx="250" cy="310" r="5"
                fill="#f5a14f"/>
        <ellipse cx="250" cy="310" rx="18" ry="6"
                 fill="none"
                 stroke="#f5a14f"
                 stroke-width="2"
                 transform="rotate(-25 250 310)"/>
      </svg>
    `;

    escenario.appendChild(piloto);
  }

  /* ============================================================
     6. INITIALIZATION
  ============================================================ */

  function iniciar() {
    const estilo = document.createElement("style");
    estilo.id = "rt18-estilos";
    estilo.textContent = CSS;
    document.head.appendChild(estilo);

    crearRatatopo();

    const selector = document.getElementById(
      "rt-ultra-idiomas"
    );

    if (selector) {
      document.body.appendChild(selector);

      selector.querySelectorAll("button").forEach(
        boton => {
          const codigo = boton.dataset.idioma;

          boton.textContent =
            codigo === "en" ? "ENGLISH" : "ESPAÑOL";

          // Capture the click before the old
          // Part 17 handler.
          boton.addEventListener(
            "click",
            evento => {
              evento.stopImmediatePropagation();
              cambiarIdioma(codigo);
            },
            true
          );
        }
      );
    }

    aplicarIdioma();

    // Detect text created when entering other screens.
    observador = new MutationObserver(() => {
      if (traduciendo) return;

      // Disconnect to prevent loops.
      observador.disconnect();

      aplicarIdioma();

      observador.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });

    observador.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    document.addEventListener(
      "ratatopos:idioma",
      evento => {
        if (evento.detail?.idioma) {
          cambiarIdioma(evento.detail.idioma);
        }
      }
    );

    console.log(
      "[RATATOPOS] Corrected Part 18 installed."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar,
      { once: true }
    );
  } else {
    iniciar();
  }
})();
