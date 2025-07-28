import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-28.acacia',
});

async function createStripeProducts() {
  try {
    // Create the main product
    const product = await stripe.products.create({
      name: "Tom's Flight Club Premium",
      description: 'Get access to 9 daily flight deals from your home city, 3 hours before free members',
      metadata: {
        features: '9 daily deals,Early access (3 hours),Premium-only deals,Email alerts,Mobile app access',
      },
    });

    console.log('Created product:', product.id);

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

    console.log('\nCreated prices:');
    console.log('3 Months:', price3Months.id);
    console.log('6 Months:', price6Months.id);
    console.log('Yearly:', priceYearly.id);

    console.log('\nAdd these to your .env.local file:');
    console.log(`STRIPE_PREMIUM_3_MONTHS_PRICE_ID=${price3Months.id}`);
    console.log(`STRIPE_PREMIUM_6_MONTHS_PRICE_ID=${price6Months.id}`);
    console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID=${priceYearly.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

  } catch (error) {
    console.error('Error creating Stripe products:', error);
  }
}

// Run the script
createStripeProducts();