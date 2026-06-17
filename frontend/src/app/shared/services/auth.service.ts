import { Injectable, signal } from '@angular/core';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  status: string;
  gerente: boolean;
  estoque: boolean;
  pedidos: boolean;
  cliente: boolean;
  garcom: boolean;
  esg: boolean;
}

export type ModuloPermissao = 'estoque' | 'pedidos' | 'cliente' | 'garcom' | 'esg';

const CHAVE_STORAGE = 'usuarioLogado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Estado reativo do usuário logado. Inicializa lendo do sessionStorage
   * para manter a sessão ao recarregar a página (F5).
   */
  usuario = signal<UsuarioLogado | null>(this.carregarDoStorage());

  private carregarDoStorage(): UsuarioLogado | null {

    try {
      const dados = sessionStorage.getItem(CHAVE_STORAGE);
      return dados ? JSON.parse(dados) as UsuarioLogado : null;
    } catch {
      return null;
    }
  }

  /** Chamado pelo login após validar e-mail/senha com sucesso. */
  login(usuario: UsuarioLogado) {
    sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  /** Encerra a sessão e volta para a tela de login. */
  logout() {
    sessionStorage.removeItem(CHAVE_STORAGE);
    this.usuario.set(null);
  }

  getUsuario(): UsuarioLogado | null {
    return this.usuario();
  }

  estaLogado(): boolean {
    return this.usuario() !== null;
  }

  /**
   * Define quem é "gerente" (acesso total ao Painel Administrativo).
   * Usa o campo `gerente: true/false` salvo no Firestore.
   * Mantém compatibilidade com o Administrador original (criado antes
   * desse campo existir), que continua sendo reconhecido por e-mail/nome.
   */
  isGerente(): boolean {
    const usuario = this.usuario();
    if (!usuario) return false;

    return !!usuario.gerente ||
      usuario.email === 'admin@123.com' ||
      usuario.nome === 'Administrador';
  }

  /**
   * Verifica se o usuário logado tem permissão para acessar um módulo
   * (estoque, pedidos, cliente, garcom, esg), de acordo com os
   * checkboxes definidos na tela de Acessos. O gerente tem acesso total.
   */
  temPermissao(modulo: ModuloPermissao): boolean {

    const usuario = this.usuario();

    if (!usuario) return false;

    if (this.isGerente()) return true;

    return !!usuario[modulo];
  }
}