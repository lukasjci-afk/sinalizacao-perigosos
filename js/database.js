/**
 * Banco de dados de produtos perigosos da ONU
 * Baseado na Resolução ANTT 5.998/2022 e classificação ONU
 *
 * Estrutura:
 *   un: Número ONU
 *   nome: Nome apropriado para embarque (português)
 *   classe: Classe de risco principal
 *   subclasse: Subclasse (se aplicável)
 *   riscoSub: Risco subsidiário
 *   ge: Grupo de embalagem (I, II, III)
 *   nomeEng: Nome em inglês
 *   ghsPicto: Pictogramas GHS aplicáveis
 *   palavraSinal: Palavra de sinalização GHS
 *   provisoes: Provisões especiais
 */

const CLASSES_RISCO = {
    '1':   { nome: 'Explosivos', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.1': { nome: 'Explosivos - Risco de explosão em massa', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.2': { nome: 'Explosivos - Risco de projeção', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.3': { nome: 'Explosivos - Risco de fogo', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.4': { nome: 'Explosivos - Risco limitado', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.5': { nome: 'Explosivos muito insensíveis', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '1.6': { nome: 'Artigos detonantes extremamente insensíveis', cor: '#ff6600', corFundo: '#ff6600', corTexto: '#000' },
    '2.1': { nome: 'Gases inflamáveis', cor: '#ff0000', corFundo: '#ff0000', corTexto: '#fff' },
    '2.2': { nome: 'Gases não inflamáveis, não tóxicos', cor: '#00aa00', corFundo: '#00aa00', corTexto: '#fff' },
    '2.3': { nome: 'Gases tóxicos', cor: '#ffffff', corFundo: '#ffffff', corTexto: '#000' },
    '3':   { nome: 'Líquidos inflamáveis', cor: '#ff0000', corFundo: '#ff0000', corTexto: '#fff' },
    '4.1': { nome: 'Sólidos inflamáveis', cor: '#ff0000', corFundo: '#fff', corTexto: '#000' },
    '4.2': { nome: 'Substâncias sujeitas à combustão espontânea', cor: '#ff0000', corFundo: '#fff', corTexto: '#000' },
    '4.3': { nome: 'Substâncias que emitem gases inflamáveis em contato com água', cor: '#0000ff', corFundo: '#0000ff', corTexto: '#fff' },
    '5.1': { nome: 'Substâncias oxidantes', cor: '#ffff00', corFundo: '#ffff00', corTexto: '#000' },
    '5.2': { nome: 'Peróxidos orgânicos', cor: '#ffff00', corFundo: '#ff0000', corTexto: '#000' },
    '6.1': { nome: 'Substâncias tóxicas', cor: '#ffffff', corFundo: '#ffffff', corTexto: '#000' },
    '6.2': { nome: 'Substâncias infectantes', cor: '#ffffff', corFundo: '#ffffff', corTexto: '#000' },
    '7':   { nome: 'Materiais radioativos', cor: '#ffff00', corFundo: '#ffff00', corTexto: '#000' },
    '8':   { nome: 'Substâncias corrosivas', cor: '#000000', corFundo: '#fff', corTexto: '#000' },
    '9':   { nome: 'Substâncias e artigos perigosos diversos', cor: '#ffffff', corFundo: '#fff', corTexto: '#000' }
};

const PICTOGRAMAS_GHS = {
    'GHS01': { nome: 'Bomba explodindo', descricao: 'Explosivos, substâncias autorreativas, peróxidos orgânicos' },
    'GHS02': { nome: 'Chama', descricao: 'Inflamáveis, pirofóricos, autorreativos, autoaquecimento' },
    'GHS03': { nome: 'Chama sobre círculo', descricao: 'Oxidantes' },
    'GHS04': { nome: 'Cilindro de gás', descricao: 'Gases sob pressão' },
    'GHS05': { nome: 'Corrosão', descricao: 'Corrosivos para metais, pele, olhos' },
    'GHS06': { nome: 'Caveira e ossos cruzados', descricao: 'Toxicidade aguda (fatal/tóxico)' },
    'GHS07': { nome: 'Ponto de exclamação', descricao: 'Irritante, sensibilizante cutâneo, toxicidade aguda (nocivo)' },
    'GHS08': { nome: 'Silhueta humana', descricao: 'Carcinogenicidade, mutagenicidade, toxicidade sistêmica' },
    'GHS09': { nome: 'Meio ambiente', descricao: 'Perigoso para o meio ambiente aquático' }
};

// Tabela de compatibilidade entre classes para transporte misto
// 'S' = Permitido, 'C' = Condicional, 'N' = Proibido
const COMPATIBILIDADE = {
    '1':   { '1': 'C', '2.1': 'N', '2.2': 'N', '2.3': 'N', '3': 'N', '4.1': 'N', '4.2': 'N', '4.3': 'N', '5.1': 'N', '5.2': 'N', '6.1': 'N', '6.2': 'N', '7': 'N', '8': 'N', '9': 'N' },
    '2.1': { '1': 'N', '2.1': 'S', '2.2': 'S', '2.3': 'C', '3': 'S', '4.1': 'C', '4.2': 'C', '4.3': 'C', '5.1': 'N', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'N', '8': 'C', '9': 'S' },
    '2.2': { '1': 'N', '2.1': 'S', '2.2': 'S', '2.3': 'S', '3': 'S', '4.1': 'S', '4.2': 'S', '4.3': 'S', '5.1': 'C', '5.2': 'C', '6.1': 'S', '6.2': 'C', '7': 'C', '8': 'S', '9': 'S' },
    '2.3': { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'S', '3': 'C', '4.1': 'C', '4.2': 'C', '4.3': 'C', '5.1': 'N', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'N', '8': 'C', '9': 'S' },
    '3':   { '1': 'N', '2.1': 'S', '2.2': 'S', '2.3': 'C', '3': 'S', '4.1': 'C', '4.2': 'C', '4.3': 'N', '5.1': 'N', '5.2': 'N', '6.1': 'S', '6.2': 'N', '7': 'C', '8': 'S', '9': 'S' },
    '4.1': { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'C', '3': 'C', '4.1': 'S', '4.2': 'C', '4.3': 'C', '5.1': 'N', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'C', '8': 'C', '9': 'S' },
    '4.2': { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'C', '3': 'C', '4.1': 'C', '4.2': 'S', '4.3': 'C', '5.1': 'N', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'C', '8': 'C', '9': 'S' },
    '4.3': { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'C', '3': 'N', '4.1': 'C', '4.2': 'C', '4.3': 'S', '5.1': 'N', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'C', '8': 'N', '9': 'S' },
    '5.1': { '1': 'N', '2.1': 'N', '2.2': 'C', '2.3': 'N', '3': 'N', '4.1': 'N', '4.2': 'N', '4.3': 'N', '5.1': 'S', '5.2': 'C', '6.1': 'C', '6.2': 'N', '7': 'C', '8': 'C', '9': 'S' },
    '5.2': { '1': 'N', '2.1': 'N', '2.2': 'C', '2.3': 'N', '3': 'N', '4.1': 'N', '4.2': 'N', '4.3': 'N', '5.1': 'C', '5.2': 'S', '6.1': 'C', '6.2': 'N', '7': 'N', '8': 'C', '9': 'S' },
    '6.1': { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'C', '3': 'S', '4.1': 'C', '4.2': 'C', '4.3': 'C', '5.1': 'C', '5.2': 'C', '6.1': 'S', '6.2': 'N', '7': 'C', '8': 'S', '9': 'S' },
    '6.2': { '1': 'N', '2.1': 'N', '2.2': 'C', '2.3': 'N', '3': 'N', '4.1': 'N', '4.2': 'N', '4.3': 'N', '5.1': 'N', '5.2': 'N', '6.1': 'N', '6.2': 'S', '7': 'N', '8': 'N', '9': 'C' },
    '7':   { '1': 'N', '2.1': 'N', '2.2': 'C', '2.3': 'N', '3': 'C', '4.1': 'C', '4.2': 'C', '4.3': 'C', '5.1': 'C', '5.2': 'N', '6.1': 'C', '6.2': 'N', '7': 'S', '8': 'C', '9': 'S' },
    '8':   { '1': 'N', '2.1': 'C', '2.2': 'S', '2.3': 'C', '3': 'S', '4.1': 'C', '4.2': 'C', '4.3': 'N', '5.1': 'C', '5.2': 'C', '6.1': 'S', '6.2': 'N', '7': 'C', '8': 'S', '9': 'S' },
    '9':   { '1': 'N', '2.1': 'S', '2.2': 'S', '2.3': 'S', '3': 'S', '4.1': 'S', '4.2': 'S', '4.3': 'S', '5.1': 'S', '5.2': 'S', '6.1': 'S', '6.2': 'C', '7': 'S', '8': 'S', '9': 'S' }
};

// Produtos perigosos mais comuns no Brasil
const PRODUTOS = [
    // Classe 1 - Explosivos
    { un: '0027', nome: 'Pólvora negra', classe: '1.1', ge: '', ghsPicto: ['GHS01'], palavraSinal: 'Perigo' },
    { un: '0081', nome: 'Explosivo de demolição, tipo A', classe: '1.1', ge: '', ghsPicto: ['GHS01'], palavraSinal: 'Perigo' },
    { un: '0331', nome: 'Explosivo de demolição, tipo B', classe: '1.5', ge: '', ghsPicto: ['GHS01'], palavraSinal: 'Perigo' },
    { un: '0336', nome: 'Fogos de artifício', classe: '1.4', ge: '', ghsPicto: ['GHS01'], palavraSinal: 'Atenção' },
    { un: '0337', nome: 'Fogos de artifício', classe: '1.3', ge: '', ghsPicto: ['GHS01'], palavraSinal: 'Perigo' },

    // Classe 2 - Gases
    { un: '1001', nome: 'Acetileno dissolvido', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo', riscoSub: '' },
    { un: '1002', nome: 'Ar comprimido', classe: '2.2', ge: '', ghsPicto: ['GHS04'], palavraSinal: 'Atenção' },
    { un: '1005', nome: 'Amônia anidra', classe: '2.3', ge: '', ghsPicto: ['GHS06', 'GHS04', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '1006', nome: 'Argônio comprimido', classe: '2.2', ge: '', ghsPicto: ['GHS04'], palavraSinal: 'Atenção' },
    { un: '1011', nome: 'Butano', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '1013', nome: 'Dióxido de carbono', classe: '2.2', ge: '', ghsPicto: ['GHS04'], palavraSinal: 'Atenção' },
    { un: '1017', nome: 'Cloro', classe: '2.3', ge: '', ghsPicto: ['GHS06', 'GHS04', 'GHS05', 'GHS09'], palavraSinal: 'Perigo', riscoSub: '5.1+8' },
    { un: '1023', nome: 'Gás de carvão comprimido', classe: '2.3', ge: '', ghsPicto: ['GHS02', 'GHS06', 'GHS04'], palavraSinal: 'Perigo', riscoSub: '2.1' },
    { un: '1038', nome: 'Etileno refrigerado líquido', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '1049', nome: 'Hidrogênio comprimido', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '1066', nome: 'Nitrogênio comprimido', classe: '2.2', ge: '', ghsPicto: ['GHS04'], palavraSinal: 'Atenção' },
    { un: '1072', nome: 'Oxigênio comprimido', classe: '2.2', ge: '', ghsPicto: ['GHS03', 'GHS04'], palavraSinal: 'Perigo', riscoSub: '5.1' },
    { un: '1073', nome: 'Oxigênio líquido refrigerado', classe: '2.2', ge: '', ghsPicto: ['GHS03', 'GHS04'], palavraSinal: 'Perigo', riscoSub: '5.1' },
    { un: '1075', nome: 'Gás liquefeito de petróleo (GLP)', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '1076', nome: 'Fosgênio', classe: '2.3', ge: '', ghsPicto: ['GHS06', 'GHS04'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '1079', nome: 'Dióxido de enxofre', classe: '2.3', ge: '', ghsPicto: ['GHS06', 'GHS04', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '8' },

    // Classe 3 - Líquidos inflamáveis
    { un: '1090', nome: 'Acetona', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1114', nome: 'Benzeno', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07', 'GHS08'], palavraSinal: 'Perigo', riscoSub: '' },
    { un: '1120', nome: 'Butanóis', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1133', nome: 'Adesivos', classe: '3', ge: 'I', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1170', nome: 'Etanol (álcool etílico)', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1173', nome: 'Acetato de etila', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1193', nome: 'Metil etil cetona (MEK)', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1198', nome: 'Formaldeído em solução inflamável', classe: '3', ge: 'III', ghsPicto: ['GHS02', 'GHS06', 'GHS08'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '1202', nome: 'Óleo diesel / Combustível para motores diesel', classe: '3', ge: 'III', ghsPicto: ['GHS02', 'GHS07', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '1203', nome: 'Gasolina', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '1223', nome: 'Querosene', classe: '3', ge: 'III', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Atenção' },
    { un: '1230', nome: 'Metanol', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS06', 'GHS08'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '1247', nome: 'Metacrilato de metila, monômero, estabilizado', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1263', nome: 'Tinta (incluindo tinta, laca, esmalte, verniz)', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1267', nome: 'Petróleo bruto', classe: '3', ge: 'I', ghsPicto: ['GHS02', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '1268', nome: 'Produtos de petróleo, N.E.', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1294', nome: 'Tolueno', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '1300', nome: 'Aguarrás', classe: '3', ge: 'III', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Atenção' },
    { un: '1307', nome: 'Xilenos', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1863', nome: 'Combustível de aviação', classe: '3', ge: 'I', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1965', nome: 'Hidrocarbonetos gasosos liquefeitos, N.E.', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '1993', nome: 'Líquido inflamável, N.E.', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1999', nome: 'Alcatrões líquidos', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '3295', nome: 'Hidrocarbonetos líquidos, N.E.', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1547', nome: 'Anilina', classe: '6.1', ge: 'II', ghsPicto: ['GHS06', 'GHS08', 'GHS09'], palavraSinal: 'Perigo', riscoSub: '' },

    // Classe 4 - Sólidos inflamáveis
    { un: '1325', nome: 'Sólido inflamável orgânico, N.E.', classe: '4.1', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1350', nome: 'Enxofre', classe: '4.1', ge: 'III', ghsPicto: ['GHS02'], palavraSinal: 'Atenção' },
    { un: '1374', nome: 'Farinha de peixe (resíduos de peixe), não estabilizada', classe: '4.2', ge: '', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1381', nome: 'Fósforo branco ou amarelo', classe: '4.2', ge: 'I', ghsPicto: ['GHS02', 'GHS06'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '1396', nome: 'Alumínio em pó, não revestido', classe: '4.3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1402', nome: 'Carbeto de cálcio', classe: '4.3', ge: 'I', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1428', nome: 'Sódio', classe: '4.3', ge: 'I', ghsPicto: ['GHS02', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '4.2' },
    { un: '2304', nome: 'Naftaleno fundido', classe: '4.1', ge: 'III', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Atenção' },

    // Classe 5 - Oxidantes e Peróxidos
    { un: '1442', nome: 'Perclorato de amônio', classe: '5.1', ge: 'II', ghsPicto: ['GHS03', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1444', nome: 'Perclorato de amônio', classe: '5.1', ge: 'I', ghsPicto: ['GHS03'], palavraSinal: 'Perigo' },
    { un: '1451', nome: 'Nitrato de césio', classe: '5.1', ge: 'III', ghsPicto: ['GHS03'], palavraSinal: 'Atenção' },
    { un: '1479', nome: 'Substância sólida oxidante, N.E.', classe: '5.1', ge: 'II', ghsPicto: ['GHS03'], palavraSinal: 'Perigo' },
    { un: '1486', nome: 'Nitrato de potássio', classe: '5.1', ge: 'III', ghsPicto: ['GHS03'], palavraSinal: 'Atenção' },
    { un: '1495', nome: 'Clorato de sódio', classe: '5.1', ge: 'II', ghsPicto: ['GHS03', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1498', nome: 'Nitrato de sódio', classe: '5.1', ge: 'III', ghsPicto: ['GHS03'], palavraSinal: 'Atenção' },
    { un: '2015', nome: 'Peróxido de hidrogênio (água oxigenada) > 60%', classe: '5.1', ge: 'I', ghsPicto: ['GHS03', 'GHS05', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '2014', nome: 'Peróxido de hidrogênio (água oxigenada) 20-60%', classe: '5.1', ge: 'II', ghsPicto: ['GHS03', 'GHS05', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '2984', nome: 'Peróxido de hidrogênio (água oxigenada) 8-20%', classe: '5.1', ge: 'III', ghsPicto: ['GHS03', 'GHS07'], palavraSinal: 'Atenção' },
    { un: '3149', nome: 'Peróxido de hidrogênio e ácido peracético', classe: '5.1', ge: 'II', ghsPicto: ['GHS03', 'GHS05', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '3101', nome: 'Peróxido orgânico tipo B, líquido', classe: '5.2', ge: '', ghsPicto: ['GHS01', 'GHS02'], palavraSinal: 'Perigo' },
    { un: '3105', nome: 'Peróxido orgânico tipo D, líquido', classe: '5.2', ge: '', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },

    // Classe 6 - Tóxicos e Infectantes
    { un: '1544', nome: 'Alcaloides sólidos, N.E. ou Sais de alcaloides', classe: '6.1', ge: 'II', ghsPicto: ['GHS06'], palavraSinal: 'Perigo' },
    { un: '1583', nome: 'Mistura de cloropicrina, N.E.', classe: '6.1', ge: 'II', ghsPicto: ['GHS06'], palavraSinal: 'Perigo' },
    { un: '1593', nome: 'Diclorometano (cloreto de metileno)', classe: '6.1', ge: 'III', ghsPicto: ['GHS07', 'GHS08'], palavraSinal: 'Atenção' },
    { un: '1613', nome: 'Ácido cianídrico em solução aquosa', classe: '6.1', ge: 'I', ghsPicto: ['GHS06'], palavraSinal: 'Perigo', riscoSub: '3' },
    { un: '1680', nome: 'Cianeto de potássio', classe: '6.1', ge: 'I', ghsPicto: ['GHS06', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '1689', nome: 'Cianeto de sódio', classe: '6.1', ge: 'I', ghsPicto: ['GHS06', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '1851', nome: 'Medicamento líquido, tóxico, N.E.', classe: '6.1', ge: 'III', ghsPicto: ['GHS07'], palavraSinal: 'Atenção' },
    { un: '2810', nome: 'Líquido tóxico orgânico, N.E.', classe: '6.1', ge: 'II', ghsPicto: ['GHS06'], palavraSinal: 'Perigo' },
    { un: '2811', nome: 'Sólido tóxico orgânico, N.E.', classe: '6.1', ge: 'II', ghsPicto: ['GHS06'], palavraSinal: 'Perigo' },
    { un: '2814', nome: 'Substância infectante para o ser humano', classe: '6.2', ge: '', ghsPicto: [], palavraSinal: 'Perigo' },
    { un: '2900', nome: 'Substância infectante para animais apenas', classe: '6.2', ge: '', ghsPicto: [], palavraSinal: 'Perigo' },
    { un: '3077', nome: 'Substância perigosa ao meio ambiente, sólida, N.E.', classe: '9', ge: 'III', ghsPicto: ['GHS09'], palavraSinal: 'Atenção' },
    { un: '3082', nome: 'Substância perigosa ao meio ambiente, líquida, N.E.', classe: '9', ge: 'III', ghsPicto: ['GHS09'], palavraSinal: 'Atenção' },

    // Classe 7 - Radioativos
    { un: '2908', nome: 'Materiais radioativos, embalado excetuado — embalagem vazia', classe: '7', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '2910', nome: 'Materiais radioativos, embalado excetuado — quantidade limitada', classe: '7', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '2982', nome: 'Materiais radioativos, N.E.', classe: '7', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '3321', nome: 'Materiais radioativos, baixa atividade específica (BAE-II)', classe: '7', ge: '', ghsPicto: [], palavraSinal: '' },

    // Classe 8 - Corrosivos
    { un: '1789', nome: 'Ácido clorídrico (ácido muriático)', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1790', nome: 'Ácido fluorídrico', classe: '8', ge: 'I', ghsPicto: ['GHS05', 'GHS06'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '1805', nome: 'Ácido fosfórico em solução', classe: '8', ge: 'III', ghsPicto: ['GHS05'], palavraSinal: 'Atenção' },
    { un: '1823', nome: 'Hidróxido de sódio sólido (soda cáustica)', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1824', nome: 'Hidróxido de sódio em solução', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1830', nome: 'Ácido sulfúrico', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1831', nome: 'Ácido sulfúrico fumegante (óleum)', classe: '8', ge: 'I', ghsPicto: ['GHS05', 'GHS06'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '1824', nome: 'Hidróxido de sódio em solução', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1830', nome: 'Ácido sulfúrico', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1813', nome: 'Hidróxido de potássio sólido (potassa cáustica)', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1814', nome: 'Hidróxido de potássio em solução', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1830', nome: 'Ácido sulfúrico', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1832', nome: 'Ácido sulfúrico residual', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1760', nome: 'Líquido corrosivo, N.E.', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1759', nome: 'Sólido corrosivo, N.E.', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1791', nome: 'Hipoclorito em solução', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1823', nome: 'Hidróxido de sódio sólido (soda cáustica)', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1873', nome: 'Ácido perclórico > 50%', classe: '5.1', ge: 'I', ghsPicto: ['GHS03', 'GHS05', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '2031', nome: 'Ácido nítrico, exceto fumegante', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS03', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '5.1' },
    { un: '2032', nome: 'Ácido nítrico fumegante', classe: '8', ge: 'I', ghsPicto: ['GHS05', 'GHS03', 'GHS06'], palavraSinal: 'Perigo', riscoSub: '5.1+6.1' },
    { un: '2672', nome: 'Amônia em solução 10-35%', classe: '8', ge: 'III', ghsPicto: ['GHS05', 'GHS07'], palavraSinal: 'Atenção' },
    { un: '2735', nome: 'Aminas líquidas corrosivas, N.E.', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '2794', nome: 'Baterias (acumuladores) de chumbo-ácido, com ácido líquido', classe: '8', ge: '', ghsPicto: ['GHS05'], palavraSinal: 'Atenção' },
    { un: '2796', nome: 'Ácido sulfúrico, contendo no máximo 51% de ácido', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '2797', nome: 'Eletrólito ácido para bateria', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '2800', nome: 'Baterias (acumuladores) de chumbo-ácido, não derramáveis', classe: '8', ge: '', ghsPicto: ['GHS05'], palavraSinal: 'Atenção' },

    // Classe 9 - Diversos
    { un: '1845', nome: 'Dióxido de carbono sólido (gelo seco)', classe: '9', ge: 'III', ghsPicto: [], palavraSinal: '' },
    { un: '1941', nome: 'Dibromodifluorometano', classe: '9', ge: 'III', ghsPicto: [], palavraSinal: '' },
    { un: '1990', nome: 'Benzaldeído', classe: '9', ge: 'III', ghsPicto: ['GHS07'], palavraSinal: 'Atenção' },
    { un: '2071', nome: 'Fertilizantes à base de nitrato de amônio', classe: '9', ge: 'III', ghsPicto: ['GHS03'], palavraSinal: 'Atenção' },
    { un: '2211', nome: 'Microesferas de polímero expansível', classe: '9', ge: 'III', ghsPicto: [], palavraSinal: '' },
    { un: '2315', nome: 'Bifenilas policloradas líquidas (PCBs)', classe: '9', ge: 'II', ghsPicto: ['GHS08', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '2807', nome: 'Pastilhas de metal magnetizado', classe: '9', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '3090', nome: 'Baterias de lítio metálico', classe: '9', ge: '', ghsPicto: [], palavraSinal: 'Atenção' },
    { un: '3091', nome: 'Baterias de lítio metálico contidas em equipamento', classe: '9', ge: '', ghsPicto: [], palavraSinal: 'Atenção' },
    { un: '3166', nome: 'Motor à combustão interna ou veículo movido a combustível', classe: '9', ge: '', ghsPicto: ['GHS02'], palavraSinal: 'Atenção' },
    { un: '3171', nome: 'Veículo movido a bateria', classe: '9', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '3257', nome: 'Líquido a temperatura elevada, N.E. (≥100°C)', classe: '9', ge: 'III', ghsPicto: [], palavraSinal: '' },
    { un: '3334', nome: 'Líquido regulamentado para aviação, N.E.', classe: '9', ge: 'III', ghsPicto: [], palavraSinal: '' },
    { un: '3363', nome: 'Mercadorias perigosas em máquinas/aparelhos', classe: '9', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '3373', nome: 'Substância biológica, categoria B', classe: '6.2', ge: '', ghsPicto: [], palavraSinal: '' },
    { un: '3480', nome: 'Baterias de íon lítio', classe: '9', ge: '', ghsPicto: [], palavraSinal: 'Atenção' },
    { un: '3481', nome: 'Baterias de íon lítio contidas em equipamento', classe: '9', ge: '', ghsPicto: [], palavraSinal: 'Atenção' },

    // Produtos químicos industriais comuns
    { un: '1040', nome: 'Óxido de etileno', classe: '2.3', ge: '', ghsPicto: ['GHS02', 'GHS06', 'GHS04', 'GHS08'], palavraSinal: 'Perigo', riscoSub: '2.1' },
    { un: '1050', nome: 'Cloreto de hidrogênio anidro', classe: '2.3', ge: '', ghsPicto: ['GHS06', 'GHS04', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '1090', nome: 'Acetona', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1098', nome: 'Álcool alílico', classe: '6.1', ge: 'I', ghsPicto: ['GHS06', 'GHS02'], palavraSinal: 'Perigo', riscoSub: '3' },
    { un: '1131', nome: 'Dissulfeto de carbono', classe: '3', ge: 'I', ghsPicto: ['GHS02', 'GHS08', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '1145', nome: 'Cicloexano', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '1219', nome: 'Isopropanol (álcool isopropílico)', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Perigo' },
    { un: '1256', nome: 'Éter de petróleo', classe: '3', ge: 'I', ghsPicto: ['GHS02', 'GHS07', 'GHS08', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '1547', nome: 'Anilina', classe: '6.1', ge: 'II', ghsPicto: ['GHS06', 'GHS08', 'GHS09'], palavraSinal: 'Perigo' },
    { un: '1710', nome: 'Tricloroetileno', classe: '6.1', ge: 'III', ghsPicto: ['GHS07', 'GHS08'], palavraSinal: 'Atenção' },
    { un: '1779', nome: 'Ácido fórmico', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS02', 'GHS07'], palavraSinal: 'Perigo', riscoSub: '3' },
    { un: '1823', nome: 'Hidróxido de sódio sólido (soda cáustica)', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '1950', nome: 'Aerossóis', classe: '2.1', ge: '', ghsPicto: ['GHS02', 'GHS04'], palavraSinal: 'Perigo' },
    { un: '2209', nome: 'Formaldeído em solução (formol) ≥25%', classe: '8', ge: 'III', ghsPicto: ['GHS05', 'GHS06', 'GHS08'], palavraSinal: 'Perigo', riscoSub: '6.1' },
    { un: '2261', nome: 'Xilenóis', classe: '6.1', ge: 'II', ghsPicto: ['GHS06', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '2312', nome: 'Fenol fundido', classe: '6.1', ge: 'II', ghsPicto: ['GHS06', 'GHS05'], palavraSinal: 'Perigo', riscoSub: '8' },
    { un: '2789', nome: 'Ácido acético glacial', classe: '8', ge: 'II', ghsPicto: ['GHS05', 'GHS02'], palavraSinal: 'Perigo', riscoSub: '3' },
    { un: '2790', nome: 'Ácido acético em solução (10-80%)', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '3264', nome: 'Líquido inorgânico corrosivo, ácido, N.E.', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },
    { un: '3266', nome: 'Líquido inorgânico corrosivo, básico, N.E.', classe: '8', ge: 'II', ghsPicto: ['GHS05'], palavraSinal: 'Perigo' },

    // NR-20 Inflamáveis e combustíveis
    { un: '1223', nome: 'Querosene', classe: '3', ge: 'III', ghsPicto: ['GHS02', 'GHS07'], palavraSinal: 'Atenção' },
    { un: '1268', nome: 'Produtos de petróleo, N.E.', classe: '3', ge: 'II', ghsPicto: ['GHS02'], palavraSinal: 'Perigo' },
    { un: '1270', nome: 'Óleo mineral (óleo de petróleo)', classe: '3', ge: 'III', ghsPicto: ['GHS02'], palavraSinal: 'Atenção' },
    { un: '1999', nome: 'Alcatrões líquidos', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '3475', nome: 'Mistura de etanol e gasolina', classe: '3', ge: 'II', ghsPicto: ['GHS02', 'GHS07', 'GHS08'], palavraSinal: 'Perigo' },
    { un: '1547', nome: 'Anilina', classe: '6.1', ge: 'II', ghsPicto: ['GHS06', 'GHS08', 'GHS09'], palavraSinal: 'Perigo' }
];

// Deduplicar por número ONU (manter primeiro registro)
const produtosUnicos = [];
const unsVistos = new Set();
for (const p of PRODUTOS) {
    if (!unsVistos.has(p.un)) {
        unsVistos.add(p.un);
        produtosUnicos.push(p);
    }
}

function buscarPorUN(un) {
    const unPadded = un.toString().padStart(4, '0');
    return produtosUnicos.filter(p => p.un === unPadded);
}

function buscarPorNome(termo) {
    const termoLower = termo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return produtosUnicos.filter(p => {
        const nomeLower = p.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        return nomeLower.includes(termoLower);
    });
}

function buscarPorClasse(classe) {
    return produtosUnicos.filter(p => p.classe === classe || p.classe.startsWith(classe + '.'));
}

function buscarProduto(termo) {
    termo = termo.trim();
    if (!termo) return [];

    // Verifica se é número ONU (somente dígitos)
    if (/^\d{1,4}$/.test(termo)) {
        const resultados = buscarPorUN(termo);
        if (resultados.length > 0) return resultados;
    }

    // Busca por nome/descrição
    let resultados = buscarPorNome(termo);

    // Se não encontrou, tenta por classe
    if (resultados.length === 0 && /^\d\.?\d?$/.test(termo)) {
        resultados = buscarPorClasse(termo);
    }

    return resultados;
}

function getClasseInfo(classe) {
    // Try exact match first, then try parent class
    if (CLASSES_RISCO[classe]) return CLASSES_RISCO[classe];
    const parentClasse = classe.split('.')[0];
    if (CLASSES_RISCO[parentClasse]) return CLASSES_RISCO[parentClasse];
    return { nome: 'Desconhecida', cor: '#999', corFundo: '#999', corTexto: '#000' };
}

function getCompatibilidade(classe1, classe2) {
    // Normalize to lookup key
    const c1 = normalizeClasseKey(classe1);
    const c2 = normalizeClasseKey(classe2);

    if (COMPATIBILIDADE[c1] && COMPATIBILIDADE[c1][c2]) {
        return COMPATIBILIDADE[c1][c2];
    }
    return 'C'; // Default to conditional if not found
}

function normalizeClasseKey(classe) {
    // For class 1 subclasses, normalize to '1'
    if (classe.startsWith('1.')) return '1';
    // For other classes, return as is if key exists
    if (COMPATIBILIDADE[classe]) return classe;
    // Try parent class
    const parent = classe.split('.')[0];
    if (COMPATIBILIDADE[parent]) return parent;
    return classe;
}
