// =====================================================
//  MASTERMIND - logique du jeu
//  Modes : solo, 2 joueurs, l'ordinateur devine
//  Niveaux + meilleurs scores (localStorage)
// =====================================================

// ===== Paramètres =====
const COULEURS = [
  { nom: "Rouge",  hex: "#e5484d" },
  { nom: "Vert",   hex: "#30a46c" },
  { nom: "Bleu",   hex: "#3e63dd" },
  { nom: "Jaune",  hex: "#f5d90a", sombre: true },
  { nom: "Orange", hex: "#f76b15" },
  { nom: "Violet", hex: "#8e4ec6" },
  { nom: "Rose",   hex: "#e93d82" },
  { nom: "Gris",   hex: "#8b8d98" },
];

const NIVEAUX = {
  facile:    { nom: "Facile",    couleurs: 6, longueur: 4, essais: 12 },
  normal:    { nom: "Normal",    couleurs: 6, longueur: 4, essais: 10 },
  difficile: { nom: "Difficile", couleurs: 8, longueur: 5, essais: 10 },
};

const CLE_SCORES = "mastermind-scores";

// ===== État =====
const etat = {
  mode: "solo",          // "solo" | "deux" | "ordi"
  niveau: NIVEAUX.normal,
  phase: "devine",       // "creation" | "devine" | "ordi" | "fini"
  secret: [],
  essai: [],             // pions posés par le joueur (null = vide)
  tentative: 0,
  joueur1: "Joueur 1",
  joueur2: "Joueur 2",
  possibles: [],         // mode ordi : combinaisons encore possibles
  proposition: [],       // mode ordi : dernière proposition
};

// ===== Éléments =====
const $ = id => document.getElementById(id);
const ecrans = { menu: $("ecran-menu"), jeu: $("ecran-jeu"), scores: $("ecran-scores") };

// =====================================================
//  Logique pure
// =====================================================

function codeAleatoire(longueur, nbCouleurs) {
  const code = [];
  for (let i = 0; i < longueur; i++) {
    code.push(Math.floor(Math.random() * nbCouleurs));
  }
  return code;
}

// Renvoie { bien, mal } : bien = bonne couleur bien placée,
// mal = bonne couleur mal placée.
function evaluer(secret, essai) {
  let bien = 0;
  const cs = Array(COULEURS.length).fill(0);
  const ce = Array(COULEURS.length).fill(0);
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === essai[i]) bien++;
    cs[secret[i]]++;
    ce[essai[i]]++;
  }
  let communs = 0;
  for (let c = 0; c < COULEURS.length; c++) {
    communs += Math.min(cs[c], ce[c]);
  }
  return { bien, mal: communs - bien };
}

// Toutes les combinaisons possibles (utilisé par l'ordinateur)
function toutesCombinaisons(longueur, nbCouleurs) {
  let resultat = [[]];
  for (let i = 0; i < longueur; i++) {
    const suivant = [];
    for (const partiel of resultat) {
      for (let c = 0; c < nbCouleurs; c++) suivant.push([...partiel, c]);
    }
    resultat = suivant;
  }
  return resultat;
}

// =====================================================
//  Scores
// =====================================================

function lireScores() {
  try {
    return JSON.parse(localStorage.getItem(CLE_SCORES)) || {};
  } catch (e) {
    return {};
  }
}

function ecrireScores(scores) {
  try {
    localStorage.setItem(CLE_SCORES, JSON.stringify(scores));
  } catch (e) { /* stockage indisponible : on ignore */ }
}

function enregistrerScore(nomNiveau, nomJoueur, essais) {
  const scores = lireScores();
  const liste = scores[nomNiveau] || [];
  liste.push({ nom: nomJoueur, essais });
  liste.sort((a, b) => a.essais - b.essais);
  scores[nomNiveau] = liste.slice(0, 5);
  ecrireScores(scores);
}

function afficherScores() {
  const scores = lireScores();
  const conteneur = $("liste-scores");
  conteneur.innerHTML = "";
  for (const niveau of Object.values(NIVEAUX)) {
    const bloc = document.createElement("div");
    bloc.className = "bloc-score";
    const titre = document.createElement("h3");
    titre.textContent = niveau.nom;
    bloc.appendChild(titre);
    const liste = scores[niveau.nom] || [];
    if (liste.length === 0) {
      const vide = document.createElement("p");
      vide.className = "vide";
      vide.textContent = "Aucun score pour l'instant.";
      bloc.appendChild(vide);
    } else {
      const ol = document.createElement("ol");
      for (const s of liste) {
        const li = document.createElement("li");
        li.textContent = `${s.nom} - ${s.essais} essai(s)`;
        ol.appendChild(li);
      }
      bloc.appendChild(ol);
    }
    conteneur.appendChild(bloc);
  }
}

// =====================================================
//  Affichage
// =====================================================

function afficherEcran(nom) {
  for (const [cle, el] of Object.entries(ecrans)) el.hidden = (cle !== nom);
}

