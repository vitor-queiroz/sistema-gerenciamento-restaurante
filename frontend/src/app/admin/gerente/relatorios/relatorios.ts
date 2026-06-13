import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RelatoriosService } from './relatorios.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
  
})
export class Relatorios implements OnInit {

  pedidos: any[] = [];
  todosPedidos: any[] = [];
  faturamentoPorDia: any[] = [];
  graficoFaturamento: any;

  faturamentoTotal = 0;
  totalPedidos = 0;
  pratoMaisVendido = '';
  filtroPeriodo = 'todos';


  rankingPratos: { nome: string; quantidade: number }[] = [];
  
  graficoPratos: any;

  constructor(
  private relatoriosService: RelatoriosService,
  private cdr: ChangeDetectorRef
) {}

async ngOnInit() {

  try {

    const pedidos = await this.relatoriosService.getPedidos();
    
    console.log('Quantidade recebida:', pedidos.length);

if (pedidos.length > 0) {
  console.log('Primeiro pedido:', pedidos[0]);
}

    console.log('TODOS OS PEDIDOS:', JSON.stringify(pedidos, null, 2));

    this.todosPedidos = pedidos.filter(
  (pedido: any) => pedido.status === 'Pago'
);

this.pedidos = [...this.todosPedidos];

    console.log('PEDIDOS PAGOS:', this.pedidos);

    this.processarRelatorio();

    this.cdr.detectChanges();

  } catch (erro) {

    console.error('ERRO:', erro);

  }

}
processarRelatorio() {
console.log('Pedidos recebidos para processar:', this.pedidos);
  this.totalPedidos = this.pedidos.length;

  this.faturamentoTotal = this.pedidos.reduce(
    (total, pedido) => total + (pedido.total || 0),
    0
  );

  const contadorPratos: any = {};

  this.pedidos.forEach((pedido: any) => {

    pedido.itens?.forEach((item: any) => {

      if (!contadorPratos[item.nome]) {
        contadorPratos[item.nome] = 0;
      }

      contadorPratos[item.nome] += item.quantidade;

    });

  });

  const ranking = Object.entries(contadorPratos)
  .sort((a: any, b: any) => Number(b[1]) - Number(a[1]));

  this.rankingPratos = ranking.map((item: any) => ({
  nome: item[0],
  quantidade: Number(item[1])
}));

  if (this.rankingPratos.length > 0) {
  this.pratoMaisVendido = this.rankingPratos[0].nome;
}

console.log('Total pedidos:', this.totalPedidos);
console.log('Faturamento:', this.faturamentoTotal);
console.log('Prato mais vendido:', this.pratoMaisVendido);

if (this.rankingPratos.length > 0) {
  this.pratoMaisVendido = this.rankingPratos[0].nome;
}

this.criarGraficoPratos();

this.processarFaturamentoDiario();
this.criarGraficoFaturamento();

}

criarGraficoPratos() {

  const top5 = this.rankingPratos.slice(0, 5);

  const labels = top5.map(prato => prato.nome);

  const dados = top5.map(prato => prato.quantidade);

  if (this.graficoPratos) {
    this.graficoPratos.destroy();
  }

  this.graficoPratos = new Chart('graficoPratos', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Quantidade Vendida',
        data: dados
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

}

filtrarPeriodo() {

  const hoje = new Date();

  switch (this.filtroPeriodo) {

    case 'hoje':

      this.pedidos = this.todosPedidos.filter((pedido: any) => {

        const data = pedido.pagamento?.pagoEm?.toDate
          ? pedido.pagamento.pagoEm.toDate()
          : new Date(
              pedido.pagamento?.pagoEm?.seconds * 1000
            );

        return (
          data.getDate() === hoje.getDate() &&
          data.getMonth() === hoje.getMonth() &&
          data.getFullYear() === hoje.getFullYear()
        );

      });

      break;

    case 'semana':

      const inicioSemana = new Date();
      inicioSemana.setDate(hoje.getDate() - 7);

      this.pedidos = this.todosPedidos.filter((pedido: any) => {

        const data = pedido.pagamento?.pagoEm?.toDate
          ? pedido.pagamento.pagoEm.toDate()
          : new Date(
              pedido.pagamento?.pagoEm?.seconds * 1000
            );

        return data >= inicioSemana;

      });

      break;

    case 'mes':

      this.pedidos = this.todosPedidos.filter((pedido: any) => {

        const data = pedido.pagamento?.pagoEm?.toDate
          ? pedido.pagamento.pagoEm.toDate()
          : new Date(
              pedido.pagamento?.pagoEm?.seconds * 1000
            );

        return (
          data.getMonth() === hoje.getMonth() &&
          data.getFullYear() === hoje.getFullYear()
        );

      });

      break;

    default:

      this.pedidos = [...this.todosPedidos];

  }

  this.processarRelatorio();

}

processarFaturamentoDiario() {

  const faturamentoMap: any = {};

  this.pedidos.forEach((pedido: any) => {

    if (!pedido.pagamento?.pagoEm) return;

    const data = pedido.pagamento.pagoEm.toDate
      ? pedido.pagamento.pagoEm.toDate()
      : new Date(pedido.pagamento.pagoEm.seconds * 1000);

    const chave = data.toLocaleDateString('pt-BR');

    if (!faturamentoMap[chave]) {
      faturamentoMap[chave] = 0;
    }

    faturamentoMap[chave] += pedido.total || 0;

  });

  this.faturamentoPorDia = Object.entries(faturamentoMap)
    .map(([data, valor]) => ({
      data,
      valor
    }));

}
criarGraficoFaturamento() {

  const labels = this.faturamentoPorDia.map(item => item.data);

  const dados = this.faturamentoPorDia.map(item => item.valor);

  if (this.graficoFaturamento) {
    this.graficoFaturamento.destroy();
  }

  this.graficoFaturamento = new Chart('graficoFaturamento', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Faturamento Diário (R$)',
        data: dados
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

}
}
