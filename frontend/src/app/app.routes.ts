import { Routes } from '@angular/router';

import { Home } from './pages/home/home';

// importando rotas para conseguir cadastrar os produtos
import { Produtos } from './pages/produtos/produtos';

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
        path: 'produtos',
        component: Produtos
    }
];
