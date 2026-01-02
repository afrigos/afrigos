import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Resend } from 'resend';

const router = express.Router();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Webhook signature verification (optional but recommended)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    return false;
  }
}

// @desc    Resend Email Webhook Handler (for receiving emails)
// @route   POST /api/v1/emails/webhook
// @access  Public (Resend calls this directly)
router.post('/webhook', express.json(), async (req: any, res: any) => {
  try {
    const event = req.body;

    // Log the received event for debugging
    console.log('Received Resend webhook event:', event.type);

    // Handle email.received event
    if (event.type === 'email.received') {
      const emailData = event.data;

      // Extract email information
      const emailId = emailData.email_id;
      const from = emailData.from;
      const to = emailData.to || [];
      const subject = emailData.subject || '(No Subject)';
      const messageId = emailData.message_id;
      const createdAt = emailData.created_at;
      const attachments = emailData.attachments || [];

      console.log('Email received:', {
        emailId,
        from,
        to,
        subject,
        messageId,
        createdAt,
        attachmentCount: attachments.length
      });

      // Log the email information we received from the webhook
      // Note: Resend webhooks for received emails don't include the body content
      // The body needs to be retrieved separately, but the API endpoint for received emails
      // may differ from sent emails. For now, we'll log all available metadata.
      
      console.log('\n========== RECEIVED EMAIL ==========');
      console.log('Email ID:', emailId);
      console.log('From:', from);
      console.log('To:', to.join(', '));
      console.log('Subject:', subject);
      console.log('Message ID:', messageId);
      console.log('Received at:', createdAt);
      console.log('Attachments:', attachments.length > 0 ? attachments.map((a: any) => a.filename).join(', ') : 'None');
      
      if (attachments.length > 0) {
        console.log('\n--- Attachment Details ---');
        attachments.forEach((attachment: any, index: number) => {
          console.log(`Attachment ${index + 1}:`);
          console.log(`  - ID: ${attachment.id}`);
          console.log(`  - Filename: ${attachment.filename}`);
          console.log(`  - Content Type: ${attachment.content_type}`);
          console.log(`  - Size: ${attachment.size || 'Unknown'}`);
        });
      }
      
      console.log('\nNote: Email body content is not included in webhook payload.');
      console.log('To retrieve the email body, you may need to:');
      console.log('1. Check Resend dashboard for the email content');
      console.log('2. Use Resend API (if available for received emails)');
      console.log('3. Store email_id for later retrieval:', emailId);
      console.log('=====================================\n');
      
      // Try to fetch email content (may not work for received emails)
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && emailId) {
        // Note: Received emails might not be accessible via the standard /emails endpoint
        // This is a limitation - webhooks provide metadata only
        console.log('Attempting to fetch email body via API...');
        try {
          const emailResponse = await fetch(`https://api.resend.com/emails/${emailId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (emailResponse.ok) {
            const emailContent = await emailResponse.json() as {
              html?: string;
              text?: string;
              body?: string;
            };
            
            console.log('\n--- Email Body Retrieved ---');
            console.log('Text:', emailContent.text || emailContent.body || 'N/A');
            console.log('HTML:', emailContent.html ? 'Available' : 'N/A');
          } else {
            console.log('Email body not available via API (this is normal for received emails)');
          }
        } catch (fetchError: any) {
          console.log('Could not fetch email body via API (expected for received emails)');
        }
      }

      // Example: Store email metadata in database (optional)
      // You can create a model in Prisma for storing received emails
      try {
        // Uncomment this if you have a ReceivedEmail model in your Prisma schema
        /*
        await prisma.receivedEmail.create({
          data: {
            emailId,
            from,
            to: to.join(', '),
            subject,
            messageId,
            receivedAt: new Date(createdAt),
            hasAttachments: attachments.length > 0,
            attachmentCount: attachments.length
          }
        });
        */

        // For now, just log it
        console.log('Email metadata processed successfully');
      } catch (dbError: any) {
        console.error('Failed to store email metadata:', dbError);
        // Don't fail the webhook if database storage fails
      }

      // Here you can add custom logic based on the recipient email:
      // - Route support emails to your support system
      // - Process contact form submissions
      // - Handle order inquiries
      // - Forward to specific team members based on email address

      // Forward email to your Gmail inbox
      const forwardToEmail = process.env.FORWARD_EMAIL_TO || 'afrigosltd@gmail.com';
      
      try {
        // Try to fetch email content to forward
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey && emailId) {
          // Wait a bit for email to be processed
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const emailResponse = await fetch(`https://api.resend.com/emails/${emailId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });

            if (emailResponse.ok) {
              const emailContent = await emailResponse.json() as {
                html?: string;
                text?: string;
                body?: string;
              };

              // Forward the email to your Gmail
              await resend.emails.send({
                from: `AfriGos <noreply@afrigos.com>`,
                to: forwardToEmail,
                replyTo: from, // So you can reply directly to the original sender
                subject: `[Forwarded] ${subject}`,
                html: emailContent.html || emailContent.text || emailContent.body || 'No content available',
                text: emailContent.text || emailContent.body || 'No content available'
              });

              console.log(`✅ Email forwarded to ${forwardToEmail}`);
            } else {
              // If we can't get the body, forward with metadata
              await resend.emails.send({
                from: `AfriGos <noreply@afrigos.com>`,
                to: forwardToEmail,
                replyTo: from,
                subject: `[Forwarded] ${subject}`,
                html: `
                  <p><strong>From:</strong> ${from}</p>
                  <p><strong>To:</strong> ${to.join(', ')}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Received:</strong> ${createdAt}</p>
                  <p><strong>Message ID:</strong> ${emailId}</p>
                  <hr>
                  <p><em>Email body not available via API. Check Resend dashboard or use email_id: ${emailId}</em></p>
                `,
                text: `From: ${from}\nTo: ${to.join(', ')}\nSubject: ${subject}\n\nEmail body not available. Email ID: ${emailId}`
              });
              console.log(`✅ Email metadata forwarded to ${forwardToEmail}`);
            }
          } catch (fetchError: any) {
            // Forward with metadata if we can't fetch body
            await resend.emails.send({
              from: `AfriGos <noreply@afrigos.com>`,
              to: forwardToEmail,
              replyTo: from,
              subject: `[Forwarded] ${subject}`,
              html: `
                <p><strong>From:</strong> ${from}</p>
                <p><strong>To:</strong> ${to.join(', ')}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Received:</strong> ${createdAt}</p>
                <p><strong>Message ID:</strong> ${emailId}</p>
                <hr>
                <p><em>Email received via Resend. Check Resend dashboard for full content.</em></p>
              `,
              text: `From: ${from}\nTo: ${to.join(', ')}\nSubject: ${subject}\n\nEmail ID: ${emailId}`
            });
            console.log(`✅ Email metadata forwarded to ${forwardToEmail} (body not available)`);
          }
        }
      } catch (forwardError: any) {
        console.error('Error forwarding email:', forwardError.message);
        // Don't fail the webhook if forwarding fails
      }

      // Example: Route based on "to" address
      const primaryRecipient = to[0] || '';
      
      if (primaryRecipient.includes('support') || primaryRecipient.includes('enquiries') || primaryRecipient.includes('info')) {
        // Handle support/enquiries/info emails
        console.log('Support/info email received - forwarded to inbox');
      }

      // Return success response
      return res.status(200).json({ 
        received: true,
        message: 'Email received and processed',
        emailId 
      });
    }

    // Handle other event types if needed
    console.log(`Unhandled event type: ${event.type}`);
    
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Email webhook handler error:', error);
    res.status(500).json({ 
      error: 'Webhook handler failed',
      message: error.message 
    });
  }
});

