import { Category } from '../types';

/**
 * Convierte una lista plana de categorías en una estructura de árbol jerárquico.
 * La jerarquía se determina usando la relación 'parent'.
 * * @param list Lista plana de objetos Category.
 * @returns Array de categorías raíz, con sus hijos anidados.
 */
export const listToTree = (list: Category[]): Category[] => {
  if (!list) return [];
  

  const map: { [id: number]: Category } = {};
  const tree: Category[] = [];


  list.forEach(item => {

    const cleanItem: Category = { ...item, children: [] }; 
    map[cleanItem.id] = cleanItem;
  });


  list.forEach(item => {

    const parentId = item.parent?.id;

    if (parentId && map[parentId]) {

      map[parentId].children?.push(map[item.id]);
    } else {

      tree.push(map[item.id]);
    }
  });

  return tree;
};