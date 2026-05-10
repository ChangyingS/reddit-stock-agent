import { createClient } from "@supabase/supabase-js";
import { getTopRedditStocks } from "@/lib/reddit";
import { generateReport } from "@/lib/report";
import { sendReportEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("subscribers")
    .select("email")
    .eq("active", true);

  if (error || !data) {
    return new Response("Failed to load subscribers", { status: 500 });
  }

  const emails = data.map((item) => item.email);

  const topStocks = await getTopRedditStocks();
  const report = generateReport(topStocks);

  // await sendReportEmail(emails, report);
  const emailResult = await sendReportEmail(emails, report);

  // return Response.json({
  //   success: true,
  //   sent_to: emails.length,
  //   topStocks
  // });

  return Response.json({
    success: true,
    sent_to: emails.length,
    emailResult,
    topStocks
  });

}
// 