import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';

import { AuthService } from '../../shared/services/auth.service';
import { hashSenha } from '../../shared/utils/senha.util';
import { Relatorios } from './relatorios/relatorios';

type Aba = 'usuarios' | 'mesas' | 'cardapio' | 'relatorios';

const MODULOS = ['cliente', 'pedidos', 'garcom', 'estoque', 'esg'] as const;

const LABEL_MODULO: Record<string, string> = {
  cliente: 'Cliente',
  pedidos: 'Cozinha',
  garcom: 'Garçom',
  estoque: 'Estoque',
  esg: 'ESG'
};

const ICONE_MODULO: Record<string, string> = {
  cliente: '🍴',
  pedidos: '🍳',
  garcom: '🛎️',
  estoque: '📦',
  esg: '🛡️'
};

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Relatorios],
  templateUrl: './gerente.html',
  styleUrl: './gerente.css',
})
export class Gerente implements OnInit {

  abaAtiva: Aba = 'usuarios';
  modulos = MODULOS;
  labelModulo = LABEL_MODULO;
  iconeModulo = ICONE_MODULO;

  carregando = true;

  usuarios: any[] = [];
  mesas: any[] = [];
  produtos: any[] = [];

  buscaUsuario = '';

  // ---------- Form usuário ----------
  mostrarFormUsuario = false;
  idUsuarioEditando: string | null = null;
  formUsuario = { nome: '', email: '', senha: '', gerente: false, permissoes: new Set<string>() };

  // ---------- Form mesa ----------
  mostrarFormMesa = false;
  idMesaEditando: string | null = null;
  novoNumeroMesa: number | null = null;

