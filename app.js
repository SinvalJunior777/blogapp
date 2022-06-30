const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require('./routes/admin')
const user = require('./routes/user')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagens")
require("./models/Categoria")
const mongoose = require("mongoose");
const Postagem = mongoose.model("postagens")
const Categoria=mongoose.model("categorias")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")




// const mongoose = require("mongoose")

const router = require('./routes/admin')
mongoose.connect(db.mongURI).then(() =>{
  console.log('conectado ao mongo')
}).catch((err)=>{console.log("erro ao se conectar: " +err)})
  //Public
 

   app.use(express.static("public"))
//Configuraçoes

  //
   app.use(session({
    secret: "cursodenode",
    reseve: true,
    saveUninitalized: true
   }))

   app.use(passport.initialize())
   app.use(passport.session())
   app.use(flash())

   //middleware
   app.use((req,res,next) => {
      res.locals.success_msg= req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error= req.flash("error")
      res.locals.user = req.user || null;
      next()
   })
 //body Parser
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  //handlebars
  app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
  app.set('view engine', 'handlebars');
//Rotas
app.get("/",(req,res)=>{
  Postagem.find().populate("categoria").sort({data: 'desc'}).lean().then((postagens)=>{
    console.log(postagens)
    res.render("index", {postagens: postagens})
  }).catch((err)=>{
    req.flash("error_msg", "houve um erro interno")
    console.log(err)
    
  })
 
})

app.get("/postagem/:slug", (req,res)=>{
  Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
    if(postagem){
      res.render("postagem/index", {postagem: postagem})
    }else{
      req.flash("error_msg", "esta postagem nao existe")
      res.redirect("/")

    }
  }).catch((err)=>{
    req.flash("erro_msg", "Houve um erro interno")
    res.redirect("/")
  })
})

app.get("/404",(req, res) => {
  res.send("erro 404")
})
app.use('/admin', admin)
app.use('/user', user )


app.get("/categorias", (req,res)=>{
  Categoria.find().lean().then((categorias)=>{
    res.render("categorias/index",{categorias: categorias})
  }).catch((err)=>{
    req.flash("erro_msg", "Houve um erro interno")
    res.redirect("/")
  })
})
app.get("/categorias/:slug",(req,res)=>{
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
    Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
      res.render("categorias/postagens",{postagens: postagens, categoria: categoria})
    })
  })
})

//Outros

 const PORT = process.env.PORT || 8089
app.listen(PORT, ()=>{
    console.log("Servidor rodando!")
})