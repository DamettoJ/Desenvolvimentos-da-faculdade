# OrientaSaúde — acompanhamento público da Tríplice Fronteira

Esta central é compartilhada pelos sites `OrientaSaude/alertas.html` e `OrientaSaude-Studio/alertas.html`.

## Escopo e fontes

**Foz do Iguaçu (BR):** boletins da 9ª Regional de Saúde pelo Paraná contra a Dengue; rede CIEVS e Secretaria da Saúde do Paraná; Ministério da Saúde e alertas epidemiológicos de fronteiras da Anvisa. Na coleta automática, tenta-se o RSS público da Secretaria da Saúde do Paraná. A existência desse feed e sua atualização estão sujeitas a verificação operacional.

**Ciudad del Este (PY):** Dirección de Salud da Municipalidad de Ciudad del Este; Programa Ampliado de Inmunizaciones; Dirección General de Vigilancia de la Salud (DGVS/MSPBS), especialmente o boletim do X Departamento, Alto Paraná, e os dados nacionais. A coleta programada usa o feed público RSS da DGVS, quando disponível.

**Puerto Iguazú (AR):** Programa Municipal de Control de Vectores; Vigilancia Epidemiológica e Ministério de Saúde de Misiones; Ministério de Saúde da Argentina e Boletín Epidemiológico Nacional. A coleta programada usa o RSS público da saúde de Misiones, quando disponível.

Fontes municipais, estaduais/departamentais e nacionais aparecem identificadas separadamente. **Uma publicação nacional não significa que há um surto na cidade selecionada.** Os registros não recebem classificação automática de risco ou de gravidade clínica.

## Atualização automática

Workflow: `.github/workflows/orientasaude-alertas.yml`. Agendamento: `23 */6 * * *` UTC (consulta programada a cada 6 horas), mais execução manual pelo botão **Run workflow** da aba Actions. Os agendamentos de GitHub Actions não têm garantia de pontualidade.

- Script: `.github/scripts/atualizar_alertas.py` (Python 3.12, biblioteca padrão).
- Teste local: `python .github/scripts/test_alertas.py`.
- Saída: `saude-publica/alertas.json` no branch `main`, contendo `checked_at`, estado da atualização, resultado de cada feed, títulos, links, origem, abrangência e data de publicação.
- A interface tenta buscar o JSON mais recente diretamente do `raw.githubusercontent.com`, pois um commit feito pelo `GITHUB_TOKEN` pode não acionar nova publicação do GitHub Pages; se não conseguir, usa a cópia local do Pages. Nenhum relato de sintomas é incluído na consulta.
- Se um feed falhar, o script preserva temporariamente apenas publicações previamente obtidas e informa a falha. **Não atribui estado seguro à cidade.**

### Operação necessária no GitHub

1. No repositório, abra **Settings → Actions → General** e confirme que a execução de Actions está permitida.
2. Em **Workflow permissions**, permita que o `GITHUB_TOKEN` tenha a permissão adequada para gravar o arquivo JSON em `main`, se a política do repositório permitir.
3. Abra **Actions → Atualizar publicações de vigilância em saúde (Tríplice Fronteira) → Run workflow** para executar o primeiro ciclo e conferir os logs. O workflow também rodará por agendamento, se não estiver desativado.
4. Se houver proteção de branch ou restrições de segurança, configure uma estratégia de publicação aprovada. **Não coloque tokens pessoais no HTML ou JavaScript.**
5. Verifique `saude-publica/alertas.json`, incluindo `sources[].status` e o horário `checked_at`. Um `status=partial` significa que parte das fontes não pôde ser consultada.

## Limites e segurança

Não há acordo institucional, credenciais, vínculo governamental, acesso a SINAN, SNVS, prontuários ou sistemas internos. As fontes públicas podem ficar indisponíveis, mudar suas URLs, não oferecer RSS ou publicar depois do acontecimento. A consulta a cada 6 horas **não é vigilância em tempo real** nem substitui os avisos das autoridades.

O conteúdo deve passar por curadoria de profissionais da saúde antes de virar alerta de urgência, push ou classificação de risco. A central mostra links e metadados de publicações. Não coleta, envia ou sincroniza dados pessoais de saúde. Para emergência, use os canais locais e não espere por atualizações do site.