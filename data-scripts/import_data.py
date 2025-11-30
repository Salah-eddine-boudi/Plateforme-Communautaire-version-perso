import requests
from bs4 import BeautifulSoup
import time
import random

# --- CONFIGURATION ---
URL_SOURCE = "http://books.toscrape.com/catalogue/category/books/spirituality_39/index.html"
API_URL = "http://localhost:3000/marketplace"

# ⚠️ REMETTEZ VOTRE ID UTILISATEUR ICI !
USER_ID = "a7fc9702-9b01-4961-a3e3-f516dd0ab0ca" 

# --- FONCTION MAGIQUE DE NETTOYAGE ---
def nettoyer_prix(texte_prix):
    """
    Cette fonction prend un texte sale (ex: 'Â£17.66') 
    et renvoie un nombre propre (17.66).
    Elle jette tout ce qui n'est pas un chiffre ou un point.
    """
    # On garde seulement les caractères qui sont des chiffres ou un point
    chiffres_propres = "".join([c for c in texte_prix if c.isdigit() or c == '.'])
    
    # Si c'est vide, on renvoie 0, sinon on convertit en nombre
    return float(chiffres_propres) if chiffres_propres else 0.0


def run_script():
    print("🚀 Démarrage du script Python...")
    
    try:
        response = requests.get(URL_SOURCE)
        # FORCE L'ENCODAGE EN UTF-8 POUR ÉVITER LES CARACTÈRES BIZARRES
        response.encoding = 'utf-8' 
        
        if response.status_code != 200:
            print(f"❌ Erreur de connexion : Code {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erreur réseau : {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    articles = soup.find_all('article', class_='product_pod')
    print(f"📦 {len(articles)} livres trouvés à importer.")

    for article in articles:
        try:
            # Extraction Titre
            titre = article.find('h3').find('a')['title']
            
            # Extraction Prix (Version SALE)
            prix_brut = article.find('p', class_='price_color').text
            
            # Extraction Prix (Version PROPRE via notre fonction)
            prix_final = nettoyer_prix(prix_brut)
            
            # Extraction Image
            img_rel = article.find('img')['src']
            img_url = "http://books.toscrape.com/" + img_rel.replace("../../../../", "")

            # Préparation donnée
            payload = {
                "title": titre,
                "description": "Livre recommandé pour le développement personnel et la spiritualité.",
                "price": prix_final, # On utilise le prix nettoyé
                "category": "Lecture & Bien-être",
                "imageUrl": img_url,
                "user": { "id": USER_ID }
            }

            # Envoi
            post_response = requests.post(API_URL, json=payload)
            
            if post_response.status_code == 201:
                print(f"✅ Ajouté ({prix_final}€) : {titre[:30]}...")
            else:
                print(f"⚠️ Erreur API : {post_response.text}")

            time.sleep(0.5)

        except Exception as e:
            print(f"⚠️ Erreur de traitement sur un livre : {e}")
            
    print("🏁 Importation terminée !")

if __name__ == "__main__":
    if "UUID" in USER_ID or "REMPLACER" in USER_ID:
        print("⛔ STOP ! Remettez votre vrai USER_ID ligne 11.")
    else:
        run_script()