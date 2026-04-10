# Démo offline (clé USB / autre PC)

Dernière mise à jour : 2026-03-26

## Objectif
Permettre une démonstration sans backend ni base de données, utilisable hors‑ligne depuis une clé USB.

## Préparation (sur la machine de dev)
1. Construire le frontend en mode démo :
   ```powershell
   cd M:\dev\comply\frontend
   npm install
   npm run build:demo
   ```
2. Préparer un dossier “pack démo” (exemple) :
   ```powershell
   mkdir M:\dev\comply\demo-offline
   Copy-Item -Recurse M:\dev\comply\frontend\dist M:\dev\comply\demo-offline\dist
   Copy-Item M:\dev\comply\scripts\demo\start-offline-demo.ps1 M:\dev\comply\demo-offline\
   ```
3. Copier le dossier `demo-offline` sur la clé USB.

## Lancer la démo (sur l’autre PC)
### Méthode simple (non‑techies)
1. Copier le dossier `demo-offline` de la clé vers le disque local.
2. Double‑cliquer sur `start-offline-demo.bat`.
3. Le navigateur s’ouvre automatiquement sur `http://localhost:4173/`.
4. Connexion : n’importe quel email + mot de passe.

### Méthode PowerShell (technique)
1. Ouvrir PowerShell dans le dossier `demo-offline`.
2. Lancer :
   ```powershell
   .\start-offline-demo.ps1
   ```
   Si l’exécution est bloquée :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\start-offline-demo.ps1
   ```
3. Ouvrir dans le navigateur :
   `http://localhost:4173/`

## Notes
- Mode démo offline : les identifiants de connexion peuvent être quelconques.
- Les données sont simulées en local (aucun appel réseau externe).
- Pour arrêter la démo : fermer la fenêtre “TuniCompliance Demo Server”.
