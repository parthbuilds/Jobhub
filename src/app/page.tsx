import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Celestial Hawking</h1>
          <p className="text-muted-foreground">Build beautiful career pages in minutes.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your company slug to manage your career page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Company Slug</Label>
              <Input id="slug" placeholder="e.g. acme-corp" defaultValue="acme-corp" />
            </div>
            <div className="text-xs text-muted-foreground">
              Try <span className="font-mono font-bold">acme-corp</span> or <span className="font-mono font-bold">tech-nova</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/acme-corp">Login (Simulated)</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Want to see a public page? <Link href="/acme-corp/careers" className="underline underline-offset-4 hover:text-primary">View Acme Corp</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
