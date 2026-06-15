import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Reservas } from './pages/reservas/reservas';
import { ClienteLogin } from './pages/cliente-login/cliente-login';
import { ClientePedidos } from './pages/cliente-pedidos/cliente-pedidos';

// import { Painel } from './admin/painel/painel';
import { Cozinha } from './admin/cozinha/cozinha';
import { Garcom } from './admin/cozinha/operacoes/garcom/garcom';
import { Estoque } from './admin/cozinha/operacoes/estoque/estoque';
import { Esg } from './admin/cozinha/operacoes/esg/esg';

import { Cliente } from './admin/cozinha/operacoes/cliente/cliente';

// importando rotas para conseguir cadastrar os produtos
import { Produtos } from './admin/gerente/produtos/produtos';
import { Pedido } from './admin/cozinha/operacoes/pedidos/pedido';
import { Acessos } from './admin/gerente/acessos/acessos';
import { Funcionarios } from './admin/gerente/funcionarios/funcionarios';
import { Relatorios } from './admin/gerente/relatorios/relatorios';
import { Mesas } from './admin/gerente/mesas/mesas';

import { Login } from './admin/login/login';
import { Gerente } from './admin/gerente/gerente';
import { Operacoes } from './admin/cozinha/operacoes/operacoes';
import { Cardapio } from './admin/cozinha/operacoes/cardapio/cardapio';

import { logadoGuard, gerenteGuard, permissaoGuard } from './shared/guards/auth.guards';


export const routes: Routes=[
    {
        path: '',
        component: Home 
    },   
    {
        path:'home',
        component: Home
    },
    {
        path:'reservas',
        component: Reservas
    },
    {
        path:'cliente-login',
        component: ClienteLogin
    },
    {
        path:'cliente-pedidos',
        component: ClientePedidos
    },

    {
        path: 'admin/cozinha/operacoes/garcom',
        component: Garcom,
        canActivate: [permissaoGuard('garcom')]
    },

    {
       path: 'admin/cozinha/operacoes/cliente',
       component: Cliente,
       canActivate: [permissaoGuard('cliente')]
    },
    {
       path: 'admin/cozinha/operacoes/estoque',
       component: Estoque,
       canActivate: [permissaoGuard('estoque')]
    },
    
    {
       path: 'admin/cozinha/operacoes/esg',
       component: Esg,
       canActivate: [permissaoGuard('esg')]
    },
    {
       path: 'admin/cozinha/operacoes/pedidos',
       component: Pedido,
       canActivate: [permissaoGuard('pedidos')]
    },
    {
        path: 'admin/cozinha',
        component: Cozinha
    },
    
    {
       path: 'admin/cozinha/gerente/acessos',
       component: Acessos,
       canActivate: [gerenteGuard]
    },
    {
        path: 'admin/cozinha/gerente/produtos',
        component: Produtos,
        canActivate: [gerenteGuard]
    },
    {
        path: 'admin/cozinha/gerente/funcionarios',
        component: Funcionarios,
        canActivate: [gerenteGuard]
    },
    {
       path: 'admin/cozinha/gerente/relatorios',
       component: Relatorios,
       canActivate: [gerenteGuard]
    },
    {
       path: 'admin/cozinha/gerente/mesas',
       component: Mesas,
       canActivate: [gerenteGuard]
    },
    {
        path: 'admin/login',
        component: Login 
    },
    // AQUI ABAIXO EU ESTOU ADICIONANDO PARA CONSEGUIR FAZER O LOGIN ASSIM QUE EU ACESSAR O MEU ----SISTEMA ADM-----
    {
        path: 'admin/login/operacoes',
        component: Login
    },
    {
        path: 'admin/login/gerente',
        component: Login
    },

    // AQUI SERVE PARA ABRIR A MINHA TELA INCIAL DA PARTE DO GERENTE 
    {
        path: 'admin/cozinha/gerente',
        component: Gerente,
        canActivate: [gerenteGuard]
    },
    {
        path: 'admin/cozinha/operacoes',
        component: Operacoes,
        canActivate: [logadoGuard]
    },


    {
        path: 'admin/cozinha/operacoes/cardapio',
        component: Cardapio,
        canActivate: [permissaoGuard('cliente')]
    },
    {
        path: 'admin/cozinha/operacoes/cardapio/:mesaId',
        component: Cardapio,
        canActivate: [permissaoGuard('cliente')]
    }
   ];