export interface Lame {
  id: string;
  coloration: string;
}

export interface Bloc {
  id: string;
  lames: Lame[];
}

export interface Prelevement {
  id: string;
  blocs: Bloc[];
}

export interface CaseEntity {
  id: string;
  prelevements: Prelevement[];
}


