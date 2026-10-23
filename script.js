// ── CONFIGURATION ──────────────────────────────────
const API_KEY = 'REMPLACE_PAR_TA_VRAIE_CLE';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ── SÉLECTION DES ÉLÉMENTS ─────────────────────────
const champVille    = document.getElementById('champ-ville');
const btnRecherche  = document.getElementById('btn-recherche');
const loader        = document.getElementById('loader');
const erreurDiv     = document.getElementById('erreur');
const meteoCarte    = document.getElementById('meteo-carte');

// Éléments d'affichage
const meteoVille    = document.getElementById('meteo-ville');
const meteoDesc     = document.getElementById('meteo-description');
const meteoTemp     = document.getElementById('meteo-temp');
const ressentiEl    = document.getElementById('ressenti');
const humiditeEl    = document.getElementById('humidite');
const ventEl        = document.getElementById('vent');
const pressionEl    = document.getElementById('pression');

// ── ÉTAT DE L'UI ────────────────────────────────────
function afficherLoader() {
    loader.style.display    = 'block';
    erreurDiv.style.display = 'none';
    meteoCarte.style.display = 'none';
}

function cacherLoader() {
    loader.style.display = 'none';
}

function afficherErreur(message) {
    cacherLoader();
    erreurDiv.style.display  = 'block';
    meteoCarte.style.display = 'none';
    erreurDiv.textContent    = message;
}

function afficherMeteo(data) {
    cacherLoader();
    erreurDiv.style.display  = 'none';
    meteoCarte.style.display = 'block';

    // Déstructurer les données de l'API
    const { name, main, weather, wind } = data;
    const { temp, feels_like, humidity, pressure } = main;
    const [{ description }] = weather;

    // Mettre à jour l'affichage
    meteoVille.textContent = name;
    meteoDesc.textContent  = description;
    meteoTemp.textContent  = `${Math.round(temp)}°C`;
    ressentiEl.textContent = `${Math.round(feels_like)}°C`;
    humiditeEl.textContent = `${humidity}%`;
    ventEl.textContent     = `${Math.round(wind.speed * 3.6)} km/h`; // m/s → km/h
    pressionEl.textContent = `${pressure} hPa`;
}

// ── APPEL API ───────────────────────────────────────
async function rechercherMeteo(ville) {
    // Validation : champ non vide
    const villeNettoyee = ville.trim();
    if (!villeNettoyee) {
        afficherErreur("Entre le nom d'une ville pour commencer.");
        return;
    }

    afficherLoader();

    try {
        const url = `${API_URL}?q=${encodeURIComponent(villeNettoyee)}&appid=${API_KEY}&units=metric&lang=fr`;
        const response = await fetch(url);

        if (response.status === 404) {
            throw new Error(`Ville "${villeNettoyee}" introuvable. Vérifie l'orthographe.`);
        }

        if (response.status === 401) {
            throw new Error("Clé API invalide ou non activée. Attends quelques minutes après la création.");
        }

        if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status}). Réessaie plus tard.`);
        }

        const data = await response.json();
        afficherMeteo(data);

    } catch (erreur) {
        // Distinguer les erreurs réseau des erreurs qu'on a lancées
        if (erreur instanceof TypeError) {
            afficherErreur("Problème de connexion. Vérifie ta connexion internet.");
        } else {
            afficherErreur(erreur.message);
        }
    }
}

// ── ÉVÉNEMENTS ─────────────────────────────────────
btnRecherche.addEventListener('click', () => {
    rechercherMeteo(champVille.value);
});

champVille.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        rechercherMeteo(champVille.value);
    }
});

// ── CHARGEMENT INITIAL ──────────────────────────────
// Charger une ville par défaut au démarrage
rechercherMeteo('Abidjan');