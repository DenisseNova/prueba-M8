const express = require('express')
const fs = require('fs').promises
const bcrypt = require('bcrypt');
const app = express()
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const secretKey = "Notoy";

const {nuevoUsuario, getUsuario, getAdmin, setUsuarioStatus} = require("./servidor")

const PORT = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/assets/'))

app.use(expressFileUpload({
  limits: 6500000,
  abortOnLimit: true,
  responseOnLimit: "El tamaño del archivo supera el limite establecido",
}));

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    layoutsDir: `${__dirname}/views/mainLayout`,
    partialsDir: `${__dirname}/views/components/`,
  })
);

app.set('view engine', 'handlebars');

app.get('/', function(req, res ) {
  res.render('index')
})

app.get('/registro', function(req, res ) {
  res.render('Registro')
})

app.post("/registro", async(req, res) =>{
  const {email, nombre, password, experiencia, especialidad, perfil} = req.body;
  //coincide con el payload de axios

  const newPassword = bcrypt.hashSync(password, saltRounds);

  try{
    const usuario = await nuevoUsuario(email, nombre, newPassword, experiencia || 0, especialidad, perfil || '');
    //res.status(201).send(usuario);
    res.status(201).send(JSON.stringify(usuario));
  }catch(e){
    console.log(e)
    res.status(500).send({
      error: `Ha ocurrido un error ${e}`,
      code: 500
    })
  };
});

app.get('/login', function(req, res ) {
  res.render('Login')
})

app.post("/login", async function(req, res){
  const {email, password} = req.body;
  const user = await getUsuario(email);
  if(user){
    if(user.estado){
      if(!bcrypt.compareSync(password, user.password)) {
        return res.status(400).send({
          error: "La contraseña no coincide",
          code: 400
        });
      }

      const dataUser = { ...user, password: '' } 
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 180,
          data: dataUser,
        },
        secretKey
      );
      res.send(token);
    }else{
      res.status(401).send({
        error: "Usuario no validado",
        code: 401
      });
    }
  }else{
    res.status(404).send({
      error: "Usuario no resgistrado",
      code: 404
    });
  }
});

app.get("/admin", async(req, res) =>{
  //res.render("Admin");
  try{
    const usuarios = await getAdmin();
    res.render("Admin", {usuarios}); 
  }catch(e){
    res.status(500).send({
      error: `Ha ocurrido un error ${e}`,
      code: 500
    })
  }
});


app.put("/usuarios", async(req, res) =>{
  const {id, estado} = req.body;
  try{
    const usuario = await setUsuarioStatus(id, estado);
    //res.status(200).send(JSON.stringify(usuario));
    res.status(200).send(usuario);
  }catch(e){
    res.status(500).send({
      error: `Ha ocurrido un error ${e}`,
      code: 500
    })
  };
});

app.get("/Datos", function(req, res){
  const {token} = req.query;
  let jwtDecoded = '';
  try {
    jwtDecoded = jwt.verify(token, secretKey);
  } catch (e) {
    console.log(e)
  }
  if (!jwtDecoded){
    return res.status(401).send({
        error: "401 Unauthorized",
        messaege: "Usted no se encuentra autorizado",
    })
  }
  res.render("datos", { ...jwtDecoded.data });
});

app.put('/Datos', function (req, res){
  
})


app.listen(PORT, () => {
  console.log(`Ejcutandose en http://localhost:${PORT}`)
})