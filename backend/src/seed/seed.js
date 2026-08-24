// Seeds the database with the real EcoPadi UK product catalog, supplied by
// the business. Every product here is a LIVE listing (is_placeholder = FALSE),
// including nutritional values pulled from the source document.
//
// PRICING NOTE: the source document did not include retail prices, so the
// pricePence values below are estimates based on typical UK specialty-
// grocery pricing. Review and adjust these from the admin dashboard
// (/admin) before going live — click "Edit" on any product to change price,
// stock, or description, and "Images" to upload real product photos.
//
// Running this script also removes any leftover placeholder/sample products
// from earlier testing, so it's safe to re-run at any time.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// Small helper so each product's nutrition block stays readable below.
// basis = the serving size the values are measured against (varies by
// product, matching how it's shown in the source document — e.g. some
// spices are only meaningfully measured per teaspoon, not per 100g).
function nutri(basis, pairs) {
  return { basis, items: pairs.map(([label, value]) => ({ label, value })) };
}

const PRODUCTS = [
  // --- Fats, Oils & Butters ---
  { sku: 'EP-FAT-001', name: 'Cold Pressed Coconut Oil', category: 'Fats, Oils & Butters', pricePence: 899,
    description: 'Raw, virgin coconut oil made from fresh mature kernels with no heat used in processing. Strong natural coconut aroma \u2014 ideal for skin, hair, and low-to-medium heat cooking.',
    nutrition: nutri('Per 100ml / 100g', [['Energy','884 kcal'],['Total Fat','100g'],['Saturated Fat','82-92g'],['Carbohydrate','0g'],['Protein','0g'],['Vitamin E','0.1-0.5mg']]) },
  { sku: 'EP-FAT-002', name: 'Refined Coconut Oil', category: 'Fats, Oils & Butters', pricePence: 699,
    description: 'Neutral-tasting coconut oil with a higher smoke point, perfect for frying, roasting, and everyday cooking where a strong coconut flavour isn\u2019t wanted.',
    nutrition: nutri('Per 100ml / 100g', [['Energy','884 kcal'],['Total Fat','100g'],['Saturated Fat','82-92g'],['Carbohydrate','0g'],['Protein','0g'],['Vitamin E','0.05-0.2mg']]) },
  { sku: 'EP-FAT-003', name: 'Red Palm Oil', category: 'Fats, Oils & Butters', pricePence: 799,
    description: 'Deep red-orange palm oil, rich in vitamin A and E. The essential base for stews, soups, and traditional West African cooking.',
    nutrition: nutri('Per 100ml / 100g (unrefined)', [['Energy','884 kcal'],['Total Fat','100g'],['Saturated Fat','49-52g'],['Vitamin A','15,000-30,000 IU'],['Vitamin E','50-80mg'],['Carbohydrate','0g']]) },
  { sku: 'EP-FAT-004', name: 'Unrefined Shea Butter', category: 'Fats, Oils & Butters', pricePence: 999,
    description: '100% pure, unrefined shea butter from West Africa. A rich, deep moisturiser for skin and hair, packed with vitamins A, E and F.',
    nutrition: null },

  // --- Heritage Botanicals ---
  { sku: 'EP-HB-001', name: 'Zobo Leaf (Dried Hibiscus)', category: 'Heritage Botanicals', pricePence: 450,
    description: 'Dried hibiscus calyces for brewing Nigeria\u2019s favourite ruby-red drink. Tart, cranberry-like flavour, naturally caffeine-free.',
    nutrition: nutri('Per 100g dried', [['Energy','324 kcal'],['Carbohydrate','72g'],['Dietary Fiber','24g'],['Protein','7.3g'],['Calcium','1200mg'],['Iron','8.9mg'],['Vitamin C','14mg']]) },
  { sku: 'EP-HB-002', name: 'Neem Leaf (Dried)', category: 'Heritage Botanicals', pricePence: 499,
    description: 'Dried neem leaves used traditionally for skin, hair, and wellness teas. Potent, bitter, and known as "the village pharmacy".',
    nutrition: nutri('Per 100g dried', [['Energy','280 kcal'],['Carbohydrate','50g'],['Dietary Fiber','20g'],['Protein','15g'],['Calcium','1500mg'],['Iron','25mg'],['Vitamin C','200mg']]) },
  { sku: 'EP-HB-003', name: 'Osu Seed', category: 'Heritage Botanicals', pricePence: 650,
    description: 'Traditional Hunteria umbellata seeds used in Igbo and Edo ceremonies and wellness tonics. Very bitter \u2014 used in small quantities.',
    nutrition: null },
  { sku: 'EP-HB-004', name: 'Soursop Leaf (Dried)', category: 'Heritage Botanicals', pricePence: 499,
    description: 'Dried soursop leaves for a calming evening herbal tea, popular across West Africa and the Caribbean.',
    nutrition: nutri('Per 100g dried', [['Energy','250-280 kcal'],['Carbohydrate','55g'],['Dietary Fiber','18g'],['Protein','8g'],['Calcium','800mg'],['Vitamin C','25mg']]) },
  { sku: 'EP-HB-005', name: 'Lemongrass Leaf (Dried)', category: 'Heritage Botanicals', pricePence: 399,
    description: 'Fragrant dried lemongrass for a refreshing citrus tea, also used to season soups and pepper soup.',
    nutrition: nutri('Per 100g dried', [['Energy','350 kcal'],['Carbohydrate','80g'],['Dietary Fiber','20g'],['Protein','6g'],['Calcium','400mg'],['Potassium','2200mg']]) },
  { sku: 'EP-HB-006', name: 'Bitter Cola', category: 'Heritage Botanicals', pricePence: 599,
    description: 'Garcinia kola nuts, chewed traditionally for natural alertness and used in West African hospitality ceremonies.',
    nutrition: nutri('Per 100g dried nuts', [['Energy','350-400 kcal'],['Total Fat','8-12g'],['Carbohydrate','55-60g'],['Dietary Fiber','12g'],['Protein','6-8g'],['Calcium','250mg']]) },
  { sku: 'EP-HB-007', name: 'Cola Nut', category: 'Heritage Botanicals', pricePence: 599,
    description: 'Fresh cola nuts, a symbol of welcome and unity in Nigerian ceremonies, with natural caffeine for focus.',
    nutrition: nutri('Per 100g fresh', [['Energy','150-180 kcal'],['Total Fat','0.5-1g'],['Carbohydrate','35-40g'],['Dietary Fiber','4g'],['Protein','2-3g'],['Caffeine','1.5-2.5g']]) },
  { sku: 'EP-HB-008', name: 'Ogbono (Ground)', category: 'Heritage Botanicals', pricePence: 699,
    description: 'Ground African bush mango seed \u2014 the natural thickener behind classic Nigerian ogbono soup.',
    nutrition: nutri('Per 100g ground', [['Energy','580-620 kcal'],['Total Fat','50-55g'],['Carbohydrate','15-20g'],['Dietary Fiber','8g'],['Protein','10-12g'],['Vitamin E','8mg']]) },
  { sku: 'EP-HB-009', name: 'Egusi (Ground Melon Seed)', category: 'Heritage Botanicals', pricePence: 599,
    description: 'Ground melon seeds, the protein-rich base of Nigeria\u2019s beloved egusi soup.',
    nutrition: nutri('Per 100g ground', [['Energy','560-590 kcal'],['Total Fat','45-50g'],['Carbohydrate','12-15g'],['Dietary Fiber','6g'],['Protein','28-30g'],['Magnesium','500mg']]) },
  { sku: 'EP-HB-010', name: 'Banga (Palm Fruit Extract)', category: 'Heritage Botanicals', pricePence: 799,
    description: 'Rich palm fruit extract, the authentic base for Niger Delta banga soup and banga rice.',
    nutrition: nutri('Per 100g extract', [['Energy','250-300 kcal'],['Total Fat','20-25g'],['Carbohydrate','15-18g'],['Dietary Fiber','3g'],['Protein','2-3g'],['Vitamin A','15,000 IU']]) },

  // --- Natural Sweeteners ---
  { sku: 'EP-SWT-001', name: 'Dried Dates', category: 'Natural Sweeteners', pricePence: 450,
    description: 'Naturally sweet dried dates, perfect as a snack, blended into smoothies, or used as a natural sugar substitute.',
    nutrition: nutri('Per 100g (4 Medjool dates)', [['Energy','277 kcal'],['Carbohydrate','75g'],['Dietary Fiber','7g'],['Sugars','63g'],['Protein','2g'],['Potassium','696mg']]) },
  { sku: 'EP-SWT-002', name: 'Raw Natural Honey', category: 'Natural Sweeteners', pricePence: 899,
    description: 'Pure raw wildflower honey, unfiltered and naturally antibacterial \u2014 a healthier alternative to refined sugar.',
    nutrition: nutri('Per 100g (7 tbsp)', [['Energy','304 kcal'],['Carbohydrate','82g'],['Sugars','82g'],['Protein','0.3g'],['Total Fat','0g']]) },

  // --- Snacks & Dry Foods ---
  { sku: 'EP-SNK-001', name: 'Tiger Nut (Aya)', category: 'Snacks & Dry Foods', pricePence: 550,
    description: 'Dried tiger nut tubers for snacking or blending into Kunnu Aya, Nigeria\u2019s creamy plant-based milk.',
    nutrition: nutri('Per 100g dried', [['Energy','450-500 kcal'],['Total Fat','20-25g'],['Carbohydrate','60-65g'],['Dietary Fiber','10-12g'],['Protein','5-6g'],['Potassium','730mg']]) },
  { sku: 'EP-SNK-002', name: 'Cashew Nut', category: 'Snacks & Dry Foods', pricePence: 750,
    description: 'Whole raw cashew nuts, buttery and rich in healthy fats \u2014 great for snacking, milk, or cooking.',
    nutrition: nutri('Per 100g raw (18-20 nuts)', [['Energy','553 kcal'],['Total Fat','44g'],['Carbohydrate','30g'],['Dietary Fiber','3.3g'],['Protein','18g'],['Magnesium','292mg']]) },
  { sku: 'EP-SNK-003', name: 'Peanut (Groundnut)', category: 'Snacks & Dry Foods', pricePence: 450,
    description: 'Raw or roasted groundnuts, West Africa\u2019s everyday protein snack and the base of groundnut soup.',
    nutrition: nutri('Per 100g raw (28-30 nuts)', [['Energy','567 kcal'],['Total Fat','49g'],['Carbohydrate','16g'],['Dietary Fiber','8.5g'],['Protein','26g'],['Folate','240mcg']]) },
  { sku: 'EP-SNK-004', name: 'Snail Snack (Igbin Crisps)', category: 'Snacks & Dry Foods', pricePence: 699,
    description: 'Slow-cooked, lightly spiced snail meat crisps \u2014 a savoury, high-protein West African delicacy snack.',
    nutrition: nutri('Per 100g dried/roasted', [['Energy','90-110 kcal'],['Total Fat','2-3g'],['Carbohydrate','2-4g'],['Protein','15-18g'],['Calcium','170mg']]) },
  { sku: 'EP-SNK-005', name: 'Plantain Chips', category: 'Snacks & Dry Foods', pricePence: 350,
    description: 'Crispy fried plantain slices, available salted, sweet, or spiced.',
    nutrition: nutri('Per 100g fried', [['Energy','520-560 kcal'],['Total Fat','28-32g'],['Carbohydrate','60-65g'],['Dietary Fiber','4-5g'],['Protein','3-4g'],['Sodium','300-600mg']]) },
  { sku: 'EP-SNK-006', name: 'Whole Banana Chips', category: 'Snacks & Dry Foods', pricePence: 350,
    description: 'Thick-cut crispy banana chips, lightly salted for a crunchy gluten-free snack.',
    nutrition: nutri('Per 100g baked/dehydrated', [['Energy','340-360 kcal'],['Total Fat','1-2g'],['Carbohydrate','88g'],['Dietary Fiber','7g'],['Sugars','42g'],['Protein','3.5g']]) },
  { sku: 'EP-SNK-007', name: 'Cocoyam Flakes', category: 'Snacks & Dry Foods', pricePence: 599,
    description: 'Quick-cooking dried cocoyam flakes for fufu or a hearty cocoyam porridge.',
    nutrition: nutri('Per 100g dried', [['Energy','340-380 kcal'],['Total Fat','0.5-1g'],['Carbohydrate','80-85g'],['Dietary Fiber','4-5g'],['Protein','5-6g'],['Potassium','650mg']]) },
  { sku: 'EP-SNK-008', name: 'Garri (Cassava Granules)', category: 'Snacks & Dry Foods', pricePence: 499,
    description: 'Fermented, roasted cassava granules \u2014 a Nigerian pantry staple for eba and garri soakings. White or Yellow.',
    nutrition: nutri('Per 100g dry (White Garri)', [['Energy','360 kcal'],['Total Fat','0.5g'],['Carbohydrate','85g'],['Dietary Fiber','2g'],['Protein','1-2g'],['Vitamin C','20mg']]) },
  { sku: 'EP-SNK-009', name: 'Amala Flour', category: 'Snacks & Dry Foods', pricePence: 550,
    description: 'Dried yam, plantain, or cassava flour for making smooth amala, the classic Yoruba swallow.',
    nutrition: nutri('Per 100g dry (Yam Flour)', [['Energy','350 kcal'],['Carbohydrate','82g'],['Protein','4g']]) },
  { sku: 'EP-SNK-010', name: 'Beans Flour', category: 'Snacks & Dry Foods', pricePence: 499,
    description: 'Milled brown beans flour for quick moi moi, akara, and gbegiri soup \u2014 no soaking needed.',
    nutrition: nutri('Per 100g dry (3/4 cup)', [['Energy','340-350 kcal'],['Total Fat','1.5g'],['Carbohydrate','60g'],['Dietary Fiber','15g'],['Protein','22-24g'],['Folate','450mcg']]) },

  // --- Protein ---
  { sku: 'EP-PRO-001', name: 'Crayfish (Ground)', category: 'Protein', pricePence: 699,
    description: 'Dried, finely ground crayfish \u2014 a concentrated umami seasoning for soups and stews.',
    nutrition: nutri('Per 100g dried (1 cup whole)', [['Energy','300-320 kcal'],['Total Fat','3-4g'],['Carbohydrate','2g'],['Protein','60-65g'],['Calcium','2200mg']]) },
  { sku: 'EP-PRO-002', name: 'Bonga Fish (Deboned)', category: 'Protein', pricePence: 799,
    description: 'Smoked, deboned bonga fish flakes, ready to add straight into soups and stews.',
    nutrition: nutri('Per 100g dried/smoked (2-3 fish)', [['Energy','280-320 kcal'],['Total Fat','8-12g'],['Carbohydrate','0g'],['Protein','50-55g'],['Omega-3','1.5-2g']]) },
  { sku: 'EP-PRO-003', name: 'Kilishi (Spiced Beef Jerky)', category: 'Protein', pricePence: 999,
    description: 'Northern Nigerian spiced beef jerky, coated in a peppery peanut spice blend and sun-dried.',
    nutrition: nutri('Per 100g (6-8 pieces)', [['Energy','380-450 kcal'],['Total Fat','15-20g'],['Carbohydrate','10-15g'],['Dietary Fiber','2g'],['Protein','45-55g'],['Sodium','900-1400mg']]) },
  { sku: 'EP-PRO-004', name: 'Danbo Nama (Dried Shredded Beef)', category: 'Protein', pricePence: 899,
    description: 'Sun-dried shredded beef, traditionally prepared using the Fulani/Hausa method \u2014 a lean protein staple.',
    nutrition: null },
  { sku: 'EP-PRO-005', name: 'Stock Fish (Cod)', category: 'Protein', pricePence: 1499,
    description: 'Air-dried Norwegian cod, the classic protein base for Nigerian soups like ofe owerri and banga.',
    nutrition: nutri('Per 100g dry (1-2 pieces)', [['Energy','290-310 kcal'],['Total Fat','0.5-1g'],['Carbohydrate','0g'],['Protein','75-80g'],['Calcium','350mg']]) },
  { sku: 'EP-PRO-006', name: 'Catfish (Smoked)', category: 'Protein', pricePence: 1199,
    description: 'Whole smoked catfish with a deep, savoury flavour \u2014 perfect for pepper soup and stews.',
    nutrition: nutri('Per 100g smoked/dried', [['Energy','280-320 kcal'],['Total Fat','10-14g'],['Carbohydrate','0g'],['Protein','45-50g'],['Omega-3','0.5g']]) },
  { sku: 'EP-PRO-007', name: 'Periwinkle (Dried)', category: 'Protein', pricePence: 799,
    description: 'Dried periwinkle meat for authentic Niger Delta flavour in afang, banga, and okra soups.',
    nutrition: nutri('Per 100g raw deshelled', [['Energy','90-110 kcal'],['Total Fat','1-1.5g'],['Carbohydrate','5-7g'],['Protein','15-18g'],['Iron','3.5mg']]) },
  { sku: 'EP-PRO-008', name: 'Snail (Dried)', category: 'Protein', pricePence: 1299,
    description: 'Dried giant African land snail, a premium protein for pepper soup and special-occasion dishes.',
    nutrition: nutri('Per 100g raw', [['Energy','80-90 kcal'],['Total Fat','0.5-1g'],['Carbohydrate','2-3g'],['Protein','16-18g'],['Iron','4-5mg']]) },
  { sku: 'EP-PRO-009', name: 'Goat Meat (Dried)', category: 'Protein', pricePence: 1399,
    description: 'Sun-dried lean goat meat strips \u2014 rehydrate for pepper soup, stews, and jollof rice.',
    nutrition: nutri('Per 100g raw lean', [['Energy','120-140 kcal'],['Total Fat','2.5-4g'],['Carbohydrate','0g'],['Protein','22-24g'],['Iron','2.5-3mg']]) },

  // --- Bush Meat ---
  { sku: 'EP-BM-001', name: 'Antelope (Dried)', category: 'Bush Meat', pricePence: 1699,
    description: 'Traditionally smoked antelope meat, lean and deeply flavoured \u2014 sourced from licensed suppliers only.',
    nutrition: nutri('Per 100g raw lean', [['Energy','110-130 kcal'],['Total Fat','1.5-3g'],['Carbohydrate','0g'],['Protein','23-25g'],['Iron','3-4mg']]) },
  { sku: 'EP-BM-002', name: 'Porcupine (Dried)', category: 'Bush Meat', pricePence: 1899,
    description: 'Smoked porcupine meat, a prized West African delicacy for pepper soup and slow-cooked stews.',
    nutrition: nutri('Per 100g raw lean', [['Energy','130-150 kcal'],['Total Fat','3-5g'],['Carbohydrate','0g'],['Protein','23-25g'],['Iron','3-3.5mg']]) },
  { sku: 'EP-BM-003', name: 'Wild Boar (Dried)', category: 'Bush Meat', pricePence: 1799,
    description: 'Smoked wild boar meat with a rich, gamey flavour \u2014 best in slow-cooked soups and stews.',
    nutrition: nutri('Per 100g raw lean', [['Energy','140-160 kcal'],['Total Fat','3-5g'],['Carbohydrate','0g'],['Protein','22-24g'],['Iron','2-2.5mg']]) },

  // --- Spices & Seasonings ---
  { sku: 'EP-SPC-001', name: 'Scotch Bonnet Pepper (Ground)', category: 'Spices & Seasonings', pricePence: 450,
    description: 'Fiery ground scotch bonnet pepper for instant heat and fruity aroma in any dish.',
    nutrition: nutri('Per 100g raw (8-10 peppers)', [['Energy','40-45 kcal'],['Carbohydrate','9g'],['Dietary Fiber','1.5g'],['Protein','1.8g'],['Vitamin C','242mg']]) },
  { sku: 'EP-SPC-002', name: 'Ginger (Ground)', category: 'Spices & Seasonings', pricePence: 399,
    description: 'Warm, aromatic ground ginger for pepper soup, stews, tea, and baking.',
    nutrition: nutri('Per 100g fresh root', [['Energy','80 kcal'],['Carbohydrate','18g'],['Dietary Fiber','2g'],['Protein','1.8g'],['Potassium','415mg']]) },
  { sku: 'EP-SPC-003', name: 'Banga Soup Spice', category: 'Spices & Seasonings', pricePence: 499,
    description: 'All-in-one traditional spice blend for authentic Niger Delta banga soup.',
    nutrition: nutri('Per 10g (about 2 tsp)', [['Energy','25-30 kcal'],['Total Fat','1.5-2g'],['Carbohydrate','3g'],['Dietary Fiber','1g'],['Protein','0.8g'],['Iron','1.2mg']]) },
  { sku: 'EP-SPC-004', name: 'Pepper Soup Spice', category: 'Spices & Seasonings', pricePence: 499,
    description: 'Aromatic blend of ehuru, uziza, uda, and more \u2014 everything you need for classic Nigerian pepper soup.',
    nutrition: nutri('Per 5g (about 1 tsp)', [['Energy','12-15 kcal'],['Total Fat','0.5g'],['Carbohydrate','2.5g'],['Dietary Fiber','1g'],['Protein','0.4g']]) },
  { sku: 'EP-SPC-005', name: 'Sea Salt', category: 'Spices & Seasonings', pricePence: 299,
    description: 'Pure, natural sea salt with no additives or iodine \u2014 for everyday cooking and preserving.',
    nutrition: nutri('Per 100g', [['Energy','0 kcal'],['Sodium','38,000mg'],['Chloride','59,000mg'],['Calcium','150-500mg']]) },
  { sku: 'EP-SPC-006', name: 'Yaji (Suya Spice Blend)', category: 'Spices & Seasonings', pricePence: 499,
    description: 'Smoky, peanut-based suya spice blend for grilling meat, plantain, and more.',
    nutrition: nutri('Per 10g (about 2 tsp)', [['Energy','55-65 kcal'],['Total Fat','3-4g'],['Carbohydrate','5g'],['Dietary Fiber','1.5g'],['Protein','2-2.5g'],['Sodium','300-600mg']]) },
  { sku: 'EP-SPC-007', name: 'Cloves (Whole)', category: 'Spices & Seasonings', pricePence: 399,
    description: 'Whole dried cloves for warming flavour in rice, tea, and spice blends.',
    nutrition: nutri('Per 100g', [['Energy','274 kcal'],['Total Fat','13g'],['Carbohydrate','65g'],['Dietary Fiber','33g'],['Protein','6g'],['Manganese','60mg (3000% DV)']]) },
  { sku: 'EP-SPC-008', name: 'Garlic (Powder)', category: 'Spices & Seasonings', pricePence: 350,
    description: 'Dehydrated garlic powder \u2014 an instant flavour base for stews, soups, and marinades.',
    nutrition: nutri('Per 100g raw (20-30 cloves)', [['Energy','149 kcal'],['Carbohydrate','33g'],['Dietary Fiber','2.1g'],['Protein','6.4g'],['Vitamin B6','1.2mg'],['Manganese','1.7mg']]) },
  { sku: 'EP-SPC-009', name: 'Locust Beans (Iru/Dawadawa)', category: 'Spices & Seasonings', pricePence: 599,
    description: 'Fermented locust beans with deep umami flavour, essential for ewedu and traditional soups.',
    nutrition: nutri('Per 100g fermented', [['Energy','250-280 kcal'],['Total Fat','15-18g'],['Carbohydrate','20g'],['Dietary Fiber','8g'],['Protein','16-20g'],['Iron','4mg']]) },
  { sku: 'EP-SPC-010', name: 'Uda Spice (Negro Pepper)', category: 'Spices & Seasonings', pricePence: 450,
    description: 'Aromatic dried negro pepper pods for banga soup, pepper soup, and wellness tea.',
    nutrition: nutri('Per 5g (approx. 1 pod)', [['Energy','18 kcal'],['Carbohydrate','3.8g'],['Protein','0.4g'],['Total Fat','0.5g'],['Dietary Fiber','1.2g']]) },
  { sku: 'EP-SPC-011', name: 'Uziza Leaf (Dried)', category: 'Spices & Seasonings', pricePence: 450,
    description: 'Dried, peppery uziza leaves for adding sharp aromatic heat to soups.',
    nutrition: nutri('Per 100g dried', [['Energy','280 kcal'],['Carbohydrate','45g'],['Dietary Fiber','20g'],['Protein','10g'],['Calcium','650mg'],['Iron','18mg']]) },
  { sku: 'EP-SPC-012', name: 'Uziza Seed', category: 'Spices & Seasonings', pricePence: 499,
    description: 'Dried uziza seeds, a peppery spice for pepper soup and traditional stews.',
    nutrition: nutri('Per 100g dried', [['Energy','380 kcal'],['Total Fat','18g'],['Carbohydrate','40g'],['Dietary Fiber','22g'],['Protein','12g'],['Iron','15mg']]) },
  { sku: 'EP-SPC-013', name: 'Achi (Ground)', category: 'Spices & Seasonings', pricePence: 599,
    description: 'Ground achi seed powder, a smooth natural soup thickener popular in Igbo cuisine.',
    nutrition: nutri('Per 100g ground', [['Energy','340 kcal'],['Total Fat','6g'],['Carbohydrate','62g'],['Dietary Fiber','12g'],['Protein','16g'],['Iron','5.2mg']]) },
  { sku: 'EP-SPC-014', name: 'Scent Leaf (Dried)', category: 'Spices & Seasonings', pricePence: 399,
    description: 'Dried African basil (scent leaf), aromatic and peppery \u2014 used in pepper soup and stews.',
    nutrition: nutri('Per 100g dried', [['Energy','260 kcal'],['Carbohydrate','40g'],['Dietary Fiber','18g'],['Protein','12g'],['Calcium','1200mg'],['Iron','20mg']]) },

  // --- Hair & Beauty ---
  { sku: 'EP-HAIR-001', name: 'Hair Extensions', category: 'Hair & Beauty', pricePence: 2499,
    description: 'Premium quality hair extensions in a range of textures and lengths. Choose your preferred type from the dropdown on this page.',
    nutrition: null,
    variants: [
      { name: 'Type', value: 'Straight 18-inch', priceDeltaPence: 0 },
      { name: 'Type', value: 'Curly 20-inch', priceDeltaPence: 500 },
      { name: 'Type', value: 'Wavy 22-inch', priceDeltaPence: 800 },
    ] },

  // --- Fresh Produce ---
  { sku: 'EP-PRD-001', name: 'Whole Pineapple', category: 'Fresh Produce', pricePence: 399,
    description: 'Fresh, ripe whole pineapple, sweet and juicy \u2014 ready to slice, juice, or grill.',
    nutrition: nutri('Per whole fruit (900g edible)', [['Energy','450 kcal'],['Carbohydrate','117g'],['Dietary Fiber','12g'],['Sugars','90g'],['Protein','5g'],['Vitamin C','470mg (522% DV)']]) },
  { sku: 'EP-PRD-002', name: 'Whole Soursop', category: 'Fresh Produce', pricePence: 699,
    description: 'Fresh whole soursop with creamy, tangy white flesh \u2014 ideal for juice, smoothies, and desserts.',
    nutrition: nutri('Per whole fruit (1.75kg edible)', [['Energy','1,015 kcal'],['Carbohydrate','260g'],['Dietary Fiber','28g'],['Sugars','220g'],['Protein','9g'],['Vitamin C','175mg']]) },
  { sku: 'EP-PRD-003', name: 'Whole Banana / Plantain', category: 'Fresh Produce', pricePence: 350,
    description: 'Fresh whole bananas and plantains, organically farmed and ready for snacking or cooking.',
    nutrition: nutri('Per medium fruit (101g edible)', [['Energy','105 kcal'],['Carbohydrate','27g'],['Dietary Fiber','3.1g'],['Sugars','14g'],['Protein','1.3g'],['Potassium','422mg']]) },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('Removing any leftover placeholder/sample products...');
  const removed = await pool.query('DELETE FROM products WHERE is_placeholder = TRUE RETURNING name');
  console.log(`  - removed ${removed.rows.length} placeholder product(s)`);

  console.log('Seeding the real EcoPadi product catalog...');
  for (const p of PRODUCTS) {
    const nutritionJson = JSON.stringify(p.nutrition);
    const existing = await pool.query('SELECT id FROM products WHERE sku = $1', [p.sku]);
    if (existing.rows.length) {
      // Product already exists (e.g. re-running seed) — refresh its details
      // without touching stock, images, or is_placeholder status.
      await pool.query(
        `UPDATE products SET name=$1, category=$2, description=$3, price_pence=$4, nutrition=$5 WHERE sku=$6`,
        [p.name, p.category, p.description, p.pricePence, nutritionJson, p.sku]
      );
      console.log(`  ~ ${p.name} already exists, refreshed details`);
      continue;
    }
    const insertResult = await pool.query(
      `INSERT INTO products (sku, name, slug, category, description, price_pence, stock_qty, is_placeholder, nutrition)
       VALUES ($1,$2,$3,$4,$5,$6,50,FALSE,$7) RETURNING id`,
      [p.sku, p.name, slugify(p.name), p.category, p.description, p.pricePence, nutritionJson]
    );
    if (p.variants?.length) {
      const productId = insertResult.rows[0].id;
      for (const v of p.variants) {
        await pool.query(
          `INSERT INTO product_variants (product_id, name, value, price_delta_pence) VALUES ($1,$2,$3,$4)`,
          [productId, v.name, v.value, v.priceDeltaPence || 0]
        );
      }
    }
    console.log(`  + ${p.name}`);
  }

  // Sample discount code
  const promoExists = await pool.query('SELECT id FROM discount_codes WHERE code = $1', ['WELCOME10']);
  if (!promoExists.rows.length) {
    await pool.query(
      `INSERT INTO discount_codes (code, type, value, min_spend_pence, active) VALUES ('WELCOME10','percent',10,0,TRUE)`
    );
    console.log('  + Discount code WELCOME10 (10% off)');
  }

  // Admin account — CHANGE THIS PASSWORD after first login.
  const adminEmail = 'admin@ecopadi.co.uk';
  const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (!adminExists.rows.length) {
    const hash = await bcrypt.hash('ChangeMe123!', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,'EcoPadi Admin','admin')`,
      [adminEmail, hash]
    );
    console.log(`  + Admin account created: ${adminEmail} / ChangeMe123!  (change this password immediately)`);
  }

  console.log(`✓ Seed complete — ${PRODUCTS.length} live products in the catalog.`);
  console.log('  Reminder: prices were estimated. Review them at /admin before going live.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
