const ActivityTypes = Object.freeze({
  MULTIPLE_CHOICE: "activity_multiple_choice",
  FILL_IN_THE_BLANK: "activity_fill_in_the_blank",
  SORTING: "activity_sorting",
  OPEN_ENDED_ANSWER: "activity_open_ended_answer",
  MATCHING: "activity_matching",
});

function prepareActivity() {
  // Select all sections with role="activity"
  const activitySections = document.querySelectorAll(
    'section[role="activity"]'
  );

  // Select the submit button
  const submitButton = document.getElementById("submit-button");

  if (activitySections.length === 0) {
    submitButton.style.display = "none";
  } else {
    activitySections.forEach((section) => {
      const activityType = section.dataset.sectionType;

      switch (activityType) {
        case ActivityTypes.MULTIPLE_CHOICE:
          prepareMultipleChoiceActivity(section);
          submitButton.addEventListener("click", () =>
            validateInputs(ActivityTypes.MULTIPLE_CHOICE)
          );
          break;
        case ActivityTypes.FILL_IN_THE_BLANK:
          submitButton.addEventListener("click", () =>
            validateInputs(ActivityTypes.FILL_IN_THE_BLANK)
          );
          break;
        case ActivityTypes.OPEN_ENDED_ANSWER:
          submitButton.addEventListener("click", () =>
            validateInputs(ActivityTypes.OPEN_ENDED_ANSWER)
          );
          break;
        case ActivityTypes.SORTING:
          prepareSortingActivity(section);
          submitButton.addEventListener("click", () =>
            validateInputs(ActivityTypes.SORTING)
          );
          break;
        case ActivityTypes.MATCHING:
          prepareMatchingActivity(section);
          submitButton.addEventListener("click", () =>
            validateInputs(ActivityTypes.MATCHING)
          );
          break;
        default:
          console.error("Unknown activity type:", activityType);
      }
    });
  }
}

function prepareMultipleChoiceActivity(section) {
  const buttons = section.querySelectorAll("button");
  buttons.forEach((button) => {
    button.onclick = function () {
      selectButton(button);
    };
  });

  let selectedPill = null;
}

function selectButton(button) {
  // Hide possible error messages
  // const noSelectionMessage = document.getElementById('no-selection-error-message');
  // const errorMessage = document.getElementById('error-message');
  // noSelectionMessage.classList.add('hidden');
  // errorMessage.classList.add('hidden');
  // Deselect all buttons first
  document.querySelectorAll(".grid button").forEach((btn) => {
    btn.classList.remove("bg-blue-500", "text-white");
    btn.classList.add("bg-gray-200");
    btn.classList.add("hover:bg-gray-300");
  });

  // Select the clicked button
  button.classList.remove("bg-gray-200");
  button.classList.remove("hover:bg-gray-300");
  button.classList.add("bg-blue-500", "text-white");
  // Set the selected button
  selectedPill = button;
}

function validateInputs(activityType) {
  switch (activityType) {
    case ActivityTypes.MULTIPLE_CHOICE:
      checkMultipleChoice();
      break;
    case ActivityTypes.FILL_IN_THE_BLANK:
      checkFillInTheBlank();
      break;
    case ActivityTypes.OPEN_ENDED_ANSWER:
      checkTextInputs();
      break;
    case ActivityTypes.SORTING:
      checkSorting();
      break;
    case ActivityTypes.MATCHING:
      checkMatching();
      break;
    default:
      console.error("Unknown validation type:", activityType);
  }
}

function autofillCorrectAnswers() {
  const inputs = document.querySelectorAll('input[type="text"]');

  inputs.forEach((input) => {
    const dataActivityItem = input.getAttribute("data-activity-item");
    const correctAnswer = correctAnswers[dataActivityItem];

    if (correctAnswer) {
      input.value = correctAnswer;
    }
  });
}

function provideFeedback(element, isCorrect, _correctAnswer, activityType) {
  let feedback = element.parentNode.querySelector(".feedback");
  if (!feedback) {
    feedback = document.createElement("span");
    feedback.classList.add(
      "feedback",
      "ml-2",
      "px-2",
      "py-1",
      "rounded-full",
      "text-sm",
      "w-32",
      "text-center"
    );
    element.parentNode.appendChild(feedback);
  }
  feedback.innerText = "";
  feedback.classList.remove(
    "bg-green-200",
    "text-green-700",
    "bg-red-200",
    "text-red-700"
  );

  if (isCorrect) {
    if (activityType === ActivityTypes.OPEN_ENDED_ANSWER) {
      feedback.innerText = "Thank you";
    } else {
      feedback.innerText = "Well done!";
    }
    feedback.classList.add("bg-green-200", "text-green-700");
  } else {
    feedback.innerText = "Try Again";
    feedback.classList.add("bg-red-200", "text-red-700");
  }
}

