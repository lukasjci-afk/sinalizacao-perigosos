/**
 * Aplicação principal - Sinalização de Produtos Perigosos
 * Lógica de busca, exibição de resultados e análise de carga mista
 */

// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================
let produtosSelecionados = [];
let autocompleteTimeout = null;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('input', onInputChange);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                fecharAutocomplete();
                pesquisar();
            }
        });
    }

    // Autocomplete e Enter no campo de adicionar produto
    const addInput = document.getElementById('addProductInput');
    if (addInput) {
        addInput.addEventListener('input', onAddInputChange);
        addInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                fecharAddAutocomplete();
                adicionarProduto();
            }
        });
    }

    // Fechar autocomplete ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && !e.target.closest('.add-product-input')) {
            fecharAutocomplete();
            fecharAddAutocomplete();
        }
    });
});

// ============================================================
// AUTOCOMPLETE
// ============================================================
function onInputChange(e) {
    const termo = e.target.value.trim();

    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);

    if (termo.length < 2) {
        fecharAutocomplete();
        return;
    }

    autocompleteTimeout = setTimeout(() => {
        const resultados = buscarProduto(termo).slice(0, 8);
        mostrarAutocomplete(resultados);
    }, 250);
}

function mostrarAutocomplete(resultados) {
    let dropdown = document.getElementById('autocompleteDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'autocompleteDropdown';
        dropdown.className = 'autocomplete-dropdown';
        document.querySelector('.search-box').appendChild(dropdown);
    }

    if (resultados.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = resultados.map(p => `
        <div class="autocomplete-item" onclick="selecionarAutocomplete('${p.un}', '${p.nome.replace(/'/g, "\\'")}')">
            <span class="autocomplete-un">UN ${p.un}</span>
            <span class="autocomplete-nome">${p.nome}</span>
            <span class="autocomplete-classe">Classe ${p.classe}</span>
        </div>
    `).join('');

    dropdown.style.display = 'block';
}

function selecionarAutocomplete(un, nome) {
    document.getElementById('searchInput').value = un;
    fecharAutocomplete();
    pesquisar();
}

function fecharAutocomplete() {
    const dropdown = document.getElementById('autocompleteDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

// ============================================================
// AUTOCOMPLETE - Campo Adicionar Produto
// ============================================================
let addAutocompleteTimeout = null;

function onAddInputChange(e) {
    const termo = e.target.value.trim();

    if (addAutocompleteTimeout) clearTimeout(addAutocompleteTimeout);

    if (termo.length < 2) {
        fecharAddAutocomplete();
        return;
    }

    addAutocompleteTimeout = setTimeout(() => {
        const resultados = buscarProduto(termo).slice(0, 8);
        mostrarAddAutocomplete(resultados);
    }, 250);
}

function mostrarAddAutocomplete(resultados) {
    let dropdown = document.getElementById('addAutocompleteDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'addAutocompleteDropdown';
        dropdown.className = 'autocomplete-dropdown';
        document.querySelector('.add-product-input').appendChild(dropdown);
    }

    if (resultados.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = resultados.map(p => `
        <div class="autocomplete-item" onclick="selecionarAddAutocomplete('${p.un}', '${p.nome.replace(/'/g, "\\'")}')">
            <span class="autocomplete-un">UN ${p.un}</span>
            <span class="autocomplete-nome">${p.nome}</span>
            <span class="autocomplete-classe">Classe ${p.classe}</span>
        </div>
    `).join('');

    dropdown.style.display = 'block';
}

function selecionarAddAutocomplete(un, nome) {
    document.getElementById('addProductInput').value = un;
    fecharAddAutocomplete();
    adicionarProduto();
}

function fecharAddAutocomplete() {
    const dropdown = document.getElementById('addAutocompleteDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

// ============================================================
// PESQUISA PRINCIPAL
// ============================================================
function pesquisar() {
    const termo = document.getElementById('searchInput').value.trim();
    if (!termo) {
        alert('Por favor, insira um número ONU ou descrição do produto.');
        return;
    }

    const resultados = buscarProduto(termo);
    exibirResultados(resultados, termo);
}

function exibirResultados(resultados, termo) {
    const container = document.getElementById('resultsContent');
    const section = document.getElementById('results');

    if (resultados.length === 0) {
        section.style.display = 'block';
        container.innerHTML = `
            <div class="alert alert-warning">
                <h3>⚠️ Produto não encontrado</h3>
                <p>Não foi possível encontrar o produto "<strong>${escapeHtml(termo)}</strong>" no banco de dados.</p>
                <p>Verifique o número ONU ou tente uma descrição diferente.</p>
                <p><small>Este banco de dados contém os produtos mais comuns. Para uma listagem completa, consulte a Resolução ANTT 5.998/2022.</small></p>
            </div>
        `;
        section.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    section.style.display = 'block';

    container.innerHTML = resultados.map(produto => criarCardProduto(produto)).join('');
    section.scrollIntoView({ behavior: 'smooth' });
}

function criarCardProduto(produto) {
    const classeInfo = getClasseInfo(produto.classe);
    const nRisco = calcularNumeroRisco(produto);

    let ghsHTML = '';
    if (produto.ghsPicto && produto.ghsPicto.length > 0) {
        ghsHTML = `
            <div class="result-ghs">
                <h4>Pictogramas GHS (ABNT NBR 14725:2023)</h4>
                <div class="ghs-container">
                    ${produto.ghsPicto.map(p => {
                        const info = PICTOGRAMAS_GHS[p];
                        return `
                            <div class="ghs-result-item">
                                ${gerarGHSPictogramaSVG(p, 75)}
                                <span>${info ? info.nome : p}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    let riscoSubHTML = '';
    if (produto.riscoSub) {
        const riscoSubStr = Array.isArray(produto.riscoSub) ? produto.riscoSub.join(', ') : produto.riscoSub;
        if (riscoSubStr) {
            riscoSubHTML = `<p><strong>Risco subsidiário:</strong> ${riscoSubStr}</p>`;
        }
    }

    return `
        <div class="result-card">
            <div class="result-header">
                <div>
                    <h3>UN ${produto.un} — ${produto.nome}</h3>
                    <p class="classe-badge" style="background: ${classeInfo.cor}; color: ${['2.1','3','4.3','2.2'].includes(produto.classe) ? '#fff' : '#000'}">
                        Classe ${produto.classe} — ${classeInfo.nome}
                    </p>
                </div>
            </div>

            <div class="result-details">
                <div class="result-info">
                    <p><strong>Classe de risco:</strong> ${produto.classe} — ${classeInfo.nome}</p>
                    ${produto.ge ? `<p><strong>Grupo de embalagem:</strong> ${produto.ge}</p>` : ''}
                    <p><strong>Número de risco:</strong> ${nRisco}</p>
                    ${riscoSubHTML}
                    ${produto.palavraSinal ? `<p><strong>Palavra de sinalização GHS:</strong> <span class="palavra-sinal ${produto.palavraSinal.toLowerCase()}">${produto.palavraSinal}</span></p>` : ''}
                </div>

                <div class="result-placards">
                    <h4>Sinalização de Transporte (ANTT 5.998/2022)</h4>
                    <div class="placards-container">
                        <div class="placard-wrapper">
                            <p class="placard-label">Rótulo de Risco</p>
                            ${gerarPlacardSVG(produto.classe, 130)}
                        </div>
                        <div class="placard-wrapper">
                            <p class="placard-label">Painel de Segurança</p>
                            ${gerarPainelSeguranca(nRisco, produto.un, 200)}
                        </div>
                    </div>
                </div>

                ${ghsHTML}

                <div class="result-nr">
                    <h4>Sinalização no Local de Trabalho</h4>
                    <div class="nr-info">
                        ${gerarInfoNR(produto)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function gerarInfoNR(produto) {
    let html = '<ul>';

    // NR-26 - Sinalização
    html += '<li><strong>NR-26:</strong> Rotulagem conforme GHS/ABNT NBR 14725:2023 obrigatória em todos os recipientes no ambiente de trabalho.</li>';

    // Cores de segurança conforme a classe
    const cores = {
        '2.1': 'Vermelho (tubulações e áreas de armazenamento de gases inflamáveis)',
        '2.2': 'Verde (cilindros de gases não inflamáveis)',
        '2.3': 'Roxo (alerta de radiação) / Amarelo (atenção)',
        '3': 'Vermelho (inflamáveis) — NR-20 aplicável',
        '4.1': 'Vermelho (inflamáveis) — Listras vermelhas e brancas',
        '4.2': 'Vermelho (combustão espontânea)',
        '4.3': 'Azul (perigoso quando molhado)',
        '5.1': 'Amarelo (oxidantes — cuidado)',
        '5.2': 'Amarelo e vermelho (peróxidos — perigo)',
        '6.1': 'Roxo (tóxicos) / Faixa branca',
        '6.2': 'Branco com símbolo de risco biológico',
        '7': 'Roxo/Magenta (radiação ionizante)',
        '8': 'Preto e branco (corrosivos)',
        '9': 'Branco com listras pretas verticais'
    };

    const corSeguranca = cores[produto.classe] || cores[produto.classe.split('.')[0]] || 'Conforme classificação';
    html += `<li><strong>Cor de segurança (NR-26):</strong> ${corSeguranca}</li>`;

    // NR-20 (se inflamável/combustível)
    if (['2.1', '3', '4.1', '4.2'].includes(produto.classe)) {
        html += '<li><strong>NR-20 aplicável:</strong> Área classificada. Necessário:</li>';
        html += '<ul>';
        html += '<li>Sinalização de proibição de fontes de ignição (placa "Proibido Fumar")</li>';
        html += '<li>Sinalização de área classificada com indicação da zona</li>';
        html += '<li>Placa indicativa de inflamável com pictograma de chama</li>';
        html += '<li>Plano de emergência visível no local</li>';
        html += '</ul>';
    }

    // FDS
    html += '<li><strong>FDS (Ficha com Dados de Segurança):</strong> Deve estar disponível no local conforme ABNT NBR 14725:2023 (substitui a antiga FISPQ)</li>';

    html += '</ul>';
    return html;
}

// ============================================================
// CARGA MISTA - Adicionar produtos
// ============================================================
function adicionarProduto() {
    const input = document.getElementById('addProductInput');
    const termo = input.value.trim();

    if (!termo) {
        alert('Insira um número ONU ou nome do produto para adicionar.');
        return;
    }

    const resultados = buscarProduto(termo);

    if (resultados.length === 0) {
        alert(`Produto "${termo}" não encontrado no banco de dados.`);
        return;
    }

    const produto = resultados[0]; // Pega o primeiro resultado

    // Verifica se já foi adicionado
    if (produtosSelecionados.find(p => p.un === produto.un)) {
        alert(`O produto UN ${produto.un} já foi adicionado à lista.`);
        return;
    }

    produtosSelecionados.push(produto);
    atualizarTagsProdutos();
    input.value = '';
    fecharAutocomplete();
}

function removerProduto(un) {
    produtosSelecionados = produtosSelecionados.filter(p => p.un !== un);
    atualizarTagsProdutos();
}

function atualizarTagsProdutos() {
    const container = document.getElementById('multiProductList');
    const analyzeBtn = document.getElementById('analyzeBtn');

    container.innerHTML = produtosSelecionados.map(p => `
        <span class="product-tag">
            UN ${p.un} — ${p.nome}
            <button class="tag-remove" onclick="removerProduto('${p.un}')" title="Remover">&times;</button>
        </span>
    `).join('');

    // Habilitar/desabilitar botão de análise
    if (analyzeBtn) {
        analyzeBtn.disabled = produtosSelecionados.length < 2;
    }
}

// ============================================================
// ANÁLISE DE CARGA MISTA
// ============================================================
function analisarCargaMista() {
    if (produtosSelecionados.length < 2) {
        alert('Adicione pelo menos 2 produtos para analisar a compatibilidade de carga mista.');
        return;
    }

    const section = document.getElementById('mixedResults');
    const container = document.getElementById('mixedResultsContent');
    section.style.display = 'block';

    // Gerar análise
    let html = '';

    // 1. Resumo dos produtos
    html += '<div class="mixed-summary">';
    html += '<h3>📦 Produtos na Carga</h3>';
    html += '<div class="mixed-products-grid">';
    produtosSelecionados.forEach(p => {
        const info = getClasseInfo(p.classe);
        html += `
            <div class="mixed-product-card">
                <div class="mixed-placard">${gerarPlacardSVG(p.classe, 80)}</div>
                <div>
                    <strong>UN ${p.un}</strong><br>
                    ${p.nome}<br>
                    <span class="classe-badge-small" style="background:${info.cor};color:${['2.1','3','4.3','2.2'].includes(p.classe)?'#fff':'#000'}">
                        Classe ${p.classe}
                    </span>
                </div>
            </div>
        `;
    });
    html += '</div></div>';

    // 2. Matriz de compatibilidade
    html += '<div class="compat-section">';
    html += '<h3>🔄 Matriz de Compatibilidade</h3>';
    html += '<p>Baseada na tabela de segregação da Resolução ANTT 5.998/2022</p>';
    html += gerarMatrizCompatibilidade();
    html += '</div>';

    // 3. Alertas e recomendações
    html += '<div class="alerts-section">';
    html += '<h3>⚠️ Alertas e Recomendações</h3>';
    html += gerarAlertas();
    html += '</div>';

    // 4. Sinalização necessária para o veículo
    html += '<div class="vehicle-signs">';
    html += '<h3>🚛 Sinalização do Veículo</h3>';
    html += gerarSinalizacaoVeiculo();
    html += '</div>';

    container.innerHTML = html;
    section.scrollIntoView({ behavior: 'smooth' });
}

function gerarMatrizCompatibilidade() {
    const prods = produtosSelecionados;
    let html = '<div class="table-responsive"><table class="compat-table">';

    // Cabeçalho
    html += '<thead><tr><th></th>';
    prods.forEach(p => {
        html += `<th>UN ${p.un}<br><small>${p.classe}</small></th>`;
    });
    html += '</tr></thead>';

    // Corpo
    html += '<tbody>';
    prods.forEach((p1, i) => {
        html += `<tr><th>UN ${p1.un} (${p1.classe})</th>`;
        prods.forEach((p2, j) => {
            if (i === j) {
                html += '<td class="compat-na">—</td>';
            } else {
                const compat = getCompatibilidade(p1.classe, p2.classe);
                let cls, texto;
                switch (compat) {
                    case 'S':
                        cls = 'compat-ok';
                        texto = '✓ Permitido';
                        break;
                    case 'N':
                        cls = 'compat-no';
                        texto = '✗ Proibido';
                        break;
                    default:
                        cls = 'compat-cond';
                        texto = '⚠ Condicional';
                }
                html += `<td class="${cls}">${texto}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';

    // Legenda
    html += `
        <div class="compat-legend">
            <span class="legend-item"><span class="legend-color compat-ok"></span> Permitido</span>
            <span class="legend-item"><span class="legend-color compat-cond"></span> Condicional (segregação necessária)</span>
            <span class="legend-item"><span class="legend-color compat-no"></span> Proibido (não podem ser transportados juntos)</span>
        </div>
    `;

    return html;
}

function gerarAlertas() {
    const prods = produtosSelecionados;
    let alertas = [];
    let temProibido = false;
    let temCondicional = false;

    // Verificar compatibilidade entre todos os pares
    for (let i = 0; i < prods.length; i++) {
        for (let j = i + 1; j < prods.length; j++) {
            const compat = getCompatibilidade(prods[i].classe, prods[j].classe);

            if (compat === 'N') {
                temProibido = true;
                alertas.push({
                    tipo: 'danger',
                    msg: `<strong>PROIBIDO:</strong> UN ${prods[i].un} (Classe ${prods[i].classe}) e UN ${prods[j].un} (Classe ${prods[j].classe}) <strong>NÃO podem ser transportados no mesmo veículo</strong>.`
                });
            } else if (compat === 'C') {
                temCondicional = true;
                alertas.push({
                    tipo: 'warning',
                    msg: `<strong>CONDICIONAL:</strong> UN ${prods[i].un} (Classe ${prods[i].classe}) e UN ${prods[j].un} (Classe ${prods[j].classe}) podem ser transportados juntos <strong>com segregação adequada</strong> (separação física no veículo).`
                });
            }
        }
    }

    if (!temProibido && !temCondicional) {
        alertas.push({
            tipo: 'success',
            msg: '<strong>PERMITIDO:</strong> Todos os produtos podem ser transportados juntos no mesmo veículo sem restrições de segregação.'
        });
    }

    // Alertas NR-20 (inflamáveis)
    const inflamaveis = prods.filter(p => ['2.1', '3', '4.1', '4.2'].includes(p.classe));
    if (inflamaveis.length > 0) {
        alertas.push({
            tipo: 'info',
            msg: `<strong>NR-20:</strong> ${inflamaveis.length} produto(s) inflamável(eis) na carga. Área de carga/descarga deve ser classificada. Proibidas fontes de ignição.`
        });
    }

    // Alerta de múltiplos rótulos
    const classesUnicas = [...new Set(prods.map(p => p.classe))];
    if (classesUnicas.length > 1) {
        alertas.push({
            tipo: 'info',
            msg: `<strong>Sinalização múltipla:</strong> Veículo deve portar ${classesUnicas.length} rótulos de risco diferentes e os painéis de segurança correspondentes.`
        });
    }

    return alertas.map(a => `
        <div class="alert alert-${a.tipo}">
            <p>${a.msg}</p>
        </div>
    `).join('');
}

function gerarSinalizacaoVeiculo() {
    const prods = produtosSelecionados;
    const classesUnicas = [...new Set(prods.map(p => p.classe))];

    let html = '<p>O veículo de transporte deve portar a seguinte sinalização:</p>';

    html += '<div class="vehicle-signs-grid">';

    prods.forEach(p => {
        const nRisco = calcularNumeroRisco(p);
        html += `
            <div class="vehicle-sign-item">
                <h4>UN ${p.un} — ${p.nome}</h4>
                <div class="sign-pair">
                    <div>
                        <p class="sign-label">Rótulo de Risco</p>
                        ${gerarPlacardSVG(p.classe, 110)}
                    </div>
                    <div>
                        <p class="sign-label">Painel de Segurança</p>
                        ${gerarPainelSeguranca(nRisco, p.un, 170)}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Se tem mais de um produto com mesma classe, pode usar painel genérico
    if (prods.length > 1) {
        html += `
            <div class="alert alert-info" style="margin-top: 1rem;">
                <p><strong>Nota:</strong> Conforme ANTT 5.998/2022, quando o veículo transporta múltiplos produtos de classes diferentes,
                todos os rótulos de risco e painéis de segurança correspondentes devem ser afixados.
                Em caso de carga mista com muitos produtos da mesma classe, pode-se utilizar o painel de segurança sem número
                (somente o painel laranja, sem identificação do produto).</p>
            </div>
        `;
    }

    return html;
}

// ============================================================
// UTILIDADES
// ============================================================
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
