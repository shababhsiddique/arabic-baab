/*var verbsGoogleSheetCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=0&single=true&output=csv';

//baab الاِفْعَالِ
//verbsGoogleSheetCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=802300851&single=true&output=csv';

//baab اَلْمُفَاعَلَةُ
verbsGoogleSheetCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=1743383916&single=true&output=csv'
*/
const csvLinks = {
    1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=0&single=true&output=csv', // 3Letter
    2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=802300851&single=true&output=csv', // Ifal
    3: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=1743383916&single=true&output=csv', // Mufala
    4: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJoUk2VttAgxByuYVMPDNPc1I8YdpgEYOqql3xqFeJ7RxI1pLkaNrkc2pAi721c1a7bnNIxyfl56g2/pub?gid=728929932&single=true&output=csv' // All combined
};

let verbsGoogleSheetCSV = csvLinks[1]; // Default to 3Letter link

// Function to toggle CSV based on selected radio button
function toggleBaabFilter(option) {
    if (csvLinks[option]) {
        verbsGoogleSheetCSV = csvLinks[option];
        console.log(`CSV link updated to: ${verbsGoogleSheetCSV}`);
        // Reload CSV with the new link
        loadCSV();
    }
}

let questionShowing = false;
let data = [];  // Holds the CSV data
let availableQuestions = [];  // Holds the indexes of unshown rows
let currentQuestionIndex = null;  // Index of the current question

// Retrieve `difficult_words` from cookie
let difficultWords = getCookie('difficult_words') || [];
let mode = 'all';

function isDifficultOnlyMode() {
    const checkbox = document.getElementById('difficultOnlyCheckbox');
    return checkbox && checkbox.checked;
}

// Fetch CSV data from 'verbs.csv' file
function loadCSV(source) {
    mode = source;
    // Disable buttons while loading
    document.getElementById("mainButton").disabled = true;
    document.getElementById("askAgainButton").disabled = true;

    if(mode === 'diff' && difficultWords.length > 0){
        data = difficultWords;
        availableQuestions = data.map((_, index) => index); // Populate indexes
        document.getElementById("currentWordPool").textContent = availableQuestions.length;

        // Enable buttons
        document.getElementById("mainButton").disabled = false;
        document.getElementById("askAgainButton").disabled = false;
        askQuestion();

        console.log("Using difficult words as data source.");
    } else {
        console.log("Using sheet"+verbsGoogleSheetCSV);
        fetch(verbsGoogleSheetCSV)
            .then(response => response.text())
            .then(csvData => {
                Papa.parse(csvData, {
                    complete: function(results) {
                        data = results.data.slice(1); // Skip the first row (header)
                        availableQuestions = data.map((_, index) => index); // Populate indexes for all remaining rows

                        // Update the word pool count
                        document.getElementById("currentWordPool").textContent = availableQuestions.length;

                        // Enable buttons once CSV is loaded
                        document.getElementById("mainButton").disabled = false;
                        document.getElementById("askAgainButton").disabled = false;
                        askQuestion();
                    },
                    header: false
                });
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                alert("Failed to load the CSV file. Please try again later.");
            });
    }

}


function generateRandomCard(){
    if(questionShowing !== true){
        askQuestion();
    }else{
        showAnswer();
    }
}

// Trigger question generation
function askQuestion() {
    if (data.length === 0) {
        alert("CSV data not loaded yet.");
        return;
    }

    if (availableQuestions.length === 0) {
        alert("Congratulation you reached the end.");
        return;
    }

    document.getElementById("currentWordPool").textContent = availableQuestions.length;

    // Select a random row from the remaining unshown rows
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestionIndex = availableQuestions[randomIndex];

    console.log("Current index "+currentQuestionIndex);

    document.getElementById("answerMaadi").textContent = " ";
    document.getElementById("answerMudari").textContent = " ";
    document.getElementById("answerMasdar").textContent = " ";
    document.getElementById("answerMeaning").textContent = " ";
    document.getElementById("answerBaab").textContent = " ";

    // Randomly decide whether to ask from Maadi or Meaning
    //const questionType = Math.random() < 0.6 ? "Maadi" : "Meaning";
    var questionRandomIndex = Math.floor(Math.random() * 4);
    if(questionRandomIndex === 2){
        questionRandomIndex = 0;
    }
    const question = data[currentQuestionIndex];

    document.getElementById("questionSpan").textContent = question[questionRandomIndex]; // Show Maadi as the question

    // Remove the current question from availableQuestions to prevent it from being shown again
    availableQuestions.splice(randomIndex, 1);

    questionShowing = true;
    document.getElementById("mainButton").textContent = "Show Answer";
    document.getElementById("askAgainButton").textContent = "Ask Later";
}


