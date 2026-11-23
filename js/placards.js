/**
 * Geração de SVGs para rótulos de risco (placards) e pictogramas GHS
 * Baseado nas normas ANTT 5.998/2022 e ABNT NBR 14725:2023
 */

// ============================================================
// RÓTULOS DE RISCO (Diamond placards) - Transporte
// ============================================================

function gerarPlacardSVG(classe, tamanho = 120) {
    const half = tamanho / 2;
    const margin = 4;
    const inner = half - margin;

    const configs = {
        '1':   { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'explosivo', texto: '1', textoSub: 'EXPLOSIVO' },
        '1.1': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'explosivo', texto: '1', textoSub: '1.1' },
        '1.2': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'explosivo', texto: '1', textoSub: '1.2' },
        '1.3': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'explosivo', texto: '1', textoSub: '1.3' },
        '1.4': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'num14', texto: '1', textoSub: '1.4' },
        '1.5': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'num15', texto: '1', textoSub: '1.5' },
        '1.6': { corSup: '#ff6600', corInf: '#ff6600', simbolo: 'num16', texto: '1', textoSub: '1.6' },
        '2.1': { corSup: '#ff0000', corInf: '#ff0000', simbolo: 'chama', texto: '2', textoSub: 'GÁS INFLAMÁVEL' },
        '2.2': { corSup: '#00aa44', corInf: '#00aa44', simbolo: 'cilindro', texto: '2', textoSub: 'GÁS NÃO INFLAMÁVEL' },
        '2.3': { corSup: '#ffffff', corInf: '#ffffff', simbolo: 'caveira', texto: '2', textoSub: 'GÁS TÓXICO' },
        '3':   { corSup: '#ff0000', corInf: '#ff0000', simbolo: 'chama', texto: '3', textoSub: 'LÍQUIDO INFLAMÁVEL' },
        '4.1': { corSup: '#ffffff', corInf: '#ffffff', simbolo: 'chama', texto: '4', textoSub: 'SÓLIDO INFLAMÁVEL', listras: true },
        '4.2': { corSup: '#ffffff', corInf: '#ff0000', simbolo: 'chama', texto: '4', textoSub: 'COMBUSTÃO ESPONTÂNEA' },
        '4.3': { corSup: '#0066cc', corInf: '#0066cc', simbolo: 'chama', texto: '4', textoSub: 'PERIGOSO QUANDO MOLHADO' },
        '5.1': { corSup: '#ffcc00', corInf: '#ffcc00', simbolo: 'chamaCirculo', texto: '5.1', textoSub: 'OXIDANTE' },
        '5.2': { corSup: '#ffcc00', corInf: '#ff0000', simbolo: 'chamaCirculo', texto: '5.2', textoSub: 'PERÓXIDO ORGÂNICO' },
        '6.1': { corSup: '#ffffff', corInf: '#ffffff', simbolo: 'caveira', texto: '6', textoSub: 'TÓXICO' },
        '6.2': { corSup: '#ffffff', corInf: '#ffffff', simbolo: 'infectante', texto: '6', textoSub: 'INFECTANTE' },
        '7':   { corSup: '#ffff00', corInf: '#ffffff', simbolo: 'radioativo', texto: '7', textoSub: 'RADIOATIVO' },
        '8':   { corSup: '#ffffff', corInf: '#000000', simbolo: 'corrosivo', texto: '8', textoSub: 'CORROSIVO' },
        '9':   { corSup: '#ffffff', corInf: '#ffffff', simbolo: 'listras9', texto: '9', textoSub: 'DIVERSOS' }
    };

    const cfg = configs[classe] || configs['9'];
    const corTexto = ['2.1', '3', '4.3'].includes(classe) ? '#fff' : '#000';
    const corTextoInf = classe === '8' ? '#fff' : corTexto;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tamanho} ${tamanho}" width="${tamanho}" height="${tamanho}">`;

    // Fundo losango
    svg += `<polygon points="${half},${margin} ${tamanho - margin},${half} ${half},${tamanho - margin} ${margin},${half}" fill="${cfg.corSup}" stroke="#000" stroke-width="2"/>`;

    // Metade inferior (se diferente)
    if (cfg.corInf !== cfg.corSup) {
        svg += `<polygon points="${margin},${half} ${tamanho - margin},${half} ${half},${tamanho - margin}" fill="${cfg.corInf}" stroke="#000" stroke-width="1"/>`;
    }

    // Listras verticais (classe 4.1)
    if (cfg.listras) {
        const stripeW = 6;
        for (let x = margin; x < tamanho - margin; x += stripeW * 2) {
            svg += `<line x1="${x}" y1="${margin}" x2="${x}" y2="${tamanho - margin}" stroke="#ff0000" stroke-width="${stripeW}" opacity="0.7"/>`;
        }
        // Re-draw diamond outline
        svg += `<polygon points="${half},${margin} ${tamanho - margin},${half} ${half},${tamanho - margin} ${margin},${half}" fill="none" stroke="#000" stroke-width="2"/>`;
    }

    // Borda interna
    svg += `<polygon points="${half},${margin + 5} ${tamanho - margin - 5},${half} ${half},${tamanho - margin - 5} ${margin + 5},${half}" fill="none" stroke="#000" stroke-width="1"/>`;

    // Símbolo
    const symY = half - 15;
    svg += gerarSimboloSVG(cfg.simbolo, half, symY, corTexto, tamanho);

    // Número da classe (canto inferior)
    svg += `<text x="${half}" y="${tamanho - margin - 12}" text-anchor="middle" font-size="14" font-weight="bold" fill="${corTextoInf}" font-family="Arial, sans-serif">${cfg.texto}</text>`;

    svg += '</svg>';
    return svg;
}

