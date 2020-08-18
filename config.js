require('dotenv').config()

const {Pool} = require('pg')

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString: isProduction ? proccess.env.DATABASE_URL : connectionString,
    ssl: isProduction 
})

module.exports = {pool}