import { Deserializable } from './deserializable'; 

export class TutorialUsuario implements Deserializable {
     tutorial_usuario_id: number; 
     completatdo_bandera: boolean; 
     fecha_completado: any;
     usuario_id_fk1: number; 
     tutorial_id_fk2: number;

     deserialize(input: any): this{
        Object.assign(this, input);
        return this;
    }

}
