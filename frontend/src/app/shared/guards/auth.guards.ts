import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, ModuloPermissao } from '../services/auth.service';

/**
 * Garante que existe alguém logado. Use em rotas que qualquer
 * funcionário autenticado pode acessar (ex: painel de operações).
 */
export const logadoGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogado()) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};

/**
 * Garante que o usuário logado é o gerente/administrador.
 * Use nas rotas de 'admin/cozinha/gerente/*'.
 */
export const gerenteGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogado() && auth.isGerente()) {
    return true;
  }

  if (auth.estaLogado()) {
    alert('Você não tem permissão para acessar essa área.');
    router.navigate(['/admin/cozinha/operacoes']);
  } else {
    router.navigate(['/admin/login']);
  }

  return false;
};

/**
 * Cria um guard para um módulo específico de operações
 * (estoque, pedidos, cliente, garcom, esg), de acordo com os
 * checkboxes definidos na tela de Acessos do gerente.
 *
 * Exemplo de uso na rota:
 *   { path: 'admin/cozinha/operacoes/estoque', component: Estoque, canActivate: [permissaoGuard('estoque')] }
 */
export function permissaoGuard(modulo: ModuloPermissao): CanActivateFn {

  return () => {

    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.estaLogado()) {
      router.navigate(['/admin/login']);
      return false;
    }

    if (auth.temPermissao(modulo)) {
      return true;
    }

    alert('Você não tem permissão para acessar este módulo.');
    router.navigate(['/admin/cozinha/operacoes']);
    return false;
  };
}
