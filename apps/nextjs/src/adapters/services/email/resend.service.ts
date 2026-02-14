import { Result } from "@packages/ddd-kit";
import { Resend } from "resend";
import type {
  EmailPayload,
  IEmailProvider,
} from "@/application/ports/email.provider.port";

export class ResendService implements IEmailProvider {
  private client: Resend | null = null;
  private readonly fromEmail: string;
  private readonly isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === "development";
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL ?? "HomeCafé <noreply@homecafe.app>";
  }

  async send(payload: EmailPayload): Promise<Result<void>> {
    const client = this.getClient();

    if (!client) {
      if (this.isDev) {
        this.logEmail(payload);
        return Result.ok();
      }
      return Result.fail("RESEND_API_KEY environment variable is required");
    }

    try {
      const { error } = await client.emails.send({
        from: this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      if (error) {
        return Result.fail(`Email send failed: ${error.message}`);
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Email send failed: ${String(error)}`);
    }
  }

  private getClient(): Resend | null {
    if (this.client) return this.client;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;

    this.client = new Resend(apiKey);
    return this.client;
  }

  private logEmail(payload: EmailPayload): void {
    const url = this.extractUrl(payload.html);
    const deepLink = this.buildDeepLink(url);

    const w = 70;
    const sep = "═".repeat(w);
    const line = (text: string) => `║ ${text.padEnd(w - 2)}║`;

    const lines = [
      "",
      `╔${sep}╗`,
      line("📧 EMAIL (DEV MODE)"),
      `╠${sep}╣`,
      line(`To:      ${payload.to}`),
      line(`Subject: ${payload.subject}`),
    ];

    if (url) {
      lines.push(`╠${sep}╣`);
      lines.push(line("🔗 Action URL:"));
      lines.push(line(url));
    }

    if (deepLink) {
      lines.push(`╠${sep}╣`);
      lines.push(line("📱 Test on mobile (copy & run):"));
      lines.push(line(""));
      lines.push(line(`npx uri-scheme open "${deepLink}" --ios`));
      lines.push(line(""));
    }

    lines.push(`╚${sep}╝`);
    lines.push("");

    console.log(lines.join("\n"));
  }

  private extractUrl(html: string): string | null {
    const match = html.match(/href="([^"]+)"/);
    return match?.[1] ?? null;
  }

  private buildDeepLink(url: string | null): string | null {
    if (!url) return null;

    try {
      if (url.startsWith("/")) {
        const path = url.replace(/^\//, "");
        return `evahomecafeapp://${path}`;
      }

      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\//, "");
      const params = parsed.search;

      return `evahomecafeapp://${path}${params}`;
    } catch {
      return null;
    }
  }
}
