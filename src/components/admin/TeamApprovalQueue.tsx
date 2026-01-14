import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";

interface PendingTeam {
    id: string;
    name: string;
    logo_url: string | null;
    tenant_id: string;
    created_at: string;
    tenant?: {
        name: string;
        slug: string;
    };
}

const TeamApprovalQueue = () => {
    const [pendingTeams, setPendingTeams] = useState<PendingTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchPendingTeams = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("teams" as any)
            .select(`
                id,
                name,
                logo_url,
                tenant_id,
                created_at,
                tenants:tenant_id (
                    name,
                    slug
                )
            `)
            .eq("approved", false)
            .not("tenant_id", "is", null)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao carregar times pendentes.", variant: "destructive" });
        } else {
            // Flatten the nested tenant data
            const formatted = (data as any[]).map(team => ({
                ...team,
                tenant: Array.isArray(team.tenants) ? team.tenants[0] : team.tenants
            }));
            setPendingTeams(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingTeams();
    }, []);

    const handleApprove = async (teamId: string) => {
        setProcessing(teamId);
        try {
            const { error } = await supabase
                .from("teams" as any)
                .update({
                    approved: true,
                    tenant_id: null, // Make it global
                    approved_at: new Date().toISOString()
                })
                .eq("id", teamId);

            if (error) throw error;

            toast({
                title: "Aprovado!",
                description: "Time agora está disponível para todas as rádios."
            });
            fetchPendingTeams();
        } catch (e) {
            console.error(e);
            toast({ title: "Erro", description: "Falha ao aprovar time.", variant: "destructive" });
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (teamId: string) => {
        if (!confirm("Tem certeza que deseja rejeitar este time? Ele será excluído.")) return;

        setProcessing(teamId);
        try {
            const { error } = await supabase
                .from("teams" as any)
                .delete()
                .eq("id", teamId);

            if (error) throw error;

            toast({ title: "Rejeitado", description: "Time foi excluído." });
            fetchPendingTeams();
        } catch (e) {
            console.error(e);
            toast({ title: "Erro", description: "Falha ao rejeitar time.", variant: "destructive" });
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <Card className="border-orange-200 border-t-4">
            <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Clock className="w-5 h-5" />
                    Fila de Aprovação de Times ({pendingTeams.length})
                </CardTitle>
                <p className="text-sm text-orange-700">
                    Times criados pelas rádios aguardando aprovação para se tornarem globais.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                {pendingTeams.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">Nenhum time pendente de aprovação</p>
                        <p className="text-sm">Quando as rádios criarem novos times, eles aparecerão aqui.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Logo</TableHead>
                                <TableHead>Nome do Time</TableHead>
                                <TableHead>Criado Por</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingTeams.map(team => (
                                <TableRow key={team.id}>
                                    <TableCell>
                                        <div className="w-12 h-12 bg-white rounded-full p-1 border flex items-center justify-center">
                                            {team.logo_url ? (
                                                <img src={team.logo_url} className="w-full h-full object-contain" alt={team.name} />
                                            ) : (
                                                <span className="text-xs text-gray-300">Logo</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-[#1d244a]">{team.name}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{team.tenant?.name || "Desconhecido"}</div>
                                            <div className="text-xs text-gray-500">/{team.tenant?.slug}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(team.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-500 text-green-700 hover:bg-green-50"
                                                onClick={() => handleApprove(team.id)}
                                                disabled={processing === team.id}
                                            >
                                                {processing === team.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Aprovar
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500 text-red-700 hover:bg-red-50"
                                                onClick={() => handleReject(team.id)}
                                                disabled={processing === team.id}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Rejeitar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default TeamApprovalQueue;
