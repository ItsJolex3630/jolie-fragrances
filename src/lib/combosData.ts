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
    comboPrice: 68.4,
    savings: 7.6,
    imageUrl: '',
  },
  {
    id: 'combo-trio-caballero-completo',
    slug: 'trio-caballero-completo',
    name: 'Trío El Caballero Completo',
    category: 'Todo Terreno',
    description:
      'Tres fragancias, un solo propósito: dominar cualquier ocasión. Glacier Por Homme refresca con su elegancia fresca y acuática, Qaed Al Fursan Untamed desata la fiereza con notas salvajes, y Oud For Glory cierra con la majestuosidad del oud oriental. Del oficina a la fiesta, este trío lo tiene todo cubierto.',
    perfumes: [
      { name: 'Glacier Por Homme', volume: '100ML', fragranticaId: 93648 },
      { name: 'Qaed Al Fursan Untamed', volume: '90ML', fragranticaId: 105383 },
      { name: 'Oud For Glory', volume: '100ML', fragranticaId: 64948 },
    ],
    originalTotalPrice: 107,
    discountPercentage: 10,
    comboPrice: 96.3,
    savings: 10.7,
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
    comboPrice: 84.6,
    savings: 9.4,
    imageUrl: '',
  },
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
    comboPrice: 109.8,
    savings: 12.2,
    imageUrl: '',
  },
];
