import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Firestore, collection, getDocs, addDoc } from '@angular/fire/firestore';

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

@Component({
  selector: 'app-cliente-pedidos',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cliente-pedidos.html',
  styleUrl: './cliente-pedidos.css',
})
export class ClientePedidos implements OnInit {
  carrinho: ItemCarrinho[] = [];
  usuarioLogado: any = null;

  pratos: Prato[] = [];

  formaPagamentoDelivery = '';
  taxaEntrega = 8;

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

    const pedidoCriado = await addDoc(pedidosRef, {
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
    this.cdr.detectChanges();

    this.router.navigate(['/cliente-acompanhamento', pedidoCriado.id]);
  }

  voltarHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/home']);
  }
}