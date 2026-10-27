# Démonstration du function calling avec Gemini

Ce projet est un **code d'apprentissage**. Son objectif est de montrer, avec un
exemple très court, comment une application peut demander à Gemini de choisir
une fonction, exécuter cette fonction dans le code de l'application, puis
renvoyer le résultat à Gemini.

L'exemple contient une seule fonction appelable par Gemini :
`changerFond(couleur)`. Lorsque l'utilisateur demande par exemple de changer la
couleur de la preview, Gemini génère un appel à cette fonction. Angular applique
alors la couleur dans l'interface, puis le backend transmet le résultat à
Gemini afin d'obtenir une réponse finale.

> Cette architecture n'est pas conçue pour évoluer en production. Elle est
> volontairement simple pour permettre de suivre visuellement chaque étape du
> function calling. Elle ne gère notamment ni l'authentification, ni la
> persistance des conversations, ni plusieurs outils, ni une validation métier
> complète.

## Architecture générale

Le dépôt est organisé en deux applications :

```text
ai-function-calling/
├── src/                         # Frontend Angular
│   └── app/
│       ├── components/
│       │   ├── chat/            # Saisie et affichage de la conversation
│       │   └── preview/         # Zone dont la couleur est modifiée
│       ├── models/              # Types des échanges avec le backend
│       └── services/
│           ├── api/             # Requêtes HTTP vers Express
│           └── preview/         # État partagé de la couleur
├── backend/
│   └── index.js                 # API Express et appels Gemini
└── package.json                 # Dépendances et commandes Angular
```

Le frontend et le backend sont deux projets npm indépendants :

- Angular s'exécute généralement sur `http://localhost:4200`.
- Express s'exécute généralement sur `http://localhost:3000`.
- Le navigateur appelle Express avec `POST /api/chat` et
  `POST /api/chat/result`.
- La clé Gemini reste dans le backend. Elle ne doit pas être placée dans le
  code Angular ni exposée au navigateur.

## Installation

### Prérequis

- Node.js et npm installés ;
- une clé API Gemini.

Les versions Angular utilisées par ce projet sont indiquées dans le
[package.json](./package.json). Les versions du backend sont indiquées dans
[backend/package.json](./backend/package.json).

### Dépendances Angular

Depuis la racine du projet, installer les dépendances du frontend :

```bash
npm install
```

Le projet utilise notamment Angular, `@angular/common`, `@angular/core`,
`@angular/router`, `rxjs`, TypeScript et Vitest.

### Dépendances du backend

Dans un autre terminal, installer les dépendances du backend :

```bash
cd backend
npm install
```

Le backend utilise Express pour l'API HTTP, CORS pour autoriser les appels
depuis Angular, `dotenv` pour charger les variables d'environnement et
`@google/genai` pour communiquer avec Gemini.

### Configurer la clé API Gemini

Créer un fichier `backend/.env` (ce fichier ne doit pas être commité), puis y
ajouter votre clé :

```env
GEMINI_API_KEY=votre_cle_api_gemini
PORT=3000
```

`PORT` est facultatif : le backend utilise `3000` s'il n'est pas défini.
La clé est lue par [backend/index.js](./backend/index.js) grâce à
`import "dotenv/config"` et `process.env.GEMINI_API_KEY`.

Ne mettez jamais cette clé dans un fichier Angular, dans une variable
accessible au navigateur ou dans un dépôt public.

## Lancer l'application

Ouvrir deux terminaux.

Dans le premier, à la racine :

```bash
npm start
```

Ouvrir ensuite `http://localhost:4200`.

Dans le second :

```bash
cd backend
node index.js
```

Le backend affiche alors un message indiquant qu'il écoute sur le port choisi.
Les deux serveurs doivent être démarrés pour envoyer un message depuis le
chat.

Commandes utiles côté Angular :

```bash
npm run build   # Compile l'application
npm test        # Lance les tests unitaires
```

Le backend ne contient pas encore de suite de tests automatisés fonctionnelle ;
son script `test` est encore un placeholder.

## Parcours complet d'une requête

Voici le chemin suivi lorsqu'un utilisateur demande à changer la couleur de la
preview.

### 1. Saisie dans le chat

Le template [chat.html](./src/app/components/chat/chat.html) affiche un
textarea et un formulaire. L'événement `input` appelle
`Chat.updateMessage(event)` pour recopier le texte dans le signal `message`.
La soumission du formulaire empêche le rechargement de la page et appelle
`Chat.demanderGemini()`.

