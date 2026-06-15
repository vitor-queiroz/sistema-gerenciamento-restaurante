import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from '@angular/fire/firestore';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mesas.html',
  styleUrl: './mesas.css',
})
export class Mesas {

  novoNumero: number | null = null;

  mesas: any[] = [];

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarMesas();
  }

  async carregarMesas() {

    const mesasRef = collection(this.firestore, 'mesas');

    const snapshot = await getDocs(mesasRef);

    this.mesas = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() } as any))
      .sort((a, b) => (a.numero || 0) - (b.numero || 0));

    this.cdr.detectChanges();
  }

  async adicionarMesa() {

    if (!this.novoNumero || this.novoNumero <= 0) {
      alert('Informe um número de mesa válido');
      return;
    }

    const numeroJaExiste = this.mesas.some(m => m.numero === this.novoNumero);

    if (numeroJaExiste) {
      alert(`Já existe uma mesa com o número ${this.novoNumero}`);
      return;
    }

    const mesasRef = collection(this.firestore, 'mesas');

    await addDoc(mesasRef, {
      numero: this.novoNumero,
      status: 'Disponível',
      cliente: '',
      quantidadePessoas: 0
    });

    this.novoNumero = null;

    await this.carregarMesas();
    this.cdr.detectChanges();

    alert('Mesa adicionada com sucesso!');
  }

  async excluirMesa(mesa: any) {

    // 1. Mesa ocupada no momento => bloqueia
    if (mesa.status === 'Ocupada') {
      alert(`A mesa ${mesa.numero} está ocupada no momento e não pode ser removida.`);
      return;
    }

    // 2. Verifica se existe algum pedido em andamento (status diferente de "Pago") para essa mesa
    const pedidosRef = collection(this.firestore, 'pedidos');
    const consulta = query(pedidosRef, where('mesaId', '==', mesa.id));
    const snapshot = await getDocs(consulta);

    const pedidosAtivos = snapshot.docs.filter(item => {
      const dados: any = item.data();
      return dados.status !== 'Pago';
    });

    if (pedidosAtivos.length > 0) {
      alert(
        `A mesa ${mesa.numero} possui ${pedidosAtivos.length} pedido(s) em andamento e não pode ser removida.`
      );
      return;
    }

    // 3. Confirmação e remoção
    const confirmar = confirm(`Deseja realmente remover a mesa ${mesa.numero}?`);

    if (!confirmar) {
      return;
    }

    const mesaDoc = doc(this.firestore, 'mesas', mesa.id);
    await deleteDoc(mesaDoc);

    await this.carregarMesas();
    this.cdr.detectChanges();

    alert('Mesa removida com sucesso!');
  }
}
