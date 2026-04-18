import { apiError } from "@/lib/api-response";
import Stripe from "stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secret || !publishableKey) {
    return apiError("Stripe keys are missing in environment variables.", 500);
  }

  const stripe = new Stripe(secret);
  const { email, name, address, amount, currency, description } = await req.json();

  const customer = await stripe.customers.create({ email, name, address });
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2025-03-31.basil" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    description,
    automatic_payment_methods: { enabled: true }
  });

  return Response.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey
  });
}