function gerarSimboloSVG(tipo, cx, cy, cor, tam) {
    const s = tam / 120; // escala
    switch (tipo) {
        case 'explosivo':
            return `<g transform="translate(${cx},${cy - 5})">
                <circle cx="0" cy="0" r="${12 * s}" fill="none" stroke="${cor}" stroke-width="2"/>
                <line x1="${-15 * s}" y1="${-8 * s}" x2="${-20 * s}" y2="${-15 * s}" stroke="${cor}" stroke-width="2"/>
                <line x1="${15 * s}" y1="${-8 * s}" x2="${20 * s}" y2="${-15 * s}" stroke="${cor}" stroke-width="2"/>
                <line x1="${0}" y1="${-14 * s}" x2="${0}" y2="${-22 * s}" stroke="${cor}" stroke-width="2"/>
                <line x1="${-12 * s}" y1="${5 * s}" x2="${-18 * s}" y2="${10 * s}" stroke="${cor}" stroke-width="2"/>
                <line x1="${12 * s}" y1="${5 * s}" x2="${18 * s}" y2="${10 * s}" stroke="${cor}" stroke-width="2"/>
            </g>`;

        case 'chama':
            return `<g transform="translate(${cx},${cy - 5})">
                <path d="M0,${-20 * s} C${-5 * s},${-10 * s} ${-15 * s},${5 * s} ${-12 * s},${15 * s} C${-10 * s},${20 * s} ${-3 * s},${22 * s} 0,${20 * s} C${3 * s},${22 * s} ${10 * s},${20 * s} ${12 * s},${15 * s} C${15 * s},${5 * s} ${5 * s},${-10 * s} 0,${-20 * s}Z" fill="${cor}"/>
            </g>`;

        case 'cilindro':
            return `<g transform="translate(${cx},${cy - 3})">
                <rect x="${-8 * s}" y="${-15 * s}" width="${16 * s}" height="${25 * s}" rx="${3 * s}" fill="none" stroke="${cor}" stroke-width="2.5"/>
                <ellipse cx="0" cy="${-15 * s}" rx="${8 * s}" ry="${4 * s}" fill="none" stroke="${cor}" stroke-width="2"/>
                <line x1="${-3 * s}" y1="${13 * s}" x2="${-3 * s}" y2="${18 * s}" stroke="${cor}" stroke-width="2"/>
            </g>`;

        case 'caveira':
            return `<g transform="translate(${cx},${cy - 5})">
                <circle cx="0" cy="${-3 * s}" r="${13 * s}" fill="${cor}"/>
                <circle cx="${-5 * s}" cy="${-6 * s}" r="${4 * s}" fill="${cor === '#000' ? '#fff' : '#fff'}"/>
                <circle cx="${5 * s}" cy="${-6 * s}" r="${4 * s}" fill="${cor === '#000' ? '#fff' : '#fff'}"/>
                <circle cx="${-5 * s}" cy="${-6 * s}" r="${2 * s}" fill="${cor}"/>
                <circle cx="${5 * s}" cy="${-6 * s}" r="${2 * s}" fill="${cor}"/>
                <path d="M${-3 * s},${3 * s} L${3 * s},${3 * s}" stroke="${cor === '#000' ? '#fff' : '#fff'}" stroke-width="2" fill="none"/>
                <line x1="${-5 * s}" y1="${12 * s}" x2="${-5 * s}" y2="${20 * s}" stroke="${cor}" stroke-width="3"/>
                <line x1="${5 * s}" y1="${12 * s}" x2="${5 * s}" y2="${20 * s}" stroke="${cor}" stroke-width="3"/>
                <line x1="${-9 * s}" y1="${15 * s}" x2="${-1 * s}" y2="${15 * s}" stroke="${cor}" stroke-width="3"/>
                <line x1="${1 * s}" y1="${15 * s}" x2="${9 * s}" y2="${15 * s}" stroke="${cor}" stroke-width="3"/>
            </g>`;

        case 'chamaCirculo':
            return `<g transform="translate(${cx},${cy - 5})">
                <circle cx="0" cy="${5 * s}" r="${10 * s}" fill="none" stroke="${cor}" stroke-width="2.5"/>
                <path d="M0,${-18 * s} C${-4 * s},${-8 * s} ${-10 * s},${0} ${-8 * s},${8 * s} C${-6 * s},${12 * s} ${-2 * s},${14 * s} 0,${12 * s} C${2 * s},${14 * s} ${6 * s},${12 * s} ${8 * s},${8 * s} C${10 * s},${0} ${4 * s},${-8 * s} 0,${-18 * s}Z" fill="${cor}"/>
            </g>`;

        case 'infectante':
            return `<g transform="translate(${cx},${cy - 3})">
                <circle cx="0" cy="${-5 * s}" r="${5 * s}" fill="${cor}"/>
                <path d="M0,${0} C${-15 * s},${5 * s} ${-15 * s},${15 * s} 0,${10 * s} C${15 * s},${15 * s} ${15 * s},${5 * s} 0,${0}Z" fill="${cor}"/>
                <path d="M0,${0} C${-5 * s},${-15 * s} ${-15 * s},${-10 * s} 0,${0}" fill="${cor}" opacity="0.8"/>
                <path d="M0,${0} C${5 * s},${-15 * s} ${15 * s},${-10 * s} 0,${0}" fill="${cor}" opacity="0.8"/>
            </g>`;

        case 'radioativo':
            return `<g transform="translate(${cx},${cy - 3})">
                <circle cx="0" cy="0" r="${4 * s}" fill="#000"/>
                <path d="M0,${-5 * s} L${-10 * s},${-18 * s} A${20 * s},${20 * s} 0 0,1 ${10 * s},${-18 * s}Z" fill="#000"/>
                <path d="M${5 * s},${2 * s} L${18 * s},${10 * s} A${20 * s},${20 * s} 0 0,1 ${3 * s},${20 * s}Z" fill="#000"/>
                <path d="M${-5 * s},${2 * s} L${-18 * s},${10 * s} A${20 * s},${20 * s} 0 0,0 ${-3 * s},${20 * s}Z" fill="#000"/>
            </g>`;

        case 'corrosivo':
            return `<g transform="translate(${cx},${cy - 5})">
                <rect x="${-5 * s}" y="${-15 * s}" width="${3 * s}" height="${12 * s}" fill="#000"/>
                <rect x="${3 * s}" y="${-15 * s}" width="${3 * s}" height="${12 * s}" fill="#000"/>
                <path d="M${-12 * s},${0} C${-12 * s},${5 * s} ${-8 * s},${18 * s} 0,${18 * s} C${8 * s},${18 * s} ${12 * s},${5 * s} ${12 * s},${0}Z" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="${-3 * s}" y1="${-3 * s}" x2="${-6 * s}" y2="${0}" stroke="#000" stroke-width="2"/>
                <line x1="${5 * s}" y1="${-3 * s}" x2="${8 * s}" y2="${0}" stroke="#000" stroke-width="2"/>
                <path d="M${-5 * s},${-18 * s} L${-2 * s},${-15 * s} L${-8 * s},${-12 * s}" fill="none" stroke="#000" stroke-width="2"/>
                <path d="M${7 * s},${-18 * s} L${4 * s},${-15 * s} L${10 * s},${-12 * s}" fill="none" stroke="#000" stroke-width="2"/>
            </g>`;

        case 'listras9':
            return `<g transform="translate(${cx},${cy - 15})">
                <line x1="${-15 * s}" y1="${0}" x2="${15 * s}" y2="${0}" stroke="#000" stroke-width="3"/>
                <line x1="${-15 * s}" y1="${6 * s}" x2="${15 * s}" y2="${6 * s}" stroke="#000" stroke-width="3"/>
                <line x1="${-15 * s}" y1="${12 * s}" x2="${15 * s}" y2="${12 * s}" stroke="#000" stroke-width="3"/>
                <line x1="${-13 * s}" y1="${18 * s}" x2="${13 * s}" y2="${18 * s}" stroke="#000" stroke-width="3"/>
                <line x1="${-10 * s}" y1="${24 * s}" x2="${10 * s}" y2="${24 * s}" stroke="#000" stroke-width="3"/>
                <line x1="${-7 * s}" y1="${30 * s}" x2="${7 * s}" y2="${30 * s}" stroke="#000" stroke-width="3"/>
            </g>`;

        case 'num14':
            return `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="${18 * s}" font-weight="bold" fill="${cor}" font-family="Arial">1.4</text>`;
        case 'num15':
            return `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="${18 * s}" font-weight="bold" fill="${cor}" font-family="Arial">1.5</text>`;
        case 'num16':
            return `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="${18 * s}" font-weight="bold" fill="${cor}" font-family="Arial">1.6</text>`;

        default:
            return '';
    }
}

