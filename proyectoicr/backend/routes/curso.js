const express = require("express");
const router = express.Router();
const Division = require("../models/division");
const Inscripcion = require("../models/inscripcion");

//Retorna un vector que tiene objetos que a su vez tienen el año (5, 4, etc) con sus respectivas divisiones.
//Se tiene que hacer una mini conversion de lo que devuelve la bd (forEach dentro del then).
router.get("/", (req, res, next) => {
  Division.aggregate([
    {
      $lookup: {
        from: "materiasXCurso",
        localField: "IdMateriasXCurso",
        foreignField: "_id",
        as: "MXC"
      }
    },
    {
      $group: {
        _id: "$MXC.curso",
        divisiones: {
          $addToSet: "$curso"
        }
      }
    }
  ]).then(documents => {
    var divisionesXAño = [];
    documents.forEach(elemento => {
      divisionesXAño.push({
        ano: elemento._id[0],
        divisiones: elemento.divisiones
      });
    });
    res.status(200).json({
      divisionesXAño: divisionesXAño
    });
  });
});

router.post("/inscripcion", (req, res) => {
  Inscripcion.findOne({
    IdEstudiante: req.body.IdEstudiante,
    activa: true
  }).then(document => {
    if (document != null) {
      res
        .status(400)
        .json({ message: "El estudiante ya esta inscripto", exito: false });
    } else {
      Division.findOne({ curso: req.body.division }).then(document => {
        const nuevaInscripcion = new Inscripcion({
          IdEstudiante: req.body.IdEstudiante,
          IdDivision: document._id,
          activa: true
        });
        nuevaInscripcion.save().then(() => {
          res.status(201).json({
            message: "Estudiante inscripto exitósamente",
            exito: true
          });
        });
      });
    }
  });
});

router.get("/documentos", (req, res) => {
  Inscripcion.aggregate([
    {
      '$lookup': {
        'from': 'divisiones',
        'localField': 'IdDivision',
        'foreignField': '_id',
        'as': 'divisiones'
      }
    }, {
      '$lookup': {
        'from': 'estudiantes',
        'localField': 'IdEstudiante',
        'foreignField': '_id',
        'as': 'datosEstudiante'
      }
    }, {
      '$match': {
        'divisiones.curso': req.query.curso
      }
    }, {
      '$project': {
        '_id': 0,
        'IdEstudiante': 1,
        'documentosEntregados': 1,
        'datosEstudiante.apellido': 1,
        'datosEstudiante.nombre': 1
      }
    }
  ]).then(estudiantes => {
    res.status(200).json(estudiantes);
  });
});

module.exports = router;
