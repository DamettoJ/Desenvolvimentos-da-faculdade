# OrientaSaúde Original — ligação com Supabase

> **Repositório correto:** `DamettoJ/Desenvolvimentos-da-faculdade`, pasta `OrientaSaude`.
> O projeto separado `DamettoJ/OrientaSaude-Projeto-2` **não é o Original desta pasta**.
>
> **Situação:** os arquivos de login foram adicionados, mas a conexão fica DESATIVADA até você preencher uma URL válida e a chave pública no arquivo `OrientaSaude/supabase-config.js`. Não cole dados reais antes de testar o banco e as permissões.

## 1. O que já foi criado

- `OrientaSaude/conta.html`: criar conta, entrar, recuperar senha e gerenciar perfil.
- `OrientaSaude/conta.css`, `OrientaSaude/conta.js`: interface e integração com Supabase Auth e RPC do PostgreSQL.
- `OrientaSaude/supabase-config.js`: apenas URL e publishable key públicas, inicialmente vazias.
- Atalhos em Início e Perfil do Original; os dados locais de sintomas/lembretes continuam em localStorage e **não** são enviados ao Supabase.

A conta utiliza Supabase Auth (e-mail e hash de senha). Depois de confirmar o e-mail e entrar, o formulário solicita nome completo, nome de preferência, identidade sexual/de gênero ("Prefiro não informar" é permitido), telefone, CPF brasileiro e data de nascimento. Esses seis campos são enviados por HTTPS a funções RPC do banco, que devem criptografá-los no servidor com pgcrypto/AES-256 e uma chave privada guardada no Supabase Vault.

**Importante:** nome, CPF, telefone, gênero e nascimento não são gravados no localStorage nem em user_metadata. O e-mail fica no Supabase Auth e não faz parte do blob com AES-256. Isto NÃO é criptografia ponta a ponta. A sessão de login é mantida em sessionStorage enquanto a aba estiver aberta.

## 2. Localize URL e chave pública

No painel do Supabase do projeto:
- **Project URL**: em `Integrations → Data API`, ou no botão `Connect` do seu projeto. Formato `https://<project-ref>.supabase.co`.
- **Publishable key**: `Settings → API Keys → Publishable and secret API keys`. Copie **somente** a chave que começa com `sb_publishable_`.

Não utilize `sb_secret_`, `service_role`, senha do PostgreSQL, chave do Vault ou JWT de usuário. A publishable key é projetada para frontend; a proteção dos dados depende das permissões no banco.

## 3. Preencha o arquivo correto no GitHub

1. Abra `https://github.com/DamettoJ/Desenvolvimentos-da-faculdade/blob/main/OrientaSaude/supabase-config.js`.
2. Clique no lápis (**Edit this file**). Preencha os dois valores dentro das aspas, sem retirar a sintaxe:
   ```js
   window.ORIENTA_SUPABASE = Object.freeze({
     url: 'https://SEU-ID-REAL.supabase.co',
     publishableKey: 'sb_publishable_SUA_CHAVE_PUBLICA_COMPLETA'
   });
   ```
3. Confirme o `Commit changes` na `main`.
4. Aguarde o GitHub Pages publicar a alteração. Se o site mantiver versão antiga, atualize com Ctrl+F5.

**Não copie nenhum dos exemplos literais acima**; coloque somente os valores reais do seu projeto.

## 4. Corrija as URLs de Authentication

No Supabase, abra `Authentication → URL Configuration`.

- **Site URL**: `https://damettoj.github.io/Desenvolvimentos-da-faculdade/OrientaSaude/`
- **Redirect URL**: `https://damettoj.github.io/Desenvolvimentos-da-faculdade/OrientaSaude/conta.html`

As URLs da versão `OrientaSaude-Projeto-2` não servem para este projeto. Se as URLs anteriores ainda estiverem autorizadas, remova-as após confirmar que não usa mais o outro protótipo.

Em `Authentication → Providers → Email`: habilite e-mail/senha e exija confirmação por e-mail. Em produção, configure SMTP confiável, prevenção de abuso e limites de taxa.

## 5. Confira no banco ANTES de cadastrar pessoas

O resultado `0` de `SELECT COUNT(*) FROM private.encrypted_profiles;` confirma somente que a tabela existe e está vazia; **não confirma criptografia, validação de identidade nem funcionamento do login.**

No SQL Editor do Supabase, execute **somente esta consulta de leitura**:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'save_my_profile', 'read_my_profile',
    'delete_my_profile', 'delete_my_account'
  )
ORDER BY routine_name;
```

**Resultado esperado: 4 linhas**, correspondentes às quatro funções listadas. Se aparecerem menos de 4, o SQL original não foi aplicado integralmente. Não faça cadastros pessoais; valide o script de banco antes de avançar.

Verifique também no Supabase se `private.encrypted_profiles` tem RLS ativado, acesso direto revogado de `anon` e `authenticated` e se as funções privilegiadas não foram expostas no esquema público. É necessária uma verificação de segurança com **duas contas fictícias** (A não pode visualizar dados de B).

## 6. Teste a tela Original

Acesse: `https://damettoj.github.io/Desenvolvimentos-da-faculdade/OrientaSaude/conta.html`.

Se aparecer `Cadastro ainda não ativado`, verifique a configuração publicada. Se aparecer `Entrar` / `Criar conta`, a interface reconheceu a conexão, mas ainda **não** é prova de que o banco está seguro. Teste primeiro com dados de demonstração e com dois usuários distintos, nunca CPF verdadeiro de terceiros.

## Limites e revisão obrigatória

Este é um projeto acadêmico informativo; as orientações clínicas não substituem avaliação médica. Antes de liberar CPF, identidade sexual/de gênero e outros dados reais, revise finalidade, consentimento e/ou base legal LGPD, segurança das rotinas privilegiadas do PostgreSQL, minimização de dados, retenção e direitos dos titulares. CPF obrigatório precisa de alternativa para residentes de outros países da Tríplice Fronteira. `LocalStorage` dos relatos de sintomas é separado e não é criptografado.

Referências:
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/api
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security
