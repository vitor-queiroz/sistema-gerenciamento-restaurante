import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})

export class Reservas {

  mesas: any[] = [];

  nome = '';
  telefone = '';
  pessoas = '';
  data = '';
  horario = '';
  mesa = '';

  constructor(private firestore: Firestore) {
    this.carregarMesas();
  }

  async salvarReserva() {
    try {
      if (!this.nome || !this.telefone || !this.pessoas || !this.data || !this.horario || !this.mesa) {
        alert('Preencha todos os campos da reserva.');
        return;
      }

      if (this.telefone.length !== 11) {
        alert('Informe um telefone válido com DDD e 9 dígitos. Ex: 11999999999');
        return;
      }

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataReserva = new Date(this.data + 'T00:00:00');

      if (dataReserva < hoje) {
        alert('A data da reserva não pode ser anterior ao dia de hoje.');
        return;
      }

      const mesaSelecionada = this.mesas.find((mesa: any) =>
        String(mesa.numero) === String(this.mesa)
      );

      if (!mesaSelecionada) {
        alert('Mesa não encontrada.');
        return;
      }

      if (mesaSelecionada.status === 'Ocupada') {
        alert('Esta mesa está indisponível no momento. Escolha outra mesa.');
        return;
      }

      await addDoc(
        collection(this.firestore, 'reservas'),
        {
          nome: this.nome,
          telefone: this.telefone,
          pessoas: this.pessoas,
          data: this.data,
          horario: this.horario,

          mesaNumero: mesaSelecionada.numero,
          mesaId: mesaSelecionada.id,

          status: 'Pendente',
          origem: 'reserva',
          criadoEm: new Date()
        }
      );

      alert('Reserva enviada com sucesso! Aguarde a confirmação do restaurante.');

      this.nome = '';
      this.telefone = '';
      this.pessoas = '';
      this.data = '';
      this.horario = '';
      this.mesa = '';

    } catch (error) {
      console.error(error);
      alert('Erro ao realizar reserva.');
    }
  }

  async carregarMesas() {
    const mesasRef = collection(this.firestore, 'mesas');
    const snapshot = await getDocs(mesasRef);

    this.mesas = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));
  }
}
