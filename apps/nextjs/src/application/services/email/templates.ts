const BRAND = {
  name: "HomeCafé",
  pink: "#f691c3",
  pinkDark: "#ec4899",
  cream: "#fff8f0",
  pinkBg: "#fdf2f8",
  text: "#2b1e1c",
  textMuted: "#6b5e5e",
  textLight: "#9b8e8e",
  border: "#f3e8e8",
  white: "#ffffff",
} as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.pinkBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.pinkBg}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding: 0 0 32px;">
              <a href="${APP_URL}" style="text-decoration: none; color: ${BRAND.pinkDark}; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                ${BRAND.name}
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 0 0;">
              <p style="margin: 0; color: ${BRAND.textLight}; font-size: 12px; line-height: 1.5;">
                ${BRAND.name} &mdash; Ton espace cosy pour organiser ta vie
              </p>
              <p style="margin: 4px 0 0; color: ${BRAND.textLight}; font-size: 12px;">
                <a href="${APP_URL}/settings" style="color: ${BRAND.textLight}; text-decoration: underline;">G\u00e9rer mes pr\u00e9f\u00e9rences email</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function header(emoji: string, title: string, subtitle?: string): string {
  return `<td style="background: linear-gradient(135deg, ${BRAND.pinkDark}, ${BRAND.pink}); padding: 32px 32px 28px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 36px; line-height: 1;">${emoji}</p>
                <h1 style="margin: 0; color: ${BRAND.white}; font-size: 22px; font-weight: 700; line-height: 1.3;">${title}</h1>
                ${subtitle ? `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${subtitle}</p>` : ""}
              </td>`;
}

function body(content: string): string {
  return `<td style="padding: 32px;">
                ${content}
              </td>`;
}

function p(text: string): string {
  return `<p style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">${text}</p>`;
}

function muted(text: string): string {
  return `<p style="margin: 0; color: ${BRAND.textLight}; font-size: 13px; line-height: 1.5;">${text}</p>`;
}

function button(href: string, text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 8px 0 16px;">
                      <a href="${href}" style="display: inline-block; padding: 14px 36px; background-color: ${BRAND.pinkDark}; color: ${BRAND.white}; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px;">
                        ${text}
                      </a>
                    </td>
                  </tr>
                </table>`;
}

function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 20px 0;" />`;
}

function infoBox(text: string): string {
  return `<div style="background-color: ${BRAND.cream}; border-radius: 10px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">${text}</p>
                </div>`;
}

