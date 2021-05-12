export class Tutorial {
    tutorialId: number; 
    titulo: string;
    categoria:string;
    secuencia:number;
    lenguajeIdFk1: number;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }

}

