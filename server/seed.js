const pdf = require('pdf-parse');
const axios = require('axios');
require('dotenv').config({ path: 'variables.env' });
const mongoose = require('mongoose');

const Publication = require('./models/Publication');

let pubCounter = 0;
let trCounter = 0;

// import environmental variables from our variables.env file
const options = {
  user: process.env.USERNAME,
  pass: process.env.PASSWORD,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};

// Connect to our Database and handle any bad connections // move to another file later
mongoose.connect(process.env.DATABASE, options, () => {
  // drop old db if already present
  if (mongoose.connection.db) {
    mongoose.connection.db.dropDatabase();
  }
});

// making sure mongo is working
mongoose.connection.once('open', () => {
  console.log('Mongo is running');
});

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

async function parseFile() {
  try {
    const publicationResponse = await axios.get(
      'https://web.sercuarc.org/api/publications'
    );

    const trResponse = await axios.get(
      'https://web.sercuarc.org/api/technical-reports'
    );

    const publicationsData = publicationResponse.data;
    const trsData = trResponse.data;

    for (const tr of trsData) {
      let data;
      if (tr.file_s3 && tr.file_s3.split('.').includes('pdf')) {
        try {
          data = await pdf(tr.file_s3);
        } catch (e) {
          console.log(e);
          data = undefined;
        }
      }
      let authors;
      if (tr.research_tasks[0] && tr.research_tasks[0].people) {
        authors = tr.research_tasks[0].people.map(
          (author) =>
            `${author.prefix || ''} ${author.first_name} ${author.last_name}`
        );
      }

      const newFile = await createFile({
        data,
        id: tr.id,
        title: tr.title,
        abstract: tr.research_tasks[0] && tr.research_tasks[0].abstract,
        category: tr.type,
        file_s3: tr.file_s3,
        image_s3: tr.image_s3,
        publication_date: tr.publication_date,
        authors
      });
      if (newFile) trCounter++;
    }

    for (const pub of publicationsData) {
      let data;
      if (pub.file_s3 && pub.file_s3.split('.').includes('pdf')) {
        try {
          data = await pdf(pub.file_s3);
        } catch (e) {
          console.log(e);
          data = undefined;
        }
      }

      let authors;
      if (pub.research_tasks[0] && pub.research_tasks[0].people) {
        authors = pub.authors.map(
          (author) =>
            `${author.prefix || ''} ${author.first_name} ${author.last_name}`
        );
      }

      const newFile = await createFile({
        data,
        id: pub.id,
        title: pub.title,
        abstract: pub.abstract,
        category: pub.category,
        file_s3: pub.file_s3,
        image_s3: pub.image_s3,
        publication_date: pub.publication_date,
        authors
      });
      if (newFile) pubCounter++;
    }

    console.log(
      `${pubCounter} publications created and ${trCounter} TRs created.`
    );
  } catch (e) {
    console.log(e);
  }
}

async function createFile(createObject) {
  try {
    const file = await Publication.create({
      id: createObject.id,
      title: createObject.title,
      text: createObject.data && createObject.data.text.trim(),
      abstract: createObject.abstract,
      category: createObject.category,
      file_s3: createObject.file_s3,
      image_s3: createObject.image_s3,
      publication_date:
        createObject.publication_date &&
        createObject.publication_date.replace(/(-)/gi, '/'),
      authors: createObject.authors
    });

    return file;
  } catch (e) {
    console.log(e);
  }
}

parseFile();

async function createAnotherfile() {
  const data = await pdf(
    'https://sercproddata.s3.us-east-2.amazonaws.com/publication_documents/reports/1534783148-65_Evaluating-the-Application-of-MBSE-to-Concept-Enginering_Journal-Article.pdf'
  );

  createFile({
    id: 12,
    title: 'Evaluating the Application of MBSE to Concept Engineering',
    data,
    category: 'Conference Paper',
    abstract:
      '<p><span style="font-family: Calibri, Candara, Segoe, Optima, sans-serif; font-size: 16px;">With advancements in computing, processing power and distributed networks, systems engineering organizations have been exploring and adopting model based systems engineering (MBSE) practices at an increasing rate over the past decade. As the systems engineering community strives to standardize MBSE approaches and tools, research has broadened beyond well explored MBSE approaches, such as system architecting, and has begun to study areas of systems engineering that have not been viewed through the lens of MBSE. One particular phase of the system development lifecycle that is underrepresented by MBSE methods processes and tools is Concept Engineering (CE). This paper examines the topics of MBSE and CE, revealing a gap between the two. Efforts of previous research to fill this gap are visited, and a proposed approach using virtual immersive environments is briefly described. As this approach and its accompanying tool have advanced from research to proof of concept prototyping and software development, a structured blueprint is required for validating the effectiveness of this research with the user community. Experimental design for determining effectiveness is discussed, and a series of measurements and metrics are proposed for evaluation of the application of MBSE to CE.</span><br></p>',
    file_s3:
      'https://sercproddata.s3.us-east-2.amazonaws.com/publication_documents/reports/1534783148-65_Evaluating-the-Application-of-MBSE-to-Concept-Enginering_Journal-Article.pdf',
    image_s3:
      'https://sercproddata.s3.us-east-2.amazonaws.com/publication_documents/images/1534779659-65_Evaluating-the-Application-of-MBSE-to-Concept-Enginering_Journal-Article.pdf',
    publication_date: '11/13/2013',
    authors: ['Dr Robert Cloutier', 'Peter Korfiatis']
  });
}

createAnotherfile();