Cette méthode :

1. supprime les espaces inutiles avec `trim()` ;
2. ignore une demande vide ou une demande déjà en cours ;
3. ajoute le message utilisateur au signal `messages` ;
4. vide le champ, efface l'erreur et active `isLoading` ;
5. appelle `Api.demandeGemini(prompt)`.

### 2. Première requête vers le backend

Le service [api.ts](./src/app/services/api/api.ts) envoie le prompt avec :

```http
POST http://localhost:3000/api/chat
Content-Type: application/json

{ "prompt": "Change le fond en rouge" }
```

La route `/api/chat` dans [backend/index.js](./backend/index.js) vérifie que
`prompt` est bien une chaîne non vide. En cas d'erreur de validation, elle
répond avec HTTP 400.

### 3. Déclaration de l'outil à Gemini

L'objet `changerFond` décrit la fonction que Gemini a le droit de demander :

- `type: "function"` indique qu'il s'agit d'un outil appelable ;
- `name` est le nom qui reviendra dans l'appel ;
- `description` explique à Gemini quand l'utiliser ;
- `parameters` décrit le JSON attendu ;
- `couleur` est obligatoire et doit être une couleur CSS hexadécimale.

Cette déclaration ne lance pas la fonction. Elle fournit seulement à Gemini un
contrat lui permettant de produire un appel structuré.

### 4. Gemini choisit entre une réponse et un appel de fonction

`demanderGemini(prompt)` appelle
`ai.interactions.create()` avec le modèle
`gemini-3.1-flash-lite`, le prompt et l'outil `changerFond`.

La réponse Gemini contient des `steps`. Le code recherche le premier élément
dont `type` vaut `function_call`. La fonction retourne au frontend :

- `message` : le texte éventuellement produit par Gemini ;
- `action` : l'appel de fonction, ou `null` s'il n'y en a pas ;
- `interactionId` : l'identifiant de l'interaction, indispensable pour
  poursuivre cette conversation.

### 5. Angular exécute réellement la fonction

Quand la réponse arrive dans `Chat.demanderGemini()`, le texte de Gemini est
ajouté à la conversation s'il existe. Si `action.name` vaut `changerFond`,
Angular lit `action.arguments.couleur`.

Avant de l'appliquer, le code vérifie le format avec la regex
`/^#[0-9a-fA-F]{6}$/`. Si la couleur est valide, il appelle :

```ts
this.previewService.changerFond(couleur);
```

Point important : Gemini ne peut pas modifier directement le DOM. Gemini
demande l'action, mais c'est le code Angular qui l'exécute.

### 6. Le résultat de la fonction revient à Gemini

Après l'exécution locale, Angular appelle
`Api.envoyerResultat(...)`, qui envoie à `/api/chat/result` :

- `interactionId` : l'interaction initiale ;
- `callId` : l'identifiant de l'appel demandé par Gemini ;
- `name` : `changerFond` ;
- `success` : `true` ;
- `couleur` : la valeur appliquée.

Le backend reprend alors la conversation avec
`previous_interaction_id: interactionId`. Il transmet à Gemini un élément de
type `function_result`, avec le même `call_id` et un résultat JSON contenant
`success` et `couleur`.

Gemini sait ainsi que l'action a été exécutée et produit une réponse finale.
Cette réponse est renvoyée à Angular puis ajoutée aux messages du chat.

Le flux peut être résumé ainsi :

```text
Utilisateur
  -> Chat Angular
  -> POST /api/chat
  -> Gemini + déclaration de changerFond
  <- function_call + interactionId
  -> validation et exécution dans Angular
  -> PreviewService.changerFond()
  -> POST /api/chat/result avec function_result
  -> Gemini reprend l'interaction
  <- réponse finale
  -> affichage dans le chat
```

## Le service partagé entre le chat et la preview

Le service [preview.ts](./src/app/services/preview/preview.ts) est le point
central de l'état de la couleur :

- `color` est un signal privé initialisé à `#000000` ;
- `backgroundColor` est une version en lecture seule exposée aux composants ;
- `changerFond(couleur)` met à jour le signal avec `set()`.

Le composant [chat.ts](./src/app/components/chat/chat.ts) injecte ce service
pour modifier la couleur après l'appel de fonction. Le composant
[preview.ts](./src/app/components/preview/preview.ts) injecte **le même
service** et expose cette instance au template.

