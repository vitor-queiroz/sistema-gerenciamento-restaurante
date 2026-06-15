/**
 * Gera um hash SHA-256 (em hexadecimal) de uma senha.
 *
 * Usado tanto no cadastro de funcionários (para nunca salvar a senha
 * em texto puro no Firestore) quanto no login (para comparar o hash
 * da senha digitada com o hash salvo).
 *
 * OBS: SHA-256 simples não é o ideal para senhas (não tem "salt" nem
 * custo computacional como bcrypt/argon2), mas já é uma melhoria
 * grande em relação a texto puro e funciona 100% no navegador, sem
 * libs externas. Se no futuro migrarem para Firebase Authentication,
 * esse arquivo pode ser removido.
 */
export async function hashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder();
  const dados = encoder.encode(senha);

  const buffer = await crypto.subtle.digest('SHA-256', dados);

  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Senha temporária usada quando o gerente redefine a senha de um funcionário. */
export const SENHA_PADRAO = 'mudar123';
