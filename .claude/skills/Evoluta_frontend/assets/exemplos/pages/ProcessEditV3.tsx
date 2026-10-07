// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProcessFormV3 from "./ProcessFormV3";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processApi } from "@/services/api/endpoints";
import { Process } from "@/types/process";
import { envioDaFicha, valoresIniciaisDaFicha } from "@/features/processos/ficha";
import { PastaDoProcesso } from "@/components/mesa/PastaDoProcesso";
import { AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";
import { SituacaoDaFicha } from "@/features/processos/SituacaoDaFicha";


const ProcessEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: process, isLoading, error, refetch } = useQuery<Process>({
    queryKey: ["process", id],
    queryFn: () => processApi.get(id!),
    enabled: !!id,
  });

  const updateProcess = useMutation({
    mutationFn: async (data: any) => {
      const payload = envioDaFicha(data, process?.status);

      const response = await processApi.update(id, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      queryClient.invalidateQueries({ queryKey: ["process", id] });
      toast({
        title: "Processo atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      navigate(`/processes/${id}`);
    },
    onError: (error) => {
      console.error("Error updating process:", error);
      toast({
        title: "Erro ao atualizar processo",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: typeof initialValues) => {
    try {
      if (!id) return;

      const updateData = {
        ...values,
        modality_id: Number(values?.modality_id)
      };
      await updateProcess.mutateAsync(updateData);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  // Com o processo em mãos, uma atualização que falha não o dá como removido
  if (!process) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Processo não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            O processo que você está tentando editar não existe ou foi removido.
          </p>
          <button
            onClick={() => navigate("/processes")}
            className="gradient-primary px-4 py-2 rounded"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  // Datas lidas como dia local: new Date("AAAA-MM-DD") gravava um dia antes a cada edição
  const initialValues = valoresIniciaisDaFicha(process);

  return (
    <PastaDoProcesso processo={process} compacta>
      {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">Ficha do processo</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O que está aqui sai na capa dos autos e em todo documento gerado. Quanto mais detalhado o objeto, melhores os
            documentos que a IA escreve.
          </p>
          <ProcessFormV3 initialValues={initialValues} onSubmit={onSubmit} isEditing={true} submitButtonText="Salvar alterações" naPasta />
        </div>
        <SituacaoDaFicha processo={process} />
      </div>
    </PastaDoProcesso>
  );
};

export default ProcessEdit;
