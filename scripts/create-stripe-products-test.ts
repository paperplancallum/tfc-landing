import Stripe from 'stripe';

// IMPORTANT: This script uses TEST mode
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || !stripeKey.startsWith('sk_test_')) {
  console.error('❌ Please provide a TEST secret key via STRIPE_SECRET_KEY environment variable');
  console.error('   Run: STRIPE_SECRET_KEY="sk_test_..." npx tsx scripts/create-stripe-products-test.ts');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
});

async function createStripeProductsTest() {
  try {
    console.log('🧪 Creating products in TEST MODE...');
    
    // Create the main product
    const product = await stripe.products.create({
      name: "Tom's Flight Club Premium",
      description: 'Get access to 9 daily flight deals from your home city, 3 hours before free members',
      metadata: {
        features: '9 daily deals,Early access (3 hours),Premium-only deals,Email alerts,Mobile app access',
      },
    });

    console.log('✅ Created product:', product.id);

    // Create prices for each billing interval in GBP
    
    // 3 Months Plan
    const price3Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 2397, // £23.97
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      nickname: '3 Months',
      metadata: {
        display_price: '£7.99/month',
        billing_description: '£23.97 billed quarterly',
      },
    });

    // 6 Months Plan
    const price6Months = await stripe.prices.create({
      product: product.id,
      unit_amount: 3594, // £35.94
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
      nickname: '6 Months',
      metadata: {
        display_price: '£5.99/month',
        billing_description: '£35.94 billed every 6 months',
        savings: 'Save 25%',
      },
    });

    // Yearly Plan (Most Popular)
    const priceYearly = await stripe.prices.create({
      product: product.id,
      unit_amount: 5999, // £59.99
      currency: 'gbp',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      nickname: 'Yearly',
      metadata: {
        display_price: '£4.99/month',
        billing_description: '£59.99 billed annually',
        popular: 'true',
        best_value: 'true',
        savings: 'Save 37%',
      },
    });

    console.log('\n✅ Created prices:');
    console.log('3 Months:', price3Months.id);
    console.log('6 Months:', price6Months.id);
    console.log('Yearly:', priceYearly.id);

    // Create payment links with redirect configuration
    console.log('\n📋 Creating payment links with redirect...');

    const paymentLink3Months = await stripe.paymentLinks.create({
      line_items: [{
        price: price3Months.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://tomsflightclub.com/payment-success',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: '3_months',
        plan_id: '3_months',
      },
    });

    const paymentLink6Months = await stripe.paymentLinks.create({
      line_items: [{
        price: price6Months.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://tomsflightclub.com/payment-success',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: '6_months',
        plan_id: '6_months',
      },
    });

    const paymentLinkYearly = await stripe.paymentLinks.create({
      line_items: [{
        price: priceYearly.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://tomsflightclub.com/payment-success',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        plan: 'yearly',
        plan_id: 'yearly',
      },
    });

    console.log('\n✅ Payment links created with redirect!');
    console.log('\n📝 Add these to your .env.local file:');
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3_MONTHS_TEST=${paymentLink3Months.url}`);
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6_MONTHS_TEST=${paymentLink6Months.url}`);
    console.log(`NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY_TEST=${paymentLinkYearly.url}`);
    
    console.log('\n🔐 Don\'t forget to:');
    console.log('1. Set up webhook endpoint in Stripe Dashboard');
    console.log('2. Add STRIPE_WEBHOOK_SECRET to .env.local');
    console.log('3. Remove your secret key from this script!');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
  }
}

// Run the script
createStripeProductsTest();