export const EmailTemplates = {
  passwordReset: (resetUrl: string) => ({
    subject: `${BRAND.name} \u2014 R\u00e9initialisation de votre mot de passe`,
    html: baseLayout(`
              <tr>${header("\uD83D\uDD12", "R\u00e9initialiser votre mot de passe")}</tr>
              <tr>${body(`
                ${p("Bonjour,")}
                ${p("Vous avez demand\u00e9 \u00e0 r\u00e9initialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau\u00a0:")}
                ${button(resetUrl, "Choisir un nouveau mot de passe")}
                ${divider()}
                ${muted("Si vous n\u2019avez pas fait cette demande, ignorez simplement cet email. Votre mot de passe ne sera pas modifi\u00e9.")}
                ${muted("Ce lien expire dans 1\u00a0heure.")}
              `)}</tr>
    `),
  }),

  welcome: (name: string) => ({
    subject: `Bienvenue sur ${BRAND.name}\u00a0! \u2615`,
    html: baseLayout(`
              <tr>${header("\u2615", `Bienvenue, ${name}\u00a0!`, "On est ravis de t\u2019accueillir")}</tr>
              <tr>${body(`
                ${p(`Ton compte ${BRAND.name} est pr\u00eat\u00a0! Tu peux maintenant\u00a0:`)}
                ${infoBox(`
                  \u2728 <strong>Tenir ton journal</strong> quotidien<br>
                  \uD83C\uDFA8 <strong>Cr\u00e9er des moodboards</strong> inspirants<br>
                  \uD83D\uDC9B <strong>Suivre ton humeur</strong> au fil des jours<br>
                  \uD83D\uDC6B <strong>Partager</strong> avec tes proches
                `)}
                ${button(APP_URL, `D\u00e9couvrir ${BRAND.name}`)}
              `)}</tr>
    `),
  }),

  emailVerification: (verificationUrl: string) => ({
    subject: `${BRAND.name} \u2014 V\u00e9rifiez votre adresse email`,
    html: baseLayout(`
              <tr>${header("\u2709\uFE0F", "V\u00e9rifiez votre email")}</tr>
              <tr>${body(`
                ${p("Bonjour,")}
                ${p("Merci de vous \u00eatre inscrit\u00a0! Pour activer votre compte, veuillez confirmer votre adresse email\u00a0:")}
                ${button(verificationUrl, "V\u00e9rifier mon email")}
                ${divider()}
                ${muted("Si vous n\u2019avez pas cr\u00e9\u00e9 de compte, ignorez cet email.")}
                ${muted("Ce lien expire dans 24\u00a0heures.")}
              `)}</tr>
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
              <tr>${header("\uD83D\uDCEC", "Nouveau message de contact")}</tr>
              <tr>${body(`
                ${infoBox(`
                  <strong>De\u00a0:</strong> ${data.name}<br>
                  <strong>Email\u00a0:</strong> ${data.email}<br>
                  <strong>Sujet\u00a0:</strong> ${data.subject}
                `)}
                ${p(data.message.replace(/\n/g, "<br>"))}
                ${divider()}
                ${muted(`R\u00e9pondre directement \u00e0\u00a0: <a href="mailto:${data.email}" style="color: ${BRAND.pinkDark};">${data.email}</a>`)}
              `)}</tr>
    `),
  }),

  contactConfirmation: (name: string) => ({
    subject: `${BRAND.name} \u2014 Nous avons re\u00e7u votre message`,
    html: baseLayout(`
              <tr>${header("\u2705", "Message bien re\u00e7u\u00a0!")}</tr>
              <tr>${body(`
                ${p(`Bonjour ${name},`)}
                ${p("Nous avons bien re\u00e7u votre message et nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.")}
                ${p("Merci de nous avoir contact\u00e9s\u00a0!")}
                ${divider()}
                ${muted(`L\u2019\u00e9quipe ${BRAND.name}`)}
              `)}</tr>
    `),
  }),

  friendInvite: (senderName: string, inviteUrl: string) => ({
    subject: `${senderName} t\u2019invite sur ${BRAND.name}\u00a0!`,
    html: baseLayout(`
              <tr>${header("\uD83D\uDC8C", `${senderName} t\u2019invite\u00a0!`, "Rejoins-le sur HomeCaf\u00e9")}</tr>
              <tr>${body(`
                ${p(`<strong>${senderName}</strong> t\u2019invite \u00e0 rejoindre <strong>${BRAND.name}</strong>, l\u2019application pour organiser ton quotidien et partager tes moments pr\u00e9f\u00e9r\u00e9s avec tes proches.`)}
                ${button(inviteUrl, "Rejoindre HomeCaf\u00e9")}
                ${divider()}
                ${muted("Ce lien est valide pendant 24\u00a0heures.")}
              `)}</tr>
    `),
  }),

  notification: (data: { type: string; title: string; body: string }) => {
    const config: Record<string, { emoji: string; heading: string }> = {
      friend_request: {
        emoji: "\uD83D\uDC4B",
        heading: "Nouvelle demande d\u2019ami",
      },
      friend_accepted: {
        emoji: "\uD83C\uDF89",
        heading: "Demande d\u2019ami accept\u00e9e",
      },
      new_message: { emoji: "\uD83D\uDCAC", heading: "Nouveau message" },
      reward_earned: {
        emoji: "\uD83C\uDFC6",
        heading: "Nouveau badge obtenu\u00a0!",
      },
    };
    const { emoji, heading } = config[data.type] ?? {
      emoji: "\uD83D\uDD14",
      heading: "Nouvelle notification",
    };

    return {
      subject: `${BRAND.name} \u2014 ${heading}`,
      html: baseLayout(`
              <tr>${header(emoji, heading)}</tr>
              <tr>${body(`
                ${p(`<strong>${data.title}</strong>`)}
                ${p(data.body)}
                ${button(`${APP_URL}/notifications`, "Voir mes notifications")}
                ${divider()}
                ${muted("Vous recevez cet email car les notifications par email sont activ\u00e9es dans vos param\u00e8tres.")}
              `)}</tr>
      `),
    };
  },
} as const;
