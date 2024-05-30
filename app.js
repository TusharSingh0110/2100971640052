const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let storedNumbers = [];

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to handle requests
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    try {
        const response = await fetchNumbers(numberid);
        const newNumbers = response.data.numbers;

        // Filter out duplicates and limit to window size
        storedNumbers = [...new Set([...storedNumbers, ...newNumbers])].slice(-WINDOW_SIZE);

        let avg = null;
        if (storedNumbers.length === WINDOW_SIZE) {
            avg = calculateAverage(storedNumbers);
        }

        const prevState = storedNumbers.slice(0, -newNumbers.length);
        const currState = storedNumbers;

        const responseData = {
            windowPrevState: prevState,
            windowCurrState: currState,
            avg: avg !== null ? avg.toFixed(2) : null
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Function to fetch numbers from the third-party server
async function fetchNumbers(numberid) {
    const apiUrl = `http://20.244.56.144/test/${numberid}`;
    const response = await axios.get(apiUrl, { timeout: 500 });
    return response.data;
}

// Function to calculate average
function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
