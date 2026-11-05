# Atualização do perfil internacional — OrientaSaúde Original

Este projeto está na pasta **`OrientaSaude`** de `DamettoJ/Desenvolvimentos-da-faculdade`. A versão Studio não é alterada.

## 1. Execute a atualização do banco (obrigatório)

O banco antigo recebia apenas CPF brasileiro. Para permitir Brasil, Paraguai, Argentina e outros países **sem perder a criptografia**, existe um novo script SQL na pasta:

`OrientaSaude/supabase/migrations/20261105030000_profiles_country_v2.sql`

1. Entre no **mesmo projeto** do Supabase que já usa para o Original.
2. Abra **SQL Editor → New query**.
3. No GitHub, abra o arquivo SQL acima, clique **Raw** e copie seu conteúdo completo.
4. Cole no editor, revise que é o projeto correto e clique em **Run**.
5. Quando aparecer **Success**, abra outra consulta e confira:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN
    ('save_my_profile_v2', 'read_my_profile_v2', 'delete_my_profile_v2')
ORDER BY routine_name;
```

**Esperado: 3 linhas.** Se houver erro, não cadastre documentos reais. Anote a mensagem para corrigir antes de continuar.

A migração cria tabela `private.encrypted_profiles_v2` com RLS habilitado e acesso direto revogado; funções privadas usam a **mesma chave já existente no Supabase Vault** para criptografar o JSON por usuário, e RPCs públicas apenas delegam a operações autenticadas. Nenhuma chave privada vai para o GitHub.

## 2. Como funciona o cadastro

Após confirmar o e-mail e entrar:

- País de origem **obrigatório**: Brasil, Paraguai, Argentina ou Outro país (nesse caso informe o nome do país).
- Nome completo **obrigatório**.
- Documento de identificação **obrigatório** e formatado na digitação:
  - **Brasil:** CPF, formato `000.000.000-00`, com dígitos verificadores conferidos.
  - **Argentina:** DNI, por exemplo `12.345.678`; verifica-se apenas o formato/comprimento, não a titularidade.
  - **Paraguai:** Cédula de Identidade (C.I.), por exemplo `1.234.567`; verifica-se apenas o formato/comprimento, não a titularidade.
  - **Outro país:** documento nacional ou passaporte alfanumérico; nome do país obrigatório.
- Data de nascimento **obrigatória**.
- Identidade sexual/de gênero **obrigatória como seleção**, com opção **Prefiro não informar**.
- **Como gostaria de ser chamado(a)?** e **Telefone** agora são opcionais. O nome de preferência, quando informado, substitui o primeiro nome na saudação da tela inicial e é exibido em Perfil.

Os campos **Nome completo** e **Documento** não são campos de autenticação, não usam `type=password` nem nomes associados às credenciais, e desativam o preenchimento automático solicitado ao navegador. Isso reduz o problema de gestores de senha que tentam preencher e-mail e senha indevidamente; extensões podem ignorar `autocomplete="off"`.

## 3. Contas existentes

A migração **não apaga** os perfis antigos (`private.encrypted_profiles`). Após criar as funções v2, o usuário já cadastrado deverá confirmar o país/documento no novo formulário, que pode aproveitar nome e outros campos não documentais do cadastro antigo. O aplicativo só libera a tela inicial depois de salvar o perfil v2 e validá-lo novamente com `read_my_profile_v2`.

Antes da migração v2 ser aplicada, o aplicativo preserva a navegação de contas que já tenham um perfil v1 completo; novos formulários internacionais precisam das RPCs v2 e não serão salvos até a execução do SQL.

## 4. Privacidade e testes

CPF, DNI, C.I., nascimento e identidade sexual/de gênero são informações pessoais potencialmente sensíveis. Teste primeiro com contas e dados fictícios; não use documentos reais de terceiros. Antes de ativar para público, revise necessidade da coleta, base legal/LGPD, consentimento, revisão de segurança do SQL, permissões, isolamento entre duas contas, exclusão, retenção e transparência. Um formato válido **não comprova a identidade real** de uma pessoa.

O GitHub Pages serve arquivos públicos; a proteção efetiva do banco depende da autorização `auth.uid()`, das funções privadas, da criptografia e das permissões no Supabase. As informações de sintomas/lembretes continuam locais do navegador e não são sincronizadas.

Fontes de referência: https://www.argentina.gob.ar/tema/documentacion/dni ; https://www.policianacional.gov.py/identificaciones/cedula-de-identidad/ ; https://supabase.com/docs/guides/database/vault
