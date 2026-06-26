# Self-Healing Test Automation — PFE

Pipeline ML de self-healing avec evaluation de métriques + dashboard de monitoring.

## Structure

| Dossier | Contenu |
|---|---|
| `shop/` | Application e-commerce testee (vanilla JS) |
| `test-runner/` | Pipeline ML de self-healing + evaluation de métriques |
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

## Lancer l'evaluation des métriques

```powershell
cd test-runner
node scripts/run-metrics.js
```

Lit les scenarios dans `eval/scenarios/`, interroge l'API Colab, et produit un rapport dans `eval/reports/` avec :
- Accuracy, Precision, Recall, F1
- Taux de faux positifs / faux négatifs
- Distribution des temps de guérison
- Tableau de comparaison (via `--compare`)

Arguments optionnels :
| Flag | Description |
|---|---|
| `--report <chemin>` | Dossier de sortie du rapport (defaut: `eval/reports`) |
| `--from <fichier>` | Re-analyser un rapport existant sans relancer l'API |
| `--compare "nom:acc=0.90,fpr=0.05"` | Comparer avec d'autres approches |

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
3. Evaluation des métriques ML (`node scripts/run-metrics.js`)
4. Archivage des rapports JSON + build du dashboard

## Rapports

- `test-runner/eval/reports/metrics-*.json` — Rapports de métriques generés par `run-metrics.js`
- `docs/rapport-comparatif.pdf` — Comparatif des 4 approches de self-healing
- `docs/rapport.pdf` — Rapport de PFE
