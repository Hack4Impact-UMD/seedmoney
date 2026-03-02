import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabase-client";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    // "code" google sends in the URL after the ?
    const code = searchParams.get("code"); 

    if(!code) {
        return NextResponse.redirect(`${origin}/auth?error=no_code`);
    }

    const supabase = await createServerClient();

    //swap google code w/ supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Callback error:", error.message);
        return NextResponse.redirect(`${origin}/auth?error=callback_failed`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
}