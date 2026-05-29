import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Reservas } from './pages/reservas/reservas';

// import { Painel } from './admin/painel/painel';
import { Cozinha } from './admin/cozinha/cozinha';
import { Garcom } from './admin/cozinha/garcom/garcom';
import { Estoque } from './admin/cozinha/estoque/estoque';
import { Esg } from './admin/cozinha/esg/esg';

import { Cliente } from './admin/cozinha/cliente/cliente';

// importando rotas para conseguir cadastrar os produtos
import { Produtos } from './admin/cozinha/produtos/produtos';

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
        path: 'admin/produtos',
        component: Produtos
    },

    {
        path: 'admin/cozinha',
        component: Cozinha
    },

    {
        path: 'admin/garcom',
        component: Garcom
    },

    {
       path: 'admin/cliente',
       component: Cliente
    },
    {
       path: 'admin/estoque',
       component: Estoque
    },
    
    {
       path: 'admin/esg',
       component: Esg
    }
   ];
