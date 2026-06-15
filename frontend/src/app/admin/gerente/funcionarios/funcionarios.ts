import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

import { hashSenha, SENHA_PADRAO } from '../../../shared/utils/senha.util';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.css',
})

export class Funcionarios {

  nome = '';
  email = '';
  senha = '';

  idFuncionarioEditando = '';

  funcionarios: any[] = [];

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarFuncionarios();
  }

  async carregarFuncionarios() {

    const funcionarioRef = collection(this.firestore, 'funcionarios');

    const snapshot = await getDocs(funcionarioRef);

    this.funcionarios = snapshot.docs.map((item: any) => {

      const dados = item.data();

      return {
        id: item.id,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha || null
      }
    })

    this.cdr.detectChanges();
  }

  async salvarFuncionario() {

    if (!this.nome || !this.email) {

      alert('Preencha todos os campos');
      return;
    }

    // ---------- EDIÇÃO ----------
    if (this.idFuncionarioEditando) {

      const funcionarioDoc = doc(this.firestore, 'funcionarios', this.idFuncionarioEditando);

      const dadosAtualizados: any = {
        nome: this.nome,
        email: this.email
      };

      // Senha só é alterada se o gerente digitar algo no campo.
      // Se ficar em branco, mantém a senha que já estava salva.
      if (this.senha) {
        dadosAtualizados.senha = await hashSenha(this.senha);
      }

      await updateDoc(funcionarioDoc, dadosAtualizados);

      this.idFuncionarioEditando = '';

      await this.carregarFuncionarios();
      this.cdr.detectChanges();

      this.nome = '';
      this.email = '';
      this.senha = '';

      alert('Funcionário atualizado com sucesso!');
      return;
    }

    // ---------- CADASTRO NOVO ----------

    if (!this.senha) {
      alert('Defina uma senha para o novo funcionário');
      return;
    }

    const senhaHash = await hashSenha(this.senha);

    const funcionarioRef = collection(this.firestore, 'funcionarios');

    await addDoc(funcionarioRef, {
      nome: this.nome,
      email: this.email,
      senha: senhaHash,
      status: 'Pendente',
      estoque: false,
      pedidos: false,
      cliente: false,
      garcom: false,
      esg: false,
      dataCadastro: new Date()
    });

    await this.carregarFuncionarios();
    this.cdr.detectChanges();

    this.nome = '';
    this.email = '';
    this.senha = '';

    alert('Funcionário cadastrado com sucesso!')
  }

  editarFuncionario(funcionario: any) {

    this.nome = funcionario.nome;
    this.email = funcionario.email;
    this.senha = ''; // nunca preenche a senha automaticamente

    this.idFuncionarioEditando = funcionario.id;
  }

  cancelarEdicao() {
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.idFuncionarioEditando = '';
  }

  async excluirFuncionario(id: string) {

    const confirmar = confirm('Deseja realmente excluir este funcionário?');

    if (!confirmar) {
      return;
    }

    const funcionarioDoc = doc(this.firestore, 'funcionarios', id);

    await deleteDoc(funcionarioDoc);
    await this.carregarFuncionarios();
    this.cdr.detectChanges();

    alert('Funcionário excluído com sucesso!');
  }

  /**
   * Para funcionários cadastrados antes da senha existir (ou que
   * esqueceram a senha): define uma senha temporária padrão que
   * o gerente deve informar ao funcionário.
   */
  async redefinirSenha(funcionario: any) {

    const confirmar = confirm(
      `Redefinir a senha de "${funcionario.nome}" para a senha temporária "${SENHA_PADRAO}"?`
    );

    if (!confirmar) {
      return;
    }

    const senhaHash = await hashSenha(SENHA_PADRAO);

    const funcionarioDoc = doc(this.firestore, 'funcionarios', funcionario.id);

    await updateDoc(funcionarioDoc, { senha: senhaHash });

    await this.carregarFuncionarios();
    this.cdr.detectChanges();

    alert(`Senha redefinida! Informe ao funcionário a senha temporária: "${SENHA_PADRAO}"`);
  }

}