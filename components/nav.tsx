"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/trade", label: "Log Trade" },
  { href: "/history", label: "History" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-border bg-secondary-background shadow-nav">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-2xl font-heading">
            Paperhands
          </Link>
          <p className="text-sm text-foreground/80">
            Gut-check paper trading journal
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Button
              key={link.href}
              asChild
              variant={pathname === link.href ? "default" : "neutral"}
              size="sm"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
