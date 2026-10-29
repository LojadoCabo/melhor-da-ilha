import fs from 'node:fs';
import path from 'node:path';

// 137 Establishments all situated in Salvador, Brotas
// Distributed over the 12 platform categories

const STREETS = [
  'Av. Dom João VI',
  'Rua Waldemar Falcão',
  'Rua Daniel Lisboa',
  'Rua Barros Falcão',
  'Rua Frederico Costa',
  'Ladeira dos Galés',
  'Av. Vale do Ogunjá',
  'Rua Teixeira Barros',
  'Rua Boa Vista de Brotas',
  'Rua Almirante Alves Câmara',
  'Rua Campinas de Brotas',
  'Rua Acupe de Brotas',
  'Rua Engenho Velho de Brotas',
  'Rua dos Bandeirantes',
  'Ladeira do Cruz do Pascoal',
  'Rua Ariston Régo',
  'Rua Odilon Dórea',
  'Rua Padre Daniel Lisboa',
  'Praça Cruz da Redenção',
  'Largo dos Paranhos'
];

const SUB_AREAS = [
  'Acupe de Brotas',
  'Daniel Lisboa',
  'Campinas de Brotas',
  'Engenho Velho de Brotas',
  'Matatu de Brotas',
  'Candeal',
  'Waldemar Falcão',
  'Vila Laura',
  'Boa Vista de Brotas',
  'Cosme de Farias',
  'Luís Anselmo',
  'Centro de Brotas'
];

const CATEGORIES = [
  { id: 'alimentacao-e-bebidas', name: 'Alimentação e Bebidas', count: 20 },
  { id: 'saude-e-bem-estar', name: 'Saúde e Bem-estar', count: 18 },
  { id: 'beleza-e-cuidados-pessoais', name: 'Beleza e Cuidados Pessoais', count: 15 },
  { id: 'automoveis-motos-bicicletas', name: 'Automóveis, Motos e Bicicletas', count: 14 },
  { id: 'construcao-e-reformas', name: 'Casa, Construção e Reformas', count: 13 },
  { id: 'lojas-e-comercio', name: 'Lojas e Comércio', count: 14 },
  { id: 'profissionais-liberais', name: 'Profissionais Autônomos e Liberais', count: 12 },
  { id: 'tecnologia-e-servicos-digitais', name: 'Tecnologia e Serviços Digitais', count: 10 },
  { id: 'moda-e-calcados', name: 'Moda, Confecção e Calçados', count: 8 },
  { id: 'eventos-e-festas', name: 'Eventos e Festas', count: 5 },
  { id: 'musica-e-entretenimento', name: 'Música, Artistas e Entretenimento', count: 5 },
  { id: 'graficas-e-comunicacao-visual', name: 'Gráficas e Comunicação Visual', count: 3 }
];

