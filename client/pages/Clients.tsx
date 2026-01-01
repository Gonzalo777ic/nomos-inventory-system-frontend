import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'; 
import { Button } from '../components/ui/button'; 
import { Loader2 } from 'lucide-react';
import { Client, ClientService } from '../api/services/client';
import toast from 'react-hot-toast';




const ClientsPage: React.FC = () => {

    const { data: clients, isLoading, isError, error } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: ClientService.getAll,
        staleTime: 60 * 1000,
    });


    const formatValue = (value: string | number | null | undefined): string => {

        if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) {
            return "No definido";
        }
        return String(value);
    };


    const handleViewDetails = (client: Client) => {

        toast(`Abriendo detalles para: ${client.fullName}`, { icon: '' });
        console.log("Detalles del cliente:", client);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-screen">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-emerald-600" />
                <span className="text-lg text-emerald-600">Cargando clientes...</span>
            </div>
        );
    }

    if (isError) {

        return (
            <div className="p-8 text-red-600 font-medium">
                 Error al cargar los clientes: {error?.message || "Error desconocido"}
                <p className="text-sm text-gray-500">Asegúrate de tener el rol ROLE_ADMIN.</p>
            </div>
        );
    }




    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6"> Clientes Registrados</h1>
            
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[180px]">Nombre Completo</TableHead>
                            <TableHead>Email</TableHead>
                            {}
                            <TableHead className="text-center">Tipo Doc.</TableHead>
                            <TableHead>N° Documento</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead className="text-center w-[120px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients && clients.length > 0 ? (
                            clients.map((client) => (
                                <TableRow key={client.id} className="hover:bg-emerald-50/50">
                                    <TableCell className="font-medium text-gray-700">{client.id}</TableCell>
                                    <TableCell className="font-medium">{formatValue(client.fullName)}</TableCell>
                                    <TableCell>{formatValue(client.email)}</TableCell>
                                    
                                    {}
                                    <TableCell className="text-center text-sm">
                                        {formatValue(client.documentType)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatValue(client.documentNumber)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatValue(client.phone)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatValue(client.address)}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleViewDetails(client)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {}
                                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                    No se encontraron clientes registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ClientsPage;