import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalContainerComponent } from './modal';
import { ModalDemoComponent } from './demo/modal-demo/modal-demo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalContainerComponent, ModalDemoComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
