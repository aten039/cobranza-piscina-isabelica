
export interface IEntrenador {
  id: string;
  nombre: string; 
  apellido: string;
}

export interface IHorario {
  id: string;
  dia: string;
  hora: string;     
}
export interface IClass {
  id: string;
  nombre: string;
  costo: number;
  edadMin: number;
  
  // Campos "crudos" en la base de datos (son los IDs)
  entrenador_id: string; 
  horarios: string[]; // Array de strings porque es Many-to-Many
  
  // Aquí es donde PocketBase pone los datos traídos de las otras tablas
  expand?: {
    entrenador_id?: IEntrenador; // Objeto único (relación 1 a 1)
    "clases_horarios(clase_id)"?: Array<{
      expand?: {
        horario_id?: IHorario; // Aquí está finalmente el horario
      }
    }> // Array de objetos (relación muchos a muchos)
  }
}

export interface IFormData {
  // ... (tus campos anteriores: name, surname, cedula, etc...)
  name: string;
  surname: string;
  cedulaType: string;
  cedulaNum: string;
  dob: string;
  phoneCode: string;
  phoneNum: string;
  address: string;
  
  // Representante
  repName: string;
  repSurname: string;
  repCedulaType: string;
  repCedulaNum: string;
  repPhoneCode: string;
  repPhoneNum: string;

  // Salud
  hasMedical: boolean;
  medicalDesc: string;

  // CAMBIO AQUÍ: Reemplazamos 'schedule' por 'classId'
  classId: string; 

  currency: 'USD' | 'BS';
  paymentMethod: string;
  paymentRef: string;
  paymentDate: string;  // Fecha de Pago (y Cobertura Desde)
  coverageDate: string; // NUEVO: Cobertura Hasta
  paymentAmount: number
  
  displayClassName?: string;

}