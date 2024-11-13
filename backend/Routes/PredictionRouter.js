
const express = require('express');
const ensureAuthenticated = require('../Middlewares/Auth');
const router = express.Router();
const { spawn } = require('child_process');




// router.get('/', ensureAuthenticated, (req,res)=> {

//     res.status(200).json([
//         {
//             name:"mobile",
//             price: 10000
//         },
//         {
//             name: "tv",
//             price: 20000
//         }
//     ])

// });




router.get('/locations', (req, res) => {
    const pythonProcess = spawn('python', ['./python/get_locations.py']);

    pythonProcess.stdout.on('data', (data) => {
        const locations = JSON.parse(data.toString());
        res.json(locations);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
        res.status(500).json({ message: 'Error fetching locations' });
    });
});

router.post('/', (req, res) => {
    const { location, bhk, area } = req.body;

    // Ensure inputs are provided
    if (!location || !bhk || !area) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Spawn the Python process
    const pythonProcess = spawn('python', ['./python/predict.py', location, bhk, area]);

    // Collect data from the Python script
    pythonProcess.stdout.on('data', (data) => {
        const prediction = data.toString().trim();
        res.json({ price: prediction });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
        res.status(500).json({ message: 'Error processing request' });
    });
});



module.exports = router;