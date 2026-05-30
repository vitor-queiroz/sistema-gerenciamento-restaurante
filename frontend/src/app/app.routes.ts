import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Reservas } from './pages/reservas/reservas';

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

import { Login } from './admin/login/login';
import { Gerente } from './admin/gerente/gerente';


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
        path: 'admin/cozinha/operacoes/garcom',
        component: Garcom
    },

    {
       path: 'admin/cozinha/operacoes/cliente',
       component: Cliente
    },
    {
       path: 'admin/cozinha/operacoes/estoque',
       component: Estoque
    },
    
    {
       path: 'admin/cozinha/operacoes/esg',
       component: Esg
    },
    {
       path: 'admin/cozinha/operacoes/pedidos',
       component: Pedido
    },
    {
        path: 'admin/cozinha',
        component: Cozinha
    },
    
    {
       path: 'admin/cozinha/gerente/acessos',
       component: Acessos
    },
    {
        path: 'admin/cozinha/gerente/produtos',
        component: Produtos
    },
    {
        path: 'admin/cozinha/gerente/funcionarios',
        component: Funcionarios
    },
    {
       path: 'admin/cozinha/gerente/relatorios',
       component: Relatorios
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
        component: Gerente
    }
   ];
