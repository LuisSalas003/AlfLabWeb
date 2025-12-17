import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';

export interface Producto {
  id?: string;
  nombre: string;
  caracteristicas: string;
  codigo: string;
  precio: number;
  proveedor: string;
  stock: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  constructor(private firestore: Firestore) {}

  // Obtener todos los productos
  async getProductos(): Promise<Producto[]> {
    try {
      const productosRef = collection(this.firestore, 'productos');
      const q = query(productosRef, orderBy('nombre'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Producto));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  // Agregar producto
  async agregarProducto(producto: Producto): Promise<{success: boolean, error?: string}> {
    try {
      const productosRef = collection(this.firestore, 'productos');
      await addDoc(productosRef, {
        nombre: producto.nombre,
        caracteristicas: producto.caracteristicas,
        codigo: producto.codigo,
        precio: Number(producto.precio),
        proveedor: producto.proveedor,
        stock: Number(producto.stock),
        imagen: producto.imagen
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al agregar producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar producto
  async actualizarProducto(id: string, producto: Producto): Promise<{success: boolean, error?: string}> {
    try {
      const productoRef = doc(this.firestore, 'productos', id);
      await updateDoc(productoRef, {
        nombre: producto.nombre,
        caracteristicas: producto.caracteristicas,
        codigo: producto.codigo,
        precio: Number(producto.precio),
        proveedor: producto.proveedor,
        stock: Number(producto.stock),
        imagen: producto.imagen
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar producto
  async eliminarProducto(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const productoRef = doc(this.firestore, 'productos', id);
      await deleteDoc(productoRef);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      return { success: false, error: error.message };
    }
  }
}