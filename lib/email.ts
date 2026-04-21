/**
 * Simple email utility for sending notifications.
 * In a production environment, this should be integrated with a service like Resend, SendGrid, or AWS SES.
 */

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  console.log(`[Email Service] Sending email to: ${to}`)
  console.log(`[Email Service] Subject: ${subject}`)
  
  // Placeholder for real email service integration
  // Example with Resend (if installed):
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'orders@thespoonbill.com', to, subject, html });

  return { success: true }
}

export async function sendOrderConfirmationEmail(order: any, customerEmail: string) {
  const subject = `Order Confirmation #${order.id} - The Spoonbill`
  const html = `
    <h1>Thank you for your order!</h1>
    <p>Hi ${order.customer_name},</p>
    <p>Your order <strong>#${order.id}</strong> has been received and is being prepared.</p>
    <p><strong>Total:</strong> Ksh ${order.total.toFixed(2)}</p>
    <p><strong>Order Type:</strong> ${order.order_type}</p>
    ${order.delivery_address ? `<p><strong>Delivery Address:</strong> ${order.delivery_address}</p>` : ''}
    <p>You can track your order status on our website.</p>
    <br/>
    <p>Warm regards,</p>
    <p>The Spoonbill Team</p>
  `

  return sendEmail({ to: customerEmail, subject, html })
}

export async function sendWelcomeGuestEmail(customerName: string, customerEmail: string, temporaryPassword?: string) {
  const subject = `Welcome to The Spoonbill!`
  const html = `
    <h1>Welcome to the Family!</h1>
    <p>Hi ${customerName},</p>
    <p>Thank you for dining with us! We've automatically created an account for you so you can track your orders and earn loyalty points.</p>
    <p><strong>Email:</strong> ${customerEmail}</p>
    ${temporaryPassword ? `<p><strong>Temporary Password:</strong> ${temporaryPassword}</p><p>We recommend changing your password after logging in.</p>` : ''}
    <p>Enjoy your meal!</p>
    <br/>
    <p>Warm regards,</p>
    <p>The Spoonbill Team</p>
  `

  return sendEmail({ to: customerEmail, subject, html })
}
