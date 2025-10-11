const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY;
const sender = process.env.EMAIL_SENDER || 'contact@firstdigitaltrade.com';
if (apiKey) sgMail.setApiKey(apiKey);

// Funzione per scaricare il logo reale di IperMoney
async function getLogoBase64() {
  try {
    const response = await fetch('https://scontent-mxp2-1.xx.fbcdn.net/v/t39.30808-1/495378485_10235460410787652_8117124632259264711_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=110&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=PUuD01H58F8Q7kNvwGHQJ4b&_nc_oc=AdlPx--1P7zPEZC40lzczU2G2NVEAwANoCC6d7bdInas_GcLSFnG7kq6tPWwtQKibAU&_nc_zt=24&_nc_ht=scontent-mxp2-1.xx&_nc_gid=RtkqPdK1MoQ5nHb8hRe1uw&oh=00_AffBSJzHZPd_AL1hjUfIGwwwPq2vUVnPqZDuaz8EQRwUMA&oe=68E90103');
    if (!response.ok) {
      throw new Error('Failed to fetch logo');
    }
    const logoBuffer = await response.arrayBuffer();
    return Buffer.from(logoBuffer).toString('base64');
  } catch (error) {
    console.error('Error fetching logo, using fallback:', error);
    // Fallback al logo generato se il download fallisce
    const logoSvg = `
      <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" fill="#004d5c"/>
        <text x="100" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ff8c00">IperMoney</text>
      </svg>
    `;
    return Buffer.from(logoSvg).toString('base64');
  }
}

async function sendEmailBatch(toList, subject, body, templateId) {
  if (!apiKey) throw new Error('SENDGRID_API_KEY non impostata');
  const chunks = [];
  for (let i = 0; i < toList.length; i += 25) chunks.push(toList.slice(i, i + 25));

  // Prepara l'allegato del logo
  const logoBase64 = await getLogoBase64();
  const attachments = [{
    content: logoBase64,
    filename: 'ipermoney_logo.jpg',
    type: 'image/jpeg',
    disposition: 'inline',
    content_id: 'ipermoney_logo'
  }];

  // Aggiungi il link "visualizza nel browser" se abbiamo un templateId
  let emailBody = body;
  if (templateId) {
    const viewInBrowserUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/email-preview/${templateId}`;
    emailBody = body + `
      <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d;">
        <p>Se non riesci a visualizzare correttamente questa email, <a href="${viewInBrowserUrl}" style="color: #ff8c00; text-decoration: none;">clicca qui per visualizzarla nel browser</a></p>
      </div>
    `;
  }

  for (const chunk of chunks) {
    const msgs = chunk.map((to) => ({ 
      to, 
      from: sender, 
      subject, 
      html: emailBody,
      text: emailBody.replace(/<[^>]*>/g, ''), // Fallback text version
      attachments: attachments
    }));
    await sgMail.send(msgs, true);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

module.exports = { sendEmailBatch };

