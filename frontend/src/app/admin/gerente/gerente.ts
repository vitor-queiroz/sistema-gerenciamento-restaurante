import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gerente.html',
  styleUrl: './gerente.css',
})
export class Gerente {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  sair() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}