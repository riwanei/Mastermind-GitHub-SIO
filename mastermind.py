import random
from turtle import position

def est_proposition_valide(proposition):
    if len(proposition) != 4:
        return False

    for caractere in proposition:
        if caractere not in "123456":
            return False

    return True

def compter_bien_places(secret, proposition):
    compteur = 0

    for position in range(4):
        if secret[position] == proposition[position]:
            compteur = compteur + 1

    return compteur

def compter_mal_places(secret, proposition):

    total_chiffres_communs = 0

    for chiffre in "123456":
        total_chiffres_communs += min(
            secret.count(chiffre),
            proposition.count(chiffre)
        )

    bien_places = compter_bien_places(secret, proposition)
    return total_chiffres_communs - bien_places
   
def generer_secret():
    secret = ""

    for _ in range(4):
        secret = secret + random.choice("123456")

    return secret

titre = "MASTERMIND - LE DEFI !."
print(titre)

print("Bonjour")
print("Bienvenue dans Mastermind !")
prenom = input("Quel est votre prénom ? ")
print(f"Bonjour {prenom}, vous allez jouer à Mastermind !")

print()
print("Voici les règles")
print("_ Tu dois trouver une combinaison secrète de 4 chiffres.")
print("_ Chaque chiffre est compris entre 1 et 6.")
print("_ Un même chiffre peut apparaître plusieurs fois.")
print("_ Tu disposes de 10 tentatives valides.")
print("_ Après chaque essai, tu connaîtras le nombre de chiffres")
print("  bien placés et le nombre de chiffres mal placés")
print("  Bonne chance ;) ")

 
for tentative in range(1, 11):
    print(f"\nTentative {tentative} sur 10")
    proposition = input("Entre une combinaison de 4 chiffres entre 1 et 6 : ")

    while not est_proposition_valide(proposition):
        print("Erreur : entre 4 chiffres compris entre 1 et 6.")
        proposition = input("Réessaie : ")


print("Bien placés :", compter_bien_places(secret, proposition))

print("Mal placés :", compter_mal_places(secret, proposition))


secret = generer_secret()
print("Secret de test :", secret)  # À supprimer quand tu as terminé les tests

gagne = False
secret = generer_secret()

for tentative in range(1, 11):
    print(f"\nTentative {tentative} sur 10")
    proposition = input("Entre une combinaison de 4 chiffres entre 1 et 6 : ")

    while not est_proposition_valide(proposition):
        print("Erreur : entre 4 chiffres compris entre 1 et 6.")
        proposition = input("Réessaie : ")

    bien_places = compter_bien_places(secret, proposition)
    mal_places = compter_mal_places(secret, proposition)

    print("Bien placés :", bien_places)
    print("Mal placés :", mal_places)

    if bien_places == 4:
        print("Bravo, tu as trouvé la combinaison !")
        gagne = True
        break

if not gagne:
    print("Perdu ! La combinaison était :", secret)


