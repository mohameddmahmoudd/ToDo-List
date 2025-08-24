import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..')));

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION;

if(!uri)
{
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
}

let client ;

client = new MongoClient(uri, {
    serverApi: 
    {version:ServerApiVersion.v1,
    strict:true,
    deprecationErrors: true
    }
});

let collection;

async function connectToDatabase() {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection(collectionName);
}

function validateTodoPayload(body) {
    const errors = [];
    // Check if body is an object
    if (!body || typeof body !== 'object') {
        errors.push('Payload must be a JSON object.');
        return errors;
    }
    // Check title
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
        errors.push('"title" is required and must be a non-empty string.');
    }
    // Check completed (optional, but must be boolean if present)
    if ('completed' in body && typeof body.completed !== 'boolean') {
        errors.push('"completed" must be a boolean if provided.');
    }
    return errors;
}

// Log incoming API requests and responses
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        // Log request body for POST/PUT
        if (req.method === 'POST' || req.method === 'PUT') {
            console.log('Request Body:', req.body);
        }
        // Log response status after response is sent
        res.on('finish', () => {
            console.log(`Response Status: ${res.statusCode}`);
        });
    }
    next();
});

app.get('/api/todos', async (req, res) => {

  try{

    const todos = await collection.find({}).toArray();
    res.json(todos);
  }
  catch(e)
  {
    console.log(e);
    res.json({error:"Failed to fetch Todos"});
  }
});

app.post('/api/todos', async (req, res) =>{
try
{
    const errors = validateTodoPayload(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const result = await collection.insertOne(req.body);
    const createdTodo = { id: result.insertedId, ...req.body };
    res.status(201).json(createdTodo);
}
catch(e)
{
  console.log(e);
  res.json({error:"Failed to create Todo"});
}

});

app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        return res.status(204).send();
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Failed to update Todo' });
    }
});

connectToDatabase().then(() => {
  app.listen(3000, ()=> console.log('Server is running on http://localhost:3000'));
}).catch(e => {
  console.error('Failed to connect to the database:', e);
  process.exit(1);
});
