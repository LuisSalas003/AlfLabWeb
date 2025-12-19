import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

export interface Proveedor {
  id?: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  rfc: string;
  pais: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  
  constructor(private firestore: Firestore) {}

  // Obtener todos los proveedores
  async getProveedores(): Promise<Proveedor[]> {
    try {
      console.log('Intentando obtener proveedores...');
      const proveedoresRef = collection(this.firestore, 'proveedores');
      const querySnapshot = await getDocs(proveedoresRef);
      
      console.log('Documentos encontrados:', querySnapshot.size);
      
      const proveedores = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Documento completo:', doc.id, data);
        
        return {
          id: doc.id,
          // Campos con mayúsculas como están en Firebase
          nombre: data['Nombre'] || '',
          empresa: data['Empresa'] || '',
          telefono: data['Teléfono'] || '',
          email: data['Email'] || '',
          rfc: data['RFC'] || '',
          pais: data['País'] || '',
          direccion: data['Dirección'] || ''
        } as Proveedor;
      });
      
      console.log('Proveedores procesados:', proveedores);
      return proveedores;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      return [];
    }
  }

  // Agregar proveedor - Usar mayúsculas para mantener consistencia
  async agregarProveedor(proveedor: Proveedor): Promise<{success: boolean, error?: string}> {
    try {
      const proveedoresRef = collection(this.firestore, 'proveedores');
      await addDoc(proveedoresRef, {
        Nombre: proveedor.nombre,
        Empresa: proveedor.empresa,
        Teléfono: proveedor.telefono,
        Email: proveedor.email,
        RFC: proveedor.rfc,
        País: proveedor.pais,
        Dirección: proveedor.direccion
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al agregar proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar proveedor
  async actualizarProveedor(id: string, proveedor: Proveedor): Promise<{success: boolean, error?: string}> {
    try {
      const proveedorRef = doc(this.firestore, 'proveedores', id);
      await updateDoc(proveedorRef, {
        Nombre: proveedor.nombre,
        Empresa: proveedor.empresa,
        Teléfono: proveedor.telefono,
        Email: proveedor.email,
        RFC: proveedor.rfc,
        País: proveedor.pais,
        Dirección: proveedor.direccion
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar proveedor
  async eliminarProveedor(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const proveedorRef = doc(this.firestore, 'proveedores', id);
      await deleteDoc(proveedorRef);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar proveedor:', error);
      return { success: false, error: error.message };
    }
  }
}