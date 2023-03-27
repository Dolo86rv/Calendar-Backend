const { response } = require('express')
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const { generarJWT } = require('../helpers/jwt')

const crearUsuario = async(req, res = response )=>{
    
    const { email, password } = req.body

    try {

        let usuario = await Usuario.findOne({ email})
        if( usuario ){
            return res.status(400).json({
                ok:false,
                msg:"Existe un usauario con ese correo electronico"
            })
        }
        
        usuario = new Usuario( req.body )

        //Encriptar contraseña
        const salt= bcrypt.genSaltSync()
        usuario.password = bcrypt.hashSync( password, salt)

        await usuario.save()
        
        //Generar JWT
        const token = await generarJWT( usuario.id, usuario.name)

        return res.status(201).json({
            ok: true,
            uid: usuario.id,
            name:usuario.name,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg:'Por favor consulte al administrador'
        })
        
    }
}

const loginUsuario = async(req, res = response)=>{
    
    const { email, password } = req.body

    try {
        
        const usuario = await Usuario.findOne({ email})
        if( !usuario ){
            return res.status(400).json({
                ok:false,
                msg:"El usuario y contraseña no son correctos"
            })
        }

        //confirmar los passwords
        const validPassword = bcrypt.compareSync( password, usuario.password)

        if( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Password Incorrecto'
            })
        }
        //Generar JWT
        const token = await generarJWT( usuario.id, usuario.name)

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg:'Por favor consulte al administrador'
        })
    }
}

const revalidarToken = async(req, res = response)=>{
    
    const { uid, name } = req

    const token = await generarJWT( uid, name )

    res.json({
        ok: true,
        uid, name,
        token
    })
}


module.exports = { 
    crearUsuario,
    loginUsuario,
    revalidarToken
}