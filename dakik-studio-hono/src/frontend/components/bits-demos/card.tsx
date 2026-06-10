import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/registry/react/components/badge";
import { Button } from "@/registry/react/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardMedia,
} from "@/registry/react/components/card";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Card className="w-full">
        <CardMedia variant="image" className="aspect-video">
          <img
            alt="Project cover"
            src="https://picsum.photos/seed/dakik-card/800/450"
          />
        </CardMedia>
        <CardHeader
          description="Track usage, performance, and costs across every environment."
          title="Project insights"
        >
          <CardAction>
            <Badge pill variant="success">
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Your workspace processed 1.2M requests this week — up 18% from the
            previous period, with p95 latency holding steady at 84ms.
          </p>
        </CardContent>
        <CardFooter className="justify-between">
          <Button size="sm" variant="ghost">
            <Sparkles /> Summarize
          </Button>
          <Button size="sm">
            View report <ArrowRight />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
