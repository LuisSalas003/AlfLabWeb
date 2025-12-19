import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

export interface Cliente {
  id?: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  
  constructor(private firestore: Firestore) {}

  // Obtener todos los clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      console.log('Intentando obtener clientes...');
      const clientesRef = collection(this.firestore, 'clientes');
      const querySnapshot = await getDocs(clientesRef);
      
      console.log('Documentos encontrados:', querySnapshot.size);
      
      const clientes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Documento completo:', doc.id, data);
        
        return {
          id: doc.id,
          // Campos con mayúsculas como están en Firebase
          nombre: data['Nombre'] || '',
          empresa: data['Empresa'] || '',
          telefono: data['Teléfono'] || data['Telefono'] || '',
          email: data['Email'] || data['E-mail'] || '',
          direccion: data['Dirección'] || data['Direccion'] || ''
        } as Cliente;
      });
      
      console.log('Clientes procesados:', clientes);
      return clientes;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return [];
    }
  }

  // Agregar cliente
  async agregarCliente(cliente: Cliente): Promise<{success: boolean, error?: string}> {
    try {
      const clientesRef = collection(this.firestore, 'clientes');
      await addDoc(clientesRef, {
        Nombre: cliente.nombre,
        Empresa: cliente.empresa,
        Teléfono: cliente.telefono,
        Email: cliente.email,
        Dirección: cliente.direccion
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al agregar cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar cliente
  async actualizarCliente(id: string, cliente: Cliente): Promise<{success: boolean, error?: string}> {
    try {
      const clienteRef = doc(this.firestore, 'clientes', id);
      await updateDoc(clienteRef, {
        Nombre: cliente.nombre,
        Empresa: cliente.empresa,
        Teléfono: cliente.telefono,
        Email: cliente.email,
        Dirección: cliente.direccion
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar cliente
  async eliminarCliente(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const clienteRef = doc(this.firestore, 'clientes', id);
      await deleteDoc(clienteRef);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      return { success: false, error: error.message };
    }
  }
}