function checkMultipleChoice() {
  const noSelectionMessage = document.getElementById(
    "no-selection-error-message"
  );

  if (!selectedPill) {
    noSelectionMessage.classList.remove("hidden");
    return;
  }

  const dataActivityItem = selectedPill.getAttribute("data-activity-item");
  const isCorrect = correctAnswers[dataActivityItem];
  console.log(isCorrect); // Debugging purposes

  provideFeedback(selectedPill, isCorrect, correctAnswers[dataActivityItem]);

  if (isCorrect) {
    selectedPill.classList.add("bg-green-600");
  } else {
    selectedPill.classList.add("bg-red-200");
    selectedPill.classList.add("text-black");
  }

  updateSubmitButtonAndToast(
    isCorrect,
    "Next Activity",
    ActivityTypes.MULTIPLE_CHOICE
  );
}

function checkFillInTheBlank() {
  const inputs = document.querySelectorAll('input[type="text"]');
  let allCorrect = true;

  inputs.forEach((input) => {
    const dataActivityItem = input.getAttribute("data-activity-item"); // Assuming each input has a data-activity-item attribute
    const correctAnswer = correctAnswers[dataActivityItem]; // Get the correct answer based on the data-activity-item
    const isCorrect =
      correctAnswer &&
      correctAnswer.toLowerCase() === input.value.trim().toLowerCase(); // Compare the input value with the correct answer

    provideFeedback(
      input,
      isCorrect,
      correctAnswer,
      ActivityTypes.FILL_IN_THE_BLANK
    );

    if (!isCorrect) {
      allCorrect = false;
    }
  });

  updateSubmitButtonAndToast(
    allCorrect,
    "Next Activity",
    ActivityTypes.FILL_IN_THE_BLANK
  );
}

function checkTextInputs() {
  const textInputs = document.querySelectorAll('input[type="text"], textarea');
  let allFilled = true;

  textInputs.forEach((input) => {
    const isCorrect = input.value.trim() !== "";

    provideFeedback(input, isCorrect, "");

    if (!isCorrect) {
      allFilled = false;
    }
  });

  updateSubmitButtonAndToast(
    allFilled,
    "Next Activity",
    ActivityTypes.OPEN_ENDED_ANSWER
  );
}

function updateSubmitButtonAndToast(
  isCorrect,
  buttonText = "Next Activity",
  activityType
) {
  const submitButton = document.getElementById("submit-button");
  const toast = document.getElementById("toast");

  if (isCorrect) {
    submitButton.textContent = buttonText;
    toast.classList.remove("hidden");
    toast.classList.remove("bg-red-200", "text-red-700");
    toast.classList.add("bg-green-200", "text-green-700");

    if (activityType === ActivityTypes.OPEN_ENDED_ANSWER) {
      toast.textContent = "Your answers have been submitted!";
    } else {
      toast.textContent = "Well done!";
    }

    if (buttonText === "Next Activity") {
      submitButton.removeEventListener("click", validateInputs); // Remove the current click handler
      submitButton.addEventListener("click", nextPage); // Add the new click handler
    }

    // Hide the Toast after 3 seconds
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  } else {
    if (activityType === ActivityTypes.OPEN_ENDED_ANSWER) {
      toast.textContent = "Please complete all fields";
      toast.classList.remove("hidden");
      toast.classList.add("bg-red-200", "text-red-700");
    }
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }
}

// SORTING ACTIVITY
function prepareSortingActivity(section) {
  const wordCards = document.querySelectorAll(".word-card");
  wordCards.forEach((wordCard) => {
    wordCard.addEventListener("click", () => selectWordSort(wordCard));
    wordCard.addEventListener("dragstart", dragSort);
    wordCard.addEventListener("mousedown", () => highlightBoxes(true));
    wordCard.addEventListener("mouseup", () => highlightBoxes(false));
    wordCard.classList.add(
      "cursor-pointer",
      "transition",
      "duration-300",
      "hover:bg-yellow-300",
      "transform",
      "hover:scale-105"
    );
  });

  const categories = document.querySelectorAll(".category");
  categories.forEach((category) => {
    category.addEventListener("dragover", allowDrop);
    category.addEventListener("drop", dropSort);
    category.addEventListener("click", () => placeWord(category.id));
  });

  document.getElementById("feedback").addEventListener("click", resetActivity);
}

function highlightBoxes(state) {
  const categories = document.querySelectorAll(".category");
  categories.forEach((category) => {
    if (state) {
      category.classList.add("bg-blue-100");

      category.classList.add("border-blue-400");
    } else {
      category.classList.remove("bg-blue-100");
      category.classList.remove("border-blue-400");
    }
  });
}

