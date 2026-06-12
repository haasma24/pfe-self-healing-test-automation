import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() sub = '';
  @Input() subClass = 'neutral';
  @Input() accent = '#7c3aed';
}
