import { sendEmail } from "./sendEmail.js";

/**
 * Build and send a professional HTML invoice email for a placed order.
 * Expects the full Mongoose order document (after .create()).
 * This is fire-and-forget — callers should NOT await it on the critical path.
 */
export const sendInvoiceEmail = async (order: any) => {
    const email = order.customer?.email;
    if (!email) return;

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const orderId = order._id?.toString?.() || "N/A";
    const shortId = orderId.slice(-8).toUpperCase();

    // Build product rows
    const productRows = (order.products || [])
        .map((p: any) => {
            const lineTotal = (p.purchasedPrice || p.price) * p.quantity;
            const meta = [p.size, p.color].filter(Boolean).join(" · ");
            return `
            <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">
                    <strong>${p.name}</strong>
                    ${meta ? `<br><span style="color:#888;font-size:12px;">${meta}</span>` : ""}
                </td>
                <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:14px;">${p.quantity}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;color:#555;font-size:14px;">৳${(p.purchasedPrice || p.price).toFixed(2)}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;font-weight:600;font-size:14px;">৳${lineTotal.toFixed(2)}</td>
            </tr>`;
        })
        .join("");

    // Payment badge
    const paymentMethod = order.paymentMethod || "cod";
    const paymentBadge =
        paymentMethod === "bkash"
            ? `<span style="display:inline-block;background:#E2136E;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">bKash</span>
               ${order.bkashTxnId ? `<span style="color:#888;font-size:12px;margin-left:8px;">TXN: ${order.bkashTxnId}</span>` : ""}`
            : `<span style="display:inline-block;background:#10B981;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">Cash on Delivery</span>`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f9fc;padding:40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:36px 40px;border-radius:16px 16px 0 0;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">MENBAZAR</h1>
                            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Order Confirmation</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="background:#ffffff;padding:32px 40px 20px;">
                            <p style="margin:0 0 6px;color:#333;font-size:16px;">Hello <strong>${order.customer.name}</strong>,</p>
                            <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                                Thank you for your order! We've received it and will process it shortly. Here's your invoice:
                            </p>
                        </td>
                    </tr>

                    <!-- Order meta -->
                    <tr>
                        <td style="background:#ffffff;padding:0 40px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:16px 20px;">
                                <tr>
                                    <td style="padding:6px 0;">
                                        <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Order ID</span><br>
                                        <strong style="color:#333;font-size:14px;">#${shortId}</strong>
                                    </td>
                                    <td style="padding:6px 0;text-align:center;">
                                        <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date</span><br>
                                        <strong style="color:#333;font-size:14px;">${orderDate}</strong>
                                    </td>
                                    <td style="padding:6px 0;text-align:right;">
                                        <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Payment</span><br>
                                        ${paymentBadge}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Product table -->
                    <tr>
                        <td style="background:#ffffff;padding:0 40px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <thead>
                                    <tr style="background:#f8fafc;">
                                        <th style="padding:12px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Product</th>
                                        <th style="padding:12px 16px;text-align:center;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Qty</th>
                                        <th style="padding:12px 16px;text-align:right;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Price</th>
                                        <th style="padding:12px 16px;text-align:right;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${productRows}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Totals -->
                    <tr>
                        <td style="background:#ffffff;padding:0 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e2e8f0;">
                                <tr>
                                    <td style="padding:12px 0 4px;color:#666;font-size:14px;">Subtotal</td>
                                    <td style="padding:12px 0 4px;text-align:right;color:#333;font-size:14px;">৳${(order.subtotal || 0).toFixed(2)}</td>
                                </tr>
                                ${(order.totalVat || 0) > 0 ? `
                                <tr>
                                    <td style="padding:4px 0;color:#666;font-size:14px;">VAT</td>
                                    <td style="padding:4px 0;text-align:right;color:#333;font-size:14px;">৳${order.totalVat.toFixed(2)}</td>
                                </tr>` : ""}
                                <tr>
                                    <td style="padding:4px 0;color:#666;font-size:14px;">Delivery Charge</td>
                                    <td style="padding:4px 0;text-align:right;color:#333;font-size:14px;">৳${(order.deliveryCharge || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding:12px 0 0;"><hr style="border:none;border-top:1px dashed #e2e8f0;margin:0;"></td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0 0;color:#1a1a2e;font-size:18px;font-weight:700;">Grand Total</td>
                                    <td style="padding:12px 0 0;text-align:right;color:#1a1a2e;font-size:22px;font-weight:700;">৳${(order.grandTotal || order.total || 0).toFixed(2)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping info -->
                    <tr>
                        <td style="background:#ffffff;padding:0 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;">
                                <tr>
                                    <td>
                                        <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
                                        <p style="margin:0 0 4px;color:#333;font-size:14px;font-weight:600;">${order.customer.name}</p>
                                        <p style="margin:0 0 2px;color:#666;font-size:13px;">${order.customer.address}</p>
                                        <p style="margin:0;color:#666;font-size:13px;">Phone: ${order.customer.phone}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#1a1a2e;padding:28px 40px;border-radius:0 0 16px 16px;text-align:center;">
                            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Thank you for shopping with <strong style="color:#fff;">MenBazar</strong></p>
                            <p style="margin:0;color:#64748b;font-size:12px;">
                                If you have any questions, reply to this email or contact us.
                            </p>
                            <hr style="border:none;border-top:1px solid #2a2a4e;margin:16px 0;">
                            <p style="margin:0;color:#4a5568;font-size:11px;">
                                © ${new Date().getFullYear()} MenBazar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // Build plain text version for anti-spam compliance
    const productLines = (order.products || [])
        .map((p: any) => {
            const lineTotal = (p.purchasedPrice || p.price) * p.quantity;
            const meta = [p.size, p.color].filter(Boolean).join(", ");
            return `  - ${p.name}${meta ? ` (${meta})` : ""} x${p.quantity} = BDT ${lineTotal.toFixed(2)}`;
        })
        .join("\n");

    const plainText = `MenBazar - Order Confirmation

Hello ${order.customer.name},

Thank you for your order! Here are your order details:

Order ID: #${shortId}
Date: ${orderDate}
Payment: ${paymentMethod === "bkash" ? "bKash" : "Cash on Delivery"}${order.bkashTxnId ? ` (TXN: ${order.bkashTxnId})` : ""}

Items:
${productLines}

Subtotal: BDT ${(order.subtotal || 0).toFixed(2)}${(order.totalVat || 0) > 0 ? `\nVAT: BDT ${order.totalVat.toFixed(2)}` : ""}
Delivery: BDT ${(order.deliveryCharge || 0).toFixed(2)}
Grand Total: BDT ${(order.grandTotal || order.total || 0).toFixed(2)}

Shipping To:
${order.customer.name}
${order.customer.address}
Phone: ${order.customer.phone}

Thank you for shopping with MenBazar!
`;

    await sendEmail(email, `Your MenBazar Order #${shortId} - Confirmation and Invoice`, html, plainText);
};
