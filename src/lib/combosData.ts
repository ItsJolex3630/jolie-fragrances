export interface ComboPerfume {
  name: string;
  volume: string;
  fragranticaId: number;
}

export interface Combo {
  id: string;
  slug: string;
  name: string;
  category: 'Pareja' | 'Todo Terreno' | 'Árabe' | 'Gourmand';
  description: string;
  perfumes: ComboPerfume[];
  originalTotalPrice: number;
  discountPercentage: number;
  comboPrice: number;
  savings: number;
  imageUrl: string;
}

export const combos: Combo[] = [
  // ═══════════════════════════════════════════════════════
  // 💑 PAREJA — Dúo Jolie
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-fascinacion-arabiga',
    slug: 'duo-fascinacion-arabiga',
    name: 'Dúo Fascinación Arábiga',
    category: 'Pareja',
    description:
      'Un encuentro místico entre lo masculino y lo femenino. Asad Zanzibar despliega su fuerza especiada y amaderada, mientras Yara Lattafa envuelve con su dulzura vainillada y floral. Juntos, crean una experiencia olfativa que captura la magia de las noches árabes. El combo perfecto para compartir.',
    perfumes: [
      { name: 'Asad Zanzibar', volume: '100ML', fragranticaId: 90713 },
      { name: 'Yara Lattafa', volume: '100ML', fragranticaId: 76880 },
    ],
    originalTotalPrice: 76,
    discountPercentage: 10,
    comboPrice: 68,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-elite-de-plata',
    slug: 'duo-elite-de-plata',
    name: 'Dúo Élite de Plata',
    category: 'Pareja',
    description:
      'Elegancia de firma en su máxima expresión. Fakhar Silver irradia una frescura plateada y acuática perfecta para el caballero distinguido, mientras Fakhar Rose despliega un ramo de rosas y frutos rojos que enamora a primera impresión. La dupla ideal para quienes buscan sofisticación sin perder intensidad.',
    perfumes: [
      { name: 'Fakhar Silver', volume: '100ML', fragranticaId: 70465 },
      { name: 'Fakhar Rose', volume: '100ML', fragranticaId: 70466 },
    ],
    originalTotalPrice: 82,
    discountPercentage: 10,
    comboPrice: 74,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-cita-en-el-desierto',
    slug: 'duo-cita-en-el-desierto',
    name: 'Dúo Cita en el Desierto',
    category: 'Pareja',
    description:
      'Oud y especias para una noche inolvidable. Oud For Glory aporta la majestuosidad del oud oriental con un sillage imponente de caballero, y Teriaq Intense entrega una profundidad ambarada y especiada que desafía el género. Perfecto para clima templado y noches donde la elegancia árabe es la protagonista.',
    perfumes: [
      { name: 'Oud For Glory', volume: '100ML', fragranticaId: 64948 },
      { name: 'Teriaq Intense', volume: '100ML', fragranticaId: 99586 },
    ],
    originalTotalPrice: 95,
    discountPercentage: 10,
    comboPrice: 86,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-dulce-pecado',
    slug: 'duo-dulce-pecado',
    name: 'Dúo Dulce Pecado',
    category: 'Pareja',
    description:
      'Los más coquetos y elogiados en un solo combo. 9PM Afnan es esa fragancia dulce y seductora que detiene el tiempo en la pista, mientras Yara Moi envuelve con su mezcla irresistible de vainilla, caramelo y notas frutales. Juntos son el pecado más dulce que cometerás.',
    perfumes: [
      { name: '9PM Afnan', volume: '100ML', fragranticaId: 65414 },
      { name: 'Yara Moi', volume: '100ML', fragranticaId: 80722 },
    ],
    originalTotalPrice: 85,
    discountPercentage: 10,
    comboPrice: 77,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-majestad-imperial',
    slug: 'duo-majestad-imperial',
    name: 'Dúo Majestad Imperial',
    category: 'Pareja',
    description:
      'Para los clientes más exigentes. Hawas Elixir es el epítome del lujo masculino con su oud y frutas tropicales, mientras Veneno Bianco es una obra maestra blanca y floral que proyecta poder y sofisticación femenina. Un combo de ticket alto que grita estatus y exclusividad en cada gota.',
    perfumes: [
      { name: 'Hawas Elixir', volume: '100ML', fragranticaId: 110808 },
      { name: 'Veneno Bianco', volume: '100ML', fragranticaId: 105518 },
    ],
    originalTotalPrice: 131,
    discountPercentage: 10,
    comboPrice: 118,
    savings: 13,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🧭 TODO TERRENO — Trío Maestro
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-trio-caballero-completo',
    slug: 'trio-caballero-completo',
    name: 'Trío El Caballero Completo',
    category: 'Todo Terreno',
    description:
      'Tres fragancias, un solo propósito: dominar cualquier ocasión. Glacier Por Homme refresca con su elegancia fresca y acuática para el día, Qaed Al Fursan Untamed desata la fiereza en la fiesta, y Oud For Glory cierra con la majestuosidad del oud oriental para las ocasiones formales. De la oficina al restaurante, este trío lo tiene todo cubierto.',
    perfumes: [
      { name: 'Glacier Por Homme', volume: '100ML', fragranticaId: 93648 },
      { name: 'Qaed Al Fursan Untamed', volume: '90ML', fragranticaId: 105383 },
      { name: 'Oud For Glory', volume: '100ML', fragranticaId: 64948 },
    ],
    originalTotalPrice: 107,
    discountPercentage: 10,
    comboPrice: 96,
    savings: 11,
    imageUrl: '',
  },
  {
    id: 'combo-trio-dama-inalcanzable',
    slug: 'trio-dama-inalcanzable',
    name: 'Trío La Dama Inalcanzable',
    category: 'Todo Terreno',
    description:
      'Tres caras de la feminidad, tres armas de seducción. Ana Abiyedh Coral brilla ligero y primaveral para el día a día, Mayar Cherry conquista con su cereza seductora para las noches de multitudes, y Khamrah cierra con especias y café para los momentos formales que exigen presencia. Inalcanzable, pero inolvidable.',
    perfumes: [
      { name: 'Ana Abiyedh Coral', volume: '100ML', fragranticaId: 103256 },
      { name: 'Mayar Cherry', volume: '100ML', fragranticaId: 99872 },
      { name: 'Khamrah', volume: '100ML', fragranticaId: 75805 },
    ],
    originalTotalPrice: 126,
    discountPercentage: 10,
    comboPrice: 113,
    savings: 13,
    imageUrl: '',
  },
  {
    id: 'combo-trio-unisex-versatil',
    slug: 'trio-unisex-versatil',
    name: 'Trío Unisex Versátil',
    category: 'Todo Terreno',
    description:
      'La tendencia actual en un solo pack: fragancias que rompen géneros y conquistan cualquier ocasión. Odyssey Spectra abre fresco y versátil para el diario, Opulent Dubai trae la opulencia dorada para la noche, y Khair Fusion cierra con una fusión amaderada e imponente para lo formal. Tres perfumes, cero límites.',
    perfumes: [
      { name: 'Odyssey Spectra', volume: '100ML', fragranticaId: 98692 },
      { name: 'Opulent Dubai', volume: '100ML', fragranticaId: 105609 },
      { name: 'Khair Fusion', volume: '100ML', fragranticaId: 92768 },
    ],
    originalTotalPrice: 120,
    discountPercentage: 10,
    comboPrice: 108,
    savings: 12,
    imageUrl: '',
  },
  {
    id: 'combo-trio-gourmand-de-lujo',
    slug: 'trio-gourmand-de-lujo',
    name: 'Trío Gourmand de Lujo',
    category: 'Todo Terreno',
    description:
      'Para los amantes de lo dulce en todas las ocasiones. Yara Candy abre con un dulzor ligero y juguetón para el día, Eclaire Lattafa sube la apuesta con un postre irresistible para la fiesta, y Odyssey Black Forest cierra con un chocolate oscuro e imponente para las ocasiones que exigen elegancia gourmand.',
    perfumes: [
      { name: 'Yara Candy', volume: '100ML', fragranticaId: 95752 },
      { name: 'Eclaire Lattafa', volume: '100ML', fragranticaId: 93628 },
      { name: 'Odyssey Black Forest', volume: '100ML', fragranticaId: 115125 },
    ],
    originalTotalPrice: 146,
    discountPercentage: 10,
    comboPrice: 131,
    savings: 15,
    imageUrl: '',
  },
  {
    id: 'combo-trio-jefe-de-jefes',
    slug: 'trio-jefe-de-jefes',
    name: 'Trío Jefe de Jefes',
    category: 'Todo Terreno',
    description:
      'Exclusivo, alto impacto, sin concesiones. Tharwah Silver marca presencia con su frescura plateada para el diario ejecutivo, Hawas Tropical trae la exuberancia tropical y seductora para las noches de poder, y Khamrah Dukhan cierra con un humo especiado y amaderado que impone autoridad en cada reunión. Manda el que huele así.',
    perfumes: [
      { name: 'Tharwah Silver', volume: '100ML', fragranticaId: 82005 },
      { name: 'Hawas Tropical', volume: '100ML', fragranticaId: 108054 },
      { name: 'Khamrah Dukhan', volume: '100ML', fragranticaId: 104529 },
    ],
    originalTotalPrice: 173,
    discountPercentage: 10,
    comboPrice: 156,
    savings: 17,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // ☕ ÁRABE — Cita en Dubai
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-oud-ancestral',
    slug: 'duo-oud-ancestral',
    name: 'Dúo Oud Ancestral',
    category: 'Árabe',
    description:
      'Dos leyendas del oud que huelen a dinero y tradición. Oud For Glory delivers la profundidad amaderada del oud más premium, y Shaghaf Oud Azraq eleva la experiencia con un oud azulado y misterioso que evoca las noches más profundas de Arabia. Para quienes quieren sillage inmenso y presencia legendaria.',
    perfumes: [
      { name: 'Oud For Glory', volume: '100ML', fragranticaId: 64948 },
      { name: 'Shaghaf Oud Azraq', volume: '100ML', fragranticaId: 82383 },
    ],
    originalTotalPrice: 102,
    discountPercentage: 10,
    comboPrice: 92,
    savings: 10,
    imageUrl: '',
  },
  {
    id: 'combo-duo-noche-de-ambar',
    slug: 'duo-noche-de-ambar',
    name: 'Dúo Noche de Ámbar',
    category: 'Árabe',
    description:
      'Dos joyas de la perfumería árabe en una sola caja. Khamrah enamora con su ámbar cálido especiado y azafrán, mientras Khamrah Qawha profundiza la experiencia con notas de café y cacao que evocan las cafeterías de Oriente. Un dúo que transforma cualquier noche en un ritual sensorial inolvidable.',
    perfumes: [
      { name: 'Khamrah', volume: '100ML', fragranticaId: 75805 },
      { name: 'Khamrah Qawha', volume: '100ML', fragranticaId: 88175 },
    ],
    originalTotalPrice: 94,
    discountPercentage: 10,
    comboPrice: 85,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-tesoro-del-desierto',
    slug: 'duo-tesoro-del-desierto',
    name: 'Dúo Tesoro del Desierto',
    category: 'Árabe',
    description:
      'Un cofre con las dos gemas más codiciadas del desierto. Emeer Lattafa irradia la nobleza del oud y el ámbar con una elegancia que recuerda a los palacios árabes, y Casablanca complementa con su sofisticación floral amaderada que evoca la brisa nocturna del Mediterráneo. Dos tesoros que valen más que el oro.',
    perfumes: [
      { name: 'Emeer Lattafa', volume: '100ML', fragranticaId: 89761 },
      { name: 'Casablanca', volume: '100ML', fragranticaId: 91556 },
    ],
    originalTotalPrice: 122,
    discountPercentage: 10,
    comboPrice: 110,
    savings: 12,
    imageUrl: '',
  },
  {
    id: 'combo-duo-sultan-y-sultana',
    slug: 'duo-sultan-y-sultana',
    name: 'Dúo Sultán y Sultana',
    category: 'Árabe',
    description:
      'Realeza en cada gota. Honor & Glory despliega su oud noble y especiado con la dignidad de un sultán, mientras Amethyst complementa con una joya de ámbar y resinas que proyecta la gracia de una sultana. Dos fragancias unisex pesadas, con sillage monumental, ideales para quienes quieren destacar y oler a verdadero poder.',
    perfumes: [
      { name: 'Honor & Glory', volume: '100ML', fragranticaId: 84302 },
      { name: 'Amethyst', volume: '100ML', fragranticaId: 68214 },
    ],
    originalTotalPrice: 82,
    discountPercentage: 10,
    comboPrice: 74,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-alta-cocina-arabiga',
    slug: 'duo-alta-cocina-arabiga',
    name: 'Dúo Alta Cocina Arábiga',
    category: 'Árabe',
    description:
      'Amaderados gastronómicos que convierten el acto de oler en un banquete. Odyssey Toffee Coffee abre con el aroma del café árabe infusionado con caramelo y toffee, y Khair Confection responde con un dulce de especias y frutos secos que evoca los postres más exquisitos de Oriente. Dos fragancias que huelen a alta cocina árabe.',
    perfumes: [
      { name: 'Odyssey Toffee Coffee', volume: '100ML', fragranticaId: 115137 },
      { name: 'Khair Confection', volume: '100ML', fragranticaId: 99069 },
    ],
    originalTotalPrice: 104,
    discountPercentage: 10,
    comboPrice: 94,
    savings: 10,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🍓 GOURMAND — Dulce Tentación
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-chocomaniaticos',
    slug: 'duo-chocomaniaticos',
    name: 'Dúo Chocomaniáticos',
    category: 'Gourmand',
    description:
      'Para los que no pueden resistirse al lado dulce de la vida. Choco Overdose lleva el chocolate a un nivel adictivo con su mezcla de cacao oscuro y vainilla, y Odyssey Dubai Chocolate le suma una textura cremosa con notas de praliné y dulce de leche. El dúo definitivo para los amantes del chocolate en estado puro.',
    perfumes: [
      { name: 'Choco Overdose', volume: '100ML', fragranticaId: 114398 },
      { name: 'Odyssey Dubai Chocolate', volume: '100ML', fragranticaId: 102117 },
    ],
    originalTotalPrice: 122,
    discountPercentage: 10,
    comboPrice: 110,
    savings: 12,
    imageUrl: '',
  },
  {
    id: 'combo-duo-nube-de-azucar',
    slug: 'duo-nube-de-azucar',
    name: 'Dúo Nube de Azúcar',
    category: 'Gourmand',
    description:
      'Cielo dulce en cada pulverización. Vanilla Freak es una explosión de vainilla pura y cremosa que envuelve como un manto de algodón de azúcar, y Whipped Pleasure sube la apuesta con su mezcla de crema batida, dulce de leche y praliné. Dos fragancias que convierten cualquier día en un festival de azúcar.',
    perfumes: [
      { name: 'Vanilla Freak', volume: '100ML', fragranticaId: 114400 },
      { name: 'Whipped Pleasure', volume: '100ML', fragranticaId: 114397 },
    ],
    originalTotalPrice: 136,
    discountPercentage: 10,
    comboPrice: 122,
    savings: 14,
    imageUrl: '',
  },
  {
    id: 'combo-duo-frutas-del-bosque',
    slug: 'duo-frutas-del-bosque',
    name: 'Dúo Frutas del Bosque',
    category: 'Gourmand',
    description:
      'Frescura frutal y seducción dulce en un solo pack. Berry On Top es una explosión de frutos rojos y bayas silvestres que despierta los sentidos, y Mayar Cherry complementa con su cereza negra envuelta en jazmín y vainilla. Juntos crean un jardín de frutas tentadoras que nadie puede resistir.',
    perfumes: [
      { name: 'Berry On Top', volume: '100ML', fragranticaId: 114395 },
      { name: 'Mayar Cherry', volume: '100ML', fragranticaId: 99872 },
    ],
    originalTotalPrice: 113,
    discountPercentage: 10,
    comboPrice: 102,
    savings: 11,
    imageUrl: '',
  },
  {
    id: 'combo-duo-cafe-y-postre',
    slug: 'duo-cafe-y-postre',
    name: 'Dúo Café y Postre',
    category: 'Gourmand',
    description:
      'El maridaje perfecto: café árabe y el mejor postre. Khamrah Qawha abre con su café especiado y amaderado que evoca las cafeterías más exclusivas, y Tiramisu Caramel responde con un tiramisú bañado en caramelo que derrite voluntades. Dos fragancias gastronómicas que son un menú degustación para el olfato.',
    perfumes: [
      { name: 'Khamrah Qawha', volume: '100ML', fragranticaId: 88175 },
      { name: 'Tiramisu Caramel', volume: '100ML', fragranticaId: 98691 },
    ],
    originalTotalPrice: 94,
    discountPercentage: 10,
    comboPrice: 85,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-caramelo-radiante',
    slug: 'duo-caramelo-radiante',
    name: 'Dúo Caramelo Radiante',
    category: 'Gourmand',
    description:
      'La entrada perfecta al mundo gourmand. Yara Moi seduce con su mezcla de frutas tropicales y caramelo suave, y Caramel Cascade eleva la experiencia con una cascada de dulce de leche y vainilla que brilla con cada movimiento. Excelente relación costo-beneficio para un dúo que vende solo con olerse.',
    perfumes: [
      { name: 'Yara Moi', volume: '100ML', fragranticaId: 80722 },
      { name: 'Caramel Cascade', volume: '100ML', fragranticaId: 95545 },
    ],
    originalTotalPrice: 79,
    discountPercentage: 10,
    comboPrice: 71,
    savings: 8,
    imageUrl: '',
  },
];
