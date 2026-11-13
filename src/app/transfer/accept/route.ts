import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/src/lib/supabase-client";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import {
  hashToken,
  sendTransferEmail,
  type AcceptTransferResult,
} from "@/src/lib/campaignTransfers";

// Opening the emailed link accepts the transfer when the signed-in user is the
// invited recipient. Signed-out visitors go to login and must click the link
// again afterwards; the token is not carried through auth.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.nextUrl.origin));

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectTo("/");
  if (!token) return redirectTo("/dashboard?transferError=not_found");

  const { data, error } = await supabase
    .rpc("accept_campaign_transfer", { p_token: token })
    .single();

  if (error || !data) {
    console.error("Error accepting transfer:", error);
    return redirectTo("/dashboard?transferError=failed");
  }

  const { result, campaign_id: campaignId } = data as {
    result: AcceptTransferResult;
    campaign_id: number | null;
  };

  if (result !== "accepted" || campaignId === null) {
    return redirectTo(`/dashboard?transferError=${result}`);
  }

  const { data: transfer } = await createServiceRoleClient()
    .from("campaign_transfers")
    .select("transfer_id")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (transfer) {
    await sendTransferEmail(
      "transfer_completed",
      campaignId,
      transfer.transfer_id,
    );
  }

  return redirectTo(`/dashboard/${campaignId}?transferred=1`);
}
