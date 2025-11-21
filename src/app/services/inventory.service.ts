import { Injectable } from '@angular/core';
import { collectionData, Firestore, collection as firestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Producto {
  id?: string;
  codigo: string;
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
  proveedor: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  
  constructor(private firestore: Firestore) {}

  // Obtener todos los productos
  getProductos(): Observable<Producto[]> {
    const productosRef = firestoreCollection(this.firestore, 'productos');
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }
}