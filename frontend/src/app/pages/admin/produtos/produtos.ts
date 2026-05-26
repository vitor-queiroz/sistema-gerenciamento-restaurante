import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})

export class Produtos {

  nome = '';
  preco = 0;
  descricao= '';

  produtos: any[] = [];

   constructor(private firestore: Firestore) {

    this.carregarProdutos();

  }

  async carregarProdutos() {

    const produtosRef = collection(
      this.firestore,
      'produtos'
    );

    const snapshot = await getDocs(produtosRef);

    this.produtos = snapshot.docs.map((item: any) => {

      const dados = item.data();
      

      return{

      id: item.id,
      nome: dados.nome,
      preco: dados.preco,
      descricao: dados.descricao
      };
    });

  }

  async salvarProduto() {

    if(!this.nome || !this.preco || !this.descricao){

      alert('Preencha todos os campos');
      return;
    }

    const produtosRef = collection(
      this.firestore,
      'produtos'
    );

    await addDoc(produtosRef, {

      nome: this.nome,
      preco: this.preco,
      descricao: this.descricao

    });

    await this.carregarProdutos();

    alert('Produto salvo com sucesso!');

    this.nome = '';
    this.preco = 0;
    this.descricao = '';

  }

  async excluirProduto(id: string) {

    const produtoDoc = doc(
      this.firestore,
      'produtos',
      id
    );

    await deleteDoc(produtoDoc);

    await this.carregarProdutos();

  }

  async editarProduto(produto: any) {

    const novoNome = prompt(
      'Novo nome do produto',
      produto.nome
    );

    if (!novoNome) return;

    const produtoDoc = doc(
      this.firestore,
      'produtos',
      produto.id
    );

    await updateDoc(produtoDoc, {

      nome: novoNome

    });

    await this.carregarProdutos();

  }

}