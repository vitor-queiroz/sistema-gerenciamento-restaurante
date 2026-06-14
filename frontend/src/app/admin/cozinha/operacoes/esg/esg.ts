import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  EsgService,
  DocumentoLegal,
  ChecklistItem
} from './esg.service';

// Limites (em dias) usados para definir as cores de alerta dos documentos
const LIMITE_URGENTE = 15;
const LIMITE_VENCENDO = 30;

interface DocumentoComStatus extends DocumentoLegal {
  diasRestantes: number;
  validadeFormatada: string;
  statusInfo: { label: string; classe: string };
}

@Component({
  selector: 'app-esg',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './esg.html',
  styleUrl: './esg.css',
})
export class Esg implements OnInit {

  documentos: DocumentoComStatus[] = [];
  checklist: ChecklistItem[] = [];

  carregando = true;

  // form de documento (novo ou edição)
  mostrarFormDocumento = false;
  documentoEditando: string | null = null;
  novoDocumento = { nome: '', validade: '' };

  // form de tarefa do checklist
  mostrarFormTarefa = false;
  novaTarefa = { item: '', responsavel: '', horario: '' };

  // modal de histórico de checklists
  mostrarHistorico = false;
  carregandoHistorico = false;
  historico: any[] = [];

  constructor(
    private esgService: EsgService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  async carregarDados() {
    this.carregando = true;

    try {
      const [documentos, checklist] = await Promise.all([
        this.esgService.getDocumentos(),
        this.esgService.getChecklist()
      ]);

      this.documentos = documentos
        .map(doc => this.calcularStatusDocumento(doc))
        .sort((a, b) => a.diasRestantes - b.diasRestantes);

      this.checklist = [...checklist].sort((a, b) =>
        (a.horario || '').localeCompare(b.horario || '')
      );

    } catch (erro) {
      console.error('Erro ao carregar dados ESG:', erro);
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  // ---------- Cálculo de status dos documentos ----------

  private calcularStatusDocumento(documento: DocumentoLegal): DocumentoComStatus {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const validade = documento.validade?.toDate
      ? documento.validade.toDate()
      : new Date(documento.validade);
    validade.setHours(0, 0, 0, 0);

    const diffMs = validade.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let statusInfo: { label: string; classe: string };

    if (diasRestantes < 0) {
      statusInfo = { label: 'Vencido', classe: 'badge-urgente' };
    } else if (diasRestantes <= LIMITE_URGENTE) {
      statusInfo = { label: 'Urgente', classe: 'badge-urgente' };
    } else if (diasRestantes <= LIMITE_VENCENDO) {
      statusInfo = { label: 'Vencendo', classe: 'badge-vencendo' };
    } else {
      statusInfo = { label: 'OK', classe: 'badge-ok' };
    }

    return {
      ...documento,
      diasRestantes,
      validadeFormatada: validade.toLocaleDateString('pt-BR'),
      statusInfo
    };
  }

  // ---------- Alertas / resumos ----------

  get alertasVencimento(): DocumentoComStatus[] {
    return this.documentos.filter(d => d.diasRestantes <= LIMITE_VENCENDO);
  }

  get tarefasPendentesCount(): number {
    return this.checklist.filter(t => !t.concluido).length;
  }

  get tarefasConcluidasCount(): number {
    return this.checklist.filter(t => t.concluido).length;
  }

  get progresso(): number {
    if (this.checklist.length === 0) return 0;
    return Math.round((this.tarefasConcluidasCount / this.checklist.length) * 100);
  }

  get tarefasAguardandoCount(): number {
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    return this.checklist.filter(t => {
      if (t.concluido) return false;
      const [h, m] = (t.horario || '00:00').split(':').map(Number);
      return (h * 60 + m) > minutosAgora;
    }).length;
  }

  get tarefasAtrasadasCount(): number {
    return this.checklist.length - this.tarefasConcluidasCount - this.tarefasAguardandoCount;
  }

  statusTarefa(tarefa: ChecklistItem): { label: string; classe: string } {
    if (tarefa.concluido) {
      return { label: 'OK', classe: 'badge-ok' };
    }

    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const [h, m] = (tarefa.horario || '00:00').split(':').map(Number);
    const minutosTarefa = h * 60 + m;

    return minutosTarefa > minutosAgora
      ? { label: 'Aguardado', classe: 'badge-aguardado' }
      : { label: 'Pendente', classe: 'badge-pendente' };
  }

  // ---------- CRUD Documentos ----------

  abrirFormNovoDocumento() {
    this.documentoEditando = null;
    this.novoDocumento = { nome: '', validade: '' };
    this.mostrarFormDocumento = true;
  }

  editarDocumento(documento: DocumentoComStatus) {
    this.documentoEditando = documento.id ?? null;

    // converte dd/mm/yyyy -> yyyy-mm-dd (formato esperado pelo input type="date")
    const [dia, mes, ano] = documento.validadeFormatada.split('/');
    this.novoDocumento = {
      nome: documento.nome,
      validade: `${ano}-${mes}-${dia}`
    };

    this.mostrarFormDocumento = true;
  }

  cancelarFormDocumento() {
    this.mostrarFormDocumento = false;
    this.documentoEditando = null;
  }

  async salvarDocumento() {
    if (!this.novoDocumento.nome || !this.novoDocumento.validade) return;

    const dados = {
      nome: this.novoDocumento.nome,
      validade: new Date(this.novoDocumento.validade)
    };

    try {
      if (this.documentoEditando) {
        await this.esgService.updateDocumento(this.documentoEditando, dados);
      } else {
        await this.esgService.addDocumento(dados);
      }

      this.mostrarFormDocumento = false;
      this.documentoEditando = null;
      await this.carregarDados();

    } catch (erro) {
      console.error('Erro ao salvar documento:', erro);
    }
  }

  async excluirDocumento(id?: string) {
    if (!id) return;
    if (!confirm('Deseja realmente excluir este documento?')) return;

    try {
      await this.esgService.deleteDocumento(id);
      await this.carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir documento:', erro);
    }
  }

  // ---------- CRUD Checklist ----------

  abrirFormNovaTarefa() {
    this.novaTarefa = { item: '', responsavel: '', horario: '' };
    this.mostrarFormTarefa = true;
  }

  cancelarFormTarefa() {
    this.mostrarFormTarefa = false;
  }

  async salvarTarefa() {
    if (!this.novaTarefa.item || !this.novaTarefa.horario) return;

    try {
      await this.esgService.addChecklistItem({
        item: this.novaTarefa.item,
        responsavel: this.novaTarefa.responsavel || 'Equipe',
        horario: this.novaTarefa.horario,
        concluido: false
      });

      this.mostrarFormTarefa = false;
      await this.carregarDados();

    } catch (erro) {
      console.error('Erro ao salvar tarefa:', erro);
    }
  }

  async excluirTarefa(id?: string) {
    if (!id) return;
    if (!confirm('Deseja realmente excluir esta tarefa?')) return;

    try {
      await this.esgService.deleteChecklistItem(id);
      await this.carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir tarefa:', erro);
    }
  }

  async toggleTarefa(tarefa: ChecklistItem) {
    if (!tarefa.id) return;

    const concluido = !tarefa.concluido;
    const dados: Partial<ChecklistItem> = { concluido };

    if (concluido) {
      const agora = new Date();
      dados.concluidoEm = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      // TODO: substituir pelo nome do usuário autenticado (ex: do AuthService)
      dados.concluidoPor = 'Usuário';
    } else {
      dados.concluidoEm = null;
      dados.concluidoPor = null;
    }

    try {
      await this.esgService.updateChecklistItem(tarefa.id, dados);
      await this.carregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar tarefa:', erro);
    }
  }

  // ---------- Histórico e exportação ----------

  async abrirHistorico() {
    this.mostrarHistorico = true;
    this.carregandoHistorico = true;

    try {
      const registros = await this.esgService.getHistorico();

      this.historico = registros
        .map(registro => {
          const dataObj = registro.data?.toDate
            ? registro.data.toDate()
            : new Date(registro.data);

          return { ...registro, dataObj };
        })
        .sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());

    } catch (erro) {
      console.error('Erro ao carregar histórico:', erro);
    } finally {
      this.carregandoHistorico = false;
      this.cdr.detectChanges();
    }
  }

  fecharHistorico() {
    this.mostrarHistorico = false;
  }

  async salvarHistorico() {
    const snapshot = {
      data: new Date(),
      checklist: this.checklist,
      progresso: this.progresso,
      tarefasConcluidas: this.tarefasConcluidasCount,
      totalTarefas: this.checklist.length
    };

    try {
      await this.esgService.salvarHistorico(snapshot);
      alert('Histórico salvo com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar histórico:', erro);
      alert('Não foi possível salvar o histórico.');
    }
  }

  exportarRelatorio() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR');

    const doc = new jsPDF();

    // Título
    doc.setTextColor(185, 28, 28); // vermelho
    doc.setFontSize(18);
    doc.text('Dom Palladar - Relatório ESG & ANVISA', 14, 18);

    // Data de geração
    doc.setTextColor(156, 163, 175); // cinza
    doc.setFontSize(10);
    doc.text(`Data: ${dataFormatada} às ${horaFormatada}`, 14, 25);

    // ---------- Tabela: Documentação e Licenças ----------
    doc.setTextColor(31, 41, 55); // cinza escuro
    doc.setFontSize(13);
    doc.text('Documentação e Licenças', 14, 36);

    autoTable(doc, {
      startY: 40,
      head: [['Documento', 'Validade', 'Dias Restantes', 'Status']],
      body: this.documentos.map(d => [
        d.nome,
        d.validadeFormatada,
        `${d.diasRestantes} dias`,
        d.statusInfo.label
      ]),
      headStyles: { fillColor: [220, 38, 38], textColor: 255 }, // vermelho
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 10 }
    });

    // ---------- Tabela: Checklist BPF ----------
    const finalY1 = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(13);
    doc.text('Checklist BPF - Hoje', 14, finalY1);

    const linhasChecklist = this.checklist.map(item => {
      const status = this.statusTarefa(item).label;
      const statusTexto = status === 'OK'
        ? 'Concluído'
        : status === 'Aguardado'
          ? 'Aguardando'
          : status;

      return [
        item.item,
        item.responsavel,
        item.horario,
        statusTexto,
        item.concluido ? (item.concluidoEm || '-') : '-'
      ];
    });

    autoTable(doc, {
      startY: finalY1 + 4,
      head: [['Tarefa', 'Responsável', 'Horário', 'Status', 'Concluído em']],
      body: linhasChecklist,
      headStyles: { fillColor: [22, 163, 74], textColor: 255 }, // verde
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 10 }
    });

    // ---------- Resumo final ----------
    const finalY2 = (doc as any).lastAutoTable.finalY + 10;

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    doc.text(
      `Resumo: ${this.tarefasConcluidasCount} de ${this.checklist.length} tarefas concluídas (${this.progresso}%)`,
      14,
      finalY2
    );

    doc.save(`relatorio-esg-anvisa-${dataFormatada.replace(/\//g, '-')}.pdf`);
  }
}