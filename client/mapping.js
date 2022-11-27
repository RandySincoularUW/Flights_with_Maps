var scriptName = "mapping.js"

console.log("in " + scriptName)

// Can't use this in client
// require("dotenv").config()

// Get Flight Locations
// This option uses an API Route from the local server
// The other option is to do a query/fetch of the database

// Get the API Key from an Environment Variable called: FLIGHTS_API_KEY
// How to use api key from env variable?
myFlightsAPIKey = "3c2dba84-2dce-4099-a9af-ec75b8d02f5a"

// Default Airport Code
// const defaultAirportCode = process.env.defaultAirportCode
defaultAirportCode = "MSN"

console.log("mapping.js: checking flightURL ...")
flightURL = 'https://airlabs.co/api/v9/flights?api_key=' + myFlightsAPIKey + '&arr_iata=' + defaultAirportCode


            // Add Flight data

            async function showFlights() {
                scriptName = "mapping.js: showFlights(): "
                console.log("in "+ scriptName)

                const response = await fetch(flightURL)
                const json = await response.json()

                console.log(scriptName + " data: " + json)

                var delim = ","

                var planeIcon = L.icon({
                    iconUrl: 'icons8-plane-24.png',
                
                    iconSize:     [24, 24], // size of the icon
                    shadowSize:   [26, 26], // size of the shadow
                    iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
                    popupAnchor:  [-3, -24] // point from which the popup should open relative to the iconAnchor
                });


                for (let i = 0; i < json.response.length;i++) {
             
                    // Put marker on map
                    console.log("adding marker to map. LatLng: " + json.response[i].lat,json.response[i].lng)

                    // const marker = L.marker([json.response[i].lat,json.response[i].lng]).addTo(map)
                    const marker = L.marker([json.response[i].lat,json.response[i].lng],{icon:planeIcon}).addTo(map)

                   console.log(json.response[i].reg_number + delim + json.response[i].alt + delim  +
                   json.response[i].dir + delim + json.response[i].speed + delim + json.response[i].lat +
                   delim + json.response[i].lng + delim + json.response[i].dep_iata + delim + json.response[i].flight_icao + delim + json.response[i].status)

                   }  // end for


            }  // end showFlights()


            async function showFlights_save() {

                scriptName = "mapping.js: showFlights(): "
                const response = await fetch(flightURL);
                const reportData = await response.json();
                console.log(scriptName + " in " + scriptName)

                var flightLayer = new L.geoJSON(reportData,{

                    onEachFeature: function (feature,flightLayer) {

                    console.log(scriptName + " feature.properties: " + feature.properties)
                    console.log(scriptName + " flightLayer: " + flightLayer)

                    if(feature.properties && feature.properties.name) {
                        var popupContent = '<table>';
                        for (var p in feature.properties) {
                            popupContent +='<tr><td>' + p + ':</td><td><b>' + feature.properties[p] + '</b></td></tr>';
                        }
                        popupContent += '</table>';
                        layer.bindPopup(popupContent);
                    }
                    },
                    pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, {icon: iconByDisasterType(feature)})

                    }
                });    
                        
                //reportLayer.addTo(mymap).bindPopup(feature.properties.name);
                flightLayer.addTo(mymap);

            }  // end getFlights()

    console.log("mapping.js: done with mapping.js() ...")