import { Component, inject } from '@angular/core';
import { Preview as PreviewService } from '../../services/preview/preview';

@Component({
  imports: [],
  selector: 'app-preview',
  styleUrl: './preview.scss',
  templateUrl: './preview.html',
})
export class Preview {
    readonly previewService = inject(PreviewService);

}
