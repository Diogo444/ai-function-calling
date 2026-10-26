import { Component, inject } from '@angular/core';
import { Preview } from '../../services/preview/preview';

@Component({
  imports: [],
  selector: 'app-chat',
  styleUrl: './chat.scss',
  templateUrl: './chat.html',
})
export class Chat {
  change = inject(Preview);

    changerFond(){
        this.change.changerFond();
    }
}
