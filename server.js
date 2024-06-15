const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { parse } = require('json2csv');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/save-score', (req, res) => {
    const { row_id, candidate_1, candidate_2, selection, reason } = req.body;
    const filePath = path.join(__dirname, 'scores.csv');

    const newEntry = {
        row_id,
        candidate_1,
        candidate_2,
        selection,
        reason: reason || 'No reason provided'
    };

    const csvFields = ['row_id', 'candidate_1', 'candidate_2', 'selection', 'reason'];
    const csv = parse([newEntry], { header: false });

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, write the header first
            const csvHeader = parse([], { fields: csvFields, header: true });
            fs.writeFile(filePath, csvHeader + '\n' + csv + '\n', 'utf8', (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error writing file' });
                }

                res.status(200).json({ message: 'Score saved successfully' });
            });
        } else {
            // File exists, append the new entry
            fs.appendFile(filePath, csv + '\n', 'utf8', (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error writing file' });
                }

                res.status(200).json({ message: 'Score saved successfully' });
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});