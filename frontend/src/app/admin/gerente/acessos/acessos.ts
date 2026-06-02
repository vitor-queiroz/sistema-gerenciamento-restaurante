import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, updateDoc } from '@angular/fire/firestore';
import { getDocs } from '@angular/fire/firestore';


@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acessos.html',
  styleUrl: './acessos.css',
})
export class Acessos {

  funcionarios: any[] = [];

  funcionarioAberto = '';

  constructor(private firestore: Firestore){
    this.carregarFuncionarios();
  }

    
  async carregarFuncionarios(){

    const ref = collection(this.firestore, 'funcionarios');

    const snapshot = await getDocs(ref);

    console.log('Qnt documentos: ', snapshot.size)

    this.funcionarios = snapshot.docs.map(item => ({id: item.id, ...item.data()
  }));

      console.log('Length:', this.funcionarios.length);
      console.log(this.funcionarios);
    }

  abrirPermissoes(id: string){

    if(this.funcionarioAberto === id){
      this.funcionarioAberto = '';
      return;
    }

    this.funcionarioAberto = id;
  }



    async aprovarAcesso(id: string){
      const ref = doc(this.firestore, 'funcionarios', id);

      await updateDoc(ref, {status: 'Ativo'});
      
            alert('Acesso aprovado com sucesso!');
    }


    async voltarParaPendente(id: string) {
      const ref = doc(this.firestore, 'funcionarios', id);

      await updateDoc(ref, {status: 'Pendente'});
    }

    async salvarPermissoes(funcionario: any) {

      const ref = doc(this.firestore, 'funcionarios', funcionario.id);

      await updateDoc(ref, {
        cliente: funcionario.cliente,
        pedidos: funcionario.pedidos, 
        garcom: funcionario.garcom,
        estoque: funcionario.estoque,
        esg: funcionario.esg
  });
        alert('Permissões salvas com sucesso!')
}

}
    
