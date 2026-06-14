import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from '@angular/fire/firestore';

export interface DocumentoLegal {
  id?: string;
  nome: string;
  validade: any; // Firestore Timestamp ou Date
}

export interface ChecklistItem {
  id?: string;
  item: string;
  responsavel: string;
  horario: string; // formato 'HH:mm'
  concluido: boolean;
  concluidoEm?: string | null;
  concluidoPor?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EsgService {

  constructor(private firestore: Firestore) {}

  // ---------- Documentação e Licenças ----------

  async getDocumentos(): Promise<DocumentoLegal[]> {
    const ref = collection(this.firestore, 'esgDocumentos');
    const snapshot = await getDocs(ref);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as DocumentoLegal));
  }

  async addDocumento(dados: { nome: string; validade: Date }) {
    const ref = collection(this.firestore, 'esgDocumentos');
    await addDoc(ref, dados);
  }

  async updateDocumento(id: string, dados: Partial<DocumentoLegal>) {
    const ref = doc(this.firestore, 'esgDocumentos', id);
    await updateDoc(ref, dados as any);
  }

  async deleteDocumento(id: string) {
    const ref = doc(this.firestore, 'esgDocumentos', id);
    await deleteDoc(ref);
  }

  // ---------- Checklist BPF ----------

  async getChecklist(): Promise<ChecklistItem[]> {
    const ref = collection(this.firestore, 'esgChecklist');
    const snapshot = await getDocs(ref);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as ChecklistItem));
  }

  async addChecklistItem(dados: Omit<ChecklistItem, 'id'>) {
    const ref = collection(this.firestore, 'esgChecklist');
    await addDoc(ref, dados);
  }

  async updateChecklistItem(id: string, dados: Partial<ChecklistItem>) {
    const ref = doc(this.firestore, 'esgChecklist', id);
    await updateDoc(ref, dados as any);
  }

  async deleteChecklistItem(id: string) {
    const ref = doc(this.firestore, 'esgChecklist', id);
    await deleteDoc(ref);
  }

  // ---------- Histórico ----------

  async salvarHistorico(dados: any) {
    const ref = collection(this.firestore, 'esgHistorico');
    await addDoc(ref, dados);
  }

  async getHistorico(): Promise<any[]> {
    const ref = collection(this.firestore, 'esgHistorico');
    const snapshot = await getDocs(ref);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }
}