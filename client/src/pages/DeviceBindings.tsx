import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Smartphone, Unlink, RefreshCw, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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

export default function DeviceBindings() {
  const [searchEmail, setSearchEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [emailToUnbind, setEmailToUnbind] = useState("");

  // Queries
  const { data: bindingsData, refetch: refetchBindings, isLoading } = trpc.deviceBindings.list.useQuery({ limit: 200 });
  const { data: searchResults, refetch: refetchSearch } = trpc.deviceBindings.getByEmail.useQuery(
    { email: searchEmail },
    { enabled: searchEmail.length > 3 }
  );

  // Mutations
  const unbindByEmailMutation = trpc.deviceBindings.unbindByEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Dispositivos desvinculados: ${data.affectedRows}`);
      refetchBindings();
      setEmailToUnbind("");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const unbindAllMutation = trpc.deviceBindings.unbindAll.useMutation({
    onSuccess: (data) => {
      toast.success(`Todos os dispositivos desvinculados: ${data.affectedRows}`);
      refetchBindings();
      setConfirmText("");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const unbindByIdMutation = trpc.deviceBindings.unbindById.useMutation({
    onSuccess: () => {
      toast.success("Dispositivo desvinculado com sucesso");
      refetchBindings();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const reactivateMutation = trpc.deviceBindings.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Dispositivo reativado com sucesso");
      refetchBindings();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleUnbindByEmail = () => {
    if (!emailToUnbind) {
      toast.error("Digite um email válido");
      return;
    }
    unbindByEmailMutation.mutate({ email: emailToUnbind });
  };

  const handleUnbindAll = () => {
    if (confirmText !== "DESVINCULAR TODOS") {
      toast.error("Texto de confirmação incorreto");
      return;
    }
    unbindAllMutation.mutate({ confirmText });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const bindings = bindingsData?.bindings || [];
  const totalActive = bindingsData?.totalActive || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Smartphone className="h-8 w-8" />
            Vinculação de Dispositivos
          </h1>
          <p className="text-muted-foreground">
            Gerencie as vinculações de dispositivos dos usuários
          </p>
        </div>
        <Button onClick={() => refetchBindings()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Ativos</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
            <p className="text-xs text-muted-foreground">
              Vinculações ativas no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bindings.length}</div>
            <p className="text-xs text-muted-foreground">
              Incluindo inativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Ações Rápidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Use com cuidado! Desvincular permite novo login.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Unbind by Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Desvincular por Email
            </CardTitle>
            <CardDescription>
              Desvincula todos os dispositivos associados a um email específico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o email do usuário..."
                value={emailToUnbind}
                onChange={(e) => setEmailToUnbind(e.target.value)}
              />
              <Button 
                onClick={handleUnbindByEmail}
                disabled={unbindByEmailMutation.isPending || !emailToUnbind}
                variant="destructive"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Desvincular
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unbind All */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Desvincular TODOS os Dispositivos
            </CardTitle>
            <CardDescription>
              Remove TODAS as vinculações de dispositivos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Unlink className="h-4 w-4 mr-2" />
                  Desvincular Todos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Esta ação irá desvincular TODOS os dispositivos de TODOS os usuários.</p>
                    <p>Todos os usuários precisarão vincular seus dispositivos novamente no próximo login.</p>
                    <p className="font-semibold">Digite "DESVINCULAR TODOS" para confirmar:</p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DESVINCULAR TODOS"
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmText("")}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUnbindAll}
                    disabled={confirmText !== "DESVINCULAR TODOS" || unbindAllMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Desvinculação Global
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Search by Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Dispositivos por Email
          </CardTitle>
          <CardDescription>
            Pesquise dispositivos vinculados a um email específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o email para buscar..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <Button onClick={() => refetchSearch()} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          
          {searchResults && searchResults.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((binding: any) => (
                    <TableRow key={binding.id}>
                      <TableCell>{binding.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{binding.user_name || "-"}</div>
                          <div className="text-sm text-muted-foreground">{binding.email || binding.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {binding.device_id}
                      </TableCell>
                      <TableCell>{binding.model || "-"}</TableCell>
                      <TableCell>
                        {binding.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(binding.created_at)}</TableCell>
                      <TableCell>
                        {binding.is_active ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => unbindByIdMutation.mutate({ id: binding.id })}
                            disabled={unbindByIdMutation.isPending}
                          >
                            <Unlink className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reactivateMutation.mutate({ id: binding.id })}
                            disabled={reactivateMutation.isPending}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Bindings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Vinculações</CardTitle>
          <CardDescription>
            Lista de todos os dispositivos vinculados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Android</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhuma vinculação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    bindings.map((binding: any) => (
                      <TableRow key={binding.id}>
                        <TableCell>{binding.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{binding.user_name || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{binding.email || binding.user_email || "-"}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[150px] truncate" title={binding.device_id}>
                          {binding.device_id?.substring(0, 20)}...
                        </TableCell>
                        <TableCell>{binding.model || "-"}</TableCell>
                        <TableCell>{binding.android_version || "-"}</TableCell>
                        <TableCell>
                          {binding.is_active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(binding.last_seen)}</TableCell>
                        <TableCell>
                          {binding.is_active ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => unbindByIdMutation.mutate({ id: binding.id })}
                              disabled={unbindByIdMutation.isPending}
                            >
                              <Unlink className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reactivateMutation.mutate({ id: binding.id })}
                              disabled={reactivateMutation.isPending}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
