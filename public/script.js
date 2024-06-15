let allData = [];
let currentData = {};
let selectedOptions = {};
let currentId = null;

document.addEventListener("DOMContentLoaded", function() {
    fetchData().then(() => {
        newRound();
    });

    document.getElementById('reason-form').addEventListener('change', function() {
        const reasonInput = document.getElementById('reason-input');
        const submitButton = document.getElementById('submit-reason');
        if (document.querySelector('input[name="reason"]:checked').value === 'Other') {
            reasonInput.disabled = false;
        } else {
            reasonInput.disabled = true;
        }
        submitButton.disabled = false;
    });
});

function fetchData() {
    return fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
}

function newRound() {
    const randomIndex = Math.floor(Math.random() * allData.length);
    currentData = allData[randomIndex];
    currentId = randomIndex; // Store the current row ID

    document.getElementById("prompt-content").innerText = currentData.prompt;
    const options = ['sampling_wm_text', 'no_wm_text', 'kirchenbauer_wm_text'];
    const selected = [];
    while (selected.length < 2) {
        const option = options[Math.floor(Math.random() * options.length)];
        if (!selected.includes(option)) {
            selected.push(option);
        }
    }
    selectedOptions.A = selected[0];
    selectedOptions.B = selected[1];
    document.getElementById("modelA-content").innerText = currentData[selectedOptions.A];
    document.getElementById("modelB-content").innerText = currentData[selectedOptions.B];
    document.getElementById("buttonA").disabled = false;
    document.getElementById("buttonB").disabled = false;
    document.getElementById("reason-input").value = '';
    document.getElementById("reason-input").disabled = true;
    document.getElementById("submit-reason").disabled = true;
    document.getElementById("no-preference").disabled = false;

    document.querySelectorAll('input[name="reason"]').forEach(radio => radio.checked = false);
}

function selectOption(choice) {
    const selectedType = selectedOptions[choice] || 'No Preference';
    const loseType = choice === 'A' ? selectedOptions.B : selectedOptions.A;

    document.getElementById("buttonA").disabled = true;
    document.getElementById("buttonB").disabled = true;
    document.getElementById("no-preference").disabled = true;
    document.getElementById("submit-reason").setAttribute("data-selected-type", selectedType);
    document.getElementById("submit-reason").setAttribute("data-lose-type", loseType);

    if (selectedType === 'No Preference') {
        sendScore(currentId, selectedOptions.A, selectedOptions.B, 'No Preference', 'No Preference');
        document.getElementById("submit-reason").disabled = true;
    } else {
        document.getElementById("submit-reason").disabled = false;
    }
}

function submitReason() {
    const selectedOption = document.getElementById("submit-reason").getAttribute("data-selected-type");
    const loseOption = document.getElementById("submit-reason").getAttribute("data-lose-type");

    if (selectedOption === 'No Preference') {
        document.getElementById("submit-reason").disabled = true;
        return;
    }

    const selectedReasonRadio = document.querySelector('input[name="reason"]:checked');
    let reason = '';

    if (selectedReasonRadio) {
        reason = selectedReasonRadio.value;
        if (reason === 'Other') {
            reason = document.getElementById('reason-input').value;
        }
    }

    if (!reason.trim()) {
        alert("Please provide a reason for your choice.");
        return;
    }

    const candidate_1 = selectedOptions.A;
    const candidate_2 = selectedOptions.B;
    const selection = selectedOption;

    sendScore(currentId, candidate_1, candidate_2, selection, reason);
    document.getElementById("submit-reason").disabled = true;
}

function sendScore(row_id, candidate_1, candidate_2, selection, reason) {
    fetch('/save-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ row_id, candidate_1, candidate_2, selection, reason })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score sent successfully:', data);
    })
    .catch(error => console.error('Error sending score:', error));
}