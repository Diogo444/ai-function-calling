import { inject, Service } from '@angular/core';
import { GeminiAction } from '../../models/gemini-response.model';
import { ToolResult } from '../../models/gemini-function-result.model';
import { Preview } from '../preview/preview';

function fields(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Arguments invalides');
  return value as Record<string, unknown>;
}

function stringField(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || !value.trim() || value.length > 100) throw new Error(`Champ ${key} invalide`);
  return value.trim();
}

function colorField(args: Record<string, unknown>, key: string): string {
  const value = stringField(args, key);
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Champ ${key} : couleur hexadécimale attendue`);
  return value;
}

@Service()
export class ToolExecutor {
  private readonly preview = inject(Preview);
  // Chaque entrée associe un nom autorisé à une fonction qui valide et exécute l'action.
  private readonly tools: Record<string, (arguments_: unknown) => Record<string, unknown>> = {
    changerFond: value => {
      const couleur = colorField(fields(value), 'couleur');
      this.preview.changerFond(couleur);
      return { couleur };
    },
    changerTexte: value => {
      const texte = stringField(fields(value), 'texte');
      this.preview.changerTexte(texte);
      return { texte };
    },
    creerBouton: value => {
      const args = fields(value);
      const texte = stringField(args, 'texte');
      const couleur = colorField(args, 'couleur');
      this.preview.creerBouton(texte, couleur);
      return { texte, couleur };
    }
  };
  execute(action: GeminiAction): ToolResult {
    try {
      const tool = Object.hasOwn(this.tools, action.name) ? this.tools[action.name] : undefined;
      if (!tool) throw new Error('Outil inconnu');
      return { callId: action.id, name: action.name, output: { success: true, ...tool(action.arguments) } };
    } catch (error) {
      return { callId: action.id, name: action.name, output: { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' } };
    }
  }
}
