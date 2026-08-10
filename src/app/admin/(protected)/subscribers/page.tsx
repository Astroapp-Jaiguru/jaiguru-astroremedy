import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function AdminSubscribersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Subscribers</h1>
        <p className="text-sm text-muted-foreground">Email newsletter subscribers.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The public site does not have an email capture form yet. Once a
            newsletter signup is added to the footer or homepage, subscribers
            will be listed here automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Planned: export to CSV, unsubscribe management and opt-in consent logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}