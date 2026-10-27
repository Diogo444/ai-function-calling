import { Service, signal } from '@angular/core';

@Service()
export class Preview {
    private readonly color = signal('#000000');
    readonly backgroundColor = this.color.asReadonly();

    changerFond(couleur: string){
        this.color.set(couleur);
    }
}
