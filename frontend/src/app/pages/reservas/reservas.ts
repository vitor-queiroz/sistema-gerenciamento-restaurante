import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})

export class Reservas {
  nome= '';
  telefone= '';
  pessoas= '';
  data= '';
  horario= '';
  mesa= '';

  constructor(private firestore: Firestore){}

    async salvarReserva() {
      try{
        
        await addDoc(
          collection(this.firestore, 'reservas'),
          {
            nome: this.nome,
            telefone: this.telefone,
            pessoas: this.pessoas,
            data: this.data,
            horario: this.horario,
            mesa: this.mesa
          }
        );

        alert('Reserva realizada com Sucesso!');
      
      } catch (error){
        console.error(error);
      }
    }
}
