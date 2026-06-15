import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot
} from '@angular/fire/firestore';

interface Prato {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
}

interface ItemCarrinho {
  prato: Prato;
  quantidade: number;
}

interface PassoStatus {
  chave: string;
  label: string;
  icone: string;
}

const PASSOS: PassoStatus[] = [
  { chave: 'Recebido', label: 'Recebido', icone: '🧾' },
  { chave: 'Preparando', label: 'Em preparo', icone: '👨‍🍳' },
  { chave: 'Pronto para entrega', label: 'Saiu p/ entrega', icone: '🛵' },
  { chave: 'Entregue', label: 'Entregue', icone: '✅' }
];

@Component({
  selector: 'app-cliente-pedidos',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cliente-pedidos.html',
  styleUrl: './cliente-pedidos.css',
})
export class ClientePedidos implements OnInit, OnDestroy {
  carrinho: ItemCarrinho[] = [];
  usuarioLogado: any = null;

  pratos: Prato[] = [];

  formaPagamentoDelivery = '';
  taxaEntrega = 8;
  mostrarCarrinho = true;

  // ---------- Acompanhamento de pedidos ----------

  passos = PASSOS;

  meusPedidos: any[] = [];
  mostrarPedidos = false;
  abaPedidos: 'andamento' | 'historico' = 'andamento';

  private cancelarListenerPedidos: (() => void) | null = null;

  constructor(private router: Router, private firestore: Firestore, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogado');

    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    } else {
      this.router.navigate(['/cliente-login']);
      return;
    }

