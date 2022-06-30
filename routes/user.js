const express = require("express")

const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario= mongoose.model("usuarios")
const bcrypt=require("bcryptjs")
const { application } = require("express")
const passport = require("passport")


router.get("/cadastro", (req,res)=>{
    res.render('user/cadastro')
})

router.post("/cadastro",(req,res)=>{


    var erros=[]


     if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"})
       
     }
     if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email inválido"})
      
     }
     if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ){
        erros.push({texto: "email inválido"})
        
     }
     if(req.body.senha.length < 5 ){
        erros.push({texto: "senha muito curta"})
       
     }

     
     
     if (req.body.senha != req.body.senha2 ){
        erros.push({texto: "senhas diferentes"})
       
     }

      if (erros.length > 0){
        res.render("user/cadastro", {erros: erros})
       
      }

      else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "email ja existe")
                res.redirect("/user/cadastro")

            }else{
                var salt = bcrypt.genSaltSync(10);
 var hash = bcrypt.hashSync(req.body.senha, salt);

const userData = {
    nome : req.body.nome,
    email : req.body.email,
    senha : hash,
    eAdmin: 1
 }


 new Usuario(userData).save().then(() => {
     req.flash('success_msg', 'Usuario cadastrado com sucesso!')
     res.redirect('/')
 }).catch((err) => {
     req.flash('error_msg', 'Erro ao cadastrar o usuario')
     res.redirect("/usuarios/registro")
 })
            
            }
        })
   
}
})

router.get("/login",(req,res)=>{
    res.render("user/login")
})

router.post("/login",(req,res,next) =>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req,res,next)
})

router.get("/logout", (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash('success_msg',"deslogado com sucesso!")
        res.redirect("/")

    })
   
})

module.exports = router