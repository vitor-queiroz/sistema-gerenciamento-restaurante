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

  funcionarioAberto = '';

  abrirPermissoes(id: string){

    if(this.funcionarioAberto === id){
      this.funcionarioAberto = '';
      return;
    }

    this.funcionarioAberto = id;
  }


    aprovarAcesso(id: string){
      const funcionario = this.funcionarios.find(f => f.id === id);

      if(!funcionario) return;

      funcionario.status = 'Ativo'
    }


    voltarParaPendente(id: string) {
      const funcionario = this.funcionarios.find(f => f.id === id);

      if (!funcionario) return;

      funcionario.status = 'Pendente';
    }

  funcionarios = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
