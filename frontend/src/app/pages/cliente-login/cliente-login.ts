import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-cliente-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
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

  constructor(private router: Router, private firestore: Firestore) {}

  trocarAba(aba: 'login' | 'cadastro') {
    this.abaSelecionada = aba;
  }

  async entrar() {
    if (!this.loginEmail || !this.loginSenha) {
      alert('Por favor, preencha email e senha');
      return;
    }

    try {
      const clientesRef = collection(this.firestore, 'clientes');
      const q = query(
        clientesRef,
        where('email', '==', this.loginEmail),
        where('senha', '==', this.loginSenha)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const clienteDoc = querySnapshot.docs[0];
        const clienteEncontrado = { id: clienteDoc.id, ...clienteDoc.data() };

        console.log('Cliente logado com sucesso:', clienteEncontrado);
        localStorage.setItem('usuarioLogado', JSON.stringify(clienteEncontrado));
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

    if (this.cadastroSenha !== this.cadastroConfirmaSenha) {
      alert('As senhas não conferem');
      return;
    }

    try {
      // Verificar se email já existe no Firestore
      const clientesRef = collection(this.firestore, 'clientes');
      const q = query(clientesRef, where('email', '==', this.cadastroEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('Este email já está cadastrado');
        return;
      }

      // Criar novo cliente
      const novoCliente = {
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

      // Salvar no Firestore
      const docRef = await addDoc(clientesRef, novoCliente);
      const clienteComId = { id: docRef.id, ...novoCliente };

      console.log('Cliente cadastrado com sucesso:', clienteComId);
      alert('Cadastro realizado com sucesso! Você será redirecionado para fazer seu pedido.');

      localStorage.setItem('usuarioLogado', JSON.stringify(clienteComId));

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

      this.router.navigate(['/cliente-pedidos']);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    }
  }

  voltarHome() {
    this.router.navigate(['/home']);
  }
}