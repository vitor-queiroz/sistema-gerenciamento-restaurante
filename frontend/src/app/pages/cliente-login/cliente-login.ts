import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cliente-login.html',
  styleUrl: './cliente-login.css',
})
export class ClienteLogin {
  // Estado para controlar qual aba está ativa
  abaSelecionada: 'login' | 'cadastro' = 'login';

  // Dados de login
  loginEmail = '';
  loginSenha = '';

  // Dados de cadastro
  cadastroNome = '';
  cadastroEmail = '';
  cadastroSenha = '';
  cadastroConfirmaSenha = '';
  cadastroTelefone = '';
  
  // Dados de endereço
  cadastroCEP = '';
  cadastroEstado = '';
  cadastroCidade = '';
  cadastroEndereco = '';
  cadastroComplemento = '';

  // Armazenar clientes (em produção, seria em banco de dados)
  clientes: any[] = JSON.parse(localStorage.getItem('clientes') || '[]');

  constructor(private router: Router) {}

  // Alternar entre abas
  trocarAba(aba: 'login' | 'cadastro') {
    this.abaSelecionada = aba;
  }

  // Método para login
  entrar() {
    if (!this.loginEmail || !this.loginSenha) {
      alert('Por favor, preencha email e senha');
      return;
    }

    // Procurar cliente no localStorage
    const clienteEncontrado = this.clientes.find(
      (c) => c.email === this.loginEmail && c.senha === this.loginSenha
    );

    if (clienteEncontrado) {
      console.log('Cliente logado com sucesso:', clienteEncontrado);
      // Salvar dados do cliente logado
      localStorage.setItem('usuarioLogado', JSON.stringify(clienteEncontrado));
      // Redirecionar para página de pedidos
      this.router.navigate(['/cliente-pedidos']);
    } else {
      alert('Email ou senha inválidos');
    }
  }

  // Método para cadastro
  realizarCadastro() {
    // Validações
    if (
      !this.cadastroNome ||
      !this.cadastroEmail ||
      !this.cadastroSenha ||
      !this.cadastroConfirmaSenha ||
      !this.cadastroTelefone ||
      !this.cadastroCEP ||
      !this.cadastroEstado ||
      !this.cadastroCidade ||
      !this.cadastroEndereco
    ) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (this.cadastroSenha !== this.cadastroConfirmaSenha) {
      alert('As senhas não conferem');
      return;
    }

    // Verificar se email já existe
    const emailExistente = this.clientes.find(
      (c) => c.email === this.cadastroEmail
    );
    if (emailExistente) {
      alert('Este email já está cadastrado');
      return;
    }

    // Criar novo cliente
    const novoCliente = {
      id: Date.now(),
      nome: this.cadastroNome,
      email: this.cadastroEmail,
      senha: this.cadastroSenha,
      telefone: this.cadastroTelefone,
      endereco: {
        cep: this.cadastroCEP,
        estado: this.cadastroEstado,
        cidade: this.cadastroCidade,
        rua: this.cadastroEndereco,
        complemento: this.cadastroComplemento,
      },
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
    };

    // Adicionar cliente ao array
    this.clientes.push(novoCliente);

    // Salvar no localStorage
    localStorage.setItem('clientes', JSON.stringify(this.clientes));

    console.log('Cliente cadastrado com sucesso:', novoCliente);
    alert('Cadastro realizado com sucesso! Você será redirecionado para fazer seu pedido.');

    // Salvar cliente como logado
    localStorage.setItem('usuarioLogado', JSON.stringify(novoCliente));

    // Limpar formulário
    this.cadastroNome = '';
    this.cadastroEmail = '';
    this.cadastroSenha = '';
    this.cadastroConfirmaSenha = '';
    this.cadastroTelefone = '';
    this.cadastroCEP = '';
    this.cadastroEstado = '';
    this.cadastroCidade = '';
    this.cadastroEndereco = '';
    this.cadastroComplemento = '';

    // Redirecionar para página de pedidos
    this.router.navigate(['/cliente-pedidos']);
  }

  // Voltar para home
  voltarHome() {
    this.router.navigate(['/home']);
  }
}
