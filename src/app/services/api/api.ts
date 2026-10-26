import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class Api {
  readonly apiURL = "http://localhost:3000"
  readonly http = inject(HttpClient)

  demandeGemini(prompt: string){
    return this.http.post<{ response: string }>(this.apiURL + "/api/chat", { prompt })
  }
}
