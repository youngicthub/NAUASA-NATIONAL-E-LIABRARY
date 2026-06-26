import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Users, Loader2, Search, Shield, Trash2, ShieldCheck, ShieldOff,
  ShieldAlert, Clock, CheckCircle2, XCircle, FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getAdminRequests,
  removeAdminRequest,
  type AdminRequest,
} from "@/pages/AdminRegister";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AdminRequest[]>([]);

  useEffect(() => {
    setPendingRequests(getAdminRequests());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, user_id, full_name, email, institution, academic_level, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));
      return (profiles || []).map((p) => ({ ...p, role: roleMap.get(p.user_id) || "user" }));
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.institution?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const admins = useMemo(() => filtered.filter((u) => u.role === "admin"), [filtered]);
  const regularUsers = useMemo(() => filtered.filter((u) => u.role !== "admin"), [filtered]);
  const adminCount = data?.filter((u) => u.role === "admin").length ?? 0;

  const filteredPending = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pendingRequests;
    return pendingRequests.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }, [pendingRequests, search]);

  const setUserRole = async (userId: string, role: "admin" | "user") => {
    const { error: delErr } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (delErr) throw delErr;
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (insErr) throw insErr;
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: userId },
      });
      if (error || (data as any)?.error)
        throw new Error(error?.message || (data as any).error);
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePromoteToAdmin = async (userId: string, name: string) => {
    setPromotingId(userId);
    try {
      await setUserRole(userId, "admin");
      toast.success(`${name || "User"} has been granted admin access`);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to promote user");
    } finally {
      setPromotingId(null);
    }
  };

  const handleRevokeAdmin = async (userId: string, name: string) => {
    setPromotingId(userId);
    try {
      await setUserRole(userId, "user");
      toast.success(`Admin access revoked for ${name || "user"}`);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke admin");
    } finally {
      setPromotingId(null);
    }
  };

  const handleApproveRequest = async (req: AdminRequest) => {
    setPromotingId(req.id);
    try {
      await setUserRole(req.userId, "admin");
      removeAdminRequest(req.id);
      setPendingRequests(getAdminRequests());
      toast.success(`${req.fullName} has been approved as admin`);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to approve request");
    } finally {
      setPromotingId(null);
    }
  };

  const handleRejectRequest = (req: AdminRequest) => {
    removeAdminRequest(req.id);
    setPendingRequests(getAdminRequests());
    toast.success(`Request from ${req.fullName} has been rejected`);
  };

  const UserRow = ({
    u,
    showAdminActions,
  }: {
    u: NonNullable<typeof data>[0];
    showAdminActions: boolean;
  }) => (
    <TableRow>
      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
      <TableCell className="text-sm">{u.institution || "—"}</TableCell>
      <TableCell className="text-sm">{u.academic_level || "—"}</TableCell>
      <TableCell>
        {u.role === "admin" ? (
          <Badge className="gap-1"><Shield className="w-3 h-3" /> Admin</Badge>
        ) : (
          <Badge variant="outline">User</Badge>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {format(new Date(u.created_at), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {u.user_id !== currentUser?.id && showAdminActions && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1 text-xs"
                  disabled={promotingId === u.user_id}
                >
                  {promotingId === u.user_id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ShieldCheck className="w-3.5 h-3.5" />}
                  Authorize Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" /> Grant Admin Access
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to grant admin access to <strong>{u.full_name || u.email}</strong>.
                    They will be able to manage resources, blog posts, users, and all admin settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handlePromoteToAdmin(u.user_id, u.full_name || "")}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Grant Admin Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {u.user_id !== currentUser?.id && !showAdminActions && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1 text-xs"
                  disabled={promotingId === u.user_id}
                >
                  {promotingId === u.user_id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <ShieldOff className="w-3.5 h-3.5" />}
                  Revoke Admin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-600" /> Revoke Admin Access
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to revoke admin access from <strong>{u.full_name || u.email}</strong>.
                    They will no longer be able to access the admin dashboard. This can be undone at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRevokeAdmin(u.user_id, u.full_name || "")}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Revoke Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {u.user_id !== currentUser?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={deletingId === u.user_id}
                >
                  {deletingId === u.user_id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes {u.full_name} ({u.email}), their profile and role.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(u.user_id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const UserTable = ({
    rows,
    showAdminActions,
    emptyMessage,
  }: {
    rows: NonNullable<typeof data>;
    showAdminActions: boolean;
    emptyMessage: string;
  }) => (
    <div className="bg-card rounded-2xl border border-border">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !rows.length ? (
        <div className="py-20 text-center text-muted-foreground">{emptyMessage}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <UserRow key={u.id} u={u} showAdminActions={showAdminActions} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                Users & Admin Access
              </h1>
              <p className="text-muted-foreground">
                Manage registered users and authorize admin access.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-card rounded-xl border border-border px-5 py-3">
                <div className="text-xs text-muted-foreground">Total Users</div>
                <div className="text-xl font-bold">{data?.length ?? 0}</div>
              </div>
              <div className="bg-card rounded-xl border border-border px-5 py-3">
                <div className="text-xs text-muted-foreground">Admins</div>
                <div className="text-xl font-bold">{adminCount}</div>
              </div>
              {pendingRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3">
                  <div className="text-xs text-yellow-700">Pending</div>
                  <div className="text-xl font-bold text-yellow-700">{pendingRequests.length}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border mb-6">
            <div className="p-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, institution or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 shadow-none"
              />
            </div>
          </div>

          <Tabs defaultValue={pendingRequests.length > 0 ? "pending" : "users"} className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-1 bg-yellow-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Regular Users
                {regularUsers.length > 0 && (
                  <span className="ml-1 bg-muted-foreground/20 text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {regularUsers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Shield className="w-4 h-4" />
                Admins
                {adminCount > 0 && (
                  <span className="ml-1 bg-muted-foreground/20 text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {adminCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Pending Requests ── */}
            <TabsContent value="pending">
              {filteredPending.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border py-20 text-center">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground font-medium">No pending admin requests</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    When someone registers via the Admin Registration page, their request will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                  {filteredPending.map((req) => (
                    <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {(req.fullName || req.email).slice(0, 1).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{req.fullName}</span>
                          <span className="text-sm text-muted-foreground">{req.email}</span>
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 gap-1 text-xs">
                            <Clock className="w-3 h-3" /> Pending
                          </Badge>
                        </div>

                        <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed">{req.reason}</p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Requested {format(new Date(req.requestedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                              disabled={promotingId === req.id}
                            >
                              {promotingId === req.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" /> Approve Admin Request
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to approve <strong>{req.fullName}</strong> ({req.email}) as an admin.
                                They will immediately gain access to the admin dashboard.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleApproveRequest(req)}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                Approve & Grant Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm" variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                              disabled={promotingId === req.id}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject this request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                The request from <strong>{req.fullName}</strong> will be removed.
                                Their account will remain as a regular user. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRejectRequest(req)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject Request
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Regular Users ── */}
            <TabsContent value="users">
              <div className="mb-3 flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Click <strong>Authorize Admin</strong> next to a user to grant them admin access immediately.
                </span>
              </div>
              <UserTable
                rows={regularUsers}
                showAdminActions={true}
                emptyMessage="No regular users found."
              />
            </TabsContent>

            {/* ── Admins ── */}
            <TabsContent value="admins">
              <div className="mb-3 flex items-center gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  You can <strong>Revoke Admin</strong> access from any admin below (except your own account).
                </span>
              </div>
              <UserTable
                rows={admins}
                showAdminActions={false}
                emptyMessage="No admins found."
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
