export type TimeOfDay = "Día" | "Tarde" | "Noche";
export type Climate = "Calor" | "Frío" | "Templado";
export type Occasion = "Casual" | "Formal" | "Romántico" | "Oficina";

export const PERFUME_OCCASIONS: Record<number, { time: TimeOfDay[]; climate: Climate[]; occasion: Occasion[] }> = {
  // ============================================================
  // CLUB DE NUIT LINE
  // ============================================================
  1: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Club de Nuit Intense Man — Cítrico, Amaderado (Aventus-style, extremely versatile)
  2: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Club de Nuit Intense Man LE — Cítrico, Amaderado (smoother LE version)
  3: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                       // Club de Nuit Woman — Frutal, Floral (fresh fruity floral)
  4: { time: ["Día"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                                // Club de Nuit White Imperiale — Cítrico, Amaderado (bright fresh citrus)
  115: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // Club de Nuit Iconic — Cítrico, Acuático (fresh aquatic citrus)
  116: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina", "Formal"] },           // Club de Nuit Sillage — Floral, Amaderado (SMW-style, elegant)
  117: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Formal", "Romántico"] },       // Club de Nuit Urban Man Elixir — Cítrico, Especiado (elixir concentration)
  118: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                     // Club de Nuit Urban Man — Cítrico, Amaderado (versatile fresh woody)
  119: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Club de Nuit Maleka — Floral, Dulce (sweet floral feminine)
  120: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Club de Nuit Untold — Floral, Ámbar (BR540-style amber floral)
  121: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Club de Nuit Precieux I — Ámbar, Dulce (rich amber sweet)

  // ============================================================
  // ODYSSEY LINE
  // ============================================================
  5: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                       // Odyssey Homme White Edition — Cítrico, Amaderado (fresh white edition)
  91: { time: ["Noche", "Tarde"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                               // Odyssey Aoud — Amaderado, Ahumado (smoky oud)
  104: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Romántico"] },                   // Odyssey Mandarine Sky — Cítrico, Dulce (sweet citrus)
  105: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                     // Odyssey Artisto — Especiado, Amaderado (spicy woody artistic)
  106: { time: ["Día"], climate: ["Calor"], occasion: ["Casual"] },                                                     // Odyssey Bahamas — Acuático, Frutal (tropical beach)
  107: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Odyssey Toffee Coffee — Dulce (pure gourmand coffee toffee)
  108: { time: ["Tarde"], climate: ["Templado"], occasion: ["Casual", "Oficina"] },                                     // Odyssey Spectra — Frutal, Amaderado (versatile fruity woody)
  109: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // Odyssey Aqua — Acuático, Cítrico (fresh aquatic)
  110: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Odyssey Homme — Amaderado, Ámbar (woody amber, warm)
  111: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Formal"] },                      // Odyssey Mandarin Sky Vintage — Cítrico, Amaderado (mature citrus woody)
  112: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Romántico", "Formal"] },                  // Odyssey Mandarin Sky Elixir — Cítrico, Dulce (elixir, richer)
  113: { time: ["Tarde"], climate: ["Templado"], occasion: ["Casual", "Oficina"] },                                     // Odyssey Mega — Cítrico, Especiado (citrus spicy versatile)
  114: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // Odyssey Limoni Fresh — Cítrico (pure fresh lemon)

  // ============================================================
  // SWEET/GOURMAND STANDALONES
  // ============================================================
  141: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Yum Yum — Dulce, Frutal (sweet fruity gourmand)
  143: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Bon Bon — Dulce, Floral (sweet floral gourmand)
  144: { time: ["Día", "Tarde"], climate: ["Calor"], occasion: ["Casual"] },                                            // Island Bliss — Frutal, Dulce (tropical fruity sweet)
  145: { time: ["Día"], climate: ["Calor"], occasion: ["Casual"] },                                                     // Island Breeze — Frutal, Floral (fresh fruity floral breeze)
  151: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                     // Eter Arabian — Cítrico, Amaderado (versatile citrus woody)

  // ============================================================
  // AMBER OUD LINE
  // ============================================================
  6: { time: ["Tarde", "Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                // Amber Oud Rouge — Ámbar, Amaderado (warm amber woody oriental)
  7: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                         // Amber Oud Gold — Ámbar, Dulce (rich amber sweet oriental)
  8: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                      // Amber Oud Carbon — Amaderado, Ahumado (dark smoky woody)
  9: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                    // Amber Oud White — Ámbar, Floral (amber floral, softer)
  154: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Amber Oud Aqua Dubai — Ámbar, Frutal (amber fruity, slightly fresh)

  // ============================================================
  // L'AVENTURE LINE
  // ============================================================
  10: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // L'Aventure — Cítrico, Amaderado (Aventus-style, very versatile)
  11: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // L'Aventure Woman — Floral, Frutal (fresh floral fruity)

  // ============================================================
  // BADE'E AL OUD LINE
  // ============================================================
  14: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Bade'e Al Oud Amethyst — Amaderado, Ámbar (Oud for Gloss-style)
  15: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Bade'e Al Oud Oud for Glory — Amaderado, Ahumado (intense smoky oud)
  16: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                                // Bade'e Al Oud Honor & Glory — Amaderado, Especiado (woody spicy regal)

  // ============================================================
  // ECLAIRE LINE
  // ============================================================
  18: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Eclaire Pistache — Dulce (pistachio gourmand)
  19: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                        // Eclaire Banoffi — Dulce (banoffee gourmand, very sweet)

  // ============================================================
  // LATAFA INDIVIDUAL FRAGRANCES
  // ============================================================
  20: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Mayar Natural Intense — Floral, Dulce (intense floral sweet)
  21: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Fakhar Black — Cítrico, Amaderado (Aventus-style, versatile)
  22: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Fakhar Rose — Floral, Dulce (rose sweet feminine)
  103: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                     // Qaed Al Fursan — Amaderado, Dulce (woody sweet)
  25: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                      // Qaed Al Fursan Untamed — Especiado, Amaderado (spicy woody, bolder)
  26: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal", "Romántico"] },         // Qaed Al Fursan Unlimited — Amaderado, Dulce (woody sweet)
  27: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Hayaati Florence — Floral, Dulce (floral sweet feminine)
  142: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Hayaati Gold Elixir — Dulce, Ámbar (sweet amber elixir, rich)
  146: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Hayaati — Dulce, Especiado (sweet spicy)
  147: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Hayaati Al Maleky — Especiado, Amaderado (spicy woody, royal)
  148: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                    // Vintage Radio — Amaderado, Ahumado (vintage smoky woody)
  149: { time: ["Tarde", "Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                              // Emeer — Amaderado, Especiado (TF Noir-style, elegant)
  28: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Nebras Elixir — Dulce, Ámbar (sweet amber elixir)
  29: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Asad Elixir — Especiado, Ámbar (spicy amber elixir, intense)
  30: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Ansaam Gold — Dulce, Ámbar (sweet amber gold)
  31: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // Ansaam Silver — Cítrico, Amaderado (fresh citrus woody)
  32: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Shaheen Gold — Cítrico, Amaderado (citrus woody, premium)
  33: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Shaheen Silver — Cítrico, Amaderado (citrus woody, fresh)
  34: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Hala — Floral, Dulce (floral sweet feminine)
  35: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Ishq Al Shuyukh Gold — Dulce, Ámbar (sweet amber oriental)
  36: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Ishq Al Shuyukh Silver — Dulce, Amaderado (sweet woody)
  37: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Ta'weel — Amaderado, Ámbar (woody amber oriental)
  38: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Teriaq Intense — Dulce, Amaderado (sweet woody intense)
  39: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Musamam White Intense — Cítrico, Amaderado (fresh citrus woody, versatile)
  40: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Victoria — Floral, Dulce (floral sweet feminine)
  41: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Art Of Universe — Amaderado, Ámbar (woody amber deep)
  42: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Vanilla Freak — Dulce (vanilla gourmand)
  43: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Berry On Top — Dulce, Frutal (berry gourmand)
  44: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                        // Choco Overdose — Dulce (chocolate gourmand, very heavy sweet)
  45: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Mallow Madness — Dulce (marshmallow gourmand)
  46: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Whipped Pleasure — Dulce (whipped cream gourmand)
  47: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // The Kingdom Woman — Floral, Ámbar (floral amber regal)
  48: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Casual"] },                      // The Kingdom Men — Amaderado, Especiado (woody spicy masculine)
  49: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Layaan — Floral, Dulce (floral sweet soft)
  50: { time: ["Tarde"], climate: ["Templado"], occasion: ["Casual", "Oficina"] },                                      // Efeef — Amaderado, Floral (woody floral balanced)
  51: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Al Noble Safeer — Amaderado, Ámbar (woody amber noble)
  52: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                                // Al Noble Ameer — Amaderado, Especiado (woody spicy dignified)
  53: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Al Noble Wazeer — Amaderado, Ámbar (woody amber ministerial)
  54: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Her Confession — Floral, Dulce (floral sweet feminine)
  55: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Casual"] },                      // His Confession — Amaderado, Especiado (woody spicy masculine)
  56: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Ajwaa — Dulce, Amaderado (sweet woody dates-inspired)
  57: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Sehr — Dulce, Ámbar (sweet amber enchanting)
  58: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Habik Woman — Floral, Dulce (floral sweet love)
  59: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Eternal Vanille — Dulce (vanilla gourmand eternal)
  60: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Casual"] },                      // Jassor — Amaderado, Especiado (woody spicy bold)
  61: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Dinasty — Floral, Dulce (floral sweet regal feminine)
  62: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Velvet Rose — Floral, Amaderado (rose woody elegant)
  63: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Petra — Floral, Dulce (floral sweet ancient rose city)
  64: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Atheeri — Amaderado, Ámbar (woody amber distinguished)
  65: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Sakeena — Floral, Dulce (floral sweet serene)
  66: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Emaan — Floral, Dulce (floral sweet faithful)
  67: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Qimmah — Floral, Dulce (floral sweet)
  68: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                     // Ameer Al Oudh Intense Oud — Amaderado, Ahumado (intense smoky oud)
  69: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                   // Maahir — Amaderado, Ámbar (woody amber classic)
  70: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                     // Maahir Black Edition — Amaderado, Ahumado (dark smoky woody)
  71: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                                // Maahir Legacy — Amaderado, Especiado (woody spicy legacy)
  72: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // Ramz Silver — Cítrico, Amaderado (fresh citrus woody)
  73: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Ramz Gold — Cítrico, Amaderado (citrus woody, warmer)
  74: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                           // Najdia — Cítrico, Acuático (fresh aquatic citrus, Sauvage-style)
  75: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina", "Formal"] },            // Suqraat — Cítrico, Amaderado (citrus woody elegant)

  // ============================================================
  // YARA LINE
  // ============================================================
  131: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Yara — Dulce, Floral (sweet floral feminine)
  132: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Yara Tous — Dulce, Floral (sweet floral, tutti-frutti)
  133: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Yara Moi — Dulce, Floral (sweet floral, intimate)

  // ============================================================
  // ASAD LINE
  // ============================================================
  134: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Asad — Especiado, Dulce (Sauvage Elixir-style, spicy sweet)
  135: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Asad Bourbon — Dulce, Amaderado (sweet woody bourbon, rich)
  136: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Asad Zanzibar — Especiado, Frutal (spicy fruity, exotic)

  // ============================================================
  // KHAMRAH LINE
  // ============================================================
  128: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Khamrah — Dulce, Especiado (Angels' Share-style, sweet spicy gourmand)
  129: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Khamrah Qwah — Dulce, Especiado (sweet spicy coffee gourmand)
  130: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Khamrah Dukhan — Ahumado, Dulce (smoky sweet, tobacco-ish)

  // ============================================================
  // OPULENT & TURATHI
  // ============================================================
  150: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Formal", "Romántico"] },                  // Opulent Dubai — Frutal, Amaderado (fruity woody opulent)
  152: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Turathi Electric — Frutal, Ámbar (fruity amber electric)
  153: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Turathi Blue — Amaderado, Ámbar (woody amber, Bvlgari-style)

  // ============================================================
  // SUPREMACY & OTHER LATAFA
  // ============================================================
  76: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Liquid Brun — Dulce, Amaderado (sweet woody brown)
  77: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                      // Aether — Cítrico, Amaderado (fresh citrus woody airy)
  78: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                   // Luscious — Dulce, Floral (sweet floral luscious)
  79: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Intense Addiction — Dulce, Ámbar (sweet amber intense addictive)
  80: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                     // Obsidian — Amaderado, Ahumado (dark woody smoky)
  81: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                        // Vulcan Feu — Especiado, Ámbar (spicy amber fiery)
  82: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Formal", "Romántico"] },                   // Supremacy Not Only Intense — Cítrico, Amaderado (intense citrus woody)
  83: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // Supremacy Silver — Cítrico, Amaderado (SMW-style, fresh elegant)
  84: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal"] },                                                     // Supremacy Incense — Ahumado, Amaderado (smoky incense woody)
  85: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // Supremacy In Heaven — Cítrico, Frutal (fresh citrus fruity, Aventus for Her)

  // ============================================================
  // 9PM / 9AM LINE
  // ============================================================
  86: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                            // 9PM Rebel — Dulce, Frutal (sweet fruity rebel night)
  87: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                            // 9PM Pour Femme — Dulce, Floral (sweet floral feminine night)
  137: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                           // 9PM — Dulce, Amaderado (sweet woody night classic)
  138: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // 9PM Nite Out — Dulce, Especiado (sweet spicy, party night)
  139: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // 9PM Elixir — Dulce, Ámbar (sweet amber elixir, richest 9PM)
  140: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // 9AM Dive — Cítrico, Acuático (fresh morning aquatic citrus)

  // ============================================================
  // RAVE LINE
  // ============================================================
  88: { time: ["Tarde", "Noche"], climate: ["Templado"], occasion: ["Casual"] },                                        // Rave Now — Cítrico, Amaderado (citrus woody party)
  89: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Rave Now Women — Floral, Dulce (floral sweet party)
  90: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual"] },                                         // Rave Rage — Dulce, Amaderado (sweet woody intense party)

  // ============================================================
  // MISC STANDALONE
  // ============================================================
  92: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                            // Baroque Rouge 540 — Dulce, Ámbar (BR540-style, iconic sweet amber)
  93: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                   // Cassius — Floral, Dulce (floral sweet elegant)
  94: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                                // The Tux — Amaderado, Especiado (woody spicy formal, tuxedo-style)
  95: { time: ["Día", "Tarde"], climate: ["Templado"], occasion: ["Casual", "Oficina"] },                               // Glacier Le Noir — Cítrico, Amaderado (citrus woody dark cool)
  96: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                      // Céleste — Cítrico, Floral (fresh citrus floral airy)
  97: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                        // Tobacco Touch — Ahumado, Dulce (smoky sweet tobacco)

  // ============================================================
  // NITRO LINE
  // ============================================================
  98: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                      // Nitro Pour Homme — Cítrico, Amaderado (citrus woody energetic)
  99: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                           // Nitro Blue — Cítrico, Acuático (fresh aquatic citrus)
  100: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual"] },                               // Nitro Red — Cítrico, Especiado (citrus spicy fiery)
  101: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                     // Nitro White — Cítrico, Amaderado (citrus woody clean)
  102: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                     // Nitro Platinum — Cítrico, Amaderado (citrus woody premium)

  // ============================================================
  // HAWAS LINE
  // ============================================================
  122: { time: ["Día", "Tarde"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                 // Hawas For Him — Acuático, Frutal (aquatic fruity, fresh masculine)
  123: { time: ["Día"], climate: ["Calor"], occasion: ["Casual"] },                                                     // Hawas Tropical — Frutal, Acuático (tropical aquatic fruity)
  124: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Hawas Fire — Especiado, Amaderado (spicy woody, warm)
  125: { time: ["Día"], climate: ["Calor"], occasion: ["Casual"] },                                                     // Hawas Malibu — Acuático, Frutal (beach aquatic fruity)
  126: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // Hawas Ice — Acuático, Cítrico (fresh icy aquatic citrus)
  127: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Hawas Elixir — Ámbar, Amaderado (amber woody elixir, richest Hawas)

  // ============================================================
  // COOL WATER LINE
  // ============================================================
  155: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Oficina"] },                     // Cool Water — Acuático, Amaderado (classic aquatic woody, fresh)
  156: { time: ["Día"], climate: ["Calor"], occasion: ["Casual", "Oficina"] },                                          // Cool Water Woman — Floral, Acuático (fresh floral aquatic feminine)
  157: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                     // Cool Water Intense — Ámbar, Cítrico (amber citrus intense, deeper)

  // ============================================================
  // GLACIER / SCEPTRE
  // ============================================================
  158: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Glacier Bella — Floral, Ámbar (floral amber feminine)
  167: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                               // Sceptre Malachite — Amaderado, Especiado (woody spicy, TF-style)

  // ============================================================
  // JEAN PAUL GAULTIER LINE
  // ============================================================
  159: { time: ["Noche", "Tarde"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Le Male Le Parfum — Especiado, Amaderado (spicy woody, rich Parfum)
  160: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                           // Le Beau Le Parfum — Dulce, Amaderado (sweet woody, coconut/tonka, richer)
  161: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Le Male Elixir — Dulce, Especiado (sweet spicy elixir, very sweet)
  162: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Casual", "Oficina"] },                     // Scandal Pour Homme — Cítrico, Amaderado (fresh citrus woody, versatile)
  163: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Le Beau — Dulce, Amaderado (sweet woody, tonka/coconut)
  164: { time: ["Noche", "Tarde"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Scandal — Dulce, Floral (honey sweet floral gourmand)
  165: { time: ["Noche", "Tarde"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Scandal Pour Homme Le Parfum — Especiado, Amaderado (spicy woody, Parfum)
  166: { time: ["Noche"], climate: ["Frío"], occasion: ["Casual", "Romántico"] },                                       // Scandal Le Parfum — Dulce, Floral (intense sweet floral)

  // ============================================================
  // KHADLAJ ISLAND LINE
  // ============================================================
  168: { time: ["Día"], climate: ["Calor"], occasion: ["Casual"] },                                                     // Island (Khadlaj) — Acuático, Frutal (aquatic fruity island)
  169: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual"] },                                // Island Dreams — Frutal, Dulce (fruity sweet dreamy)
  170: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Island Vanilla Dunes — Dulce, Amaderado (sweet woody vanilla)

  // ============================================================
  // ROME / BHARARA / VIKING / SHERIF
  // ============================================================
  176: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Rome Pour Homme — Especiado, Amaderado (spicy woody, Colonia-style)
  178: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                               // Bharara King — Especiado, Amaderado (spicy woody, kingly)
  180: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Bharara Queen — Floral, Dulce (floral sweet queenly)
  181: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Viking Rio — Frutal, Especiado (fruity spicy exotic)
  182: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Viking Dubai — Amaderado, Especiado (woody spicy, luxurious)
  183: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                               // Viking Cairo — Especiado, Amaderado (spicy woody, Oud-style)
  184: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Viking Kashmir — Ámbar, Amaderado (amber woody, warm rich)
  185: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal"] },                               // Sherif — Especiado, Amaderado (spicy woody, sheriff)

  // ============================================================
  // CAROLINA HERRERA — GOOD GIRL LINE
  // ============================================================
  186: { time: ["Noche", "Tarde"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico", "Casual"] },        // Good Girl — Floral, Dulce (almond, coffee, tuberose, tonka, cacao, vanilla — rich gourmand)
  187: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Good Girl Blush — Floral, Dulce (bergamot, almond, peony, ylang-ylang, vanilla — lighter)
  188: { time: ["Tarde", "Noche"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // Very Good Girl — Floral, Dulce (lychee, currant, rose, vanilla, vetiver — fruity floral)
  189: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Very Good Girl Elixir — Floral, Dulce (black cherry, almond, rose, tuberose, vanilla, cacao — richest)
  190: { time: ["Noche", "Tarde"], climate: ["Frío", "Templado"], occasion: ["Romántico", "Formal"] },                  // Good Girl Blush Elixir — Floral, Dulce (bergamota, mandarina, ylang-ylang, rosa, vainilla, pachulí — elixir)

  // ============================================================
  // CAROLINA HERRERA — LA BAMBA
  // ============================================================
  191: { time: ["Día", "Tarde"], climate: ["Calor", "Templado"], occasion: ["Casual", "Romántico"] },                   // La Bomba — Floral, Dulce (pitahaya, frangipani, peonía, vainilla, pachulí — tropical sweet)

  // ============================================================
  // CAROLINA HERRERA — BAD BOY LINE
  // ============================================================
  192: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                     // Bad Boy Cobalt PE — Amaderado, Especiado (lavanda, pimienta rosa, ciruela, geranio, cedro, vetiver, trufa, roble)
  193: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                  // Bad Boy — Especiado, Amaderado (pimienta blanca, bergamota, pimienta rosa, cedro, salvia, tonka, cacao)
  194: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Bad Boy Cobalt Elixir — Especiado, Amaderado (pimienta negra, salvia, trufa, amaderadas, vainilla, incienso — elixir)
  195: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Bad Boy Extreme — Especiado, Amaderado (bergamota, jengibre, ciruela, opoponaco, cacao, tonka, pachulí, incienso, vetiver — extreme)
  196: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Formal", "Romántico"] },                  // Bad Boy Le Parfum — Amaderado, Especiado (cáñamo, toronja, pimienta negra, geranio, cuero, vetiver — leather)
  197: { time: ["Noche"], climate: ["Frío"], occasion: ["Formal", "Romántico"] },                                       // Bad Boy Elixir — Amaderado, Especiado (salvia, lavanda, cuero, lirio, cedro, incienso — incense leather elixir)

  // ============================================================
  // CAROLINA HERRERA — CH MEN / 212 LINE
  // ============================================================
  198: { time: ["Tarde", "Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Formal"] },                     // CH Men — Amaderado, Especiado (césped, bergamota, toronja, cuero, vainilla, ante, ámbar, sándalo, vetiver — leather woody)
  199: { time: ["Noche", "Tarde"], climate: ["Templado", "Frío"], occasion: ["Casual", "Romántico"] },                  // 212 VIP Men — Especiado, Amaderado (maracuyá, lima, pimienta, jengibre, vodka, ginebra, menta, ámbar, cuero — party VIP)
  200: { time: ["Día", "Tarde"], climate: ["Templado", "Calor"], occasion: ["Oficina", "Casual"] },                     // 212 Men — Amaderado, Especiado (verdes, toronja, bergamota, lavanda, jengibre, violeta, gardenia, sándalo, incienso, vetiver — fresh spicy)
  201: { time: ["Noche"], climate: ["Frío", "Templado"], occasion: ["Casual", "Romántico"] },                           // 212 VIP Black — Especiado, Amaderado (absenta, anís, hinojo, lavanda, vainilla negra, almizcle — dark spicy VIP)
};

// ─── Exported arrays for filter UI ───
export const TIMES_OF_DAY: TimeOfDay[] = ["Día", "Tarde", "Noche"];
export const CLIMATES: Climate[] = ["Calor", "Frío", "Templado"];
export const OCCASIONS: Occasion[] = ["Casual", "Formal", "Romántico", "Oficina"];

// ─── Visual info for each filter option (emoji, colors) ───
export const TIME_INFO: Record<TimeOfDay, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
  Día: {
    emoji: "☀️",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  Tarde: {
    emoji: "🌤️",
    color: "text-orange-300",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  Noche: {
    emoji: "🌙",
    color: "text-indigo-300",
    bgColor: "bg-indigo-500/20",
    borderColor: "border-indigo-500/30",
  },
};

export const CLIMATE_INFO: Record<Climate, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
  Calor: {
    emoji: "🔥",
    color: "text-red-300",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
  Frío: {
    emoji: "❄️",
    color: "text-cyan-300",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
  },
  Templado: {
    emoji: "🍃",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
  },
};

export const OCCASION_INFO: Record<Occasion, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
  Casual: {
    emoji: "😎",
    color: "text-sky-300",
    bgColor: "bg-sky-500/20",
    borderColor: "border-sky-500/30",
  },
  Formal: {
    emoji: "👔",
    color: "text-violet-300",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/30",
  },
  Romántico: {
    emoji: "💕",
    color: "text-rose-300",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30",
  },
  Oficina: {
    emoji: "💼",
    color: "text-slate-300",
    bgColor: "bg-slate-500/20",
    borderColor: "border-slate-500/30",
  },
};
