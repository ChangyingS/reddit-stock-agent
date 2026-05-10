import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail(to: string[], report: string) {
  const result = await resend.emails.send({
    from: process.env.REPORT_FROM_EMAIL!,
    to,
    subject: "Weekly Reddit Top 10 Hot Stocks Report",
    text: report,
  });

  if (result.error) {
    throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
  }

  return result.data;
}