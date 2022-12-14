const { Flight } = require("../../models");
const { Op } = require("sequelize");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { GOFLIGHTLABS_ACCESS_KEY } = process.env;

const getAirport = async (iata) => {
  //const url = `https://port-api.com/airport/iata/${iata}`;
  const url = `https://api.aviowiki.com/free/airports/iata/${iata}`;
  const options = {
    method: "GET",
    headers: {
      //"X-RapidAPI-Host": "port-api.com",
      "X-RapidAPI-Host": "docs.aviowiki.com",
    },
  };
  const result = await fetch(url, options);
  const json = await result.json();
  return json;
};

const createFlight = async () => {
  try {
    const url = `https://app.goflightlabs.com/advanced-flights-schedules?access_key=${GOFLIGHTLABS_ACCESS_KEY}&status=scheduled`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "app.goflightlabs.com",
      },
    };
    const result = await fetch(url, options);
    const json = await result.json();
    const flights = json.data;

    const filterFlights = flights.filter(
      (flight) =>
        flight.airline.iataCode == "GA" ||
        flight.airline.iataCode == "IW" ||
        flight.airline.iataCode == "ID" ||
        flight.airline.iataCode == "JT" ||
        flight.airline.iataCode == "QG" ||
        flight.airline.iataCode == "AK" ||
        flight.airline.iataCode == "SJ"
    );

    for (const flight of filterFlights) {
      let airlineLogo;
      if (flight.airline.iataCode == "GA") {
        airlineLogo = "https://bit.ly/3BOGwXN";
      } else if (flight.airline.iataCode == "IW") {
        airlineLogo = "http://bit.ly/3G4OO0p";
      } else if (flight.airline.iataCode == "ID") {
        airlineLogo = "http://bit.ly/3Ytqr3w";
      } else if (flight.airline.iataCode == "JT") {
        airlineLogo = "https://bit.ly/3WbvdBj";
      } else if (flight.airline.iataCode == "QG") {
        airlineLogo = "https://bit.ly/3v6DYAJ";
      } else if (flight.airline.iataCode == "AK") {
        airlineLogo = "https://bit.ly/3PF90Jm";
      } else {
        airlineLogo = "https://bit.ly/3FDlHzT";
      }

      const origin = await getAirport(flight.departure.iataCode);
      const destination = await getAirport(flight.arrival.iataCode);
      const data = await Flight.create({
        airline: flight.airline.name,
        airline_logo: airlineLogo,
        origin: flight.departure.iataCode,
        //origin_city: origin.properties.municipality,
        origin_city: origin.servedCity,
        destination: flight.arrival.iataCode,
        //destination_city: destination.properties.municipality,
        destination_city: destination.servedCity,
        departure: flight.departure.scheduledTime,
        arrival: flight.arrival.scheduledTime,
      });

      const random = Math.random() * (7 - 2) + 2;
      const newDeparture = data.departure.setDate(
        data.departure.getDate() + random
      );
      const newArrival = data.arrival.setDate(data.arrival.getDate() + random);
      await Flight.update(
        { departure: newDeparture, arrival: newArrival },
        { where: { id: data.id } }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const createFlightAdmin = async (req, res, next) => {
  try {
    const { airline, origin, destination, departure, arrival } = req.body;

    if (new Date(departure).getTime() >= new Date(arrival).getTime()) {
      return res.status(400).json({
        status: false,
        message: "Check Departure & Arrival Time!",
      });
    }

    const exist = await Flight.findOne({
      where: {
        [Op.and]: [
          { airline },
          { origin },
          { destination },
          { departure },
          { arrival },
        ],
      },
    });

    if (exist) {
      return res.status(409).json({
        status: false,
        message: "Flight Already Exist!",
        data: exist,
      });
    }

    let airlineLogo;
    if (airline == "Garuda Indonesia") {
      airlineLogo = "https://bit.ly/3BOGwXN";
    } else if (airline == "Wings Air (Indonesia)") {
      airlineLogo = "http://bit.ly/3G4OO0p";
    } else if (airline == "Batik Air") {
      airlineLogo = "http://bit.ly/3Ytqr3w";
    } else if (airline == "Lion Air") {
      airlineLogo = "https://bit.ly/3WbvdBj";
    } else if (airline == "Citilink") {
      airlineLogo = "https://bit.ly/3v6DYAJ";
    } else if (airline == "AirAsia") {
      airlineLogo = "https://bit.ly/3PF90Jm";
    } else {
      airlineLogo = "https://bit.ly/3FDlHzT";
    }

    const originCity = await getAirport(origin);
    const destinationCity = await getAirport(destination);
    const createFlight = await Flight.create({
      airline,
      origin,
      //origin_city: originCity.properties.municipality,
      origin_city: originCity.servedCity,
      destination,
      //destination_city: destinationCity.properties.municipality,
      destination_city: destinationCity.servedCity,
      departure,
      arrival,
      airline_logo: airlineLogo,
    });

    return res.status(201).json({
      status: true,
      message: "Success Create Flight!",
      data: {
        airline: createFlight.airline,
        origin: createFlight.origin,
        originCity: createFlight.origin_city,
        destination: createFlight.destination,
        destinationCity: createFlight.destination_city,
        departure: createFlight.departure.toLocaleDateString(),
        departureTime: createFlight.departure.toLocaleTimeString(),
        arrival: createFlight.arrival.toLocaleDateString(),
        arrivalTime: createFlight.arrival.toLocaleTimeString(),
        logo: createFlight.airline_logo,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFlight, createFlightAdmin };
