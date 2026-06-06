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

    const dadosAtualizados: any ={status: status};
    
    if(status === 'Finalizado'){
      dadosAtualizados.finalizadoEm = new Date();
    }
    
    await updateDoc(pedidoDoc, dadosAtualizados); 
    await this.carregarPedidos();
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

      const inicio = pedido.criadoEm.toDate();

      let fim = new Date();
        if(pedido.status === 'Finalizado' && pedido.finalizadoEm){

          fim= pedido.finalizadoEm.toDate();
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
}
