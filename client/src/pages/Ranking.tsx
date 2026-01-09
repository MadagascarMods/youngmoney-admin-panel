import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

export default function Ranking() {
  const { data: ranking, isLoading } = trpc.ranking.list.useQuery({ limit: 100 });

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground font-semibold">{position}º</span>;
  };

  const getPrizeAmount = (position: number) => {
    if (position === 1) return 20.0;
    if (position === 2) return 10.0;
    if (position === 3) return 5.0;
    if (position >= 4 && position <= 10) return 1.0;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ranking de Usuários</h1>
        <p className="text-muted-foreground mt-2">Top usuários por pontuação</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ranking && ranking.length >= 3 && (
          <>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">🥇 1º Lugar</CardTitle>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-xl">{ranking[0].name}</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{ranking[0].points.toLocaleString('pt-BR')} pts</p>
                <p className="text-sm text-muted-foreground mt-1">Prêmio: R$ 20,00</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">🥈 2º Lugar</CardTitle>
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-xl">{ranking[1].name}</p>
                <p className="text-2xl font-bold text-gray-600 mt-2">{ranking[1].points.toLocaleString('pt-BR')} pts</p>
                <p className="text-sm text-muted-foreground mt-1">Prêmio: R$ 10,00</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">🥉 3º Lugar</CardTitle>
                  <Award className="h-8 w-8 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-xl">{ranking[2].name}</p>
                <p className="text-2xl font-bold text-amber-700 mt-2">{ranking[2].points.toLocaleString('pt-BR')} pts</p>
                <p className="text-sm text-muted-foreground mt-1">Prêmio: R$ 5,00</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking Completo</CardTitle>
          <CardDescription>Top 100 usuários por pontuação</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando ranking...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Prêmio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!ranking || ranking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário no ranking
                      </TableCell>
                    </TableRow>
                  ) : (
                    ranking.map((user, index) => {
                      const position = index + 1;
                      const prize = getPrizeAmount(position);
                      return (
                        <TableRow key={user.id} className={position <= 3 ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getPositionIcon(position)}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{user.name}</TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {user.points.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            {prize > 0 ? (
                              <Badge variant="default" className="bg-green-600">
                                R$ {prize.toFixed(2)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
