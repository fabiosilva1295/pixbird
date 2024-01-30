import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent {
  @Input() counter: number = 0;
  @Input() attemps: number = 0;
  @Input() spending: number = 0;
  @Input() moves: number = 0;
}
