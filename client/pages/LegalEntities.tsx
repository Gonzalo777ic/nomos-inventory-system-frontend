import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
  Briefcase
} from "lucide-react";

import { LegalEntityService } from "@/api/services/legalEntityService";
import { LegalEntity } from "@/types/store";
import { LegalEntityForm } from "@/components/forms/LegalEntityForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const LegalEntities: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const { data: entities = [], isLoading } = useQuery<LegalEntity[]>({
    queryKey: ["legal-entities"],
    queryFn: LegalEntityService.getAll,
  });


  const filteredEntities = entities.filter(
    (e) =>
      e.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.taxId.includes(searchTerm)
  );


  const handleEdit = (entity: LegalEntity) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro? Si esta entidad tiene documentos asociados, no se podrá eliminar.")) return;
    
    try {
      await LegalEntityService.delete(id);
      toast({ title: "Eliminado", description: "La entidad ha sido eliminada." });
      queryClient.invalidateQueries({ queryKey: ["legal-entities"] });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se puede eliminar. Probablemente ya tiene documentos asociados.", 
        variant: "destructive" 
      });
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
    queryClient.invalidateQueries({ queryKey: ["legal-entities"] });
  };

  return (
    <div className="p-8 space-y-6">
      
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Entidades Legales
          </h1>
          <p className="text-muted-foreground">
            Maestro de empresas emisoras, acreedores y razones sociales.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingEntity(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Nueva Entidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntity ? "Editar Entidad Legal" : "Registrar Nueva Entidad"}
              </DialogTitle>
            </DialogHeader>
            <LegalEntityForm onSuccess={handleSuccess} initialData={editingEntity} />
          </DialogContent>
        </Dialog>
      </div>

      {}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-medium">Directorio de Empresas</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o RUC..."
              className="pl-8 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Razón Social / Nombre</TableHead>
                <TableHead>Identificación (Tax ID)</TableHead>
                <TableHead>Dirección Fiscal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Cargando directorio...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredEntities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No se encontraron entidades registradas.
                  </TableCell>
                </TableRow>
              )}
              {filteredEntities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>
                    <div className={`p-2 rounded-full w-fit ${
                        entity.type === 'LEGAL_ENTITY' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {entity.type === 'LEGAL_ENTITY' ? <Building2 className="w-4 h-4"/> : <User className="w-4 h-4"/>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entity.legalName}
                    {entity.email && (
                        <div className="text-xs text-muted-foreground font-normal">{entity.email}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                        {entity.taxId}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {entity.address || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(entity)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDelete(entity.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalEntities;