import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export const preferenceApi = new Preference(client);
export const paymentApi = new Payment(client);

export function isMPConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}
