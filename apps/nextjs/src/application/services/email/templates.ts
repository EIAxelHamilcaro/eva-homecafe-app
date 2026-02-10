const BRAND = {
  name: "HomeCafé",
  primaryColor: "#E8A4B8",
  textColor: "#666",
} as const;

const baseLayout = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h1 style="color: ${BRAND.primaryColor}; margin: 0 0 24px 0; font-size: 28px;">${BRAND.name}</h1>
      ${content}
    </div>
  </div>
</body>
</html>
`;

const button = (href: string, text: string): string => `
<a href="${href}" style="display: inline-block; background-color: ${BRAND.primaryColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 24px; margin: 20px 0; font-weight: 600;">
  ${text}
</a>
`;

const paragraph = (text: string): string =>
  `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">${text}</p>`;

const muted = (text: string): string =>
  `<p style="color: ${BRAND.textColor}; font-size: 14px; line-height: 1.5; margin: 16px 0 0 0;">${text}</p>`;

export const EmailTemplates = {
  passwordReset: (resetUrl: string) => ({
    subject: "Réinitialisation de votre mot de passe",
    html: baseLayout(`
      ${paragraph("Bonjour,")}
      ${paragraph("Vous avez demandé à réinitialiser votre mot de passe.")}
      ${paragraph("Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :")}
      ${button(resetUrl, "Réinitialiser mon mot de passe")}
      ${muted("Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.")}
      ${muted("Ce lien expire dans 1 heure.")}
    `),
  }),

  welcome: (name: string) => ({
    subject: `Bienvenue sur ${BRAND.name} !`,
    html: baseLayout(`
      ${paragraph(`Bonjour ${name},`)}
      ${paragraph(`Bienvenue sur ${BRAND.name} ! Nous sommes ravis de vous compter parmi nous.`)}
      ${paragraph("Commencez dès maintenant à organiser votre quotidien avec chaleur.")}
      ${button(process.env.NEXT_PUBLIC_APP_URL ?? "/", "Découvrir l'application")}
    `),
  }),

  emailVerification: (verificationUrl: string) => ({
    subject: "Vérifiez votre adresse email",
    html: baseLayout(`
      ${paragraph("Bonjour,")}
      ${paragraph("Merci de vous être inscrit ! Veuillez vérifier votre adresse email pour activer votre compte.")}
      ${button(verificationUrl, "Vérifier mon email")}
      ${muted("Si vous n'avez pas créé de compte, ignorez cet email.")}
      ${muted("Ce lien expire dans 24 heures.")}
    `),
  }),

  contactForm: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => ({
    subject: `[Contact] ${data.subject}`,
    html: baseLayout(`
      ${paragraph(`Nouveau message de contact de <strong>${data.name}</strong> (${data.email})`)}
      ${paragraph(`<strong>Sujet :</strong> ${data.subject}`)}
      ${paragraph(data.message.replace(/\n/g, "<br>"))}
      ${muted(`Répondre directement à : ${data.email}`)}
    `),
  }),

  contactConfirmation: (name: string) => ({
    subject: `${BRAND.name} — Nous avons reçu votre message`,
    html: baseLayout(`
      ${paragraph(`Bonjour ${name},`)}
      ${paragraph("Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.")}
      ${paragraph("Merci de nous avoir contactés !")}
      ${muted(`L'équipe ${BRAND.name}`)}
    `),
  }),
} as const;
