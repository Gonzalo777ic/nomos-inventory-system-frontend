import { Category } from '../types';

/**
 * Convierte una lista plana de categorías en una estructura de árbol jerárquico.
 * La jerarquía se determina usando la relación 'parent'.
 * * @param list Lista plana de objetos Category.
 * @returns Array de categorías raíz, con sus hijos anidados.
 */
export const listToTree = (list: Category[]): Category[] => {
  if (!list) return [];
  
  // Usamos un mapa para acceder rápidamente a las categorías por ID
  const map: { [id: number]: Category } = {};
  const tree: Category[] = [];

  // Paso 1: Inicializar el mapa y los hijos
  list.forEach(item => {
    // Es importante crear una copia del objeto para evitar mutaciones directas del estado de React Query
    const cleanItem: Category = { ...item, children: [] }; 
    map[cleanItem.id] = cleanItem;
  });

  // Paso 2: Construir el árbol (asignar hijos a sus padres)
  list.forEach(item => {
    // Acceder al ID del padre usando la estructura 'parent.id' (como confirmamos en el diagnóstico)
    const parentId = item.parent?.id;

    if (parentId && map[parentId]) {
      // Si tiene padre y el padre existe en el mapa, añadir como hijo
      map[parentId].children?.push(map[item.id]);
    } else {
      // Si no tiene padre (es null o undefined) o el padre no se encuentra (es un error de datos), es una categoría raíz
      tree.push(map[item.id]);
    }
  });

  return tree;
};