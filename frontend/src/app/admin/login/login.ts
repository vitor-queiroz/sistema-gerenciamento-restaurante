import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from '@angular/fire/firestore';

import { hashSenha, SENHA_PADRAO } from '../../shared/utils/senha.util';
import { AuthService, UsuarioLogado } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  senha = '';
  carregando = false;

  constructor(private firestore: Firestore, private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  async entrar() {

    if (!this.email || !this.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }

    this.carregando = true;

    let mensagemErro = '';
    let usuarioLogado: UsuarioLogado | null = null;
    let destino = '';

    try {

      const snap = await getDocs(
        query(collection(this.firestore, 'funcionarios'), where('email', '==', this.email))
      );

      if (snap.empty) {
        mensagemErro = 'E-mail ou senha inválidos';
      } else {

        const funcionario: any = { id: snap.docs[0].id, ...snap.docs[0].data() };

        if (!funcionario.senha) {

          if (this.senha !== SENHA_PADRAO) {
            mensagemErro = `Este usuário ainda não tem senha. Use a senha temporária "${SENHA_PADRAO}".`;
          } else {
            const senhaHash = await hashSenha(SENHA_PADRAO);
            await updateDoc(doc(this.firestore, 'funcionarios', funcionario.id), { senha: senhaHash });
          }

        } else {

          const hash = await hashSenha(this.senha);
          if (hash !== funcionario.senha) {
            mensagemErro = 'E-mail ou senha inválidos';
          }
        }

        if (!mensagemErro && funcionario.status === 'Pendente') {
          mensagemErro = 'Seu acesso está pendente de aprovação pelo gerente.';
        }

        if (!mensagemErro) {
          usuarioLogado = {
            id: funcionario.id,
            nome: funcionario.nome,
            email: funcionario.email,
            status: funcionario.status,
            estoque: !!funcionario.estoque,
            pedidos: !!funcionario.pedidos,
            cliente: !!funcionario.cliente,
            garcom: !!funcionario.garcom,
            esg: !!funcionario.esg
          };

          const isAdmin = funcionario.email === 'admin@123.com' || funcionario.nome === 'Administrador';
          const rotaAtual = this.router.url;

          destino = rotaAtual.includes('/operacoes')
            ? '/admin/cozinha/operacoes'
            : isAdmin ? '/admin/cozinha/gerente' : '/admin/cozinha/operacoes';
        }
      }

    if (mensagemErro) {
      alert(mensagemErro);
      this.carregando = false;
      return;

    }if (usuarioLogado) {
      this.auth.login(usuarioLogado);
      await this.router.navigate([destino]);
      return;  
    }

  } catch (e) {
      console.error('Erro no login:', e);
      mensagemErro = 'Erro ao tentar fazer login. Tente novamente.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }  }
}