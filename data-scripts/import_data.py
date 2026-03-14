import requests

# --- CONFIGURATION ---
SOURCE_API = "https://dummyjson.com/products?limit=50"
API_URL = "http://localhost:3000/marketplace"

# ID utilisateur créé en base
USER_ID = "c9b26fca-356f-4601-89b5-3ba8e1cdafc9"

def run_script():
    print("Recuperation de 50 produits depuis DummyJSON...")

    response = requests.get(SOURCE_API)
    if response.status_code != 200:
        print(f"Erreur DummyJSON : {response.status_code}")
        return

    produits = response.json()["products"]
    print(f"{len(produits)} produits recuperes\n")

    compteur = 0
    for produit in produits:
        payload = {
            "title": produit["title"],
            "description": produit["description"],
            "price": produit["price"],
            "category": produit["category"],
            "imageUrl": produit["thumbnail"],
            "user": {"id": USER_ID}
        }

        res = requests.post(API_URL, json=payload)

        if res.status_code == 201:
            print(f"[{compteur+1}] Ajoute : {produit['title'][:45]}...")
            compteur += 1
        else:
            print(f"Erreur API ({res.status_code}) : {res.text}")

    print(f"\nTermine ! {compteur}/{len(produits)} produits ajoutes.")

if __name__ == "__main__":
    run_script()
