// The format of the result object from a SQL query 
// is in a JSON Array format

const {Pool} = require("pg")

const path = require("path")
const os = require('os')
const fs = require("fs")

const tempDir = os.tmpdir()

require("dotenv").config()  

let csvFile             // Global variable so other methods have access to it

try {

    csvFile = process.env.csvFile

    console.log("database.js: csvFile: " + csvFile)

} catch (error) {
    console.log("Error in: database.js:  " + error.stack)
}

// ---------------------------
// Create Text File of Flights
// Load into Postgres DB Table
// ----------------------------

    const createCSV = async (json, currentID) => {
    
    scriptName = "database.js: createCSV(): "
    console.log("in " + scriptName + " startingSeqNum: " + currentID)

    console.log(scriptName + " json.response.length: " + json.response.length)

    var nextID = currentID        // this is the starting sequence number of ID column

    // Create New CSV File
    const writableStream = fs.createWriteStream(csvFile,{flags:'w'})   // write stream for creating the output file

    try {
   
            // Indicate no data is available when API is not reachable
            if (json.response.length < 1) {

                // Create entry to indicate 'no data' available
                console.error(scriptName + "no data available from API")
                process.exit(1)
            }

            else {
           
                console.log(scriptName + " adding header records to: " + csvFile)

                // *Add a timstamp value in the DB Record

                // Loop through the response

                var delim = ","

                // Write Header Containing Column Names in CSV File

                writableStream.write('id' + delim + 'time_stamp' + delim + 'reg_number' + delim + 'alt' + delim  +
                'dir' + delim + 'speed' + delim + 'lat' + delim + 'lng' + delim + 'dep_iata' + delim + 'flight_icao' + delim + 'status' + `\n`, 'UTF8')

                console.log(scriptName + " looping through flight records ")
 

                for (let i = 0; i < json.response.length;i++) {
             
                     /* writableStream.write(new Date().toISOString() + delim + json.response[i].reg_number + delim + json.response[i].alt + delim  +
                        json.response[i].dir + delim + json.response[i].speed + delim + json.response[i].lat +
                        delim + json.response[i].lng + delim + json.response[i].flight_icao + delim + json.response[i].status + `\n`, 'UTF8')
                    */
                        writableStream.write(currentID + delim+ getDateTime() + delim + json.response[i].reg_number + delim + json.response[i].alt + delim  +
                        json.response[i].dir + delim + json.response[i].speed + delim + json.response[i].lat +
                        delim + json.response[i].lng + delim + json.response[i].dep_iata + delim + json.response[i].flight_icao + delim + json.response[i].status + `\n`, 'UTF8')


                    console.log(currentID + delim + getDateTime(), json.response[i].reg_number + delim + json.response[i].alt + delim  +
                    json.response[i].dir + delim + json.response[i].speed + delim + json.response[i].lat +
                    delim + json.response[i].lng + delim + json.response[i].dep_iata + delim + json.response[i].flight_icao + delim + json.response[i].status)

                    // Increment Sequence Number
                    currentID = currentID + 1

                    }  // end for

                // Close the stream
                writableStream.end()
                
                console.log(" ")
                console.log("Finished writing to CSV file: " + csvFile)

            console.log(`CSV file saved as: ${csvFile}`)
            console.log(" ")
            console.log(" ")
 
            
        } // end if/else

    } catch (error) {
            console.error("Error in: createCSV() Error: " + error.stack)

            process.exit(1)

        } finally {
          
            console.log(scriptName + " done with createCSV()")
        }

        // endless loop
        //module.exports = createCSV()

} // end createCSV()

// ++++++++++++++++++++++++++

// Load CSV
// ---------
// 21-Nov-22 comment out. Reference Error: loadCSV() is not defined
// module.exports.loadCSV = async function loadCSV() {

// add this 21-Nov-22
const loadCSV = async () => {
    scriptName = "database.js: loadCSV(): "
    console.log('   ')
    console.log('   ')
    
    console.log(" ------------------ " + scriptName + " starting -------------")
    
    var loopCounter = 0
    var error = false


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

            // Copy CSV File Into Database
            try {
                
                //const result = await client.query(`\COPY ${process.env.dbTable} FROM ${csvFile} WITH DELIMITER ',' CSV`)

                // const result = await pool.query(`\COPY flights (id,time_stamp,reg_number,altitude,direction,speed,latitude,longitude,dep_iata,flight_icao,status) FROM ${csvFile} WITH DELIMITER ',' CSV`)

                var string = `COPY ${process.env.dbTable} FROM ${csvFile} WITH HEADER DELIMITER ',' CSV`

                console.log(" copy string: " + string)
                console.log("csvFile: " + csvFile)

                // const result = await pool.query(`\COPY flights (id,time_stamp,reg_number,altitude,direction,speed,latitude,longitude,dep_iata,flight_icao,status) FROM '${csvFile}' WITH DELIMITER ',' CSV`)

                // 21-Nov-22 change to {rows}
                console.log(scriptName + " calling copy command now ...")
                const rows = await pool.query(`COPY ${process.env.dbTable} FROM '${csvFile}'  WITH HEADER DELIMITER ',' CSV;`)
                console.log(scriptName + " copy command done ...")

                // 21-Nov-22 Option for displaying key, value pairs
                /*
                for(var i = 0, value; value=rows[i++];) {
                    console.log("===== "+ i + " =======")
                    for (var key in value) {
                        console.log("key: " + key + " value: " + value[key])
                    }
                }
                */

                // console.log(scriptName + " CSV load completed. Status: " + result[0].rows)
                // comment out 21-Nov-22
                // console.log(scriptName + " loadCSV() completed. Status: " + result[0].rows)
                console.log(scriptName + "loadCSV() completed ...")
                console.log(scriptName + "--------------------------------------------")

            } catch (error) {
                console.error(scriptName + " Error loading CSV file: " + error.stack)

            }

        finally {
            // console.log(scriptName + " closing database connection ...")
            // Close any database connections
            // await client.end()
            console.log(" ------------------ " + scriptName + " done -------------")

        }

} // end loadCSV()

