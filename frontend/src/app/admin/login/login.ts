import { Component } from '@angular/core';
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

  constructor(
    private firestore: Firestore,
    private router: Router,
    private auth: AuthService
  ) {}

  async entrar() {

    if (!this.email || !this.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }

    this.carregando = true;

    try {

      const funcionariosRef = collection(this.firestore, 'funcionarios');
      const consulta = query(funcionariosRef, where('email', '==', this.email));
      const snapshot = await getDocs(consulta);

      if (snapshot.empty) {
        alert('E-mail ou senha inválidos');
        return;
      }

      const docSnap = snapshot.docs[0];
      const funcionario: any = { id: docSnap.id, ...docSnap.data() };


      // ---------- Verificação de senha ----------

      if (!funcionario.senha) {


        // Funcionário cadastrado antes de existir o campo senha.
        // Primeiro acesso precisa ser feito com a senha temporária padrão.
        if (this.senha !== SENHA_PADRAO) {
          alert(
            `Este usuário ainda não tem uma senha definida. ` +
            `Use a senha temporária "${SENHA_PADRAO}" para o primeiro acesso.`
          );
          return;
        }

        // Login com a senha temporária: já grava o hash dela como senha
        // definitiva, para que da próxima vez a verificação normal funcione.
        const senhaHash = await hashSenha(SENHA_PADRAO);
        const funcionarioDoc = doc(this.firestore, 'funcionarios', funcionario.id);
        await updateDoc(funcionarioDoc, { senha: senhaHash });

      } else {

        const senhaDigitadaHash = await hashSenha(this.senha);

        if (senhaDigitadaHash !== funcionario.senha) {
          alert('E-mail ou senha inválidos');
          return;
        }
      }

      // ---------- Verificação de status ----------

      if (funcionario.status === 'Pendente') {
        alert('Seu acesso ainda está pendente de aprovação pelo gerente.');
        return;
      }

      // ---------- Sessão / permissões ----------

      const usuarioLogado: UsuarioLogado = {
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

      this.auth.login(usuarioLogado);

      // ---------- Redirecionamento ----------

      // TODO: enquanto não existir um campo de "cargo"/"tipo" no cadastro,
      // o e-mail/nome do administrador continua sendo o critério para
      // entrar na área de gerente. Demais funcionários vão para operações.
      if (funcionario.email === 'admin@123.com' || funcionario.nome === 'Administrador') {
        this.router.navigate(['/admin/cozinha/gerente']);
      } else {
        this.router.navigate(['/admin/cozinha/operacoes']);
      }

    } catch (erro) {
      alert('Erro ao tentar fazer login. Tente novamente.');
    } finally {
      this.carregando = false;
    }
  }
}