// I have never made a website before, sorry. This was mostly Claude.

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const stories = data.stories;
    const questions = data.questions;
    let currentQuestionIndex = 0;
    let responses = [];
    let selectedOptions = [];

    // Function to render the current question
    function renderQuestion() {
      const question = questions[currentQuestionIndex];
      const questionContainer = document.getElementById('question');
      const optionsContainer = document.getElementById('options');
      const importanceContainer = document.getElementById('importance');

      questionContainer.innerHTML = `<h2>${question.questiontext}</h2>`;
      optionsContainer.innerHTML = '';

      question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
      });

      importanceContainer.innerHTML = '';
      const importanceLabel = document.createElement('div');
      importanceLabel.classList.add('importance-label');
      importanceLabel.textContent = 'how much does this matter to you?';
      importanceContainer.appendChild(importanceLabel);
      

      const importanceOptions = ['not at all', 'somewhat', 'a lot'];
      importanceOptions.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('importance-option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectImportance(index + 1));
        importanceContainer.appendChild(optionElement);
      });
      

      highlightSelectedOptions();
    }

    // Function to handle option selection
    function selectOption(optionIndex) {
      selectedOptions[currentQuestionIndex] = optionIndex;
      if (currentQuestionIndex < questions.length - 1) {
        responses[currentQuestionIndex] = { answer: questions[currentQuestionIndex].optioncodes[optionIndex] };
      } else {
        responses[currentQuestionIndex] = { answer: questions[currentQuestionIndex].options[optionIndex] };
      }
        highlightSelectedOptions();
    }

    // Function to handle importance selection
    function selectImportance(importanceIndex) {
      responses[currentQuestionIndex].importance = importanceIndex;
      highlightSelectedOptions();
    }

