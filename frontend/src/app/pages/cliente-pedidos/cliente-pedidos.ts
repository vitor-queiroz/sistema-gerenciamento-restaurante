import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import {Firestore, collection, getDocs} from '@angular/fire/firestore';

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

  constructor( private router: Router, private firestore: Firestore, private cdr: ChangeDetectorRef) {}

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

  fazerPedido() {
    if (this.carrinho.length === 0) {
      alert('Adicione itens ao carrinho antes de fazer o pedido!');
      return;
    }

    const pedido = {
      id: Date.now(),
      cliente: this.usuarioLogado,
      itens: this.carrinho,
      total: this.totalCarrinho,
      status: 'Recebido',
      dataPedido: new Date().toLocaleString('pt-BR'),
      dataEntrega: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString('pt-BR')
    };

    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');

    pedidos.push(pedido);

    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    console.log('Pedido realizado:', pedido);

    alert(
      `Pedido realizado com sucesso! Número do pedido: ${pedido.id}\nTempo estimado: 1 hora`
    );

    this.carrinho = [];

    this.router.navigate(['/cliente-acompanhamento', pedido.id]);
  }

  voltarHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/home']);
  }
}