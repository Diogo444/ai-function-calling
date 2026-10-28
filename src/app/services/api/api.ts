import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { GeminiResponse } from '../../models/gemini-response.model';
import { GeminiFunctionResult, GeminiFunctionResultResponse } from '../../models/gemini-function-result.model';
@Service()
export class Api {
  private readonly http = inject(HttpClient);
  private readonly apiURL = 'http://localhost:3000';
  demandeGemini(prompt: string, interactionId?: string) {
    return this.http.post<GeminiResponse>(this.apiURL + '/api/chat', { prompt, interactionId });
  }
  envoyerResultat(resultat: GeminiFunctionResult) {
    return this.http.post<GeminiFunctionResultResponse>(this.apiURL + '/api/chat/result', resultat);
  }
}
