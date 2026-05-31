import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-acessos',
  imports: [CommonModule, FormsModule],
  templateUrl: './acessos.html',
  styleUrl: './acessos.css',
})
export class Acessos {

  funcionarios = [
    {
      nome: 'Kelvin Moises',
      email: 'kelvin@gmail.com',
      status: 'Ativo',

      estoque: true,
      pedidos: true,
      cliente: false,
      garcom: false,
      esg: false
    },
    {
      nome: 'Washington Lopes',
      email: 'washwash@gmail.com',
      status: 'Ativo',

      estoque: false,
      pedidos: true,
      cliente: false,
      garcom: false,
      esg: false
    },
    {
      nome: 'Thiago Silva',
      email: 'thiago@gmail.com',
      status: 'Pendente',

      estoque: true,
      pedidos: false,
      cliente: false,
      garcom: false,
      esg: false
    }
  ];
}