function selectWordSort(wordCard) {
  if (wordCard.classList.contains("bg-gray-300")) return;

  document
    .querySelectorAll(".word-card")
    .forEach((card) => card.classList.remove("border-blue-700"));
  wordCard.classList.add("border-blue-700", "border-2", "box-border");

  currentWord = wordCard.textContent;

  highlightBoxes(true);
}

function placeWord(category) {
  if (!currentWord) {
    console.log("No word selected.");
    return;
  }

  // Correct query to target the div with the exact data-activity-category value
  const categoryDiv = document.querySelector(
    `div[data-activity-category="${category}"]`
  );
  const listElement = categoryDiv
    ? categoryDiv.querySelector(".word-list")
    : null;

  if (!listElement) {
    console.error(
      `Category "${category}" not found or no word list available.`
    );
    return;
  }

  const listItem = document.createElement("li");
  listItem.textContent = currentWord;
  listItem.className = "bg-gray-200 p-2 m-1 rounded word-card";
  listItem.setAttribute("data-activity-category", category);
  listItem.addEventListener("click", () => removeWord(listItem));
  listElement.appendChild(listItem);

  // Find the word card and apply styles
  const wordCard = Array.from(document.querySelectorAll(".word-card")).find(
    (card) => card.textContent === currentWord
  );
  if (wordCard) {
    wordCard.classList.add(
      "bg-gray-300",
      "cursor-not-allowed",
      "text-gray-400",
      "hover:bg-gray-300",
      "hover:scale-100"
    );
    wordCard.style.border = "none";
    wordCard.classList.remove("selected", "shadow-lg");
  }

  currentWord = "";
  highlightBoxes(false);
}

//Commented out code for being able to remove a word from a box
function removeWord(listItem) {
  const wordCard = Array.from(document.querySelectorAll(".word-card")).find(
    (card) => card.textContent === listItem.textContent
  );
  if (wordCard) {
    wordCard.classList.remove(
      "bg-gray-300",
      "cursor-not-allowed",
      "bg-blue-300",
      "text-gray-400",
      "hover:bg-gray-300",
      "hover:scale-100"
    );
    wordCard.classList.add("bg-yellow-200");
  }
  listItem.remove();
}

function checkSorting() {
  const feedbackElement = document.getElementById("feedback");
  let correctCount = 0;
  let incorrectCount = 0;

  // Declare the wordCards array by iterating over all elements with the class 'word-card'
  const wordCards = Array.from(document.querySelectorAll(".word-card"));

  wordCards.forEach((wordCard) => {
    const word = wordCard.textContent.trim();
    const wordKey = wordCard.getAttribute("data-activity-item");
    const correctCategory = correctAnswers[wordKey];
    const listItems = document.querySelectorAll(`li[data-activity-category]`);

    listItems.forEach((item) => {
      if (item.textContent === word) {
        if (
          item.getAttribute("data-activity-category").split("-")[0] ===
          correctCategory
        ) {
          item.classList.add("bg-green-200");
          item.classList.remove("bg-red-200");
          item.innerHTML += ' <i class="fas fa-check"></i>';
          correctCount++;
        } else {
          item.classList.add("bg-red-200");
          item.classList.remove("bg-green-200");
          item.innerHTML += ' <i class="fas fa-times"></i>';
          incorrectCount++;
        }
      }
    });
  });
  const allCorrect = correctCount === wordCards.length;

  feedbackElement.textContent = `You have ${correctCount} correct answers and ${incorrectCount} incorrect answers. Try Again?`;
  feedbackElement.classList.remove("text-red-500", "text-green-500");
  feedbackElement.classList.add(
    correctCount === wordCards.length ? "text-green-500" : "text-red-500"
  );

  // Update the submit button and toast based on whether all answers are correct
  updateSubmitButtonAndToast(
    allCorrect,
    allCorrect ? "Next Activity" : "Retry",
    ActivityTypes.SORTING
  );
}

function resetActivity() {
  currentWord = "";
  document.querySelectorAll("li").forEach((item) => item.remove());
  document.querySelectorAll(".word-card").forEach((card) => {
    card.classList.remove(
      "bg-gray-300",
      "cursor-not-allowed",
      "bg-blue-300",
      "text-gray-400",
      "hover:bg-gray-300",
      "hover:scale-100"
    );
    card.classList.add("bg-yellow-100", "shadow-lg");
  });

  highlightBoxes(false);
  document.getElementById("feedback").textContent = "";
}

function allowDrop(event) {
  event.preventDefault();
}

