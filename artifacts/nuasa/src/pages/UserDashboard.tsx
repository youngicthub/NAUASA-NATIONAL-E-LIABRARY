import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  FileText,
  Download,
  Bookmark,
  Clock,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Eye,
  TrendingUp,
  Loader2,
  Save,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function formatRelative(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const routeToTab = (path: string) => {
  if (path.endsWith("/downloads")) return "downloads";
  if (path.endsWith("/saved")) return "saved";
  if (path.endsWith("/settings")) return "settings";
  if (path.endsWith("/convention")) return "convention";
  return "activity";
};

const UserDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const tab = routeToTab(location.pathname);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  // Recently viewed resources
  const { data: recentlyViewed = [], isLoading: viewsLoading } = useQuery({
    queryKey: ["recently-viewed", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("resource_views")
        .select("id, viewed_at, resource_id, library_resources(id, title, file_type)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      const seen = new Set<string>();
      const unique: typeof data = [];
      for (const row of data || []) {
        if (row.resource_id && !seen.has(row.resource_id) && row.library_resources) {
          seen.add(row.resource_id);
          unique.push(row);
        }
      }
      return unique.slice(0, 10);
    },
    enabled: !!user,
  });

  // Recently read posts
  const { data: recentlyRead = [], isLoading: readsLoading } = useQuery({
    queryKey: ["recently-read-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("post_views")
        .select("id, viewed_at, post_id, blog_posts(id, title, slug, read_time)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      const seen = new Set<string>();
      const unique: typeof data = [];
      for (const row of data || []) {
        if (row.post_id && !seen.has(row.post_id) && row.blog_posts) {
          seen.add(row.post_id);
          unique.push(row);
        }
      }
      return unique.slice(0, 5);
    },
    enabled: !!user,
  });

  // Downloads
  const { data: downloads = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ["my-downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("resource_downloads")
        .select("id, downloaded_at, resource_id, library_resources(id, title, file_type, file_size, file_url)")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Saved resources
  const { data: saved = [], isLoading: savedLoading } = useQuery({
    queryKey: ["my-saved", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_resources")
        .select("id, created_at, resource_id, library_resources(id, title, file_type, category_id, categories:category_id(name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const downloadsCount = downloads.length;
  const savedCount = saved.length;
  const viewedCount = recentlyViewed.length;

  // Convention registrations
  const { data: conventionRegs = [], isLoading: convLoading } = useQuery({
    queryKey: ["my-convention-regs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("convention_registrations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const confirmedConvReg = conventionRegs.find((r: any) => r.payment_status === "successful");

  // Settings form
  const [form, setForm] = useState({
    full_name: "",
    institution: "",
    academic_level: "",
  });
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        institution: profile.institution || "",
        academic_level: profile.academic_level || "",
      });
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          institution: form.institution,
          academic_level: form.academic_level,
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const removeSaved = async (id: string) => {
    await supabase.from("saved_resources").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["my-saved", user?.id] });
    toast.success("Removed from saved");
  };

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="content-container">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 shadow-sm">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-accent" />
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{profile?.full_name || "Member"}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.institution || "—"}</p>
                  {profile?.academic_level && (
                    <Badge variant="secondary" className="mt-2">{profile.academic_level}</Badge>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Download className="w-4 h-4 mx-auto mb-1 text-accent" />
                    <div className="font-semibold text-sm">{downloadsCount}</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Bookmark className="w-4 h-4 mx-auto mb-1 text-accent" />
                    <div className="font-semibold text-sm">{savedCount}</div>
                    <div className="text-xs text-muted-foreground">Saved</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Eye className="w-4 h-4 mx-auto mb-1 text-accent" />
                    <div className="font-semibold text-sm">{viewedCount}</div>
                    <div className="text-xs text-muted-foreground">Viewed</div>
                  </div>
                </div>

                {/* Menu */}
                <nav className="space-y-1">
                  <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${tab === "activity" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"} transition-colors`}>
                    <BookOpen className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link to="/dashboard/downloads" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${tab === "downloads" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"} transition-colors`}>
                    <Download className="w-4 h-4" />
                    My Downloads
                  </Link>
                  <Link to="/dashboard/saved" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${tab === "saved" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"} transition-colors`}>
                    <Bookmark className="w-4 h-4" />
                    Saved Resources
                  </Link>
                  <Link to="/dashboard/convention" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${tab === "convention" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"} transition-colors`}>
                    <Award className="w-4 h-4" />
                    Convention
                    {confirmedConvReg && <CheckCircle2 className="w-3 h-3 ml-auto text-accent" />}
                  </Link>
                  <Link to="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${tab === "settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"} transition-colors`}>
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </nav>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-9"
            >
              {/* Welcome Banner */}
              <div className="hero-gradient bg-grid-pattern rounded-2xl p-6 md:p-8 text-primary-foreground mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                      Welcome back, {firstName}! 👋
                    </h1>
                    <p className="opacity-80">
                      Continue your learning journey with NUASA
                    </p>
                  </div>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit">
                    <Link to="/library">Explore Library</Link>
                  </Button>
                </div>
              </div>

              <Tabs value={tab} onValueChange={(v) => navigate(v === "activity" ? "/dashboard" : `/dashboard/${v}`)} className="space-y-6">
                <TabsList className="bg-card border border-border shadow-sm flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="downloads">Downloads</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                  <TabsTrigger value="convention" className="gap-1.5">
                    Convention
                    {confirmedConvReg && <CheckCircle2 className="w-3 h-3 text-accent" />}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-6">
                  {/* Recently Viewed */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        Recently Viewed
                      </h3>
                      <Link to="/library" className="text-sm text-accent hover:underline">Browse Library</Link>
                    </div>
                    {viewsLoading ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
                    ) : recentlyViewed.length === 0 ? (
                      <div className="py-8 text-center">
                        <Eye className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">You haven't previewed any resources yet.</p>
                        <Button asChild size="sm" variant="outline"><Link to="/library">Explore Library</Link></Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentlyViewed.slice(0, 5).map((item) => {
                          const resource = item.library_resources;
                          if (!resource) return null;
                          return (
                            <Link key={item.id} to={`/library/${resource.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate">{resource.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatRelative(new Date(item.viewed_at))}
                                  {resource.file_type && ` • ${resource.file_type.toUpperCase()}`}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recently Read Articles */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent" />
                        Recently Read Articles
                      </h3>
                      <Link to="/blog" className="text-sm text-accent hover:underline">Browse Blog</Link>
                    </div>
                    {readsLoading ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
                    ) : recentlyRead.length === 0 ? (
                      <div className="py-8 text-center">
                        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">You haven't read any articles yet.</p>
                        <Button asChild size="sm" variant="outline"><Link to="/blog">Explore Blog</Link></Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentlyRead.map((item) => {
                          const post = item.blog_posts;
                          if (!post) return null;
                          return (
                            <Link key={item.id} to={`/blog/${post.slug}`} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatRelative(new Date(item.viewed_at))}
                                  {post.read_time ? ` • ${post.read_time} min read` : ""}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Your Activity</h4>
                          <p className="text-sm text-muted-foreground">Lifetime totals</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-foreground">{viewedCount}</div>
                          <div className="text-sm text-muted-foreground">Resources viewed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">{downloadsCount}</div>
                          <div className="text-sm text-muted-foreground">Downloaded</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Bookmark className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Saved Library</h4>
                          <p className="text-sm text-muted-foreground">Bookmarks across the platform</p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-foreground">{savedCount} item{savedCount === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="downloads" className="space-y-4">
                  {downloadsLoading ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
                  ) : downloads.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <Download className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">You haven't downloaded any resources yet.</p>
                      <Button asChild size="sm"><Link to="/library">Browse Library</Link></Button>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                      {downloads.map((item) => {
                        const r = item.library_resources;
                        if (!r) return null;
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <Download className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{r.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatRelative(new Date(item.downloaded_at))}
                                {r.file_type && ` • ${r.file_type.toUpperCase()}`}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open(r.file_url, "_blank")}>
                              Re-download
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  {savedLoading ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
                  ) : saved.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">You haven't saved any resources yet.</p>
                      <Button asChild size="sm"><Link to="/library">Browse Library</Link></Button>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                      {saved.map((item) => {
                        const r = item.library_resources;
                        if (!r) return null;
                        const cat = (r as { categories?: { name?: string } }).categories;
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <Bookmark className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{r.title}</h4>
                              {cat?.name && <Badge variant="secondary" className="mt-1">{cat.name}</Badge>}
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/library/${r.id}`}>View</Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSaved(item.id)}>
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="convention" className="space-y-6">
                  {convLoading ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
                  ) : conventionRegs.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2 font-medium">You haven't registered for the convention yet.</p>
                      <p className="text-xs text-muted-foreground mb-5">Register as a Student, Graduate, or Chapter to secure your spot.</p>
                      <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link to="/convention">Register Now</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {conventionRegs.map((r: any) => (
                        <div key={r.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                          {/* Status banner */}
                          <div className={`px-6 py-3 flex items-center justify-between ${r.payment_status === "successful" ? "bg-accent/10 border-b border-accent/20" : "bg-muted border-b border-border"}`}>
                            <div className="flex items-center gap-2">
                              {r.payment_status === "successful"
                                ? <CheckCircle2 className="w-4 h-4 text-accent" />
                                : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                              <span className={`text-sm font-semibold capitalize ${r.payment_status === "successful" ? "text-accent" : "text-muted-foreground"}`}>
                                {r.payment_status === "successful" ? "Registration Confirmed" : `Payment ${r.payment_status}`}
                              </span>
                            </div>
                            <Badge variant={r.payment_status === "successful" ? "default" : "secondary"} className={r.payment_status === "successful" ? "bg-accent text-accent-foreground" : ""}>
                              {(r.registration_type || "").replace(/^\w/, (c: string) => c.toUpperCase())}
                            </Badge>
                          </div>

                          <div className="p-6 md:p-7 space-y-5">
                            {/* Registration ID — the most important field */}
                            <div className="text-center">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Convention Registration ID</p>
                              <div className="font-mono text-xl font-bold tracking-wider bg-muted rounded-lg py-3 px-4 text-primary border border-border">
                                {r.reference_code}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Present this ID at the convention check-in desk</p>
                            </div>

                            {/* Key details grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Full Name</p>
                                <p className="font-semibold text-foreground">{r.full_name}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                                <p className="text-foreground truncate">{r.email}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Phone</p>
                                <p className="text-foreground">{r.phone}</p>
                              </div>
                            </div>

                            {/* Breakout session — highlighted */}
                            {r.breakout_session && (
                              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Your Breakout Session
                                </p>
                                <p className="font-semibold text-foreground text-sm">{r.breakout_session}</p>
                              </div>
                            )}

                            {r.institution && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Institution:</span> {r.institution}
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground border-t border-border pt-3">
                              Registered on {r.created_at ? new Date(r.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                            </div>

                            {r.payment_status === "successful" && (
                              <Button asChild variant="outline" size="sm" className="w-full gap-2">
                                <Link to="/convention">View Full Receipt & Print</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-1">Profile Information</h3>
                    <p className="text-sm text-muted-foreground mb-6">Update the details that show on your dashboard.</p>
                    <form
                      onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }}
                      className="space-y-5 max-w-xl"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={profile?.email || ""} disabled />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input
                            id="institution"
                            value={form.institution}
                            onChange={(e) => setForm({ ...form, institution: e.target.value })}
                            placeholder="e.g. University of Lagos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Academic Level</Label>
                          <Select
                            value={form.academic_level}
                            onValueChange={(v) => setForm({ ...form, academic_level: v })}
                          >
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100 Level">100 Level</SelectItem>
                              <SelectItem value="200 Level">200 Level</SelectItem>
                              <SelectItem value="300 Level">300 Level</SelectItem>
                              <SelectItem value="400 Level">400 Level</SelectItem>
                              <SelectItem value="500 Level">500 Level</SelectItem>
                              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" disabled={saveProfile.isPending} className="gap-2">
                        {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save changes
                      </Button>
                    </form>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-1">Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign out of your NUASA account on this device.</p>
                    <Button variant="destructive" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UserDashboard;
