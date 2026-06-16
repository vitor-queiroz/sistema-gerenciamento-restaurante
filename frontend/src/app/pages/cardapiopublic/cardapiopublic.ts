import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

interface Prato {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
}

@Component({
  selector: 'app-cardapio-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cardapiopublic.html',
  styleUrl: './cardapiopublic.css',
})
export class CardapioPublic implements OnInit {
  pratos: Prato[] = [];

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.carregarProdutos();
  }

  async carregarProdutos() {
    const produtosRef = collection(this.firestore, 'produtos');
    const snapshot = await getDocs(produtosRef);

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

    this.cdr.detectChanges();
  }
}