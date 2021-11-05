const express = require('express')
const fs = require('fs').promises
const app = express()
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const secretKey = "Notoy";

const {nuevoUsuario, getUsuario, getAdmin, setUsuarioStatus} = require("./servidor")

const PORT = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/assets/'))

app.use(expressFileUpload({
  limits: 6500000,
  abortOnLimit: true,
  responseOnLimit: "El tamaño del archivo supera el limite establecido",
}));
/*const renderPage = (pathRoute, pathHTML) => {
  app.get(pathRoute, async (req, res) => {
    const fileHTML = await fs.readFile(pathHTML, 'utf-8');
    return res.send(fileHTML)
  })
}

app.use(express.static(__dirname + '/assets/'))
renderPage('/', './index.html');
renderPage('/admin', './Admin.html')
renderPage('/datos', './Datos.html')
renderPage('/registro', './Registro.html')
renderPage('/login', './Login.html')*/

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
app.get('/login', function(req, res ) {
  res.render('Login')
})

app.post("/registro", async(req, res) =>{
  const {email, nombre, password, experiencia, especialidad, perfil} = req.body;
  //coincide con el payload de axios
  try{
    const usuario = await nuevoUsuario(email, nombre, password, experiencia, especialidad, perfil);
    //res.status(201).send(usuario);
    res.status(201).send(JSON.stringify(usuario));
  }catch(e){
    res.status(500).send({
      error: `Ha ocurrido un error ${e}`,
      code: 500
    })
  };
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

app.post("/verify", async function(req, res){
  const {email, password} = req.body;
  const user = await getUsuario(email, password);
  if(user){
    if(user.auth){
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 180,
          data: user,
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




app.listen(PORT, () => {
  console.log(`Ejcutandose en http://localhost:${PORT}`)
})