function dragSort(event) {
  event.dataTransfer.setData("text", event.target.textContent);
  event.target.classList.add("selected");
  highlightBoxes(true);
}

function dropSort(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  currentWord = data;
  const category = event.target.closest(".category").id;
  const categoryName = category;
  placeWord(categoryName);
  highlightBoxes(false);
}

//MATCHING ACTIVITY

function prepareMatchingActivity(section) {
  // Add event listeners to word buttons
  const wordButtons = document.querySelectorAll(".activity-item");
  wordButtons.forEach((button) => {
    button.addEventListener("click", () => selectWord(button));
    button.addEventListener("dragstart", (event) => drag(event));
    button.style.cursor = "pointer"; // Change cursor to hand
  });

  // Add event listeners to dropzones
  const dropzones = document.querySelectorAll(".dropzone");
  dropzones.forEach((dropzone) => {
    dropzone.addEventListener("click", () => dropWord(dropzone.id));
    dropzone.addEventListener("drop", (event) => drop(event));
    dropzone.addEventListener("dragover", (event) => allowDrop(event));
    dropzone.style.cursor = "pointer"; // Change cursor to hand
  });
}

let selectedWord = null;

// Duplicate function is commented
// function allowDrop(event) {
//   event.preventDefault();
// }

function drag(event) {
  event.dataTransfer.setData(
    "text",
    event.target.getAttribute("data-activity-item")
  );
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const target = event.currentTarget.querySelector("div[role='region']");
  const wordElement = document.querySelector(
    `.activity-item[data-activity-item='${data}']`
  );
  const existingWord = target.firstElementChild;

  // Check if the dropzone already has a word and return it to the original list
  if (existingWord) {
    // Move the existing word back to the original word list or swap positions
    const originalParent = wordElement.parentElement;

    // Swap the selected word with the existing word
    originalParent.appendChild(existingWord);
  }

  target.appendChild(wordElement);

  // Reset the selected word highlight
  if (selectedWord) {
    selectedWord.classList.remove("border-4", "border-blue-500");
    selectedWord = null;
  }
}

function selectWord(button) {
  // If a word is already selected, deselect it
  if (selectedWord) {
    selectedWord.classList.remove("border-4", "border-blue-500");
  }

  // Mark the current word as selected
  button.classList.add("border-4", "border-blue-500");
  selectedWord = button;
}

function dropWord(dropzoneId) {
  if (!selectedWord) return;

  const target = document
    .getElementById(dropzoneId)
    .querySelector("div[role='region']");
  const existingWord = target.firstElementChild;

  if (existingWord) {
    // Move the existing word back to the original word list or swap positions
    const originalParent = selectedWord.parentElement;

    // Swap the selected word with the existing word
    originalParent.appendChild(existingWord);
  }

  // Place the selected word in the dropzone
  target.appendChild(selectedWord);

  // Reset the selected word highlight
  selectedWord.classList.remove("border-4", "border-blue-500");
  selectedWord = null;
}

// Adding event listeners to existing words after being added to a dropzone
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("activity-item")) {
    const dropzone = event.target.closest(".dropzone");
    if (dropzone) {
      dropWord(dropzone.id);
    }
  }
});

function checkMatching() {
  let correctCount = 0;

  // Reset all dropzones to default background color
  const dropzones = document.querySelectorAll(".dropzone");
  dropzones.forEach((dropzone) => {
    dropzone.classList.remove("bg-green-200", "bg-red-200");
  });

  // Loop through each item in the correctAnswers object
  Object.keys(correctAnswers).forEach((item) => {
    // Find the element with the corresponding data-activity-item
    const wordElement = document.querySelector(
      `.activity-item[data-activity-item='${item}']`
    );

    if (wordElement) {
      // Find the dropzone that contains this word element
      const parentDropzone = wordElement.closest(".dropzone");

      // Check if the item's dropzone is the correct one
      if (
        parentDropzone &&
        parentDropzone.querySelector("div[role='region']").id ===
          correctAnswers[item]
      ) {
        correctCount++;
        parentDropzone.classList.add("bg-green-200");
      } else {
        if (parentDropzone) {
          parentDropzone.classList.add("bg-red-200");
        }
      }
    }
  });

  // Update feedback
  const feedback = document.getElementById("feedback");
  if (correctCount === Object.keys(correctAnswers).length) {
    feedback.textContent = "All answers are correct!";
    feedback.classList.remove("text-red-500");
    feedback.classList.add("text-green-500");
  } else {
    feedback.textContent = `You have ${correctCount} correct answers. Try again.`;
    feedback.classList.remove("text-green-500");
    feedback.classList.add("text-red-500");
  }
}
