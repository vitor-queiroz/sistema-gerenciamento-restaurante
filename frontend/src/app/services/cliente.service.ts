import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Firestore,
  setDoc,
  doc,
} from 'firebase/firestore';
import { firebaseConfig } from '../../conteudoFirebase/firebase.config';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private firebaseDisponivel = false;

  constructor() {
    this.inicializarFirebase();
  }

  private inicializarFirebase() {
    try {
      console.log('Tentando inicializar Firebase...');
      
      // Verificar se Firebase já está inicializado
      const apps = getApps();
      let app;
      
      if (apps.length === 0) {
        console.log('Inicializando Firebase com a chave...');
        app = initializeApp(firebaseConfig);
      } else {
        app = apps[0];
        console.log('Firebase já estava inicializado');
      }
      
      try {
        this.auth = getAuth(app);
        this.firestore = getFirestore(app);
        this.firebaseDisponivel = true;
        console.log('✅ Firebase inicializado com sucesso!');
      } catch (authError) {
        console.warn('⚠️ Erro ao inicializar Auth/Firestore:', authError);
        console.log('💾 Usando localStorage como fallback');
        this.firebaseDisponivel = false;
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      console.log('💾 Usando localStorage como fallback');
      this.firebaseDisponivel = false;
    }
  }

  // CADASTRO DE NOVO CLIENTE
  async cadastrarCliente(dados: any): Promise<any> {
    try {
      console.log('Iniciando cadastro de cliente...');
      console.log('Firebase disponível?', this.firebaseDisponivel);

      // Se Firebase não está disponível, usar localStorage
      if (!this.firebaseDisponivel) {
        return this.cadastrarClienteLocal(dados);
      }

      if (!this.auth || !this.firestore) {
        throw new Error('Firebase não foi inicializado corretamente');
      }

      // Validar dados
      if (!dados.email || !dados.senha || dados.senha.length < 6) {
        throw new Error('Email e senha (mínimo 6 caracteres) são obrigatórios');
      }

      // Criar usuário no Firebase Authentication
      console.log('Criando usuário no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        dados.email,
        dados.senha
      );

      const user = userCredential.user;
      console.log('Usuário criado com ID:', user.uid);

      // Preparar dados para salvar no Firestore
      const clienteData = {
        id: user.uid,
        nome: dados.nome || '',
        email: dados.email,
        telefone: dados.telefone || '',
        endereco: {
          cep: dados.cep || '',
          estado: dados.estado || '',
          cidade: dados.cidade || '',
          rua: dados.rua || '',
          complemento: dados.complemento || '',
        },
        dataCadastro: new Date().toISOString(),
        criadoEm: new Date(),
        origem: 'firebase',
      };

      // Salvar dados adicionais no Firestore
      console.log('Salvando dados no Firestore...');
      await setDoc(doc(this.firestore, 'clientes', user.uid), clienteData);

      console.log('Cliente cadastrado com sucesso no Firebase:', clienteData);
      return clienteData;
    } catch (error: any) {
      console.error('Erro ao cadastrar cliente:', error);
      
      // Se falhar no Firebase, tentar com localStorage
      if (!this.firebaseDisponivel || error.code === 'auth/configuration-not-found') {
        console.log('Revertendo para localStorage...');
        return this.cadastrarClienteLocal(dados);
      }
      
      throw this.tratarErroFirebase(error);
    }
  }

  // CADASTRO LOCAL (FALLBACK)
  private cadastrarClienteLocal(dados: any): any {
    console.log('Salvando cliente no localStorage...');
    
    // Verificar se email já existe
    const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
    const emailExiste = clientesLocal.some((c: any) => c.email === dados.email);
    
    if (emailExiste) {
      throw new Error('Este email já está cadastrado');
    }

    // Criar novo cliente
    const novoCliente = {
      id: Date.now().toString(),
      nome: dados.nome || '',
      email: dados.email,
      senha: dados.senha, // ⚠️ Apenas para desenvolvimento!
      telefone: dados.telefone || '',
      endereco: {
        cep: dados.cep || '',
        estado: dados.estado || '',
        cidade: dados.cidade || '',
        rua: dados.rua || '',
        complemento: dados.complemento || '',
      },
      dataCadastro: new Date().toISOString(),
      origem: 'localStorage',
    };

    clientesLocal.push(novoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientesLocal));
    
    console.log('✅ Cliente salvo no localStorage:', novoCliente);
    return novoCliente;
  }

  // LOGIN DO CLIENTE
  async loginCliente(email: string, senha: string): Promise<any> {
    try {
      console.log('Tentando fazer login com email:', email);

      // Se Firebase não está disponível, usar localStorage
      if (!this.firebaseDisponivel) {
        return this.loginClienteLocal(email, senha);
      }

      if (!this.auth || !this.firestore) {
        throw new Error('Firebase não foi inicializado corretamente');
      }

      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        senha
      );

      const user = userCredential.user;
      console.log('Login realizado com sucesso, buscando dados do cliente...');

      // Recuperar dados do Firestore
      const clienteSnap = await getDocs(
        query(collection(this.firestore, 'clientes'), where('email', '==', email))
      );

      if (clienteSnap.empty) {
        console.log('Dados do cliente não encontrados no Firestore');
        // Se não encontrou no Firestore, retornar apenas dados do Auth
        return {
          id: user.uid,
          email: user.email,
          nome: user.displayName || 'Usuário',
          origem: 'firebase',
        };
      }

      const clienteData = clienteSnap.docs[0].data();
      console.log('Cliente logado com sucesso:', clienteData);
      return clienteData;
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      // Se falhar no Firebase, tentar com localStorage
      if (!this.firebaseDisponivel || error.code === 'auth/configuration-not-found') {
        console.log('Revertendo para localStorage...');
        return this.loginClienteLocal(email, senha);
      }
      
      throw this.tratarErroFirebase(error);
    }
  }

  // LOGIN LOCAL (FALLBACK)
  private loginClienteLocal(email: string, senha: string): any {
    console.log('Buscando cliente no localStorage...');
    
    const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
    const cliente = clientesLocal.find(
      (c: any) => c.email === email && c.senha === senha
    );

    if (!cliente) {
      throw new Error('Email ou senha inválidos');
    }

    console.log('✅ Cliente encontrado no localStorage:', cliente);
    return cliente;
  }

  // VERIFICAR SE EMAIL JÁ EXISTE
  async emailExiste(email: string): Promise<boolean> {
    try {
      // Se Firebase não está disponível, usar localStorage
      if (!this.firebaseDisponivel) {
        const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
        return clientesLocal.some((c: any) => c.email === email);
      }

      if (!this.firestore) {
        return false;
      }

      const q = query(
        collection(this.firestore, 'clientes'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      // Se falhar no Firebase, verificar no localStorage
      const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
      return clientesLocal.some((c: any) => c.email === email);
    }
  }

  // SALVAR PEDIDO NO FIRESTORE
  async salvarPedido(pedido: any): Promise<any> {
    try {
      console.log('Salvando pedido...');
      console.log('Firebase disponível?', this.firebaseDisponivel);

      // Se Firebase não está disponível, usar localStorage
      if (!this.firebaseDisponivel) {
        return this.salvarPedidoLocal(pedido);
      }

      if (!this.firestore) {
        throw new Error('Firestore não foi inicializado corretamente');
      }

      // Adicionar pedido à coleção 'pedidos'
      const docRef = await addDoc(collection(this.firestore, 'pedidos'), {
        ...pedido,
        dataPedido: new Date().toISOString(),
        criadoEm: new Date(),
        status: 'Recebido',
      });

      console.log('Pedido salvo com ID no Firebase:', docRef.id);

      // Também salvar na subcoleção de pedidos do cliente
      if (pedido.clienteId) {
        try {
          await addDoc(
            collection(
              this.firestore,
              'clientes',
              pedido.clienteId,
              'pedidos'
            ),
            {
              ...pedido,
              dataPedido: new Date().toISOString(),
              criadoEm: new Date(),
              status: 'Recebido',
              pedidoId: docRef.id,
            }
          );
          console.log('Pedido salvo também na subcoleção do cliente');
        } catch (subError) {
          console.warn('Erro ao salvar pedido na subcoleção:', subError);
          // Não falhar se a subcoleção der erro
        }
      }

      return { ...pedido, id: docRef.id };
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error);
      
      // Se falhar no Firebase, tentar com localStorage
      if (!this.firebaseDisponivel || error.code === 'auth/configuration-not-found') {
        console.log('Revertendo para localStorage...');
        return this.salvarPedidoLocal(pedido);
      }
      
      throw this.tratarErroFirebase(error);
    }
  }

  // SALVAR PEDIDO LOCAL (FALLBACK)
  private salvarPedidoLocal(pedido: any): any {
    console.log('Salvando pedido no localStorage...');
    
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const novoId = Date.now().toString();
    
    const pedidoLocal = {
      ...pedido,
      id: novoId,
      dataPedido: new Date().toISOString(),
      status: 'Recebido',
      origem: 'localStorage',
    };

    pedidos.push(pedidoLocal);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    console.log('✅ Pedido salvo no localStorage:', pedidoLocal);
    return pedidoLocal;
  }

  // LOGOUT
  async logout(): Promise<void> {
    try {
      if (this.firebaseDisponivel && this.auth) {
        console.log('Fazendo logout no Firebase...');
        await signOut(this.auth);
      }
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  // TRATAT ERROS DO FIREBASE
  private tratarErroFirebase(error: any): string {
    let mensagem = 'Erro desconhecido. Tente novamente.';

    if (!error) {
      return mensagem;
    }

    const code = error.code || error.errorCode || '';
    const message = error.message || '';

    console.error('Código de erro:', code);
    console.error('Mensagem de erro:', message);

    if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
      mensagem = 'Este email já está cadastrado. Tente fazer login.';
    } else if (code === 'auth/weak-password' || message.includes('weak-password')) {
      mensagem = 'A senha deve ter pelo menos 6 caracteres';
    } else if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
      mensagem = 'Email inválido. Verifique o formato.';
    } else if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
      mensagem = 'Email não cadastrado. Verifique ou faça um novo cadastro.';
    } else if (code === 'auth/wrong-password' || message.includes('wrong-password')) {
      mensagem = 'Senha incorreta. Tente novamente.';
    } else if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
      mensagem = 'Firebase não está configurado. Usando armazenamento local.';
    } else if (message) {
      mensagem = message;
    }

    return mensagem;
  }
}
