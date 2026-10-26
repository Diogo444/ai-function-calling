import { Component, inject, signal } from '@angular/core';
import { Api } from '../../services/api/api';

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

  updateMessage(event: Event) {
    if (event.target instanceof HTMLTextAreaElement) this.message.set(event.target.value);
  }

  demanderGemini() {
    const prompt = this.message().trim();
    if (!prompt || this.isLoading()) return;
    this.messages.update((messages) => [...messages, { content: prompt, role: 'user' }]);
    this.message.set('');
    this.error.set('');
    this.isLoading.set(true);
    this.api.demandeGemini(prompt).subscribe({
      next: (response) => {
        this.messages.update((messages) => [...messages, { content: response.response, role: 'assistant' }]);
      },
      error: () => { this.error.set('Impossible d’obtenir une réponse. Vérifiez que le backend est lancé.'); this.isLoading.set(false); },
      complete: () => this.isLoading.set(false),
    });
  }
}
