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
  // 💑 PAREJA — Dúos Románticos (10 combos)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-deseo-prohibido',
    slug: 'duo-deseo-prohibido',
    name: 'Dúo Deseo Prohibido',
    category: 'Pareja',
    description:
      'El león y la flor más codiciados en un solo pack. Asad Elixir despliega una potencia especiada y amaderada que impone respeto con cada paso, mientras Yara Elixir responde con una dulzura floral y luminosa que hipnotiza a quien la rodea. Dos elixirs que se buscan, se complementan y se vuelven irresistibles juntos. La química perfecta entre fuerza y delicadeza.',
    perfumes: [
      { name: 'Asad Elixir', volume: '100ML', fragranticaId: 117616 },
      { name: 'Yara Elixir', volume: '100ML', fragranticaId: 117615 },
    ],
    originalTotalPrice: 100,
    discountPercentage: 10,
    comboPrice: 90,
    savings: 10,
    imageUrl: '',
  },
  {
    id: 'combo-duo-noche-de-bourbon',
    slug: 'duo-noche-de-bourbon',
    name: 'Dúo Noche de Bourbon',
    category: 'Pareja',
    description:
      'Calidez bourbon y dulzura candy para una noche que no se olvida. Asad Bourbon irradia una elegancia ahumada y amaderada con notas de bourbon que envuelven al caballero en misterio, mientras Yara Candy estalla con su dulzura juguetona de caramelo y frutas que vuelve locos a los sentidos. El maridaje perfecto entre lo intenso y lo adictivo. Una noche, dos adicciones.',
    perfumes: [
      { name: 'Asad Bourbon', volume: '100ML', fragranticaId: 101124 },
      { name: 'Yara Candy', volume: '100ML', fragranticaId: 95752 },
    ],
    originalTotalPrice: 85,
    discountPercentage: 10,
    comboPrice: 76,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-sombra-y-seda',
    slug: 'duo-sombra-y-seda',
    name: 'Dúo Sombra y Seda',
    category: 'Pareja',
    description:
      'La oscuridad más elegante y la suavidad más seductora en un solo dúo. Asad es pura presencia: amaderado, especiado y magnético como la noche misma, mientras Yara es seda pura: floral, dulce y delicada como un susurro que se queda en la memoria. Juntos crean el contraste más irresistible — lo profundo y lo etéreo, lo oscuro y lo luminoso.',
    perfumes: [
      { name: 'Asad', volume: '100ML', fragranticaId: 72821 },
      { name: 'Yara', volume: '100ML', fragranticaId: 76880 },
    ],
    originalTotalPrice: 76,
    discountPercentage: 10,
    comboPrice: 68,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-fascinacion-arabiga',
    slug: 'duo-fascinacion-arabiga',
    name: 'Dúo Fascinación Arábiga',
    category: 'Pareja',
    description:
      'Un encuentro místico entre lo masculino y lo femenino. Asad Zanzibar despliega su fuerza especiada y amaderada, mientras Yara Tous envuelve con su dulzura vainillada y tropical. Juntos, crean una experiencia olfativa que captura la magia de las noches árabes. El combo perfecto para compartir.',
    perfumes: [
      { name: 'Asad Zanzibar', volume: '100ML', fragranticaId: 90713 },
      { name: 'Yara Tous', volume: '100ML', fragranticaId: 83320 },
    ],
    originalTotalPrice: 76,
    discountPercentage: 10,
    comboPrice: 68,
    savings: 8,
    imageUrl: '',
  },
  {
    id: 'combo-duo-dulce-pecado',
    slug: 'duo-dulce-pecado',
    name: 'Dúo Dulce Pecado',
    category: 'Pareja',
    description:
      'Los más coquetos y elogiados en un solo combo. Asad Bourbon es esa fragancia amaderada y bourbon que detiene el tiempo en la pista, mientras Yara Moi envuelve con su mezcla irresistible de vainilla, caramelo y notas frutales. Juntos son el pecado más dulce que cometerás.',
    perfumes: [
      { name: 'Asad Bourbon', volume: '100ML', fragranticaId: 101124 },
      { name: 'Yara Moi', volume: '100ML', fragranticaId: 80722 },
    ],
    originalTotalPrice: 85,
    discountPercentage: 10,
    comboPrice: 76,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-rosa-y-sombra',
    slug: 'duo-rosa-y-sombra',
    name: 'Dúo Rosa y Sombra',
    category: 'Pareja',
    description:
      'La dualidad perfecta de la línea Fakhar en un solo pack. Fakhar Black es la fuerza oscura y amaderada del caballero que impone con elegancia, mientras Fakhar Rose despliega un ramo de rosas y frutos rojos que enamora a primera impresión. Dos caras de la misma nobleza árabe, dos fragancias que juntas cuentan una historia de contraste y armonía.',
    perfumes: [
      { name: 'Fakhar Black', volume: '100ML', fragranticaId: 70465 },
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
      'Oud y gourmand para una noche inolvidable. Oud For Glory aporta la majestuosidad del oud oriental con un sillage imponente de caballero, y Eclaire Pistache entrega una dulzura pistache y cremosa que desafía el género. Perfecto para clima templado y noches donde la elegancia árabe se funde con lo goloso.',
    perfumes: [
      { name: 'Oud For Glory', volume: '100ML', fragranticaId: 64948 },
      { name: 'Eclaire Pistache', volume: '100ML', fragranticaId: 113777 },
    ],
    originalTotalPrice: 99,
    discountPercentage: 10,
    comboPrice: 89,
    savings: 10,
    imageUrl: '',
  },
  {
    id: 'combo-duo-majestad-imperial',
    slug: 'duo-majestad-imperial',
    name: 'Dúo Majestad Imperial',
    category: 'Pareja',
    description:
      'Para los clientes más exigentes. Hawas Fire es el epítome del lujo con su fuego especiado e imponente, mientras Veneno Bianco es una obra maestra blanca y floral que proyecta poder y sofisticación femenina. Un combo de ticket alto que grita estatus y exclusividad en cada gota.',
    perfumes: [
      { name: 'Hawas Fire', volume: '100ML', fragranticaId: 101665 },
      { name: 'Veneno Bianco', volume: '100ML', fragranticaId: 105518 },
    ],
    originalTotalPrice: 139,
    discountPercentage: 10,
    comboPrice: 125,
    savings: 14,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🧭 TODO TERRENO — Tríos Versátiles (10 combos)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-trio-caballero-completo',
    slug: 'trio-caballero-completo',
    name: 'Trío El Caballero Completo',
    category: 'Todo Terreno',
    description:
      'Tres fragancias, un solo propósito: dominar cualquier ocasión. Glacier Pour Homme refresca con su elegancia fresca y acuática para el día, Qaed Al Fursan Untamed desata la fiereza en la fiesta, y Oud For Glory cierra con la majestuosidad del oud oriental para las ocasiones formales. De la oficina al restaurante, este trío lo tiene todo cubierto.',
    perfumes: [
      { name: 'Glacier Pour Homme', volume: '100ML', fragranticaId: 93648 },
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
      'La tendencia actual en un solo pack: fragancias que rompen géneros y conquistan cualquier ocasión. Odyssey Spectra abre fresco y versátil para el diario, Opulent Dubai trae la opulencia dorada para la noche, y Al Noble Safeer cierra con una nobleza amaderada y ambarada para lo formal. Tres perfumes, cero límites.',
    perfumes: [
      { name: 'Odyssey Spectra', volume: '100ML', fragranticaId: 98692 },
      { name: 'Opulent Dubai', volume: '100ML', fragranticaId: 105609 },
      { name: 'Al Noble Safeer', volume: '100ML', fragranticaId: 82795 },
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
      'Exclusivo, alto impacto, sin concesiones. Tharwah Silver marca presencia con su frescura plateada para el diario ejecutivo, Odyssey Go Mango trae la exuberancia tropical y frutal para las noches de poder, y Khamrah Dukhan cierra con un humo especiado y amaderado que impone autoridad en cada reunión. Manda el que huele así.',
    perfumes: [
      { name: 'Tharwah Silver', volume: '100ML', fragranticaId: 82005 },
      { name: 'Odyssey Go Mango', volume: '100ML', fragranticaId: 115130 },
      { name: 'Khamrah Dukhan', volume: '100ML', fragranticaId: 104529 },
    ],
    originalTotalPrice: 162,
    discountPercentage: 10,
    comboPrice: 146,
    savings: 16,
    imageUrl: '',
  },
  {
    id: 'combo-trio-reina-completa',
    slug: 'trio-reina-completa',
    name: 'Trío La Reina Completa',
    category: 'Todo Terreno',
    description:
      'Tres coronas para la mujer que lo domina todo. Mayar Natural Intense abre el día con su frescura floral y luminosa perfecta para la rutina diaria, Yara Moi conquista la noche con su caramelo tropical y vainilla que detiene miradas, y Eclaire Pistache cierra con una cremosidad pistache de alta gama para las ocasiones que exigen sofisticación absoluta. La reina no se prepara, siempre está lista.',
    perfumes: [
      { name: 'Mayar Natural Intense', volume: '100ML', fragranticaId: 89759 },
      { name: 'Yara Moi', volume: '100ML', fragranticaId: 80722 },
      { name: 'Eclaire Pistache', volume: '100ML', fragranticaId: 113777 },
    ],
    originalTotalPrice: 132,
    discountPercentage: 10,
    comboPrice: 118,
    savings: 14,
    imageUrl: '',
  },
  {
    id: 'combo-trio-odisea-caribe',
    slug: 'trio-odisea-caribe',
    name: 'Trío Odisea del Caribe',
    category: 'Todo Terreno',
    description:
      'Tres paradas tropicales en un solo viaje. Odyssey Bahamas transporta con su brisa acuática y frutal para las mañanas de sol, Odyssey Go Mango enciende la fiesta con su mango exuberante y jugoso para las tardes de calor, y Odyssey Marshmallow cierra con una dulzura esponjosa y adictiva para las noches de playa. Vacaciones permanentes en cada pulverización.',
    perfumes: [
      { name: 'Odyssey Bahamas', volume: '100ML', fragranticaId: 115127 },
      { name: 'Odyssey Go Mango', volume: '100ML', fragranticaId: 115130 },
      { name: 'Odyssey Marshmallow', volume: '100ML', fragranticaId: 115132 },
    ],
    originalTotalPrice: 175,
    discountPercentage: 10,
    comboPrice: 157,
    savings: 18,
    imageUrl: '',
  },
  {
    id: 'combo-trio-paris-corner-elegance',
    slug: 'trio-paris-corner-elegance',
    name: 'Trío Paris Corner Elegance',
    category: 'Todo Terreno',
    description:
      'Lo mejor de Paris Corner en un solo trío. Taskeen abre con una dulzura afrutada y moderna para el día a día, Khair Felicity sube la apuesta con su elegancia floral y ambarada para las noches de gala, y Emir Memories of Summer cierra con una sofisticación fresca y veraniega de alta gama para las ocasiones especiales. Tres joyas de la maison que brillan en cualquier momento.',
    perfumes: [
      { name: 'Taskeen', volume: '100ML', fragranticaId: 97355 },
      { name: 'Khair Felicity', volume: '100ML', fragranticaId: 102874 },
      { name: 'Emir Memories of Summer', volume: '100ML', fragranticaId: 111166 },
    ],
    originalTotalPrice: 156,
    discountPercentage: 10,
    comboPrice: 140,
    savings: 16,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // ☕ ÁRABE — Cita en Dubai (10 combos)
  // ═══════════════════════════════════════════════════════
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
    id: 'combo-duo-sultan-y-sultana',
    slug: 'duo-sultan-y-sultana',
    name: 'Dúo Sultán y Sultana',
    category: 'Árabe',
    description:
      'Realeza en cada gota. Honor & Glory despliega su oud noble y especiado con la dignidad de un sultán, mientras Bade\'e Al Oud Sublime complementa con una sublimidad amaderada y ambarada de botella roja y dorada que proyecta la gracia de una sultana. Dos fragancias de la línea Bade\'e Al Oud, pesadas y con sillage monumental, ideales para quienes quieren destacar y oler a verdadero poder.',
    perfumes: [
      { name: 'Honor & Glory', volume: '100ML', fragranticaId: 84302 },
      { name: "Bade'e Al Oud Sublime", volume: '100ML', fragranticaId: 83309 },
    ],
    originalTotalPrice: 88,
    discountPercentage: 10,
    comboPrice: 79,
    savings: 9,
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
  {
    id: 'combo-duo-amethyst-glory',
    slug: 'duo-amethyst-glory',
    name: 'Dúo Amethyst & Glory',
    category: 'Árabe',
    description:
      'Las dos gemas de la línea Bade\'e Al Oud que todo coleccionista quiere. Amethyst despliega una majestuosidad amaderada y ambarada con la profundidad del lapislázuli, y Oud for Glory responde con el oud más legendario y premium que ha conquistado el mundo árabe. Dos botellas icónicas, un solo imperio olfativo. Para quienes entienden que el oud es el oro líquido de la perfumería.',
    perfumes: [
      { name: "Bade'e Al Oud Amethyst", volume: '100ML', fragranticaId: 68214 },
      { name: "Bade'e Al Oud Oud for Glory", volume: '100ML', fragranticaId: 64948 },
    ],
    originalTotalPrice: 82,
    discountPercentage: 10,
    comboPrice: 73,
    savings: 9,
    imageUrl: '',
  },
  {
    id: 'combo-duo-fuego-y-oro',
    slug: 'duo-fuego-y-oro',
    name: 'Dúo Fuego y Oro',
    category: 'Árabe',
    description:
      'Las dos ediciones más codiciadas de Al Haramain en un solo cofre. Amber Oud Rouge arde con un ámbar rojo especiado y azafrán que evoca los atardeceres del desierto, mientras Amber Oud Gold irradia un ámbar dorado y luminoso que recuerda los palacios bañados en oro de Dubai. Dos colores, una misma nobleza. El combo más lujoso para los que quieren oler a riqueza pura.',
    perfumes: [
      { name: 'Amber Oud Rouge', volume: '100ML', fragranticaId: 66100 },
      { name: 'Amber Oud Gold', volume: '100ML', fragranticaId: 51816 },
    ],
    originalTotalPrice: 176,
    discountPercentage: 10,
    comboPrice: 158,
    savings: 18,
    imageUrl: '',
  },
  {
    id: 'combo-duo-cafe-de-medina',
    slug: 'duo-cafe-de-medina',
    name: 'Dúo Café de Medina',
    category: 'Árabe',
    description:
      'El humo y el café de las medinas árabes en un solo pack. Khamrah Dukhan envuelve con su humo especiado e incienso que evoca las callejuelas más místicas de Marrakech, y Khamrah Qawha responde con su café árabe infusionado con cacao y canela que transporta a las cafeterías ancestrales de Estambul. Dos fragancias que son un viaje a Oriente con cada pulverización.',
    perfumes: [
      { name: 'Khamrah Dukhan', volume: '100ML', fragranticaId: 104529 },
      { name: 'Khamrah Qawha', volume: '100ML', fragranticaId: 88175 },
    ],
    originalTotalPrice: 101,
    discountPercentage: 10,
    comboPrice: 90,
    savings: 11,
    imageUrl: '',
  },
  {
    id: 'combo-duo-emir-del-oud',
    slug: 'duo-emir-del-oud',
    name: 'Dúo Emir del Oud',
    category: 'Árabe',
    description:
      'Nobleza y nostalgia en cada gota. Emeer despliega la dignidad de un emir con su oud regio y ámbar profundo que impone respeto desde el primer instante, y Vintage Radio complementa con una calidez amaderada y retro que evoca los salones_privados de los palacios donde se fumaba pipa y se escuchaba jazz. Dos fragancias con carácter y sillage monumental para quienes quieren dejar huella.',
    perfumes: [
      { name: 'Emeer', volume: '100ML', fragranticaId: 89761 },
      { name: 'Vintage Radio', volume: '100ML', fragranticaId: 89454 },
    ],
    originalTotalPrice: 108,
    discountPercentage: 10,
    comboPrice: 97,
    savings: 11,
    imageUrl: '',
  },
  {
    id: 'combo-duo-especias-del-sultanato',
    slug: 'duo-especias-del-sultanato',
    name: 'Dúo Especias del Sultanato',
    category: 'Árabe',
    description:
      'Especias y fiereza del desierto profundo. Asad Elixir despliega una concentración elixir de especias amaderadas y oud que ruge como un león en la noche, y Qaed Al Fursan Untamed responde con una ferocidad incontrolable de cuero y sándalo que evoca a los guerreros más temidos del sultanato. Dos fragancias indomables con sillage que se siente a kilómetros. Para quienes no piden permiso.',
    perfumes: [
      { name: 'Asad Elixir', volume: '100ML', fragranticaId: 117616 },
      { name: 'Qaed Al Fursan Untamed', volume: '100ML', fragranticaId: 105383 },
    ],
    originalTotalPrice: 89,
    discountPercentage: 10,
    comboPrice: 80,
    savings: 9,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🍓 GOURMAND — Dulce Tentación (10 combos)
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
      'Cielo dulce en cada pulverización. Mallow Madness es una explosión de malvavisco cremoso y dulce que envuelve como un manto de algodón de azúcar, y Whipped Pleasure sube la apuesta con su mezcla de crema batida, dulce de leche y praliné. Dos fragancias que convierten cualquier día en un festival de azúcar.',
    perfumes: [
      { name: 'Mallow Madness', volume: '100ML', fragranticaId: 114396 },
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
  {
    id: 'combo-duo-pistache-lovers',
    slug: 'duo-pistache-lovers',
    name: 'Dúo Pistache Lovers',
    category: 'Gourmand',
    description:
      'Dos cremosidades pistache que derriten corazones. Eclaire Pistache abre con un pistache tostado y dulce envuelto en una crema aterciopelada que parece un postre de alta pastelería, y Eclaire Banoffi responde con un banoffi cálido de caramelo y plátano que hace agua la boca. Dos fragancias de la línea Eclaire que convierten cada salida en un banquete de postres infinitos.',
    perfumes: [
      { name: 'Eclaire Pistache', volume: '100ML', fragranticaId: 113777 },
      { name: 'Eclaire Banoffi', volume: '100ML', fragranticaId: 113778 },
    ],
    originalTotalPrice: 116,
    discountPercentage: 10,
    comboPrice: 104,
    savings: 12,
    imageUrl: '',
  },
  {
    id: 'combo-duo-marshmallow-dream',
    slug: 'duo-marshmallow-dream',
    name: 'Dúo Marshmallow Dream',
    category: 'Gourmand',
    description:
      'Un sueño de malvavisco en dos versiones irresistibles. Odyssey Marshmallow envuelve con su dulzura esponjosa de malvavisco tostado y vainilla que parece recién salido del fuego, y Marshmallow Blush de Paris Corner eleva la experiencia con un blush rosado de malvavisco y frutos rojos que tiñe de dulzura cada rincón. El dúo definitivo para los que sueñan con oler a nube.',
    perfumes: [
      { name: 'Odyssey Marshmallow', volume: '100ML', fragranticaId: 115132 },
      { name: 'Marshmallow Blush', volume: '100ML', fragranticaId: 102791 },
    ],
    originalTotalPrice: 133,
    discountPercentage: 10,
    comboPrice: 119,
    savings: 14,
    imageUrl: '',
  },
  {
    id: 'combo-duo-vainilla-infinita',
    slug: 'duo-vainilla-infinita',
    name: 'Dúo Vainilla Infinita',
    category: 'Gourmand',
    description:
      'Dos caras de la vainilla más adictiva. Vanilla Freak de Lattafa es una obsesión vainillada pura y sin complejos que envuelve como un manto cálido de vainilla de Madagascar, y December de Paris Corner responde con una vainilla invernal y ambarada que evoca las noches de diciembre frente a la chimenea. Dos vainillas que juntas crean un bucle infinito de dulzura adictiva.',
    perfumes: [
      { name: 'Vanilla Freak', volume: '100ML', fragranticaId: 114400 },
      { name: 'December', volume: '100ML', fragranticaId: 96254 },
    ],
    originalTotalPrice: 125,
    discountPercentage: 10,
    comboPrice: 112,
    savings: 13,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 💑 PAREJA — 2 combos nuevos (#9 y #10)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-fuego-y-rosa',
    slug: 'duo-fuego-y-rosa',
    name: 'Dúo Fuego y Rosa',
    category: 'Pareja',
    description:
      'Potencia masculina y elegancia floral en un solo pack. Club de Nuit Iconic despliega su frescura cítrica y amaderada con la confianza de un caballero que no pasa desapercibido, mientras Club de Nuit Maleka responde con un ramo floral dulce y envolvente que enamora a primera impresión. El dúo perfecto para la pareja que quiere complementarse sin perder su esencia.',
    perfumes: [
      { name: 'Club de Nuit Iconic', volume: '100ML', fragranticaId: 78475 },
      { name: 'Club de Nuit Maleka', volume: '100ML', fragranticaId: 106168 },
    ],
    originalTotalPrice: 129,
    discountPercentage: 10,
    comboPrice: 116,
    savings: 13,
    imageUrl: '',
  },
  {
    id: 'combo-duo-plata-y-rosa',
    slug: 'duo-plata-y-rosa',
    name: 'Dúo Plata y Rosa',
    category: 'Pareja',
    description:
      'Nobleza árabe en dos botellas icónicas. Fakhar Silver irradia una frescura plateada y cítrica con la elegancia de un caballero de alcurnia, mientras Fakhar Rose despliega su ramo de rosas y frutos rojos que captura la esencia de la feminidad más sofisticada. Dos joyas de la línea Fakhar que juntas brillan con luz propia.',
    perfumes: [
      { name: 'Fakhar Silver', volume: '100ML', fragranticaId: 107363 },
      { name: 'Fakhar Rose', volume: '100ML', fragranticaId: 70466 },
    ],
    originalTotalPrice: 82,
    discountPercentage: 10,
    comboPrice: 74,
    savings: 8,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🧭 TODO TERRENO — 2 combos nuevos (#9 y #10)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-trio-odisea-dulce',
    slug: 'trio-odisea-dulce',
    name: 'Trío Odisea Dulce',
    category: 'Todo Terreno',
    description:
      'Tres paradas dulces de la línea Odyssey que conquistan cualquier momento del día. Odyssey Candee abre con su dulzor afrutado y juguetón para las mañanas informales, Odyssey Dubai Chocolate sube la apuesta con su chocolate cremoso y praliné para las tardes de antojo, y Odyssey Black Forest cierra con un chocolate oscuro e imponente para las noches que exigen presencia gourmand. Un trío que es un menú de postres para el olfato.',
    perfumes: [
      { name: 'Odyssey Candee', volume: '100ML', fragranticaId: 96990 },
      { name: 'Odyssey Dubai Chocolate', volume: '100ML', fragranticaId: 102117 },
      { name: 'Odyssey Black Forest', volume: '100ML', fragranticaId: 115125 },
    ],
    originalTotalPrice: 156,
    discountPercentage: 10,
    comboPrice: 140,
    savings: 16,
    imageUrl: '',
  },
  {
    id: 'combo-trio-arabiyat-dessert',
    slug: 'trio-arabiyat-dessert',
    name: 'Trío Arabiyat Dessert',
    category: 'Todo Terreno',
    description:
      'Tres postres de Arabiyat Sugar que endulzan cualquier ocasión. Dulce de Leche abre con su caramelo suave y adictivo para el día a día, Berries Cream Macaron sube la intensidad con sus frutos rojos y crema para las salidas de tarde, y Vanilla Cream Macaron cierra con una vainilla cremosa y sofisticada para las noches especiales. Un trío que convierte cada momento en un festival de dulzura.',
    perfumes: [
      { name: 'Dulce de Leche', volume: '80ML', fragranticaId: 118595 },
      { name: 'Berries Cream Macaron', volume: '80ML', fragranticaId: 118602 },
      { name: 'Vanilla Cream Macaron', volume: '80ML', fragranticaId: 118601 },
    ],
    originalTotalPrice: 162,
    discountPercentage: 10,
    comboPrice: 146,
    savings: 16,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // ☕ ÁRABE — 2 combos nuevos (#9 y #10)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-oud-carbon-y-blanco',
    slug: 'duo-oud-carbon-y-blanco',
    name: 'Dúo Oud Carbon & Blanco',
    category: 'Árabe',
    description:
      'Dos caras del oud más exclusivo de Al Haramain en un solo cofre. Amber Oud Carbon despliega su oscuridad ahumada y amaderada con la profundidad del carbón que evoca las noches más misteriosas del desierto, mientras Amber Oud White responde con una luminosidad ambarada y floral que recuerda los amaneceres dorados de Dubai. Dos fragancias de la línea Amber Oud que juntas abarcan todo el espectro del oud noble.',
    perfumes: [
      { name: 'Amber Oud Carbon', volume: '100ML', fragranticaId: 73207 },
      { name: 'Amber Oud White', volume: '100ML', fragranticaId: 73210 },
    ],
    originalTotalPrice: 162,
    discountPercentage: 10,
    comboPrice: 146,
    savings: 16,
    imageUrl: '',
  },
  {
    id: 'combo-duo-hechizo-oriental',
    slug: 'duo-hechizo-oriental',
    name: 'Dúo Hechizo Oriental',
    category: 'Árabe',
    description:
      'Magia y misterio del Oriente árabe en dos fragancias encantadoras. Ajwaa despliega su dulzura amaderada con notas de dátiles y sándalo que evocan los oasis más sagrados del desierto, mientras Sehr responde con un hechizo ámbar y especiado que envuelve como las noches de luna llena sobre las dunas. Dos fragancias que hechizan a quien las huele, con un sillage que se queda en la memoria para siempre.',
    perfumes: [
      { name: 'Ajwaa', volume: '100ML', fragranticaId: 85368 },
      { name: 'Sehr', volume: '100ML', fragranticaId: 94967 },
    ],
    originalTotalPrice: 126,
    discountPercentage: 10,
    comboPrice: 113,
    savings: 13,
    imageUrl: '',
  },

  // ═══════════════════════════════════════════════════════
  // 🍓 GOURMAND — 2 combos nuevos (#9 y #10)
  // ═══════════════════════════════════════════════════════
  {
    id: 'combo-duo-coco-y-limon',
    slug: 'duo-coco-y-limon',
    name: 'Dúo Coco y Limón',
    category: 'Gourmand',
    description:
      'Frescura tropical y cítrica en clave gourmand. Coconut Chiffon de Arabiyat envuelve con su coco esponjoso y dulce que transporta a una playa caribeña, y Lemon Sorbet responde con un limón helado y refrescante que despierta los sentidos como un postre de verano. El dúo perfecto para quienes quieren oler dulce sin perder frescura, ideal para climas cálidos.',
    perfumes: [
      { name: 'Coconut Chiffon', volume: '80ML', fragranticaId: 118599 },
      { name: 'Lemon Sorbet', volume: '80ML', fragranticaId: 118596 },
    ],
    originalTotalPrice: 108,
    discountPercentage: 10,
    comboPrice: 97,
    savings: 11,
    imageUrl: '',
  },
  {
    id: 'combo-duo-tiramisu-locura',
    slug: 'duo-tiramisu-locura',
    name: 'Dúo Tiramisú Locura',
    category: 'Gourmand',
    description:
      'Dos versiones del postre italiano más adictivo en un solo pack. Tiramisu Caramel de Lattafa despliega su tiramisú bañado en caramelo con notas de café y vainilla que derriten voluntades, y Tiramisu Coco de Zimaya responde con una variante tropical que suma coco cremoso al clásico italiano creando una fusión irresistible. Dos tiramisús que compiten en adicción y ganan ambos.',
    perfumes: [
      { name: 'Tiramisu Caramel', volume: '100ML', fragranticaId: 98691 },
      { name: 'Tiramisu Coco', volume: '100ML', fragranticaId: 98690 },
    ],
    originalTotalPrice: 88,
    discountPercentage: 10,
    comboPrice: 79,
    savings: 9,
    imageUrl: '',
  },
];
