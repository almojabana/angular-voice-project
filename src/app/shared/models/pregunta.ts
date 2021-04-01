import { Deserializable} from './deserializable'; 

export class Pregunta implements Deserializable{
    preguntaID: number;
    texto: string;
    valor: number;
    tutorialID: number; 

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}