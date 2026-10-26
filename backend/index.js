import { express } from './express.js';
import "dotenv/config";
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
