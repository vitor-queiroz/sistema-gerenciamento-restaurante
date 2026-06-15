import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';
@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente {

  mesas: any[] = [];
  reservasPendentes: any[] = [];

  mesaSelecionada: any = null;

  nomeCliente = '';
  quantidadePessoas: number | null = null;

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef, private router: Router) {
    this.carregarMesas();
    this.carregarReservasPendentes();
  }

  async carregarMesas() {
    const mesasRef = collection(this.firestore, 'mesas');

    const snapshot = await getDocs(mesasRef);

    this.mesas = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

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

    const mesaDoc = doc(this.firestore, 'mesas', mesaId);

    await updateDoc(mesaDoc, {
      status: 'Ocupada',
      cliente: this.nomeCliente,
      quantidadePessoas: this.quantidadePessoas
    });

    await this.carregarMesas();

    this.fecharModal();
    this.cdr.detectChanges();

    this.router.navigate(['/admin/cozinha/operacoes/cardapio', mesaId]);

  }


  async atualizarMesa() {
    if (!this.nomeCliente || !this.quantidadePessoas) {
      alert('Preencha o nome e a quantidade de pessoas');
      return;
    }

    const mesaDoc = doc(this.firestore, 'mesas', this.mesaSelecionada.id);

    await updateDoc(mesaDoc, {
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
    const confirmar = confirm('Deseja liberar esta mesa?');

    if (!confirmar) {
      return;
    }

    const mesaDoc = doc(this.firestore, 'mesas', this.mesaSelecionada.id);

    await updateDoc(mesaDoc, {
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
    const reservasRef = collection(this.firestore, 'reservas');

    const snapshot = await getDocs(reservasRef);

    this.reservasPendentes = snapshot.docs
      .map(item => ({
        id: item.id,
        ...item.data()
      }))
      .filter((reserva: any) => reserva.status === 'Pendente');

    this.cdr.detectChanges();
  }



  buscarReservaMesa(numeroMesa: number) {
    return this.reservasPendentes.find(
      (reserva: any) =>
        Number(reserva.mesaNumero) === Number(numeroMesa)
    );
  }



  async confirmarReserva(reserva: any, mesa: any) {

    const mesaDoc = doc(this.firestore, 'mesas', mesa.id);

    await updateDoc(mesaDoc, {
      status: 'Ocupada',
      cliente: reserva.nome,
      quantidadePessoas: reserva.pessoas
    });

    const reservaDoc = doc(this.firestore, 'reservas', reserva.id);

    await updateDoc(reservaDoc, {
      status: 'Confirmada'
    });

    await this.carregarMesas();
    await this.carregarReservasPendentes();

    alert('Reserva confirmada com sucesso!');
  }


  async recusarReserva(reserva: any) {

    const reservaDoc = doc(this.firestore, 'reservas', reserva.id);

    await updateDoc(reservaDoc, {
      status: 'Recusada'
    });

    await this.carregarReservasPendentes();

    alert('Reserva recusada.');
  }
}
