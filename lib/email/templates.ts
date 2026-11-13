import { formatPrice } from "@/lib/money";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Email = { subject: string; html: string; text: string };

function layout(opts: { preheader: string; heading: string; body: string; cta?: { label: string; href: string } }) {
  const cta = opts.cta
    ? `<tr><td style="padding:8px 0 28px"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#1f1d1b;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 28px;border-radius:999px">${esc(opts.cta.label)}</a></td></tr>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;background:#f6f2ec;font-family:Inter,Helvetica,Arial,sans-serif;color:#1f1d1b">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ec;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:28px 32px;border-bottom:1px solid #ece5da"><a href="${site()}" style="font-family:Poppins,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#1f1d1b;text-decoration:none">exepra</a></td></tr>
<tr><td style="padding:32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-family:Poppins,Helvetica,Arial,sans-serif;font-size:22px;font-weight:600;padding-bottom:16px">${esc(opts.heading)}</td></tr>
<tr><td style="font-size:15px;line-height:1.65;color:#3d3935;padding-bottom:16px">${opts.body}</td></tr>
${cta}
</table></td></tr>
<tr><td style="padding:24px 32px;background:#faf7f2;font-size:12px;line-height:1.6;color:#7a726a">EXEPRA · <a href="${site()}/impressum" style="color:#7a726a">Impressum</a> · <a href="${site()}/datenschutz" style="color:#7a726a">Datenschutz</a><br>You are receiving this email because of an action on ${esc(site().replace(/^https?:\/\//, ""))}.</td></tr>
</table></td></tr></table></body></html>`;
}

