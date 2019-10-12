const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const Rol = require("../models/rol");
const Empleado = require("../models/empleado");
const AdultoResponsable = require("../models/adultoResponsable");
const router = express.Router();

router.post("/signup", (req, res) => {
  Usuario.findOne({ email: req.body.email }).then(usuario => {
    if (usuario) {
      return res.status(200).json({
        message: "Ya existe un usuario con el email ingresado",
        exito: false
      });
    } else {
      Rol.findOne({ tipo: req.body.rol }).then(rol => {
        bcrypt.hash(req.body.password, 10).then(hash => {
          const usuario = new Usuario({
            email: req.body.email,
            password: hash,
            rol: rol._id
          });
          usuario
            .save()
            .then(() => {
              res.status(201).json({
                message: "Usuario creado exitosamente",
                exito: true,
                id: usuario._id
              });
            })
            .catch(err => {
              res.status(200).json({
                exito: false
              });
            });
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  let usuarioEncontrado;
  Usuario.findOne({ email: req.body.email }).then(usuario => {
    if (!usuario) {
      return res.status(200).json({
        message: "El usuario ingresado no existe",
        exito: false
      });
    } else {
      usuarioEncontrado = usuario;
      if (!bcrypt.compareSync(req.body.password, usuario.password)) {
        return res.status(200).json({
          message: "La contraseña ingresada es incorrecta",
          exito: false
        });
      } else {
        const token = jwt.sign(
          {
            email: usuarioEncontrado.email,
            userId: usuarioEncontrado._id,
            rol: usuarioEncontrado.rol
          },
          "aca_va_el_secreto_que_es_una_string_larga",
          { expiresIn: "12h" }
        );
        Rol.findById(usuarioEncontrado.rol).then(rol => {
          let _id;
          if(rol.tipo != "AdultoResponsable"){
            Empleado.findOne({idUsuario: usuarioEncontrado._id}).then(empleado => {
              _id = empleado._id;
            });
          }
          else{
            AdultoResponsable.findOne({idUsuario: usuarioEncontrado._id}).then(AR => {
              _id = AR._id;
            });
          }
              res.status(200).json({
                token: token,
                duracionToken: 43200,
                rol: rol.tipo,
                _id: _id,
                message: "Bienvenido a Lié",
                exito: true
              });
        });
      }
    }
  });
});

router.post("/cambiarPassword", async (req, res, next) => {
  let passwordNueva;
  await bcrypt.hash(req.body.passwordNueva, 10).then(hash => {
    passwordNueva = hash;
  });
  Usuario.findOne({ email: req.body.usuario }).then(usuario => {
    if (!bcrypt.compareSync(req.body.passwordVieja, usuario.password)) {
      return res.status(200).json({
        message: "La contraseña ingresada no coincide con la actual",
        exito: false
      });
    } else {
      Usuario.findOneAndUpdate(
        { email: req.body.usuario },
        { password: passwordNueva }
      ).exec();
      return res
        .status(200)
        .json({ message: "Contraseña cambiada correctamente", exito: true });
    }
  });
});

router.get("/permisosDeRol", (req, res) => {
  Rol.aggregate([
    {
      $match: {
        tipo: req.query.rol
      }
    },
    {
      $lookup: {
        from: "permiso",
        localField: "permisos",
        foreignField: "_id",
        as: "permisosRol"
      }
    },
    {
      $project: {
        _id: 0,
        tipo: 0,
        permisos: 0
      }
    }
  ]).then(permisos => {
    return res.status(200).json({
      message: "Se obtuvo los permisos del rol exitosamente",
      exito: true,
      permisos: permisos[0].permisosRol[0]
    });
  });
});

router.post("/suscripcion", (req, res) => {
  Usuario.findOneAndUpdate(
    { email: req.body.email },
    { $push: { suscripciones: req.body.sub } }
  )
    .then(usuario => {
      usuario.save();
      return res
        .status(201)
        .json({ message: "Suscripción registrada correctamente" });
    })
    .catch(e => {
      console.log(e);
    });
});

module.exports = router;
