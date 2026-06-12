# Self-Healing Test Automation — PFE

Suite de tests Playwright avec auto-reparation par IA + dashboard de monitoring.

## Structure

| Dossier | Contenu |
|---|---|
| `shop/` | Application e-commerce testee (vanilla JS) |
| `test-runner/` | Tests Playwright + helpers de healing |
| `dashboard/` | Monitoring Angular |
| `config/` | URLs dynamiques des tunnels |
| `docs/` | Documentation et rapport |

## URLs dynamiques

Les tunnels changent regulierement. Pour mettre a jour :

```powershell
.\config\update-urls.ps1
```

Le script detecte automatiquement l'URL ngrok (si leserveur local tourne) et te demande l'URL localhost.run.

Les URL sont stockees dans `config/current-urls.json`, lisible par tous les modules.

## Lancer le projet

```powershell
# 1. Demarrer les tunnels
ssh -R 80:localhost:8085 localhost.run   # shop
ngrok http 5000                           # backend Colab

# 2. Mettre a jour les URLs
.\config\update-urls.ps1

# 3. Lancer les tests
cd test-runner
npx playwright test

# 4. Lancer le dashboard
cd dashboard
ng serve --port 4200
```
