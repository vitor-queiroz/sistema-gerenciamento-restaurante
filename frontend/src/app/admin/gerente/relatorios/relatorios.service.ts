import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {

  constructor(private firestore: Firestore) {}

  async getPedidos() {

    const pedidosRef = collection(this.firestore, 'pedidos');

    const snapshot = await getDocs(pedidosRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}