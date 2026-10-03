import { redirect } from "next/navigation";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Supabase's email confirmation links can fall back to the bare Site URL
  // (dropping any custom redirect path) when the exact redirect isn't on the
  // allowed list. Forward auth params to the right page instead of losing them.
  if (params.type === "recovery" || params.code) {
    const qs = new URLSearchParams(
      Object.entries(params).flatMap(([k, v]) =>
        v === undefined ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]]
      )
    ).toString();
    redirect(`/es/auth/update-password${qs ? `?${qs}` : ""}`);
  }

  redirect("/es");
}
