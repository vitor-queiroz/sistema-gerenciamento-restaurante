import { Component, ChangeDetectorRef } from '@angular/core';
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
export class Acessos{

  funcionarios: any[] = [];

  funcionarioAberto = '';

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef){
  
    this.carregarFuncionarios();
  
}

    pendentes(){return this.funcionarios.filter(f=> f.status === 'Pendente').length}

    
  async carregarFuncionarios(){

    const ref = collection(this.firestore, 'funcionarios');

    const snapshot = await getDocs(ref);

    console.log('Qnt documentos: ', snapshot.size)

    this.funcionarios = snapshot.docs.map(item => ({id: item.id, ...item.data()
  }));

      this.cdr.detectChanges();
      
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

          await this.carregarFuncionarios();
          this.funcionarioAberto='';
            alert('Acesso aprovado com sucesso!');
    }


    async voltarParaPendente(id: string) {
      const ref = doc(this.firestore, 'funcionarios', id);

      await updateDoc(ref, {status: 'Pendente'});

        await this.carregarFuncionarios();
        this.funcionarioAberto='';

              alert('Funcionário voltou para pendente!')
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

        await this.carregarFuncionarios();
        alert('Permissões salvas com sucesso!')
}



      novosNoMes(){
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        return this.funcionarios.filter(funcionario => {if (!funcionario.dataCadastro) return false;

          const data = funcionario.dataCadastro.toDate();

          return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;}).length;  

        }
      }

    
