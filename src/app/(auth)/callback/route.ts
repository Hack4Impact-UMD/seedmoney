import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", origin));
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.redirect(new URL("/?error=missing_supabase_env", origin));
    }

    const response = NextResponse.redirect(new URL("/dashboard", origin));

    const supabase = createSupabaseServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Callback error:", error.message);
      return NextResponse.redirect(new URL("/?error=callback_failed", origin));
    }

    return response;
  } catch (err) {
    console.error("Unexpected callback error:", err);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
