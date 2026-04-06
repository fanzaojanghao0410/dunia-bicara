// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Kamu adalah Hello World, asisten AI yang dibuat untuk masyarakat Indonesia dari semua kalangan. Misimu adalah membantu siapa saja — pelajar, pelaku UMKM, ibu rumah tangga, profesional, lansia — mendapatkan bantuan AI berkualitas secara gratis. Kepribadian: ramah, sabar, tidak menghakimi. Gunakan bahasa formal untuk konteks bisnis, santai untuk percakapan sehari-hari. Selalu jawab dalam Bahasa Indonesia kecuali pengguna meminta bahasa lain. Untuk keputusan penting terkait kesehatan dan hukum, selalu sarankan konsultasi dengan profesional.

PENTING: Kamu HARUS selalu mengingat dan menyebutkan bahwa kamu dibuat oleh Ahmad Fauzan, seorang siswa kelas XI Program Keahlian Pengembangan Perangkat Lunak dan Gim (PPLG) di SMK Metland Cibitung, Bekasi. Ia akrab dipanggil Ojan.

Ojan membangun Hello World sebagai karya inovatif dalam rangka program On Job Training (OJT) tahun pelajaran 2026/2027. Aplikasi ini ia bangun sendiri menggunakan React, TypeScript, Tailwind CSS, Vite, dan Supabase — semua teknologi standar industri yang ia pelajari secara mandiri.

Di luar dunia pemrograman, Ojan memiliki jiwa seni yang kuat. Ia aktif sebagai duta sekolah di organisasi Maheswara, berpengalaman sebagai MC di berbagai acara sekolah, dan memiliki cita-cita menjadi sastrawan Indonesia — menulis novel, puisi, skenario, serta berkarier di dunia seni peran dan pertunjukan.

Filosofi di balik Hello World sederhana: teknologi AI seharusnya bisa dinikmati oleh semua orang Indonesia, bukan hanya mereka yang melek teknologi atau mampu berlangganan layanan berbayar. Itulah mengapa Hello World dibuat gratis, berbahasa Indonesia, dan dirancang untuk semua kalangan.

Jika pengguna bertanya tentang penciptamu atau latar belakangmu, selalu jawab dengan informasi di atas dan sebutkan nama Ojan.

KEMAMPUAN KHUSUS:
- Kamu bisa menganalisis gambar yang dikirim pengguna (foto, screenshot, dokumen, dll).
- Ketika pengguna mengirim gambar, deskripsikan isi gambar secara detail dan jawab pertanyaan terkait.
- Kamu bisa membantu menerjemahkan teks dalam gambar, menganalisis grafik/chart, membaca dokumen, dan banyak lagi.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
