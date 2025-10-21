import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from 'react-router-dom'; // 🛑 Importar useNavigate

const Login = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate(); // 🛑 Inicializar useNavigate

    // 🛑 LOGICA CLAVE: Redirigir si ya está autenticado y no está cargando
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            // Redirige al dashboard después de iniciar sesión
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);


    const handleAuth0Login = () => {
        // Redirige a Auth0. Auth0 te devolverá a window.location.origin (configurado en App.tsx)
        loginWithRedirect();
    };

    // Si está cargando o ya está autenticado, no renderiza el formulario
    if (isLoading || isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Cargando autenticación...
            </div>
        ); 
    }

    return (
        // ... El resto de tu JSX de Login (sin cambios)
        <div className="flex min-h-screen">
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 to-green-800 items-center justify-center p-12">
                <div className="text-white">
                    <h1 className="text-5xl font-bold mb-4">Sistema de gestión de inventario para librerías</h1>
                    <p className="text-lg opacity-80">Control de productos, ventas, proveedores y alertas de stock bajo. Interfaz moderna, rápida y segura.</p>
                </div>
            </div>

            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8">
                        <h2 className="text-3xl font-bold mb-2">Bienvenido</h2>
                        <p className="text-muted-foreground mb-6">Inicia sesión para acceder al panel</p>

                        <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700" 
                            onClick={handleAuth0Login}
                        >
                            Iniciar sesión con Google/Auth0
                        </Button>

                        {/* Elimino el formulario local para evitar confusiones y el error 'login is not a function' */}
                        <div className="mt-6 flex items-center justify-between">
                            <hr className="w-full border-t border-gray-300" />
                            <span className="px-3 text-sm text-gray-500">O</span>
                            <hr className="w-full border-t border-gray-300" />
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-500 text-center">Utiliza tu cuenta de Auth0/Google para acceder.</p>
                        
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
