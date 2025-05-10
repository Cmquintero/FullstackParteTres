require('dotenv').config()
const express = require("express");
const app = express();
app.use(express.json());
const morgan = require('morgan')
app.use(morgan("tiny"));
app.use(express.static("dist"))
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
const PORT = process.env.PORT
morgan.token("request-body", (request) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :request-body"
  )
);

const url = process.env.MONGODB_URI

const mongoose = require('mongoose')
const Person = require('./models/person')
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!


mongoose.set('strictQuery', false)
mongoose.connect(url)


/*
let notes = [
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
  {
    id: 5,
    name: "Mario Carlos",
    number: "3151451241",
  },
  {
    id:6,
    name:"Doky TeAmo",
    number:"25/24/25",
  },
];
*/

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

/*
const info = () => {
  const total = notes.length;
  const date = new Date();
  return `
    <p>Phonebook has info for ${total} people</p>
    <p>${date}</p>
  `;
};
app.get("/api/info", (request, response) => {
  response.send(info());
});

app.get("/api/persons/5", (request, response) => {
  const note = notes.find((n) => n.id === 5);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});
app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);//crei que funcionaba igual que el.filter pero en realidad en esta linea busco solo un id mas no creo un array nuevo eliminando el elemento como lo hago en(*)

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
}); 

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);//(*)
  response.send(`The person with id: ${id} has been delete`);
  response.status(204).end();
});
const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};*/

app.post("/api/persons", (request, response) => {
  const body = request.body;
if (!body.name || !body.number) {
  return response.status(400).json({ error: "name or number missing" });
}
Person.findOne({ name: body.name }).then(existingPerson => {
  if (existingPerson) {
    return response.status(400).json({ error: "The name already exists in the database" });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});