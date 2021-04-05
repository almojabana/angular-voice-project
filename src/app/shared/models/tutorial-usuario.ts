export class TutorialUsuario {
     tutorialUsuarioId: number; 
     completatdoBandera: boolean; 
     fechaCompletado: any;
     usuarioIdFk1: number;
     tutorialIdFk2: number;
     
     deserialize(input: any): this {
          Object.assign(this, input);
          return this;
     }
}
