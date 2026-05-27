import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Luxria" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Signed in"); nav({ to: "/admin" }); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created"); nav({ to: "/admin" }); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="font-serif-display text-2xl tracking-[0.25em] block text-center mb-8">LUXRIA</Link>
        <div className="bg-white rounded-2xl border border-border shadow-xl p-8">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <Field id="email-in" label="Email" type="email" value={email} onChange={setEmail} />
                <Field id="pw-in" label="Password" type="password" value={password} onChange={setPassword} />
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <Field id="email-up" label="Email" type="email" value={email} onChange={setEmail} />
                <Field id="pw-up" label="Password (8+ chars)" type="password" value={password} onChange={setPassword} />
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                After signing up, go to the admin page and click "Claim admin" to manage properties.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, type, value, onChange }: { id: string; label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="mt-1.5" />
    </div>
  );
}