
// Updates
// 9-Feb-23     no longer using getmaxsequencenumber.  No longer have a primary key in the database,
//              so we don't have to worry about unique constraint errors in the id #.
//
// 10-Feb-23    This script is getting called twice, resulting in duplicate records being inserted into the DB
//
// 11-Feb-23    Added this to allowed origin:  'http://127.0.0.1/?',.  Now, the client side no
//              no longer needs to use the server IP address!
// 
const PORT = 8000

// Import Uility Functions

const {connectDB, queryDB, runQueries} = require('../server/database.js')

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

// Middleware. allowedOrigins - list of URL's that can access the node server routes
app.use(function (req, res, next) {

  console.log("+++++++++ in app.use() +++++++++++ ")

  // Add 2-Jan-23
  // 16-Feb-23 Test
  
  const allowedOrigins = ['http://44.197.70.59', 
                          'http://44.197.70.59:8000/?', 
                          'http://44.197.70.59:8000/nearbyAirports/?',
                          'http://127.0.0.1',
                          'http://127.0.0.1/?',
                          'http://127.0.0.1:8000/flights/MSN',
                          'http://127.0.0.1:8000/hello', 
                          'http://127.0.0.1:8000/?', 
                          'http://127.0.0.1:8000/nearbyAirports/?',
                          'http://127.0.0.1:8000/nearbyAirports/?/?',
                          'http://localhost:8000/hello', 
                          'http://localhost:8000']

  const origin = req.headers.origin

  console.log("fetch_server: origin: " + origin)
  //console.log(req)
  
  if (allowedOrigins.includes(origin)) {
    console.log("  **origin is included: " + origin)
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  else {
    console.log(" origin is NOT included: " + origin)
  }


// add for testing wildcard 16-Feb-23
// Wildcard option does Not work
// res.setHeader('Access-Control-Allow-Origin','*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


app.get('/hello', async (request, response) => {
  console.log("Hello to You! API route has been called")

  response.send({message: "Hello to You"})
  
})

// 3-Dec-22 Updated.  Changed alert to: console.error()
app.get('/flights', async (request, response) => {
  console.error("/flights is an invalid route")
  response.send("/flights is an invalid route")
  
})

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

            my_airport_code = process.env.defaultAirportCode
            alert("Missing airport code.  Default set to: " + my_airport_code)
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
          
          // 10-Feb-23 We are getting duplicate records
          runQueries(json)

          console.log(" +++++++++ completed runQueries() +++++++++++++++")

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

        var latitude, longitude

        // Check if latitude and longitude are populated
        if (isNaN(request.params.latitude)) {
          console.log(" ** setting lat to default value ...")
          // Populate latitude from the default value in .env file
          latitude = process.env.defaultLatitude

          // Save latitude and longitude to local storage
          // localStorage.setItem('latitude',`${latitude}`)
        }
        else {
          // Populate from route parameters
          latitude = request.params.latitude
        }

        if (isNaN(request.params.longitude)) {
          console.log(" ** setting lat to default value ...")
          // Populate latitude from the default value in .env file
          longitude = process.env.defaultLongitude

        }
        else {
          // Populate from route parameters
          longitude = request.params.longitude
        }

        console.log("server.js: lat: " + latitude + ' long:' + longitude)

        // Check if latitude, longitude is being passed in
        console.log("server.js  length of lat long: " + latitude.length)

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

app.listen(PORT, '0.0.0.0', function(error) {

  if (error) {
    console.error("Error while starting server" + error.stack)
  }
  else {
    console.log("Node Server is Listening on PORT: " + PORT)
  }
})