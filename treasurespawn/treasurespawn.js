// Function parameters
const numPlayers = 100000;
const maxBoxes = 9;
var targetMedals = 10000;
var spawnMedals = [50, 200];
var unwantedChance = 0.0;
var randomExponent = 1;
var originalBoxes = [
	[800, 1200]
];

// Display parameters
const frequencyDisplayWidth = 30;
const spawnCost = 30;
const frequencyDisplayChar = "x";
const paddingDisplayChar = "."
var buttonElement = null;
var textElement = null;
var frequencyElement = null;

// Page initialization
function Init() {

	// Store elements for quick access
	buttonElement = document.getElementById("calculateButton");
	textElement = document.getElementById("textResults");
	frequencyElement = document.getElementById("frequencyResults");

	// Populate the set of variable treasure boxes
	var variableBoxNames = document.getElementById("variableBoxNames");
	var dynamicNameHTML = '';
	for (var i = 0; i < maxBoxes; i++) {
		var jackpotInsert = "";
		if (i == 0) {
			jackpotInsert = "(Jackpot) ";
		}
		dynamicNameHTML += `<p class="treasureName" num=${i} style="display:block">${jackpotInsert}Box ${i + 1} Medals</p>`;
	}
	variableBoxNames.innerHTML = dynamicNameHTML;
	var variableBoxContents = document.getElementById("variableBoxContents");
	var dynamicContentsHTML = '';
	for (var i = 0; i < maxBoxes; i++) {
		var placeholderContents;
		var connector = " or ";
		if (i == 0) {
			placeholderContents = originalBoxes[0];
			connector = " to ";
		} else {
			placeholderContents = [0, 0];
		}
		dynamicContentsHTML += `<div class="treasureData" num=${i} style="display:block"><input id="treasureMin${i}" min=0 max=10000 value=${placeholderContents[0]} step=50 type="number" /> <span>${connector}</span><input id="treasureMax${i}" min=0 max=10000 value=${placeholderContents[1]} step=50 type="number" /><br /></div>`;
	}
	variableBoxContents.innerHTML = dynamicContentsHTML;

	// Immediately display the appropriate boxes
	ToggleBoxes();
}

// Function to display the number of treasure boxes in the spawn
function ToggleBoxes() {
	var allNames = document.getElementsByClassName("treasureName");
	var allData = document.getElementsByClassName("treasureData");
	var boxCount = document.getElementById("boxCount").value;
	for (var i = 0; i < maxBoxes; i++) {
		if (allNames[i].getAttribute("num") < boxCount) {
			allNames[i].style.display = "block";
			allData[i].style.display = "block";
		} else {
			allNames[i].style.display = "none";
			allData[i].style.display = "none";
		}
	}
}

// Main function
function Execute() {
	console.log("Beginning calculation...");
	buttonElement.innerHTML = "Calculating..."
	setTimeout(function(){
		ExecuteData();
		console.log("Finished calculation.");
		buttonElement.innerHTML = "Calculate"
	}, 100);
}

function ExecuteData() {
	// Get input values from HTML
	targetMedals = parseInt(document.getElementById("targetMedals").value);
	spawnMin = parseInt(document.getElementById("spawnMedalsMin").value);
	spawnMax = parseInt(document.getElementById("spawnMedalsMax").value);
	unwantedChance = parseInt(document.getElementById("unwantedChance").value) * 0.01;
	randomExponent = parseInt(document.getElementById("randomCurve").value);

	if (isNaN(targetMedals))	{targetMedals = 0;}
	if (isNaN(spawnMin))		{spawnMin = 0;}
	if (isNaN(spawnMax))		{spawnMax = 0;}
	if (isNaN(unwantedChance))	{unwantedChance = 0;}
	if (isNaN(randomExponent))	{randomExponent = 1;}

	if (spawnMin <= spawnMax)
	{
		spawnMedals[0] = spawnMin;
		spawnMedals[1] = spawnMax;
	}
	else
	{
		spawnMedals[0] = spawnMax;
		spawnMedals[1] = spawnMin;
	}

	originalBoxes = [];
	for (var x = 0; x < document.getElementById("boxCount").value; x++) {
		var minValue = parseInt(document.getElementById(`treasureMin${x}`).value);
		var maxValue = parseInt(document.getElementById(`treasureMax${x}`).value);
		if (isNaN(minValue)) {minValue = 0;}
		if (isNaN(maxValue)) {maxValue = 0;}
		if (minValue <= maxValue)
		{
			originalBoxes.push([minValue, maxValue]);
		}
		else
		{
			originalBoxes.push([maxValue, minValue]);
		}
	}

	// Check input validity
	if (!IsValid()) {
		return false;
	}

	// Record results
	var totalGemsSpent = 0;
	var results = [];
	for (var x = 0; x < numPlayers; x++) {
		var attempt = AttemptRun();
		totalGemsSpent += attempt;
		results.push(attempt);
	}
	results.sort(function(a, b) {
		return a - b
	});
	var average = totalGemsSpent / numPlayers;
	var lowest = results[0];
	var highest = results[results.length - 1];

	// Determine frequency mapping
	var frequencyMap = {};
	var maxFrequency = 0;
	var currentValue = 0;
	var currentFrequency = 0;
	for (x = 0; x < results.length + 1; x++) {
		if (currentValue != results[x]) {
			if (currentFrequency > 0) {
				frequencyMap[currentValue] = currentFrequency;
			}
			if (x == results.length) {
				break;
			}
			currentValue = results[x];
			currentFrequency = 1;
		} else {
			currentFrequency += 1;
		}
		if (currentFrequency > maxFrequency) {
			maxFrequency = currentFrequency;
		}
	}

	// Output results text to HTML
	var txt = `<p>${numPlayers.toLocaleString()} recruits attempted to spawn ${targetMedals.toLocaleString()} medals.</p>`;
	txt += `<p><b>Average:</b> ${Math.round(average).toLocaleString()} gems<br>`;
	txt += `<b>Luckiest:</b> ${lowest.toLocaleString()} gems<br>`;
	txt += `<b>Unluckiest:</b> ${highest.toLocaleString()} gems</p>`;
	txt += "<p>See below for relative frequencies.</p>";
	textElement.innerHTML = txt;

	// Output results frequency diagram to HTML
	var frequencyTable = "<p>";
	for (var val = lowest; val <= highest; val += spawnCost) {
		var relativeFrequency = 0;
		if (val in frequencyMap) {
			relativeFrequency = frequencyMap[val] / maxFrequency;
		}
		var stringWidth = Math.round(relativeFrequency * frequencyDisplayWidth);
		frequencyTable += (`[${val}]`.padEnd(8, paddingDisplayChar)) + " " + frequencyDisplayChar.repeat(stringWidth);
		if (val != highest) {
			frequencyTable += "<br>";
		}
	}
	frequencyTable += "</p>";
	frequencyElement.innerHTML = frequencyTable;
	return true;
}

