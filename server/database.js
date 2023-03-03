// Updates
// 7-Feb-23     created new method: loadCSV2 to insert records into postgres database
// 8-Feb-23     removed code for: get max sequence number. Now, we are just writing all CSV
//              records into the postgres database.  Might be good for students to add
//              code to remove/clean up db records when clicking a button, etc.
//
// 9-Feb-23     No longer use maxseqnum in createCSV()

// ++++++++++++++++++++++++++

// The format of the result object from a SQL query 
// is in a JSON Array format

const {Pool} = require("pg")

const path = require("path")
const os = require('os')
const fs = require("fs")

const fastcsv = require("fast-csv") // added 7-Feb-23

const tempDir = os.tmpdir()

require("dotenv").config()  

let csvFile             // Global variable so other methods have access to it

// Get name of csvFile from .env file
try {

    csvFile = process.env.csvFile

    console.log("database.js: csvFile: " + csvFile)

} catch (error) {
    console.log("Error in: database.js:  " + error.stack)
}

// --------------------------------
// Create Text CSV File of Flights
// --------------------------------

//* 9-Feb-23 removed currentID 

    const createCSV = async (json) => {
    
    scriptName = "database.js: createCSV(): "
    console.log("in " + scriptName)

    console.log(scriptName + " json.response.length: " + json.response.length)

    var nextID, currentID = 1        // this is the starting sequence number of ID column

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

} // end createCSV()

// ++++++++++++++++++++++++++
// 7-Feb-23
// Use express and fastcsv to read CSV file and insert into Postgres
// Based on this code sample: https://www.bezkoder.com/node-js-csv-postgresql/

const loadCSV2 = async () => {
    console.log(" in loadCSV2() ")

    let stream = fs.createReadStream(csvFile)
    let csvData = []
    let csvStream = fastcsv
        .parse()

        // Register an event listener for when data is read in and parsed
        .on("data", function(data) {

            // Push data to the csvData array for each record
            csvData.push(data)
        })

        // Register an event listener after all records have been read
        .on("end", function() {

            // Remove first line (Header)
            csvData.shift();
       
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

            // Database Insert Statement
            const query = `INSERT INTO ${process.env.dbTable} (id, time_stamp, reg_number, altitude, direction, speed, latitude, longitude, dep_iata, flight_icao, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`

            // Connect to the Database
            pool.connect((err, client, done) => {
                if (err) throw err;

                try {

                    // Loop through all of the records
                    csvData.forEach(row => {
                        console.log("*forEach Loop: row: " + row)

                        // Insert Records into Database
                        client.query(query, row, (err, res) => {
                            if (err) {
                                console.log("Error in forEach: " + err.stack)

                            } else {
                                console.log("inserted: " + res.rowCount + " row:", row)
                            }

                        }) // end client.query

                    }); // end forEach
                } finally {
                    console.log(" done inserting records into database ...")

                    // Release the database client connection
                    done()

                } // end finally()

            }) // end pool.connect

        }) // end .on("end")

        console.log("calling stream.pipe(csvStream) ...")

        // Read the csv file
        stream.pipe(csvStream)

    } // end loadCSV2



// ++++++++++++++++++++++++++





// runQueries()
// -------------
module.exports.runQueries = async function runQueries(json) {

    console.log(" ----------- starting runQueries() ----------")

    // Create CSV File
    // ---------------

    try {
        console.log(scriptName + " calling createCSV()" )
        const results1 = await createCSV(json)

        console.log(" ")
    } catch (error) {
        console.log(" Error with createCSV() ... msg: " + error.stack)

    } finally {
        console.log(" done with createCSV() ...")
    }

    try {

        // Load the CSV file into the DB
        console.log(scriptName + " +++++++++++++++++++ calling loadCSV()  +++++++++++++++++")
        // 7-Feb-23
        // const results2 = await loadCSV(maxSeqNum)

        const results2 = await loadCSV2()

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