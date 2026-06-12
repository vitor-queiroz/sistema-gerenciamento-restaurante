import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Firestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './estoque.html',
  styleUrl: './estoque.css',
})
export class Estoque {

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef) {
    this.carregarItens();
  }

  buscaProduto = '';
  categoriaSelecionada = '';
  nivelSelecionado = '';

  nome = '';
  marca = '';
  categoria = '';
  unidade = '';

  quantidadeAtual: number | null = null;
  quantidadeMinima: number | null = null;
  quantidadeMaxima: number | null = null;

  itensEstoque: any[] = [];


  async carregarItens() {
    const estoqueRef = collection(this.firestore, 'estoque');

    const snapshot = await getDocs(estoqueRef);

    this.itensEstoque = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    this.cdr.detectChanges();
  }


  async salvarItem() {

    if (
      !this.nome ||
      !this.marca ||
      !this.categoria ||
      !this.unidade ||
      this.quantidadeAtual === null ||
      this.quantidadeMinima === null ||
      this.quantidadeMaxima === null
    ) {
      alert('Preencha todos os campos');
      return;
    }

    const estoqueRef = collection(this.firestore, 'estoque');

    await addDoc(estoqueRef, {
      nome: this.nome,
      marca: this.marca,
      categoria: this.categoria,
      unidade: this.unidade,
      quantidadeAtual: this.quantidadeAtual,
      quantidadeMinima: this.quantidadeMinima,
      quantidadeMaxima: this.quantidadeMaxima
    });

    this.nome = '';
    this.marca = '';
    this.categoria = '';
    this.unidade = '';

    this.quantidadeAtual = null;
    this.quantidadeMinima = null;
    this.quantidadeMaxima = null;

    await this.carregarItens();
    this.fecharModalCadastro();

    this.cdr.detectChanges();

    console.log('Item cadastrado com sucesso!');
  }



  verificarStatus(item: any) {
    if (item.quantidadeAtual <= item.quantidadeMinima) {
      return 'Crítico';
    }

    if (item.quantidadeAtual <= item.quantidadeMinima * 1.5) {
      return 'Atenção';
    }

    if (item.quantidadeAtual > item.quantidadeMaxima) {
      return 'Acima da média';
    }

    return 'Normal';
  }

  mostrarModalCadastro = false;

  abrirModalCadastro() {
    this.mostrarModalCadastro = true;
    this.cdr.detectChanges();
  }

  fecharModalCadastro() {
    this.mostrarModalCadastro = false;
    this.cdr.detectChanges();
  }


  //AQUII VAI SER PARA OS ICONES FIXADOS DOS PRODUTOS/ESTOQUE
  totalItens() {
    return this.itensEstoque.length;
  }

  totalCriticos() {
    return this.itensEstoque.filter(
      item => this.verificarStatus(item) === 'Crítico'
    ).length;
  }

  totalAtencao() {
    return this.itensEstoque.filter(
      item => this.verificarStatus(item) === 'Atenção'
    ).length;
  }

  totalNormais() {
    return this.itensEstoque.filter(
      item => this.verificarStatus(item) === 'Normal'
    ).length;
  }

  totalAcimaMedia() {
    return this.itensEstoque.filter(
      item => this.verificarStatus(item) === 'Acima da média'
    ).length;
  }



  //AQUI VAI SER PARA A PESQUISA DOS PRODUTOS 
  itensFiltrados() {
    return this.itensEstoque.filter(item => {
      const busca = item.nome
        .toLowerCase()
        .includes(this.buscaProduto.toLowerCase());

      const categoria =
        !this.categoriaSelecionada ||
        item.categoria === this.categoriaSelecionada;

      const nivel =
        !this.nivelSelecionado ||
        this.verificarStatus(item) === this.nivelSelecionado;

      return busca && categoria && nivel;
    });
  }
}