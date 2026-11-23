# Sinalização de Produtos Perigosos

Aplicação web para consulta de placas de sinalização de produtos perigosos pelo número ONU ou descrição do produto.

## Funcionalidades

- **Pesquisa por número ONU** ou nome do produto (com autocomplete)
- **Rótulos de risco** (placards diamante) gerados em SVG
- **Painéis de segurança** (placa laranja com número de risco e ONU)
- **Pictogramas GHS** (Sistema Globalmente Harmonizado)
- **Análise de carga mista** — compatibilidade entre classes de risco
- **Matriz de compatibilidade** visual com alertas de segregação
- **Informações NR-26 e NR-20** para sinalização no ambiente de trabalho

## Base Normativa

- **ABNT NBR 14725:2023** — Classificação e rotulagem GHS (Rev. 7)
- **NR-26** (Portaria MTP nº 2.770/2022) — Sinalização de Segurança
- **NR-20** — Segurança com Inflamáveis e Combustíveis
- **Resolução ANTT 5.998/2022** — Transporte terrestre de produtos perigosos

## Como usar

1. Acesse a página
2. Digite o número ONU (ex: 1203) ou o nome do produto (ex: gasolina)
3. Clique em **Pesquisar** para ver os rótulos de risco, painel de segurança e pictogramas GHS
4. Para cargas mistas, adicione múltiplos produtos e clique em **Analisar Compatibilidade**

## Tecnologias

- HTML5, CSS3, JavaScript (vanilla)
- SVG inline para todos os placards e pictogramas
- Sem dependências externas — funciona como site estático

## Deploy

Site estático — basta servir os arquivos via GitHub Pages ou qualquer servidor web.

## Licença

MIT
