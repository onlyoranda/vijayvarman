import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Streams the active resume PDF for the requested tone from private storage.
export const Route = createFileRoute("/api/public/resume")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const tone = new URL(request.url).searchParams.get("tone");
        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!supabaseUrl || !publishableKey) {
          return new Response("Not configured", { status: 500 });
        }
        const publicClient = createClient(supabaseUrl, publishableKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: profile } = await publicClient
          .from("profiles")
          .select("first_name, resume_url_professional, resume_url_conversational")
          .limit(1)
          .maybeSingle();
        if (!profile) return new Response("Resume not available", { status: 404 });

        let path =
          tone === "conversational"
            ? (profile.resume_url_conversational ?? profile.resume_url_professional)
            : (profile.resume_url_professional ?? profile.resume_url_conversational);
        if (!path) return new Response("Resume not available", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: blob, error } = await supabaseAdmin.storage.from("resumes").download(path);
        if (error || !blob) return new Response("Resume not available", { status: 404 });

        const safeName = (profile.first_name ?? "resume").replace(/[^A-Za-z-]/g, "");
        return new Response(await blob.arrayBuffer(), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeName}-Resume.pdf"`,
            "Cache-Control": "private, max-age=300",
          },
        });
      },
    },
  },
});
