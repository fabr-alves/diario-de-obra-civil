# Atualização mensal de funcionários

Na conta Fabrício, abra **Funcionários** na tela inicial. Selecione um arquivo `.xlsx`, `.xls` ou `.csv`, até 5 MB. Escolha a aba, a coluna dos nomes e a primeira linha com funcionários. Confira todos os nomes e a relação de entradas e saídas antes de marcar a confirmação e salvar.

- **Substituir pela lista do mês** atualiza os funcionários disponíveis para os próximos lançamentos.
- **Acrescentar nomes novos** mantém a lista atual e adiciona os nomes ainda ausentes.
- Nomes repetidos são deduplicados, desconsiderando espaços, caixa e acentos na comparação. A grafia já cadastrada é preservada quando o nome é equivalente.
- Células vazias, cabeçalhos e valores inválidos são ignorados e apresentados na prévia. É possível desmarcar nomes antes da confirmação.
- A lista pode ter até 1.000 nomes; a leitura é limitada a 10.000 linhas e 128 colunas por aba. As abas ocultas não são importadas.
- A lista anterior é guardada para restauração com prévia e confirmação. A importação registra mês, arquivo, usuário e horário.
- Os nomes já armazenados nos diários são preservados. A lista atualizada é compartilhada com a equipe e recebe um campo de busca no formulário.

O arquivo é lido no navegador. Somente os nomes confirmados e os dados da importação são enviados ao Firebase; outras colunas da planilha não são enviadas.

## Integração

O cadastro utiliza o documento administrativo já existente `app_settings/map`, protegido pelo UID de Fabrício nas regras publicadas. Atualizações de mapa preservam os campos do cadastro de funcionários. A transação verifica a versão da lista para evitar sobrescrever uma importação concorrente. Não é necessário alterar as regras do Firebase para esta funcionalidade.

O parser SheetJS CE 0.20.3 foi obtido do CDN oficial e incluído localmente, com sua licença Apache-2.0 em `vendor/SheetJS-LICENSE.txt`. Ele é carregado em um Web Worker somente quando a importação é utilizada. Documentação: https://docs.sheetjs.com/docs/getting-started/installation/standalone/

## Validação

`node tests/employees.test.mjs` valida a leitura XLSX/XLS/CSV, abas, coluna/linha, acentos, duplicatas, linhas inválidas, substituição, acréscimo e rejeição de lista vazia.

O navegador com Firebase simulado validou prévia e confirmação, substituição da lista, atualização dos nomes no formulário, restauração e preservação da lista quando o mapa é atualizado. Os diários de produção não recebem dados de teste.
