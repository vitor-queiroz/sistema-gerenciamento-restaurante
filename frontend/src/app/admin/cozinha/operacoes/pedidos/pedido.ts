import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido.html',
  styleUrl: './pedido.css',
})
export class Pedido {
  pedidos: any[] = [];

  constructor(private firestore: Firestore,private cdr: ChangeDetectorRef){
    this.carregarPedidos();
  }

  
  //VEM UM POUR AQUI 
  async carregarPedidos() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    const snapshot = await getDocs(pedidosRef);

    this.pedidos = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    this.cdr.detectChanges();
  }

  
  //AQUI JA É OUTRO 
  async atualizarStatus(id: string, status: string) {
    const pedidoDoc = doc(this.firestore, 'pedidos', id);

    await updateDoc(pedidoDoc, {
      status: status
    });

    await this.carregarPedidos();

    alert('Status do pedido atualizado!');
  }
}
