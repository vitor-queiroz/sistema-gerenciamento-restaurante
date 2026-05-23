import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})

export class Produtos {

  nome = '';
  preco = 0;

  constructor(private firestore: Firestore) {}

  async salvarProduto() {

    const produtosRef = collection(this.firestore, 'produtos');

    await addDoc(produtosRef, {
      nome: this.nome,
      preco: this.preco
    });

    alert('Produto salvo com sucesso!');
  }
}