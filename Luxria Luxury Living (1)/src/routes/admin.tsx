import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, LogOut, Upload, Image as ImageIcon, X } from "lucide-react";
import type { Property, PropertyImage } from "@/lib/properties";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Luxria" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) return <ClaimAdmin userId={user.id} />;

  return <AdminDashboard />;
}

function ClaimAdmin({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    setBusy(true);
    // Allow claiming only if no admin exists yet
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      toast.error("An admin already exists. Ask them to grant you access.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("You are now admin!"); window.location.reload(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-white rounded-2xl border border-border p-8 shadow-xl">
        <h1 className="font-serif-display text-3xl">Claim admin access</h1>
        <p className="mt-3 text-muted-foreground">
          Your account isn't an admin yet. Click below to become the site administrator.
        </p>
        <Button onClick={claim} disabled={busy} className="mt-6 bg-primary text-primary-foreground w-full">
          {busy ? "Claiming…" : "Claim admin"}
        </Button>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 text-sm text-muted-foreground hover:text-primary">
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Property | null>(null);
  const [open, setOpen] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Property[];
    },
  });

  type Lead = {
    id: string;
    property_id: string | null;
    full_name: string;
    email: string;
    whatsapp: string | null;
    message: string | null;
    created_at: string;
  };

  const { data: leads = [] } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
    refetchInterval: 30000,
  });

  const propertyTitleById = new Map(properties.map((p) => [p.id, p.title]));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-properties"] });
    qc.invalidateQueries({ queryKey: ["properties", "list"] });
  };

  const openNew = () => {
    setEditing({
      id: "",
      slug: "",
      title: "",
      location: "",
      price_amount: 0,
      price_currency: "Rs",
      price_suffix: "M",
      status: "For Sale",
      badge: "New Listing",
      bedrooms: 0,
      bathrooms: 0,
      sqft: 0,
      description: "",
      features: [],
      latitude: null,
      longitude: null,
      is_published: true,
      sort_order: properties.length,
      property_type: "house",
      listing_type: "buy",
    });
    setOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif-display text-2xl tracking-[0.25em]">LUXRIA</Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">View site</Link>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif-display text-4xl">Properties</h1>
            <p className="text-muted-foreground mt-1">{properties.length} listed</p>
          </div>
          <Button onClick={openNew} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> New property
          </Button>
        </div>

        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-sm text-muted-foreground truncate">{p.location} · {p.price_currency} {p.price_amount} {p.price_suffix}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => remove(p.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No properties yet — click "New property" to start.</p>
          )}
        </div>

        {/* Messages / Inquiries */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif-display text-3xl">Messages</h2>
              <p className="text-muted-foreground mt-1">
                {leads.length} {leads.length === 1 ? "inquiry" : "inquiries"} from the contact form
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leads.map((l) => (
              <div key={l.id} className="bg-white border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold">{l.full_name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                      <a href={`mailto:${l.email}`} className="hover:text-primary">{l.email}</a>
                      {l.whatsapp && (
                        <a
                          href={`https://wa.me/${l.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary"
                        >
                          WhatsApp: {l.whatsapp}
                        </a>
                      )}
                    </div>
                    {l.property_id && (
                      <div className="text-xs uppercase tracking-wider text-primary mt-2">
                        Re: {propertyTitleById.get(l.property_id) ?? "Property"}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>
                {l.message && (
                  <p className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap border-l-2 border-primary/40 pl-3">
                    {l.message}
                  </p>
                )}
              </div>
            ))}
            {leads.length === 0 && (
              <p className="text-center text-muted-foreground py-12 bg-white border border-border rounded-xl">
                No messages yet — inquiries from property pages will appear here.
              </p>
            )}
          </div>
        </div>
      </main>

      {editing && (
        <PropertyDialog
          key={editing.id || "new"}
          open={open}
          onOpenChange={setOpen}
          initial={editing}
          onSaved={() => { setOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}

function PropertyDialog({
  open, onOpenChange, initial, onSaved,
}: { open: boolean; onOpenChange: (b: boolean) => void; initial: Property; onSaved: () => void }) {
  const [form, setForm] = useState<Property>({
    ...initial,
    property_type: initial.property_type ?? "house",
    listing_type: initial.listing_type ?? "buy",
    features: Array.isArray(initial.features) ? initial.features : [],
  });
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [featuresText, setFeaturesText] = useState(
    (Array.isArray(initial.features) ? initial.features : []).join("\n"),
  );

  useEffect(() => {
    if (!form.id) { setImages([]); return; }
    supabase.from("property_images").select("*").eq("property_id", form.id).order("sort_order").then(({ data }) => {
      setImages((data ?? []) as PropertyImage[]);
    });
  }, [form.id]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const parseMapUrl = (url: string): { lat: number; lng: number } | null => {
    if (!url) return null;
    // Patterns: @lat,lng | !3dLAT!4dLNG | q=lat,lng | ll=lat,lng | /lat,lng
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /[?&](?:q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /\/(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return { lat: Number(m[1]), lng: Number(m[2]) };
    }
    return null;
  };

  const onMapLinkChange = (url: string) => {
    const parsed = parseMapUrl(url.trim());
    if (parsed) {
      setForm((f) => ({ ...f, latitude: parsed.lat, longitude: parsed.lng }));
      toast.success("Location detected from map link");
    } else if (url.trim()) {
      toast.error("Could not detect coordinates. Open the link in Google Maps and copy the full URL with @lat,lng");
    }
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      location: form.location,
      price_amount: form.price_amount,
      price_currency: form.price_currency,
      price_suffix: form.price_suffix,
      status: form.status,
      badge: form.badge,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      sqft: form.sqft,
      description: form.description,
      features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      latitude: form.latitude,
      longitude: form.longitude,
      is_published: form.is_published,
      sort_order: form.sort_order,
      property_type: form.property_type,
      listing_type: form.listing_type,
    };

    if (form.id) {
      const { error } = await supabase.from("properties").update(payload).eq("id", form.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setSaving(false);
    toast.success("Saved");
    onSaved();
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || !form.id) {
      if (!form.id) toast.error("Save the property first, then upload images.");
      return;
    }
    for (const file of Array.from(files)) {
      const path = `${form.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("property-images").upload(path, file);
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
      await supabase.from("property_images").insert({
        property_id: form.id,
        url: pub.publicUrl,
        storage_path: path,
        sort_order: images.length,
      });
    }
    const { data } = await supabase.from("property_images").select("*").eq("property_id", form.id).order("sort_order");
    setImages((data ?? []) as PropertyImage[]);
    toast.success("Images uploaded");
  };

  const removeImage = async (img: PropertyImage) => {
    await supabase.from("property_images").delete().eq("id", img.id);
    if (img.storage_path) await supabase.storage.from("property-images").remove([img.storage_path]);
    setImages((s) => s.filter((i) => i.id !== img.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit property" : "New property"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <F label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></F>
          <F label="Slug (URL)"><Input value={form.slug} placeholder="auto from title" onChange={(e) => setForm({ ...form, slug: e.target.value })} /></F>
          <F label="Location" full><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></F>
          <F label="Currency"><Input value={form.price_currency} onChange={(e) => setForm({ ...form, price_currency: e.target.value })} /></F>
          <F label="Price amount"><Input type="number" step="0.1" value={form.price_amount} onChange={(e) => setForm({ ...form, price_amount: Number(e.target.value) })} /></F>
          <F label="Price suffix (e.g. M)"><Input value={form.price_suffix ?? ""} onChange={(e) => setForm({ ...form, price_suffix: e.target.value })} /></F>
          <F label="Status"><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></F>
          <F label="Badge"><Input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} /></F>
          <F label="Type" full>
            <select
              value={form.property_type}
              onChange={(e) => setForm({ ...form, property_type: e.target.value as Property["property_type"] })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="house">House</option>
              <option value="villa">Villa/Bungalow</option>
              <option value="commercial">Commercial space</option>
              <option value="land">Land</option>
            </select>
          </F>
          <F label="Listing" full>
            <select
              value={form.listing_type}
              onChange={(e) => setForm({ ...form, listing_type: e.target.value as Property["listing_type"] })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="buy">For sale (Buy)</option>
              <option value="rent">For rent</option>
              <option value="both">Both (rent & buy)</option>
            </select>
          </F>
          <F label="Bedrooms"><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} /></F>
          <F label="Bathrooms"><Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} /></F>
          <F label="Sq ft"><Input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: Number(e.target.value) })} /></F>
          <F label="Google Maps link (paste URL)" full>
            <Input
              placeholder="https://www.google.com/maps/place/.../@-20.123,57.456,15z"
              onBlur={(e) => onMapLinkChange(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                setTimeout(() => onMapLinkChange(text), 0);
              }}
            />
          </F>
          <F label="Latitude"><Input type="number" step="0.000001" value={form.latitude ?? ""} onChange={(e) => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })} /></F>
          <F label="Longitude"><Input type="number" step="0.000001" value={form.longitude ?? ""} onChange={(e) => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })} /></F>
          <F label="Sort order"><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></F>
          <F label="Description" full>
            <Textarea rows={5} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </F>
          <F label="Features (one per line)" full>
            <Textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
          </F>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Photos</Label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
              <Upload className="w-4 h-4" /> Upload
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
            </label>
          </div>
          {!form.id && (
            <p className="text-xs text-muted-foreground mb-3">Save the property first, then upload photos.</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(img)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-3 border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                <ImageIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No photos yet
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}