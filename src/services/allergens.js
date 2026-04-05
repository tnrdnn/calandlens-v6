/**
 * Alerjen listesi — her alerjen için çoklu dil anahtar kelimeleri
 * Öğün adlarında bu kelimeleri arar ve eşleşen alerjenleri döner.
 */
export const ALLERGENS = [
  {
    id: 'gluten',
    emoji: '🌾',
    color: '#f59e0b',
    keywords: {
      tr: ['buğday','un','ekmek','makarna','börek','pasta','kurabiye','bisküvi','kraker','simit','poğaça','pide','lavaş','tortilla','waffle','krep','pancake','bulgur','arpa','çavdar','yulaf','erişte','şehriye','gluten'],
      en: ['wheat','bread','pasta','flour','gluten','cracker','biscuit','cookie','cake','muffin','bagel','tortilla','waffle','pancake','barley','rye','oat','noodle','cereal','pretzel','croissant','donut'],
      es: ['trigo','pan','pasta','harina','gluten','galleta','bizcocho','torta','avena','cebada','centeno','fideos','cereal','croissant'],
      fr: ['blé','pain','pâtes','farine','gluten','biscuit','gâteau','avoine','orge','seigle','céréale','croissant','brioche'],
      de: ['weizen','brot','nudeln','mehl','gluten','keks','kuchen','hafer','gerste','roggen','müsli','brezel','brötchen'],
      ar: ['قمح','خبز','معكرونة','دقيق','غلوتين','شوفان','بسكويت','كعك','شعير','جاودار','حبوب'],
      ru: ['пшеница','хлеб','паста','мука','глютен','овёс','ячмень','рожь','печенье','торт','круасан','вафля'],
    },
  },
  {
    id: 'dairy',
    emoji: '🥛',
    color: '#3b82f6',
    keywords: {
      tr: ['süt','peynir','yoğurt','tereyağ','krema','ayran','kefir','kaşar','beyaz peynir','lor','muhallebi','dondurma','çikolata sütlü','laktoz'],
      en: ['milk','cheese','yogurt','butter','cream','dairy','ice cream','whey','lactose','mozzarella','cheddar','brie','custard','gelato','milkshake'],
      es: ['leche','queso','yogur','mantequilla','crema','helado','lácteo','lactosa','nata','mozzarella'],
      fr: ['lait','fromage','yaourt','beurre','crème','glace','lactose','mozzarella','chèvre'],
      de: ['milch','käse','joghurt','butter','sahne','eis','laktose','mozzarella','quark'],
      ar: ['حليب','جبن','زبادي','زبدة','كريمة','آيس كريم','لاكتوز','موزاريلا'],
      ru: ['молоко','сыр','йогурт','масло','сливки','мороженое','лактоза','кефир','творог'],
    },
  },
  {
    id: 'egg',
    emoji: '🥚',
    color: '#f97316',
    keywords: {
      tr: ['yumurta','omlet','mayonez','merenk','sufle'],
      en: ['egg','omelette','mayonnaise','meringue','souffle','custard','frittata','quiche'],
      es: ['huevo','tortilla','mayonesa','merengue','soufflé'],
      fr: ['oeuf','omelette','mayonnaise','meringue','soufflé','quiche'],
      de: ['ei','omelett','mayonnaise','baiser','soufflé','quiche'],
      ar: ['بيض','عجة','مايونيز','ميرانج','سوفليه'],
      ru: ['яйцо','омлет','майонез','безе','суфле'],
    },
  },
  {
    id: 'peanut',
    emoji: '🥜',
    color: '#a16207',
    keywords: {
      tr: ['fıstık','yer fıstığı','fıstık ezmesi','fıstıklı'],
      en: ['peanut','groundnut','peanut butter','satay'],
      es: ['maní','cacahuete','mantequilla de maní'],
      fr: ['cacahuète','arachide','beurre de cacahuète'],
      de: ['erdnuss','erdnussbutter'],
      ar: ['فول سوداني','زبدة الفول السوداني'],
      ru: ['арахис','арахисовое масло'],
    },
  },
  {
    id: 'treenut',
    emoji: '🌰',
    color: '#92400e',
    keywords: {
      tr: ['ceviz','badem','fındık','antep fıstığı','kaju','pekan','macadamia','çam fıstığı','kestane'],
      en: ['walnut','almond','hazelnut','pistachio','cashew','pecan','macadamia','pine nut','chestnut','nut'],
      es: ['nuez','almendra','avellana','pistacho','anacardo','castaña'],
      fr: ['noix','amande','noisette','pistache','cajou','châtaigne'],
      de: ['walnuss','mandel','haselnuss','pistazie','cashew','kastanie'],
      ar: ['جوز','لوز','بندق','فستق','كاجو','كستناء'],
      ru: ['грецкий орех','миндаль','фундук','фисташка','кешью','каштан'],
    },
  },
  {
    id: 'fish',
    emoji: '🐟',
    color: '#0891b2',
    keywords: {
      tr: ['balık','somon','ton','levrek','çipura','hamsi','sardalya','alabalık','morina','tilapia'],
      en: ['fish','salmon','tuna','bass','sardine','anchovy','trout','cod','tilapia','herring','mackerel'],
      es: ['pescado','salmón','atún','sardina','anchoa','trucha','bacalao','arenque'],
      fr: ['poisson','saumon','thon','sardine','anchois','truite','morue','hareng'],
      de: ['fisch','lachs','thunfisch','sardine','sardelle','forelle','kabeljau','hering'],
      ar: ['سمك','سلمون','تونة','سردين','أنشوجة','تروت','قد'],
      ru: ['рыба','лосось','тунец','сардина','анчоус','форель','треска','сельдь','скумбрия'],
    },
  },
  {
    id: 'shellfish',
    emoji: '🦐',
    color: '#e11d48',
    keywords: {
      tr: ['karides','midye','istiridye','ahtapot','kalamar','yengeç','ıstakoz','deniz ürünleri'],
      en: ['shrimp','prawn','mussel','oyster','octopus','squid','crab','lobster','scallop','seafood','clam'],
      es: ['camarón','mejillón','ostra','pulpo','calamar','cangrejo','langosta','marisco'],
      fr: ['crevette','moule','huître','pieuvre','calmar','crabe','homard','fruits de mer'],
      de: ['garnele','muschel','auster','oktopus','tintenfisch','krabbe','hummer','meeresfrüchte'],
      ar: ['روبيان','بلح البحر','محار','أخطبوط','حبار','سرطان البحر','جراد البحر','مأكولات بحرية'],
      ru: ['креветка','мидия','устрица','осьминог','кальмар','краб','омар','морепродукты'],
    },
  },
  {
    id: 'soy',
    emoji: '🫘',
    color: '#65a30d',
    keywords: {
      tr: ['soya','tofu','edamame','miso','tempeh','soya sütü','soya fasulyesi'],
      en: ['soy','soya','tofu','edamame','miso','tempeh','soy milk','soybean'],
      es: ['soja','tofu','edamame','miso','tempeh','leche de soja'],
      fr: ['soja','tofu','edamame','miso','tempeh','lait de soja'],
      de: ['soja','tofu','edamame','miso','tempeh','sojamilch'],
      ar: ['صويا','توفو','إيداماميه','ميسو','تيمبيه','حليب الصويا'],
      ru: ['соя','тофу','эдамаме','мисо','темпе','соевое молоко'],
    },
  },
];

/**
 * Bir öğün adında hangi alerjenlerin geçtiğini döner.
 * @param {string} mealName
 * @param {string} lang — dil kodu ('tr','en', ...)
 * @param {string[]} [userAllergens] — kullanıcının seçtiği alerjenler (boşsa hepsine bak)
 */
export function detectAllergens(mealName, lang = 'tr', userAllergens = null) {
  if (!mealName) return [];
  const name = mealName.toLowerCase();
  const active = userAllergens?.length ? ALLERGENS.filter(a => userAllergens.includes(a.id)) : ALLERGENS;
  return active.filter(a => {
    const words = a.keywords[lang] || a.keywords.en || [];
    return words.some(w => name.includes(w.toLowerCase()));
  });
}