function creerPion(indexCouleur, element = "span") {
  const pion = document.createElement(element);
  pion.className = "pion";
  const c = COULEURS[indexCouleur];
  pion.style.background = c.hex;
  if (c.sombre) pion.classList.add("sombre");
  pion.textContent = indexCouleur + 1;
  pion.title = c.nom;
  return pion;
}

function afficherCode(conteneur, code) {
  conteneur.innerHTML = "";
  conteneur.classList.add("lecture");
  for (const c of code) conteneur.appendChild(creerPion(c));
}

function ajouterLigne(code, bien, mal) {
  const ligne = document.createElement("div");
  ligne.className = "ligne";

  const num = document.createElement("span");
  num.className = "num";
  num.textContent = etat.tentative;
  ligne.appendChild(num);

  const pions = document.createElement("div");
  pions.className = "pions";
  for (const c of code) pions.appendChild(creerPion(c));
  ligne.appendChild(pions);

  const indices = document.createElement("div");
  indices.className = "indices";
  indices.innerHTML =
    `<span class="badge bien" title="bien placés">${bien}</span>` +
    `<span class="badge mal" title="mal placés">${mal}</span>`;
  ligne.appendChild(indices);

  $("plateau").appendChild(ligne);
  ligne.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function majCompteur() {
  $("compteur").textContent = `Tentative ${etat.tentative + 1} sur ${etat.niveau.essais}`;
}

function afficherMessage(texte) {
  $("message").textContent = texte;
}

function majConsigne() {
  const { mode, phase, joueur1, joueur2, niveau } = etat;
  let texte = "";
  if (mode === "solo") {
    texte = `${joueur1}, trouve le code secret (${niveau.longueur} pions).`;
  } else if (mode === "deux") {
    texte = phase === "creation"
      ? `${joueur1}, crée le code secret. ${joueur2}, ne regarde pas !`
      : `${joueur2}, à toi de trouver le code de ${joueur1} !`;
  } else {
    texte = `Pense à un code de ${niveau.longueur} pions, sans me le dire. ` +
            `Je propose, tu me réponds avec les indices.`;
  }
  $("consigne").textContent = texte;
}

// ===== Zone de saisie (palette + emplacements) =====

function construirePalette() {
  const palette = $("palette");
  palette.innerHTML = "";
  for (let c = 0; c < etat.niveau.couleurs; c++) {
    const bouton = creerPion(c, "button");
    bouton.type = "button";
    bouton.setAttribute("aria-label", COULEURS[c].nom);
    bouton.addEventListener("click", () => poserPion(c));
    palette.appendChild(bouton);
  }
}

function dessinerEmplacements() {
  const slots = $("slots");
  slots.innerHTML = "";
  slots.classList.remove("lecture");
  etat.essai.forEach((c, i) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "slot";
    bouton.setAttribute("aria-label", `Emplacement ${i + 1}`);
    if (c !== null) {
      bouton.classList.add("plein");
      bouton.style.background = COULEURS[c].hex;
      if (COULEURS[c].sombre) bouton.classList.add("sombre");
      bouton.textContent = c + 1;
    }
    bouton.addEventListener("click", () => retirerPion(i));
    slots.appendChild(bouton);
  });
}

function viderSaisie() {
  etat.essai = Array(etat.niveau.longueur).fill(null);
  dessinerEmplacements();
}

function poserPion(c) {
  if (etat.phase !== "devine" && etat.phase !== "creation") return;
  const place = etat.essai.indexOf(null);
  if (place === -1) return;
  etat.essai[place] = c;
  afficherMessage("");
  dessinerEmplacements();
}

function retirerPion(i) {
  etat.essai[i] = null;
  dessinerEmplacements();
}

// =====================================================
//  Déroulement d'une partie
// =====================================================

function lancerPartie(mode) {
  etat.mode = mode;
  etat.niveau = NIVEAUX[document.querySelector('input[name="niveau"]:checked').value];
  etat.joueur1 = $("prenom1").value.trim() || "Joueur 1";
  etat.joueur2 = $("prenom2").value.trim() || "Joueur 2";
  etat.tentative = 0;
  etat.secret = [];

  $("plateau").innerHTML = "";
  $("fin").hidden = true;
  afficherMessage("");
  afficherEcran("jeu");

  if (mode === "ordi") {
    etat.phase = "ordi";
    $("zone-saisie").hidden = true;
    $("zone-retour").hidden = false;
    etat.possibles = toutesCombinaisons(etat.niveau.longueur, etat.niveau.couleurs);
    $("in-bien").max = etat.niveau.longueur;
    $("in-mal").max = etat.niveau.longueur;
    majConsigne();
    proposerOrdi();
    return;
  }

  $("zone-saisie").hidden = false;
  $("zone-retour").hidden = true;
  construirePalette();
  viderSaisie();

  if (mode === "solo") {
    etat.secret = codeAleatoire(etat.niveau.longueur, etat.niveau.couleurs);
    etat.phase = "devine";
    // Pour tester : décommente la ligne suivante (secret dans la console, F12)
    // console.log("Secret :", etat.secret.map(c => c + 1).join(""));
  } else {
    etat.phase = "creation";
  }
  majConsigne();
  majCompteur();
}

