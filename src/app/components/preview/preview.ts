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

    textColor(hex: string): string {
      const value = hex.slice(1);
      const channels = [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255);
      const luminance = channels.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2] > 0.179 ? "#000000" : "#ffffff";
    }

}