// ----------------------------
// Get Max Sequence Number
// ----------------------------


// Sunday 20-Nov-22 Testing
// module.exports.getMaxSequenceNumber = async function getMaxSequenceNumber() {
    const getMaxSequenceNumber = async () => {
          
    // const {client} = require("../server/database.js")
    
    scriptName = "database.js: getMaxSequenceNumber(): "
    console.log("in " + scriptName + " ...")

    var maxID = 0
    var currentSeqNum = 0
    var maxSeqNum = 0

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


const query2 = `select max(id) from ${process.env.dbTable};`

const query4 = `select nextval('flights_id_seq');`

const query5 = `select setval('flights_id_seq',(select max(id) from ${process.env.dbTable}) + 1;`

    try {

        // This is the fix for the issue of getting unique constraint errors
        // https://stackoverflow.com/questions/4448340/postgresql-duplicate-key-violates-unique-constraint

        // Get Max(ID) from ID Column in Flights TaBLE
        const query1 = `select max(id) from ${process.env.dbTable};`

        // Get the sequence id from the flights table
        //const query2 = `select nextval('flights_id_seq');`

        // Update the sequence #
        // const query5 = `select setval('flights_id_seq',(select max(id) from ${process.env.dbTable}) + 1;`

        // If the value of query1 is higher than the result of query2, then
        // perform the following to update the next sequence:
        // select setval('flights_id_seq', (SELECT MAX(ID FROM flights) + 1);
 
        // -----------------------------------
        // Query for current value of max(id)
        // -----------------------------------
        var {rows} = await pool.query(query2)

        /*
        for(var i = 0, value; value=rows[i++];) {
            console.log("===== "+ i + " =======")
            for (var key in value) {
                console.log("key: " + key + " value: " + value[key])
            }
        }
        */

        // ------------------------------------------------------
        // Get Current Value for Max(ID)
        // If the table is new and there are no sequence #'s yet
        // ------------------------------------------------------
        if ((isNaN(rows[0].nextval)) || (rows[0].nextval == null)) {
 
            maxID = 1

        } else {
            maxID = rows[0].nextval

        }

        console.log(scriptName + " ** Max(ID) is: " + maxID)

 
        // return parseInt(maxID)

        maxSeqNum = parseInt(maxID)
        return maxSeqNum



    } catch (error) {
        console.error(scriptName + " Error getting max(id): " + error)

    } finally {
        console.log(scriptName + " all done ...")

    }

    console.log(scriptName + " done with getMaxSequenceNumber() ...")

} // end getMaxSequenceNumber()

// runQueries()
// -------------
module.exports.runQueries = async function runQueries(json) {

    var maxSeqNum = 0

    console.log(" ----------- starting runQueries() ----------")

    try {

        // Get Max Sequence Number as Integer
        console.log(" ")
        console.log(scriptName + " calling getMaxSequenceNumber()")
        maxSeqNum = await getMaxSequenceNumber()

        // console.log(scriptName + " done.  maxSeqNum: " + maxSeqNum)
        console.log(" done with getMaxSequenceNumber() maxSeqNum: " + maxSeqNum)

        console.log(" ")
    } catch (error) {
        console.log("error with runQueries() msg: " + error.stack)

    } finally {
        console.log(" done with getMaxSequenceNumber() ...")
    }

    // Create CSV File
    // ---------------

    try {
        console.log(scriptName + " calling createCSV() maxSeqNum: " + maxSeqNum)
        const results1 = await createCSV(json,maxSeqNum)

        console.log(" ")
    } catch (error) {
        console.log(" Error with createCSV() ... msg: " + error.stack)

    } finally {
        console.log(" done with createCSV() ...")
    }

    try {

        // Load the CSV file into the DB
        console.log(scriptName + " +++++++++++++++++++ calling loadCSV() ... with maxSeqNum: " + maxSeqNum + " +++++++++++++++++")
        const results2 = await loadCSV(maxSeqNum)

    } catch (error) {
        console.log(" error with loadCSV() ... msg: " + error.stack)

    } finally {
        console.log(" done with loadCSV() ...")
    }


        console.log(scriptName + " done with runQueries() .............")

    } // end function runQueries()

// =============================
//* 21-Nov-22 Moved this here from the utils file.
//* Was getting a reference error: getDateTime is not defined

function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
         month = '0'+month;
    }
    if(day.toString().length == 1) {
         day = '0'+day;
    }   
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    if(second.toString().length == 1) {
         second = '0'+second;
    }   
    
    // var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;  

    var dateTime = month+'/'+day+'/'+year+' '+hour+':'+minute+':'+second; 


     return dateTime;
}