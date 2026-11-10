# Próximas validações para publicar o OrientaSaúde Original com segurança

Atualizado em 10/11/2026. Mudanças desta entrega estão apenas em `OrientaSaude/`, não no Studio.

## O que foi implementado no site

- Página pública **emergencia.html**, sem autenticação, com SAMU 192 (Brasil), SEME 141 (Paraguai) e emergência médica 107 (Misiones, Argentina), com referências institucionais. A página pode ser armazenada pelo PWA para consulta offline após a instalação/cache.
- Página pública **privacidade.html**, explicando o que se sabe sobre o funcionamento do protótipo, limites e itens legais pendentes. Links em Entrar, Criar conta e Perfil.
- Cadastro com texto passo a passo, indicação local de comprimento/igualdade de senha, leitura das informações de privacidade e foco/teclado mais visível no celular.
- Registros e lembretes agora separados **por usuário na interface do mesmo navegador** por meio de UUID de conta validado pelo Supabase Auth. A separação NÃO equivale a criptografia ou proteção contra pessoas com acesso ao dispositivo.
- Registros antigos não são atribuídos automaticamente a uma conta: quem tem certeza de que são seus pode importar manualmente na seção Perfil; a cópia antiga não vinculada é apagada após a importação bem-sucedida.
- Perfil da conta oferece **Sair e apagar relatos/lembretes desta conta neste aparelho**. Excluir a conta também tenta limpar os dados locais dessa conta.
- Início, Agenda, Resumo e exclusão de relatos agora usam a mesma chave do usuário autenticado; o PWA renova os scripts para evitar versões antigas.
- Mais contexto de país, fontes e limitações no mapa; links de emergência por país.
- `tests/smoke.cjs`: testes estáticos automáticos, com workflow no GitHub Actions, sem segredos.

## Passos que dependem do proprietário do projeto

### 1. Segurança do Supabase — PRIORIDADE ALTA

Use **duas contas fictícias, A e B**, com emails de teste diferentes, SEM documentos pessoais reais. Entre em A e grave somente perfil fictício; entre em B num navegador separado e confirme que não consegue consultar, alterar ou apagar o perfil de A por nenhum endpoint. Teste tanto as funções de perfil v1 como v2 e garanta que a tabela privada não permita consulta direta do cliente.

No **Supabase → SQL Editor**, verifique se as funções públicas continuam no modo invoker:

```sql
SELECT p.proname, CASE WHEN p.prosecdef THEN 'DEFINER' ELSE 'INVOKER' END AS modo
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
  'save_my_profile','read_my_profile','delete_my_profile','delete_my_account',
  'save_my_profile_v2','read_my_profile_v2','delete_my_profile_v2'
)
ORDER BY p.proname;
```

Depois, faça auditoria independente de: RLS nas tabelas privadas, permissões de `authenticated`, `auth.uid()`, criptografia Vault, tratamento de erros, retenção, exclusão da conta e backups. Não compartilhe `sb_secret_*`, service_role, senha do banco, segredo do Vault, tokens ou CPF real. A confirmação de que a página está funcionando não comprova isolamento entre usuários.

### 2. Política de privacidade e LGPD — PRIORIDADE ALTA

A página `privacidade.html` é **informativa**, não substitui política jurídica aprovada. Antes de coletar dados reais, identifique e publique o responsável/controlador, contato funcional para titulares, finalidades, hipóteses legais, retenção, exclusão/portabilidade, locais de armazenamento e transferência internacional, tratamento de menores e direitos dos usuários.

**Reavalie a obrigatoriedade** de CPF/DNI/C.I., data de nascimento e identidade de gênero em um produto de educação em saúde. Use minimização: se não forem essenciais para a funcionalidade demonstrativa, proponha torná-los opcionais ou removê-los em vez de exigir consentimento genérico.

Referência ANPD: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares

### 3. Revisão clínica e editorial — PRIORIDADE ALTA

Peça revisão por profissionais habilitados dos fluxos de sintomas, sinais de alerta, critérios de intensidade, linguagem e qualquer indicador de nível de atenção. O algoritmo atual é **demonstrativo**, não uma triagem validada. Nunca utilize no atendimento real até aprovação. Documente autor/revisor, data, evidência clínica e próxima revisão.

