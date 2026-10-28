import { Service, signal } from '@angular/core';
export interface PreviewButton { id: number; texte: string; couleur: string }
@Service()
export class Preview {
  private readonly color = signal('#ffffff');

  private readonly text = signal('Voici la prévisualisation');

  private readonly items = signal<PreviewButton[]>([]);

  readonly backgroundColor = this.color.asReadonly();

  readonly previewText = this.text.asReadonly();

  readonly buttons = this.items.asReadonly();

  changerFond(couleur: string) { this.color.set(couleur); }

  changerTexte(texte: string) { this.text.set(texte); }

  creerBouton(texte: string, couleur: string) {
    this.items.update(items => [...items, { id: items.length + 1, texte, couleur }]);
  }
}
