if(process.env.NODE_ENV =='production'){
  module.exports = {mongURI : 'mongodb+srv://junior:C878685c@cluster0.7qz2lxm.mongodb.net/?retryWrites=true&w=majority'}
}else{
 module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}