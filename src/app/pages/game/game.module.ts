import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { HeaderComponent } from './components/header/header.component';
import { CounterComponent } from './components/counter/counter.component';


@NgModule({
  declarations: [
    GameComponent,
    HeaderComponent,
    CounterComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule
  ]
})
export class GameModule { }
