import Stripe from 'stripe';

// IMPORTANT: This uses your LIVE Stripe key - be careful!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

async function createStripeProductsLive() {
  try {
    console.log('⚠️  Creating products in LIVE MODE...');
    
    // Create the main product
    const product = await stripe.products.create({
      name: "Tom's Flight Club Premium",
      description: 'Get access to 9 daily flight deals from your home city, 3 hours before free members',
      metadata: {
        features: '9 daily deals,Early access (3 hours),Premium-only deals,Email alerts,Mobile app access',
      },
    });

    console.log('✅ Created product:', product.id);

    // Create prices for each billing interval
    
    // 3 Months Plan
    const price3Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 2397, // $23.97
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      nickname: '3 Months',
      metadata: {
        display_price: '$7.99/month',
        billing_description: '$23.97 billed quarterly',
      },
    });

    // 6 Months Plan
    const price6Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 3594, // $35.94
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
      nickname: '6 Months',
      metadata: {
        display_price: '$5.99/month',
        billing_description: '$35.94 billed every 6 months',
      },
    });

    // Yearly Plan (Most Popular)
    const priceYearly = await stripe.prices.create({
      product: product.id,
      unit_amount: 5999, // $59.99
      currency: 'usd',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      nickname: 'Yearly',
      metadata: {
        display_price: '$4.99/month',
        billing_description: '$59.99 billed annually',
        popular: 'true',
        best_value: 'true',
      },
    });

    console.log('\n✅ Created prices:');
    console.log('3 Months:', price3Months.id);
    console.log('6 Months:', price6Months.id);
    console.log('Yearly:', priceYearly.id);

    // Create payment links
    console.log('\n📋 Creating payment links...');

    const paymentLink3Months = await stripe.paymentLinks.create({
      line_items: [{
        price: price3Months.id,
        quantity: 1,
      }],
      metadata: {
        plan: '3_months',
      },
    });

    const paymentLink6Months = await stripe.paymentLinks.create({
      line_items: [{
        price: price6Months.id,
        quantity: 1,
      }],
      metadata: {
        plan: '6_months',
      },
    });

    const paymentLinkYearly = await stripe.paymentLinks.create({
      line_items: [{
        price: priceYearly.id,
        quantity: 1,
      }],
      metadata: {
        plan: 'yearly',
      },
    });

    console.log('\n✅ Payment links created!');
    console.log('\n📝 Add these to your .env.local file:');
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS=${paymentLink3Months.url}`);
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS=${paymentLink6Months.url}`);
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=${paymentLinkYearly.url}`);
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51J7sbeIw7dQ6dzj5JTJy7pwbr56xeKKjAoXaZXVyn78K73XI2cyylZvsviRzNHFXBeXKbA1H8p9QXGSEXXfAaJxA00dEwLMfNp`);
    
    console.log('\n⚠️  IMPORTANT: Remove your secret key from this script after running!');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
  }
}

// Run the script
createStripeProductsLive();