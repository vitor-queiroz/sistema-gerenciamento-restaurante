import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
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

    const produtosRef = collection(this.firestore, 'produtos');

      collectionData(produtosRef, {
        idField: 'id'
      }). subscribe((dados) => {

          this.produtos = dados;
      });

    }

      
      async salvarProduto() {

    const produtosRef = collection(this.firestore, 'produtos');

    await addDoc(produtosRef, {
      nome: this.nome,
      preco: this.preco,
      descricao: this.descricao
    });

    alert('Produto salvo com sucesso!');
        this.nome = '';
        this.preco = 0;
        this.descricao = '';


  }


      async excluirProduto(id: string){

        const produtoDoc= doc(
          this.firestore, 'produtos', id);
      
            await deleteDoc(produtoDoc); /* PARTE DE EXCLUIR PRODUTOS*/
        }

      async editarProduto(produto: any){

          const novoNome = prompt('Novo nome do produto', produto.nome); /* Esse (prompt) é uma função que abre uma "caixinha" no navegador pedindo uma informação pro usuário*/
      
          if(!novoNome) return;

          const produtoDoc = doc(this.firestore, 'produtos', produto.id);

          await updateDoc(produtoDoc, {
            nome: novoNome
          });
          
        }    
        }