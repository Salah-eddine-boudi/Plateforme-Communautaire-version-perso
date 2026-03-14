import requests
import time

# --- CONFIGURATION ---
API_URL = "http://localhost:3000/marketplace"

# ⚠️ LE MÊME ID QUE CELUI UTILISÉ POUR L'IMPORT (C'est lui qu'on va nettoyer)
USER_ID = "c9b26fca-356f-4601-89b5-3ba8e1cdafc9"

def cleanup_script():
    print("🧹 Démarrage du nettoyage...")

    # 1. On récupère TOUTES les annonces actuelles
    try:
        response = requests.get(API_URL)
        if response.status_code != 200:
            print("❌ Erreur : Impossible de lire la Marketplace")
            return
        
        annonces = response.json()
    except Exception as e:
        print(f"❌ Erreur réseau : {e}")
        return

    print(f"📦 Il y a actuellement {len(annonces)} annonces dans la base.")
    
    compteur_suppression = 0

    # 2. On parcourt la liste et on supprime celles qui appartiennent à notre USER_ID
    for annonce in annonces:
        # On vérifie si l'annonce a un propriétaire et si c'est le nôtre
        if annonce.get('user') and annonce['user'].get('id') == USER_ID:
            
            titre = annonce.get('title', 'Sans titre')
            id_annonce = annonce.get('id')

            print(f"🗑️ Suppression de : {titre[:30]}...")

            # --- L'APPEL DELETE ---
            # C'est ici qu'on détruit l'annonce
            del_response = requests.delete(f"{API_URL}/{id_annonce}")

            if del_response.status_code == 200:
                compteur_suppression += 1
            else:
                print(f"⚠️ Échec suppression : {del_response.text}")
            
            # Petite pause pour ne pas surcharger le serveur
            time.sleep(0.1)

    print(f"\n✨ Terminé ! {compteur_suppression} annonces ont été supprimées.")
    print("Votre base est propre.")

if __name__ == "__main__":
    if "REMPLACER" in USER_ID:
        print("⛔ STOP ! Mettez l'ID de l'utilisateur à nettoyer ligne 8.")
    else:
        cleanup_script()