As traduções de orientações de saúde em português, espanhol e demais idiomas também precisam de revisão técnica/humana: textos traduzidos automaticamente não devem ser publicados como orientação clínica validada.

### 4. Dados de saúde e sincronização entre aparelhos — DEPENDE DE INFRAESTRUTURA

A separação local por conta melhora a interface, mas **não cifra o armazenamento local**. Para histórico sincronizado e seguro de sintomas e lembretes, será necessário:

1. Definir se há realmente necessidade de enviar esses dados para um servidor e obter base legal/transparência adequada.
2. Criar uma tabela por usuário com autorização RLS/regras testadas, criptografia autenticada, retenção/exclusão e logs de acesso apropriados.
3. Criar uma migração de dados **voluntária** e auditável; nunca sincronizar dados antigos de navegador compartilhado automaticamente.
4. Testar isolamento A/B, acesso offline, conflitos, trocas de dispositivos e exportação/exclusão.

**Nenhuma sincronização de sintomas com o Supabase foi ativada nesta entrega.** Isso exige uma implementação separada e validação antes de usar dados reais.

### 5. Notificações confiáveis — DEPENDE DE INFRAESTRUTURA

O arquivo de agenda `.ics` continua sendo a alternativa de exportação para um app de calendário que ofereça notificações. Notificações confiáveis com o site fechado exigem permissões, suporte PWA e, para envio remoto, servidor/agendador, opt-in de cada usuário e políticas de segurança. Não se deve prometer lembretes push só com HTML/JS estáticos no GitHub Pages.

### 6. Validação em aparelhos físicos e idioma

- Android Chrome: 320px / 360px / 390px, teclado cobrindo formulário, rotação e instalação PWA.
- iPhone Safari/VoiceOver: foco, zoom 200%, botões, consentimento, deep-link do e-mail e aba anônima.
- Leitores de tela TalkBack e VoiceOver; navegação com teclado, alto contraste e redução de movimento.
- Revisar traduções da interface e orientações em português, espanhol e inglês com falantes nativos, especialmente os termos de triagem e emergência.
- Verificar se os telefones oficiais 192, 141 e 107 funcionam **na localidade real**, inclusive cobertura transfronteiriça. Não afirmar disponibilidade em tempo real.
- Conferir endereços, telefones e horários de cada unidade com fontes oficiais antes de divulgação.

### 7. Rodar testes automáticos

Execute `node OrientaSaude/tests/smoke.cjs` com Node.js 22 ou acompanhe o workflow **OrientaSaúde Original - Verificações estáticas** no GitHub Actions. Esses testes verificam a estrutura e a sintaxe, **não** substituem testes de autenticação reais, RLS, pen-test, acessibilidade em aparelho ou validação clínica.

## Verificação funcional rápida

1. Abra `/OrientaSaude/` sem login: deve exigir Entrar/Criar conta; clique em **Emergência sem login** e confira os números por país.
2. Crie uma conta fictícia, confirme o e-mail, preencha o perfil e acesse Início.
3. Salve um lembrete e um relato fictício na conta A. Confirme que aparecem em Agenda e Resumo.
4. Saia, faça login na conta B no mesmo navegador: **não devem aparecer** relatos e lembretes de A.
5. Volte à conta A: os dados devem reaparecer **somente naquele navegador**, se não foram apagados.
6. Em Perfil, veja a opção de importação dos dados antigos não vinculados somente se houver registros antigos. **Não importe** se não tiver certeza de que são seus.
7. Use **Sair e apagar registros deste aparelho** e confirme que a conta mantém perfil no Supabase, mas não os registros locais.
8. Teste mensagens de senha curta, confirmação diferente, reenvio de e-mail e recuperação, sem publicar credenciais.

## Limitação permanente da hospedagem estática

Os arquivos públicos HTML/JS/CSS hospedados no GitHub Pages são acessíveis sem autenticação no servidor. O bloqueio atual é da **interface do navegador**. Somente os dados autorizados no Supabase podem contar com controle de acesso no backend. Para proteger páginas privadas em nível de servidor, migrar para hospedagem com middleware de autenticação/servidor que valide tokens antes de enviar o conteúdo.
