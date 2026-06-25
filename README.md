# Self-Healing Test Automation — PFE

Suite de tests Playwright avec auto-reparation par IA + dashboard de monitoring.

## Structure

| Dossier | Contenu |
|---|---|
| `shop/` | Application e-commerce testee (vanilla JS) |
| `test-runner/` | Tests Playwright + pipeline ML de self-healing |
| `dashboard/` | Monitoring Angular |
| `config/` | Scripts d'infrastructure (start/stop tunnels) |
| `pipeline/` | Notebook Colab du pipeline ML (`self_healing_db.ipynb`) |
| `docs/` | Rapports PDF |
| `playwright-agents-demo/` | *(reference)* Tests avec GitHub Copilot agents |
| `playwright-applitools/` | *(reference)* Tests avec Applitools Eyes (visuel) |
| `playwright-native-healing/` | *(reference)* Tests avec selecteurs natifs Playwright |

## Infrastructure

```powershell
# Demarrer les tunnels shop + API + sauvegarder les URLs
.\start.ps1

# Arreter l'infrastructure
.\stop.ps1
```

Les URLs sont stockees dans `C:\ProgramData\.pfe-urls.json` (utilise par Jenkins).

## Lancer les tests (Pipeline ML)

```powershell
cd test-runner
npx playwright test
```

## Dashboard

```powershell
cd dashboard
npm install
npx ng serve --port 4200
```

## Pipeline CI/CD (Jenkins)

Le `Jenkinsfile` a la racine automatise :
1. Installation des dependances (`npm ci`)
2. Build du dashboard Angular
3. Installation de Playwright + browsers
4. Execution des tests avec auto-healing
5. Evaluation ML (`node scripts/run-eval.js`)
6. Publication des rapports HTML + artefacts

## Rapports

- `docs/rapport-comparatif.pdf` — Comparatif des 4 approches de self-healing
- `docs/rapport.pdf` — Rapport de PFE
