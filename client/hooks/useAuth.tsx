import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useRef } from "react";
// 🛑 Importar setLogoutFunction
import { useAuthStore } from "../store/auth"; 

// Definir el tipo de retorno para getAuthToken
interface AuthTokenResult {
    token: string;
    roles: string[];
    // Otros claims si los necesitas
    // 🛑 NUEVO: Devolver los claims completos para guardarlos en el store
    claims: any; 
}

/**
 * Hook personalizado que envuelve useAuth0 para proveer funciones esenciales
 * como el estado de autenticación y la obtención del token para el backend.
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    isLoading,
    logout: auth0Logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  // 🛑 Desestructurar setLogoutFunction
  const { setIsAuthReady, setLogoutFunction, setUser } = useAuthStore(); 

  const isSyncedRef = useRef(false); 

  // 🛑 1. Crear la función de logout real, que envuelve auth0Logout
  const logout = useCallback(() => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    // Limpiar el estado localmente también
    setUser(null); 
  }, [auth0Logout, setUser]);

  // 🛑 2. Inyectar la función de logout real en la tienda Zustand
  useEffect(() => {
    setLogoutFunction(logout);
  }, [logout, setLogoutFunction]);


  /**
   * Función estable para obtener y loguear el token, y DEVOLVER LOS ROLES.
   */
// 🛑 CAMBIAR EL TIPO DE RETORNO para devolver el token y los roles.
const getAuthToken = useCallback(async (): Promise<AuthTokenResult | undefined> => {
    if (!isAuthenticated) return undefined;

    try {
      // 1. Pedimos el token
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://nomos.inventory.api",
          scope: "openid profile email"
        }
      });

      // 2. OBTENER CLAIMS DEL ID TOKEN (donde están los roles)
      const claims = await getIdTokenClaims();
      const roleClaim = "https://nomosstore.com/roles"; 
      
      // 🛑 Extraer los roles. Si no existe, devuelve un array vacío.
      const roles: string[] = claims && claims[roleClaim] ? (claims[roleClaim] as string[]) : [];

      // ✅ LOGGING PARA INSPECCIÓN
      console.log("--- Token JWT de Auth0 Obtenido ---");
      console.log("Token Completo:", token);

      try {
          const payload = token.split('.')[1];
          // Decodificación simplificada (la que funciona)
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/'); 
          const decodedPayload = JSON.parse(atob(base64)); 
          
          console.log(`👤 Usuario: ${user?.name || user?.nickname || 'N/A'}`);
          console.log(`🆔 Sub (UserID): ${user?.sub}`);

          if (roles && roles.length > 0) {
              console.log(`✅ Roles (Claim '${roleClaim}'):`, roles); 
          } else {
              console.warn(`❌ Rol no encontrado o vacío.`);
          }
          console.log("Payload Decodificado (Claims):", decodedPayload);

      } catch(e) {
          console.error("Error al decodificar o analizar el payload del token:", e);
      }
      console.log("---------------------------------------");

      // 🛑 Devolvemos el token, los roles Y los claims (donde están los roles)
      return { token, roles, claims }; 
    } catch (error) {
      console.error("Error al obtener el token de Auth0:", error);
      return undefined;
    }
  }, [isAuthenticated, getAccessTokenSilently, user, getIdTokenClaims]); 
  
  
  useEffect(() => {
        if (isAuthenticated && user && !isLoading) {
            
            // 🛑 Sincroniza el usuario y establece el usuario en la tienda Zustand
            const authStoreUser = {
                sub: user.sub || '',
                email: user.email,
                name: user.name,
                nickname: user.nickname,
            };
            // 🛑 NOTA: setUser se moverá dentro del .then para añadir los claims.
            // Si ya se sincronizó, no lo hagas de nuevo.
            if (isSyncedRef.current) return;


            // Función para llamar al backend localmente
            // 🛑 MODIFICAR PARA ACEPTAR ROLES
            const syncUserToBackend = async (roles: string[]) => { 
                
                // 🛑 CREAR EL OBJETO CON EL NUEVO CAMPO ROLES
                const userData = {
                    auth0Id: user.sub, 
                    email: user.email, 
                    // 🛑 AÑADIR EL CAMPO ROLES
                    roles: roles 
                };

                try {
                    console.log("🚀 Sincronizando usuario a backend local...");
                    const response = await fetch('http://localhost:8080/api/auth/auth0-upsert', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) {
                        const errorBody = await response.text();
                        console.error('❌ Sync failed. Response:', response.status, errorBody);
                        throw new Error('Sincronización fallida al backend local.');
                    }
                    console.log('✅ Usuario sincronizado con éxito vía frontend.');
                    
                    // 🛑 Marcar como sincronizado para evitar llamadas repetidas
                    isSyncedRef.current = true; 

                } catch (error) {
                    console.error('❌ Error al llamar al backend de sincronización:', error);
                }
            };
            
            // 🛑 1. Ejecutar getAuthToken y obtener el resultado.
            getAuthToken().then((result) => {
                if(result && result.roles) {
                    // 🛑 MODIFICACIÓN CLAVE: Actualizar el usuario en Zustand AHORA, incluyendo los claims
                    const userWithClaims = {
                        ...authStoreUser, // sub, email, name, nickname
                        ...result.claims // Añade todos los claims, incluyendo el rol
                    };
                    setUser(userWithClaims); // Guarda el usuario COMPLETO en el store

                    // 🛑 2. Llamar a syncUserToBackend con los roles obtenidos.
                    syncUserToBackend(result.roles);
                } else if (user) {
                    // Si no hay roles (o falla), al menos guarda el usuario base
                    setUser(authStoreUser);
                }
            });
        }

        // Si se desautentica, limpiar el estado
        if (!isAuthenticated && !isLoading) {
             setUser(null);
             isSyncedRef.current = false;
        }


    }, [isAuthenticated, user, isLoading, getAuthToken, setUser]); 


// ... (resto de los useEffects) ...

  // 1. Inicialización de Auth Ready (para evitar renderizados intermedios)
  useEffect(() => {
    if (!isLoading) {
      setIsAuthReady(true);
    }
  }, [isLoading, setIsAuthReady]);

  // 2. Ejecución forzada de getAuthToken para logging inmediato y refresh
  // El logging ahora se hace en el useEffect anterior (sincronización)
  /*
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      getAuthToken();
    }
  }, [isAuthenticated, isLoading, getAuthToken]);
  */

  return {
    isAuthenticated,
    user,
    isLoading,
    // 🛑 Devolvemos el logout local, que ya está inyectado en Zustand
    logout, 
    getAuthToken,
  };
};
