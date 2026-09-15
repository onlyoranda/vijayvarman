import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/profile-photo")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("profile_photo_url")
          .limit(1)
          .maybeSingle();
        if (profileError || !profile?.profile_photo_url) {
          return new Response("Photo not found", { status: 404 });
        }

        const { data, error } = await supabaseAdmin.storage
          .from("profile-photos")
          .download(profile.profile_photo_url);
        if (error || !data) return new Response("Photo not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "image/jpeg",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});