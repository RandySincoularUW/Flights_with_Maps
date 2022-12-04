const PORT = 8000

// Import Uility Functions

// comment out 21-Nov-22
// const {createCSV} = require('../server/utils.js')

const {connectDB, queryDB, loadCSV, getMaxSequenceNumber, runQueries} = require('../server/database.js')

const {setSequenceNumber} = require('../server/utils.js')

const express = require("express")

const app = express()

const cors = require("cors")

require("dotenv").config()

// *Need version 2.6.* of node-fetch library*
const fetch = require("node-fetch")

const request = require("request");
const { response } = require("express")


// Get the API Key from an Environment Variable called: FLIGHTS_API_KEY
const myFlightsAPIKey = process.env.flightsAPIKey

console.log("server.js(): myFlightsAPIKey: " + myFlightsAPIKey)
// Distance to find nearby airports
const nearbyAirportDistance = process.env.nearbyAirportDistance

console.log("nearby airport distance: " + nearbyAirportDistance)

const api_base = "https://airlabs.co/api/v9/";

app.use(cors())

// 3-Dec-22 Updated.  Changed alert to: console.error()
app.get('/flights', async (request, response) => {
  console.error("/flights is an invalid route")
  response.send("/flights is an invalid route")
  
})

// 3-Dec-22 Added.  
app.get('/hello', async (request, response) => {
  console.log("Hello to You! API route has been called")
  response.send("Hello to You")
  
})

// ----------------------------
// This function calls an API to get current flights around a specific airport
// Pass in an airport code as a Route Parameter
// Current flights for Airport
// ----------------------------
app.get('/flights/:airport_code', async (request, response) => {

  scriptName = "server.js: /flights/:airport_code(): "
  console.log("in " + scriptName + " ...")
  try {


          // Airport Code Parameter 
          console.log(scriptName + " request.params.airport_code: " + request.params.airport_code)

          var my_airport_code = request.params.airport_code
          console.log(scriptName + " airport_code: " + my_airport_code)

          // Check if airport_code is being passed in
          console.log(scriptName + "  length of airport code: " + my_airport_code.length)

          if (my_airport_code.length < 1) {
            alert("Missing airport code is available.  Please send in an airport code with this request.")
          }

          // Departing from Airport
          // const api_url = 'https://airlabs.co/api/v9/flights?api_key=' + myFlightsAPIKey + '&dep_iata=' + my_airport_code

          // Arrivals
          const api_url = 'https://airlabs.co/api/v9/flights?api_key=' + myFlightsAPIKey + '&arr_iata=' + my_airport_code

          console.log("*my airport code: " + api_url)

          const fetch_response = await fetch (api_url);
          const json = await fetch_response.json();

          console.log(json)

          // Read the response stream and produce and return a JavaScript object
          response.json(json);

          console.log(" +++++++++ calling runQueries() +++++++++++++++")
          runQueries(json)
          console.log(" +++++++++ completed runQueries() +++++++++++++++")

          // ------- end Sunday 20-Nov-22 Changes

          console.log(`${scriptName} ++++++++++++ done with getFlights airport code: ++++++++++++++` + my_airport_code)
        }
  catch (error) {
    console.error(scriptName + " Error getting flights for airport: " + error.stack)
  }

}); //end flights

// ----------------
// Nearby Airports
// ----------------

app.get('/nearbyAirports/:latitude,:longitude', async (request, response) => {

  try {



        // Airport Code Parameter 
        console.log("**server.js: nearbyairports(/) request.params.latitude Longitude: " + request.params.latitude + request.params.longitude)

        var latitude = request.params.latitude
        var longitude = request.params.longitude

        console.log("server.js: lat: " + latitude + ' long:' + longitude)

        // Check if latitude, longitude is being passed in
        console.log("server.js  length of lat long: " + latitude.length)

        if (latitude.length < 1) {
          alert("Missing latitude.  Please send in a latitude with this request.")
        }

        if (longitude.length < 1) {
          alert("Missing longitude value.  Please send in a longitude value with this request.")
        }

        // URL to Get Nearby Airports
        const api_url = 'https://airlabs.co/api/v9/nearby?api_key=' + myFlightsAPIKey + '&distance=' + nearbyAirportDistance + '&lat=' + latitude + '&lng=' + longitude


        console.log("*nearby airport URL: " + api_url)

        // Make request to airlabs.com 
        const fetch_response = await fetch (api_url);
        const json = await fetch_response.json();

        console.log(json)
        response.json(json);

}
catch (error) {
    console.error("Error getting nearby airport: " + error)

}

}); //end nearbyAirports

// 3-Dec-22 Modified
// app.listen(PORT, '0.0.0.0', () => console.log("Listening on PORT: " + PORT))
app.listen(PORT, '0.0.0.0', function(error) {
  if (error) {
    console.error("Error while starting server" + error.stack)
  }
  else {
    console.log("Listening on PORT: " + PORT)
  }
})