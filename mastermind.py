"""Mastermind en console - Python 3.8+
Modes : solo (tu devines), 2 joueurs, ordinateur devine ton code.
Niveaux de difficulté + meilleurs scores sauvegardés dans scores.json.
"""
import json
import random
from itertools import product
from pathlib import Path

COULEURS = ["R", "V", "B", "J", "O", "N", "M", "G"]
NOMS = {"R": "Rouge", "V": "Vert", "B": "Bleu", "J": "Jaune",
        "O": "Orange", "N": "Noir", "M": "Marron", "G": "Gris"}
# niveau : (nb couleurs, longueur du code, nb essais)
NIVEAUX = {"1": ("Facile", 6, 4, 12),
           "2": ("Normal", 6, 4, 10),
           "3": ("Difficile", 8, 5, 10)}
FICHIER_SCORES = Path(__file__).with_name("scores.json")


# ---------- Logique ----------
def evaluer(secret, essai):
    """Renvoie (bien_places, mal_places)."""
    bien = sum(s == e for s, e in zip(secret, essai))
    communs = sum(min(secret.count(c), essai.count(c)) for c in set(secret))
    return bien, communs - bien


def code_aleatoire(couleurs, longueur):
    return [random.choice(couleurs) for _ in range(longueur)]


def saisir_code(couleurs, longueur, invite):
    """Demande un code valide, ex: RVBJ."""
    while True:
        texte = input(invite).strip().upper().replace(" ", "")
        if len(texte) == longueur and all(c in couleurs for c in texte):
            return list(texte)
        print(f"  ! Entre {longueur} lettres parmi : {' '.join(couleurs)}")


# ---------- Scores ----------
def charger_scores():
    try:
        return json.loads(FICHIER_SCORES.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def enregistrer_score(niveau, nom, essais):
    scores = charger_scores()
    liste = scores.setdefault(niveau, [])
    liste.append({"nom": nom, "essais": essais})
    scores[niveau] = sorted(liste, key=lambda s: s["essais"])[:5]
    FICHIER_SCORES.write_text(json.dumps(scores, indent=2, ensure_ascii=False),
                              encoding="utf-8")


def afficher_scores():
    scores = charger_scores()
    if not scores:
        print("\nAucun score pour l'instant.")
        return
    for cle, (nom_niv, *_rest) in NIVEAUX.items():
        if nom_niv in scores:
            print(f"\n--- Meilleurs scores ({nom_niv}) ---")
            for i, s in enumerate(scores[nom_niv], 1):
                print(f"  {i}. {s['nom']} - {s['essais']} essais")


# ---------- Modes de jeu ----------
def choisir_niveau():
    print("\nNiveaux :")
    for k, (nom, nb_c, lg, ess) in NIVEAUX.items():
        print(f"  {k}. {nom} ({nb_c} couleurs, code de {lg}, {ess} essais)")
    while True:
        c = input("Ton choix : ").strip()
        if c in NIVEAUX:
            nom, nb_c, lg, ess = NIVEAUX[c]
            return nom, COULEURS[:nb_c], lg, ess


def afficher_couleurs(couleurs):
    print("Couleurs : " + ", ".join(f"{c}={NOMS[c]}" for c in couleurs))


def jouer_humain(secret, couleurs, longueur, max_essais):
    """Un humain devine. Renvoie le nb d'essais si gagné, sinon None."""
    afficher_couleurs(couleurs)
    for n in range(1, max_essais + 1):
        essai = saisir_code(couleurs, longueur, f"Essai {n}/{max_essais} : ")
        bien, mal = evaluer(secret, essai)
        print(f"   -> {bien} bien placé(s), {mal} mal placé(s)")
        if bien == longueur:
            print(f"Bravo ! Trouvé en {n} essai(s).")
            return n
    print("Perdu ! Le code était : " + "".join(secret))
    return None


def mode_solo():
    niveau, couleurs, longueur, max_essais = choisir_niveau()
    nom = input("Ton nom : ").strip() or "Joueur"
    secret = code_aleatoire(couleurs, longueur)
    n = jouer_humain(secret, couleurs, longueur, max_essais)
    if n:
        enregistrer_score(niveau, nom, n)


def mode_deux_joueurs():
    niveau, couleurs, longueur, max_essais = choisir_niveau()
    j1 = input("Nom du joueur qui crée le code : ").strip() or "Joueur 1"
    j2 = input("Nom du joueur qui devine : ").strip() or "Joueur 2"
    afficher_couleurs(couleurs)
    secret = saisir_code(couleurs, longueur, f"{j1}, entre le code secret : ")
    print("\n" * 40 + f"{j2}, c'est à toi !")  # cache le code
    n = jouer_humain(secret, couleurs, longueur, max_essais)
    if n:
        enregistrer_score(niveau, j2, n)


def mode_ordi_devine():
    """L'ordinateur devine ton code en éliminant les combinaisons impossibles."""
    niveau, couleurs, longueur, max_essais = choisir_niveau()
    afficher_couleurs(couleurs)
    print(f"Pense à un code de {longueur} lettres (ne me le dis pas !).")
    input("Appuie sur Entrée quand tu es prêt...")
    possibles = [list(p) for p in product(couleurs, repeat=longueur)]
    for n in range(1, max_essais + 1):
        if not possibles:
            print("Incohérence dans tes réponses, je n'ai plus de solution !")
            return
        essai = random.choice(possibles)
        print(f"\nEssai {n} : {''.join(essai)}")
        bien = int(input("  Bien placés ? "))
        if bien == longueur:
            print(f"J'ai trouvé en {n} essai(s) !")
            return
        mal = int(input("  Mal placés ? "))
        possibles = [p for p in possibles if evaluer(p, essai) == (bien, mal)]
    print("Je n'ai pas trouvé, bien joué !")


# ---------- Menu ----------
def main():
    while True:
        print("\n===== MASTERMIND =====")
        print("1. Jouer seul (code aléatoire)")
        print("2. Mode 2 joueurs")
        print("3. L'ordinateur devine mon code")
        print("4. Meilleurs scores")
        print("5. Quitter")
        choix = input("Ton choix : ").strip()
        if choix == "1":
            mode_solo()
        elif choix == "2":
            mode_deux_joueurs()
        elif choix == "3":
            try:
                mode_ordi_devine()
            except ValueError:
                print("Entre un nombre entier, partie annulée.")
        elif choix == "4":
            afficher_scores()
        elif choix == "5":
            print("À bientôt !")
            break


if __name__ == "__main__":
    main()
    


