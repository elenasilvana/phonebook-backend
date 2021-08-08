const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

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

//data

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  response.send(
    `<div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    </div>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const personID = Number(request.params.id);

  const person = persons.find((person) => person.id === personID);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const personID = Number(request.params.id);

  persons = persons.filter((person) => person.id !== personID);

  response.status(204).end();
});

const randomIdRange = (min, max) => {
  const minNumber = Math.ceil(min);
  const maxNumber = Math.ceil(max);

  return Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
};

const isNameExistent = (name) =>
  Boolean(
    persons.find((person) => person.name.toLowerCase() === name.toLowerCase())
  );

app.post("/api/persons", (request, response) => {
  const name = request.body.name;
  const number = request.body.number;

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number property is missing",
    });
  }

  if (isNameExistent(name)) {
    return response.status(400).json({
      error: "This name already exists",
    });
  }

  if (number.length < 10 || number.length > 10) {
    return response.status(400).json({
      error: "invalid phone number",
    });
  }

  const newPerson = {
    name,
    number,
    id: randomIdRange(100, 1000),
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
});

const PORT = 3001;
app.listen(PORT);
console.log("server running on ", PORT);
