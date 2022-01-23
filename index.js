import express from "express";
import router from "./routes/index.js";
import expressLayouts from 'express-ejs-layouts';
import methodOverride from "method-override";
import session from "express-session";
import flash from 'connect-flash';
import cookieParser from "cookie-parser";
import ConnectMongoDBSession from "connect-mongodb-session";
import { database } from "./config/Database.js";
import path from "path";



const app = express();
const port = process.env.PORT || 3000;
const MongoDBSession = ConnectMongoDBSession(session)
const store = new MongoDBSession({
  uri: 'mongodb+srv://teguh:ganteng@cluster0.r0ah9.mongodb.net/pungutSuara?retryWrites=true&w=majority',
  collection: 'mySession'
})

// SetUp EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use('/favicon.ico', express.static('images/favicon.ico'));

// SetUp Flash
app.use(cookieParser('secret'));
app.use(session({
  // cookie: { maxAge: 6000 },
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(flash());
app.use('/public', express.static(path.join(path.resolve(), 'public')))

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('_method'));

// Connect Database
database()

app.use(router)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});