// Sanity check for input parameters
function IsValid() {
	if (targetMedals <= 0)
	{
		textElement.innerHTML = "Error: Target medals must be greater than zero.";
		frequencyElement.innerHTML = "";
		return false;
	}
	var availableMedals = spawnMedals[1];
	for (i = 0; i < originalBoxes.length; i++) {
		availableMedals += Math.max(originalBoxes[i][0], originalBoxes[i][1]);
	}
	if (availableMedals == 0) {
		textElement.innerHTML = "Error: There is no way to obtain medals.";
		frequencyElement.innerHTML = "";
		return false;
	}
	return true;
}

// One player attempts to obtain an item through exchange
function AttemptRun() {
	var gems = 0;
	var medals = 0;
	var availableNumbers = RangeArray(originalBoxes.length);
	var firstPull = true;
	var doubleChance = false;

	// While the player still does not have enough medals...
	while (medals < targetMedals) {

		// Get per spawn medals
		medals += RandomBetweenPair(spawnMedals, 0);

		// Pull a box
		var jackpot = false;
		var randomIndex = Math.floor(Math.random() * availableNumbers.length);
		var selectedBox = availableNumbers[randomIndex];
		var unwantedGear = false;
		var selectionType = 1;
		if (selectedBox == 0) {
			jackpot = true;
			unwantedGear = Math.random() < unwantedChance;
			selectionType = 0;
		}
		if (!unwantedGear) {
			medals += RandomBetweenPair(originalBoxes[selectedBox], selectionType);
		}
		availableNumbers.splice(randomIndex, 1);

		// Pull another box if double chance
		if (doubleChance && availableNumbers.length > 0) {
			randomIndex = Math.floor(Math.random() * availableNumbers.length);
			selectedBox = availableNumbers[randomIndex];
			selectionType = 1;
			if (selectedBox == 0) {
				jackpot = true;
				unwantedGear = Math.random() < unwantedChance;
				selectionType = 0;
			}
			if (!unwantedGear) {
				medals += RandomBetweenPair(originalBoxes[selectedBox], selectionType);
			}
			availableNumbers.splice(randomIndex, 1);
		}
		doubleChance = false;

		// Reset boxes if necessary
		if (jackpot) {
			doubleChance = true;
			availableNumbers = RangeArray(originalBoxes.length);
		}

		// Pay gems
		if (firstPull) {
			gems += spawnCost / 2;
			firstPull = false;
			doubleChance = true;
		} else {
			gems += spawnCost;
		}

		// Debug
		//console.log("jackpot: " + jackpot.toString() + ", gem / medals: " + gems.toString() + "/" + medals.toString());
	}

	// Return the number of gems spent
	return gems;
}

// Helper to create an array of a given number range
function RangeArray(length) {
	var array = []
	for (var i = 0; i < length; i++) {
		array.push(i);
	}
	return array;
}

// Helper to pick from a range of possible medals
function RandomBetweenPair(array, selectionType) {

	var randomRoll = Math.pow(Math.random(), randomExponent);

	// Full range
	if (selectionType == 0) {
		return Math.floor(randomRoll * (array[1] - array[0])) + array[0];
	}
	// Pick one of two
	else {
		return array[Math.round(randomRoll)];
	}
}