  // ---------- Form produto ----------
  mostrarFormProduto = false;
  idProdutoEditando: string | null = null;
  formProduto = { nome: '', preco: null as number | null, descricao: '', imagem: '', categoria: '' };

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.carregarTudo();
  }

  async carregarTudo() {
    this.carregando = true;
    await Promise.all([this.carregarUsuarios(), this.carregarMesas(), this.carregarProdutos()]);
    this.carregando = false;
    this.cdr.detectChanges();
  }

  trocarAba(aba: Aba) {
    this.abaAtiva = aba;
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/admin/cozinha']);
  }

  // ================= ESTATÍSTICAS =================

  get totalUsuarios(): number { return this.usuarios.length; }
  get totalAdmins(): number { return this.usuarios.filter(u => this.ehAdmin(u)).length; }
  get totalMesas(): number { return this.mesas.length; }
  get totalProdutos(): number { return this.produtos.length; }

  // ================= USUÁRIOS =================

  ehAdmin(usuario: any): boolean {
    return !!usuario.gerente || usuario.email === 'admin@123.com' || usuario.nome === 'Administrador';
  }

  cargoUsuario(usuario: any): { label: string; classe: string } {
    if (this.ehAdmin(usuario)) return { label: 'Admin', classe: 'badge-admin' };

    const ativos = MODULOS.filter(m => usuario[m]);

    if (ativos.length === 0) return { label: 'Sem acesso', classe: 'badge-sem-acesso' };
    if (ativos.length === 1) return { label: this.labelModulo[ativos[0]], classe: `badge-${ativos[0]}` };

    return { label: `${ativos.length} módulos`, classe: 'badge-multi' };
  }

  permissoesAtivas(usuario: any): string[] {
    return MODULOS.filter(m => usuario[m]);
  }

  iniciaisNome(nome: string): string {
    return (nome || '?').trim().charAt(0).toUpperCase();
  }

  get usuariosFiltrados(): any[] {
    const termo = this.buscaUsuario.trim().toLowerCase();
    if (!termo) return this.usuarios;

    return this.usuarios.filter(u =>
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo)
    );
  }

  async carregarUsuarios() {
    const snapshot = await getDocs(collection(this.firestore, 'funcionarios'));
    this.usuarios = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as any));
  }

  abrirFormNovoUsuario() {
    this.idUsuarioEditando = null;
    this.formUsuario = { nome: '', email: '', senha: '', gerente: false, permissoes: new Set() };
    this.mostrarFormUsuario = true;
  }

  abrirFormEditarUsuario(usuario: any) {
    this.idUsuarioEditando = usuario.id;
    this.formUsuario = {
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      gerente: !!usuario.gerente,
      permissoes: new Set(MODULOS.filter(m => usuario[m]))
    };
    this.mostrarFormUsuario = true;
  }

  cancelarFormUsuario() {
    this.mostrarFormUsuario = false;
    this.idUsuarioEditando = null;
  }

  togglePermissaoForm(modulo: string) {
    if (this.formUsuario.permissoes.has(modulo)) this.formUsuario.permissoes.delete(modulo);
    else this.formUsuario.permissoes.add(modulo);
  }

  async salvarUsuario() {
    if (!this.formUsuario.nome || !this.formUsuario.email) {
      alert('Preencha nome e e-mail.');
      return;
    }

    const permissoesObj: any = {};
    MODULOS.forEach(m => permissoesObj[m] = this.formUsuario.permissoes.has(m));

    if (this.idUsuarioEditando) {
      const dados: any = {
        nome: this.formUsuario.nome,
        email: this.formUsuario.email,
        gerente: this.formUsuario.gerente,
        ...permissoesObj
      };
      if (this.formUsuario.senha) dados.senha = await hashSenha(this.formUsuario.senha);
      await updateDoc(doc(this.firestore, 'funcionarios', this.idUsuarioEditando), dados);
    } else {
      if (!this.formUsuario.senha) {
        alert('Defina uma senha para o novo usuário.');
        return;
      }
      await addDoc(collection(this.firestore, 'funcionarios'), {
        nome: this.formUsuario.nome,
        email: this.formUsuario.email,
        senha: await hashSenha(this.formUsuario.senha),
        status: 'Ativo',
        gerente: this.formUsuario.gerente,
        dataCadastro: new Date(),
        ...permissoesObj
      });
    }

    this.mostrarFormUsuario = false;
    this.idUsuarioEditando = null;
    await this.carregarUsuarios();
    this.cdr.detectChanges();
  }

  async toggleAtivo(usuario: any) {
    const novoStatus = usuario.status === 'Ativo' ? 'Pendente' : 'Ativo';
    await updateDoc(doc(this.firestore, 'funcionarios', usuario.id), { status: novoStatus });
    await this.carregarUsuarios();
    this.cdr.detectChanges();
  }

  async redefinirSenhaUsuario(usuario: any) {
    const novaSenha = prompt(`Nova senha temporária para ${usuario.nome}:`, 'mudar123');
    if (!novaSenha) return;
    await updateDoc(doc(this.firestore, 'funcionarios', usuario.id), { senha: await hashSenha(novaSenha) });
    alert(`Senha redefinida! Informe ao usuário: "${novaSenha}"`);
  }

  async excluirUsuario(usuario: any) {
    if (!confirm(`Excluir o usuário "${usuario.nome}"?`)) return;
    await deleteDoc(doc(this.firestore, 'funcionarios', usuario.id));
    await this.carregarUsuarios();
    this.cdr.detectChanges();
  }

  // ================= MESAS =================

  async carregarMesas() {
    const snapshot = await getDocs(collection(this.firestore, 'mesas'));
    this.mesas = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() } as any))
      .sort((a, b) => (a.numero || 0) - (b.numero || 0));

    // Pré-carrega quais mesas têm pedidos ativos, para exibir o aviso
    // no card sem precisar de chamadas assíncronas dentro do template.
    const pedidosSnapshot = await getDocs(collection(this.firestore, 'pedidos'));
    const mesasComPedidoAtivo = new Set<string>();

    pedidosSnapshot.docs.forEach(item => {
      const dados: any = item.data();
      if (dados.status !== 'Pago' && dados.mesaId) {
        mesasComPedidoAtivo.add(dados.mesaId);
      }
    });

    this.mesas.forEach(mesa => {
      mesa.temPedidoAtivo = mesasComPedidoAtivo.has(mesa.id);
    });
  }

  abrirFormNovaMesa() {
    this.idMesaEditando = null;
    this.novoNumeroMesa = null;
    this.mostrarFormMesa = true;
  }

  abrirFormEditarMesa(mesa: any) {
    this.idMesaEditando = mesa.id;
    this.novoNumeroMesa = mesa.numero;
    this.mostrarFormMesa = true;
  }

  async salvarMesa() {
    if (!this.novoNumeroMesa || this.novoNumeroMesa <= 0) {
      alert('Informe um número de mesa válido.');
      return;
    }

    if (this.idMesaEditando) {
      await updateDoc(doc(this.firestore, 'mesas', this.idMesaEditando), { numero: this.novoNumeroMesa });
    } else {
      if (this.mesas.some(m => m.numero === this.novoNumeroMesa)) {
        alert(`Já existe uma mesa número ${this.novoNumeroMesa}.`);
        return;
      }
      await addDoc(collection(this.firestore, 'mesas'), {
        numero: this.novoNumeroMesa,
        status: 'Disponível',
        cliente: '',
        quantidadePessoas: 0
      });
    }

    this.mostrarFormMesa = false;
    this.idMesaEditando = null;
    this.novoNumeroMesa = null;
    await this.carregarMesas();
    this.cdr.detectChanges();
  }

  async excluirMesa(mesa: any) {
    if (mesa.status === 'Ocupada') {
      alert(`A mesa ${mesa.numero} está ocupada e não pode ser removida.`);
      return;
    }

    if (mesa.temPedidoAtivo) {
      alert(`A mesa ${mesa.numero} possui pedidos ativos e não pode ser removida.`);
      return;
    }

    if (!confirm(`Remover a mesa ${mesa.numero}?`)) return;

    await deleteDoc(doc(this.firestore, 'mesas', mesa.id));
    await this.carregarMesas();
    this.cdr.detectChanges();
  }

  // ================= CARDÁPIO / PRODUTOS =================

  async carregarProdutos() {
    const snapshot = await getDocs(collection(this.firestore, 'produtos'));
    this.produtos = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as any));
  }

  abrirFormNovoProduto() {
    this.idProdutoEditando = null;
    this.formProduto = { nome: '', preco: null, descricao: '', imagem: '', categoria: '' };
    this.mostrarFormProduto = true;
  }

  abrirFormEditarProduto(produto: any) {
    this.idProdutoEditando = produto.id;
    this.formProduto = {
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      imagem: produto.imagem,
      categoria: produto.categoria || ''
    };
    this.mostrarFormProduto = true;
  }

  cancelarFormProduto() {
    this.mostrarFormProduto = false;
    this.idProdutoEditando = null;
  }

  async salvarProduto() {
    if (!this.formProduto.nome || !this.formProduto.preco) {
      alert('Preencha nome e preço.');
      return;
    }

    if (this.idProdutoEditando) {
      await updateDoc(doc(this.firestore, 'produtos', this.idProdutoEditando), this.formProduto);
    } else {
      await addDoc(collection(this.firestore, 'produtos'), this.formProduto);
    }

    this.mostrarFormProduto = false;
    this.idProdutoEditando = null;
    await this.carregarProdutos();
    this.cdr.detectChanges();
  }

  async excluirProduto(produto: any) {
    if (!confirm(`Excluir o prato "${produto.nome}"?`)) return;
    await deleteDoc(doc(this.firestore, 'produtos', produto.id));
    await this.carregarProdutos();
    this.cdr.detectChanges();
  }
}