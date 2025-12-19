import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';

export interface ProductoCotizado {
  productoId: string;
  nombre: string;
  codigo: string;
  proveedor: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Cotizacion {
  id?: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmpresa: string;
  productos: ProductoCotizado[];
  total: number;
  fecha: Date;
  estado?: string; // 'pendiente', 'aceptada', 'rechazada'
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  
  constructor(private firestore: Firestore) {}

  // Obtener todas las cotizaciones
  async getCotizaciones(): Promise<Cotizacion[]> {
    try {
      console.log('Obteniendo cotizaciones...');
      const cotizacionesRef = collection(this.firestore, 'cotizaciones');
      const querySnapshot = await getDocs(cotizacionesRef);
      
      const cotizaciones = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clienteId: data['clienteId'] || '',
          clienteNombre: data['clienteNombre'] || '',
          clienteEmpresa: data['clienteEmpresa'] || '',
          productos: data['productos'] || [],
          total: data['total'] || 0,
          fecha: data['fecha']?.toDate() || new Date(),
          estado: data['estado'] || 'pendiente'
        } as Cotizacion;
      });
      
      // Ordenar por fecha descendente (más recientes primero)
      return cotizaciones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      return [];
    }
  }

  // Crear nueva cotización
  async crearCotizacion(cotizacion: Cotizacion): Promise<{success: boolean, error?: string, id?: string}> {
    try {
      const cotizacionesRef = collection(this.firestore, 'cotizaciones');
      const docRef = await addDoc(cotizacionesRef, {
        clienteId: cotizacion.clienteId,
        clienteNombre: cotizacion.clienteNombre,
        clienteEmpresa: cotizacion.clienteEmpresa,
        productos: cotizacion.productos,
        total: cotizacion.total,
        fecha: Timestamp.fromDate(cotizacion.fecha),
        estado: cotizacion.estado || 'pendiente'
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error al crear cotización:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener una cotización por ID
  async getCotizacionPorId(id: string): Promise<Cotizacion | null> {
    try {
      const cotizacionRef = doc(this.firestore, 'cotizaciones', id);
      const docSnap = await getDoc(cotizacionRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          clienteId: data['clienteId'],
          clienteNombre: data['clienteNombre'],
          clienteEmpresa: data['clienteEmpresa'],
          productos: data['productos'],
          total: data['total'],
          fecha: data['fecha']?.toDate() || new Date(),
          estado: data['estado'] || 'pendiente'
        } as Cotizacion;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener cotización:', error);
      return null;
    }
  }

  // Eliminar cotización
  async eliminarCotizacion(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const cotizacionRef = doc(this.firestore, 'cotizaciones', id);
      await deleteDoc(cotizacionRef);
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar cotización:', error);
      return { success: false, error: error.message };
    }
  }
}