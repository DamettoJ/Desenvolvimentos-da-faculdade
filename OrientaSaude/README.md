# OrientaSaúde

**Protótipo acadêmico responsivo** de orientação informativa sobre sintomas, sinais de alerta e busca por atendimento, inspirado nas quatro telas fornecidas para o projeto de Engenharia de Software.

O site é feito com **HTML, CSS e JavaScript puros**, sem frameworks e sem necessidade de API, banco de dados, login ou instalação de dependências. Está pronto para ser publicado no **GitHub Pages**.

## Como abrir no seu computador

1. Extraia o arquivo ZIP.
2. Abra `index.html` no navegador. O site também funciona em hospedagem estática, como o GitHub Pages.
3. Clique nos cartões, preencha o relato de sintomas e cadastre lembretes. As informações ficam armazenadas **somente no navegador utilizado**.

> Dica: para testar exatamente como será hospedado, abra a pasta em um servidor local, como o Live Server do VS Code, ou execute `python -m http.server 8000` e acesse `http://localhost:8000`.

## Como publicar no GitHub Pages

1. Entre em [github.com](https://github.com), crie um repositório **público** (ex.: `orientasaude`) e abra-o.
2. Clique em **Add file → Upload files**.
3. Envie **o conteúdo da pasta `OrientaSaude_GitHub`**, mantendo `index.html` na raiz do repositório. Envie `styles.css`, `app.js`, `manifest.webmanifest` e a pasta `assets`.
4. Confirme em **Commit changes**.
5. Abra **Settings → Pages** e, em **Build and deployment**, escolha **Deploy from a branch**.
6. Em **Branch**, selecione `main` e `/ (root)`, depois **Save**.
7. O endereço será semelhante a `https://SEU-USUARIO.github.io/orientasaude/`. O GitHub exibirá o URL definitivo na área Pages após a publicação.

**Importante:** não envie o arquivo ZIP como um único arquivo ao repositório, sem extrair. O GitHub Pages precisa acessar o `index.html` diretamente.

## Telas e recursos disponíveis

- **Início:** identidade OrientaSaúde, atalho de emergência, recursos principais, dicas e avisos.
- **Descrever sintomas:** seleção de sintomas, relato livre, duração e evolução.
- **Detalhes:** revisão do relato, intensidade e seleção explícita de sinais de alerta.
- **Orientação inicial:** registro do relato, avisos de gravidade, informações gerais e encaminhamento à busca de atendimento. **A classificação é somente ilustrativa e não foi validada clinicamente.**
- **Minha saúde:** painel de lembretes, especialidades, unidades e educação.
- **Registros:** histórico local, filtros, consulta e exclusão.
- **Lembretes:** inclusão, conclusão e exclusão de lembretes de consultas e horários previamente definidos por profissionais.
- **Especialidades:** informações gerais sobre clínica geral, pediatria, cardiologia e ortopedia.
- **Unidades de saúde:** links de pesquisa para mapas e CNES (sem endereços inventados).
- **Educação em saúde:** conteúdos educativos ilustrativos.
- **Perfil:** preferências de nome, tamanho do texto, exportação JSON e exclusão dos dados locais.

## Compatibilidade e responsividade

| Dispositivo | Layout |
| --- | --- |
| Celular | Visual baseado nas telas enviadas, com navegação inferior e cartões em duas colunas. |
| Tablet | Layout fluido, com cartões maiores e espaçamento adaptado. |
| Computador | Conteúdo expandido e navegação lateral. |

## Mapeamento dos requisitos do documento

| Requisito | Implementação no protótipo |
| --- | --- |
| RF01 | Selecionar e descrever sintomas. |
| RF02 | Informações gerais e sinais de alerta nas telas de sintomas, orientação e educação. |
| RF03 | **Indicador demonstrativo** de atenção alta, aumentada ou geral. Não é triagem validada, não descarta risco clínico. |
| RF04 | Medidas iniciais informativas, como registrar evolução e preparar consulta. |
| RF05 | Alertas com incentivo à busca por atendimento profissional ou urgente. |
| RF06 | Cadastro local de consultas e horários. **Não envia notificações quando o site está fechado.** |
| RF07 | Páginas de educação em saúde. |
| RF08 | Avisos de que o sistema não faz diagnóstico nem substitui profissional, presentes em todas as telas. |

## Avisos importantes e limitações

Este é um **protótipo de interface** criado para fins acadêmicos, **não um produto médico pronto para uso**. Nenhum algoritmo aqui foi submetido a validação, revisão clínica ou homologação. A orientação e o nível de atenção são meramente demonstrativos, **não devem orientar decisões médicas reais**, nem têm capacidade de descartar doenças graves. O site não diagnostica, não prescreve medicamentos, não oferece consultas reais e não substitui profissionais de saúde.

Em situações de risco imediato no Brasil, ligue **192 (SAMU)**.

Os dados são salvos em `localStorage`, não criptografados, apenas neste navegador. **Evite inserir dados reais sensíveis**, especialmente em equipamentos compartilhados. Excluir os dados do navegador também pode excluir os registros. Não há sincronização entre aparelhos nem backup automático. Para implantação real, seriam necessários revisão clínica e editorial, política de privacidade, avaliação da LGPD, acessibilidade, segurança, autenticação, persistência apropriada e infraestrutura para lembretes confiáveis.

## Estrutura de arquivos

```text
OrientaSaude_GitHub/
├── index.html               # Estrutura e símbolos dos ícones
├── styles.css               # Aparência e responsividade
├── app.js                   # Telas, navegação e armazenamento local
├── manifest.webmanifest     # Metadados para instalação em dispositivos compatíveis
├── assets/
│   └── favicon.svg          # Ícone do aplicativo
└── README.md                # Este guia
```

## Personalização

- Cores, espaçamento e responsividade: `styles.css`.
- Textos, componentes e fluxos: `app.js`.
- Nome do site e metadados: `index.html`.
- Favicons: `assets/favicon.svg`.

Desenvolvido como demonstração do projeto **OrientaSaúde — Sistema de Orientação sobre Sintomas e Busca por Atendimento Médico**, inspirado na especificação de requisitos fornecida, voltada inicialmente à comunidade de Foz do Iguaçu.
## Idiomas / Languages / Idiomas

O aplicativo oferece seleção de idioma em todas as telas (no cabeçalho): **PT-BR**, **EN** e **ES**. A escolha é salva localmente no navegador, aplicada à interface, às orientações informativas e às mensagens do sistema, e pode ser alterada a qualquer momento. Os relatos inseridos pelo usuário não são enviados a serviços de tradução nem traduzidos automaticamente. O recurso funciona inteiramente sem API externa, por meio do arquivo `i18n.js`.

## Modo Tríplice Fronteira (30/10/2026)

O primeiro OrientaSaúde oferece seleção persistente de município: **Foz do Iguaçu (Brasil)**, **Ciudad del Este (Paraguai)** e **Puerto Iguazú (Argentina)**. A seleção fica registrada no `localStorage` e pode ser compartilhada por `?city=foz`, `?city=cde` ou `?city=iguazu`. O seletor de idioma português/inglês/espanhol é independente da cidade.

- A cidade escolhida altera o contato de **emergência médica**: 192 (SAMU, Brasil), 141 (SEME, Paraguai) ou 107 (emergências médicas, Misiones/Argentina). São números locais: ligar conforme o país em que a pessoa está.
- **Unidades de saúde:** Foz mantém o catálogo anterior de 31 unidades; Ciudad del Este e Puerto Iguazú apresentam seleções próprias de hospitais públicos/privados e serviços de atenção primária, com endereço, telefone quando verificado, horário informado e link de fonte. O diretório não representa a totalidade das unidades existentes.
- **Especialidades:** Foz mantém seu diretório completo de clínicas e profissionais. Para Paraguai e Argentina, apenas especialidades identificadas em fontes públicas são vinculadas aos estabelecimentos. Não foram inventados nomes individuais de médicos ou agendamentos.
- **Dicas de Saúde:** o conteúdo educativo permanece acessível, com o contato de emergência e o portal de saúde pública correspondente à cidade selecionada.
- **Histórico e lembretes:** permanecem armazenados somente no mesmo navegador e não são apagados na troca de cidade. A cidade não é detectada por GPS e não substitui a confirmação do local onde o usuário está fisicamente.

Arquivos: `border-data.js` (configuração e diretório por país), `border-context.js` (integração com o SPA), `fronteira.html` e `border-page.js` (consultas por cidade), `border-tips.js` (dicas locais) e `border-legacy.js` (compatibilidade com as páginas antigas de Foz).

Fontes principais: [CNES/DATASUS](https://cnes.datasus.gov.br/), [MSPBS](https://www.mspbs.gov.py/donde-consulto.php), [IPS](https://servicios.ips.gov.py/IPSMaps/informacion.php?cod_empresa=73), [Salud Pública Misiones](https://salud.misiones.gob.ar/hospitales/), [Parque de la Salud Misiones](https://parquesaludmisiones.org.ar/centros-de-vacunacion/) e [Emergências da Argentina](https://www.argentina.gob.ar/tema/emergencias).

**Atenção:** contatos, horários, especialidades e requisitos de acesso podem mudar. Confirme diretamente com os serviços e não utilize o aplicativo como ferramenta de diagnóstico ou triagem clínica.

## Idiomas com bandeiras — atualização de 30/10/2026

A versão principal do OrientaSaúde disponibiliza **8 idiomas** na interface, todos selecionáveis com bandeira e nome nativo:

| Idioma | Código | Bandeira de referência |
| --- | --- | --- |
| Português (Brasil) | `pt-BR` | 🇧🇷 |
| Español | `es` | 🇪🇸 |
| English | `en` | 🇬🇧 |
| 日本語 (japonês) | `ja` | 🇯🇵 |
| العربية (árabe) | `ar` | 🇱🇧 |
| 中文 (chinês simplificado) | `zh-CN` | 🇨🇳 |
| 한국어 (coreano) | `ko` | 🇰🇷 |
| Kreyòl ayisyen (crioulo haitiano) | `ht` | 🇭🇹 |

A bandeira indica um país ou comunidade de referência e **não significa que a língua pertença exclusivamente àquele país**. O idioma é escolhido independentemente da cidade (Foz, Ciudad del Este ou Puerto Iguazú) e fica salvo localmente no navegador. O árabe utiliza direção de leitura RTL.

**Escopo de tradução:** menus, botões, sintomas comuns, orientações urgentes, títulos das dicas e controles principais estão traduzidos; **parte das explicações médicas mais extensas, nomes técnicos, fontes e descrições institucionais continua no português original**. Textos inseridos pelo próprio usuário não são traduzidos nem enviados a serviços externos.

**Antes de uso assistencial:** todos os idiomas e avisos de segurança devem ser revisados por tradutores nativos e profissionais de saúde; traduções e diretórios de saúde permanecem informativos e não substituem avaliação clínica.

Arquivos: `language-pack.js` (oito opções e glossários), `locale.css` (layout multilíngue e RTL), `i18n.js` (integração), módulos de dicas, especialidades, unidades e Tríplice Fronteira. A escolha é guardada em `localStorage` sob `orientasaude-language-v1`.

**Contexto regional:** [UNILA: diversidade linguística em Foz](https://portal.unila.edu.br/noticias/aniversario-de-foz-do-iguacu-conheca-10-fatos-importantes-sobre-a-cidade) e [OIM: perfil migratório de Foz](https://brazil.iom.int/sites/g/files/tmzbdl1496/files/documents/2023-08/mgi-local-foz-de-iguacu-2022-pt.pdf). Não existe ranking censitário completo e atualizado de línguas por número de falantes; a seleção é prática, não estatística.

### Bandeiras gráficas (correção de compatibilidade)

A seleção de idioma usa `flag-picker.js` e `flag-picker.css` com **imagens PNG das bandeiras embutidas no código** (Noto Color Emoji, imagens geradas a partir de fonte licenciada sob SIL OFL 1.1), não emojis em `<option>` do sistema operacional. Isso evita que Windows e outros ambientes mostrem `BR`, `AR` e `JP` no lugar de bandeiras. O menu é navegável por teclado e acessível a leitores de tela. A implementação preserva as alterações de idioma no aplicativo, em Dicas de Saúde, Especialidades e páginas regionais. O guarani foi retirado da lista e das traduções. A interface nativa sem JavaScript apresenta os nomes dos idiomas, sem siglas de bandeira.

## Evolução do aplicativo — 30/10/2026

As melhorias abaixo foram implementadas **no projeto principal** e mantêm compatibilidade com os registros do navegador armazenados sob `orientasaude-demo-v1`.

### Funcionalidades entregues
- **Nova experiência na tela inicial** (`upgrade.js`, `upgrade.css`): pesquisa rápida que encaminha para seções existentes, acesso direto ao mapa, resumo de compromissos próximos, botão para instalar quando o navegador permite e pequenos ajustes visuais responsivos.
- **Mapa de atendimento por cidade** (`mapa.html`, `mapa.js`, `mapa.css`): pesquisa e filtros de estabelecimentos; telefone e link de fonte; seleção de unidade e mapa interativo externo. **O mapa do Google só é carregado depois de clicar em “Carregar mapa”**; ao clicar, o nome e endereço da unidade são enviados ao provedor. A lista local funciona sem o iframe.
- **Agenda e recorrências** (`agenda.html`, `agenda.js`, `agenda.css`): calendário mensal dos compromissos existentes, criação de consultas, horários de medicamentos prescritos e outros compromissos, recorrência diária/semanal/mensal e exportação `.ics` para calendário externo. **Sem notificações garantidas com o site fechado**; a importação `.ics` em um app de calendário é manual.
- **Resumo imprimível dos relatos** (`resumo.html`, `resumo.js`, `resumo.css`): escolha de quantidade de registros, opção para ocultar descrições e impressão/exportação PDF pelo próprio navegador. Trata-se de informação **autorreferida**, não de prontuário.
- **PWA e offline** (`pwa.js`, `sw.js`, `offline.html`, `manifest.webmanifest`, `assets/icon-192.png`, `assets/icon-512.png`): ícones PNG de instalação, atalhos, cache de arquivos públicos e página offline para recursos não disponíveis. Os mapas externos e as fontes online **não funcionam sem conexão**. É preciso visitar o site conectado ao menos uma vez; compatibilidade e instalação dependem do navegador.
- **Privacidade e acessibilidade**: modo discreto opcional que desfoca prévias dos relatos no histórico, alto contraste, tamanho de fonte já existente, link de salto por teclado, melhora dos estados de foco, confirmação para apagar relatos anteriores a 30/90/365 dias, limpeza das novas preferências ao apagar dados locais. **Desfocar os textos não criptografa nem protege o `localStorage` contra quem tenha acesso ao navegador**.
- **Leitura de Dicas de Saúde** (`reader.js`): reprodução de orientações educativas usando síntese de voz do dispositivo após ação do usuário. A voz disponível depende do idioma e navegador instalados.
- **Tríplice Fronteira**: seleção de cidade e contatos de emergência continuam independentes do idioma; o mapa usa os catálogos informativos correspondentes.

### Limites técnicos e pendências que exigem infraestrutura ou revisão externa
1. **Triagem, diagnóstico e recomendações clínicas:** não disponibilizados como serviços validados. Mensagens sobre sintomas e urgência precisam de revisão e validação por profissionais de saúde, inclusive para evitar falsos negativos.
2. **Agendamento, filas, prontuários, médicos em tempo real e atualização automática dos contatos:** exigem integrações autorizadas com hospitais, sistemas públicos ou provedores, além de manutenção e governança de dados.
3. **Notificações push com o aplicativo fechado e sincronização entre dispositivos:** exigem infraestrutura (servidor, assinaturas, consentimento e mecanismos de segurança); o PWA estático não oferece essas garantias.
4. **Proteção forte dos relatos (login, backup cifrado e acesso autenticado):** não existe no frontend atual; avaliar segurança/LGPD antes de usar dados de pacientes reais.
5. **Traduções de conteúdo clínico para todos os idiomas:** a interface cobre 8 idiomas, mas explicações especializadas podem permanecer em português; requer tradutores e revisão profissional.
6. **Homologação de localização, telefones, horários e profissionais:** o conteúdo é cadastro informativo e pode ficar desatualizado; cada informação precisa ser confirmada com a unidade.
7. **Testes completos em celulares físicos, leitores de tela e ambientes offline:** checklist em `TESTES.md`; testes de execução visual automatizados não foram concluídos no ambiente de desenvolvimento por restrição do navegador de testes.

Veja **[TESTES.md](TESTES.md)** para o roteiro detalhado de verificação. `index.html` e todas as páginas regionais continuam em hospedagem estática, sem coleta remota de sintomas pelo aplicativo. **Não use este protótipo como substituto de atendimento profissional ou de emergência.**
