const express = require('express')
const fs = require('fs').promises
const app = express()
const exphbs = require("express-handlebars");

const PORT = 3000;

app.use(express.static(__dirname + '/assets/'))
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


app.listen(PORT, () => {
  console.log(`Ejcutandose en http://localhost:${PORT}`)
})