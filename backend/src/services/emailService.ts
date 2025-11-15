import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOTPEmailParams {
  email: string;
  firstName: string;
  otp: string;
  expiryMinutes?: number;
}

export async function sendOTPEmail({ 
  email, 
  firstName, 
  otp,
  expiryMinutes = 10 
}: SendOTPEmailParams) {
  try {
    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: 'Verify Your Email - AfriGos',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              <p>Hi ${firstName},</p>
              <p>Thank you for signing up with AfriGos! To complete your registration, please verify your email address using the code below:</p>
              
              <div style="background: #f8f9fa; border: 2px dashed #ff6b35; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #ff6b35; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #666; font-size: 14px;">This code will expire in ${expiryMinutes} minutes.</p>
              
              <p style="margin-top: 30px;">If you didn't create an account with AfriGos, please ignore this email.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Verify Your Email Address - AfriGos
        
        Hi ${firstName},
        
        Thank you for signing up with AfriGos! To complete your registration, please verify your email address using the code below:
        
        Your verification code: ${otp}
        
        This code will expire in ${expiryMinutes} minutes.
        
        If you didn't create an account with AfriGos, please ignore this email.
        
        This is an automated email. Please do not reply to this message.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send verification email');
  }
}

interface OrderItem {
  product: {
    name: string;
    images: string[];
  };
  quantity: number;
  price: any;
  total: any;
}

interface SendOrderConfirmationEmailParams {
  email: string;
  firstName: string;
  orderNumber: string;
  orderDate: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: any;
  vendorName?: string;
}

