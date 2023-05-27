const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

let apiRouter = express.Router()
const endpoint = '/'

const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
})

apiRouter.post(endpoint + 'seguranca/login', (req, res) => {
    knex
        .select('*').from('usuario').where({ login: req.body.login })
        .then(usuarios => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
                if (checkSenha) {
                    var tokenJWT = jwt.sign({ id: usuario.id },
                        process.env.SECRET_KEY, {
                        expiresIn: 3600


                    })
                    res.status(200).json({
                        id: usuario.id,
                        login: usuario.login,
                        nome: usuario.nome,
                        roles: usuario.roles,
                        token: tokenJWT
                    })
                    return
                }
            }
            res.status(200).json({ message: 'Login ou senha incorretos' })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar login - ' + err.message
            })
        })
})


apiRouter.post(endpoint + 'seguranca/register', (req, res) => {
    knex('usuario')
        .insert({
            nome: req.body.nome,
            login: req.body.login,
            senha: bcrypt.hashSync(req.body.senha, 8),
            email: req.body.email
        }, ['id'])
        .then((result) => {
            let usuario = result[0]
            res.status(201).json({ "id": usuario.id })
            return
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao registrar usuario - ' + err.message
            })
        })
})




apiRouter.get(endpoint + 'produtos', function (req, res) {
    knex.select('*').from('produto')
        .then(produtos => res.status(200).json(produtos))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

apiRouter.get(endpoint + 'produtos/:id', (req, res) => {
    knex.select('*').from('produto').where({ id: req.params.id })
        .then(produtos => res.status(200).json(produtos))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

apiRouter.post(endpoint + 'produtos', (req, res) => {
    knex('produto').insert({
        descricao: req.body.descricao,
        valor: req.body.valor,
        marca: req.body.marca,
    }, ['id'])
        .then(produtos => res.status(201).json({ "id": usuario.id }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao inserir produto - ' + err.message
            })
        })
})

apiRouter.put(endpoint + 'produtos/:id', (req, res) => {
    knex('produto').where('id', req.params.id).update({
        descricao: req.body.descricao,
        valor: req.body.valor,
        marca: req.body.marca,
    }).then(produtos => res.status(200).json({ "id": usuario.id }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao remover produto - ' + err.message
            })
        })
})

apiRouter.delete(endpoint + 'produtos/:id', (req, res) => {
    knex('produto').where('id', req.params.id)
        .del().then(produtos => res.status(200).json({ "id": usuario.id }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao remover produto - ' + err.message
            })
        })
})


module.exports = apiRouter;



