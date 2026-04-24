import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const dbAdmin = admin.firestore();
const authAdmin = admin.auth();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // API Route to send verification code
  app.post('/api/auth/send-code', async (req, res) => {
    const { email, code } = req.body;

    console.log(`[Email] Request to send code to: ${email}`);

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    try {
      // Store code in Firestore for verification
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await dbAdmin.collection('otp_codes').doc(email).set({
        code,
        email,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // For development/preview, we'll try Ethereal or provided SMTP
      let transporter;
      
      try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          console.log('[Email] Using custom SMTP configuration');
          transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
        } else {
          // Fallback to Ethereal Email for demo purposes
          console.log('[Email] No SMTP config found, generating Ethereal test account...');
          const testAccount = await nodemailer.createTestAccount();
          console.log('[Email] Ethereal account generated');
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
        }

        const info = await transporter.sendMail({
          from: '"DammyTech Support" <noreply@dammytech.com>',
          to: email,
          subject: "Your Verification Code - DammyTech",
          text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
              <h2 style="color: #0891b2; text-align: center;">DammyTech verification</h2>
              <p style="font-size: 16px; color: #333;">Hello,</p>
              <p style="font-size: 16px; color: #333;">Welcome to the future of gadgets. To complete your signup, please use the following verification code:</p>
              <div style="background: #f0f9ff; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #0891b2;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #aaa; text-align: center;">© 2026 DammyTech Gadget Store. Engineered for Excellence.</p>
            </div>
          `,
        });

        console.log('[Email] Message sent successfully: %s', info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('[Email] Test Preview URL: %s', previewUrl);
        }

        return res.json({ success: true, previewUrl });
      } catch (emailErr: any) {
        console.warn('[Email] Email service failed, but logging code to console for development:', emailErr.message);
        console.log(`\n************************************************\n`);
        console.log(`DEVELOPMENT VERIFICATION CODE FOR ${email}: ${code}`);
        console.log(`\n************************************************\n`);
        
        return res.json({ 
          success: true, 
          warning: 'Email service skipped (Development Fallback)',
          devCode: code 
        });
      }
    } catch (error: any) {
      console.error('[Email] Internal server error:', error);
      return res.status(500).json({ error: 'Internal server error during verification' });
    }
  });

  // API Route to verify OTP code
  app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body;

    console.log(`[Verify Code] Request for: ${email}`);

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    try {
      const otpRef = dbAdmin.collection('otp_codes').doc(email);
      const doc = await otpRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'No verification code found for this email' });
      }

      const data = doc.data();
      if (data?.code !== code) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      const expiresAt = data.expiresAt.toDate();
      if (expiresAt < new Date()) {
        return res.status(400).json({ error: 'Verification code has expired' });
      }

      // Mark user as verified in Firebase Auth
      try {
        const userRecord = await authAdmin.getUserByEmail(email);
        await authAdmin.updateUser(userRecord.uid, {
          emailVerified: true
        });
        console.log(`[Verify Code] User ${email} marked as verified in Auth`);
      } catch (authErr: any) {
        console.warn(`[Verify Code] Could not update Auth user directly (maybe social login?), skipping auth update:`, authErr.message);
      }

      // Update Firestore profile as well just in case
      const usersQuery = await dbAdmin.collection('users').where('email', '==', email).get();
      if (!usersQuery.empty) {
        const userDocId = usersQuery.docs[0].id;
        await dbAdmin.collection('users').doc(userDocId).update({
          is_verified: true,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`[Verify Code] User profile updated in Firestore`);
      }

      // Delete the OTP code after successful verification
      await otpRef.delete();

      return res.json({ success: true });
    } catch (error: any) {
      console.error('[Verify Code] Error:', error);
      return res.status(500).json({ error: 'Internal server error during verification' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
