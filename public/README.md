# Système de Gestion des Réclamations - Frontend

## Vue d'ensemble

Ce projet est un système complet de gestion des réclamations avec une interface utilisateur moderne et responsive. Il permet aux utilisateurs de soumettre des réclamations, de suivre leur statut en temps réel, et aux administrateurs de gérer le processus.

## Fonctionnalités Principales

### 🔐 Authentification
- **Inscription** : Création de compte utilisateur
- **Connexion** : Authentification sécurisée
- **Gestion des rôles** : Utilisateurs et administrateurs
- **Déconnexion** : Fermeture de session sécurisée

### 📝 Gestion des Réclamations
- **Soumission** : Formulaire de création de réclamation
- **Types supportés** : Internet, Téléphonie, TV, Facturation, Autre
- **Validation** : Vérification côté client et serveur
- **Numéro de référence** : Génération automatique unique

### 🔍 Suivi des Réclamations
- **Recherche par référence** : Suivi en temps réel
- **Timeline de statut** : Progression visuelle
- **Historique complet** : Toutes les modifications
- **Réponses et communications** : Échanges avec l'équipe

### 👨‍💼 Interface Administrateur
- **Tableau de bord** : Vue d'ensemble des réclamations
- **Filtres avancés** : Par statut, type, date
- **Gestion des statuts** : Mise à jour des étapes
- **Assignation d'agents** : Attribution des cas

## Structure des Fichiers

```
public/
├── index.html          # Page d'accueil
├── login.html          # Page de connexion
├── correction.html     # Page de soumission de réclamation
├── suivi.html          # Page de suivi des réclamations
├── admin.html          # Interface administrateur
├── css/
│   └── style.css      # Styles CSS complets
├── js/
│   └── app.js         # Logique JavaScript principale
└── images/            # Images et logos
```

## Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec Flexbox et Grid
- **JavaScript ES6+** : Logique métier et interactions
- **Font Awesome** : Icônes vectorielles
- **Responsive Design** : Adaptation mobile et tablette

## Installation et Configuration

### 1. Prérequis
- Serveur web (Apache, Nginx, ou serveur de développement)
- Backend Laravel configuré et fonctionnel
- URL de l'API configurée dans `js/app.js`

### 2. Configuration de l'API
Modifiez la constante `API_BASE_URL` dans `js/app.js` :

```javascript
const API_BASE_URL = 'http://votre-domaine.com/api';
```

### 3. Déploiement
1. Copiez tous les fichiers dans votre répertoire web
2. Assurez-vous que les permissions sont correctes
3. Vérifiez que le backend Laravel est accessible

## Utilisation

### Pour les Utilisateurs

#### 1. Créer un Compte
- Accédez à la page de connexion
- Cliquez sur "Créer un compte"
- Remplissez le formulaire d'inscription
- Confirmez votre mot de passe

#### 2. Soumettre une Réclamation
- Connectez-vous à votre compte
- Accédez à la page "Réclamation"
- Sélectionnez le type de problème
- Remplissez le sujet et la description
- Ajoutez vos informations de contact
- Soumettez la réclamation

#### 3. Suivre une Réclamation
- Accédez à la page "Suivi"
- Entrez votre numéro de référence
- Consultez le statut en temps réel
- Suivez l'historique des modifications
- Lisez les réponses de l'équipe

### Pour les Administrateurs

#### 1. Accéder au Tableau de Bord
- Connectez-vous avec un compte administrateur
- Accédez à la page "Admin"
- Consultez la liste des réclamations

#### 2. Gérer les Réclamations
- Utilisez les filtres pour organiser la vue
- Mettez à jour les statuts des réclamations
- Assignez des agents aux cas
- Répondez aux utilisateurs

#### 3. Suivre les Statistiques
- Consultez les métriques de performance
- Analysez les tendances
- Exportez les données si nécessaire

## API Endpoints

Le frontend communique avec le backend Laravel via ces endpoints :

- `POST /api/register` - Inscription utilisateur
- `POST /api/login` - Connexion utilisateur
- `POST /api/logout` - Déconnexion
- `GET /api/complaints` - Liste des réclamations
- `POST /api/complaints` - Créer une réclamation
- `GET /api/complaints/track/{reference}` - Suivre une réclamation
- `PUT /api/complaints/{id}` - Mettre à jour une réclamation

## Personnalisation

### Couleurs et Thème
Modifiez les variables CSS dans `css/style.css` :

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --warning-color: #f57c00;
    --danger-color: #c2185b;
}
```

### Logo et Images
- Remplacez `images/logo.png` par votre logo
- Ajustez les dimensions dans le CSS si nécessaire
- Personnalisez les icônes Font Awesome

### Textes et Contenu
- Modifiez les textes dans les fichiers HTML
- Adaptez les messages d'erreur dans `js/app.js`
- Personnalisez les informations de contact

## Sécurité

### Bonnes Pratiques Implémentées
- Validation côté client et serveur
- Gestion sécurisée des sessions
- Protection CSRF (via Laravel)
- Authentification par token
- Contrôle d'accès basé sur les rôles

### Recommandations
- Utilisez HTTPS en production
- Configurez des en-têtes de sécurité
- Limitez les tentatives de connexion
- Surveillez les logs d'accès

## Support et Maintenance

### Débogage
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs JavaScript
- Consultez les logs du serveur Laravel
- Testez les endpoints API individuellement

### Mise à Jour
- Sauvegardez vos personnalisations
- Mettez à jour les dépendances
- Testez en environnement de développement
- Déployez en production après validation

## Licence

Ce projet est fourni à des fins éducatives et commerciales. Assurez-vous de respecter les licences des bibliothèques tierces utilisées.

## Support

Pour toute question ou problème :
- Consultez la documentation Laravel
- Vérifiez la console du navigateur
- Testez les endpoints API avec Postman
- Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe de développement
