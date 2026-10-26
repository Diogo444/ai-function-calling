import { Component, signal } from '@angular/core';
import { Preview } from './components/preview/preview';
import { Chat } from './components/chat/chat';

@Component({
  imports: [Preview, Chat],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
}
