import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.css',
})

export class Funcionarios {

  nome= '';
  email = '';

  funcionarios: any[] = [];

  constructor(private firestore: Firestore){
  this.carregarFuncionarios();
  }


  
  async carregarFuncionarios(){

    const funcionarioRef = collection(this.firestore, 'funcionarios');

    const snapshot = await getDocs(funcionarioRef);

    this.funcionarios = snapshot.docs.map((item: any) => {

      const dados = item.data();

      return{
        id: item.id, nome: dados.nome, email: dados.email
        }
        })

  }

      async salvarFuncionario(){

        if(!this.nome || !this.email){

          alert('Preencha todos os campos');
          return;
        }
      
        const funcionarioRef = collection(this.firestore, 'funcionarios');

        await addDoc(funcionarioRef,{nome: this.nome, email: this.email});

        await this.carregarFuncionarios();
        this.nome = '';
        this.email = '';

            alert('Funcionário cadastrado com sucesso!')
      }

  }