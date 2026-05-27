import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './painel.html',
  styleUrl: './painel.css',
})
export class Painel {}