// Display answer
function showAnswer() {
    if (currentQuestionIndex === null) {
        alert("No question selected. Please ask a random question first.");
        return;
    }

    document.getElementById("currentWordPool").textContent = availableQuestions.length;

    const question = data[currentQuestionIndex];
    document.getElementById("answerMaadi").textContent = question[0];
    document.getElementById("answerMudari").textContent = question[1];
    document.getElementById("answerMasdar").textContent = question[2];
    document.getElementById("answerMeaning").textContent = question[3];
    document.getElementById("answerBaab").textContent = question[4];

    questionShowing = false;
    document.getElementById("mainButton").textContent = "Correct";
    document.getElementById("askAgainButton").textContent = "Incorrect";
}

// Re-add the current question to the pool of available questions
function askAgain() {
    if (currentQuestionIndex === null) {
        alert("No question selected. Please ask a random question first.");
        return;
    }

    // Add the current question back to the pool
    availableQuestions.push(currentQuestionIndex);
    //also add to difficult words
    addToDifficultWords();
    alert("This question has been added back to the pool and added to your difficult words list..");
    askQuestion();
}

function removeFromDifficult(){
    const difficultWords = getCookie('difficult_words');
    const wordIndex = difficultWords.findIndex(
        word => word[0] === data[currentQuestionIndex][0]
    );

    if (wordIndex > -1) {
        // Remove the word and update the cookie
        difficultWords.splice(wordIndex, 1);
        document.cookie = `difficult_words=${JSON.stringify(difficultWords)}; path=/;`;

        alert(`Removed "${data[currentQuestionIndex][0]}" from difficult words.`);
    }
}


// Function to set a cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
}

// Function to get a cookie
function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
            return JSON.parse(cookie.substring(name.length + 1));
        }
    }
    return null;
}

// Add the current word to the difficult words list
function addToDifficultWords() {
    //do not need to add this if we are already in difficult words mode
    if(mode === "diff"){
        return;
    }
    if (currentQuestionIndex === null) {
        alert("No question selected. Please ask a random question first.");
        return;
    }

    const question = data[currentQuestionIndex];
    difficultWords.push(question);
    setCookie('difficult_words', difficultWords, 30); // Save to cookie for 30 days

    //enable checkbox if some at least 1 word added
    if(difficultWords.length > 0){
        document.getElementById('difficultOnlyCheckbox').disabled = false;
    }
}

// Function to display the difficult words list (Optional)
function showDifficultWords() {
    if (difficultWords.length === 0) {
        alert("Your difficult words list is empty.");
        return;
    }

    console.log("Difficult Words List:");
    console.table(difficultWords);
}



// Refresh the page
function refreshPage() {
    location.reload(); // Reload the page to reset everything
}

function toggleDifficultOnly() {
    document.getElementById("mainButton").disabled = true;
    document.getElementById("askAgainButton").disabled = true;
    const checkbox = document.getElementById('difficultOnlyCheckbox');
    if (checkbox.checked) {
        document.getElementById('removeWordButton').style.display = 'inline';
        loadCSV('diff');
    } else {
        document.getElementById('removeWordButton').style.display = 'none';
        loadCSV();
    }
}
function downloadDifficultWords() {
    const rawCookieValue = getCookie('difficult_words');

    // If the cookie value is already an array, use it directly
    if (!rawCookieValue || !Array.isArray(rawCookieValue)) {
        alert('No valid difficult words to download.');
        return;
    }

    // Convert the array into a CSV format
    const csvContent = 'data:text/csv;charset=utf-8,' +
        ['Fi\'l (Verb),Mudari,Masdar,Meaning (in Bengali),Baab']
            .concat(rawCookieValue.map(row => row.join(',')))
            .join('\n');

    // Create a downloadable link for the CSV content
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'difficult_words.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearIncorrectWords() {
    // Get all cookies
    const cookies = document.cookie.split(";");

    // Look for 'difficult_words' specifically
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith("difficult_words=")) {
            // Clear the 'difficult_words' cookie
            document.cookie = "difficult_words=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            alert("The 'difficult_words' list has been cleared.");

            document.getElementById('difficultOnlyCheckbox').checked = false;
            document.getElementById('difficultOnlyCheckbox').disabled = true;
            loadCSV();
            return;
        }
    }

    // If no cookie found
    alert("'difficult_words' cookie not found.");

}







// Handle spacebar for the main button
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent scrolling when space is pressed
        document.getElementById("mainButton").click(); // Trigger the main button
    }
    if (event.code === 'ArrowLeft') {
        event.preventDefault(); // Prevent scrolling when space is pressed
        document.getElementById("askAgainButton").click(); // Trigger the main button
    }
});

// Function to open the modal
function openModal() {
    document.getElementById("myModal").style.display = "block";
}

// Function to close the modal
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

// Open modal on button click
document.getElementById("openModalButton").onclick = function() {
    openModal();
}

// Close modal when clicking outside the content
window.onclick = function(event) {
    const modal = document.getElementById("myModal");
    if (event.target === modal) {
        closeModal();
    }
}