export type OrderEmailData = {
  orderNumber: string;
  firstName: string;
  items: { productName: string; variantLabel: string | null; quantity: number; lineTotal: number }[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  shippingLabel: string;
  shippingAddress: { firstName: string; lastName: string; street: string; houseNumber: string; postalCode: string; city: string; country: string };
};

function orderTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe3">${esc(i.productName)}${i.variantLabel ? `<br><span style="color:#7a726a;font-size:13px">${esc(i.variantLabel)}</span>` : ""} × ${i.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #f0ebe3;white-space:nowrap">${formatPrice(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:700" : "color:#5a534c"}">${label}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:700" : ""}">${value}</td></tr>`;
  const a = o.shippingAddress;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:8px 0 20px">${rows}
${line("Subtotal", formatPrice(o.subtotal))}
${o.discountTotal ? line("Discount", "−" + formatPrice(o.discountTotal)) : ""}
${line(`Shipping (${esc(o.shippingLabel)})`, o.shippingTotal ? formatPrice(o.shippingTotal) : "Free")}
${line("Total", formatPrice(o.total), true)}
<tr><td colspan="2" style="color:#7a726a;font-size:12px">Includes ${formatPrice(o.taxTotal)} VAT</td></tr></table>
<p style="margin:0;font-size:14px"><strong>Delivery address</strong><br>${esc(a.firstName)} ${esc(a.lastName)}<br>${esc(a.street)} ${esc(a.houseNumber)}<br>${esc(a.postalCode)} ${esc(a.city)}<br>${esc(a.country)}</p>`;
}

function orderText(o: OrderEmailData) {
  return [
    ...o.items.map((i) => `- ${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""} × ${i.quantity}: ${formatPrice(i.lineTotal)}`),
    `Subtotal: ${formatPrice(o.subtotal)}`,
    o.discountTotal ? `Discount: -${formatPrice(o.discountTotal)}` : "",
    `Shipping: ${o.shippingTotal ? formatPrice(o.shippingTotal) : "Free"}`,
    `Total: ${formatPrice(o.total)} (incl. ${formatPrice(o.taxTotal)} VAT)`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const emails = {
  passwordReset(url: string): Email {
    return {
      subject: "Reset your EXEPRA password",
      html: layout({
        preheader: "Use this link to choose a new password.",
        heading: "Reset your password",
        body: "We received a request to reset the password for your EXEPRA account. This link is valid for one hour. If you didn't request this, you can safely ignore this email.",
        cta: { label: "Choose a new password", href: url },
      }),
      text: `Reset your EXEPRA password: ${url}\n\nIf you didn't request this, ignore this email.`,
    };
  },

  verifyEmail(url: string): Email {
    return {
      subject: "Confirm your EXEPRA email address",
      html: layout({
        preheader: "Confirm your email to finish setting up your account.",
        heading: "Confirm your email address",
        body: "Welcome to EXEPRA. Please confirm your email address to secure your account.",
        cta: { label: "Confirm email", href: url },
      }),
      text: `Confirm your EXEPRA email address: ${url}`,
    };
  },

  orderReceived(o: OrderEmailData): Email {
    return {
      subject: `We've received your order ${o.orderNumber}`,
      html: layout({
        preheader: "Your payment is being processed.",
        heading: `Thank you, ${esc(o.firstName)}`,
        body: `We've received order <strong>${o.orderNumber}</strong>. Your payment method takes a little longer to confirm — we'll email you as soon as the payment has been received.${orderTable(o)}`,
        cta: { label: "View order status", href: `${site()}/track-order?order=${encodeURIComponent(o.orderNumber)}` },
      }),
      text: `Order ${o.orderNumber} received. We'll confirm once your payment arrives.\n\n${orderText(o)}`,
    };
  },

  orderConfirmation(o: OrderEmailData): Email {
    return {
      subject: `Order confirmation ${o.orderNumber}`,
      html: layout({
        preheader: "Payment received — we're preparing your order.",
        heading: `Thank you for your order, ${esc(o.firstName)}`,
        body: `Your payment has been received and order <strong>${o.orderNumber}</strong> is confirmed. We'll let you know as soon as it ships.${orderTable(o)}`,
        cta: { label: "View your order", href: `${site()}/track-order?order=${encodeURIComponent(o.orderNumber)}` },
      }),
      text: `Order ${o.orderNumber} confirmed — payment received.\n\n${orderText(o)}`,
    };
  },

  orderShipped(o: { orderNumber: string; firstName: string; carrier?: string | null; trackingNumber?: string | null; trackingUrl?: string | null }): Email {
    const tracking = o.trackingNumber
      ? `<p>Carrier: ${esc(o.carrier ?? "—")}<br>Tracking number: <strong>${esc(o.trackingNumber)}</strong></p>`
      : "";
    return {
      subject: `Your order ${o.orderNumber} is on its way`,
      html: layout({
        preheader: "Your order has shipped.",
        heading: "Your order is on its way",
        body: `Good news, ${esc(o.firstName)} — order <strong>${o.orderNumber}</strong> has been handed to the carrier.${tracking}`,
        cta: o.trackingUrl ? { label: "Track parcel", href: o.trackingUrl } : { label: "View order status", href: `${site()}/track-order?order=${encodeURIComponent(o.orderNumber)}` },
      }),
      text: `Order ${o.orderNumber} has shipped.${o.trackingNumber ? ` Tracking: ${o.trackingNumber} (${o.carrier ?? ""})` : ""}${o.trackingUrl ? `\n${o.trackingUrl}` : ""}`,
    };
  },

  orderCancelled(o: { orderNumber: string; firstName: string; reason?: string }): Email {
    return {
      subject: `Order ${o.orderNumber} has been cancelled`,
      html: layout({
        preheader: "Your order has been cancelled.",
        heading: "Your order has been cancelled",
        body: `Hello ${esc(o.firstName)}, order <strong>${o.orderNumber}</strong> has been cancelled.${o.reason ? ` ${esc(o.reason)}` : ""} If a payment was taken, it will be refunded to your original payment method.`,
      }),
      text: `Order ${o.orderNumber} has been cancelled.${o.reason ? ` ${o.reason}` : ""}`,
    };
  },

  refundIssued(o: { orderNumber: string; firstName: string; amount: number }): Email {
    return {
      subject: `Refund for order ${o.orderNumber}`,
      html: layout({
        preheader: "Your refund has been issued.",
        heading: "Your refund is on its way",
        body: `Hello ${esc(o.firstName)}, we've issued a refund of <strong>${formatPrice(o.amount)}</strong> for order <strong>${o.orderNumber}</strong>. Depending on your bank or payment provider, it may take 5–10 business days to appear.`,
      }),
      text: `A refund of ${formatPrice(o.amount)} has been issued for order ${o.orderNumber}.`,
    };
  },

  newsletterConfirm(url: string): Email {
    return {
      subject: "Please confirm your EXEPRA newsletter subscription",
      html: layout({
        preheader: "One more step to complete your subscription.",
        heading: "Confirm your subscription",
        body: "Please confirm that you'd like to receive the EXEPRA newsletter with new arrivals and offers. If you didn't sign up, simply ignore this email — you won't be subscribed.",
        cta: { label: "Confirm subscription", href: url },
      }),
      text: `Confirm your EXEPRA newsletter subscription: ${url}`,
    };
  },

  contactNotification(m: { name: string; email: string; subject: string; message: string }): Email {
    return {
      subject: `[Contact] ${m.subject}`,
      html: layout({
        preheader: `New message from ${m.name}`,
        heading: "New contact form message",
        body: `<p><strong>${esc(m.name)}</strong> &lt;${esc(m.email)}&gt;</p><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
      }),
      text: `From: ${m.name} <${m.email}>\n\n${m.message}`,
    };
  },
};
