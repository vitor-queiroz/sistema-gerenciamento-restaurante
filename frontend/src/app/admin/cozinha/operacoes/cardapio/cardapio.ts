import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.css',
})
export class Cardapio {

  produtos: any[] = [];

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef, private router: Router){
    this.carregarProdutos();
  }

  async carregarProdutos(){

    const produtosRef = collection(this.firestore, 'produtos');

    const snapshot = await getDocs(produtosRef);

    this.produtos = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    this.cdr.detectChanges();

    console.log(this.produtos);
  }
}
