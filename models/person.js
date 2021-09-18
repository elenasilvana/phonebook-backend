const mongoose = require("mongoose");
const url = process.env.MONGO_URI;
console.log("process env", process.env.MONGO_URI);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => console.log("connected to mongodb"))
  .catch((error) => console.log("error connecting to mongodb ", error));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJson", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toSstring();
    delete returnedObject.__v;
    delete returnedObject._id;
  },
});

module.exports = mongoose.model("Person", personSchema);
