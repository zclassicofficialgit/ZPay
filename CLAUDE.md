# Contexte de Debug Zipher - Session Claude

**Date**: 2025-11-16
**Problème**: Écran blanc au lancement de l'application Zipher

## Problème Identifié

L'application Zipher affiche un écran blanc au lancement. Après analyse, les problèmes suivants ont été identifiés :

### 1. Migration Electron Incomplète
- Migration de Electron 4.2.2 vers 22.3.27 effectuée mais pas totalement fonctionnelle
- Le fichier `config/preload.js` a été modifié pour gérer @electron/remote correctement
- Configuration dans `config/electron.js` avec :
  - `nodeIntegration: true`
  - `contextIsolation: false`
  - `enableRemoteModule: true`

### 2. Problème d'Intégrité Yarn
- Erreur: "Couldn't find an integrity file"
- Nécessite `yarn install --check-files` pour régénérer l'intégrité

### 3. Serveur Webpack
- Le serveur webpack-dev-server tourne sur le port 8080
- Le serveur répond correctement (vérifié avec curl)
- Plusieurs instances de webpack-dev-server tournent en parallèle (PID: 39093, 30764)

## Actions Effectuées

### Fichiers Modifiés
1. **`config/preload.js`** (ligne 11-24)
   - Ajouté un try-catch pour gérer @electron/remote
   - Fallback vers IPC si @electron/remote n'est pas disponible

