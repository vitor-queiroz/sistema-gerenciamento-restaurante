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

  formaPagamentoParcial = '';
  valorPagamentoParcial: number | null = null;
  pagamentosParciais: any[] = [];

  processandoPagamento = false;

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarPedidos();
  }

  async carregarPedidos() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    const snapshot = await getDocs(pedidosRef);

    const todosPedidos = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));

    this.pedidos = todosPedidos.filter((pedido: any) =>
      pedido.status === 'Pronto para entrega' || pedido.status === 'Entregue')
      .map((pedido: any) => ({ ...pedido, incluirTaxaGarcom: true }));

    this.historicoPedidos = todosPedidos.filter((pedido: any) =>
      pedido.status === 'Pago');

    console.log('Histórico completo:', this.historicoPedidos);
    console.log('Histórico filtrado:', this.historicoFiltrado());

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
      origem: pedido.origem || 'presencial',
      pagamento: {
        forma: pedido.formaPagamento,
        valor: this.calcularTotalFinal(pedido),
        subtotal: pedido.total,
        taxaGarcomIncluida: pedido.incluirTaxaGarcom,
        valorTaxaGarcom: this.calcularTaxaGarcom(pedido),
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

  //''METODO'' DE PAGAMENTO (DIVISAO)

  adicionarPagamentoParcial(pedido: any) {
    if (!this.formaPagamentoParcial || this.valorPagamentoParcial === null) {
      alert('Informe a forma e o valor do pagamento');
      return;
    }

    if (this.valorPagamentoParcial <= 0) {
      alert('O valor precisa ser maior que zero');
      return;
    }

    const restante = this.calcularRestante(pedido);

    if (this.valorPagamentoParcial > restante) {
      alert('O valor informado é maior que o restante da conta');
      return;
    }

    this.pagamentosParciais.push({
      forma: this.formaPagamentoParcial,
      valor: this.valorPagamentoParcial
    });

    this.formaPagamentoParcial = '';
    this.valorPagamentoParcial = null;

    this.cdr.detectChanges();
  }

  calcularTotalPago() {
    return this.pagamentosParciais.reduce((total, pagamento) => {
      return total + pagamento.valor;
    }, 0);
  }

  calcularRestante(pedido: any) {
    return this.calcularTotalFinal(pedido) - this.calcularTotalPago();
  }

  //AQUI VAI SER PARA APENAS ABRIR O PAGAM
  mostrarPagamentoDividido = false;

  alternarPagamentoDividido() {
    this.mostrarPagamentoDividido = !this.mostrarPagamentoDividido;
    this.cdr.detectChanges();
  }

  //UMA IDEIA QUE EU ADICIONEI AQUI PARA A FINALIZAÇÃO DE CONTAS COMPARTILHADAS
  finalizarRestante(pedido: any) {
    if (!this.formaPagamentoParcial) {
      alert('Selecione a forma de pagamento');
      return;
    }

    const restante = this.calcularRestante(pedido);

    if (restante <= 0) {
      alert('A conta já está quitada');
      return;
    }

    this.pagamentosParciais.push({
      forma: this.formaPagamentoParcial,
      valor: restante
    });

    this.formaPagamentoParcial = '';
    this.valorPagamentoParcial = null;

    this.cdr.detectChanges();
  }



  async finalizarPagamentoDividido(pedido: any) {
    const restante = Number(this.calcularRestante(pedido).toFixed(2));

    if (restante > 0) {
      alert('Ainda existe valor restante para pagar');
      return;
    }

    this.processandoPagamento = true;
    this.cdr.detectChanges();

    const pedidoDoc = doc(this.firestore, 'pedidos', pedido.id);

    await updateDoc(pedidoDoc, {
      status: 'Pago',
      origem: pedido.origem || 'presencial',
      pagamento: {
        forma: 'Dividido',
        valor: this.calcularTotalFinal(pedido),
        subtotal: pedido.total,
        taxaGarcomIncluida: pedido.incluirTaxaGarcom,
        valorTaxaGarcom: this.calcularTaxaGarcom(pedido),
        dividido: true,
        pagamentos: this.pagamentosParciais,
        pagoEm: new Date()
      }
    });

    this.pagamentosParciais = [];
    this.formaPagamentoParcial = '';
    this.valorPagamentoParcial = null;
    this.mostrarPagamentoDividido = false;

    await this.carregarPedidos();

    this.processandoPagamento = false;
    this.cdr.detectChanges();

    alert('Pagamento dividido registrado com sucesso!');
  }



  incluirTaxaGarcom = true;

  calcularTaxaGarcom(pedido: any) {
    if (!pedido.incluirTaxaGarcom) {
      return 0;
    }

    return pedido.total * 0.10;
  }

  calcularTotalFinal(pedido: any) {
    return pedido.total + this.calcularTaxaGarcom(pedido);
  }



  filtroHistorico = 'presencial';

  historicoFiltrado() {
    return this.historicoPedidos.filter((pedido: any) => {
      const origem = (pedido.origem || '').toLowerCase().trim();

      if (this.filtroHistorico === 'presencial') {
        return origem !== 'delivery';
      }

      if (this.filtroHistorico === 'delivery') {
        return origem === 'delivery';
      }

      return true;
    });
  }
}
