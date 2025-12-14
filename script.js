// HÄMTA API-NYCKEL
async function getApiKey() { // definierar en asynkron funktion för att hämta API-nyckeln
    try { // börjar ett try-block för att fånga eventuella fel
        const resp = await fetch('https://4a6l0o1px9.execute-api.eu-north-1.amazonaws.com/key'); // Skickar en GET-förfrågan till API-endpointen som returnerar nyckeln
        if (!resp.ok) throw new Error("API-nyckel kunde inte hämtas."); // om statuskoden inte är 200-299 blir det fel
        const data = await resp.json(); // omvandlar svaret till JSON
        return data.key; // returnerar API-nyckeln
    } catch (err) { // om ett fel uppstår i try-blocket
        console.error("Fel vid hämtning av API-nyckel:", err); // loggar felet i konsolen
        showError("Kunde inte hämta API-nyckel. Ladda om sidan."); // visar ett felmeddelande i UI
        return null; // returnerar null för att signalera att nyckeln inte kunde hämtas
    }
}

// HÄMTA PLANETER
async function getBodies(apiKey) { // definierar en asynkron funktion för att hämta planetsdata, kräver API-nyckel
    try { // Startar try-block
        const resp = await fetch( // skickar GET-förfrågan
            "https://4a6l0o1px9.execute-api.eu-north-1.amazonaws.com/bodies", // API-endpoint för planetsdata
            {
                method: "GET", // specifierar att det är en GET-förfrågan (kan utelämnas, GET är default)
                headers: {
                    "x-zocom": apiKey // lägger med API-nyckeln i headern för autentisering
                }
            }
        );

        if (!resp.ok) throw new Error("Planetsdata kunde inte hämtas."); // om statuskod inte är OK, kasta fel
        const data = await resp.json(); // gör om svaret till JSON
        return data; // returnerar planetsdata, jag får tillbaka infon
    } catch (err) { // om något går fel
        console.error("Fel vid hämtning av planetsdata:", err); // loggar felet
        showError("Kunde inte hämta planetdata. Försök igen senare."); // visar fel i UI
        return null; // returnerar null för att signalera att planetsdata inte kunde hämtas
    }
}

// FELMEDDELANDE I UI
function showError(message) { // funktion för att visa felmeddelanden på sidan
    const overlay = document.getElementById("overlay"); // hämtar overlay-elementet
    overlay.classList.add("show"); // lägger till klassen 'show' för att visa overlayen
    document.getElementById("overlayTitle").textContent = "Fel"; // sätter rubrik i overlayen till "Fel"
    document.getElementById("overlayText").textContent = message; // sätter själva felmeddelandet
}

// KOPPLA PLANET-KLICK
function setupPlanetClicks(bodies) { // funktion som kopplar klick-event till varje planet
    const buttons = document.querySelectorAll('.planet'); // hämtar alla element med klassen 'planet'
    const overlay = document.getElementById('overlay'); // hämtar overlay-elementet
    const overlayTitle = document.getElementById('overlayTitle'); // hämtar rubrik-elementet i overlay
    const overlayText = document.getElementById('overlayText'); // hämtar text-elementet i overlay
    const closeBtn = document.getElementById('closeOverlay'); // hämtar stäng-knappen i overlay

    buttons.forEach((btn) => { // loopar igenom alla planet-knappar
        btn.addEventListener('click', () => { // lägger till klick-event på varje knapp
            const index = btn.dataset.index; // hämtar planetens index från dataset
            const body = bodies.bodies[index]; // hämtar planetsdata för den klickade planeten

            if (!body) { // om planetsdata inte finns
                showError("Kunde inte ladda planetens information."); // visa felmeddelande
                return; // avslutar funktionen
            }

            overlayTitle.textContent = body.name || "Okänt"; // sätter overlayens rubrik till planetens namn eller "Okänt" om det saknas

            overlayText.innerHTML = ` // Sätter overlayens text med planetspecifikationer
                <strong>Omkrets:</strong> ${body.circumference || "Okänt"} km<br> 
                <strong>KM från solen:</strong> ${body.distance || "Okänt"} km<br> 
                <strong>Månar:</strong> ${body.moons?.join(", ") || "Ingen"}<br><br> 
                ${body.desc || ""} 
            `;

            overlay.classList.add("show"); // visar overlayen
        });
    });

    closeBtn.addEventListener('click', () => { // när man klickar på stäng-knappen
        overlay.classList.remove('show'); // döljs overlayen
    });

    document.addEventListener('click', (e) => { // klick-event på hela dokumentet för att stänga overlay om man klickar utanför
        const clickedInsideOverlay = e.target.closest('#overlay'); // kolla OM klicket var inne i overlay
        const clickedPlanet = e.target.closest('.planet'); // kolla OM klicket var på en planet

        if (!clickedInsideOverlay && !clickedPlanet) { // OM klicket var utanför overlay och planet
            overlay.classList.remove('show'); // Dölja overlayen
        }
    });
}

// STARTA PROGRAMMET
async function start() { // asynkron funktion för att starta programmet
    const apiKey = await getApiKey(); // hämtar API-nyckel
    if (!apiKey) return; // OM nyckeln inte kunde hämtas, avbryt

    const bodies = await getBodies(apiKey); // hämtar planetsdata med nyckeln
    if (!bodies) return; // om planetsdata inte kunde hämtas, avbryt

    console.log("API-data:", bodies); // loggar planetsdata till konsolen för debugging
    setupPlanetClicks(bodies); // kopplar klick-event till alla planet-knappar
}

start(); // kör start-funktionen direkt när scriptet laddas
