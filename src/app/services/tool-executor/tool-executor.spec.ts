import { TestBed } from '@angular/core/testing';
import { ToolExecutor } from './tool-executor';
import { Preview } from '../preview/preview';

describe('ToolExecutor', () => {
  it('executes several registered tools and rejects invalid calls', () => {
    TestBed.configureTestingModule({});
    const executor = TestBed.inject(ToolExecutor);
    const preview = TestBed.inject(Preview);
    expect(executor.execute({ id: '1', name: 'changerFond', arguments: { couleur: '#FFFF00' } }).output.success).toBe(true);
    expect(executor.execute({ id: '2', name: 'creerBouton', arguments: { texte: 'OK', couleur: '#0000FF' } }).output.success).toBe(true);
    expect(preview.backgroundColor()).toBe('#FFFF00');
    expect(preview.buttons()[0].texte).toBe('OK');
    expect(executor.execute({ id: '3', name: 'changerFond', arguments: { couleur: 'red' } }).output.success).toBe(false);
    expect(executor.execute({ id: '4', name: 'unknown', arguments: {} }).output.success).toBe(false);
  });
});
