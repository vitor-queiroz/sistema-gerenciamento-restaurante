import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-garcom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './garcom.html',
  styleUrl: './garcom.css',
})
export class Garcom {

  pedidos: any[] = [];
  historicoPedidos: any[] = [];

  mostrarHistorico = false;


  formaPagamento = '';

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarPedidos();
  }

  async carregarPedidos() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    const snapshot = await getDocs(pedidosRef);

    const todosPedidos = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));

    this.pedidos = todosPedidos.filter((pedido: any) =>
      pedido.status === 'Pronto para entrega' || pedido.status === 'Entregue');
    
    this.historicoPedidos = todosPedidos.filter((pedido: any) =>
      pedido.status === 'Pago');

            this.cdr.detectChanges();
  }

  async marcarComoEntregue(id: string) {
    const pedidoDoc = doc(this.firestore, 'pedidos', id);

        await updateDoc(pedidoDoc, {
        status: 'Entregue',
        entregueEm: new Date()
    });

       await this.carregarPedidos();
       this.cdr.detectChanges();
  }


      selecionarFormaPagamento(pedido: any, forma: string) {
      pedido.formaPagamento = forma;
      this.cdr.detectChanges();
  }


  async finalizarPagamento(pedido: any) {
    if (!pedido.formaPagamento) {
      alert('Selecione a forma de pagamento');
      return;
    }

    const pedidoDoc = doc(this.firestore, 'pedidos', pedido.id);

    await updateDoc(pedidoDoc, {
      status: 'Pago',
      pagamento: {
        forma: pedido.formaPagamento,
        valor: pedido.total,
        dividido: false,
        pagoEm: new Date()
      }
    });

    await this.carregarPedidos();
    this.cdr.detectChanges();

    alert('Pagamento registrado com sucesso!');
  }

    //aqui alterna a visualização do histórico de pagamentos
   alternarHistorico() {
    this.mostrarHistorico = !this.mostrarHistorico;

    this.cdr.detectChanges();
  }
}
