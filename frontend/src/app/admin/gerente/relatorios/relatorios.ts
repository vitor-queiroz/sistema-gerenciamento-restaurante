import Chart from 'chart.js/auto';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RelatoriosService } from './relatorios.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
})
export class Relatorios implements OnInit {

  pedidos: any[] = [];
  
  faturamentoTotal = 0;
  totalPedidos = 0;
  pratoMaisVendido = '';
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

    this.pedidos = pedidos.filter(
  (pedido: any) => pedido.status === 'Pago'
);

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

}
