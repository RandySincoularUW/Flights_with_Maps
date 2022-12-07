const {Pool} = require("pg")

require("dotenv").config()  

    // Database Pool Connection
    const pool = new Pool({
            
        database: process.env.targetDB,
        user: process.env.pgUser,
        password: process.env.pgPassword,
        port: process.env.pgPort,
        host: process.env.pgHost,
        max: 2,                              // # of pool connections
        connectionTimeoutMillis: 10000,      // How long to wait for new pool connection
        idleTimeoutMillis: 10000             // How long to wait before destroying unused connections
    })

    // Database Query
// ---------------

// const query = `select max(id) from flights;`
const query1 = `select * from flights;`

const query2 = `select current_time(2);`

const runQuery = async () => {
    try {

        console.log("connecting to database ... ")

        const {rows} = await pool.query(query2)
        return rows

    } catch (error) {
        console.log("Error with query: " + error)

    } finally {
        console.log(" done testing postgres connection")
    
    }

} // end runQuery()

// Run the Database Query
// - when the query returns as a Promise, call myFunction() 
//   with the results of the query
// -------------------------------------------
runQuery()