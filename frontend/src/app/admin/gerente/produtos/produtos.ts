import { ChangeDetectorRef, Component } from '@angular/core'; /* changeDetector... tive que usar ele pois, ao fazer o update dos meu pratos, as informações ainda continuavam no meu browser, w isso seria muito ruim, caso a "equipe" esteja mexendo.*/

import { FormsModule } from '@angular/forms';

import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})

export class Produtos {

  nome = '';
  preco: number | null = null;
  descricao= '';

  produtos: any[] = [];

  produtoEditandoId: string | null = null; /*Essa variavel vai guardar: QUAL PRODUTO ESTA SENDO EDITADO NAQUELE MOMENTO. -------- Se estiver null = ele criar um novo produto --------- se tiver um ID ele atualiza o produto existente.*/

   constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) { /* -----ADICÃO DO /*ChangeDetectorRef  =  private cdr: ChangeDetectorRef-------*/

    this.carregarProdutos();

  }

  async carregarProdutos() {

    const produtosRef = collection(this.firestore, 'produtos');

    const snapshot = await getDocs(produtosRef);

    this.produtos = snapshot.docs.map((item: any) => {

      const dados = item.data();
      

      return{

      id: item.id,
      nome: dados.nome,
      preco: dados.preco,
      descricao: dados.descricao
      };
    });

  }

  async salvarProduto() {

    if(!this.nome || !this.preco === null || !this.descricao){

      alert('Preencha todos os campos');
      return;
    }

    const produtosRef = collection( this.firestore, 'produtos');

    // AQUI AGORA VAI EDITAR O PRODUTOOO

    if(this.produtoEditandoId){

      const produtoDoc = doc(this.firestore, 'produtos', this.produtoEditandoId);
      
      await updateDoc(produtoDoc,{nome: this.nome,  preco: this.preco,  descricao: this.descricao
      });

              alert('Produto atualizado com sucesso!');
    } else {

      await addDoc(produtosRef, {nome: this.nome,  preco: this.preco,  descricao: this.descricao});

              alert('Produto dalvo com sucesso!!');
      
    }

      await this.carregarProdutos();

          this.nome = '';
          this.preco = null; /*tirei o 0 do recebimento, e coloquei o null, para sumir do browser quando o funcionario clicar em salvar prato*/
          this.descricao = '';

          this.produtoEditandoId = null; /* ----- USO DO ChangeDetectorRef--------*/

          this.cdr.detectChanges();   /* ----- USO DO ChangeDetectorRef--------*/
          await this.carregarProdutos(); /* ----- USO DO ChangeDetectorRef--------*/

  }

  async excluirProduto(id: string) {

    const produtoDoc = doc(
      this.firestore,
      'produtos',
      id
    );

    await deleteDoc(produtoDoc);

    await this.carregarProdutos();

  }

  async editarProduto(produto: any) {

    this.produtoEditandoId = produto.id;

    this.nome = produto.nome;
    this.preco = produto.preco;
    this.descricao = produto.descricao;

  };
}