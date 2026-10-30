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