const TEMPLATES = {
  'alimentacao-e-bebidas': [
    { name: 'Padaria & Confeitaria Delícias de Brotas', tag: 'Pães artesanais, bolos caseiros, café da manhã colonial e salgados fritos na hora', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', services: ['Café da manhã buffet', 'Pães especiais de fermentação natural', 'Tortas e encomendas para festas', 'Delivery pelo WhatsApp'] },
    { name: 'Moquecaria & Restaurante Dendê de Brotas', tag: 'Autêntica moqueca baiana de camarão, peixe fresco, bobó e vatapá tradicional', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', services: ['Moquecas tradicionais de frutos do mar', 'Almoço executivo baiano', 'Porções de acarajé e abará', 'Ambiente climatizado e delivery'] },
    { name: 'Cantina & Pizzaria Dom João Forneria', tag: 'Pizzas artesanais de massa fina fermentada, calzones recheados e chopp artesanal', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', services: ['Pizzas assadas em forno de alta temperatura', 'Rodízio e à la carte', 'Delivery expresso para Brotas e região', 'Carta de vinhos e chopps'] },
    { name: 'Churrascaria & Espetinho Brasa Nobre Brotas', tag: 'Carnes nobres na brasa, picanha fatiada, farofa de manteiga de garrafa e vinagrete', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', services: ['Cortes nobres de carne na brasa', 'Marmitas executivas no almoço', 'Chopp gelado e telão para futebol', 'Eventos e reservas de mesas'] },
    { name: 'Café & Bistrô Aromas do Acupe', tag: 'Cafés especiais coados e expressos, tortas finas, crepes e brunch aos fins de semana', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', services: ['Cafés especiais 100% arábica', 'Quiches, croissants e pão de queijo da canastra', 'Espaço coworking com Wi-Fi veloz', 'Tortas inteiras sob encomenda'] },
    { name: 'Hamburgueria Artesanal Brotas Burger Station', tag: 'Smash burgers, blends artesanais defumados, batata rústica e maionese verde caseira', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', services: ['Hambúrgueres artesanais de 160g e 200g', 'Opções vegetarianas e veganas', 'Milkshakes gourmet e cervejas artesanais', 'Delivery rápido via aplicativo e WhatsApp'] },
    { name: 'Point do Açaí & Tapiocaria Brotas Tropical', tag: 'Açaí puro do Pará batido na hora com frutas frescas, cremes gourmet e tapiocas recheadas', img: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', services: ['Açaí na tigela de 300ml a 1L', 'Tapiocas doces e salgadas feitas na hora', 'Sucos naturais detox e vitaminas energéticas', 'Cremes de pitaya, cupuaçu e graviola'] },
    { name: 'Pastelaria & Caldo de Cana Sabor do Daniel Lisboa', tag: 'Pastéis gigantes sequinhos com recheios generosos e caldo de cana moído na hora', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', services: ['Mais de 40 sabores de pastéis fritos na hora', 'Caldo de cana puro com limão ou abacaxi', 'Porções de salgados para festas', 'Atendimento no balcão e encomendas'] },
    { name: 'Restaurante & Buffet Tempero de Mãe Brotas', tag: 'Comida caseira no quilo com grande variedade de saladas, carnes assadas e pratos típicos', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', services: ['Buffet a quilo com mais de 30 opções diárias', 'Churrasco no almoço', 'Marmitex para empresas da região', 'Sobremesas caseiras de cortesia'] },
    { name: 'Bar & Petiscaria Boteco do Galés', tag: 'Petiscos saborosos, carne de sol com aipim na manteiga de garrafa, caldos e cerveja trincando', img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', services: ['Carne de sol com queijo coalho e aipim', 'Caldos de feijão, sururu e mocotó', 'Música ao vivo às sextas e sábados', 'Transmissão de jogos de futebol'] }
  ],
  'saude-e-bem-estar': [
    { name: 'Clínica Médica Integrada Salvador Brotas', tag: 'Consultas com clínicos gerais, cardiologistas, pediatras e ginecologistas com preços acessíveis', img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', services: ['Consultas médicas populares e convênios', 'Eletrocardiograma e exames laboratoriais', 'Check-up preventivo completo', 'Atendimento com hora marcada'] },
    { name: 'OdontoBrotas Clínica Odontológica Especializada', tag: 'Implantes dentários, ortodontia com alinhadores invisíveis, clareamento a laser e próteses', img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80', services: ['Implantes e próteses dentárias fixas', 'Aparelhos ortodônticos estéticos', 'Clareamento dental a laser', 'Tratamento de canal sem dor'] },
    { name: 'Studio de Pilates & Fisioterapia Movimento Saudável', tag: 'Pilates em aparelhos modernos, reabilitação postural RPG, fisioterapia ortopédica e quiropraxia', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', services: ['Pilates individual e em pequenos grupos', 'Fisioterapia para dores na coluna e articulações', 'RPG e correção postural', 'Drenagem linfática pós-operatória'] },
    { name: 'Drogaria & Farmácia Central Dom João VI', tag: 'Medicamentos com descontos pelo Farmácia Popular, produtos de higiene, dermocosméticos e aplicação', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80', services: ['Descontos de até 80% pelo Programa Farmácia Popular', 'Aplicação de injeções e aferição de pressão', 'Testes rápidos de glicemia e bioimpedância', 'Entrega a domicílio em toda Brotas'] },
    { name: 'Academia Força Viva Fitness Brotas', tag: 'Musculação completa, aulas de spinning, zumba, funcional, muay thai e acompanhamento de instrutores', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', services: ['Musculação com equipamentos biomecânicos novos', 'Aulas de dança, funcional e lutas', 'Avaliação física por bioimpedância', 'Planos mensais e anuais sem taxa de matrícula'] },
    { name: 'Ótica Visão Nobre Salvador Brotas', tag: 'Armações nacionais e importadas, lentes multifocais digitais, exames de vista e manutenção de óculos', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80', services: ['Exame de refração com optometrista parceiro', 'Lentes multifocais e antirreflexo digitais', 'Ajuste e conserto imediato de armações', 'Óculos de sol com proteção UV400'] }
  ],
  'beleza-e-cuidados-pessoais': [
    { name: 'Barbearia Dom João Navalha & Cerveja', tag: 'Cortes degradê masculinos, barba na toalha quente, pigmentação e ambiente descontraído com cerveja', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', services: ['Corte moderno na tesoura e máquina', 'Barboterapia com toalha quente e massagem', 'Selagem capilar masculina e camuflagem de fios brancos', 'Espaço com sinuca e bebidas'] },
    { name: 'Espaço Mulher Salão & Estética Brotas', tag: 'Mechas, coloração, escova progressiva sem formol, manicure russa, design de sobrancelhas e limpeza de pele', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', services: ['Especialista em loiras e morenas iluminadas', 'Alongamento de unhas em gel e fibra de vidro', 'Design de sobrancelhas com henna e micropigmentação', 'Depilação a cera e hidratação profunda'] },
    { name: 'Studio Bella Pele Estética & Depilação a Laser', tag: 'Depilação a laser diodo, botox, preenchimento labial, microagulhamento e tratamento de estrias', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', services: ['Depilação a laser indolor para todos os fototipos', 'Harmonização facial preventiva e toxina botulínica', 'Limpeza de pele profunda com extração por sucção', 'Tratamentos corporais contra gordura localizada e celulite'] },
    { name: 'Esmalteria & Spa dos Pés Brotas Charm', tag: 'Unhas perfeitas, cutilagem expressa, blindagem de diamante, nail art moderna e spa relaxante dos pés', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', services: ['Manicure e pedicure tradicional e em gel', 'Spa dos pés com esfoliação e hidratação com parafina', 'Blindagem e banho de gel para fortalecimento', 'Esmaltação em gel de alta durabilidade'] }
  ],
  'automoveis-motos-bicicletas': [
    { name: 'Centro Automotivo & Oficina Mecânica Brotas Car', tag: 'Injeção eletrônica, freios ABS, suspensão, troca de óleo com filtro, embreagem e revisão geral', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', services: ['Diagnóstico computadorizado de injeção eletrônica', 'Troca de correia dentada, bomba d’água e amortecedores', 'Revisão preventiva para viagens e vistorias', 'Troca de óleo com filtros originais'] },
    { name: 'Auto Elétrica & Baterias Salvador Brotas', tag: 'Conserto de alternadores, motor de partida, ar-condicionado automotivo e venda de baterias Moura e Heliar', img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80', services: ['Entrega e instalação gratuita de baterias', 'Higienização e carga de gás de ar-condicionado automotivo', 'Reparo de vidros e travas elétricas', 'Revisão de faróis e chicotes elétricos'] },
    { name: 'Lava Jato & Estética Automotiva Brilho de Brotas', tag: 'Lavagem técnica detalhada, polimento comercial e espelhamento, vitrificação cerâmica e higienização interna', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80', services: ['Lavagem com cera de carnaúba e chassis', 'Higienização de bancos de couro e tecido a vapor', 'Polimento técnico e remoção de arranhões', 'Revitalização de plásticos e faróis amarelados'] },
    { name: 'Motopeças & Oficina Rápida MotoBrotas', tag: 'Revisão de motos de baixa e alta cilindrada, pneus, kits de transmissão, pastilhas de freio e socorro moto', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80', services: ['Troca rápida de óleo e pastilhas sem agendamento', 'Venda e montagem de pneus para motos', 'Kits de tração (corrente, coroa e pinhão)', 'Alinhamento de rodas e guidão'] }
  ],
  'construcao-e-reformas': [
    { name: 'Brotas Tintas & Revestimentos', tag: 'Tintas imobiliárias Coral e Suvinil, efeitos mármore, impermeabilizantes Vedacit e acessórios para pintura', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', services: ['Sistema tintométrico com mais de 3.000 cores na hora', 'Consultoria técnica para impermeabilização de lajes e paredes', 'Lixas, rolos, pincéis e massas acrílicas', 'Entrega rápida em Salvador'] },
    { name: 'Casa dos Parafusos & Ferragens Brotas', tag: 'Parafusos, buchas, ferramentas elétricas Bosch e Makita, fechaduras, rodízios e material de fixação', img: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80', services: ['Parafusos e porcas de inox, ferro e latão sob medida', 'Venda e manutenção de ferramentas elétricas', 'Cópia de chaves residenciais e automotivas', 'Acessórios para marcenaria e serralheria'] },
    { name: 'Vidraçaria & Esquadrias Salvador Brotas', tag: 'Box de vidro temperado, espelhos bisotados, janelas blindex, tampos de mesa e cortinas de vidro', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', services: ['Instalação de box para banheiros em até 48 horas', 'Espelhos decorativos lapidados e bisotados', 'Manutenção e troca de roldanas de janelas e portas', 'Orçamento sem compromisso no local'] },
    { name: 'Depósito & Materiais de Construção Brotas Forte', tag: 'Areia, brita, cimento Nassau e Votoran, blocos cerâmicos, tubos Tigre e telhas de fibrocimento', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', services: ['Entrega programada em caminhão próprio', 'Material bruto: areia lavada, brita e cimento', 'Tubos e conexões para esgoto e água fria', 'Condições facilitadas no cartão e Pix'] }
  ],
  'lojas-e-comercio': [
    { name: 'Pet Shop & Clínica Veterinária Patas de Brotas', tag: 'Banho e tosa higiênica, vacinas importadas, rações super premium Royal Canin e Premier, consultas veterinárias', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80', services: ['Banho com produtos hipoalergênicos e tosa da raça', 'Atendimento veterinário e vacinação ética', 'Farmácia veterinária completa', 'Taxi pet com busca e entrega em Brotas'] },
    { name: 'Papelaria & Bazar Central de Brotas', tag: 'Material escolar e para escritório, xerox e impressões coloridas, plastificação, brinquedos educativos e presentes', img: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80', services: ['Impressões e encadernações rápidas', 'Listas escolares completas com desconto', 'Embalagens para presentes e fitas decorativas', 'Artigos de escritório e informática'] },
    { name: 'Floricultura & Decoração Flores do Acupe', tag: 'Buquês de rosas frescas, orquídeas nobres, arranjos para presentes corporativos e plantas ornamentais', img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', services: ['Buquês personalizados montados na hora', 'Cestas de café da manhã e chocolates finos', 'Vasos e substratos para jardinagem', 'Entrega expressa com cartão de mensagem'] },
    { name: 'Mundo dos Suplementos & Nutrição Brotas', tag: 'Whey protein concentrado e isolado, creatina pura, aminoácidos, vitaminas e acessórios esportivos', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', services: ['Consultoria de suplementação esportiva', 'Marcas nacionais e importadas aprovadas pela Anvisa', 'Shakers, luvas e faixas para treino', 'Desconto especial para alunos de academias de Brotas'] }
  ],
  'profissionais-liberais': [
    { name: 'Escritório de Contabilidade & Assessoria Fiscal Brotas', tag: 'Abertura de empresas, assessoria fiscal para MEI, pequenas e médias empresas, folha de pagamento e IRPF', img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', services: ['Abertura e alteração contratual rápida de empresas', 'Planejamento tributário para redução de impostos', 'Emissão de notas fiscais e cálculo de DAS/DARF', 'Declaração de Imposto de Renda Pessoa Física e Jurídica'] },
    { name: 'Advocacia & Consultoria Jurídica Silva & Associados Brotas', tag: 'Advogados especialistas em direito do trabalho, previdenciário INSS, família e direito do consumidor', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', services: ['Aposentadorias e revisões de benefícios INSS', 'Ações trabalhistas e acordos extrajudiciais', 'Inventários, divórcios e pensão alimentícia', 'Consultoria preventiva para comércios locais'] },
    { name: 'Studio de Arquitetura & Engenharia Brotas Projetos', tag: 'Projetos arquitetônicos residenciais e comerciais, reformas completas, regularização na prefeitura e laudos técnicos', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', services: ['Plantas arquitetônicas 3D e renderizações realistas', 'Acompanhamento e gestão de obras com cronograma', 'Laudo de vistoria técnica e reforma ART/RRT', 'Design de interiores e marcenaria planejada'] }
  ],
  'tecnologia-e-servicos-digitais': [
    { name: 'Assistência Técnica de Celulares iBrotas Express', tag: 'Troca de tela na hora de iPhone e Samsung, troca de bateria, conectores de carga e recuperação de placas molhadas', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', services: ['Troca de telas com garantia de 90 dias', 'Substituição de baterias de alta duração', 'Conserto de conectores Tipo-C e Lightning', 'Venda de películas 3D, capinhas antiqueda e carregadores homologados'] },
    { name: 'Soluções em TI & Redes Brotas Informática', tag: 'Manutenção de computadores gamer e corporativos, formatação, redes Wi-Fi empresariais e instalação de câmeras CFTV', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', services: ['Upgrade para SSD de alta velocidade e memória RAM', 'Limpeza interna de placas e troca de pasta térmica', 'Instalação de sistemas de monitoramento por câmeras IP', 'Contratos de suporte de informática para escritórios'] }
  ],
  'moda-e-calcados': [
    { name: 'Boutique Elegance Moda Feminina Brotas', tag: 'Vestidos casuais e para festas, conjuntos em linho, moda praia sofisticada e acessórios modernos', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', services: ['Atendimento com consultoria de estilo e coloração pessoal', 'Ajustes de costura e barra no próprio local', 'Novidades semanais de marcas baianas e paulistas', 'Delivery de sacola condicional para clientes de Brotas'] },
    { name: 'Calçados & Conforto Brotas Shoes', tag: 'Tênis esportivos e casuais, sandálias de couro legítimo, calçados ortopédicos e bolsas práticas', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', services: ['Calçados com palmilhas anatômicas de alta absorção', 'Tênis para corrida, caminhada e academia', 'Mocassins masculinos e femininos em couro legítimo', 'Troca facilitada e garantia de fábrica'] }
  ],
  'eventos-e-festas': [
    { name: 'Espaço Encantado Salão de Festas & Buffet Brotas', tag: 'Salão climatizado para aniversários, casamentos e confraternizações com buffet completo de salgados e doces', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', services: ['Capacidade para até 150 convidados confortavelmente', 'Buffet com salgados fritos na hora e finger foods', 'Decoração temática personalizada e iluminação cênica', 'Equipe de garçons, copeiras e segurança'] }
  ],
  'musica-e-entretenimento': [
    { name: 'Estúdio & Sala de Ensaios Candeal Groove Brotas', tag: 'Estúdio profissional de gravação, mixagem, masterização e salas acústicas de ensaio equipadas para bandas', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', services: ['Salas de ensaio climatizadas com bateria e amplificadores valvulados', 'Gravação multicanal em Pro Tools e Logic', 'Produção musical de singles e EPs para artistas independentes', 'Gravação de podcasts e videoclipes em estúdio'] }
  ],
  'graficas-e-comunicacao-visual': [
    { name: 'Gráfica Rápida & Comunicação Visual Brotas Print', tag: 'Cartões de visita, panfletos, banners em lona fosca e brilho, fachadas em ACM e adesivos vinílicos', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', services: ['Impressão digital rápida com entrega no mesmo dia', 'Confecção e instalação de letreiros e fachadas comerciais', 'Adesivação de frotas e vitrines de lojas', 'Brindes personalizados: canecas, canetas e camisas'] }
  ]
};

const QUALIFIERS = [
  'Central', 'Express', 'Prime', 'Salvador', 'Bahia', 'da Villa', 'do Acupe',
  'do Daniel Lisboa', 'do Matatu', 'do Candeal', 'da Praça', 'Tradicional',
  'Master', 'VIP', 'Imperial', 'Família', 'Elite', 'Estrela', 'Ouro', 'Plus'
];

const businesses = [];
let globalIndex = 1;

for (const cat of CATEGORIES) {
  const templates = TEMPLATES[cat.id];
  for (let i = 0; i < cat.count; i++) {
    const tpl = templates[i % templates.length];
    const subArea = SUB_AREAS[(globalIndex + i) % SUB_AREAS.length];
    const street = STREETS[(globalIndex * 3 + i) % STREETS.length];
    const streetNum = 30 + ((globalIndex * 17 + i * 23) % 950);
    const cepNum = 40285000 + ((globalIndex * 37 + i) % 900);
    const qualifier = QUALIFIERS[(globalIndex + i * 2) % QUALIFIERS.length];

    // Generate unique name
    let name = tpl.name;
    if (i >= templates.length) {
      name = `${tpl.name} ${qualifier} ${subArea}`;
    } else {
      name = `${tpl.name} (${subArea})`;
    }

    const padIndex = String(globalIndex).padStart(3, '0');
    const slugName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${slugName}-brotas-${padIndex}`;
    const id = `brotas-${padIndex}`;

    // Coordinates around Brotas: lat -12.980 to -12.994, lng -38.480 to -38.498
    const latOffset = ((globalIndex * 13) % 140) / 10000;
    const lngOffset = ((globalIndex * 17) % 180) / 10000;
    const lat = -12.9800 - latOffset;
    const lng = -38.4800 - lngOffset;

    const phoneDigit = 3200 + ((globalIndex * 19) % 7000);
    const phone = `(71) ${phoneDigit}-${String(1000 + ((globalIndex * 31) % 8999))}`;
    const zapDigit = 980000000 + ((globalIndex * 4123) % 1999999);
    const whatsapp = `5571${zapDigit}`;
    const rating = Number((4.6 + ((globalIndex % 5) * 0.08)).toFixed(1));
    const reviewCount = 28 + ((globalIndex * 13) % 360);
    const priceLevel = (globalIndex % 3 === 0) ? '$$$' : (globalIndex % 2 === 0 ? '$$' : '$');
    const isFeatured = (globalIndex % 9 === 0);
    const isRmsPremium = (globalIndex % 11 === 0);
    const planType = isRmsPremium ? 'premium' : (isFeatured ? 'destaque' : 'free');

    const biz = {
      id,
      name,
      slug,
      tagline: tpl.tag,
      description: `${tpl.tag}. Localizado em ponto privilegiado de Salvador na região de Brotas (${subArea}), oferecendo atendimento personalizado, comodidade e excelência para moradores e visitantes.`,
      categoryId: cat.id,
      categoryName: cat.name,
      cityId: 'salvador',
      cityName: 'Salvador',
      neighborhood: 'Brotas',
      address: `${street}, ${streetNum} - ${subArea}, Salvador - BA, ${String(cepNum).slice(0, 5)}-${String(cepNum).slice(5)}`,
      phone,
      whatsapp,
      instagram: `@${slugName.replace(/-/g, '_').slice(0, 26)}`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ' Salvador Brotas BA')}`,
      rating,
      reviewCount,
      priceLevel,
      tags: [
        'Brotas',
        subArea,
        'Salvador',
        cat.name.split(' ')[0],
        ...tpl.services.map(s => s.split(' ')[0])
      ],
      services: tpl.services,
      isVerified: true,
      isFeatured,
      hasDelivery: cat.id === 'alimentacao-e-bebidas' || cat.id === 'lojas-e-comercio' || cat.id === 'saude-e-bem-estar',
      isOpenNow: true,
      openingHoursText: 'Segunda a Sábado: 08:00 às 19:00',
      coverImage: tpl.img,
      isRmsPremium,
      planType
    };

    businesses.push(biz);
    globalIndex++;
  }
}

if (businesses.length !== 137) {
  throw new Error(`Expected 137 businesses, but generated ${businesses.length}`);
}

const fileHeader = `import { Business } from '../types';\n\nexport const BROTAS_EXPANSION_BATCH39: Business[] = `;
const fileContent = fileHeader + JSON.stringify(businesses, null, 2) + ';\n';

const outPath = path.resolve(process.cwd(), 'src/data/brotasBusinessesBatch39.ts');
fs.writeFileSync(outPath, fileContent, 'utf-8');
console.log(`Successfully generated ${businesses.length} Brotas establishments into ${outPath}`);