Dans [preview.html](./src/app/components/preview/preview.html), la couleur
est liée au style :

```html
[style.background]="previewService.backgroundColor()"
```

Quand le chat appelle `changerFond`, le signal change. Angular détecte cette
modification et réévalue `backgroundColor()`, ce qui met à jour la preview
sans que le chat ait besoin de manipuler son DOM ou de communiquer directement
avec le composant preview.

Ce partage est précisément ce qui permet à la preview de changer en réaction
à une action déclenchée depuis le chat. Le service joue ici le rôle d'un petit
état partagé réactif.

## Description des fichiers et fonctions

### Backend

Dans [backend/index.js](./backend/index.js) :

- `express()` crée l'application HTTP ;
- `app.use(cors())` autorise les requêtes provenant du serveur Angular ;
- `new GoogleGenAI(...)` crée le client Gemini avec la clé d'environnement ;
- `express.json()` permet de lire les corps JSON des requêtes ;
- `changerFond` décrit l'outil disponible pour le function calling ;
- `demanderGemini(prompt)` envoie le prompt à Gemini et extrait le texte,
  l'appel de fonction et l'identifiant d'interaction ;
- `GET /` sert de réponse de vérification minimale du serveur ;
- `POST /api/chat` valide un prompt, appelle Gemini et retourne sa première
  réponse au frontend ;
- `POST /api/chat/result` reçoit le résultat de l'action Angular, le transmet
  à Gemini avec `function_result`, puis retourne la réponse finale ;
- `app.listen(...)` démarre le serveur sur `PORT` ou `3000`.

### Modèles Angular

Les interfaces dans [gemini-response.model.ts](./src/app/models/gemini-response.model.ts)
décrivent la réponse initiale : une action éventuelle de type
`function_call`, son nom, son id, ses arguments et `interactionId`.

Les interfaces dans
[gemini-function-result.model.ts](./src/app/models/gemini-function-result.model.ts)
décrivent le résultat renvoyé après exécution : l'interaction, l'appel, le nom
de la fonction, le succès et la couleur.

### Services et composants Angular

Dans [api.ts](./src/app/services/api/api.ts) :

- `demandeGemini(prompt)` encapsule `POST /api/chat` ;
- `envoyerResultat(resultat)` encapsule `POST /api/chat/result`.

Dans [chat.ts](./src/app/components/chat/chat.ts) :

- `updateMessage(event)` met à jour le signal du champ texte ;
- `demanderGemini()` orchestre l'affichage, l'appel backend, la validation de
  l'action et l'envoi du résultat ;
- `message`, `messages`, `isLoading` et `error` sont des signaux locaux qui
  pilotent l'interface.

Dans [preview.ts](./src/app/components/preview/preview.ts), le composant
injecte le service partagé. Son template affiche la zone colorée.

Dans [app.ts](./src/app/app.ts), le composant racine importe et affiche
`Chat` et `Preview` via [app.html](./src/app/app.html).

Dans [app.config.ts](./src/app/app.config.ts), `provideHttpClient()` rend
`HttpClient` disponible pour le service API et `provideRouter(routes)` configure
le routeur. Le démarrage de l'application est réalisé par
[main.ts](./src/main.ts) avec `bootstrapApplication`.

## Limites pédagogiques et pistes d'évolution

Le code est adapté à une démonstration, pas à une application évolutive. Pour
aller plus loin, il faudrait notamment :

- centraliser la configuration de l'URL de l'API plutôt que la coder en dur ;
- utiliser un environnement Angular pour les URLs ;
- gérer proprement les erreurs de `/api/chat/result` et les réponses
  incomplètes ;
- valider côté backend les arguments de chaque fonction avant de les exécuter ;
- ne pas faire confiance au champ `success` fourni par le client ;
- séparer les outils, leurs validateurs et leurs exécutants ;
- gérer plusieurs appels de fonction et plusieurs tours de conversation ;
- ajouter une authentification, des limites de débit et une journalisation
  contrôlée ;
- ajouter des tests backend et des tests de bout en bout ;
- persister les interactions si une conversation doit survivre à un
  rechargement.

La simplicité actuelle est intentionnelle : elle rend visible le mécanisme
essentiel du function calling sans introduire prématurément une architecture
complexe.
