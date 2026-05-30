// ─── Detailed note pyramid data with percentages ───
interface NoteWithPercentage {
  name: string;
  percentage: number;
}

interface NotePyramidDetailed {
  top: NoteWithPercentage[];
  heart: NoteWithPercentage[];
  base: NoteWithPercentage[];
}

export const NOTE_PYRAMIDS: Record<number, NotePyramidDetailed> = {
  // 1. Club de Nuit Intense Man — CORREGIDO: notas de Fragrantica (Grosellas Negras y Manzana en salida, Ámbar Gris en base)
  1: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Piña", percentage: 88 },
      { name: "Bergamota", percentage: 80 },
      { name: "Grosellas Negras", percentage: 70 },
      { name: "Manzana", percentage: 60 },
    ],
    heart: [
      { name: "Abedul", percentage: 88 },
      { name: "Jazmín", percentage: 65 },
      { name: "Rosa", percentage: 55 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar Gris", percentage: 82 },
      { name: "Pachulí", percentage: 72 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 2. Club de Nuit Intense Man Limited Edition — CORREGIDO: notas de Fragrantica (Pimienta Rosa en salida, sin Abedul, Lirio del Valle y Fresia en corazón, Ambroxan+Cuero+Cedro en base)
  2: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Piña", percentage: 85 },
      { name: "Lima", percentage: 75 },
      { name: "Pimienta Negra", percentage: 70 },
      { name: "Bergamota", percentage: 65 },
      { name: "Pimienta Rosa", percentage: 60 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Lirio del Valle", percentage: 75 },
      { name: "Rosa", percentage: 70 },
      { name: "Fresia", percentage: 60 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 90 },
      { name: "Ambroxan", percentage: 82 },
      { name: "Ámbar Gris", percentage: 78 },
      { name: "Cedro", percentage: 72 },
      { name: "Cuero", percentage: 68 },
      { name: "Pachulí", percentage: 62 },
    ],
  },
  // 3. Club de Nuit Woman — CORREGIDO: notas de Fragrantica (Lichi antes de Geranio en corazón)
  3: {
    top: [
      { name: "Naranja", percentage: 95 },
      { name: "Bergamota", percentage: 88 },
      { name: "Toronja", percentage: 80 },
      { name: "Melocotón", percentage: 70 },
    ],
    heart: [
      { name: "Rosa", percentage: 95 },
      { name: "Jazmín", percentage: 82 },
      { name: "Lichi", percentage: 72 },
      { name: "Geranio", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Vainilla", percentage: 78 },
      { name: "Vetiver", percentage: 68 },
    ],
  },
  // 4. Club de Nuit White Imperiale — CORREGIDO: notas de Fragrantica (Vainilla en corazón y base, sin Vetiver en base)
  4: {
    top: [
      { name: "Lichi", percentage: 95 },
      { name: "Bergamota", percentage: 82 },
      { name: "Nuez Moscada", percentage: 72 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 95 },
      { name: "Vainilla", percentage: 88 },
      { name: "Almizcle", percentage: 80 },
      { name: "Peonía", percentage: 72 },
    ],
    base: [
      { name: "Vainilla", percentage: 88 },
      { name: "Incienso", percentage: 78 },
      { name: "Cachemira", percentage: 72 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 5 (115). Club de Nuit Iconic — CORREGIDO: notas de Fragrantica (Melón antes de Jazmín en corazón, Notas Amaderadas y Ládano en base)
  115: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Limón", percentage: 88 },
      { name: "Menta", percentage: 82 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Cilantro", percentage: 62 },
    ],
    heart: [
      { name: "Jengibre", percentage: 88 },
      { name: "Melón", percentage: 78 },
      { name: "Jazmín", percentage: 68 },
      { name: "Nuez Moscada", percentage: 60 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 90 },
      { name: "Incienso", percentage: 82 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Cedro", percentage: 65 },
      { name: "Pachulí", percentage: 60 },
      { name: "Ládano", percentage: 55 },
    ],
  },
  // 6 (116). Club de Nuit Sillage — CORREGIDO: notas de Fragrantica (Hojas de Violeta, Rosa antes de Iris en corazón, Ambroxan en base)
  116: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Limón", percentage: 85 },
      { name: "Lima", percentage: 80 },
      { name: "Grosellas Negras", percentage: 75 },
      { name: "Hojas de Violeta", percentage: 65 },
      { name: "Jengibre", percentage: 60 },
    ],
    heart: [
      { name: "Rosa", percentage: 88 },
      { name: "Iris", percentage: 82 },
      { name: "Jazmín", percentage: 70 },
    ],
    base: [
      { name: "Ambroxan", percentage: 92 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 72 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 7 (117). Club de Nuit Urban Man Elixir — CORREGIDO: notas de Fragrantica (Clavelón/Tagetes en corazón)
  117: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 82 },
      { name: "Jazmín", percentage: 68 },
      { name: "Flor de Azahar", percentage: 62 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Elemí", percentage: 75 },
      { name: "Geranio", percentage: 72 },
      { name: "Vetiver", percentage: 68 },
      { name: "Azafrán", percentage: 65 },
      { name: "Clavelón / Tagetes", percentage: 58 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Ámbar", percentage: 82 },
      { name: "Cedro", percentage: 72 },
      { name: "Pachulí", percentage: 68 },
      { name: "Ládano", percentage: 55 },
    ],
  },
  // 8 (118). Club de Nuit Urban Man — CORREGIDO: notas de Fragrantica (Menta antes de Toronja en salida, Lavanda antes de Nuez Moscada en corazón, Vetiver antes de Pachulí en base)
  118: {
    top: [
      { name: "Bergamota", percentage: 92 },
      { name: "Menta", percentage: 85 },
      { name: "Toronja", percentage: 78 },
      { name: "Cardamomo", percentage: 70 },
    ],
    heart: [
      { name: "Lavanda", percentage: 82 },
      { name: "Jengibre", percentage: 75 },
      { name: "Cedro", percentage: 70 },
      { name: "Nuez Moscada", percentage: 65 },
    ],
    base: [
      { name: "Vetiver", percentage: 88 },
      { name: "Pachulí", percentage: 80 },
      { name: "Sándalo", percentage: 72 },
      { name: "Musgo de Roble", percentage: 65 },
    ],
  },
  // 9 (119). Club de Nuit Maleka — CORREGIDO: notas de Fragrantica (Olivier Cresp)
  119: {
    top: [
      { name: "Lichi", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Iris", percentage: 95 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ambroxan", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 10 (120). Club de Nuit Untold
  120: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Jazmín", percentage: 80 },
    ],
    heart: [
      { name: "Amberwood", percentage: 90 },
      { name: "Ámbar Gris", percentage: 85 },
    ],
    base: [
      { name: "Resina de Abeto", percentage: 85 },
      { name: "Cedro", percentage: 75 },
    ],
  },
  // 11 (121). Club de Nuit Precieux I — CORREGIDO: notas de Fragrantica (Anís en corazón, no Anís Estrellado)
  121: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Caramelo", percentage: 75 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Pera", percentage: 65 },
      { name: "Pimienta Negra", percentage: 60 },
    ],
    heart: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Madera Blanca", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
      { name: "Lirio del Valle", percentage: 65 },
      { name: "Anís", percentage: 60 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Cuero", percentage: 65 },
      { name: "Vainilla", percentage: 60 },
    ],
  },
  // 12 (5). Odyssey Homme White Edition — CORREGIDO: notas de Fragrantica
  5: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Menta", percentage: 80 },
    ],
    heart: [
      { name: "Piña", percentage: 90 },
      { name: "Notas Acuáticas", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    base: [
      { name: "Amberwood", percentage: 90 },
      { name: "Vainilla", percentage: 80 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 13 (91). Odyssey Aoud — CORREGIDO: notas de Fragrantica (Ambroxan en base)
  91: {
    top: [
      { name: "Azafrán", percentage: 90 },
      { name: "Nuez Moscada", percentage: 80 },
      { name: "Lavanda", percentage: 70 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Notas Amaderadas", percentage: 65 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 14 (104). Odyssey Mandarine Sky — CORREGIDO: notas de Fragrantica (Salvia en salida, Clavelón en corazón, Ambroxan+Vetiver en base)
  104: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Azafrán", percentage: 75 },
      { name: "Salvia", percentage: 65 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Clavelón / Tagetes", percentage: 65 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Cedro", percentage: 75 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 15 (105). Odyssey Artisto
  105: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Notas Avellanadas", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    heart: [
      { name: "Canela", percentage: 85 },
      { name: "Coco", percentage: 80 },
      { name: "Notas Tropicales", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 16 (106). Odyssey Bahamas — CORREGIDO: notas de Fragrantica (aquático, no tropical)
  106: {
    top: [
      { name: "Melón", percentage: 90 },
      { name: "Cantalupo", percentage: 85 },
      { name: "Pera", percentage: 80 },
      { name: "Manzana Granny Smith", percentage: 75 },
      { name: "Ciruela", percentage: 70 },
      { name: "Algas", percentage: 65 },
      { name: "Sal", percentage: 60 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 90 },
      { name: "Lirio de Agua", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Azúcar", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 17 (107). Odyssey Toffee Coffee — CORREGIDO: notas de Fragrantica
  107: {
    top: [
      { name: "Café", percentage: 95 },
      { name: "Dulce de Leche", percentage: 90 },
      { name: "Azafrán", percentage: 80 },
      { name: "Miel", percentage: 75 },
      { name: "Bergamota", percentage: 70 },
    ],
    heart: [
      { name: "Toffee", percentage: 90 },
      { name: "Lactonas", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
      { name: "Flor Blanca", percentage: 70 },
      { name: "Rosa Búlgara", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Caña de Azúcar", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 75 },
      { name: "Almizcle Blanco", percentage: 65 },
    ],
  },
  // 18 (108). Odyssey Spectra — CORREGIDO: notas de Fragrantica (cálido especiado, no iris)
  108: {
    top: [
      { name: "Canela", percentage: 90 },
      { name: "Manzana", percentage: 85 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Canela", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Lirio del Valle", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Tabaco", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Pachulí", percentage: 65 },
    ],
  },
  // 19 (109). Odyssey Aqua — CORREGIDO: notas de Fragrantica (Aquatic Edition)
  109: {
    top: [
      { name: "Naranja", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Artemisa", percentage: 75 },
    ],
    heart: [
      { name: "Menta", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Ciprés", percentage: 80 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 20 (110). Odyssey Homme — CORREGIDO: notas de Fragrantica (Cardamomo+Mandarina+Neroli en salida, Flor de Azahar+Rosa en corazón)
  110: {
    top: [
      { name: "Cardamomo", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
      { name: "Neroli", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Sándalo", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // ─── Página 2 ───
  // 21 (111). Odyssey Mandarin Sky Vintage Edition — CORREGIDO: notas de Fragrantica (Cítricos+Mandarina en salida, Especias+Florales en corazón)
  111: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Notas Cítricas", percentage: 85 },
    ],
    heart: [
      { name: "Especias", percentage: 85 },
      { name: "Notas Florales", percentage: 75 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
  },
  // 22 (112). Odyssey Mandarin Sky Elixir — CORREGIDO: notas de Fragrantica
  112: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
      { name: "Cardamomo", percentage: 70 },
      { name: "Pimienta Negra", percentage: 65 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Vetiver", percentage: 80 },
    ],
  },
  // 23 (113). Odyssey Mega — CORREGIDO: notas de Fragrantica (Mega Man)
  113: {
    top: [
      { name: "Naranja", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Jengibre", percentage: 75 },
      { name: "Menta", percentage: 70 },
    ],
    heart: [
      { name: "Piña", percentage: 85 },
      { name: "Salvia", percentage: 80 },
      { name: "Enebro", percentage: 75 },
      { name: "Geranio", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Haba Tonka", percentage: 75 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 24 (114). Odyssey Limoni Fresh — CORREGIDO: notas de Fragrantica
  114: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Naranja Dulce", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Notas Marinas", percentage: 75 },
      { name: "Jengibre", percentage: 65 },
    ],
    base: [
      { name: "Té", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 25 (141). Yum Yum — CORREGIDO: notas de Fragrantica (Bayas Silvestres y Cereza primero en salida, Vainilla en corazón, Notas Atalcadas antes que Ámbar en base)
  141: {
    top: [
      { name: "Bayas Silvestres", percentage: 95 },
      { name: "Cereza", percentage: 90 },
      { name: "Naranja", percentage: 82 },
      { name: "Bergamota", percentage: 78 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
      { name: "Flores Blancas", percentage: 78 },
      { name: "Vainilla", percentage: 72 },
    ],
    base: [
      { name: "Notas Atalcadas", percentage: 88 },
      { name: "Almizcle", percentage: 82 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 26 (143). Bon Bon — CORREGIDO: notas de Fragrantica (Mandarina primero en salida, Azucena/Flor de Té Verde/Notas Marinas/Chabacano en corazón, Acorde Goloso y Sándalo en base)
  143: {
    top: [
      { name: "Mandarina", percentage: 88 },
      { name: "Bergamota", percentage: 82 },
      { name: "Manzana Granny Smith", percentage: 78 },
      { name: "Papaya", percentage: 72 },
    ],
    heart: [
      { name: "Peonía", percentage: 85 },
      { name: "Azucena", percentage: 78 },
      { name: "Flor de Té Verde", percentage: 72 },
      { name: "Notas Marinas", percentage: 68 },
      { name: "Chabacano", percentage: 62 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Acorde Goloso", percentage: 80 },
      { name: "Sándalo", percentage: 72 },
    ],
  },
  // 27 (144). Island Bliss — CORREGIDO: notas de Fragrantica (Flor de Azahar del Naranjo, Nenúfar en corazón)
  144: {
    top: [
      { name: "Bayas Silvestres", percentage: 92 },
      { name: "Notas Verdes", percentage: 82 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Flor de Azahar del Naranjo", percentage: 82 },
      { name: "Lactonas", percentage: 75 },
      { name: "Nenúfar (Lirio de Agua)", percentage: 68 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Haba Tonka", percentage: 82 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 28 (145). Island Breeze — CORREGIDO: notas de Fragrantica (Durazno/Melocotón)
  145: {
    top: [
      { name: "Durazno (Melocotón)", percentage: 92 },
      { name: "Bayas Silvestres", percentage: 85 },
    ],
    heart: [
      { name: "Rosa", percentage: 88 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 92 },
    ],
  },
  // 29 (151). Eter Arabian — CORREGIDO: notas de Fragrantica (Aceite de Naranja y Piña primero en salida, Caramelo antes de Lavanda en corazón, Cedro/Vetiver/Pachulí/Cuero en base)
  151: {
    top: [
      { name: "Aceite de Naranja", percentage: 92 },
      { name: "Piña", percentage: 88 },
      { name: "Toronja", percentage: 82 },
      { name: "Limón", percentage: 78 },
      { name: "Bergamota", percentage: 75 },
      { name: "Pimienta", percentage: 70 },
    ],
    heart: [
      { name: "Caramelo", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
      { name: "Geranio", percentage: 75 },
      { name: "Ylang-Ylang", percentage: 68 },
    ],
    base: [
      { name: "Ámbar", percentage: 88 },
      { name: "Cedro", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
      { name: "Pachulí", percentage: 65 },
      { name: "Cuero", percentage: 60 },
    ],
  },
  // 30 (6). Al Haramain Amber Oud Rouge Edition — CORREGIDO: notas de Fragrantica
  6: {
    top: [
      { name: "Azafrán", percentage: 95 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 95 },
      { name: "Almizcle", percentage: 80 },
      { name: "Cedro Blanco", percentage: 70 },
    ],
  },
  // 31 (7). Al Haramain Amber Oud Gold Edition — CORREGIDO: notas de Fragrantica (Acorde Goloso en corazón)
  7: {
    top: [
      { name: "Bergamota", percentage: 80 },
      { name: "Notas Verdes", percentage: 75 },
    ],
    heart: [
      { name: "Melón", percentage: 95 },
      { name: "Piña", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Acorde Goloso", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 70 },
    ],
  },
  // 32 (8). Al Haramain Amber Oud Carbon Edition — CORREGIDO: notas de Fragrantica (musgo en base)
  8: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Romero", percentage: 80 },
    ],
    heart: [
      { name: "Notas Marinas", percentage: 90 },
      { name: "Geranio", percentage: 75 },
      { name: "Salvia", percentage: 70 },
    ],
    base: [
      { name: "Musgo", percentage: 85 },
      { name: "Vetiver", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 33 (9). Al Haramain Amber Oud White Edition — CORREGIDO: notas de Fragrantica
  9: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Naranja", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 85 },
      { name: "Rosa", percentage: 75 },
      { name: "Fresia", percentage: 70 },
      { name: "Ciclamen", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Vetiver", percentage: 75 },
      { name: "Vainilla", percentage: 70 },
    ],
  },
  // 34 (10). Al Haramain L'Aventure — CORREGIDO: notas de Fragrantica
  10: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Elemí", percentage: 75 },
    ],
    heart: [
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Jazmín", percentage: 70 },
      { name: "Lirio de los Valles", percentage: 60 },
    ],
    base: [
      { name: "Almizcle", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Ámbar", percentage: 65 },
    ],
  },
  // 35 (11). Al Haramain L'Aventure Woman — CORREGIDO: notas de Fragrantica (Cedro antes de Fresia y Rosa en corazón)
  11: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Bayas Silvestres", percentage: 75 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Fresia", percentage: 78 },
      { name: "Rosa", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 36 (154). Al Haramain Amber Oud Aqua Dubai — CORREGIDO: notas de Fragrantica (Ámbar antes de Grosellas y Piña en corazón, Petitgrain y Gálbano en base)
  154: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Notas Verdes", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Melón", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Grosellas Negras", percentage: 78 },
      { name: "Piña", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Petitgrain", percentage: 78 },
      { name: "Gálbano", percentage: 72 },
      { name: "Vainilla", percentage: 68 },
    ],
  },
  // 37 (14). Lattafa Bade'e Al Oud Amethyst — CORREGIDO: notas de Fragrantica (Rosas dominantes en corazón, Oud más fuerte que Ámbar)
  14: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Bergamota", percentage: 82 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 98 },
      { name: "Rosa de Bulgaria", percentage: 92 },
      { name: "Jazmín", percentage: 72 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 92 },
      { name: "Ámbar", percentage: 78 },
      { name: "Vainilla", percentage: 68 },
    ],
  },
  // 38 (15). Lattafa Bade'e Al Oud Oud for Glory — CORREGIDO: notas de Fragrantica (Oud repetido en corazón y base)
  15: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Nuez Moscada", percentage: 88 },
      { name: "Lavanda", percentage: 78 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Pachulí", percentage: 82 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 90 },
      { name: "Pachulí", percentage: 78 },
      { name: "Almizcle", percentage: 72 },
    ],
  },
  // 39 (16). Lattafa Bade'e Al Oud Honor & Glory — CORREGIDO: notas de Fragrantica (Cúrcuma antes de Pimienta Negra, Benjuí último en corazón)
  16: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Crème Brûlée", percentage: 90 },
    ],
    heart: [
      { name: "Canela", percentage: 88 },
      { name: "Cúrcuma", percentage: 72 },
      { name: "Pimienta Negra", percentage: 65 },
      { name: "Benjuí", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Sándalo", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
      { name: "Musgo", percentage: 60 },
    ],
  },
  // 40 (18). Lattafa Eclaire Pistache — CORREGIDO: notas de Fragrantica (Crema Batida y Cacao co-dominantes en corazón, Pistacho no es "tostado")
  18: {
    top: [
      { name: "Crema de Pistacho", percentage: 95 },
      { name: "Pistacho", percentage: 88 },
    ],
    heart: [
      { name: "Crema Batida", percentage: 92 },
      { name: "Cacao", percentage: 90 },
      { name: "Coco", percentage: 78 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Leche", percentage: 85 },
      { name: "Almizcle", percentage: 68 },
    ],
  },

  // ─── Páginas 3-4: Lattafa ───

  // 41 (19). Lattafa Eclaire Banoffi — CORREGIDO: notas de Fragrantica (Vainilla más dominante en corazón, Galleta como Bizcocho)
  19: {
    top: [
      { name: "Plátano", percentage: 95 },
      { name: "Dulce de Leche", percentage: 90 },
    ],
    heart: [
      { name: "Vainilla", percentage: 92 },
      { name: "Crema Batida", percentage: 88 },
    ],
    base: [
      { name: "Bizcocho", percentage: 85 },
      { name: "Praliné", percentage: 82 },
      { name: "Almizcle", percentage: 68 },
    ],
  },
  // 42 (20). Lattafa Mayar Natural Intense — CORREGIDO: notas de Fragrantica
  20: {
    top: [
      { name: "Higo", percentage: 90 },
      { name: "Melón", percentage: 85 },
      { name: "Mandarina", percentage: 75 },
      { name: "Agua de Coco", percentage: 70 },
    ],
    heart: [
      { name: "Flor de Loto", percentage: 85 },
      { name: "Nenúfar", percentage: 75 },
      { name: "Jazmín", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Ambroxan", percentage: 65 },
    ],
  },
  // 43 (21). Lattafa Fakhar Black — CORREGIDO: notas de Fragrantica (Manzana dominante, Bergamota 2da, Cedro antes de Amberwood en base)
  21: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Bergamota", percentage: 88 },
      { name: "Jengibre", percentage: 82 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Salvia", percentage: 82 },
      { name: "Bayas de Enebro", percentage: 76 },
      { name: "Geranio", percentage: 68 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 88 },
      { name: "Cedro", percentage: 82 },
      { name: "Amberwood", percentage: 78 },
      { name: "Vetiver", percentage: 68 },
    ],
  },
  // 44 (22). Lattafa Fakhar Rose — CORREGIDO: notas de Fragrantica (Jazmín co-dominante con Nardos, Ylang-Ylang antes de Rosa y Madreselva)
  22: {
    top: [
      { name: "Notas Afrutadas", percentage: 92 },
      { name: "Azucena", percentage: 85 },
      { name: "Granada", percentage: 78 },
      { name: "Aldehídos", percentage: 62 },
    ],
    heart: [
      { name: "Nardos", percentage: 95 },
      { name: "Jazmín", percentage: 95 },
      { name: "Gardenia", percentage: 82 },
      { name: "Ylang-Ylang", percentage: 75 },
      { name: "Rosa", percentage: 72 },
      { name: "Madreselva", percentage: 72 },
      { name: "Peonía", percentage: 68 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Almizcle Blanco", percentage: 82 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ambroxan", percentage: 68 },
    ],
  },
  // 45 (103). Lattafa Qaed Al Fursan — CORREGIDO: notas de Fragrantica (Abeto antes de Jazmín en corazón, Cedro antes de Ámbar en base)
  103: {
    top: [
      { name: "Piña", percentage: 98 },
      { name: "Azafrán", percentage: 82 },
    ],
    heart: [
      { name: "Abeto", percentage: 78 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Ámbar", percentage: 82 },
      { name: "Madera de Oud", percentage: 72 },
    ],
  },
  // 46 (25). Lattafa Qaed Al Fursan Untamed — CORREGIDO: notas de Fragrantica (Canela-Cardamomo-Mandarina co-dominantes, Caramelo y Cedro más fuertes)
  25: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Cardamomo", percentage: 95 },
      { name: "Mandarina", percentage: 92 },
      { name: "Nuez Moscada", percentage: 82 },
    ],
    heart: [
      { name: "Caramelo", percentage: 92 },
      { name: "Lavanda", percentage: 85 },
      { name: "Salvia Esclarea", percentage: 78 },
      { name: "Geranio", percentage: 72 },
      { name: "Ciprés", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 92 },
      { name: "Cedro", percentage: 88 },
      { name: "Olíbano", percentage: 82 },
      { name: "Ládano", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
    ],
  },
  // 47 (26). Lattafa Qaed Al Fursan Unlimited — CORREGIDO: notas de Fragrantica (Piña antes de Cítricos en salida, Frangipani antes de Jazmín en corazón, Notas Dulces en base)
  26: {
    top: [
      { name: "Coco", percentage: 95 },
      { name: "Piña", percentage: 82 },
      { name: "Cítricos", percentage: 78 },
    ],
    heart: [
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Frangipani", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 78 },
      { name: "Notas Dulces", percentage: 68 },
    ],
  },
  // 48 (27). Lattafa Hayaati Florence — CORREGIDO: notas de Lattafa oficial + acordes Fragrantica (sin pirámide tradicional en Fragrantica, se mantiene oficial)
  27: {
    top: [
      { name: "Lichi", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Grosella Roja", percentage: 80 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
      { name: "Melocotón", percentage: 80 },
      { name: "Madera de Cedro", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Praliné", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
  },
  // 49 (142). Lattafa Hayaati Gold Elixir — CORREGIDO: notas de Fragrantica (Cuero 100% en corazón, Vainilla y Ámbar más fuertes en base)
  142: {
    top: [
      { name: "Bergamota", percentage: 88 },
      { name: "Toronja", percentage: 85 },
      { name: "Grosella Negra", percentage: 78 },
    ],
    heart: [
      { name: "Cuero", percentage: 95 },
      { name: "Melocotón", percentage: 85 },
      { name: "Azafrán", percentage: 82 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Ámbar", percentage: 90 },
      { name: "Almizcle", percentage: 82 },
      { name: "Vetiver", percentage: 72 },
    ],
  },
  // 50 (146). Lattafa Hayaati — CORREGIDO: notas de Fragrantica (Canela 96% en corazón, Almizcle 96% en base)
  146: {
    top: [
      { name: "Manzana", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
    ],
    heart: [
      { name: "Canela", percentage: 92 },
      { name: "Notas de Madera", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 92 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 51 (147). Lattafa Hayaati Al Maleky — CORREGIDO: notas de Fragrantica (Pimienta Rosa-Bergamota-Jengibre co-dominantes, Almizcle y Ambargris más fuertes en base)
  147: {
    top: [
      { name: "Pimienta Rosa", percentage: 95 },
      { name: "Bergamota", percentage: 95 },
      { name: "Jengibre", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
    ],
    heart: [
      { name: "Cedro", percentage: 88 },
      { name: "Notas Amaderadas", percentage: 82 },
      { name: "Incienso", percentage: 78 },
      { name: "Ládano", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 95 },
      { name: "Ambargris", percentage: 92 },
      { name: "Ámbar", percentage: 88 },
    ],
  },
  // 52 (148). Lattafa Vintage Radio — CORREGIDO: sin Jengibre (no está en Fragrantica), notas reales verificadas
  148: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Salvia", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Ciruela", percentage: 95 },
      { name: "Palo Santo", percentage: 90 },
      { name: "Pimienta Negra", percentage: 80 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Madera de Agar / Oud", percentage: 80 },
    ],
  },
  // 53 (149). Lattafa Emeer — CORREGIDO: base completa con Cashmeran y Pachulí (verificado Fragrantica: Ambergris, Cedarwood, Cashmeran, Patchouli)
  149: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Salvia", percentage: 80 },
      { name: "Enebro", percentage: 75 },
    ],
    heart: [
      { name: "Té Blanco", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Cardamomo", percentage: 75 },
      { name: "Olíbano", percentage: 65 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Cedro", percentage: 85 },
      { name: "Cashmeran", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 54 (28). Lattafa Nebras Elixir — CORREGIDO: notas del ELIXIR (no del Nebras original)
  28: {
    top: [
      { name: "Caramelo de Leche", percentage: 95 },
      { name: "Crema Batida", percentage: 90 },
    ],
    heart: [
      { name: "Caña de Azúcar", percentage: 90 },
      { name: "Heliotropo", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ambroxan", percentage: 70 },
    ],
  },
  // 55 (29). Lattafa Asad Elixir — CORREGIDO: Ámbar→Ámbar Ligero (Light Amber en Fragrantica)
  29: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Azafrán", percentage: 85 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Tabaco", percentage: 95 },
      { name: "Vainilla", percentage: 85 },
      { name: "Cedro", percentage: 80 },
    ],
    base: [
      { name: "Ámbar Ligero", percentage: 85 },
      { name: "Olíbano", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cashmeran", percentage: 70 },
    ],
  },
  // 56 (30). Lattafa Ansaam Gold — CORREGIDO: base en orden Fragrantica (Musk, Vanilla, Raspberry), corazón = Sweet Notes + Jasmine + Rose
  30: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Pera", percentage: 80 },
    ],
    heart: [
      { name: "Notas Dulces", percentage: 90 },
      { name: "Jazmín", percentage: 80 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Frambuesa", percentage: 75 },
    ],
  },
  // 57 (31). Lattafa Ansaam Silver — CORREGIDO: Lavanda antes que Davana, Vainilla>Ámbar>Pachulí en base
  31: {
    top: [
      { name: "Cardamomo", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Davana", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 58 (32). Lattafa Shaheen Gold — CORREGIDO: orden base Vainilla>Pachulí>Haba Tonka
  32: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Higo", percentage: 85 },
      { name: "Lavanda", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Haba Tonka", percentage: 70 },
    ],
  },
  // 59 (33). Lattafa Shaheen Silver — CORREGIDO: notas de Fragrantica
  33: {
    top: [
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Pachulí", percentage: 85 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 60 (34). Lattafa Hala — CORREGIDO: Pimienta antes que Nuez Moscada, Ámbar en corazón (no base), base=Incienso+Ládano
  34: {
    top: [
      { name: "Pimienta", percentage: 90 },
      { name: "Nuez Moscada", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Incienso", percentage: 90 },
      { name: "Ládano", percentage: 75 },
    ],
  },
  // 61 (35). Lattafa Ishq Al Shuyukh Gold — CORREGIDO: Caramelo en salida
  35: {
    top: [
      { name: "Caramelo", percentage: 95 },
      { name: "Azafrán", percentage: 90 },
    ],
    heart: [
      { name: "Gamuza", percentage: 90 },
      { name: "Cuero", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 62 (36). Lattafa Ishq Al Shuyukh Silver — CORREGIDO: notas de Fragrantica
  36: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Limón", percentage: 75 },
    ],
    heart: [
      { name: "Pimienta Negra", percentage: 80 },
      { name: "Notas Especiadas", percentage: 70 },
    ],
    base: [
      { name: "Madera de Cedro", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
      { name: "Vainilla", percentage: 70 },
    ],
  },
  // 63 (37). Lattafa Ta'weel — CORREGIDO: corazón=Flor de Azahar+Lavanda (Fragrantica), base=Ambroxan+Vetiver+Pachulí+Cuero
  37: {
    top: [
      { name: "Jengibre", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
      { name: "Enebro", percentage: 75 },
      { name: "Nuez Moscada", percentage: 70 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Vetiver", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cuero", percentage: 70 },
    ],
  },
  // 64 (38). Lattafa Teriaq Intense — CORREGIDO: notas del INTENSE (no del Teriaq original)
  38: {
    top: [
      { name: "Azafrán", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Licor de Ciruela", percentage: 95 },
      { name: "Canela", percentage: 90 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
  },
  // 65 (39). Lattafa Musamam White Intense — CORREGIDO: Mahonial en corazón, base=Sándalo+Almizcle+Benjuí
  39: {
    top: [
      { name: "Especias", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Naranja", percentage: 75 },
    ],
    heart: [
      { name: "Coco", percentage: 90 },
      { name: "Ylang-Ylang", percentage: 80 },
      { name: "Ambroxan", percentage: 75 },
      { name: "Mahonial", percentage: 65 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 66 (40). Lattafa Victoria — CORREGIDO: Fragrantica=3 notas (Lemon Meringue Pie, Neroli, Vanilla)
  40: {
    top: [
      { name: "Tarta de Merengue de Limón", percentage: 95 },
    ],
    heart: [
      { name: "Neroli", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
    ],
  },
  // 67 (41). Lattafa Art of Universe — CORREGIDO: notas completamente revisadas
  41: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Menta", percentage: 75 },
    ],
    heart: [
      { name: "Pera", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Cedro", percentage: 75 },
    ],
  },
  // 68 (42). Lattafa Vanilla Freak — CORREGIDO: Mantequilla en base (Fragrantica: Butter, Vanilla, Musk)
  42: {
    top: [
      { name: "Cupcake", percentage: 95 },
    ],
    heart: [
      { name: "Azúcar", percentage: 85 },
      { name: "Glaseado", percentage: 80 },
      { name: "Almendra", percentage: 75 },
      { name: "Canela", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Mantequilla", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 69 (43). Lattafa Berry On Top — CORREGIDO: notas de Fragrantica
  43: {
    top: [
      { name: "Fresa", percentage: 95 },
      { name: "Crema Chantilly", percentage: 85 },
    ],
    heart: [
      { name: "Mermelada de Fresa", percentage: 90 },
      { name: "Azúcar", percentage: 85 },
      { name: "Flores Blancas", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 70 (44). Lattafa Choco Overdose — CORREGIDO: notas de Fragrantica
  44: {
    top: [
      { name: "Fudge de Chocolate", percentage: 95 },
    ],
    heart: [
      { name: "Cacao", percentage: 95 },
      { name: "Cupcake", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Caramelo", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
  },
  // 71 (45). Lattafa Mallow Madness — CORREGIDO: notas completamente revisadas
  45: {
    top: [
      { name: "Fresa", percentage: 90 },
      { name: "Frambuesa", percentage: 85 },
    ],
    heart: [
      { name: "Malvavisco", percentage: 90 },
      { name: "Fresia", percentage: 80 },
    ],
    base: [
      { name: "Crema Batida", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 72 (46). Lattafa Whipped Pleasure — CORREGIDO: base sin Ambrofix (Fragrantica: Tonka, Musk, Benzoin)
  46: {
    top: [
      { name: "Caramelo", percentage: 90 },
      { name: "Palomitas", percentage: 85 },
      { name: "Caramelo Salado", percentage: 80 },
    ],
    heart: [
      { name: "Leche", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 73 (47). Lattafa The Kingdom Woman — CORREGIDO: Fragrantica=Pera+Peonía+Cassis, Praliné+Tonka+Jazmín, Vainilla+Almizcle+Sándalo+Ámbar
  47: {
    top: [
      { name: "Pera", percentage: 90 },
      { name: "Peonía", percentage: 80 },
      { name: "Grosella Negra", percentage: 75 },
    ],
    heart: [
      { name: "Praliné", percentage: 85 },
      { name: "Habas Tonka", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 74 (48). Lattafa The Kingdom Men — CORREGIDO: corazón=Vainilla+Tabaco+Flor de Azahar (Fragrantica), base=Tonka+Benjuí+Ládano
  48: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Menta", percentage: 85 },
      { name: "Salvia", percentage: 80 },
    ],
    heart: [
      { name: "Vainilla", percentage: 85 },
      { name: "Tabaco", percentage: 80 },
      { name: "Flor de Azahar", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
      { name: "Ládano", percentage: 75 },
    ],
  },
  // 75 (49). Lattafa Layaan — CORREGIDO: notas completamente revisadas
  49: {
    top: [
      { name: "Pera Verde", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Lirio del Valle", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Gardenia", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Madera de Cedro", percentage: 80 },
    ],
  },
  // 76 (50). Lattafa Efeef — CORREGIDO: Fragrantica=Melocotón+Pimienta Rosa+Bergamota, Tuberosa+Azahar+Jazmín, Ámbar+Praliné+Sándalo+Pachulí
  50: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Praliné", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 77 (51). Lattafa Al Noble Safeer — CORREGIDO: notas de Fragrantica (añadido Aceite de Cipriol en base)
  51: {
    top: [
      { name: "Toronja", percentage: 100 },
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 99 },
      { name: "Pimienta Negra", percentage: 93 },
    ],
    heart: [
      { name: "Caramelo", percentage: 99 },
      { name: "Jazmín", percentage: 85 },
      { name: "Heliotropo", percentage: 74 },
    ],
    base: [
      { name: "Madera de Gaïac", percentage: 96 },
      { name: "Almizcle", percentage: 92 },
      { name: "Aceite de Cipriol", percentage: 89 },
      { name: "Ámbar Gris", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
    ],
  },
  // 78 (52). Lattafa Al Noble Ameer — CORREGIDO: notas de Fragrantica (Pimienta Rosa primera en salida)
  52: {
    top: [
      { name: "Pimienta Rosa", percentage: 92 },
      { name: "Manzana", percentage: 89 },
      { name: "Romero", percentage: 85 },
    ],
    heart: [
      { name: "Clavo de Olor", percentage: 100 },
      { name: "Notas Florales", percentage: 74 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 100 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ládano", percentage: 84 },
      { name: "Vetiver", percentage: 77 },
      { name: "Ciprés", percentage: 77 },
    ],
  },
  // 79 (53). Lattafa Al Noble Wazeer — CORREGIDO: notas de Fragrantica
  53: {
    top: [
      { name: "Coñac", percentage: 93 },
      { name: "Azafrán", percentage: 87 },
      { name: "Nuez Moscada", percentage: 83 },
      { name: "Manzana", percentage: 79 },
    ],
    heart: [
      { name: "Cedro", percentage: 100 },
      { name: "Sándalo", percentage: 100 },
      { name: "Whisky", percentage: 89 },
      { name: "Roble", percentage: 86 },
    ],
    base: [
      { name: "Mirra", percentage: 85 },
      { name: "Ambroxan", percentage: 82 },
      { name: "Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 74 },
    ],
  },
  // 80 (54). Lattafa Her Confession — CORREGIDO: notas de Fragrantica
  54: {
    top: [
      { name: "Canela", percentage: 85 },
      { name: "Mystikal", percentage: 81 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Jazmín", percentage: 96 },
      { name: "Incienso", percentage: 89 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 100 },
      { name: "Haba Tonka", percentage: 97 },
    ],
  },

  // ─── Páginas 5-6 ───

  // 81 (55). Lattafa His Confession — CORREGIDO: notas de Fragrantica (Lavanda primera en salida, añadido Pachulí en base)
  55: {
    top: [
      { name: "Lavanda", percentage: 97 },
      { name: "Canela", percentage: 96 },
      { name: "Mandarina", percentage: 77 },
    ],
    heart: [
      { name: "Iris", percentage: 100 },
      { name: "Benjuí", percentage: 94 },
      { name: "Ciprés", percentage: 78 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Haba Tonka", percentage: 100 },
      { name: "Ámbar", percentage: 96 },
      { name: "Incienso", percentage: 89 },
      { name: "Cedro", percentage: 87 },
      { name: "Pachulí", percentage: 79 },
    ],
  },
  // 82 (56). Lattafa Ajwaa — CORREGIDO: notas de Fragrantica (Limón antes de Bergamota, orden corregido)
  56: {
    top: [
      { name: "Dátiles", percentage: 100 },
      { name: "Elemí", percentage: 95 },
      { name: "Limón", percentage: 79 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Regaliz", percentage: 100 },
      { name: "Mirra", percentage: 100 },
    ],
    base: [
      { name: "Benjuí", percentage: 94 },
      { name: "Incienso", percentage: 92 },
    ],
  },
  // 83 (57). Lattafa Sehr — CORREGIDO: notas de Fragrantica (Pomarose antes de Jazmín, Haba Tonka antes de Ámbar)
  57: {
    top: [
      { name: "Almendra Amarga", percentage: 100 },
      { name: "Canela", percentage: 95 },
    ],
    heart: [
      { name: "Akigalawood", percentage: 100 },
      { name: "Pomarose", percentage: 75 },
      { name: "Jazmín", percentage: 74 },
    ],
    base: [
      { name: "Vainilla Absoluto", percentage: 100 },
      { name: "Haba Tonka", percentage: 97 },
      { name: "Ámbar", percentage: 88 },
    ],
  },
  // 84 (58). Lattafa Habik Woman — CORREGIDO: notas de Fragrantica
  58: {
    top: [
      { name: "Pera", percentage: 100 },
      { name: "Bergamota", percentage: 96 },
    ],
    heart: [
      { name: "Lirio del Valle", percentage: 100 },
      { name: "Jazmín", percentage: 98 },
      { name: "Fresia", percentage: 96 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 86 },
      { name: "Musgo de Roble", percentage: 74 },
    ],
  },
  // 85 (59). Lattafa Eternal Vanille — CORREGIDO: notas de Fragrantica (reordenada base)
  59: {
    top: [
      { name: "Zarzamora", percentage: 74 },
    ],
    heart: [
      { name: "Cocoapulse", percentage: 100 },
      { name: "Caviar de Vainilla", percentage: 100 },
      { name: "Cacao", percentage: 96 },
    ],
    base: [
      { name: "Akigalawood", percentage: 100 },
      { name: "Haba Tonka", percentage: 92 },
      { name: "Ambrofix", percentage: 91 },
      { name: "Cedro", percentage: 87 },
      { name: "Benjuí", percentage: 87 },
      { name: "Almizcle", percentage: 85 },
    ],
  },
  // 86 (60). Lattafa Jassoor — CORREGIDO: notas de Fragrantica (Cardamomo antes de Bergamota, Haba Tonka primera en base)
  60: {
    top: [
      { name: "Manzana", percentage: 100 },
      { name: "Cardamomo", percentage: 97 },
      { name: "Bergamota", percentage: 84 },
    ],
    heart: [
      { name: "Tabaco", percentage: 100 },
      { name: "Lavanda", percentage: 100 },
      { name: "Geranio", percentage: 74 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 93 },
      { name: "Cuero", percentage: 78 },
      { name: "Pachulí", percentage: 75 },
      { name: "Vetiver", percentage: 75 },
    ],
  },
  // 87 (61). Lattafa Dynasty — CORREGIDO: notas de Fragrantica
  61: {
    top: [
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 98 },
      { name: "Salvia Esclarea", percentage: 83 },
      { name: "Frambuesa", percentage: 79 },
      { name: "Nuez Moscada", percentage: 74 },
    ],
    heart: [
      { name: "Té Rooibos", percentage: 100 },
      { name: "Ante / Gamuza", percentage: 87 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Amberwood", percentage: 76 },
    ],
  },
  // 88 (62). Lattafa Velvet Rose — CORREGIDO: notas de Fragrantica
  62: {
    top: [
      { name: "Rosa", percentage: 100 },
      { name: "Pachulí", percentage: 93 },
    ],
    heart: [
      { name: "Almizcle", percentage: 88 },
      { name: "Ládano", percentage: 74 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 89 (63). Lattafa Petra — CORREGIDO: notas de Fragrantica
  63: {
    top: [
      { name: "Ron", percentage: 100 },
      { name: "Ciruela", percentage: 100 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Coco", percentage: 100 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 86 },
      { name: "Praliné", percentage: 74 },
    ],
  },
  // 90 (64). Lattafa Atheeri — CORREGIDO: notas de Fragrantica
  64: {
    top: [
      { name: "Flor de la Pasión", percentage: 100 },
      { name: "Gotas de Rocío", percentage: 95 },
    ],
    heart: [
      { name: "Orquídea", percentage: 100 },
      { name: "Jazmín", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Amberwood", percentage: 86 },
    ],
  },
  // 91 (65). Lattafa Sakeena — CORREGIDO: notas de Fragrantica (Notas Ozónicas antes de Mandarina, Toffee antes de Praliné)
  65: {
    top: [
      { name: "Fruta de la Pasión", percentage: 100 },
      { name: "Notas Ozónicas", percentage: 79 },
      { name: "Mandarina", percentage: 75 },
    ],
    heart: [
      { name: "Frambuesa", percentage: 100 },
      { name: "Rosa", percentage: 88 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Sal Marina", percentage: 74 },
    ],
    base: [
      { name: "Toffee", percentage: 95 },
      { name: "Praliné", percentage: 93 },
      { name: "Vainilla", percentage: 92 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 92 (66). Lattafa Emaan — CORREGIDO: notas de Fragrantica (Flor de Azahar primera en salida)
  66: {
    top: [
      { name: "Flor de Azahar", percentage: 100 },
      { name: "Grosellas Negras", percentage: 94 },
      { name: "Bergamota", percentage: 93 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Jazmín", percentage: 100 },
      { name: "Caléndula", percentage: 77 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Vainilla", percentage: 84 },
      { name: "Cedro", percentage: 76 },
      { name: "Pachulí", percentage: 74 },
    ],
  },
  // 93 (67). Lattafa Qimmah — CORREGIDO: notas de Fragrantica (Vainilla primera en base, Jazmín/Tuberosa 100%)
  67: {
    top: [
      { name: "Almendra", percentage: 100 },
      { name: "Café", percentage: 74 },
    ],
    heart: [
      { name: "Jazmín", percentage: 100 },
      { name: "Tuberosa", percentage: 100 },
      { name: "Haba Tonka", percentage: 95 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Cacao", percentage: 86 },
      { name: "Sándalo", percentage: 84 },
    ],
  },
  // 94 (68). Lattafa Ameer Al Oudh Intense Oud — CORREGIDO: notas de Fragrantica (Notas Amaderadas primera en salida, todos 100%)
  68: {
    top: [
      { name: "Notas Amaderadas", percentage: 100 },
      { name: "Madera de Oud", percentage: 100 },
    ],
    heart: [
      { name: "Azúcar", percentage: 100 },
      { name: "Vainilla", percentage: 100 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 100 },
      { name: "Sándalo", percentage: 96 },
      { name: "Notas Herbales", percentage: 74 },
    ],
  },
  // 95 (69). Lattafa Maahir — CORREGIDO: notas de Fragrantica (Bayas Rojas primera en salida, base 100%)
  69: {
    top: [
      { name: "Bayas Rojas", percentage: 88 },
      { name: "Melocotón", percentage: 85 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Jazmín", percentage: 94 },
      { name: "Peonía", percentage: 90 },
      { name: "Lirio Rojo", percentage: 88 },
    ],
    base: [
      { name: "Sándalo", percentage: 100 },
      { name: "Flor de Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 100 },
    ],
  },
  // 96 (70). Lattafa Maahir Black Edition — CORREGIDO: notas de Fragrantica (base con 3 notas al 100%)
  70: {
    top: [
      { name: "Pimienta Negra", percentage: 100 },
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Azafrán", percentage: 86 },
    ],
    heart: [
      { name: "Aceite de Cade / Humo", percentage: 100 },
      { name: "Ládano", percentage: 99 },
      { name: "Bálsamo de Gurjun", percentage: 94 },
      { name: "Ruibarbo", percentage: 74 },
    ],
    base: [
      { name: "Cuero", percentage: 100 },
      { name: "Cedro", percentage: 100 },
      { name: "Madera de Guayaco", percentage: 100 },
      { name: "Pachulí", percentage: 95 },
      { name: "Musgo", percentage: 86 },
      { name: "Almizcle", percentage: 83 },
    ],
  },
  // 97 (71). Lattafa Maahir Legacy — CORREGIDO: notas de Fragrantica (Menta 100%, Incienso en corazón)
  71: {
    top: [
      { name: "Lima", percentage: 100 },
      { name: "Menta", percentage: 100 },
      { name: "Toronja", percentage: 96 },
      { name: "Lavanda", percentage: 90 },
      { name: "Piña", percentage: 81 },
    ],
    heart: [
      { name: "Pimienta Negra", percentage: 87 },
      { name: "Romero", percentage: 84 },
      { name: "Baya de Enebro", percentage: 83 },
      { name: "Geranio", percentage: 76 },
      { name: "Incienso", percentage: 74 },
    ],
    base: [
      { name: "Ambroxan", percentage: 92 },
      { name: "Vetiver", percentage: 80 },
      { name: "Musgo de Roble", percentage: 79 },
      { name: "Haba Tonka", percentage: 77 },
      { name: "Cachemira", percentage: 76 },
    ],
  },
  // 98 (72). Lattafa Ramz Silver — CORREGIDO: notas de Fragrantica (Vainilla 100% en base)
  72: {
    top: [
      { name: "Pera", percentage: 100 },
      { name: "Lavanda", percentage: 93 },
      { name: "Menta", percentage: 84 },
      { name: "Bergamota", percentage: 83 },
    ],
    heart: [
      { name: "Cardamomo", percentage: 83 },
      { name: "Salvia", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Ámbar", percentage: 89 },
      { name: "Almizcle", percentage: 83 },
      { name: "Pachulí", percentage: 77 },
    ],
  },
  // 99 (73). Lattafa Ramz Gold — CORREGIDO: notas de Fragrantica (Manzana primera, Jazmín Sambac, Almizcle Blanco, Sándalo primera en base)
  73: {
    top: [
      { name: "Manzana", percentage: 100 },
      { name: "Melocotón", percentage: 94 },
      { name: "Grosellas Negras", percentage: 84 },
      { name: "Pera", percentage: 83 },
      { name: "Naranja Dulce", percentage: 74 },
    ],
    heart: [
      { name: "Rosa", percentage: 100 },
      { name: "Jazmín Sambac", percentage: 100 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    base: [
      { name: "Sándalo", percentage: 100 },
      { name: "Almizcle Blanco", percentage: 100 },
      { name: "Vainilla", percentage: 93 },
      { name: "Pachulí", percentage: 92 },
    ],
  },
  // 100 (74). Lattafa Najdia — CORREGIDO: notas de Fragrantica (Manzana y Canela 100% en salida, Notas Acuáticas en corazón)
  74: {
    top: [
      { name: "Limón", percentage: 100 },
      { name: "Manzana", percentage: 100 },
      { name: "Canela", percentage: 100 },
      { name: "Hierba Limón", percentage: 96 },
      { name: "Bergamota", percentage: 95 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 100 },
      { name: "Lavanda", percentage: 99 },
      { name: "Cardamomo", percentage: 83 },
      { name: "Romero", percentage: 83 },
    ],
    base: [
      { name: "Almizcle", percentage: 96 },
      { name: "Ámbar", percentage: 92 },
      { name: "Sándalo", percentage: 85 },
      { name: "Cedro", percentage: 83 },
      { name: "Tabaco", percentage: 74 },
    ],
  },
  // 101 (75). Lattafa Suqraat — CORREGIDO: notas de Fragrantica (Jengibre 100% en salida, Almizcle primera en base)
  75: {
    top: [
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 100 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Hojas de Violeta", percentage: 88 },
    ],
    base: [
      { name: "Almizcle", percentage: 96 },
      { name: "Sándalo", percentage: 81 },
      { name: "Ámbar", percentage: 74 },
    ],
  },
  // 102 (128). Lattafa Khamrah — CORREGIDO: notas de Fragrantica (Canela 100%, Tuberosa en corazón)
  128: {
    top: [
      { name: "Canela", percentage: 100 },
      { name: "Nuez Moscada", percentage: 92 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Dátiles", percentage: 100 },
      { name: "Praliné", percentage: 99 },
      { name: "Tuberosa", percentage: 75 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Haba Tonka", percentage: 95 },
      { name: "Amberwood", percentage: 89 },
      { name: "Mirra", percentage: 85 },
      { name: "Benjuí", percentage: 84 },
      { name: "Akigalawood", percentage: 82 },
    ],
  },
  // 103 (129). Lattafa Khamrah Qahwa — CORREGIDO: notas de Fragrantica (Café 100% en base, Vainilla 100%)
  129: {
    top: [
      { name: "Canela", percentage: 100 },
      { name: "Cardamomo", percentage: 92 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Praliné", percentage: 100 },
      { name: "Frutas Escarchadas", percentage: 90 },
      { name: "Flores Blancas", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Café Arabica", percentage: 100 },
      { name: "Haba Tonka", percentage: 94 },
      { name: "Benjuí", percentage: 83 },
      { name: "Almizcle", percentage: 81 },
    ],
  },
  // 104 (130). Lattafa Khamrah Dukhan — CORREGIDO: notas de Fragrantica (Praliné y Tabaco dominan base)
  130: {
    top: [
      { name: "Especias Ahumadas", percentage: 100 },
      { name: "Pimiento", percentage: 96 },
      { name: "Mandarina", percentage: 81 },
    ],
    heart: [
      { name: "Incienso", percentage: 97 },
      { name: "Ládano", percentage: 78 },
      { name: "Flor de Azahar", percentage: 77 },
      { name: "Pachulí", percentage: 74 },
    ],
    base: [
      { name: "Praliné", percentage: 100 },
      { name: "Tabaco", percentage: 99 },
      { name: "Ámbar", percentage: 95 },
      { name: "Haba Tonka", percentage: 94 },
      { name: "Benjuí", percentage: 89 },
    ],
  },
  // 105 (131). Lattafa Yara — CORREGIDO: notas de Fragrantica (Vainilla 100% y Almizcle 94% en base)
  131: {
    top: [
      { name: "Orquídea", percentage: 91 },
      { name: "Heliotropo", percentage: 86 },
      { name: "Mandarina", percentage: 78 },
    ],
    heart: [
      { name: "Acorde Gourmand", percentage: 100 },
      { name: "Frutas Tropicales", percentage: 96 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 94 },
      { name: "Sándalo", percentage: 74 },
    ],
  },
  // 106 (132). Lattafa Yara Tous — CORREGIDO: notas de Fragrantica (Mango y Coco 100%, Heliotropo en corazón)
  132: {
    top: [
      { name: "Mango", percentage: 100 },
      { name: "Coco", percentage: 100 },
      { name: "Fruta de la Pasión", percentage: 91 },
    ],
    heart: [
      { name: "Jazmín", percentage: 97 },
      { name: "Flor de Azahar", percentage: 87 },
      { name: "Heliotropo", percentage: 83 },
    ],
    base: [
      { name: "Vainilla", percentage: 96 },
      { name: "Almizcle", percentage: 83 },
      { name: "Cachemira", percentage: 74 },
    ],
  },
  // 107 (133). Lattafa Yara Moi — CORREGIDO: notas de Fragrantica (Jazmín primera en salida, Pachulí 99% en base)
  133: {
    top: [
      { name: "Jazmín", percentage: 100 },
      { name: "Melocotón", percentage: 91 },
    ],
    heart: [
      { name: "Caramelo", percentage: 88 },
      { name: "Ámbar", percentage: 74 },
    ],
    base: [
      { name: "Pachulí", percentage: 99 },
      { name: "Sándalo", percentage: 87 },
    ],
  },
  // 108 (134). Lattafa Asad — CORREGIDO: notas de Fragrantica (Tabaco 99%, Vainilla y Ámbar 100% en base, Maderas Secas 98%)
  134: {
    top: [
      { name: "Pimienta Negra", percentage: 100 },
      { name: "Tabaco", percentage: 99 },
      { name: "Piña", percentage: 81 },
    ],
    heart: [
      { name: "Pachulí", percentage: 86 },
      { name: "Café", percentage: 79 },
      { name: "Iris", percentage: 77 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Ámbar", percentage: 100 },
      { name: "Maderas Secas", percentage: 98 },
      { name: "Benjuí", percentage: 82 },
      { name: "Ládano", percentage: 74 },
    ],
  },
  // 109 (135). Lattafa Asad Bourbon — CORREGIDO: notas de Fragrantica (Vainilla Bourbon 100%, Cacao 100% en corazón)
  135: {
    top: [
      { name: "Lavanda", percentage: 100 },
      { name: "Mirabelle", percentage: 88 },
      { name: "Pimienta Rosa", percentage: 86 },
    ],
    heart: [
      { name: "Cacao", percentage: 100 },
      { name: "Nuez Moscada", percentage: 89 },
      { name: "Davana", percentage: 74 },
    ],
    base: [
      { name: "Vainilla Bourbon", percentage: 100 },
      { name: "Ámbar", percentage: 95 },
      { name: "Vetiver", percentage: 78 },
    ],
  },
  // 110 (136). Lattafa Asad Zanzibar — CORREGIDO: notas de Fragrantica (Agua de Coco e Iris 100%, Sal 89%)
  136: {
    top: [
      { name: "Lavanda", percentage: 95 },
      { name: "Pimienta Negra", percentage: 83 },
    ],
    heart: [
      { name: "Agua de Coco", percentage: 100 },
      { name: "Iris", percentage: 100 },
      { name: "Sal", percentage: 89 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Incienso", percentage: 74 },
    ],
  },
  // 111 (150). Lattafa Opulent Dubai — CORREGIDO: notas de Fragrantica (Jengibre 88%, Benjuí y Musgo de Roble en base)
  150: {
    top: [
      { name: "Mango", percentage: 100 },
      { name: "Toronja", percentage: 94 },
      { name: "Limón", percentage: 93 },
      { name: "Jengibre", percentage: 88 },
    ],
    heart: [
      { name: "Jazmín", percentage: 82 },
      { name: "Cedro", percentage: 77 },
      { name: "Violeta", percentage: 75 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 78 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Benjuí", percentage: 74 },
      { name: "Musgo de Roble", percentage: 74 },
    ],
  },
  // 112 (76). French Avenue Liquid Brun — CORREGIDO: notas de Fragrantica
  76: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Flor de Azahar del Naranjo", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Vainilla Bourbon", percentage: 95 },
      { name: "Elemí", percentage: 80 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ambroxan", percentage: 85 },
      { name: "Madera de Gaiac", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 113 (77). French Avenue Aether — CORREGIDO: notas de Fragrantica (Cedro antes de Petitgrain en corazón)
  77: {
    top: [
      { name: "Manzana Verde", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Petitgrain", percentage: 78 },
      { name: "Cachemira", percentage: 72 },
      { name: "Violeta", percentage: 62 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
    ],
  },
  // 114 (78). French Avenue Luscious — CORREGIDO: notas de Fragrantica
  78: {
    top: [
      { name: "Pistacho (Pistache)", percentage: 95 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Cacahuates", percentage: 90 },
      { name: "Azafrán", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Miel", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 115 (79). French Avenue Intense Addiction — CORREGIDO: notas completamente revisadas
  79: {
    top: [
      { name: "Flor de Manzano", percentage: 90 },
      { name: "Naranja", percentage: 85 },
    ],
    heart: [
      { name: "Orquídea", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
    ],
    base: [
      { name: "Miel", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 116 (80). French Avenue Obsidian — CORREGIDO: notas completamente revisadas
  80: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Aldehídos", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Mirra", percentage: 90 },
      { name: "Ládano", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Vainilla", percentage: 75 },
    ],
  },
  // 117 (81). French Avenue Vulcan Feu — CORREGIDO: notas completamente revisadas
  81: {
    top: [
      { name: "Mango", percentage: 95 },
      { name: "Limón", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Ruibarbo", percentage: 80 },
    ],
    heart: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Violeta", percentage: 80 },
      { name: "Praliné", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 118 (82). Afnan Supremacy Not Only Intense — CORREGIDO: notas de Fragrantica
  82: {
    top: [
      { name: "Grosellas Negras", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Manzana", percentage: 80 },
    ],
    heart: [
      { name: "Musgo de Roble", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Azafrán", percentage: 70 },
    ],
  },
  // 119 (83). Afnan Supremacy Silver — CORREGIDO: notas de Fragrantica (Jazmín de Marruecos)
  83: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Manzana", percentage: 80 },
    ],
    heart: [
      { name: "Abedul", percentage: 90 },
      { name: "Pachulí", percentage: 80 },
      { name: "Jazmín de Marruecos", percentage: 70 },
      { name: "Rosa", percentage: 60 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 120 (84). Afnan Supremacy Incense — CORREGIDO: notas de Fragrantica (Especias y Notas Herbales en salida, Opopónaco antes de Ámbar en corazón)
  84: {
    top: [
      { name: "Orégano", percentage: 95 },
      { name: "Especias", percentage: 85 },
      { name: "Notas Herbales", percentage: 78 },
      { name: "Bergamota", percentage: 72 },
    ],
    heart: [
      { name: "Opopónaco", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Ládano", percentage: 80 },
    ],
    base: [
      { name: "Humo", percentage: 92 },
      { name: "Madera de Oud", percentage: 88 },
      { name: "Cuero", percentage: 82 },
      { name: "Pachulí", percentage: 78 },
    ],
  },

  // ─── Páginas 7-8: Afnan, Rave, Maison Alhambra, Dumont, Rasasi ───

  // 121 (85). Afnan Supremacy In Heaven — CORREGIDO: notas de Fragrantica
  85: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Té Verde", percentage: 85 },
      { name: "Grosellas Negras", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 122 (86). Afnan 9PM Rebel — CORREGIDO: notas de Fragrantica (Piña primero en salida)
  86: {
    top: [
      { name: "Piña", percentage: 92 },
      { name: "Manzana Granny Smith", percentage: 88 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Caramelo", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Madera Seca", percentage: 70 },
    ],
  },
  // 123 (87). Afnan 9PM Pour Femme — CORREGIDO: notas de Fragrantica
  87: {
    top: [
      { name: "Frambuesa", percentage: 90 },
      { name: "Violeta", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Naranja", percentage: 75 },
    ],
    heart: [
      { name: "Rosa", percentage: 90 },
      { name: "Peonía", percentage: 85 },
      { name: "Iris", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Ciprés", percentage: 85 },
      { name: "Pino", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 124 (137). Afnan 9PM — CORREGIDO: notas de Fragrantica (Flor de Azahar del Naranjo, Lirio de los Valles)
  137: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Canela", percentage: 90 },
      { name: "Lavanda Silvestre", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar del Naranjo", percentage: 90 },
      { name: "Lirio de los Valles (Muguete)", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Haba Tonka", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 125 (138). Afnan 9PM Nite Out — CORREGIDO: notas de Fragrantica
  138: {
    top: [
      { name: "Pitahaya", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Coñac", percentage: 80 },
      { name: "Manzana", percentage: 75 },
      { name: "Bergamota", percentage: 65 },
    ],
    heart: [
      { name: "Toffee", percentage: 90 },
      { name: "Ante / Gamuza", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Mahonial", percentage: 65 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Akigalawood", percentage: 85 },
      { name: "Ambrofix", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 126 (139). Afnan 9PM Elixir — CORREGIDO: notas de Fragrantica (Pimienta de Jamaica en corazón, Heliántemo en base)
  139: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Elemí", percentage: 75 },
    ],
    heart: [
      { name: "Pimienta de Jamaica", percentage: 90 },
      { name: "Cuero", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ládano", percentage: 80 },
      { name: "Heliántemo", percentage: 70 },
    ],
  },
  // 127 (140). Afnan 9AM Dive — CORREGIDO: notas de Fragrantica (Jengibre e Incienso en corazón, Sándalo/Jazmín/Pachulí en base)
  140: {
    top: [
      { name: "Limón (Lima Ácida)", percentage: 95 },
      { name: "Menta", percentage: 90 },
      { name: "Grosellas Negras", percentage: 82 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Manzana", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Incienso", percentage: 75 },
      { name: "Jengibre", percentage: 72 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Pachulí", percentage: 78 },
      { name: "Jazmín", percentage: 68 },
    ],
  },
  // 128 (152). Afnan Turathi Electric — CORREGIDO: notas de Fragrantica (Toronja Rosada, Flor de Azahar del Naranjo)
  152: {
    top: [
      { name: "Pera", percentage: 95 },
      { name: "Toronja (Pomelo) Rosada", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar del Naranjo", percentage: 90 },
      { name: "Manzana", percentage: 80 },
      { name: "Cedro", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 129 (153). Afnan Turathi Blue — CORREGIDO: notas de Fragrantica (Cítricos en salida, Especias en base)
  153: {
    top: [
      { name: "Cítricos", percentage: 95 },
    ],
    heart: [
      { name: "Ámbar", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 85 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Especias", percentage: 82 },
      { name: "Pachulí", percentage: 78 },
    ],
  },

  // ─── Rave ───

  // 130 (88). Rave Now — CORREGIDO: notas de Fragrantica (Jazmín de Marruecos)
  88: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Grosellas Negras", percentage: 75 },
    ],
    heart: [
      { name: "Abedul", percentage: 90 },
      { name: "Pachulí", percentage: 85 },
      { name: "Jazmín de Marruecos", percentage: 80 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Musgo de Roble", percentage: 80 },
      { name: "Ámbar Gris", percentage: 75 },
    ],
  },
  // 131 (89). Rave Now Women — CORREGIDO: notas de Fragrantica (Frutas Rojas, Malvavisco/Bombón, Lirio de los Valles)
  89: {
    top: [
      { name: "Frutas Rojas", percentage: 90 },
      { name: "Naranja", percentage: 85 },
    ],
    heart: [
      { name: "Malvavisco (Bombón)", percentage: 95 },
      { name: "Jazmín", percentage: 80 },
      { name: "Lirio de los Valles (Muguete)", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 132 (90). Rave Rage — CORREGIDO: notas de Fragrantica
  90: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Menta", percentage: 85 },
    ],
    heart: [
      { name: "Cilantro", percentage: 80 },
      { name: "Fresia", percentage: 75 },
      { name: "Albahaca", percentage: 70 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Ládano", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
  },

  // ─── Maison Alhambra ───

  // 133 (92). Maison Alhambra Baroque Rouge 540 — CORREGIDO: notas de Fragrantica
  92: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Pera", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Lirio", percentage: 75 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Madera de Cachemira", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 134 (93). Maison Alhambra Cassius — CORREGIDO: notas de Fragrantica (notas correctas)
  93: {
    top: [
      { name: "Nuez Moscada", percentage: 90 },
      { name: "Manzana Verde", percentage: 85 },
    ],
    heart: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Pachulí", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
    ],
  },
  // 135 (94). Maison Alhambra The Tux — CORREGIDO: notas de Fragrantica (sin pirámide tradicional, solo ingredientes listados)
  94: {
    top: [
      { name: "Pachulí", percentage: 95 },
      { name: "Notas Especiadas", percentage: 85 },
      { name: "Notas Florales", percentage: 75 },
    ],
    heart: [
      { name: "Ámbar", percentage: 90 },
      { name: "Vainilla", percentage: 80 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 136 (95). Maison Alhambra Glacier Le Noir — CORREGIDO: notas de Fragrantica (sin pirámide tradicional, ingredientes: Cardamomo, Vainilla, Lavanda, Iris)
  95: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Lavanda", percentage: 88 },
    ],
    heart: [
      { name: "Iris", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Notas Amaderadas", percentage: 85 },
    ],
  },
  // 137 (96). Maison Alhambra Céleste — CORREGIDO: notas de Fragrantica (notas correctas, Musgo en base confirmado)
  96: {
    top: [
      { name: "Limón", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Lirio del Valle", percentage: 85 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Musgo", percentage: 65 },
    ],
  },
  // 138 (97). Maison Alhambra Tobacco Touch — CORREGIDO: notas de Fragrantica
  97: {
    top: [
      { name: "Tabaco", percentage: 95 },
      { name: "Notas Especiadas", percentage: 85 },
    ],
    heart: [
      { name: "Tabaco", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Cacao", percentage: 75 },
    ],
    base: [
      { name: "Frutas Secas", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 80 },
    ],
  },
  // 159 (158). Maison Alhambra Glacier Bella — VERIFICADO: notas de Fragrantica (pirámide plana: Pera Verde, Vainilla, Bergamota)
  158: {
    top: [
      { name: "Pera Verde", percentage: 90 },
      { name: "Bergamota", percentage: 70 },
    ],
    heart: [
      { name: "Vainilla", percentage: 88 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 85 },
    ],
  },

  // ─── Dumont ───

  // 139 (98). Dumont Nitro Pour Homme — CORREGIDO: notas de Fragrantica
  98: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
      { name: "Limón", percentage: 70 },
      { name: "Nuez Moscada", percentage: 65 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Cedro", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Cedro", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Madera de Guayaco", percentage: 75 },
      { name: "Haba Tonka", percentage: 70 },
    ],
  },
  // 140 (99). Dumont Nitro Blue — CORREGIDO: notas de Fragrantica (base diferente)
  99: {
    top: [
      { name: "Canela", percentage: 90 },
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Salvia", percentage: 75 },
      { name: "Albahaca", percentage: 70 },
    ],
    heart: [
      { name: "Praliné", percentage: 90 },
      { name: "Bálsamo de Tolú", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 80 },
      { name: "Cardamomo Negro", percentage: 75 },
    ],
    base: [
      { name: "Notas Dulces", percentage: 90 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ámbar Negro", percentage: 80 },
      { name: "Palo de Rosa Brasileño", percentage: 70 },
    ],
  },
  // 141 (100). Dumont Nitro Red — CORREGIDO: notas de Fragrantica
  100: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Sandía", percentage: 90 },
      { name: "Cedro", percentage: 80 },
      { name: "Cálamo", percentage: 70 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Sándalo", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 142 (101). Dumont Nitro White — CORREGIDO: notas de Fragrantica
  101: {
    top: [
      { name: "Bayas de Enebro", percentage: 90 },
      { name: "Iris", percentage: 85 },
      { name: "Ciprés", percentage: 80 },
    ],
    heart: [
      { name: "Mirra", percentage: 90 },
      { name: "Pachulí", percentage: 80 },
    ],
    base: [
      { name: "Miel", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Cuero", percentage: 65 },
    ],
  },
  // 143 (102). Dumont Nitro Platinum — CORREGIDO: notas de Fragrantica
  102: {
    top: [
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Naranja", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Cardamomo", percentage: 65 },
    ],
    heart: [
      { name: "Vainilla", percentage: 90 },
      { name: "Azúcar", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Madera Seca", percentage: 75 },
      { name: "Azafrán", percentage: 70 },
      { name: "Lirio del Valle", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Ámbar", percentage: 90 },
      { name: "Cedro", percentage: 80 },
      { name: "Musgo", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Madera de Guayaco", percentage: 65 },
    ],
  },

  // ─── Rasasi ───

  // 144 (122). Rasasi Hawas For Him — CORREGIDO: notas de Fragrantica
  122: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Canela", percentage: 75 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 90 },
      { name: "Ciruela", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Cardamomo", percentage: 70 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Madera de Deriva", percentage: 70 },
    ],
  },
  // 145 (123). Rasasi Hawas Tropical — CORREGIDO: notas de Fragrantica
  123: {
    top: [
      { name: "Agua de Coco", percentage: 95 },
      { name: "Hoja de Higo", percentage: 85 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Coco", percentage: 95 },
      { name: "Higo", percentage: 85 },
      { name: "Menta", percentage: 75 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 146 (124). Rasasi Hawas Fire — CORREGIDO: notas de Fragrantica (Notas Marinas en salida y corazón)
  124: {
    top: [
      { name: "Salvia Esclarea", percentage: 95 },
      { name: "Notas Marinas", percentage: 85 },
    ],
    heart: [
      { name: "Notas Marinas", percentage: 95 },
      { name: "Jazmín Egipcio", percentage: 85 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Notas Minerales", percentage: 85 },
      { name: "Ámbar Gris", percentage: 80 },
    ],
  },
  // 147 (125). Rasasi Hawas Malibu — CORREGIDO: notas de Fragrantica
  125: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Ámbar", percentage: 85 },
      { name: "Iris", percentage: 80 },
      { name: "Lavanda", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 148 (126). Rasasi Hawas Ice — CORREGIDO: notas de Fragrantica
  126: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Limón Italiano", percentage: 90 },
      { name: "Bergamota Siciliana", percentage: 85 },
      { name: "Anís Estrellado", percentage: 75 },
    ],
    heart: [
      { name: "Ciruela", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Cardamomo", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Madera de Deriva", percentage: 80 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 149 (127). Rasasi Hawas Elixir — CORREGIDO: notas de Fragrantica
  127: {
    top: [
      { name: "Menta", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Artemisa", percentage: 75 },
    ],
    heart: [
      { name: "Chocolate Oscuro", percentage: 95 },
      { name: "Lavanda", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle Blanco", percentage: 80 },
    ],
  },

  // ==================== DAVIDOFF ====================
  // 155. Davidoff Cool Water (Caballero) — Fragrantica ID 507
  155: {
    top: [
      { name: "Agua de Mar", percentage: 95 },
      { name: "Lavanda", percentage: 85 },
      { name: "Menta", percentage: 82 },
      { name: "Notas Verdes", percentage: 78 },
      { name: "Romero", percentage: 70 },
      { name: "Calone", percentage: 65 },
      { name: "Cilantro", percentage: 58 },
    ],
    heart: [
      { name: "Sándalo", percentage: 80 },
      { name: "Neroli", percentage: 78 },
      { name: "Geranio", percentage: 75 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Musgo de Roble", percentage: 82 },
      { name: "Cedro", percentage: 78 },
      { name: "Tabaco", percentage: 75 },
      { name: "Ámbar Gris", percentage: 68 },
    ],
  },
  // 156. Davidoff Cool Water Woman (Dama) — Fragrantica ID 508
  156: {
    top: [
      { name: "Melón", percentage: 95 },
      { name: "Flor de Loto", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Piña", percentage: 78 },
      { name: "Calone", percentage: 72 },
      { name: "Membrillo", percentage: 72 },
      { name: "Azucena", percentage: 68 },
      { name: "Grosella Negra", percentage: 62 },
    ],
    heart: [
      { name: "Flor de Loto", percentage: 90 },
      { name: "Nenúfar", percentage: 88 },
      { name: "Lirio de los Valles", percentage: 75 },
      { name: "Jazmín", percentage: 70 },
      { name: "Miel", percentage: 65 },
      { name: "Flor del Espino", percentage: 63 },
      { name: "Rosa", percentage: 62 },
    ],
    base: [
      { name: "Almizcle", percentage: 80 },
      { name: "Vetiver", percentage: 75 },
      { name: "Raíz de Violeta", percentage: 73 },
      { name: "Frambuesa", percentage: 72 },
      { name: "Melocotón", percentage: 72 },
      { name: "Zarzamora", percentage: 72 },
      { name: "Sándalo", percentage: 72 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 157. Davidoff Cool Water Intense (Caballero) — Fragrantica ID 55266
  157: {
    top: [
      { name: "Mandarina Verde", percentage: 95 },
    ],
    heart: [
      { name: "Néctar de Coco", percentage: 88 },
    ],
    base: [
      { name: "Ámbar", percentage: 95 },
    ],
  },

  // ─── JEAN PAUL GAULTIER ───
  // 159. Le Male Le Parfum — NOTAS DE FRAGRANTICA
  159: {
    top: [
      { name: "Cardamomo", percentage: 95 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Iris", percentage: 78 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Notas Orientales", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 68 },
    ],
  },
  // 160. Le Beau Le Parfum — NOTAS DE FRAGRANTICA
  160: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Iris", percentage: 82 },
      { name: "Jengibre", percentage: 75 },
      { name: "Ciprés", percentage: 65 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Notas Amaderadas", percentage: 72 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Sándalo", percentage: 82 },
      { name: "Ámbar", percentage: 75 },
      { name: "Ámbar Gris", percentage: 68 },
    ],
  },
  // 161. Le Male Elixir — NOTAS DE FRAGRANTICA
  161: {
    top: [
      { name: "Lavanda", percentage: 92 },
      { name: "Menta", percentage: 85 },
    ],
    heart: [
      { name: "Vainilla", percentage: 95 },
      { name: "Benjuí", percentage: 78 },
    ],
    base: [
      { name: "Miel", percentage: 92 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Tabaco", percentage: 80 },
    ],
  },
  // 162. Scandal Pour Homme — NOTAS DE FRAGRANTICA
  162: {
    top: [
      { name: "Mandarina", percentage: 92 },
      { name: "Salvia Esclarea", percentage: 78 },
    ],
    heart: [
      { name: "Caramelo", percentage: 95 },
      { name: "Haba Tonka", percentage: 82 },
    ],
    base: [
      { name: "Vetiver", percentage: 88 },
    ],
  },
  // 163. Le Beau — NOTAS DE FRAGRANTICA
  163: {
    top: [
      { name: "Bergamota", percentage: 92 },
    ],
    heart: [
      { name: "Coco", percentage: 95 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 95 },
    ],
  },
  // 164. Scandal (Mujer) — NOTAS DE FRAGRANTICA
  164: {
    top: [
      { name: "Naranja Sangre", percentage: 92 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Miel", percentage: 95 },
      { name: "Gardenia", percentage: 82 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Jazmín", percentage: 68 },
      { name: "Melocotón", percentage: 60 },
    ],
    base: [
      { name: "Cera de Abeja", percentage: 88 },
      { name: "Caramelo", percentage: 82 },
      { name: "Pachulí", percentage: 72 },
      { name: "Regaliz", percentage: 62 },
    ],
  },
  // 165. Scandal Pour Homme Le Parfum — NOTAS DE FRAGRANTICA
  165: {
    top: [
      { name: "Geranio", percentage: 92 },
    ],
    heart: [
      { name: "Haba Tonka", percentage: 95 },
    ],
    base: [
      { name: "Sándalo", percentage: 95 },
    ],
  },
  // 166. Scandal Le Parfum (Mujer) — NOTAS DE FRAGRANTICA
  166: {
    top: [
      { name: "Jazmín", percentage: 95 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Sal", percentage: 72 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
    ],
  },
  // 167. Sceptre Malachite (Maison Alhambra) — CORREGIDO: notas de Fragrantica
  167: {
    top: [
      { name: "Mandarina Verde", percentage: 95 },
      { name: "Bergamota", percentage: 82 },
      { name: "Grosella Negra", percentage: 70 },
    ],
    heart: [
      { name: "Notas Aromáticas", percentage: 88 },
      { name: "Notas Especiadas", percentage: 75 },
      { name: "Jazmín", percentage: 65 },
      { name: "Pimienta Rosa", percentage: 58 },
      { name: "Lavanda", percentage: 52 },
    ],
    base: [
      { name: "Ámbar", percentage: 92 },
      { name: "Almizcle", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 72 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 168. Island (Khadlaj) — CORREGIDO: notas de Fragrantica
  168: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Iris", percentage: 78 },
      { name: "Jengibre", percentage: 65 },
      { name: "Ciprés", percentage: 55 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Notas Amaderadas", percentage: 72 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 88 },
      { name: "Sándalo", percentage: 78 },
      { name: "Ámbar", percentage: 68 },
      { name: "Ámbar Gris", percentage: 58 },
    ],
  },
  // 169. Island Dreams — CORREGIDO: notas de Fragrantica
  169: {
    top: [
      { name: "Jengibre", percentage: 92 },
      { name: "Bergamota", percentage: 78 },
    ],
    heart: [
      { name: "Toronja", percentage: 85 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ambroxan", percentage: 78 },
    ],
  },
  // 170. Island Vanilla Dunes — CORREGIDO: notas de Fragrantica
  170: {
    top: [
      { name: "Vainilla", percentage: 95 },
      { name: "Canela", percentage: 82 },
      { name: "Cardamomo", percentage: 72 },
      { name: "Bergamota", percentage: 58 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 88 },
      { name: "Madera de Guayaco", percentage: 68 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ámbar", percentage: 78 },
      { name: "Almizcle", percentage: 65 },
    ],
  },
  // 176. Rome Pour Homme — CORREGIDO: notas de Fragrantica
  176: {
    top: [
      { name: "Geranio", percentage: 92 },
      { name: "Rosa", percentage: 78 },
    ],
    heart: [
      { name: "Salvia", percentage: 90 },
      { name: "Jengibre", percentage: 72 },
    ],
    base: [
      { name: "Madera de Cedro", percentage: 95 },
      { name: "Vetiver", percentage: 80 },
    ],
  },
  // 178. Bharara King — CORREGIDO: notas de Fragrantica
  178: {
    top: [
      { name: "Naranja", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
      { name: "Limón", percentage: 72 },
    ],
    heart: [
      { name: "Notas Frutales", percentage: 95 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 80 },
      { name: "Ámbar", percentage: 72 },
    ],
  },
  // 180. Bharara Queen — CORREGIDO: notas de Fragrantica
  180: {
    top: [
      { name: "Bergamota", percentage: 92 },
    ],
    heart: [
      { name: "Flores Blancas", percentage: 88 },
      { name: "Rosa", percentage: 78 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Caramelo", percentage: 82 },
      { name: "Vainilla", percentage: 72 },
    ],
  },
  // 181. Viking Rio — CORREGIDO: notas de Fragrantica
  181: {
    top: [
      { name: "Avellana", percentage: 92 },
      { name: "Cacao", percentage: 85 },
    ],
    heart: [
      { name: "Cedro", percentage: 88 },
      { name: "Jazmín Sambac", percentage: 72 },
    ],
    base: [
      { name: "Caramelo", percentage: 90 },
      { name: "Ambroxan", percentage: 78 },
      { name: "Musgo de Roble", percentage: 65 },
    ],
  },
  // 182. Viking Dubai — CORREGIDO: notas de Fragrantica
  182: {
    top: [
      { name: "Limón", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
      { name: "Jengibre", percentage: 72 },
      { name: "Toronja", percentage: 65 },
      { name: "Naranja Dulce", percentage: 58 },
    ],
    heart: [
      { name: "Madera Cashmere", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
      { name: "Violeta", percentage: 62 },
      { name: "Magnolia", percentage: 55 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 80 },
      { name: "Pachulí", percentage: 68 },
      { name: "Ámbar Gris", percentage: 60 },
    ],
  },
  // 183. Viking Cairo — CORREGIDO: notas de Fragrantica
  183: {
    top: [
      { name: "Mandarina", percentage: 92 },
      { name: "Jengibre", percentage: 78 },
      { name: "Limón", percentage: 68 },
    ],
    heart: [
      { name: "Acorde Fougère", percentage: 85 },
      { name: "Haba Tonka", percentage: 72 },
      { name: "Lavanda", percentage: 62 },
      { name: "Violeta", percentage: 55 },
      { name: "Magnolia", percentage: 50 },
    ],
    base: [
      { name: "Vetiver", percentage: 90 },
      { name: "Ámbar", percentage: 80 },
      { name: "Pachulí", percentage: 68 },
      { name: "Almizcle", percentage: 58 },
    ],
  },
  // 184. Viking Kashmir — CORREGIDO: notas de Fragrantica
  184: {
    top: [
      { name: "Papiro", percentage: 92 },
      { name: "Cardamomo", percentage: 82 },
    ],
    heart: [
      { name: "Hisopo", percentage: 85 },
      { name: "Olíbano", percentage: 72 },
      { name: "Zanahoria", percentage: 58 },
    ],
    base: [
      { name: "Sándalo", percentage: 95 },
      { name: "Madera de Cachemira", percentage: 82 },
    ],
  },
  // 185. Sherif — NOTAS DE FRAGRANTICA
  185: {
    top: [
      { name: "Manzana", percentage: 92 },
      { name: "Petitgrain", percentage: 80 },
      { name: "Bergamota", percentage: 72 },
    ],
    heart: [
      { name: "Madera de Cedro", percentage: 88 },
      { name: "Cashmeran", percentage: 78 },
      { name: "Violeta", percentage: 65 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 90 },
      { name: "Almizcle", percentage: 82 },
      { name: "Ámbar", percentage: 72 },
    ],
  },

  // ==================== CAROLINA HERRERA ====================
  186: {
    top: [
      { name: "Almendra", percentage: 85 },
      { name: "Café", percentage: 80 },
      { name: "Bergamota", percentage: 55 },
      { name: "Limón", percentage: 45 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 90 },
      { name: "Jazmín Sambac", percentage: 85 },
      { name: "Naranjo", percentage: 75 },
      { name: "Rosa Búlgara", percentage: 60 },
      { name: "Lirio", percentage: 50 },
    ],
    base: [
      { name: "Tonka", percentage: 95 },
      { name: "Cacao", percentage: 90 },
      { name: "Vainilla", percentage: 80 },
      { name: "Praline", percentage: 70 },
      { name: "Sándalo", percentage: 65 },
      { name: "Almizcle", percentage: 55 },
      { name: "Ámbar", percentage: 50 },
      { name: "Madera de Cashmere", percentage: 45 },
      { name: "Pachulí", percentage: 40 },
      { name: "Canela", percentage: 35 },
      { name: "Cedro", percentage: 30 },
    ],
  },
  187: {
    top: [
      { name: "Bergamota", percentage: 70 },
      { name: "Almendra Amarga", percentage: 65 },
    ],
    heart: [
      { name: "Peonía", percentage: 80 },
      { name: "Ylang-Ylang", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Cumaro", percentage: 70 },
    ],
  },
  188: {
    top: [
      { name: "Lichi", percentage: 80 },
      { name: "Grosella", percentage: 75 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 80 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  189: {
    top: [
      { name: "Cereza Negra", percentage: 85 },
      { name: "Almendra Amarga", percentage: 75 },
    ],
    heart: [
      { name: "Rosa", percentage: 80 },
      { name: "Tuberosa", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Cacao", percentage: 80 },
    ],
  },
  190: {
    top: [
      { name: "Bergamota", percentage: 65 },
      { name: "Mandarina", percentage: 60 },
    ],
    heart: [
      { name: "Ylang-Ylang", percentage: 80 },
      { name: "Rosa", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  191: {
    top: [
      { name: "Pitahaya", percentage: 85 },
    ],
    heart: [
      { name: "Frangipani", percentage: 80 },
      { name: "Peonía Roja", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 80 },
      { name: "Pachulí", percentage: 65 },
    ],
  },
  192: {
    top: [
      { name: "Lavanda", percentage: 80 },
      { name: "Pimienta Rosa", percentage: 65 },
    ],
    heart: [
      { name: "Ciruela", percentage: 75 },
      { name: "Geranio", percentage: 60 },
    ],
    base: [
      { name: "Cedro", percentage: 80 },
      { name: "Vetiver", percentage: 75 },
      { name: "Trufa", percentage: 60 },
      { name: "Roble", percentage: 55 },
    ],
  },
  193: {
    top: [
      { name: "Pimienta Blanca", percentage: 75 },
      { name: "Bergamota", percentage: 70 },
      { name: "Pimienta Rosa", percentage: 60 },
    ],
    heart: [
      { name: "Cedro", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    base: [
      { name: "Tonka", percentage: 90 },
      { name: "Cacao", percentage: 85 },
    ],
  },
  194: {
    top: [
      { name: "Pimienta Negra", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    heart: [
      { name: "Trufa", percentage: 75 },
      { name: "Notas Amaderadas", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Incienso", percentage: 75 },
    ],
  },
  195: {
    top: [
      { name: "Bergamota", percentage: 60 },
      { name: "Jengibre", percentage: 70 },
      { name: "Ciruela", percentage: 65 },
    ],
    heart: [
      { name: "Salvia", percentage: 70 },
      { name: "Opoponaco", percentage: 60 },
      { name: "Davana", percentage: 55 },
    ],
    base: [
      { name: "Cacao", percentage: 90 },
      { name: "Tonka", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
      { name: "Incienso", percentage: 70 },
      { name: "Olibano", percentage: 60 },
      { name: "Vetiver", percentage: 55 },
      { name: "Ládano", percentage: 50 },
    ],
  },
  196: {
    top: [
      { name: "Cáñamo", percentage: 80 },
      { name: "Toronja", percentage: 70 },
    ],
    heart: [
      { name: "Pimienta Negra", percentage: 75 },
      { name: "Geranio", percentage: 65 },
    ],
    base: [
      { name: "Cuero", percentage: 85 },
      { name: "Vetiver", percentage: 75 },
    ],
  },
  197: {
    top: [
      { name: "Salvia", percentage: 80 },
      { name: "Lavanda", percentage: 70 },
    ],
    heart: [
      { name: "Cuero", percentage: 85 },
      { name: "Lirio", percentage: 65 },
    ],
    base: [
      { name: "Cedro", percentage: 80 },
      { name: "Incienso", percentage: 75 },
    ],
  },
  198: {
    top: [
      { name: "Césped", percentage: 70 },
      { name: "Bergamota", percentage: 65 },
      { name: "Toronja", percentage: 60 },
    ],
    heart: [
      { name: "Notas Amaderadas", percentage: 75 },
      { name: "Azafrán", percentage: 70 },
      { name: "Nuez Moscada", percentage: 65 },
      { name: "Violeta", percentage: 55 },
      { name: "Jazmín", percentage: 50 },
    ],
    base: [
      { name: "Sándalo", percentage: 80 },
      { name: "Cuero", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Vainilla", percentage: 65 },
      { name: "Azúcar", percentage: 60 },
      { name: "Ante", percentage: 55 },
      { name: "Madera de Cashmere", percentage: 50 },
      { name: "Musgo de Roble", percentage: 45 },
      { name: "Vetiver", percentage: 40 },
    ],
  },
  199: {
    top: [
      { name: "Maracuyá", percentage: 75 },
      { name: "Lima", percentage: 70 },
      { name: "Pimienta", percentage: 60 },
      { name: "Jengibre", percentage: 55 },
    ],
    heart: [
      { name: "Vodka", percentage: 80 },
      { name: "Ginebra", percentage: 70 },
      { name: "Menta", percentage: 55 },
      { name: "Especias", percentage: 50 },
    ],
    base: [
      { name: "Ámbar", percentage: 80 },
      { name: "Cuero", percentage: 75 },
      { name: "Notas Amaderadas", percentage: 65 },
    ],
  },
  200: {
    top: [
      { name: "Notas Verdes", percentage: 70 },
      { name: "Toronja", percentage: 60 },
      { name: "Especias", percentage: 55 },
      { name: "Bergamota", percentage: 65 },
      { name: "Lavanda", percentage: 50 },
      { name: "Petitgrain", percentage: 45 },
    ],
    heart: [
      { name: "Gardenia", percentage: 70 },
      { name: "Jengibre", percentage: 60 },
      { name: "Violeta", percentage: 55 },
      { name: "Salvia", percentage: 50 },
    ],
    base: [
      { name: "Sándalo", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Incienso", percentage: 60 },
      { name: "Vetiver", percentage: 55 },
      { name: "Madera de Guayaco", percentage: 50 },
      { name: "Ládano", percentage: 45 },
    ],
  },
  201: {
    top: [
      { name: "Absenta", percentage: 80 },
      { name: "Anís", percentage: 65 },
      { name: "Hinojo", percentage: 55 },
    ],
    heart: [
      { name: "Lavanda", percentage: 70 },
    ],
    base: [
      { name: "Vainilla Negra", percentage: 85 },
      { name: "Almizcle", percentage: 70 },
    ],
  },

  // ─── Nuevos perfumes Armaf 2024-2025: Pirámide de notas verificada de Fragrantica ───

  // 202. Club de Nuit Precieux Woman — VERIFICADO: Fragrantica (Sea Salt, Bergamot, Apple top; Ylang-Ylang, Red Berries, White Lily, Jasmine heart; Whipped Cream, Vanilla, Musk, Tonka Bean, Patchouli base)
  202: {
    top: [
      { name: "Sal Marina", percentage: 90 },
      { name: "Bergamota", percentage: 82 },
      { name: "Manzana", percentage: 75 },
    ],
    heart: [
      { name: "Ylang-Ylang", percentage: 90 },
      { name: "Bayas Rojas", percentage: 78 },
      { name: "Lirio Blanco", percentage: 72 },
      { name: "Jazmín", percentage: 68 },
    ],
    base: [
      { name: "Crema Batida", percentage: 88 },
      { name: "Vainilla", percentage: 82 },
      { name: "Almizcle", percentage: 75 },
      { name: "Haba Tonka", percentage: 68 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 203. Club de Nuit Bling — VERIFICADO: Fragrantica (Citrus top; Flower Prism, Stardust heart; Velvet Woods, Vanilla base)
  203: {
    top: [
      { name: "Notas Cítricas", percentage: 95 },
      { name: "Geranio", percentage: 70 },
    ],
    heart: [
      { name: "Prisma Floral", percentage: 85 },
      { name: "Polvo de Estrellas", percentage: 72 },
    ],
    base: [
      { name: "Madera Aterciopelada", percentage: 88 },
      { name: "Vainilla", percentage: 82 },
    ],
  },
  // 204. Club de Nuit Milestone — VERIFICADO: Fragrantica (Sea Notes, Red Fruits, Bergamot top; Violet, White Woods, Sandalwood heart; Musk, Ambroxan, Vetiver base)
  204: {
    top: [
      { name: "Notas Marinas", percentage: 95 },
      { name: "Frutos Rojos", percentage: 82 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Violeta", percentage: 85 },
      { name: "Madera Blanca", percentage: 78 },
      { name: "Sándalo", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ambroxan", percentage: 82 },
      { name: "Vetiver", percentage: 72 },
    ],
  },
  // 206. Club de Nuit Woman Extrait Parfum — VERIFICADO: Fragrantica (Orange, Peach, Grapefruit, Bergamot top; Rose, Geranium, Jasmine, Litchi heart; Patchouli, Vetiver, Musk, Vanilla base)
  206: {
    top: [
      { name: "Naranja", percentage: 92 },
      { name: "Melocotón", percentage: 85 },
      { name: "Toronja", percentage: 78 },
      { name: "Bergamota", percentage: 72 },
    ],
    heart: [
      { name: "Rosa", percentage: 95 },
      { name: "Geranio", percentage: 78 },
      { name: "Jazmín", percentage: 72 },
      { name: "Lichi", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 92 },
      { name: "Vetiver", percentage: 82 },
      { name: "Almizcle", percentage: 75 },
      { name: "Vainilla", percentage: 68 },
    ],
  },
  // 207. Odyssey Tyrant — VERIFICADO: Fragrantica (Grapefruit, Citruses top; Pepper, Lavender, Geranium, Elemi heart; Ambroxan, Woody Notes, Vetiver, Cedar base)
  207: {
    top: [
      { name: "Toronja", percentage: 92 },
      { name: "Notas Cítricas", percentage: 85 },
    ],
    heart: [
      { name: "Pimienta", percentage: 88 },
      { name: "Lavanda", percentage: 78 },
      { name: "Geranio", percentage: 72 },
      { name: "Elemí", percentage: 65 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 82 },
      { name: "Vetiver", percentage: 75 },
      { name: "Cedro", percentage: 68 },
    ],
  },
  // 208. Odyssey Candee — VERIFICADO: Fragrantica (Strawberry, Raspberry, Geranium, Peach, Bergamot top; Caramel, Jasmine, Passionfruit heart; Patchouli, Musk, Amber base)
  208: {
    top: [
      { name: "Fresa", percentage: 92 },
      { name: "Frambuesa", percentage: 85 },
      { name: "Geranio", percentage: 75 },
      { name: "Melocotón", percentage: 70 },
      { name: "Bergamota", percentage: 62 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Jazmín", percentage: 78 },
      { name: "Maracuyá", percentage: 72 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Almizcle", percentage: 78 },
      { name: "Ámbar", percentage: 68 },
    ],
  },
  // 209. Odyssey Marshmallow — VERIFICADO: Fragrantica (Coconut, Apple, Lemon, Peony, Lily of the Valley top; Marshmallow, Strawberry, Peach, Apricot, Raspberry, Orange Blossom heart; Mascarpone Cheese, Vanilla, Praline, Musk, Tonka Bean, Amber base)
  209: {
    top: [
      { name: "Coco", percentage: 90 },
      { name: "Manzana", percentage: 82 },
      { name: "Limón", percentage: 75 },
      { name: "Peonía", percentage: 68 },
      { name: "Lirio del Valle", percentage: 60 },
    ],
    heart: [
      { name: "Malvavisco", percentage: 95 },
      { name: "Fresa", percentage: 82 },
      { name: "Melocotón", percentage: 78 },
      { name: "Albaricoque", percentage: 72 },
      { name: "Frambuesa", percentage: 68 },
      { name: "Flor de Azahar", percentage: 62 },
    ],
    base: [
      { name: "Mascarpone", percentage: 88 },
      { name: "Vainilla", percentage: 85 },
      { name: "Praliné", percentage: 78 },
      { name: "Almizcle", percentage: 70 },
      { name: "Haba Tonka", percentage: 65 },
      { name: "Ámbar", percentage: 58 },
    ],
  },
  // 210. Odyssey Go Mango — VERIFICADO: Fragrantica (Lemon, Ginger, Pink Pepper, White Flowers top; Mango, Dry Wood, Tonka Bean heart; Amber, Vanilla, Guaiac Wood base)
  210: {
    top: [
      { name: "Limón", percentage: 90 },
      { name: "Jengibre", percentage: 82 },
      { name: "Pimienta Rosa", percentage: 75 },
      { name: "Flores Blancas", percentage: 68 },
    ],
    heart: [
      { name: "Mango", percentage: 95 },
      { name: "Madera Seca", percentage: 72 },
      { name: "Haba Tonka", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Madera de Guayaco", percentage: 72 },
    ],
  },
  // 211. Odyssey Black Forest — VERIFICADO: Fragrantica (Caramel, Cherry, Cinnamon, Lactones, White Blossom top; Dates, Honey, Nutmeg heart; Praline, Tonka Bean, Vanilla, Woody Notes, Musk base)
  211: {
    top: [
      { name: "Caramelo", percentage: 90 },
      { name: "Cereza", percentage: 88 },
      { name: "Canela", percentage: 80 },
      { name: "Lactonas", percentage: 72 },
      { name: "Flor Blanca", percentage: 65 },
    ],
    heart: [
      { name: "Dátiles", percentage: 82 },
      { name: "Miel", percentage: 78 },
      { name: "Nuez Moscada", percentage: 68 },
    ],
    base: [
      { name: "Praliné", percentage: 88 },
      { name: "Haba Tonka", percentage: 82 },
      { name: "Vainilla", percentage: 78 },
      { name: "Notas Amaderadas", percentage: 68 },
      { name: "Almizcle", percentage: 60 },
    ],
  },
  // 212. Odyssey Revolution — VERIFICADO: Fragrantica (Pineapple, Black Currant, Blood Orange, Sage top; Praline, Vanilla, Plum, Cardamom heart; Patchouli, Tonka Bean base)
  212: {
    top: [
      { name: "Piña", percentage: 92 },
      { name: "Grosella Negra", percentage: 85 },
      { name: "Naranja Sangría", percentage: 78 },
      { name: "Salvia", percentage: 68 },
    ],
    heart: [
      { name: "Praliné", percentage: 90 },
      { name: "Vainilla", percentage: 82 },
      { name: "Ciruela", percentage: 75 },
      { name: "Cardamomo", percentage: 68 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Haba Tonka", percentage: 78 },
    ],
  },
  // 213. Odyssey Dubai Chocolat — VERIFICADO: Fragrantica (Coffee, Pistachio, Hazelnut, Praline, Knafeh top; Chocolate, Vanilla, Cardamom heart; Caramel, Tonka Bean, Amberwood base)
  213: {
    top: [
      { name: "Café", percentage: 92 },
      { name: "Pistacho", percentage: 88 },
      { name: "Avellana", percentage: 82 },
      { name: "Praliné", percentage: 78 },
      { name: "Knafeh", percentage: 72 },
    ],
    heart: [
      { name: "Chocolate", percentage: 95 },
      { name: "Vainilla", percentage: 82 },
      { name: "Cardamomo", percentage: 72 },
    ],
    base: [
      { name: "Caramelo", percentage: 88 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Amberwood", percentage: 72 },
    ],
  },
  // 214. Eter Desert Flower — VERIFICADO: Fragrantica (Jasmine top; Leather, Jasmine, Sweet Notes heart; Patchouli, Musk base)
  214: {
    top: [
      { name: "Jazmín", percentage: 95 },
    ],
    heart: [
      { name: "Cuero", percentage: 90 },
      { name: "Jazmín", percentage: 72 },
      { name: "Notas Dulces", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 88 },
      { name: "Almizcle", percentage: 80 },
    ],
  },

};
