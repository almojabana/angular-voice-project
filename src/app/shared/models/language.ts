export class Lenguaje {
    lenguajeId: number;
    nombre: string;
    descripcion: string;
    
    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
      }
}