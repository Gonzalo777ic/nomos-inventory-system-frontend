import axios from "axios";

/**
 * Cliente Axios configurado para el Nomos Auth Service (Microservicio de Autenticación y Usuarios).
 * Puerto: 8080
 */
export const httpAuth = axios.create({
});
// Nota: Al igual que httpStore, asumimos que la lógica del token JWT
// se maneja a través de un interceptor global o un contexto (AuthAxiosProvider).