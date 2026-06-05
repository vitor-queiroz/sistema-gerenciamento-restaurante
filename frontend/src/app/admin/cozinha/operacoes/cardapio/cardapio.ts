import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.css',
})
export class Cardapio {

  produtos: any[] = [];

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef, private router: Router){
    this.carregarProdutos();
  }

  async carregarProdutos(){

    const produtosRef = collection(this.firestore, 'produtos');

    const snapshot = await getDocs(produtosRef);

    this.produtos = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    this.cdr.detectChanges();

    console.log(this.produtos);
  }

  // parteee do CARRINHOO
  carrinho: any[] = [];   

  adicionarAoPedido(produto: any) {
  const itemExistente = this.carrinho.find(item => item.id === produto.id);

  if (itemExistente) {itemExistente.quantidade++;}
   else { this.carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    });
  }
    this.cdr.detectChanges();
}

    calcularTotal() {
      return this.carrinho.reduce((total, item) => {
        return total + item.preco * item.quantidade;}, 0);
}

//PARTE DO AUMENTAR E DIMINUIR OS ITENS DO CARRINHOO
    aumentarQuantidade(item: any){item.quantidade++;}

    diminuirQuantidade(item: any){

  if(item.quantidade > 1){item.quantidade--;}
   else {
    this.carrinho = this.carrinho.filter(
      produto => produto.id !== item.id
    );
  }

  this.cdr.detectChanges();
}
}
