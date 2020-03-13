import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EstudiantesService } from "../estudiantes/estudiante.service";
import { Estudiante } from '../estudiantes/estudiante.model';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material';


@Component({
  selector: 'app-perfil-estudiante',
  templateUrl: './perfil-estudiante.component.html',
  styleUrls: ['./perfil-estudiante.component.css']
})
export class PerfilEstudianteComponent implements OnInit {
  apellidoEstudiante: string;
  nombreEstudiante: string;
  estudiantes: Estudiante[] = [];
  _idEstudiante: string;
  idUsuario: string;
  calificacionesSelected: boolean;
  fechaActual: Date;

  constructor(
    public servicio: EstudiantesService,
    public router: Router,
    public popup: MatDialog) { }

  ngOnInit() {
    this.fechaActual = new Date();
    this.apellidoEstudiante = this.servicio.estudianteSeleccionado.apellido;
    this.nombreEstudiante = this.servicio.estudianteSeleccionado.nombre;
    this._idEstudiante = this.servicio.estudianteSeleccionado._id;

    this.calificacionesSelected= true;
    let botonCalificaciones = document.getElementById('calificaciones') as HTMLElement;
    botonCalificaciones.click();
  }


  onClickCalificaciones(){
    this.router.navigate(["/perfilEstudiante/calificacionesEstudiante"]);
  }

  onCancelar(){
    this.popup.open(PerfilEstudiantePopupComponent);
  }

}
  @Component({
    selector: "app-perfil-estudiante-popup",
    templateUrl: "./perfil-estudiante-popup.component.html",
    styleUrls: ["./perfil-estudiante.component.css"]
  })
  export class PerfilEstudiantePopupComponent {
    constructor(
      public dialogRef: MatDialogRef<PerfilEstudiantePopupComponent>,
      public router: Router,
      public servicio: EstudiantesService
    ) {}

    onYesCancelarClick(): void {
      this.router.navigate(["./home"]);
      this.dialogRef.close();
    }

    onNoCancelarClick(): void {
      this.dialogRef.close();
    }
  }


