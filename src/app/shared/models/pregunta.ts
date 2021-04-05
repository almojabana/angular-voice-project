export class Pregunta {
    preguntaId: number;
    texto: string;
    valor: number;
    tutorialIdFk1: number;

    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
      }

}