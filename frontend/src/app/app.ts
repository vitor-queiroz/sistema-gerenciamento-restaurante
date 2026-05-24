import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './pages/home/home';
@Component({
  selector: 'app-root', /*Indica como eu vou usar esse componente, como eu vou referenciar esse componente em outro componente. Pór exemplo: caso eu queira usar o componente Home. Para que isso funcione, eu importo aqui em baixo, */
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
