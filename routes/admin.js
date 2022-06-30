const express = require("express")

const router = express.Router()
const mongoose= require("mongoose")
require("../models/Categoria")
require("../models/Postagens")
const {eAdmin}= require("../helpers/eAdmin")



const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")

router.get('/', eAdmin,(req,res) => {
res.render("admin/index")
})

router.get('/posts', eAdmin,(req,res)=>{
    res.send("Pagina de posts")
})

router.get("/categorias", eAdmin,(req,res) =>{
  
    Categoria.find().sort({date: 'desc'}).lean().then((select) => {
        res.render("admin/categorias", {categorias : select })
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao listar as categorias")
        res.redirect("/admin")
    }) 
   
  
})

router.post('/categorias/nova', eAdmin,(req,res) =>{

    var erros=[]

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug ==undefined || req.body.slug == null){
        erros.push({texto: "slug invalido"})
    }
    
    if(req.body.nome.length < 2 ){
        erros.push({texto: "nome da categoria é muito pequeno"})
    }

    if(erros.length>0){
        console.log("nao deu certo"+erros)
        res.render("admin/addcategorias", {erros: erros})
       
    }else{
    
        
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      }
      new Categoria(novaCategoria).save().then(()=>{
        req.flash("success_msg", "categoria criada com sucesso!")
        res.redirect("/admin/categorias")
      }).catch((err) => { 
        console.log("error")
       req.flash("error_msg", "houve um erro ao salvar a categoria, tente novamente")
       console.log(erros.length)
       res.redirect("/admin/categorias/add")
      })
    
    }
 
   
})

router.get("/categorias/edit/:id",eAdmin, (req,res) => {
   Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
    res.render("admin/editcategorias", {categoria: categoria})
   }).catch((err) => {
    req.flash("error_msg", "esta categria nao existe")
    res.redirect("/admin/categorias")
   })
})

router.post("/categorias/edit",eAdmin, async (req,res) => {
  

   
    const categoria = await Categoria.findOne({_id: req.body.id})
    console.log(categoria.nome)
    categoria.nome=req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(()=>{
        req.flash("success_msg", "categoria editada com sucesso!")
        res.redirect("/admin/categorias")
    })
})

router.get("/categorias/delete/:id",eAdmin,(req,res)=>{
  Categoria.deleteOne({_id: req.params.id}).then(()=>{
    req.flash("success_msg", "categoria excluida! com sucesso!")
        res.redirect("/admin/categorias")
  }).catch((err)=>{
     req.flash("error_msg", "houve um erro ao excluir a categoria!")
     res.redirect("/admin/categorias")
    })
})

router.get("/categorias/add",eAdmin, (req,res) =>{
 res.render("admin/addcategorias")
})


router.get("/postagens", eAdmin,async (req,res)=>{
    select = await Postagem.find().lean().populate("categoria").sort({date: "desc"})
    res.render("admin/postagens",{postagens: select})
})


router.get("/postagens/add", eAdmin,async (req,res)=>{
    var select= await Categoria.find().lean()
    console.log(select.categoria)
    res.render("admin/addpostagens",{categorias: select})
})




router.post("/postagens/nova",eAdmin, (req,res)=>{
    const postagem = {
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo
      }
     
     
      new Postagem({
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria
      }).save().then(()=>{
        req.flash("success_msg","postagem salva com sucesso")
        res.redirect("/admin/postagens")
      }).catch((err)=>{
        req.flash("error_msg","nao foi possivel salvar.")
        res.redirect("/admin/postagens/add")
       
        console.log(err)
      })
      console.log(postagem.slug)

})
router.get("/postagens/edit/:id",eAdmin,(req,res)=>{
      Postagem.findOne({_id: req.params.id}).lean().then((select)=>{
        Categoria.find().lean().then((selectCategoria)=>{
            console.log(selectCategoria[0].nome)
            res.render("admin/editpost", {categoria: selectCategoria,postagem: select})
        })
        
      })
})


router.post("/postagens/edit", eAdmin,async (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.categoria = req.body.categoria
        postagem.conteudo = req.body.conteudo
      postagem.save().then(()=>{
        req.flash("success_msg","postagem salva com sucesso")
        res.redirect("/admin/postagens")
      }).catch((err)=>{
        req.flash("error_msg","nao foi possivel salvar.")
        res.redirect("/admin/postagens")})
    }).catch((err)=>{
        req.flash("error_msg","nao foi possivel salvar.")
        res.redirect("/admin/postagens/add")
       
        console.log(err)
    })
})



router.get("/postagens/delete/:id",eAdmin, (req,res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
      req.flash("success_msg", "categoria excluida! com sucesso!")
          res.redirect("/admin/postagens")
    }).catch((err)=>{
       req.flash("error_msg", "houve um erro ao excluir a categoria!")
       res.redirect("/admin/postagens")
      })
  })


module.exports = router