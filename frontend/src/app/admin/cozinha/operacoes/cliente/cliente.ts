import { Router, RouterLink } from '@angular/router';
import { Component, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Pipe({ name: 'sort', standalone: true })
export class SortPipe implements PipeTransform {
  transform(array: any[], field: string): any[] {
    if (!array || !field) return array;
    return [...array].sort((a, b) => (a[field] ?? 0) - (b[field] ?? 0));
  }
}

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SortPipe],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente {

  mesas: any[] = [];
  reservasPendentes: any[] = [];
  mesaSelecionada: any = null;
  nomeCliente = '';
  quantidadePessoas: number | null = null;

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.carregarMesas();
    this.carregarReservasPendentes();
  }

  async carregarMesas() {
    const snapshot = await getDocs(collection(this.firestore, 'mesas'));
    this.mesas = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    this.cdr.detectChanges();
  }

  abrirMesa(mesa: any) {
    this.mesaSelecionada = mesa;
    if (mesa.status === 'Ocupada') {
      this.nomeCliente = mesa.cliente;
      this.quantidadePessoas = mesa.quantidadePessoas;
    } else {
      this.nomeCliente = '';
      this.quantidadePessoas = null;
    }
  }

  fecharModal() {
    this.mesaSelecionada = null;
    this.nomeCliente = '';
    this.quantidadePessoas = null;
  }

  async ocuparMesa() {
    if (!this.nomeCliente || !this.quantidadePessoas) {
      alert('Preencha o nome e a quantidade de pessoas');
      return;
    }
    const mesaId = this.mesaSelecionada.id;
    await updateDoc(doc(this.firestore, 'mesas', mesaId), {
      status: 'Ocupada',
      cliente: this.nomeCliente,
      quantidadePessoas: this.quantidadePessoas
    });
    await this.carregarMesas();
    this.fecharModal();
    this.router.navigate(['/admin/cozinha/operacoes/cardapio', mesaId]);
  }

  async atualizarMesa() {
    if (!this.nomeCliente || !this.quantidadePessoas) {
      alert('Preencha o nome e a quantidade de pessoas');
      return;
    }
    await updateDoc(doc(this.firestore, 'mesas', this.mesaSelecionada.id), {
      status: 'Ocupada',
      cliente: this.nomeCliente,
      quantidadePessoas: this.quantidadePessoas
    });
    await this.carregarMesas();
    this.fecharModal();
    this.cdr.detectChanges();
    alert('Mesa atualizada com sucesso!');
  }

  async liberarMesa() {
    if (!confirm('Deseja liberar esta mesa?')) return;
    await updateDoc(doc(this.firestore, 'mesas', this.mesaSelecionada.id), {
      status: 'Disponível',
      cliente: '',
      quantidadePessoas: 0
    });
    await this.carregarMesas();
    this.fecharModal();
    this.cdr.detectChanges();
    alert('Mesa liberada com sucesso!');
  }

  async carregarReservasPendentes() {
    const snapshot = await getDocs(collection(this.firestore, 'reservas'));
    this.reservasPendentes = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .filter((r: any) => r.status === 'Pendente');
    this.cdr.detectChanges();
  }

  buscarReservaMesa(numeroMesa: number) {
    return this.reservasPendentes.find(
      (r: any) => Number(r.mesaNumero) === Number(numeroMesa)
    );
  }

  async confirmarReserva(reserva: any, mesa: any) {
    await updateDoc(doc(this.firestore, 'mesas', mesa.id), {
      status: 'Ocupada',
      cliente: reserva.nome,
      quantidadePessoas: reserva.pessoas
    });
    await updateDoc(doc(this.firestore, 'reservas', reserva.id), { status: 'Confirmada' });
    await this.carregarMesas();
    await this.carregarReservasPendentes();
    alert('Reserva confirmada com sucesso!');
  }

  async recusarReserva(reserva: any) {
    await updateDoc(doc(this.firestore, 'reservas', reserva.id), { status: 'Recusada' });
    await this.carregarReservasPendentes();
    alert('Reserva recusada.');
  }
}