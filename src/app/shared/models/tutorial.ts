/**
 * This class models the Tutorial Entity.
 */
export class Tutorial {
    tutorialId: number; 
    titulo: string;
    categoria:string;
    secuencia:number;
    lenguajeIdFk1: number;
    explicacion: string;
/**
 * The deserializing function recieves input from the 
 * server and converts it to a generic object
 * @param input 
 * @returns this method returns a Tutorial object
 */
    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }

}

