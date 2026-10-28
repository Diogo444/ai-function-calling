# Function calling Gemini + Angular

Cette petite application montre **trois outils** : `changerFond`, `changerTexte` et `creerBouton`. Essayez : « Mets le fond en jaune, écris Bonjour et ajoute un bouton bleu nommé OK ».

## Démarrer

```bash
npm install
npm start
```

Dans un autre terminal :

```bash
cd backend
npm install
cp .env.example .env
# Renseigner GEMINI_API_KEY dans .env
node index.js
```

Ouvrez `http://localhost:4200`. La clé Gemini reste uniquement dans Express.

## Chemin d'un appel

1. Le chat envoie le texte à `POST /api/chat`.
2. Express transmet à Gemini le texte et les **descriptions** des outils de [backend/tools.js](backend/tools.js). Ces descriptions ne sont pas du code exécutable.
3. Gemini renvoie zéro, un ou plusieurs `function_call`, chacun avec un nom, des arguments et un identifiant `id`.
4. [ToolExecutor](src/app/services/tool-executor/tool-executor.ts) cherche le nom dans son registre, valide les arguments, puis modifie l'état de [Preview](src/app/services/preview/preview.ts). Un nom inconnu ou des arguments invalides donnent `success: false`.
5. Le chat envoie **tous** les résultats à `POST /api/chat/result`. Express les associe aux appels par `call_id` et les transmet ensemble à Gemini.
6. Si Gemini demande d'autres outils, les étapes 3 à 5 recommencent (cinq séries maximum). Sinon, son texte est affiché. L'identifiant de la dernière interaction sert aussi au message utilisateur suivant.

```text
Utilisateur → Angular → Express → Gemini
                          ← appels d'outils
               registre Angular → Preview (signaux)
               résultats → Express → Gemini → réponse
```

## Ajouter un outil

Ajoutez sa déclaration dans `backend/tools.js`, puis une entrée du même nom dans le registre de `tool-executor.ts`. Cette entrée valide les arguments et renvoie un petit objet résultat. Le composant Chat n'a pas besoin de changer. Les outils qui accèdent à une base de données ou à un secret doivent être exécutés dans Express plutôt que dans Angular.

Les schémas envoyés au modèle guident la génération, mais la validation réelle reste dans `ToolExecutor`. Ce prototype garde les appels en attente en mémoire dans Express : un redémarrage du serveur interrompt donc une série d'outils en cours. Il ne comprend ni authentification ni stockage durable des conversations.

Sources : [Angular, signaux dans les services](https://angular.dev/tutorials/signals/7-using-signals-with-services), [Gemini, function calling](https://ai.google.dev/gemini-api/docs/function-calling), [Gemini, Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview).
