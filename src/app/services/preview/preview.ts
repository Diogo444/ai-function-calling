import { Service, signal } from '@angular/core';

@Service()
export class Preview {
    private readonly color = signal('#000000');
    readonly backgroundColor = this.color.asReadonly();

    changerFond(){
        this.color.set('#ff0000');
    }
}
