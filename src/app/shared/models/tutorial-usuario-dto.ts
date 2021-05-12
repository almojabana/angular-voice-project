export class TutorialUsuarioDTO {
     tutorialUsuarioId: number; 
     completado: boolean; 
     usuarioId: number;
     tutorialId: number;
     
     deserialize(input: any): this {
          Object.assign(this, input);
          return this;
     } 
}