    await this.carregarProdutos();
    this.observarMeusPedidos();
  }

  ngOnDestroy() {
    if (this.cancelarListenerPedidos) {
      this.cancelarListenerPedidos();
    }
  }

  async carregarProdutos() {
    const produtosRef = collection(this.firestore, 'produtos');
    const snapshot = await getDocs(produtosRef);

    console.log('Produtos encontrados', snapshot.docs.length);

    this.pratos = snapshot.docs.map((item: any) => {
      const dados = item.data();

      return {
        id: item.id,
        nome: dados.nome,
        preco: dados.preco,
        descricao: dados.descricao,
        imagem: dados.imagem
      };
    });

    console.log('Lista de pratos: ', this.pratos);
    this.cdr.detectChanges();
  }

  // ---------- Acompanhamento de pedidos ----------

  /**
   * Escuta em tempo real todos os pedidos feitos pelo telefone do
   * cliente logado. Qualquer mudança de status feita pela cozinha
   * ou pelo garçom aparece automaticamente aqui.
   */
  observarMeusPedidos() {

    if (!this.usuarioLogado?.telefone) {
      return;
    }

    const pedidosRef = collection(this.firestore, 'pedidos');
    const consulta = query(pedidosRef, where('telefone', '==', this.usuarioLogado.telefone));

    this.cancelarListenerPedidos = onSnapshot(consulta, (snapshot) => {

      const pedidos = snapshot.docs.map(item => {
        const dados: any = item.data();

        return {
          id: item.id,
          ...dados,
          passoAtual: this.obterPassoAtual(dados.status)
        };
      });

      // Mais recentes primeiro
      this.meusPedidos = pedidos.sort((a: any, b: any) => {
        const dataA = a.criadoEm?.toDate ? a.criadoEm.toDate().getTime() : 0;
        const dataB = b.criadoEm?.toDate ? b.criadoEm.toDate().getTime() : 0;
        return dataB - dataA;
      });

      this.cdr.detectChanges();

    }, (erro) => {
      console.error('Erro ao acompanhar pedidos:', erro);
    });
  }

  obterPassoAtual(status: string): number {
    switch (status) {
      case 'Recebido':
        return 0;
      case 'Preparando':
        return 1;
      case 'Pronto para entrega':
        return 2;
      case 'Entregue':
      case 'Pago':
      case 'Finalizado':
        return 3;
      default:
        return 0;
    }
  }

  /** Texto amigável exibido nos cards do histórico (pedidos já concluídos). */
  labelStatusFinal(status: string): string {
    if (status === 'Pago') return 'Pago';
    if (status === 'Finalizado') return 'Finalizado';
    return 'Entregue';
  }

  /** Pedidos que ainda não chegaram ao cliente (para o badge do botão e a aba "Em andamento"). */
  get pedidosEmAndamento(): any[] {
    return this.meusPedidos.filter(p => p.passoAtual < 3);
  }

  /** Pedidos já entregues/pagos/finalizados — histórico do cliente. */
  get pedidosFinalizados(): any[] {
    return this.meusPedidos.filter(p => p.passoAtual >= 3);
  }

  /** Quantidade de pedidos em andamento (para o badge do botão). */
  get pedidosAtivos(): number {
    return this.pedidosEmAndamento.length;
  }

  togglePedidos() {
    this.mostrarPedidos = !this.mostrarPedidos;

    if (this.mostrarPedidos) {
      this.mostrarCarrinho = false;
    }
  }

  toggleCarrinho() {
    this.mostrarCarrinho = !this.mostrarCarrinho;

    if (this.mostrarCarrinho) {
      this.mostrarPedidos = false;
    }
  }

  trocarAbaPedidos(aba: 'andamento' | 'historico') {
    this.abaPedidos = aba;
  }

  formatarHora(timestamp: any): string {
    if (!timestamp) return '';

    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarData(timestamp: any): string {
    if (!timestamp) return '';

    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${dataFormatada} às ${horaFormatada}`;
  }

  // ---------- Carrinho ----------

  adicionarAoCarrinho(prato: Prato) {
    const itemExistente = this.carrinho.find(
      item => item.prato.id === prato.id
    );

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.carrinho.push({
        prato,
        quantidade: 1
      });
    }

    this.mostrarCarrinho = true;
    this.mostrarPedidos = false;
  }

  get totalCarrinho(): number {
    return this.carrinho.reduce(
      (total, item) => total + item.prato.preco * item.quantidade,
      0
    );
  }

  removerDoCarrinho(id: string) {
    this.carrinho = this.carrinho.filter(
      item => item.prato.id !== id
    );
  }

  aumentarQuantidade(id: string) {
    const item = this.carrinho.find(
      item => item.prato.id === id
    );

    if (item) {
      item.quantidade++;
    }
  }

  diminuirQuantidade(id: string) {
    const item = this.carrinho.find(
      item => item.prato.id === id
    );

    if (item && item.quantidade > 1) {
      item.quantidade--;
    }
  }

  async fazerPedido() {
    if (this.carrinho.length === 0) {
      alert('Adicione itens ao carrinho antes de fazer o pedido!');
      return;
    }
    if (!this.formaPagamentoDelivery) {
      alert('Selecione a forma de pagamento');
      return;
    }

    const pedidosRef = collection(this.firestore, 'pedidos');

    await addDoc(pedidosRef, {
      origem: 'delivery',

      cliente: this.usuarioLogado.nome,
      telefone: this.usuarioLogado.telefone,
      endereco: this.usuarioLogado.endereco,

      itens: this.carrinho.map(item => ({
        id: item.prato.id,
        nome: item.prato.nome,
        preco: item.prato.preco,
        quantidade: item.quantidade
      })),

      total: this.totalCarrinho,
      taxaEntrega: this.taxaEntrega,
      totalFinal: this.totalCarrinho + this.taxaEntrega,

      pagamento: {
        forma: this.formaPagamentoDelivery,
        subtotal: this.totalCarrinho,
        valorTaxaEntrega: this.taxaEntrega,
        valor: this.totalCarrinho + this.taxaEntrega,
        pagoEm: new Date()
      },

      status: 'Recebido',
      criadoEm: new Date()
    });

    alert('Pedido enviado para a cozinha!!');

    this.carrinho = [];
    this.formaPagamentoDelivery = '';

    // Abre o painel "Meus Pedidos" para o cliente já ver o status
    this.mostrarPedidos = true;

    this.cdr.detectChanges();
  }

  voltarHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/home']);
  }
}