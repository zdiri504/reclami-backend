# 🔧 Guide de Dépannage - Système de Suivi

## Problème : Timeline de statut ne s'affiche pas

### Symptômes
- La page de suivi se charge normalement
- Le formulaire de recherche fonctionne
- Aucune erreur visible
- La timeline des étapes (Nouveau → En cours → Résolu → Fermé) n'apparaît pas

### Causes Possibles

#### 1. **Problème de Backend Laravel**
- Le serveur Laravel n'est pas démarré
- L'endpoint `/api/complaints/track/{reference}` n'est pas accessible
- Erreur dans le contrôleur `ComplaintController`

#### 2. **Problème de Données**
- La réclamation n'a pas de statut défini
- Les données de l'historique sont manquantes
- Format des données incorrect

#### 3. **Problème Frontend**
- Erreur JavaScript dans la console
- Éléments DOM manquants
- Problème de CSS

### Solutions

#### Étape 1 : Vérifier la Console du Navigateur
1. Ouvrez la page de suivi
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Recherchez les erreurs en rouge

#### Étape 2 : Tester l'API Backend
1. Ouvrez la page `test-tracking.html`
2. Cliquez sur **"Tester l'API Réelle"**
3. Vérifiez les messages dans la section de débogage
4. Regardez la console pour les détails

#### Étape 3 : Vérifier le Serveur Laravel
1. Assurez-vous que le serveur Laravel est démarré :
   ```bash
   php artisan serve
   ```
2. Testez l'endpoint directement :
   ```
   http://127.0.0.1:8000/api/complaints/track/TT-1001
   ```

#### Étape 4 : Vérifier les Routes
1. Vérifiez que la route est bien définie dans `routes/api.php` :
   ```php
   Route::get('/complaints/track/{reference}', [ComplaintController::class, 'track']);
   ```

#### Étape 5 : Vérifier le Contrôleur
1. Ouvrez `app/Http/Controllers/ComplaintController.php`
2. Vérifiez que la méthode `track()` existe et fonctionne
3. Assurez-vous que les relations sont bien définies

### Test avec Données Simulées

Si l'API backend ne fonctionne pas, vous pouvez tester le frontend avec des données simulées :

1. Allez sur `test-tracking.html`
2. Cliquez sur **"Tester avec Données Simulées"**
3. Vérifiez que la timeline s'affiche correctement

### Messages d'Erreur Courants

#### "Réclamation non trouvée"
- Vérifiez que la référence existe dans la base de données
- Vérifiez que l'endpoint de suivi est accessible

#### "Erreur de connexion au serveur"
- Vérifiez que le serveur Laravel est démarré
- Vérifiez l'URL de l'API dans `js/app.js`
- Vérifiez que le port 8000 est accessible

#### "Élément timeline non trouvé"
- Vérifiez que tous les éléments HTML sont présents
- Vérifiez que le CSS est bien chargé

### Vérification des Données

#### Structure Attendue
```json
{
  "success": true,
  "complaint": {
    "reference_id": "TT-1001",
    "status": "En cours",
    "priority": "Haute",
    "status_histories": [
      {
        "old_status": "Nouveau",
        "new_status": "En cours",
        "created_at": "2025-01-16T14:15:00.000000Z"
      }
    ]
  }
}
```

#### Champs Requis
- `reference_id` : Numéro de référence unique
- `status` : Statut actuel (Nouveau, En cours, Résolu, Fermé)
- `created_at` : Date de création
- `status_histories` : Historique des changements de statut

### Débogage Avancé

#### 1. Ajouter des Logs
Dans `js/app.js`, ajoutez des `console.log()` pour tracer l'exécution :

```javascript
function trackComplaint(referenceNumber) {
  console.log('🔍 Recherche de:', referenceNumber);
  // ... reste du code
}
```

#### 2. Vérifier les Éléments DOM
```javascript
console.log('Timeline element:', document.getElementById('status-timeline'));
console.log('Results element:', document.getElementById('tracking-results'));
```

#### 3. Tester les Fonctions Individuellement
```javascript
// Test de la fonction de génération de timeline
const testComplaint = { status: 'En cours' };
generateStatusTimeline(testComplaint);
```

### Prévention

#### 1. Validation des Données
- Toujours vérifier que les champs requis sont présents
- Utiliser des valeurs par défaut pour les champs manquants

#### 2. Gestion d'Erreurs
- Capturer et afficher les erreurs de manière claire
- Fournir des messages d'aide pour l'utilisateur

#### 3. Tests Réguliers
- Tester le système après chaque modification
- Utiliser la page de test pour valider le bon fonctionnement

### Support

Si le problème persiste :

1. **Vérifiez les logs Laravel** dans `storage/logs/laravel.log`
2. **Testez avec Postman** pour isoler le problème backend
3. **Vérifiez la console du navigateur** pour les erreurs frontend
4. **Utilisez la page de test** pour diagnostiquer le problème

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0
