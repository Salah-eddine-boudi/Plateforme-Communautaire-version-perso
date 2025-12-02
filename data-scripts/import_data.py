import requests
from bs4 import BeautifulSoup
import time
import random

# --- CONFIGURATION ---
# URL de base (On va ajouter "page-X.html" à la fin)
BASE_URL = "http://books.toscrape.com/catalogue/category/books_1/page-{}.html"
API_URL = "http://localhost:3000/marketplace"

# ⚠️ REMETTEZ VOTRE ID UTILISATEUR ICI
USER_ID = "a7fc9702-9b01-4961-a3e3-f516dd0ab0ca" 

# Combien de pages voulez-vous scanner ? (Il y a 50 pages au total sur ce site)
NB_PAGES_A_SCANNER = 5

def nettoyer_prix(texte_prix):
    """Nettoie le prix pour ne garder que les chiffres"""
    chiffres_propres = "".join([c for c in texte_prix if c.isdigit() or c == '.'])
    return float(chiffres_propres) if chiffres_propres else 0.0

def run_script():
    print(f"🚀 Démarrage du Super Scraper sur {NB_PAGES_A_SCANNER} pages...")
    
    compteur_total = 0

    # --- BOUCLE SUR LES PAGES (1, 2, 3...) ---
    for numero_page in range(1, NB_PAGES_A_SCANNER + 1):
        
        url_actuelle = BASE_URL.format(numero_page)
        print(f"\n📄 Analyse de la page {numero_page}...")

        try:
            response = requests.get(url_actuelle)
            response.encoding = 'utf-8'
            
            if response.status_code != 200:
                print(f"❌ Fin des pages ou erreur (Code {response.status_code})")
                break # On arrête si la page n'existe pas

            soup = BeautifulSoup(response.text, 'html.parser')
            articles = soup.find_all('article', class_='product_pod')

            # --- BOUCLE SUR LES LIVRES DE LA PAGE ---
            for article in articles:
                try:
                    titre = article.find('h3').find('a')['title']
                    prix_brut = article.find('p', class_='price_color').text
                    prix_final = nettoyer_prix(prix_brut)
                    
                    # Image
                    img_rel = article.find('img')['src']
                    img_url = "http://books.toscrape.com/" + img_rel.replace("../../../../", "")

                    # On varie un peu les catégories pour faire joli
                    categories = ["Santé", "Bien-être", "Développement Perso", "Lecture"]
                    categorie_aleatoire = random.choice(categories)

                    payload = {
                        "title": titre,
                        "description": "Livre disponible dans la bibliothèque communautaire.",
                        "price": prix_final,
                        "category": categorie_aleatoire,
                        "imageUrl": img_url,
                        "user": { "id": USER_ID }
                    }

                    # Envoi API
                    res = requests.post(API_URL, json=payload)
                    
                    if res.status_code == 201:
                        print(f"✅ [{compteur_total+1}] Ajouté : {titre[:20]}...")
                        compteur_total += 1
                    else:
                        print(f"⚠️ Erreur API")

                except Exception as e:
                    print(f"Erreur livre : {e}")
        
        except Exception as e:
            print(f"Erreur Page : {e}")

    print(f"\n🏁 Terminé ! {compteur_total} livres ajoutés au total.")

if __name__ == "__main__":
    if "UUID" in USER_ID or "REMPLACER" in USER_ID:
        print("⛔ STOP ! Remettez votre vrai USER_ID ligne 12.")
    else:
        run_script()