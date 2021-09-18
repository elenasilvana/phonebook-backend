require("dotenv").config();
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Missing arguments, please provide your password");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = process.env.MONGO_URI;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (password && name && number) {
  const person = new Person({
    name,
    number,
  });

  person.save().then((result) => {
    console.log(`${name} number: ${number} was added to your phonebook!`);
    mongoose.connection.close();
  });
} else if (password) {
  Person.find({ name: "Tom" }).then((result) => {
    result.forEach(({ name, number }) => {
      console.log(`${name} number: ${number}`);
    });
    mongoose.connection.close();
  });
}
