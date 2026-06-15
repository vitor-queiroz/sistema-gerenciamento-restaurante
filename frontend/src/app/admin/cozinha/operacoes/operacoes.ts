import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-operacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './operacoes.html',
  styleUrl: './operacoes.css',
})
export class Operacoes {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  sair() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}