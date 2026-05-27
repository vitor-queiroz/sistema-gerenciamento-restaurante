import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Reservas } from './pages/reservas/reservas';

import { Painel } from './admin/painel/painel';
import { Cozinha } from './admin/cozinha/cozinha';
import { Garcom } from './admin/garcom/garcom';
import { Estoque } from './admin/estoque/estoque';
import { Mesas } from './admin/mesas/mesas';
import { Esg } from './admin/esg/esg';

import { Usuarios } from './admin/usuarios/usuarios';

// importando rotas para conseguir cadastrar os produtos
import { Produtos } from './admin/produtos/produtos';

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
        path:'admin/painel',
        component: Painel
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
       path: 'admin/mesas',
       component: Mesas
    },
    {
       path: 'admin/estoque',
       component: Estoque
    },
    {
       path: 'admin/usuarios',
       component: Usuarios
    }
    {
       path: 'admin/esg',
       component: Esg
    }
   ];
