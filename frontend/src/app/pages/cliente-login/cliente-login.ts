import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

interface Cliente {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: {
    cep: string;
    estado: string;
    cidade: string;
    rua: string;
    complemento: string;
  };
  dataCadastro: string;
}

@Component({
  selector: 'app-cliente-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cliente-login.html',
  styleUrl: './cliente-login.css',
})
export class ClienteLogin {
  abaSelecionada: 'login' | 'cadastro' = 'login';

  loginEmail = '';
  loginSenha = '';

  cadastroNome = '';
  cadastroEmail = '';
  cadastroSenha = '';
  cadastroConfirmaSenha = '';
  cadastroTelefone = '';

  cadastroCEP = '';
  cadastroEstado = '';
  cadastroCidade = '';
  cadastroEndereco = '';
  cadastroComplemento = '';

  constructor(
    private router: Router,
    private firestore: Firestore
  ) {}

  trocarAba(aba: 'login' | 'cadastro') {
    this.abaSelecionada = aba;
  }

  async entrar() {
    if (!this.loginEmail || !this.loginSenha) {
      alert('Por favor, preencha email e senha');
      return;
    }

    const emailTratado = this.loginEmail.trim().toLowerCase();

    if (!this.emailValido(emailTratado)) {
      alert('Digite um email válido.');
      return;
    }

    try {
      const clientesRef = collection(this.firestore, 'clientes');

      const q = query(
        clientesRef,
        where('email', '==', emailTratado),
        where('senha', '==', this.loginSenha)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const clienteDoc = querySnapshot.docs[0];

        const clienteEncontrado = {
          id: clienteDoc.id,
          ...clienteDoc.data()
        };

        console.log('Cliente logado com sucesso:', clienteEncontrado);

        localStorage.setItem(
          'usuarioLogado',
          JSON.stringify(clienteEncontrado)
        );

        this.router.navigate(['/cliente-pedidos']);
      } else {
        alert('Email ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  }

  async realizarCadastro() {
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

    const emailTratado = this.cadastroEmail.trim().toLowerCase();

    if (!this.emailValido(emailTratado)) {
      alert('Digite um email válido.');
      return;
    }

    if (!this.senhaValida(this.cadastroSenha)) {
      alert(
        'A senha precisa ter no mínimo 6 caracteres, uma letra maiúscula e um caractere especial.'
      );
      return;
    }

    if (this.cadastroSenha !== this.cadastroConfirmaSenha) {
      alert('As senhas não conferem');
      return;
    }

    try {
      const clientesRef = collection(this.firestore, 'clientes');

      const q = query(
        clientesRef,
        where('email', '==', emailTratado)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('Este email já está cadastrado');
        return;
      }

      const novoCliente: Cliente = {
        nome: this.cadastroNome.trim(),
        email: emailTratado,
        senha: this.cadastroSenha,
        telefone: this.cadastroTelefone.trim(),
        endereco: {
          cep: this.cadastroCEP.trim(),
          estado: this.cadastroEstado.trim(),
          cidade: this.cadastroCidade.trim(),
          rua: this.cadastroEndereco.trim(),
          complemento: this.cadastroComplemento.trim(),
        },
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
      };

      const docRef = await addDoc(clientesRef, novoCliente);

      const clienteComId = {
        id: docRef.id,
        ...novoCliente
      };

      console.log('Cliente cadastrado com sucesso:', clienteComId);

      alert(
        'Cadastro realizado com sucesso! Você será redirecionado para fazer seu pedido.'
      );

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(clienteComId)
      );

      this.limparFormularioCadastro();

      this.router.navigate(['/cliente-pedidos']);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    }
  }

  limparFormularioCadastro() {
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
  }

  formatarTelefone() {
    let telefone = this.cadastroTelefone.replace(/\D/g, '');

    telefone = telefone.substring(0, 11);

    if (telefone.length <= 2) {
      this.cadastroTelefone = `(${telefone}`;
    } else if (telefone.length <= 7) {
      this.cadastroTelefone = `(${telefone.substring(0, 2)})${telefone.substring(2)}`;
    } else {
      this.cadastroTelefone = `(${telefone.substring(0, 2)})${telefone.substring(2, 7)}-${telefone.substring(7)}`;
    }
  }

  emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  senhaValida(senha: string): boolean {
    const temMinimo6 = senha.length >= 6;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temEspecial = /[^A-Za-z0-9]/.test(senha);

    return temMinimo6 && temMaiuscula && temEspecial;
  }

  voltarHome() {
    this.router.navigate(['/home']);
  }
}