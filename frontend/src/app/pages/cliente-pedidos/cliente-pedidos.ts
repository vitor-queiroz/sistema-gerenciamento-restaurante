import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Prato {
  id: number;
  nome: string;
  descricao: string;
  peso: string;
  preco: number;
  imagem: string;
  categoria: string;
}

interface ItemCarrinho {
  prato: Prato;
  quantidade: number;
}

@Component({
  selector: 'app-cliente-pedidos',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cliente-pedidos.html',
  styleUrl: './cliente-pedidos.css',
})
export class ClientePedidos implements OnInit {
  categorias = [
    'Prato Feito',
    'Prato do Dia',
    'Carnes',
    'Acompanhamentos',
    'Saladas',
    'Bebidas',
  ];

  categoriaSelecionada = 'Prato Feito';
  carrinho: ItemCarrinho[] = [];
  usuarioLogado: any = null;

  pratos: Prato[] = [
    {
      id: 1,
      nome: 'Prato Feito Executivo',
      descricao: 'Arroz, feijão, bife acebolado, batata frita e salada verde',
      peso: '450g',
      preco: 28.9,
      imagem: 'assets/img/prato1.jpg',
      categoria: 'Prato Feito',
    },
    {
      id: 2,
      nome: 'Prato Feito Completo',
      descricao: 'Arroz, feijão, frango grelhado, farofa, vinagrete e mandioca frita',
      peso: '500g',
      preco: 32.9,
      imagem: 'assets/img/prato2.jpg',
      categoria: 'Prato Feito',
    },
    {
      id: 3,
      nome: 'Prato Feito Vegetariano',
      descricao: 'Arroz integral, feijão, legumes grelhados na manteiga e salada completa',
      peso: '400g',
      preco: 26.9,
      imagem: 'assets/img/prato3.jpg',
      categoria: 'Prato Feito',
    },
    {
      id: 4,
      nome: 'Peixe Grelhado',
      descricao: 'Peixe fresco grelhado com limão, acompanhado de legumes frescos',
      peso: '350g',
      preco: 45.9,
      imagem: 'assets/img/peixe.jpg',
      categoria: 'Prato do Dia',
    },
    {
      id: 5,
      nome: 'Feijoada Especial',
      descricao: 'Feijoada tradicional com carnes sortidas, arroz e farofa',
      peso: '600g',
      preco: 42.9,
      imagem: 'assets/img/feijoada.jpg',
      categoria: 'Prato do Dia',
    },
    {
      id: 6,
      nome: 'Picanha Grelhada',
      descricao: 'Picanha suculenta grelhada na brasa com tempero da casa',
      peso: '300g',
      preco: 58.9,
      imagem: 'assets/img/picanha.jpg',
      categoria: 'Carnes',
    },
    {
      id: 7,
      nome: 'Costela Defumada',
      descricao: 'Costela macia defumada no carvalho com molho barbecue',
      peso: '400g',
      preco: 65.9,
      imagem: 'assets/img/costela.jpg',
      categoria: 'Carnes',
    },
    {
      id: 8,
      nome: 'Batata Frita Crocante',
      descricao: 'Batata frita crocante temperada com sal fino',
      peso: '250g',
      preco: 12.9,
      imagem: 'assets/img/batata.jpg',
      categoria: 'Acompanhamentos',
    },
    {
      id: 9,
      nome: 'Mandioca Frita',
      descricao: 'Mandioca frita crocante e sequinha',
      peso: '200g',
      preco: 10.9,
      imagem: 'assets/img/mandioca.jpg',
      categoria: 'Acompanhamentos',
    },
    {
      id: 10,
      nome: 'Salada Tropical',
      descricao: 'Mix de folhas verdes com tomate, cenoura, abacaxi e vinagrete',
      peso: '300g',
      preco: 18.9,
      imagem: 'assets/img/salada.jpg',
      categoria: 'Saladas',
    },
    {
      id: 11,
      nome: 'Refrigerante Lata',
      descricao: 'Refrigerante gelado diversos sabores',
      peso: '350ml',
      preco: 5.9,
      imagem: 'assets/img/refrigerante.jpg',
      categoria: 'Bebidas',
    },
    {
      id: 12,
      nome: 'Cerveja Premium',
      descricao: 'Cerveja gelada de qualidade premium',
      peso: '600ml',
      preco: 12.9,
      imagem: 'assets/img/cerveja.jpg',
      categoria: 'Bebidas',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Recuperar usuário logado
    const usuario = localStorage.getItem('usuarioLogado');
    if (usuario) {
      this.usuarioLogado = JSON.parse(usuario);
    } else {
      // Se não estiver logado, redirecionar para login
      this.router.navigate(['/cliente-login']);
    }
  }

  // Filtrar pratos pela categoria selecionada
  get pratosFiltrados(): Prato[] {
    return this.pratos.filter((p) => p.categoria === this.categoriaSelecionada);
  }

  // Adicionar prato ao carrinho
  adicionarAoCarrinho(prato: Prato) {
    const itemExistente = this.carrinho.find((item) => item.prato.id === prato.id);

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.carrinho.push({
        prato,
        quantidade: 1,
      });
    }

    alert(`${prato.nome} adicionado ao carrinho!`);
  }

  // Calcular total do carrinho
  get totalCarrinho(): number {
    return this.carrinho.reduce(
      (total, item) => total + item.prato.preco * item.quantidade,
      0
    );
  }

  // Remover item do carrinho
  removerDoCarrinho(id: number) {
    this.carrinho = this.carrinho.filter((item) => item.prato.id !== id);
  }

  // Aumentar quantidade
  aumentarQuantidade(id: number) {
    const item = this.carrinho.find((i) => i.prato.id === id);
    if (item) {
      item.quantidade++;
    }
  }

  // Diminuir quantidade
  diminuirQuantidade(id: number) {
    const item = this.carrinho.find((i) => i.prato.id === id);
    if (item && item.quantidade > 1) {
      item.quantidade--;
    }
  }

  // Fazer pedido
  fazerPedido() {
    if (this.carrinho.length === 0) {
      alert('Adicione itens ao carrinho antes de fazer o pedido!');
      return;
    }

    const pedido = {
      id: Date.now(),
      cliente: this.usuarioLogado,
      itens: this.carrinho,
      total: this.totalCarrinho,
      status: 'Recebido',
      dataPedido: new Date().toLocaleString('pt-BR'),
      dataEntrega: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString(
        'pt-BR'
      ), // 1 hora depois
    };

    // Salvar pedido no localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    console.log('Pedido realizado:', pedido);
    alert(
      `Pedido realizado com sucesso! Número do pedido: ${pedido.id}\nTempo estimado: 1 hora`
    );

    // Limpar carrinho
    this.carrinho = [];

    // Redirecionar para página de acompanhamento
    this.router.navigate(['/cliente-acompanhamento', pedido.id]);
  }

  // Voltar para home
  voltarHome() {
    this.router.navigate(['/home']);
  }

  // Fazer logout
  logout() {
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/home']);
  }
}
