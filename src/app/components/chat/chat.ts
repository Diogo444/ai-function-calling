import { Component, inject, signal } from '@angular/core';
import { Api } from '../../services/api/api';
import { Preview } from '../../services/preview/preview';


type ChatMessage = { content: string; role: 'user' | 'assistant' };

@Component({
  imports: [],
  selector: 'app-chat',
  styleUrl: './chat.scss',
  templateUrl: './chat.html',
})
export class Chat {
  private readonly api = inject(Api);
  readonly message = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  private previewService = inject(Preview)

  updateMessage(event: Event) {
    if (event.target instanceof HTMLTextAreaElement) this.message.set(event.target.value);
  }

  demanderGemini() {
  const prompt = this.message().trim();

  if (!prompt || this.isLoading()) return;

  this.messages.update((messages) => [
    ...messages,
    { content: prompt, role: 'user' }
  ]);

  this.message.set('');
  this.error.set('');
  this.isLoading.set(true);

  this.api.demandeGemini(prompt).subscribe({
    next: (data) => {
      const result = data.response;

      // Afficher la réponse textuelle de Gemini
      if (result.message) {
        this.messages.update((messages) => [
          ...messages,
          { content: result.message, role: 'assistant' }
        ]);
      }

      // Exécuter l'action demandée par Gemini
      if (result.action?.name === 'changerFond') {
        const couleur = result.action.arguments.couleur;

        if (
          typeof couleur === 'string' &&
          /^#[0-9a-fA-F]{6}$/.test(couleur)
        ) {
          this.previewService.changerFond(couleur);

          this.api.envoyerResultat({
            interactionId: result.interactionId,
            callId: result.action.id,
            name: result.action.name,
            couleur: couleur,
            success: true
          }).subscribe({
            next: (data) =>{
              console.log("Réponse du backend" + data.message)
              if (data.message) {
        this.messages.update((messages) => [
          ...messages,
          { content: data.message, role: 'assistant' }
        ]);
      }
            }
          })
        }
      }
    },

    error: () => {
      this.error.set(
        'Impossible d’obtenir une réponse. Vérifiez que le backend est lancé.'
      );
      this.isLoading.set(false);
    },

    complete: () => {
      this.isLoading.set(false);
    }
  });
}
  }
