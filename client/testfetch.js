
try {


    const response = await fetch("http://localhost:8000/flights/MSN");

    // Wait for response from flight API
    const json = await response.json();

    console.log("** app.js: getFlights() " + json);

    console.log("app.js: getFlights() length: " + json.response.length)

    if (json.response.length < 1) {
        alert("No response from flight tracking API ... try again later")
    }

} catch (error) {
    console.log("Error: " + error.stack)
}