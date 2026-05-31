import { Nav } from "@/components/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
