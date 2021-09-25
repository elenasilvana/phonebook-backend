require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      req.method === "POST" ? JSON.stringify(req.body) : "",
    ].join(" ");
  })
);

app.get("/info", (request, response) => {
  Person.find({})
    .then((persons) => {
      response.send(
        `<div>
          <p>Phonebook has info for ${persons.length} people</p>
          <p>${new Date()}</p>
        </div>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const personID = `${request.params.id}`;
  Person.findById(personID)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const personID = `${request.params.id}`;

  Person.findByIdAndRemove(personID)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  response.status(204).end();
});

app.post("/api/persons", (request, response, next) => {
  const name = request.body.name;
  const number = `${request.body.number}`;

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number property is missing",
    });
  }

  if (number.length >= 10 || number.length < 12) {
    const person = new Person({
      name,
      number,
    });

    person
      .save()
      .then((result) => {
        console.log(`${name} number: ${number} was added to your phonebook!`);
        return response.status(200).end();
      })
      .catch((error) => next(error));
  }

  /*  Person.find({ name: name })
      .then((result) => {
        if (result.length > 0) {
          personExist = true;
          return response
            .status(400)
            .json({
              error: "This name already exists",
            })
            .end();
        } else {
          person
            .save()
            .then((result) => {
              console.log(
                `${name} number: ${number} was added to your phonebook!`
              );
              return response.status(200).end();
            })
            .catch((error) => next(error));
        }
      })
      .catch((error) => next(error));
  }*/
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  const { id } = request.params;
  console.log(`id: ${id} name: ${name} number: ${number}`);

  const person = {
    name: `${name}`,
    number: `${number}`,
  };

  const opts = { runValidators: true, new: true };

  Person.findByIdAndUpdate(id, person, opts)
    .then((updatedPerson) => {
      console.log("person to update =====================", person);
      console.log("updatedPerson ///////////////////// ", updatedPerson);
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log("server running on ", PORT);