// ============================================================
// PAINEL DE SEGURANÇA (Orange panel with risk/UN numbers)
// ============================================================

function gerarPainelSeguranca(numeroRisco, numeroONU, largura = 180) {
    const altura = largura * 0.65;
    const metade = altura / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}">`;

    // Fundo laranja
    svg += `<rect x="2" y="2" width="${largura - 4}" height="${altura - 4}" rx="2" fill="#ff6600" stroke="#000" stroke-width="3"/>`;

    // Linha horizontal central
    svg += `<line x1="2" y1="${metade}" x2="${largura - 2}" y2="${metade}" stroke="#000" stroke-width="2.5"/>`;

    // Número de risco (superior)
    const risco = numeroRisco || '';
    svg += `<text x="${largura / 2}" y="${metade - 10}" text-anchor="middle" font-size="${altura * 0.3}" font-weight="bold" fill="#000" font-family="Arial, sans-serif">${risco}</text>`;

    // Número ONU (inferior)
    svg += `<text x="${largura / 2}" y="${altura - 15}" text-anchor="middle" font-size="${altura * 0.3}" font-weight="bold" fill="#000" font-family="Arial, sans-serif">${numeroONU}</text>`;

    svg += '</svg>';
    return svg;
}

// Calcula o número de risco a partir da classe
function calcularNumeroRisco(produto) {
    const classe = produto.classe;
    const ge = produto.ge;

    // Mapeamento básico classe → número de risco principal
    const mapaRisco = {
        '1.1': '1', '1.2': '1', '1.3': '1', '1.4': '1', '1.5': '1', '1.6': '1',
        '2.1': '23', '2.2': '20', '2.3': '26',
        '3': '33',
        '4.1': '40', '4.2': '40', '4.3': '423',
        '5.1': '50', '5.2': '539',
        '6.1': '60', '6.2': '606',
        '7': '70',
        '8': '80',
        '9': '90'
    };

    let risco = mapaRisco[classe] || '90';

    // Ajustes por grupo de embalagem
    if (classe === '3') {
        if (ge === 'I') risco = '33';
        else if (ge === 'II') risco = '33';
        else risco = '30';
    }
    if (classe === '6.1') {
        if (ge === 'I') risco = '66';
        else risco = '60';
    }
    if (classe === '8') {
        if (ge === 'I') risco = '88';
        else risco = '80';
    }

    // Risco subsidiário
    if (produto.riscoSub) {
        const subs = produto.riscoSub.split('+');
        // Simplificação: adicionar indicador
    }

    return risco;
}


