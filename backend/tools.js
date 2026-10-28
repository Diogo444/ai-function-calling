// Déclarations transmises à Gemini. L'exécution réelle vit dans Angular.
export const tools = [
  {
    type: 'function', name: 'changerFond',
    description: 'Change le fond de la prévisualisation.',
    parameters: { type: 'object', properties: { couleur: { type: 'string', description: 'Couleur hexadécimale comme #FFFF00' } }, required: ['couleur'] }
  },
  {
    type: 'function', name: 'changerTexte',
    description: 'Change le texte de la prévisualisation.',
    parameters: { type: 'object', properties: { texte: { type: 'string', description: 'Nouveau texte affiché' } }, required: ['texte'] }
  },
  {
    type: 'function', name: 'creerBouton',
    description: 'Ajoute un bouton dans la prévisualisation.',
    parameters: { type: 'object', properties: { texte: { type: 'string', description: 'Libellé du bouton' }, couleur: { type: 'string', description: 'Couleur hexadécimale du bouton' } }, required: ['texte', 'couleur'] }
  }
];