// Function to highlight selected options
function highlightSelectedOptions() {
  const optionElements = document.querySelectorAll('.option');
  const importanceElements = document.querySelectorAll('.importance-option');

  optionElements.forEach((element, index) => {
    if (index === selectedOptions[currentQuestionIndex]) {
      element.classList.add('selected');
    } else {
      element.classList.remove('selected');
    }
  });

  // Check if the importance property is set
  if (responses[currentQuestionIndex] && responses[currentQuestionIndex].importance) {
    importanceElements.forEach((element, index) => {
      if (index + 1 === responses[currentQuestionIndex].importance) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  } else {
    // If the importance property is not set, highlight the "somewhat" option
    importanceElements.forEach((element, index) => {
      if (index === 1) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  }
}

    // Function to move to the next question
    function nextQuestion() {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
      } else {
        calculateRecommendation();
      }
    }


    // Function to calculate the recommended story
    function calculateRecommendation() {
      let bestStoryIndex = 0;
      let secondBestStoryIndex = 0;
      let thirdBestStoryIndex = 0;
      let bestScore = Number.NEGATIVE_INFINITY;
      let secondBestScore = Number.NEGATIVE_INFINITY;
      let thirdBestScore = Number.NEGATIVE_INFINITY;
      
      stories.forEach((story, index) => {
        let score = 0;
        console.log(story.name);
        responses.forEach((response, questionIndex) => {
          let importanceValue = response.importance;
          if (typeof(response.importance) === "undefined") {
            importanceValue = 1;
          }
          const importance = importanceValue === 3 ? 2 : importanceValue === 2 ? 1 : 0.01;
          if (questionIndex < questions.length - 1) {
            const storyScore = story[questions[questionIndex].question];
            const userScore = response.answer;
            score += -importance * Math.abs(storyScore - userScore);
            let logString = questions[questionIndex].question
            logString = logString + `: story: ${storyScore}, response: ${userScore}, importance ${importanceValue}`
            console.log(logString)
            console.log(-importance * Math.abs(storyScore - userScore))
          } else {
            // fandom question
            const storyFandoms = story[questions[questionIndex].question]
            const userFandom = response.answer;
            
            if (typeof(storyFandoms) === "string") {
              console.log(`fandoms: story: ${storyFandoms}, response: ${userFandom}, importance ${importanceValue}`);
              const value = storyFandoms.includes(userFandom) ? 1 : 0;
              score += importance * value
            }
            console.log(score)
          }
        });

        if (score > bestScore) {
          thirdBestScore = secondBestScore;
          thirdBestStoryIndex = secondBestStoryIndex;
          secondBestScore = bestScore;
          secondBestStoryIndex = bestStoryIndex;
          bestScore = score;
          bestStoryIndex = index;
        } else if ((score > secondBestScore) || (index < 2)) {
          thirdBestScore = secondBestScore;
          thirdBestStoryIndex = secondBestStoryIndex;
          secondBestScore = score;
          secondBestStoryIndex = index;
        } else if ((score > thirdBestScore) || (index < 3)) {
          thirdBestScore = score;
          thirdBestStoryIndex = index;
        }
      });

      const topRec = stories[bestStoryIndex];
      const secondRec = stories[secondBestStoryIndex];
      const thirdRec = stories[thirdBestStoryIndex];
      const resultContainer = document.getElementById('result');

      const questionContainer = document.getElementById('question');
      const optionsContainer = document.getElementById('options');
      const importanceContainer = document.getElementById('importance');

      // Clear the last question and its options
      questionContainer.innerHTML = '';
      optionsContainer.innerHTML = '';
      importanceContainer.innerHTML = '';
     
      const nextButton = document.getElementById('next');
      nextButton.innerHTML = '<h1>results</h1>';

      function linkString(linkList, linkText) {
        let str = ``
        linkList.forEach((link, index) => {
          if (link.length < 1) {
            return "not found";
          }
          let number = ""
          if (linkList.length > 1) {
            number = ` ${index + 1}`
          }
          str = str + `<a href="${link}" target="_blank">${linkText}${number}</a>`;
          if (index < linkList.length - 1) {
            str = str + `, `;
          }
        })

        return str;
      }

      resultContainer.innerHTML = `
        <h2>(1) - ${topRec.name}</h2>
        <p>${topRec.comments}</p>
        <p>${linkString(topRec.link, "Link")}</p>
        <p>${linkString(topRec.wiki, "Wiki")}</p>
        <p>  </p>
        <p> - </p>
        <p> </p>
        <h3>(2) - ${secondRec.name}</h3>
        <p>${secondRec.comments}</p>
        <p>${linkString(secondRec.link, "Link")}</p>
        <p>${linkString(secondRec.wiki, "Wiki")}</p>
        <p>  </p>
        <p> - </p>
        <p> </p>
        <h3>(3) - ${thirdRec.name}</h3>
        <p>${thirdRec.comments}</p>
        <p>${linkString(thirdRec.link, "Link")}</p>
        <p>${linkString(thirdRec.wiki, "Wiki")}</p>
      `;
    }

    // Initialize the quiz
    renderQuestion();

    // Add event listener for the Next button
    const nextButton = document.getElementById('next');
    nextButton.addEventListener('click', nextQuestion);
//     if (nextButton) {
//       // nextButton.addEventListener('click', function(event) {
//       //   event.preventDefault(); // Prevent the default button behavior
//       //   event.stopImmediatePropagation(); // Stop the event propagation
//       //   nextQuestion(); // Call the nextQuestion function
//       // });
// }
  })
  .catch(error => console.error('Error loading data:', error));



/* // Load the quiz data from data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const stories = data.stories;
    const questions = data.questions;
    let currentQuestionIndex = 0;
    let responses = [];

    // Function to render the current question
    function renderQuestion() {
      const question = questions[currentQuestionIndex];
      const questionContainer = document.getElementById('question');
      const optionsContainer = document.getElementById('options');
      const importanceContainer = document.getElementById('importance');

      questionContainer.innerHTML = `<h2>${question.questiontext}</h2>`;
      optionsContainer.innerHTML = '';
      importanceContainer.innerHTML = '';

      question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(question.optioncodes[index]));
        optionsContainer.appendChild(optionElement);
      });

      const importanceOptions = ['Not at all', 'A little', 'A lot'];
      importanceOptions.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('importance-option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectImportance(index + 1));
        importanceContainer.appendChild(optionElement);
      });
    }

    // Function to handle option selection
    function selectOption(optionIndex) {
      responses[currentQuestionIndex] = { answer: optionIndex };
    }

    // Function to handle importance selection
    function selectImportance(importanceIndex) {
      responses[currentQuestionIndex].importance = importanceIndex;
    }

    // Function to move to the next question
    function nextQuestion() {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
      } else {
        calculateRecommendation();
      }
    }

    // Function to calculate the recommended story
    function calculateRecommendation() {
      let bestStoryIndex = 0;
      let bestScore = Number.NEGATIVE_INFINITY;

      stories.forEach((story, index) => {
        let score = 0;
        responses.forEach((response, questionIndex) => {
          const storyScore = story[questions[questionIndex].question];
          const userScore = response.answer;
          const importance = response.importance === 3 ? 2 : response.importance === 2 ? 1 : 0.01;
          score += -importance * Math.abs(storyScore - userScore);
        });

        if (score > bestScore) {
          bestScore = score;
          bestStoryIndex = index;
        }
      });

      const recommendedStory = stories[bestStoryIndex];
      const resultContainer = document.getElementById('result');
      resultContainer.innerHTML = `
        <h2>Recommended Story: ${recommendedStory.name}</h2>
        <p>${recommendedStory.comments}</p>
        <p>Link: <a href="${recommendedStory.link}" target="_blank">${recommendedStory.link}</a></p>
        <p>Wiki: <a href="${recommendedStory.wiki}" target="_blank">${recommendedStory.wiki}</a></p>
      `;
    }

    // Initialize the quiz
    renderQuestion();

    // Add event listener for the Next button
    const nextButton = document.getElementById('next');
    nextButton.addEventListener('click', nextQuestion);
  })
  .catch(error => console.error('Error loading data:', error)); */