// ============================================================
// PICTOGRAMAS GHS (Red diamond border)
// ============================================================

function gerarGHSPictogramaSVG(codigo, tamanho = 80) {
    const half = tamanho / 2;
    const m = 3;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tamanho} ${tamanho}" width="${tamanho}" height="${tamanho}">`;

    // Fundo branco losango com borda vermelha
    svg += `<polygon points="${half},${m} ${tamanho - m},${half} ${half},${tamanho - m} ${m},${half}" fill="#fff" stroke="#ff0000" stroke-width="3"/>`;

    // Símbolo interno
    svg += gerarSimboloGHS(codigo, half, half, tamanho);

    svg += '</svg>';
    return svg;
}

function gerarSimboloGHS(codigo, cx, cy, tam) {
    const s = tam / 80;

    switch (codigo) {
        case 'GHS01': // Bomba explodindo
            return `<g transform="translate(${cx},${cy - 3})">
                <circle cx="0" cy="2" r="${10 * s}" fill="#000"/>
                <line x1="${-12 * s}" y1="${-8 * s}" x2="${-18 * s}" y2="${-14 * s}" stroke="#000" stroke-width="${2.5 * s}"/>
                <line x1="${12 * s}" y1="${-8 * s}" x2="${18 * s}" y2="${-14 * s}" stroke="#000" stroke-width="${2.5 * s}"/>
                <line x1="0" y1="${-12 * s}" x2="0" y2="${-20 * s}" stroke="#000" stroke-width="${2.5 * s}"/>
                <line x1="${-10 * s}" y1="${8 * s}" x2="${-16 * s}" y2="${14 * s}" stroke="#000" stroke-width="${2.5 * s}"/>
                <line x1="${10 * s}" y1="${8 * s}" x2="${16 * s}" y2="${14 * s}" stroke="#000" stroke-width="${2.5 * s}"/>
                <line x1="${8 * s}" y1="${-12 * s}" x2="${14 * s}" y2="${-18 * s}" stroke="#000" stroke-width="${2 * s}"/>
                <line x1="${-8 * s}" y1="${-12 * s}" x2="${-14 * s}" y2="${-18 * s}" stroke="#000" stroke-width="${2 * s}"/>
            </g>`;

        case 'GHS02': // Chama
            return `<g transform="translate(${cx},${cy})">
                <path d="M0,${-22 * s} C${-6 * s},${-12 * s} ${-16 * s},${2 * s} ${-13 * s},${12 * s} C${-11 * s},${18 * s} ${-4 * s},${22 * s} 0,${20 * s} C${4 * s},${22 * s} ${11 * s},${18 * s} ${13 * s},${12 * s} C${16 * s},${2 * s} ${6 * s},${-12 * s} 0,${-22 * s}Z" fill="#000"/>
            </g>`;

        case 'GHS03': // Chama sobre círculo
            return `<g transform="translate(${cx},${cy + 2})">
                <circle cx="0" cy="${5 * s}" r="${12 * s}" fill="none" stroke="#000" stroke-width="${3 * s}"/>
                <path d="M0,${-20 * s} C${-5 * s},${-10 * s} ${-10 * s},${-2 * s} ${-8 * s},${5 * s} C${-6 * s},${10 * s} ${-2 * s},${12 * s} 0,${10 * s} C${2 * s},${12 * s} ${6 * s},${10 * s} ${8 * s},${5 * s} C${10 * s},${-2 * s} ${5 * s},${-10 * s} 0,${-20 * s}Z" fill="#000"/>
            </g>`;

        case 'GHS04': // Cilindro de gás
            return `<g transform="translate(${cx},${cy})">
                <rect x="${-10 * s}" y="${-16 * s}" width="${20 * s}" height="${28 * s}" rx="${5 * s}" fill="#000"/>
                <line x1="0" y1="${-18 * s}" x2="0" y2="${-22 * s}" stroke="#000" stroke-width="${3 * s}"/>
                <rect x="${-4 * s}" y="${-24 * s}" width="${8 * s}" height="${4 * s}" fill="#000"/>
            </g>`;

        case 'GHS05': // Corrosão
            return `<g transform="translate(${cx},${cy - 2})">
                <rect x="${-8 * s}" y="${-20 * s}" width="${4 * s}" height="${10 * s}" fill="#000"/>
                <rect x="${4 * s}" y="${-20 * s}" width="${4 * s}" height="${10 * s}" fill="#000"/>
                <path d="M${-5 * s},${-10 * s} L${-8 * s},${-5 * s}" stroke="#000" stroke-width="${2 * s}"/>
                <path d="M${7 * s},${-10 * s} L${10 * s},${-5 * s}" stroke="#000" stroke-width="${2 * s}"/>
                <path d="M${-15 * s},${-2 * s} C${-15 * s},${8 * s} ${-8 * s},${18 * s} 0,${18 * s} C${8 * s},${18 * s} ${15 * s},${8 * s} ${15 * s},${-2 * s}Z" fill="none" stroke="#000" stroke-width="${2.5 * s}"/>
                <path d="M${-6 * s},${2 * s} C${-6 * s},${8 * s} ${-3 * s},${12 * s} 0,${12 * s} C${3 * s},${12 * s} ${6 * s},${8 * s} ${6 * s},${2 * s}" fill="#000" opacity="0.5"/>
            </g>`;

        case 'GHS06': // Caveira e ossos cruzados
            return `<g transform="translate(${cx},${cy - 2})">
                <circle cx="0" cy="${-5 * s}" r="${12 * s}" fill="#000"/>
                <circle cx="${-5 * s}" cy="${-8 * s}" r="${4 * s}" fill="#fff"/>
                <circle cx="${5 * s}" cy="${-8 * s}" r="${4 * s}" fill="#fff"/>
                <path d="M${-4 * s},${0}" stroke="#fff" stroke-width="${2 * s}" fill="none" d="M${-5 * s},${1 * s} L${5 * s},${1 * s}"/>
                <line x1="${-12 * s}" y1="${10 * s}" x2="${12 * s}" y2="${20 * s}" stroke="#000" stroke-width="${4 * s}" stroke-linecap="round"/>
                <line x1="${12 * s}" y1="${10 * s}" x2="${-12 * s}" y2="${20 * s}" stroke="#000" stroke-width="${4 * s}" stroke-linecap="round"/>
            </g>`;

        case 'GHS07': // Ponto de exclamação
            return `<g transform="translate(${cx},${cy})">
                <rect x="${-3 * s}" y="${-20 * s}" width="${6 * s}" height="${25 * s}" rx="${2 * s}" fill="#000"/>
                <circle cx="0" cy="${12 * s}" r="${4 * s}" fill="#000"/>
            </g>`;

        case 'GHS08': // Silhueta humana (peito danificado)
            return `<g transform="translate(${cx},${cy})">
                <circle cx="0" cy="${-15 * s}" r="${6 * s}" fill="#000"/>
                <path d="M${-12 * s},${-5 * s} L${-12 * s},${18 * s} L${-4 * s},${18 * s} L${-4 * s},${5 * s} L${4 * s},${5 * s} L${4 * s},${18 * s} L${12 * s},${18 * s} L${12 * s},${-5 * s} C${12 * s},${-8 * s} ${6 * s},${-10 * s} 0,${-9 * s} C${-6 * s},${-10 * s} ${-12 * s},${-8 * s} ${-12 * s},${-5 * s}Z" fill="#000"/>
                <path d="M${-5 * s},${-2 * s} L0,${3 * s} L${5 * s},${-2 * s} L${3 * s},${-4 * s} L0,${-1 * s} L${-3 * s},${-4 * s}Z" fill="#ff0000"/>
            </g>`;

        case 'GHS09': // Meio ambiente (árvore morta e peixe)
            return `<g transform="translate(${cx},${cy + 2})">
                <line x1="${-8 * s}" y1="${-20 * s}" x2="${-8 * s}" y2="${5 * s}" stroke="#000" stroke-width="${2 * s}"/>
                <path d="M${-8 * s},${-15 * s} C${-15 * s},${-18 * s} ${-18 * s},${-10 * s} ${-13 * s},${-8 * s}" stroke="#000" stroke-width="${1.5 * s}" fill="none"/>
                <path d="M${-8 * s},${-10 * s} C${-2 * s},${-14 * s} ${0},${-8 * s} ${-4 * s},${-5 * s}" stroke="#000" stroke-width="${1.5 * s}" fill="none"/>
                <path d="M${-8 * s},${-5 * s} C${-14 * s},${-7 * s} ${-16 * s},${-2 * s} ${-12 * s},${0}" stroke="#000" stroke-width="${1.5 * s}" fill="none"/>
                <ellipse cx="${6 * s}" cy="${10 * s}" rx="${14 * s}" ry="${6 * s}" fill="#000"/>
                <circle cx="${14 * s}" cy="${8 * s}" r="${2 * s}" fill="#fff"/>
                <path d="M${-8 * s},${10 * s} L${-14 * s},${5 * s} L${-14 * s},${15 * s}Z" fill="#000"/>
                <line x1="${-20 * s}" y1="${18 * s}" x2="${20 * s}" y2="${18 * s}" stroke="#000" stroke-width="${2 * s}"/>
            </g>`;

        default:
            return `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="12" fill="#000">${codigo}</text>`;
    }
}


// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO NO DOM
// ============================================================

function renderizarPlacards(containerId, classe) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = gerarPlacardSVG(classe, 130);
}

function renderizarPainelSeguranca(containerId, produto) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const nRisco = calcularNumeroRisco(produto);
    container.innerHTML = gerarPainelSeguranca(nRisco, produto.un, 200);
}

function renderizarGHS(containerId, pictogramas) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = pictogramas.map(p => gerarGHSPictogramaSVG(p, 90)).join(' ');
}

// Gerar grid de referência de todas as classes
function renderizarReferencias() {
    // Grid de classes
    const classesGrid = document.getElementById('classesGrid');
    if (classesGrid) {
        const classesArr = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9'];
        classesGrid.innerHTML = classesArr.map(c => {
            const info = CLASSES_RISCO[c] || CLASSES_RISCO[c.split('.')[0]];
            return `
                <div class="class-ref-card">
                    <div class="placard-mini">${gerarPlacardSVG(c, 90)}</div>
                    <div class="class-ref-info">
                        <strong>Classe ${c}</strong>
                        <p>${info ? info.nome : ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Grid de pictogramas GHS
    const ghsGrid = document.getElementById('ghsGrid');
    if (ghsGrid) {
        ghsGrid.innerHTML = Object.entries(PICTOGRAMAS_GHS).map(([codigo, info]) => {
            return `
                <div class="ghs-item">
                    <div class="ghs-picto">${gerarGHSPictogramaSVG(codigo, 70)}</div>
                    <div class="ghs-info">
                        <strong>${codigo}</strong>
                        <p>${info.nome}</p>
                        <small>${info.descricao}</small>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Inicializar referências quando a página carregar
document.addEventListener('DOMContentLoaded', renderizarReferencias);
