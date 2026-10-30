# OrientaSaúde — checklist de verificação (30/10/2026)

Este checklist complementa as verificações estáticas realizadas na implementação das melhorias. **Não substitui testes de usabilidade em dispositivos reais nem validação clínica.**

## Primeira execução e navegação
- [ ] Abrir `index.html` no GitHub Pages; verificar acessos Mapa, Agenda, Dicas, Especialidades, Unidades e Registros
- [ ] Pesquisar por "hospital" na busca inicial e acessar os resultados
- [ ] Testar teclado (Tab, Shift+Tab, Enter e Esc) e link "Pular para o conteúdo"
- [ ] Selecionar Foz, Ciudad del Este e Puerto Iguazú; confirmar contatos de emergência específicos
- [ ] Selecionar português, espanhol, inglês, japonês, árabe, chinês, coreano e crioulo haitiano; verificar bandeiras e direção RTL do árabe

## Mapa de atendimento
- [ ] Pesquisar por nome e bairro, usar filtro Hospital/UPA e UBS/postos
- [ ] Selecionar estabelecimento e verificar endereço, telefone, horário cadastral e fonte
- [ ] Confirmar que mapas externos **não carregam automaticamente**; clicar "Carregar mapa" para ativar
- [ ] Abrir rota e verificar se o destino corresponde à unidade selecionada
- [ ] Alterar cidade, confirmar atualização da lista e emergência local
- [ ] Usar sem internet: a lista previamente armazenada pode abrir, mas os mapas externos não

## Agenda
- [ ] Abrir Agenda; verificar que os compromissos existentes aparecem no mês
- [ ] Cadastrar compromisso de teste com data e hora; confirmar salvamento e visualização
- [ ] Cadastrar recorrência diária, semanal ou mensal; conferir próximos dias
- [ ] Exportar arquivo `.ics`, importar em um calendário compatível e conferir título, data e recorrência
- [ ] Confirmar que o próprio site **não envia alertas quando fechado** e que o arquivo `.ics` pode conter dados pessoais

## Relatos e privacidade
- [ ] Criar relato demonstrativo, verificar histórico e abrir Resumo para consulta
- [ ] Alternar "incluir descrições" no resumo e imprimir/salvar como PDF pelo navegador
- [ ] Ativar modo discreto e confirmar que prévias no histórico ficam ocultadas visualmente
- [ ] Ativar alto contraste e testar leitura/foco dos controles
- [ ] Testar exclusão de relatos antigos **apenas com dados de teste**, confirmar quantidade informada
- [ ] Testar "Apagar dados locais" apenas em navegador de testes (apaga registros e preferências)
- [ ] Confirmar que modo discreto **não criptografa** conteúdo de `localStorage`

## Aplicativo instalável e offline
- [ ] Visitar página online, aguardar registro do service worker e verificar recursos em Cache Storage
- [ ] Verificar manifesto com `assets/icon-192.png` e `assets/icon-512.png`
- [ ] Verificar opção de instalação no Chrome/Edge e "Adicionar à Tela de Início" no Safari
- [ ] Desconectar a rede e abrir início, dicas, mapa e agenda previamente armazenados
- [ ] Para recursos não armazenados, verificar a página de aviso offline
- [ ] Reconectar e atualizar: dados públicos podem ficar temporariamente desatualizados pelo cache

## Segurança de conteúdo e operação
- [ ] Revisão profissional de mensagens sobre sintomas, sinais de alerta e urgência (pendente)
- [ ] Traduções de conteúdo clínico por falantes nativos/especialistas (pendente)
- [ ] Conferência institucional de endereços, horários, telefones, especialistas e regras de acesso (pendente)
- [ ] Verificação de privacidade/LGPD e avaliação de riscos antes de uso real (pendente)
- [ ] Testes de leitores de tela, baixa visão, conexões lentas e celulares reais (pendente)

## Escopo do protótipo
Funcionalidade de frontend estático, sem backend, sem banco remoto, sem login, sem agendamento com estabelecimentos e sem acesso a filas em tempo real. Os serviços podem mudar; confirmar diretamente antes de procurar atendimento. O produto **não fornece diagnóstico, prescrição nem triagem validada**.

## Localização no mapa (30/10/2026)
- [ ] Abrir `mapa.html` conectado via HTTPS e verificar **Usar minha localização** e **Informar endereço**
- [ ] Permitir geolocalização quando solicitada: validar mensagem de precisão e habilitação do botão **Carregar mapa**
- [ ] Confirmar que o iframe do Google Maps **não** carrega antes do clique explícito em **Carregar mapa**
- [ ] Negar geolocalização: verificar mensagem de orientação e possibilidade de informar endereço manualmente
- [ ] Informar rua/bairro de referência e carregar o mapa após autorização
- [ ] Selecionar um hospital após definir a origem: confirmar que a rota usa a origem informada quando aberta
- [ ] Limpar localização: verificar que a posição é descartada da memória da página e o botão volta ao estado inicial
- [ ] Trocar de cidade: garantir que os estabelecimentos listados mudam, sem trocar automaticamente a posição física
- [ ] Testar GPS desativado e permissão bloqueada nas configurações do navegador

**Privacidade:** coordenadas/endereço não são gravados no localStorage. O navegador pode consultar seu provedor de geolocalização ao obter GPS; o aplicativo somente envia a localização ao Google Maps após o usuário carregar o mapa ou abrir a rota. O site deve estar em HTTPS e o usuário deve permitir geolocalização. Verificação manual real do prompt de permissão ainda pendente.
