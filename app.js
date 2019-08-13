var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var fs = require('fs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();


/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))


/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
    if (typeof(req.session.todolist) == 'undefined' || req.session.todolist == '') {
        req.session.todolist = fs.readFileSync('./input.txt').toString().split('\n');
        console.log(req.session.todolist)
    }
    next();
})

/* On affiche la todolist et le formulaire */
.get('/todo', function(req, res) { 
    req.session.todolist = fs.readFileSync('./input.txt').toString().split('\n');
    res.render('todo.ejs', {todolist: req.session.todolist});
})

/* On ajoute un élément à la todolist */
.post('/todo/ajouter/', urlencodedParser, function(req, res) {
    if (req.body.newtodo != '') {
        req.session.todolist.push(req.body.newtodo);
        fs.appendFileSync('./input.txt','\n' + req.body.newtodo);
    }
    res.redirect('/todo');
})

/* Supprime un élément de la todolist */
.get('/todo/supprimer/:id', function(req, res) {
    if (req.params.id != '') {
        req.session.todolist.splice(req.params.id, 1);
        const updatedTodoList = req.session.todolist.join('\n');
        fs.writeFile('./input.txt', updatedTodoList, (err) => {
            if (err) throw err;
            console.log ('Successfully updated the file data');
        });
    }
    res.redirect('/todo');
})


/* On redirige vers la todolist si la page demandée n'est pas trouvée */
.use(function(req, res, next){
    res.redirect('/todo');
})
/* run with "node app.jc" command */
.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