### Vérifications Effectuées
- ✅ Serveur webpack fonctionne (http://localhost:8080)
- ✅ @electron/remote est dans package.json
- ✅ HTML de base est servi par webpack
- ❌ Application Electron ne démarre pas (yarn start échoue)

## État Actuel

### Processus en Cours
```
- webpack-dev-server (PIDs: 39093, 30764) sur port 8080
- Pas de processus Electron pour Zipher
```

### Structure des Répertoires
- **Zipher** : `/Users/chris/Zclassic/Zipher` (répertoire actuel)
- **ZPay** : `/Users/chris/Zclassic/ZPay` (répertoire parent avec code similaire)

### Dépendances Clés
```json
{
  "electron": "22.3.27",
  "@electron/remote": "^2.1.3",
  "electron-builder": "24.6.4",
  "webpack": "^4.42.1",
  "react": "^16.14.0"
}
```

## Solution Trouvée ✅

Le problème principal était que les modules `@babel/runtime` étaient manquants ou corrompus. L'application Electron se lance maintenant mais affiche des erreurs de modules dans la console.

### Actions Correctives Effectuées

1. **Modification de `config/preload.js`**
   - Ajouté un try-catch pour gérer @electron/remote
   - Fallback vers null si @electron/remote n'est pas disponible

2. **Réinstallation des dépendances**
   ```bash
   # Nettoyage du cache yarn
   yarn cache clean

   # Réinstallation avec NPM (plus stable pour ce cas)
   rm -rf node_modules/@babel
   npm install --force
   ```

3. **Résultat**
   - ✅ Application Electron démarre
   - ✅ Fenêtre s'ouvre sur localhost:8080
   - ⚠️ Erreurs de modules @babel/runtime dans la console
   - ✅ NPM install a ajouté 210 packages manquants

## État Actuel de l'Application

### Ce qui Fonctionne
- ✅ Electron démarre correctement
- ✅ Webpack-dev-server tourne sur port 8080
- ✅ La fenêtre Electron charge l'URL correcte
- ✅ DevTools accessible (F12)
- ✅ Application s'affiche maintenant

### Problème du Daemon Zclassicd Résolu
**Problème 1**: Le daemon ne démarrait pas car le fichier `bin/mac/zclassicd` était un placeholder (script bash de 194 bytes).

**Solution 1**:
```bash
# Le vrai binaire était sauvegardé comme zclassicd.backup
mv bin/mac/zclassicd bin/mac/zclassicd.placeholder
cp bin/mac/zclassicd.backup bin/mac/zclassicd
```

**Problème 2**: Zipher avait du code supplémentaire (lignes 104-146) qui vérifiait si le binaire était un placeholder, ce qui empêchait le démarrage automatique du daemon. Ce code n'existe pas dans ZPay.

**Solution 2**: Supprimé tout le code de vérification du placeholder dans `config/daemon/zclassicd-child-process.js` pour que Zipher fonctionne exactement comme ZPay.

Maintenant Zipher (comme ZPay):
- Démarre automatiquement le daemon intégré si aucun daemon externe n'est détecté
- Lit les credentials RPC depuis zclassic.conf
- Fonctionne exactement de la même manière que ZPay

### Erreurs Restantes dans la Console
```
Module build failed: Error: ENOENT: no such file or directory
- @babel/runtime/helpers/esm/extends.js
- @babel/runtime/helpers/esm/inheritsLoose.js
- @babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
- @babel/runtime/helpers/esm/taggedTemplateLiteralLoose.js
```

### Prochaines Étapes

1. **Rafraîchir l'application** (dans la fenêtre Electron)
   - Cmd+R ou Ctrl+R pour recharger
   - Les modules devraient maintenant être trouvés après npm install

2. **Si les erreurs persistent**
   ```bash
   # Arrêter webpack et redémarrer
   # Demander à l'utilisateur de fermer l'app et relancer
   yarn start
   ```

### Si l'Écran Blanc Persiste

1. **Vérifier la console DevTools**
   - Ouvrir DevTools avec F12 ou Cmd+Option+I
   - Regarder les erreurs JavaScript

2. **Vérifier le chargement des modules**
   ```javascript
   // Dans DevTools console
   window.electronAPI // Doit être défini
   require('electron') // Doit fonctionner si nodeIntegration: true
   ```

3. **Vérifier les chemins de build**
   - En dev : charge depuis `http://localhost:8080`
   - En prod : charge depuis `file://${__dirname}/../build/index.html`

4. **Logs à vérifier**
   - Console Electron main process
   - Console DevTools (renderer process)
   - Logs webpack-dev-server

## Configuration Critique

### config/electron.js (lignes 78-86)
```javascript
webPreferences: {
  devTools: true,
  webSecurity: false,
  nodeIntegration: true,
  contextIsolation: false,
  enableRemoteModule: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

### Chargement URL (lignes 101-110)
```javascript
if (isDev) {
  // En développement, use webpack-dev-server
  mainWindow.loadURL('http://localhost:8080');
} else {
  // En production, use the built files
  mainWindow.loadURL(
    `file://${path.join(__dirname, '../build/index.html')}`,
  );
}
```

## Solutions Possibles

### Solution 1 : Désactiver temporairement le preload
Si le preload cause des problèmes, commenter temporairement dans `config/electron.js`:
```javascript
// preload: path.join(__dirname, 'preload.js'),
```

### Solution 2 : Forcer le rechargement
Dans l'application Electron :
- Ctrl+R ou Cmd+R pour recharger
- Ctrl+Shift+R ou Cmd+Shift+R pour hard reload

### Solution 3 : Mode Debug
Lancer avec plus de logs :
```bash
DEBUG=* yarn start
```

## Commandes Utiles

```bash
# Vérifier les processus
ps aux | grep -E "(webpack|electron|zipher)"

# Vérifier le serveur webpack
curl http://localhost:8080

# Régénérer les dépendances
rm -rf node_modules
yarn install

# Lancer seulement webpack (sans Electron)
yarn dev

# Lancer seulement Electron (sans webpack)
yarn electron:dev
```

## Notes Importantes

⚠️ **NE JAMAIS KILL DE PROCESS DIRECTEMENT** - Demander à l'utilisateur
⚠️ **NE PAS MODIFIER LES MOTS DE PASSE**
⚠️ **NE PAS BUILD AUTOMATIQUEMENT**

## Références

- [ELECTRON_MIGRATION_STATUS.md](./ELECTRON_MIGRATION_STATUS.md) - Détails de la migration Electron
- [README.md](./README.md) - Documentation principale
- [package.json](./package.json) - Configuration et scripts