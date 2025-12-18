import React, { useState, useEffect } from 'react';
import { InternalUser, InternalUserService } from '../api/services/internalUserService.ts';
import { useToast } from '../hooks/use-toast.ts';
import { User, Loader2 } from 'lucide-react';


import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';


type BadgeVariant = "default" | "destructive" | "secondary" | "outline";

const Users: React.FC = () => {
    const [users, setUsers] = useState<InternalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await InternalUserService.getAll();
            setUsers(data);
        } catch (e) {
            console.error("Error fetching users:", e);
            toast({ title: "Error", description: "No se pudieron cargar los usuarios internos.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    const getRoleVariant = (role: string): BadgeVariant => {
        const upperRole = role.toUpperCase();

        if (upperRole.includes('ADMIN')) return 'destructive';
        if (upperRole.includes('SELLER')) return 'default';
        if (upperRole.includes('INVENTORY')) return 'secondary';
        

        if (upperRole.includes('DELIVERY')) return 'outline'; 

        return 'outline';
    };


    const getRoleClassName = (role: string): string => {
        const upperRole = role.toUpperCase();
        

        if (upperRole.includes('DELIVERY')) {

            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300";
        }
        

        if (upperRole.includes('CLIENT')) {
             return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300";
        }

        return "";
    };

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold flex items-center">
                        <User className="w-6 h-6 mr-2" /> Gestión de Usuarios Internos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Cargando usuarios...</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Username (Email)</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Auth0 ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">U-{user.id}</TableCell>
                                        <TableCell>{user.username}</TableCell> 
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                {(user.roles || []).map(role => (
                                                    <Badge 
                                                        key={role} 
                                                        variant={getRoleVariant(role)} 
                                                        className={`uppercase ${getRoleClassName(role)}`}
                                                    >
                                                        {role.replace('ROLE_', '')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.auth0Id ? 'Sí' : 'No'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Users;