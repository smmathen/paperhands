import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "positive" | "negative";
};

export function StatCard({
  title,
  value,
  subtitle,
  tone = "default",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-base text-foreground/80">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-heading",
            tone === "positive" && "text-chart-4",
            tone === "negative" && "text-chart-2",
          )}
        >
          {value}
        </p>
        {subtitle ? (
          <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
