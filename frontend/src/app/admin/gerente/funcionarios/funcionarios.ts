import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

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

  idFuncionarioEditando='';

  funcionarios: any[] = [];

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef){
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

        this.cdr.detectChanges();
  }

      async salvarFuncionario(){

        if(!this.nome || !this.email){

          alert('Preencha todos os campos');
          return;
        }



        if(this.idFuncionarioEditando){

          const funcionarioDoc = doc(this.firestore, 'funcionarios', this.idFuncionarioEditando);

          await updateDoc(funcionarioDoc,{nome: this.nome, email: this.email});


          this.idFuncionarioEditando = '';

          await this.carregarFuncionarios();
          this.cdr.detectChanges();

          this.nome= '';
          this.email= '';

                alert('Funcionário atualizado com sucesso!');
                return;
          }


          // AQUI VAI SERR PARA CADASTRAR O FUNCIONARIO
        const funcionarioRef = collection(this.firestore, 'funcionarios');

        await addDoc(funcionarioRef,{nome: this.nome, email: this.email});

        await this.carregarFuncionarios();
        this.cdr.detectChanges();  

        this.nome = '';
        this.email = '';

            alert('Funcionário cadastrado com sucesso!')
      }

      editarFuncionario(funcionario: any) {

      this.nome = funcionario.nome;
      this.email = funcionario.email;

      this.idFuncionarioEditando = funcionario.id;
      }

      async excluirFuncionario(id: string){

        const confirmar = confirm('Deseja realmente excluir este funcionário?');

        if(!confirmar){
          return;
        }

        const funcionarioDoc = doc(this.firestore, 'funcionarios', id);

        await deleteDoc(funcionarioDoc);
        await this.carregarFuncionarios();
        this.cdr.detectChanges();

              alert('Funcionário excluído com sucesso!');
      }

  }