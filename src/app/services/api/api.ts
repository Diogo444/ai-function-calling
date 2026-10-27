import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { GeminiResponse } from '../../models/gemini-response.model';
import { GeminiFunctionResult, GeminiFunctionResultResponse } from '../../models/gemini-function-result.model';

@Service()
export class Api {
  readonly apiURL = "http://localhost:3000"
  readonly http = inject(HttpClient)

  demandeGemini(prompt: string){
    return this.http.post<GeminiResponse>(this.apiURL + "/api/chat", { prompt })
  }

  envoyerResultat(resultat: GeminiFunctionResult){
    return this.http.post<GeminiFunctionResultResponse>(this.apiURL + "/api/chat/result", resultat)
  }
}