export async function sendOrderConfirmationEmail({
  email,
  firstName,
  orderNumber,
  orderDate,
  orderItems,
  subtotal,
  shippingCost,
  totalAmount,
  shippingAddress,
  vendorName
}: SendOrderConfirmationEmailParams) {
  try {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const formatAddress = (address: any) => {
      if (!address) return 'N/A';
      const parts = [
        address.fullName || address.name,
        address.street || address.address,
        address.city,
        address.state,
        address.postalCode || address.postcode,
        address.country
      ].filter(Boolean);
      return parts.join(', ');
    };

    const itemsHtml = orderItems.map(item => {
      const productImage = item.product.images && item.product.images.length > 0 
        ? item.product.images[0] 
        : null;
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 15px 10px; vertical-align: top;">
            ${productImage ? `
              <img src="${productImage}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0;" />
            ` : `
              <div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">No Image</div>
            `}
          </td>
          <td style="padding: 15px 10px; vertical-align: top;">
            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.product.name}</div>
            <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
          </td>
          <td style="padding: 15px 10px; vertical-align: top; text-align: right;">
            <div style="font-weight: 600; color: #333;">${formatCurrency(Number(item.price))}</div>
            <div style="color: #666; font-size: 14px;">${formatCurrency(Number(item.total))} total</div>
          </td>
        </tr>
      `;
    }).join('');

    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
              <p>Hi ${firstName},</p>
              <p>Thank you for your order! We're excited to let you know that we've received your order and it's being prepared.</p>
              
              <div style="background: #f8f9fa; border: 2px solid #ff6b35; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #666;">Order Number:</strong>
                  <div style="font-size: 24px; font-weight: bold; color: #ff6b35; margin-top: 5px;">${orderNumber}</div>
                </div>
                <div>
                  <strong style="color: #666;">Order Date:</strong>
                  <div style="color: #333; margin-top: 5px;">${orderDate}</div>
                </div>
                ${vendorName ? `
                <div style="margin-top: 10px;">
                  <strong style="color: #666;">Vendor:</strong>
                  <div style="color: #333; margin-top: 5px;">${vendorName}</div>
                </div>
                ` : ''}
              </div>

              <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                    <th style="padding: 12px 10px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Product</th>
                    <th style="padding: 12px 10px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Details</th>
                    <th style="padding: 12px 10px; text-align: right; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Subtotal:</span>
                  <span style="font-weight: 600; color: #333;">${formatCurrency(subtotal)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Shipping:</span>
                  <span style="font-weight: 600; color: #333;">${formatCurrency(shippingCost)}</span>
                </div>
                <div style="border-top: 2px solid #e0e0e0; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; font-size: 18px; color: #333;">Total:</span>
                  <span style="font-weight: 700; font-size: 18px; color: #ff6b35;">${formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Shipping Address</h3>
                <div style="color: #666; line-height: 1.8;">
                  ${formatAddress(shippingAddress).split(', ').join('<br />')}
                </div>
              </div>

              <p style="margin-top: 30px; color: #666;">You can track your order status anytime by visiting your account or using your order number.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Order Confirmation - AfriGos
        
        Hi ${firstName},
        
        Thank you for your order! We're excited to let you know that we've received your order and it's being prepared.
        
        Order Number: ${orderNumber}
        Order Date: ${orderDate}
        ${vendorName ? `Vendor: ${vendorName}\n` : ''}
        
        Order Details:
        ${orderItems.map(item => `- ${item.product.name} x${item.quantity} - ${formatCurrency(Number(item.total))}`).join('\n')}
        
        Subtotal: ${formatCurrency(subtotal)}
        Shipping: ${formatCurrency(shippingCost)}
        Total: ${formatCurrency(totalAmount)}
        
        Shipping Address:
        ${formatAddress(shippingAddress)}
        
        You can track your order status anytime by visiting your account or using your order number.
        
        This is an automated email. Please do not reply to this message.
        If you have any questions, please contact our support team.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send order confirmation email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send order confirmation email');
  }
}

interface SendVendorWelcomeEmailParams {
  email: string;
  firstName: string;
  businessName: string;
}

export async function sendVendorWelcomeEmail({
  email,
  firstName,
  businessName
}: SendVendorWelcomeEmailParams) {
  try {
    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: 'Welcome to AfriGos - Vendor Registration Received',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to AfriGos</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to AfriGos!</h2>
              <p>Hi ${firstName},</p>
              <p>Thank you for registering as a vendor on AfriGos! We're excited to have you join our marketplace.</p>
              
              <div style="background: #f8f9fa; border: 2px solid #ff6b35; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #666;">Business Name:</strong>
                  <div style="font-size: 18px; font-weight: bold; color: #ff6b35; margin-top: 5px;">${businessName}</div>
                </div>
              </div>

              <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">What's Next?</h3>
              <p>Your vendor account has been created and is currently pending review by our admin team. Here's what you can expect:</p>
              
              <ul style="color: #666; line-height: 2; padding-left: 20px;">
                <li>Our team will review your registration and verify your business details</li>
                <li>Once approved, you'll receive an email confirmation</li>
                <li>You can then start listing your products and managing your store</li>
                <li>Complete your vendor profile to get started faster</li>
              </ul>

              <p style="margin-top: 30px; color: #666;">We typically review vendor applications within 1-2 business days. You'll be notified via email once your account has been approved.</p>
              
              <p style="margin-top: 20px;">If you have any questions in the meantime, please don't hesitate to contact our support team.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team at enquiries@afrigos.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Welcome to AfriGos - Vendor Registration Received
        
        Hi ${firstName},
        
        Thank you for registering as a vendor on AfriGos! We're excited to have you join our marketplace.
        
        Business Name: ${businessName}
        
        What's Next?
        Your vendor account has been created and is currently pending review by our admin team. Here's what you can expect:
        
        - Our team will review your registration and verify your business details
        - Once approved, you'll receive an email confirmation
        - You can then start listing your products and managing your store
        - Complete your vendor profile to get started faster
        
        We typically review vendor applications within 1-2 business days. You'll be notified via email once your account has been approved.
        
        If you have any questions in the meantime, please don't hesitate to contact our support team at enquiries@afrigos.com
        
        This is an automated email. Please do not reply to this message.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send vendor welcome email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send vendor welcome email');
  }
}

interface SendVendorApprovalEmailParams {
  email: string;
  firstName: string;
  businessName: string;
  approved: boolean;
  reason?: string;
  requiresEmailVerification?: boolean;
}

export async function sendVendorApprovalEmail({
  email,
  firstName,
  businessName,
  approved,
  reason,
  requiresEmailVerification = false
}: SendVendorApprovalEmailParams) {
  try {
    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: approved 
        ? `Congratulations! Your Vendor Account Has Been Approved - ${businessName}`
        : `Vendor Application Update - ${businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${approved ? 'Vendor Approved' : 'Vendor Application Update'}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              ${approved ? `
                <h2 style="color: #333; margin-top: 0;">🎉 Congratulations!</h2>
                <p>Hi ${firstName},</p>
                <p>Great news! Your vendor account for <strong>${businessName}</strong> has been approved by our admin team.</p>
                
                <div style="background: #f0f9ff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <div style="font-size: 18px; font-weight: bold; color: #10b981; margin-bottom: 10px;">✓ Account Approved</div>
                  <div style="color: #666;">Your vendor account is now active and ready to use!</div>
                </div>

                ${requiresEmailVerification ? `
                  <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <div style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-bottom: 10px;">⚠ Email Verification Required</div>
                    <div style="color: #666; margin-bottom: 15px;">Before you can access your vendor dashboard, please verify your email address. A verification code has been sent to this email.</div>
                    <div style="text-align: center;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/auth/verify-email?email=${encodeURIComponent(email)}&role=vendor" 
                         style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                        Verify Email Address
                      </a>
                    </div>
                  </div>
                ` : ''}

                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">What You Can Do Now:</h3>
                <ul style="color: #666; line-height: 2; padding-left: 20px;">
                  <li>Access your vendor dashboard</li>
                  <li>Start listing your products</li>
                  <li>Manage your inventory and orders</li>
                  <li>Set up payment and shipping settings</li>
                  <li>View your earnings and analytics</li>
                </ul>

                ${!requiresEmailVerification ? `
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/auth/vendor-login" 
                       style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                      Access Vendor Dashboard
                    </a>
                  </div>
                ` : ''}
              ` : `
                <h2 style="color: #333; margin-top: 0;">Application Update</h2>
                <p>Hi ${firstName},</p>
                <p>We regret to inform you that your vendor application for <strong>${businessName}</strong> could not be approved at this time.</p>
                
                <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <div style="font-size: 18px; font-weight: bold; color: #ef4444; margin-bottom: 10px;">Application Status: Not Approved</div>
                  ${reason ? `
                    <div style="color: #666; margin-top: 10px;">
                      <strong>Reason:</strong>
                      <div style="margin-top: 5px;">${reason}</div>
                    </div>
                  ` : ''}
                </div>

                <p style="color: #666;">If you believe this is an error or have additional information to provide, please contact our support team for assistance.</p>
              `}

              <p style="margin-top: 30px; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team at enquiries@afrigos.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        ${approved ? 'Congratulations! Your Vendor Account Has Been Approved' : 'Vendor Application Update'}
        
        Hi ${firstName},
        
        ${approved ? `
        Great news! Your vendor account for ${businessName} has been approved by our admin team.
        
        Your vendor account is now active and ready to use!
        
        What You Can Do Now:
        - Access your vendor dashboard
        - Start listing your products
        - Manage your inventory and orders
        - Set up payment and shipping settings
        - View your earnings and analytics
        
        Access your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:8083'}/auth/vendor-login
        ` : `
        We regret to inform you that your vendor application for ${businessName} could not be approved at this time.
        
        ${reason ? `Reason: ${reason}` : ''}
        
        If you believe this is an error or have additional information to provide, please contact our support team for assistance.
        `}
        
        If you have any questions, please contact our support team at enquiries@afrigos.com
        
        This is an automated email. Please do not reply to this message.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send vendor approval email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send vendor approval email');
  }
}

interface SendProductApprovalEmailParams {
  email: string;
  firstName: string;
  productName: string;
  status: 'APPROVED' | 'REJECTED' | 'DRAFT';
  reason?: string;
  productId?: string;
}

export async function sendProductApprovalEmail({
  email,
  firstName,
  productName,
  status,
  reason,
  productId
}: SendProductApprovalEmailParams) {
  try {
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';
    const isDraft = status === 'DRAFT'; // Request changes

    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: isApproved 
        ? `Your Product Has Been Approved - ${productName}`
        : isRejected
        ? `Product Update Required - ${productName}`
        : `Changes Requested for Your Product - ${productName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isApproved ? 'Product Approved' : 'Product Update'}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              ${isApproved ? `
                <h2 style="color: #333; margin-top: 0;">🎉 Product Approved!</h2>
                <p>Hi ${firstName},</p>
                <p>Great news! Your product <strong>"${productName}"</strong> has been approved and is now live on AfriGos marketplace.</p>
                
                <div style="background: #f0f9ff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <div style="font-size: 18px; font-weight: bold; color: #10b981; margin-bottom: 10px;">✓ Product Live</div>
                  <div style="color: #666;">Your product is now visible to customers and ready for sales!</div>
                </div>

                ${reason ? `
                  <div style="background: #f8f9fa; border-left: 4px solid #ff6b35; padding: 15px; margin: 20px 0;">
                    <strong style="color: #666;">Admin Note:</strong>
                    <div style="color: #333; margin-top: 5px;">${reason}</div>
                  </div>
                ` : ''}

                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">What's Next?</h3>
                <ul style="color: #666; line-height: 2; padding-left: 20px;">
                  <li>Your product is now live and available to customers</li>
                  <li>Monitor your sales and customer reviews</li>
                  <li>Keep your inventory updated</li>
                  <li>Respond to customer inquiries promptly</li>
                </ul>

                ${productId ? `
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/vendor/products" 
                       style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                      View Your Products
                    </a>
                  </div>
                ` : ''}
              ` : `
                <h2 style="color: #333; margin-top: 0;">${isRejected ? 'Product Review Required' : 'Changes Requested'}</h2>
                <p>Hi ${firstName},</p>
                <p>Your product <strong>"${productName}"</strong> requires ${isRejected ? 'revisions before it can be approved' : 'some changes before it can be published'}.</p>
                
                <div style="background: ${isRejected ? '#fef2f2' : '#fffbeb'}; border: 2px solid ${isRejected ? '#ef4444' : '#f59e0b'}; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <div style="font-size: 18px; font-weight: bold; color: ${isRejected ? '#ef4444' : '#f59e0b'}; margin-bottom: 10px;">
                    ${isRejected ? '✗ Product Not Approved' : '⚠ Changes Needed'}
                  </div>
                  <div style="color: #666;">${isRejected ? 'Please review the feedback below and resubmit your product.' : 'Please review the requested changes below and update your product.'}</div>
                </div>

                ${reason ? `
                  <div style="background: #f8f9fa; border-left: 4px solid ${isRejected ? '#ef4444' : '#f59e0b'}; padding: 15px; margin: 20px 0;">
                    <strong style="color: #666;">${isRejected ? 'Rejection Reason' : 'Requested Changes'}:</strong>
                    <div style="color: #333; margin-top: 10px; white-space: pre-wrap;">${reason}</div>
                  </div>
                ` : ''}

                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Next Steps:</h3>
                <ul style="color: #666; line-height: 2; padding-left: 20px;">
                  <li>Review the ${isRejected ? 'rejection reason' : 'requested changes'} above</li>
                  <li>Update your product information accordingly</li>
                  <li>Resubmit your product for review</li>
                  <li>Contact support if you need clarification</li>
                </ul>

                ${productId ? `
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/vendor/products/${productId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                      Edit Product
                    </a>
                  </div>
                ` : ''}
              `}

              <p style="margin-top: 30px; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team at enquiries@afrigos.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        ${isApproved ? 'Your Product Has Been Approved' : isRejected ? 'Product Update Required' : 'Changes Requested for Your Product'}
        
        Hi ${firstName},
        
        ${isApproved ? `
        Great news! Your product "${productName}" has been approved and is now live on AfriGos marketplace.
        
        Your product is now visible to customers and ready for sales!
        
        ${reason ? `Admin Note: ${reason}\n` : ''}
        
        What's Next?
        - Your product is now live and available to customers
        - Monitor your sales and customer reviews
        - Keep your inventory updated
        - Respond to customer inquiries promptly
        ` : `
        Your product "${productName}" requires ${isRejected ? 'revisions before it can be approved' : 'some changes before it can be published'}.
        
        ${reason ? `${isRejected ? 'Rejection Reason' : 'Requested Changes'}: ${reason}\n` : ''}
        
        Next Steps:
        - Review the ${isRejected ? 'rejection reason' : 'requested changes'} above
        - Update your product information accordingly
        - Resubmit your product for review
        - Contact support if you need clarification
        `}
        
        If you have any questions, please contact our support team at enquiries@afrigos.com
        
        This is an automated email. Please do not reply to this message.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send product approval email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send product approval email');
  }
}

interface SendOrderStatusUpdateEmailParams {
  email: string;
  firstName: string;
  orderNumber: string;
  orderId: string; // Add orderId for correct link
  status: string;
  previousStatus?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export async function sendOrderStatusUpdateEmail({
  email,
  firstName,
  orderNumber,
  orderId,
  status,
  previousStatus,
  trackingNumber,
  estimatedDeliveryDate
}: SendOrderStatusUpdateEmailParams) {
  try {
    // Map status to user-friendly messages
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      'PENDING': {
        title: 'Order Received',
        message: 'We have received your order and it\'s being processed.',
        color: '#f59e0b'
      },
      'CONFIRMED': {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared.',
        color: '#10b981'
      },
      'PROCESSING': {
        title: 'Order Processing',
        message: 'Your order is being processed and will be shipped soon.',
        color: '#3b82f6'
      },
      'SHIPPED': {
        title: 'Order Shipped!',
        message: 'Great news! Your order has been shipped and is on its way.',
        color: '#8b5cf6'
      },
      'DELIVERED': {
        title: 'Order Delivered! 🎉',
        message: 'Your order has been delivered! We hope you enjoy your purchase.',
        color: '#10b981'
      },
      'CANCELLED': {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled.',
        color: '#ef4444'
      },
      'REFUNDED': {
        title: 'Order Refunded',
        message: 'Your order has been refunded. Please allow a few business days for the refund to appear in your account.',
        color: '#6366f1'
      }
    };

    const statusInfo = statusMessages[status] || {
      title: 'Order Status Updated',
      message: `Your order status has been updated to ${status}.`,
      color: '#666'
    };

    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: `${statusInfo.title} - Order ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status Update</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">${statusInfo.title}</h2>
              <p>Hi ${firstName},</p>
              <p>${statusInfo.message}</p>
              
              <div style="background: #f8f9fa; border: 2px solid ${statusInfo.color}; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #666;">Order Number:</strong>
                  <div style="font-size: 18px; font-weight: bold; color: ${statusInfo.color}; margin-top: 5px;">${orderNumber}</div>
                </div>
                <div>
                  <strong style="color: #666;">Status:</strong>
                  <div style="display: inline-block; background: ${statusInfo.color}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-top: 5px;">
                    ${status}
                  </div>
                </div>
                ${trackingNumber ? `
                  <div style="margin-top: 15px;">
                    <strong style="color: #666;">Tracking Number:</strong>
                    <div style="font-family: monospace; font-size: 16px; color: #333; margin-top: 5px;">${trackingNumber}</div>
                  </div>
                ` : ''}
                ${estimatedDeliveryDate ? `
                  <div style="margin-top: 15px;">
                    <strong style="color: #666;">Estimated Delivery:</strong>
                    <div style="color: #333; margin-top: 5px;">${estimatedDeliveryDate}</div>
                  </div>
                ` : ''}
              </div>

              ${status === 'SHIPPED' && trackingNumber ? `
                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                  <strong style="color: #1e40af;">Track Your Order:</strong>
                  <div style="color: #666; margin-top: 5px;">You can track your order using the tracking number above or visit your account dashboard.</div>
                </div>
              ` : ''}

              ${status === 'DELIVERED' ? `
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <strong style="color: #166534;">Enjoy Your Purchase!</strong>
                  <div style="color: #666; margin-top: 5px;">We hope you love your new items! If you have any questions or concerns, please don't hesitate to contact us.</div>
                </div>
              ` : ''}

              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/account/orders/${orderNumber}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  View Order Details
                </a>
              </div>

              <p style="margin-top: 30px; color: #666;">If you have any questions about your order, please contact our support team.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team at enquiries@afrigos.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        ${statusInfo.title} - Order ${orderNumber}
        
        Hi ${firstName},
        
        ${statusInfo.message}
        
        Order Number: ${orderNumber}
        Status: ${status}
        ${trackingNumber ? `Tracking Number: ${trackingNumber}\n` : ''}
        ${estimatedDeliveryDate ? `Estimated Delivery: ${estimatedDeliveryDate}\n` : ''}
        
        ${status === 'SHIPPED' && trackingNumber ? 'You can track your order using the tracking number above or visit your account dashboard.\n' : ''}
        
        ${status === 'DELIVERED' ? 'We hope you love your new items! If you have any questions or concerns, please don\'t hesitate to contact us.\n' : ''}
        
        View your order: ${process.env.FRONTEND_URL || 'http://localhost:8083'}/order/${orderId}/confirmation
        
        If you have any questions about your order, please contact our support team at enquiries@afrigos.com
        
        This is an automated email. Please do not reply to this message.
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send order status update email');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send order status update email');
  }
}

interface SendNewOrderEmailToVendorParams {
  email: string;
  firstName: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  orderItems: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  shippingAddress: any;
}

export async function sendNewOrderEmailToVendor({
  email,
  firstName,
  orderNumber,
  orderDate,
  customerName,
  orderItems,
  totalAmount,
  shippingCost,
  shippingAddress
}: SendNewOrderEmailToVendorParams) {
  try {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const formatAddress = (address: any) => {
      if (!address) return 'N/A';
      const parts = [
        address.fullName || address.name,
        address.street || address.address,
        address.city,
        address.state,
        address.postalCode || address.postcode,
        address.country
      ].filter(Boolean);
      return parts.join(', ');
    };

    const itemsHtml = orderItems.map(item => {
      const productImage = item.product.images && item.product.images.length > 0 
        ? item.product.images[0] 
        : null;
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 15px 10px; vertical-align: top;">
            ${productImage ? `
              <img src="${productImage}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0;" />
            ` : `
              <div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">No Image</div>
            `}
          </td>
          <td style="padding: 15px 10px; vertical-align: top;">
            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.product.name}</div>
            <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
          </td>
          <td style="padding: 15px 10px; vertical-align: top; text-align: right;">
            <div style="font-weight: 600; color: #333;">${formatCurrency(Number(item.price))}</div>
            <div style="color: #666; font-size: 14px;">${formatCurrency(Number(item.total))} total</div>
          </td>
        </tr>
      `;
    }).join('');

    const result = await resend.emails.send({
      from: 'AfriGos <noreply@afrigos.com>',
      to: email,
      subject: `New Order Received - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order Received</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AfriGos</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">🎉 New Order Received!</h2>
              <p>Hi ${firstName},</p>
              <p>Great news! You have received a new order on AfriGos. Please process and fulfill this order promptly.</p>
              
              <div style="background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #666;">Order Number:</strong>
                  <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-top: 5px;">${orderNumber}</div>
                </div>
                <div>
                  <strong style="color: #666;">Order Date:</strong>
                  <div style="color: #333; margin-top: 5px;">${orderDate}</div>
                </div>
                <div style="margin-top: 10px;">
                  <strong style="color: #666;">Customer:</strong>
                  <div style="color: #333; margin-top: 5px;">${customerName}</div>
                </div>
              </div>

              <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                    <th style="padding: 12px 10px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Product</th>
                    <th style="padding: 12px 10px; text-align: left; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Details</th>
                    <th style="padding: 12px 10px; text-align: right; color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #666;">Shipping:</span>
                  <span style="font-weight: 600; color: #333;">${formatCurrency(shippingCost)}</span>
                </div>
                <div style="border-top: 2px solid #e0e0e0; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between;">
                  <span style="font-weight: 600; font-size: 18px; color: #333;">Total:</span>
                  <span style="font-weight: 700; font-size: 18px; color: #3b82f6;">${formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Shipping Address</h3>
                <div style="color: #666; line-height: 1.8;">
                  ${formatAddress(shippingAddress).split(', ').join('<br />')}
                </div>
              </div>

              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <strong style="color: #92400e;">Action Required:</strong>
                <div style="color: #666; margin-top: 5px;">Please process this order and update its status in your vendor dashboard.</div>
              </div>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8083'}/vendor/orders" 
                   style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  View Order in Dashboard
                </a>
              </div>

              <p style="margin-top: 30px; color: #666;">Thank you for being a valued vendor on AfriGos!</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email. Please do not reply to this message.</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact our support team at enquiries@afrigos.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        New Order Received - AfriGos
        
        Hi ${firstName},
        
        Great news! You have received a new order on AfriGos. Please process and fulfill this order promptly.
        
        Order Number: ${orderNumber}
        Order Date: ${orderDate}
        Customer: ${customerName}
        
        Order Details:
        ${orderItems.map(item => `- ${item.product.name} x${item.quantity} - ${formatCurrency(Number(item.total))}`).join('\n')}
        
        Shipping: ${formatCurrency(shippingCost)}
        Total: ${formatCurrency(totalAmount)}
        
        Shipping Address:
        ${formatAddress(shippingAddress)}
        
        Action Required: Please process this order and update its status in your vendor dashboard.
        
        View your order: ${process.env.FRONTEND_URL || 'http://localhost:8083'}/vendor/orders
        
        Thank you for being a valued vendor on AfriGos!
        
        This is an automated email. Please do not reply to this message.
        If you have any questions, please contact our support team at enquiries@afrigos.com
      `,
    });

    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send new order email to vendor');
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send new order email to vendor');
  }
}

export default { sendOTPEmail, sendOrderConfirmationEmail, sendVendorWelcomeEmail, sendVendorApprovalEmail, sendProductApprovalEmail, sendOrderStatusUpdateEmail, sendNewOrderEmailToVendor };

