import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  senha = '';

  constructor(private router: Router){}

  entrar() {
    if(this.email === 'admin@123.com' && this.senha === '123'){

      console.log('Entrando como Gerente'); //PARA SABER SE DEU CERTO O FLUXO

      this.router.navigate(['/admin/cozinha/gerente']);
      return;
    }
  
      if(this.email === 'funcionario@123.com' && this.senha === '123'){

              console.log('Entrando como Funcionário');

        this.router.navigate(['/admin/cozinha/operacoes'])
      
          return;
      }
  
            alert('E-mail ou senha inválidos');
    }
}