function terminer(texte, secretAAfficher) {
  etat.phase = "fini";
  $("zone-saisie").hidden = true;
  $("zone-retour").hidden = true;
  $("texte-fin").textContent = texte;
  const conteneur = $("secret-fin");
  conteneur.innerHTML = "";
  if (secretAAfficher) afficherCode(conteneur, secretAAfficher);
  $("fin").hidden = false;
  $("compteur").textContent = "Partie terminée";
  $("fin").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

// ===== Joueur qui devine (solo / 2 joueurs) =====

function valider() {
  if (etat.phase !== "devine" && etat.phase !== "creation") return;

  if (etat.essai.includes(null)) {
    afficherMessage(`Complète les ${etat.niveau.longueur} pions avant de valider.`);
    return;
  }
  afficherMessage("");
  const code = [...etat.essai];

  // Le joueur 1 fixe le code secret, puis on passe la main au joueur 2
  if (etat.phase === "creation") {
    etat.secret = code;
    etat.phase = "devine";
    viderSaisie();
    majConsigne();
    majCompteur();
    return;
  }

  const { bien, mal } = evaluer(etat.secret, code);
  etat.tentative++;
  ajouterLigne(code, bien, mal);
  viderSaisie();

  const devineur = etat.mode === "deux" ? etat.joueur2 : etat.joueur1;

  if (bien === etat.niveau.longueur) {
    enregistrerScore(etat.niveau.nom, devineur, etat.tentative);
    terminer(`Bravo ${devineur} ! Trouvé en ${etat.tentative} tentative(s) !`);
  } else if (etat.tentative >= etat.niveau.essais) {
    terminer("Perdu ! Le code secret était :", etat.secret);
  } else {
    majCompteur();
  }
}

// ===== L'ordinateur devine =====

function proposerOrdi() {
  const i = Math.floor(Math.random() * etat.possibles.length);
  etat.proposition = etat.possibles[i];
  afficherCode($("slots-ordi"), etat.proposition);
  $("in-bien").value = 0;
  $("in-mal").value = 0;
  majCompteur();
}

function envoyerIndices() {
  const bien = parseInt($("in-bien").value, 10);
  const mal = parseInt($("in-mal").value, 10);
  const L = etat.niveau.longueur;

  if (Number.isNaN(bien) || Number.isNaN(mal) || bien < 0 || mal < 0 || bien + mal > L) {
    afficherMessage(`Les indices doivent être positifs, et bien + mal ne peut pas dépasser ${L}.`);
    return;
  }
  afficherMessage("");

  etat.tentative++;
  ajouterLigne(etat.proposition, bien, mal);

  if (bien === L) {
    terminer(`J'ai trouvé ton code en ${etat.tentative} essai(s) !`);
    return;
  }

  // On garde seulement les combinaisons compatibles avec tes indices
  etat.possibles = etat.possibles.filter(p => {
    const r = evaluer(p, etat.proposition);
    return r.bien === bien && r.mal === mal;
  });

  if (etat.possibles.length === 0) {
    terminer("Aucune combinaison ne correspond à tes indices : tu t'es peut-être trompé quelque part.");
  } else if (etat.tentative >= etat.niveau.essais) {
    terminer(`Je n'ai pas trouvé en ${etat.niveau.essais} essais, bien joué !`);
  } else {
    proposerOrdi();
  }
}

// =====================================================
//  Événements
// =====================================================

document.querySelectorAll("[data-mode]").forEach(b =>
  b.addEventListener("click", () => lancerPartie(b.dataset.mode)));

$("btn-scores").addEventListener("click", () => { afficherScores(); afficherEcran("scores"); });
$("btn-retour-scores").addEventListener("click", () => afficherEcran("menu"));
$("btn-reset-scores").addEventListener("click", () => { ecrireScores({}); afficherScores(); });

$("btn-menu").addEventListener("click", () => afficherEcran("menu"));
$("btn-menu-fin").addEventListener("click", () => afficherEcran("menu"));
$("btn-rejouer").addEventListener("click", () => lancerPartie(etat.mode));

$("btn-valider").addEventListener("click", valider);
$("btn-effacer").addEventListener("click", viderSaisie);
$("btn-envoyer").addEventListener("click", envoyerIndices);

// Clavier : 1-8 pose un pion, Retour arrière retire, Entrée valide
document.addEventListener("keydown", e => {
  if (ecrans.jeu.hidden) return;
  if (etat.phase !== "devine" && etat.phase !== "creation") return;
  if (e.key >= "1" && e.key <= String(etat.niveau.couleurs)) {
    poserPion(Number(e.key) - 1);
  } else if (e.key === "Backspace") {
    for (let i = etat.essai.length - 1; i >= 0; i--) {
      if (etat.essai[i] !== null) { retirerPion(i); break; }
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    valider();
  }
});