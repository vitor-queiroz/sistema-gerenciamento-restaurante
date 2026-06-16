import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido.html',
  styleUrl: './pedido.css',
})
export class Pedido implements OnDestroy {
  pedidos: any[] = [];

  intervaloTempo: any;

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarPedidos();

    this.intervaloTempo = setInterval(() => {
      this.cdr.detectChanges();
    }, 60000);
  }


  //VEM UM POUR AQUI 
  async carregarPedidos() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    const snapshot = await getDocs(pedidosRef);

    this.pedidos = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }))

      .filter((pedido: any) =>
        pedido.status === 'Recebido' ||
        pedido.status === 'Preparando' ||
        pedido.status === 'Finalizado');

    this.cdr.detectChanges();
  }


  //AQUI JA É OUTRO 
  async atualizarStatus(id: string, status: string) {
    const pedidoDoc = doc(this.firestore, 'pedidos', id);

    const dadosAtualizados: any = { status: status };

    if (status === 'Finalizado') {
      dadosAtualizados.finalizadoEm = new Date();
    }

    if (status === 'Pronto para entrega') {
      dadosAtualizados.prontoEm = new Date();
    }

    await updateDoc(pedidoDoc, dadosAtualizados);

    if (status === 'Pronto para entrega') {
      this.pedidos = this.pedidos.filter((pedido: any) => pedido.id !== id);
    } else {
      this.pedidos = this.pedidos.map((pedido: any) =>
        pedido.id === id ? { ...pedido, ...dadosAtualizados } : pedido
      );
    }

    this.cdr.detectChanges();

    console.log('Status atualizado!');
  }



  //aqui vai uma ideia maluca que eu "tentei aplicar"
  producaoPrioritaria() {
    const agrupados: any[] = [];

    this.pedidos.forEach(pedido => {
      if (pedido.status === 'Finalizado') return;
      if (!pedido.itens) return;

      pedido.itens.forEach((item: any) => {
        const existente = agrupados.find(p => p.nome === item.nome);

        if (existente) {
          existente.quantidade += item.quantidade;
        } else {
          agrupados.push({
            nome: item.nome,
            quantidade: item.quantidade
          });
        }
      });
    });

    return agrupados.filter(item => item.quantidade >= 3);
  }

  mostrarHorarioPedido(criadoEm: any) {
    if (!criadoEm) return '';

    const data = criadoEm.toDate();

    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularMinutosPedido(pedido: any) {
    if (!pedido.criadoEm) return '';

    const inicio = pedido.criadoEm.toDate()
      ? pedido.criadoEm.toDate()
      : new Date(pedido.criadoEm);

    let fim = new Date();

    if (pedido.status === 'Finalizado' && pedido.finalizadoEm) {

      fim = pedido.finalizadoEm.toDate
        ? pedido.finalizadoEm.toDate()
        : new Date(pedido.finalizadoEm);
    }


    const diferenca = fim.getTime() - inicio.getTime();
    return Math.floor(diferenca / 60000);

  }


  verificarUrgenciaPedido(pedido: any) {
    const minutos = this.calcularMinutosPedido(pedido);

    if (minutos === '') return '';

    if (minutos < 10) return 'pedido-recente';

    if (minutos <= 15) return 'pedido-atencao';

    return 'pedido-atrasado';
  }

  ngOnDestroy() {
    if (this.intervaloTempo) {
      clearInterval(this.intervaloTempo);
    }
  }


  async marcarProntoParaEntrega(id: string) {
    const pedidoDoc = doc(this.firestore, 'pedidos', id);

    await updateDoc(pedidoDoc, {
      status: 'Pronto para entrega',
      prontoEm: new Date()
    });

    this.pedidos = this.pedidos.filter((pedido: any) => pedido.id !== id);

    this.cdr.detectChanges();
  }
}
