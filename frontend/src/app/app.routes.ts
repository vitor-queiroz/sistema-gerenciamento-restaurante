import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Reservas } from './pages/reservas/reservas';

// importando rotas para conseguir cadastrar os produtos
import { Produtos } from './pages/admin/produtos/produtos';

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
    }
];
