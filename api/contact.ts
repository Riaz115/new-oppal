import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { Resend } from 'resend';

// Contact form submission schema
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  subject: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = ContactFormSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid form data",
        details: validation.error.errors
      });
    }

    const { name, email, company, message, subject } = validation.data;

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to paul@digitalawol.com
    await resend.emails.send({
      from: "Opal44 Contact Form <noreply@opal44.com>",
      to: ["paul@digitalawol.com"],
      subject: subject ? `${subject} - ${name}` : `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">${subject || 'New Contact Form Submission'}</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>Reply to:</strong> ${email}
            </p>
          </div>
        </div>
      `,
      text: `
${subject || 'New Contact Form Submission'}

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}

Message:
${message}

Reply to: ${email}
      `
    });

    res.json({ success: true, message: "Thank you for your message! We'll get back to you soon." });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
}
