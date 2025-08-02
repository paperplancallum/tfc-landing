import Stripe from 'stripe';

// This script creates EUR prices for Tom's Flight Club
// Run with: STRIPE_SECRET_KEY="sk_test_..." npx tsx scripts/create-stripe-prices-eur.ts
// Or for live: STRIPE_SECRET_KEY="sk_live_..." npx tsx scripts/create-stripe-prices-eur.ts

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ Please provide STRIPE_SECRET_KEY environment variable');
  console.error('   Run: STRIPE_SECRET_KEY="sk_test_..." npx tsx scripts/create-stripe-prices-eur.ts');
  process.exit(1);
}

const isTestMode = stripeKey.startsWith('sk_test_');
console.log(`🔧 Running in ${isTestMode ? 'TEST' : 'LIVE'} mode`);

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
});

async function createEURPrices() {
  try {
    console.log('💶 Creating EUR prices...');
    
    // Find the existing product
    const products = await stripe.products.list({
      limit: 100,
    });
    
    const product = products.data.find(p => p.name === "Tom's Flight Club Premium");
    
    if (!product) {
      console.error('❌ Product "Tom\'s Flight Club Premium" not found');
      console.error('   Please create the product first using create-stripe-products script');
      process.exit(1);
    }

    console.log('✅ Found product:', product.id);

    // Check if EUR prices already exist
    const existingPrices = await stripe.prices.list({
      product: product.id,
      currency: 'eur',
      limit: 100,
    });

    if (existingPrices.data.length > 0) {
      console.log('⚠️  EUR prices already exist for this product:');
      existingPrices.data.forEach(price => {
        console.log(`   - ${price.nickname}: ${price.id}`);
      });
      console.log('\n⚠️  Skipping creation to avoid duplicates.');
      console.log('   If you want to create new prices, archive the existing ones first.');
      return;
    }

    // Create EUR prices
    
    // 3 Months Plan - €26.97 total (€8.99/month)
    const price3Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 2697, // €26.97
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      nickname: '3 Months (EUR)',
      metadata: {
        display_price: '€8.99/month',
        billing_description: '€26.97 billed quarterly',
        currency_code: 'EUR',
      },
    });

    // 6 Months Plan - €41.94 total (€6.99/month)
    const price6Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 4194, // €41.94
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
      nickname: '6 Months (EUR)',
      metadata: {
        display_price: '€6.99/month',
        billing_description: '€41.94 billed every 6 months',
        savings: 'Save 22%',
        currency_code: 'EUR',
      },
    });

    // Yearly Plan - €65.88 total (€5.49/month)
    const priceYearly = await stripe.prices.create({
      product: product.id,
      unit_amount: 6588, // €65.88
      currency: 'eur',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      nickname: 'Yearly (EUR)',
      metadata: {
        display_price: '€5.49/month',
        billing_description: '€65.88 billed annually',
        popular: 'true',
        best_value: 'true',
        savings: 'Save 39%',
        currency_code: 'EUR',
      },
    });

    console.log('\n✅ Created EUR prices:');
    console.log('3 Months:', price3Months.id);
    console.log('6 Months:', price6Months.id);
    console.log('Yearly:', priceYearly.id);

    const envPrefix = isTestMode ? 'TEST' : 'LIVE';
    console.log('\n📝 Add these to your .env.local file:');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_3MO_EUR_${envPrefix}=${price3Months.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_6MO_EUR_${envPrefix}=${price6Months.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ID_YEAR_EUR_${envPrefix}=${priceYearly.id}`);
    
    console.log('\n💡 Next steps:');
    console.log('1. Add these price IDs to your .env.local');
    console.log('2. Add them to Vercel environment variables');
    console.log('3. Update your application to support currency selection');

  } catch (error) {
    console.error('❌ Error creating EUR prices:', error);
  }
}

// Run the script
createEURPrices();