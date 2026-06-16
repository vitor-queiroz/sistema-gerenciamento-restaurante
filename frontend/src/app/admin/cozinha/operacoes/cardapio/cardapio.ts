import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, addDoc, doc, getDoc} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.css',
})
export class Cardapio {

  produtos: any[] = [];

  mesaId= '';
  mesa: any = null;

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef, private route: ActivatedRoute){

    this.mesaId = this.route.snapshot.paramMap.get('mesaId') || '';

    this.carregarProdutos();
    this.carregarMesa();
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

  async carregarMesa() {
  const mesaRef = doc(this.firestore, 'mesas', this.mesaId);

  const snapshot = await getDoc(mesaRef);

  if (snapshot.exists()) {
    this.mesa = {
      id: snapshot.id,
      ...snapshot.data()
    };
  }

  this.cdr.detectChanges();
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
    aumentarQuantidade(item: any){item.quantidade++;
      this.cdr.detectChanges();
    }

    diminuirQuantidade(item: any){

  if(item.quantidade > 1){item.quantidade--;}
   else {
    this.carrinho = this.carrinho.filter(
      produto => produto.id !== item.id
    );
  }

  this.cdr.detectChanges();
}

  //MANDAR PEDIDO PARA A COZINHAAA(NO CASO COMP. PEDIDOS)
  async enviarParaCozinha() {
  if (this.carrinho.length === 0) {
    alert('Adicione pelo menos um item ao pedido');
    return;
  }

  if (!this.mesa){
          alert('Adicione pelo menos um item ao pedido');
      return;
  }

  const pedidosRef = collection(this.firestore, 'pedidos');

  await addDoc(pedidosRef, {
    mesaId: this.mesaId,
    numeroMesa: this.mesa.numero,
    cliente: this.mesa.cliente,
    itens: this.carrinho,
    total: this.calcularTotal(),
    status: 'Recebido',
    origem: 'Mesa',
    criadoEm: new Date()
  });

  this.carrinho = [];
  this.cdr.detectChanges();

  alert('Pedido enviado para a cozinha!');
    this.cdr.detectChanges();

}
}