// @desc    Get email content (after receiving webhook)
// @route   GET /api/v1/emails/:emailId
// @access  Public (or add auth if needed)
router.get('/:emailId', async (req: any, res: any) => {
  try {
    const { emailId } = req.params;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    // Fetch email content from Resend API
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return res.status(response.status).json({ error: errorData.message || 'Failed to fetch email' });
    }

    const emailContent = await response.json();
    res.json(emailContent);
  } catch (error: any) {
    console.error('Failed to fetch email content:', error);
    res.status(500).json({ error: 'Failed to fetch email content', message: error.message });
  }
});

// @desc    Get email attachment
// @route   GET /api/v1/emails/:emailId/attachments/:attachmentId
// @access  Public (or add auth if needed)
router.get('/:emailId/attachments/:attachmentId', async (req: any, res: any) => {
  try {
    const { emailId, attachmentId } = req.params;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    // Fetch attachment from Resend API
    const response = await fetch(
      `https://api.resend.com/emails/${emailId}/attachments/${attachmentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      return res.status(response.status).json({ error: errorData.message || 'Failed to fetch attachment' });
    }

    // Get the attachment as a buffer
    const attachmentBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(attachmentBuffer));
  } catch (error: any) {
    console.error('Failed to fetch attachment:', error);
    res.status(500).json({ error: 'Failed to fetch attachment', message: error.message });
  }
});

export default router;

