import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../services/api/api';
import { ToolExecutor } from '../../services/tool-executor/tool-executor';
import { GeminiTurn } from '../../models/gemini-response.model';

type ChatMessage = { content: string; role: 'user' | 'assistant' };
@Component({ selector: 'app-chat', styleUrl: './chat.scss', templateUrl: './chat.html' })
export class Chat {
  private readonly api = inject(Api);
  private readonly executor = inject(ToolExecutor);
  private interactionId?: string;
  readonly message = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  updateMessage(event: Event) {
    if (event.target instanceof HTMLTextAreaElement) this.message.set(event.target.value);
  }

  async demanderGemini() {
    const prompt = this.message().trim();
    if (!prompt || this.isLoading()) return;
    this.messages.update(items => [...items, { content: prompt, role: 'user' }]);
    this.message.set('');
    this.error.set('');
    this.isLoading.set(true);
    try {
      let turn = (await firstValueFrom(this.api.demandeGemini(prompt, this.interactionId))).response;
      // Un tour peut contenir plusieurs appels. Le suivant peut dépendre de leurs résultats.
      for (let round = 0; round < 5; round++) {
        if (turn.message) this.addAssistant(turn.message);
        this.interactionId = turn.interactionId;
        if (!turn.actions.length) return;
        const results = turn.actions.map(action => this.executor.execute(action));
        turn = (await firstValueFrom(this.api.envoyerResultat({ interactionId: turn.interactionId, results }))).response;
      }
      if (turn.actions.length) throw new Error('Trop de séries d’outils demandées.');
      if (turn.message) this.addAssistant(turn.message);
      this.interactionId = turn.interactionId;
    } catch (error) {
      this.error.set(error instanceof Error && error.message.startsWith('Trop') ? error.message : 'Impossible d’obtenir une réponse. Vérifiez le backend.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private addAssistant(content: string) {
    this.messages.update(items => [...items, { content, role: 'assistant' }]);
  }
}
