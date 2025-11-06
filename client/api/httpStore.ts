import axios from "axios";

/**
 * Cliente Axios configurado para el Nomos Store Service (Microservicio de Ventas y Precios).
 * Puerto: 8083
 */
export const httpStore = axios.create({}); // Usamos un cliente sin baseURL aquí
// Nota: No se requiere interceptor aquí, ya que el token debe ser añadido
// por el componente AuthAxiosProvider, que ya tiene esta lógica.