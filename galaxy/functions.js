//python -m http.server
// ------------------------------------------------------ //
const cardTemplate = `
<div id="YYY" class="card">
  <img class="card-img XXX">
  <div class="sub-card-area"></div>
</div>
`;

const pathTemplate = `
<button class="path-button button-text" onclick="ToggleButton(this)">Combo Path ▼</button>
<div class="path-desc-area">
  <ol></ol>
</div>
`;

// ------------------------------------------------------ //
const url = "combos-list.json";
var cardCount = 0;

function PopulateCombos(targetDiv, targetComboType, minUnits)
{
  const request = new Request(url, { cache: "no-cache" });
  const comboArea = targetDiv;
  fetch(request).then((response)=>response.json()).then((data)=> {

    var comboCount = 0;
    for (let combo of data[targetComboType])
    {
      cardsInCombo = 0;
      const comboDiv = document.createElement("div");
      comboDiv.setAttribute("id", combo["name"]);
      if (comboCount == 0)
      {
        comboDiv.setAttribute("class", "combo combo-top");
      }
      else
      {
        comboDiv.setAttribute("class", "combo");
      }
      comboCount++;
      comboArea.appendChild(comboDiv);

      // title
      const titleElement = document.createElement("p");
      titleElement.setAttribute("class", "header-text");
      titleElement.innerHTML = combo["name"];
      comboDiv.appendChild(titleElement);

      // subtitle
      const notes = combo["notes"];
      if (notes != null)
      {
        const notesElement = document.createElement("p");
        notesElement.setAttribute("class", "major-text");
        notesElement.innerHTML = combo["notes"];
        comboDiv.appendChild(notesElement);
      }

      // reqs
      const reqs = combo["reqs"];
      if (reqs.length > 0)
      {

        const reqsElement = document.createElement("div");
        reqsElement.setAttribute("class", "reqs-area");
        reqsElement.innerHTML = "<p class='minor-text'>requirements: <span class='alert'>" + combo["reqs"] + "</span></p>";
        comboDiv.appendChild(reqsElement);
      }

      // card area
      const cardArea = document.createElement("div");
      cardArea.setAttribute("class", "card-area");
      comboDiv.appendChild(cardArea);

      // start
      const start = combo["start"].split(',');
      for (let i = 0; i < start.length; i++)
      {
        cardCount++;
        cardsInCombo++;
        const startParts = start[i].split('|');
        const currentId = "_card" + String(cardCount);
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", currentId).replace("XXX", startParts[0] + "-cropped"));
        const subArea = document.getElementById(currentId).getElementsByClassName("sub-card-area")[0];
        for (let j = 1; j < startParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "sub-card " + startParts[j] + "-sub");
          subArea.appendChild(miniImage);
        }
      }

      
      // arrow
      if (combo["end"].length > 0)
      {
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", "arrow borderless"));
      }

      // end
      const end = combo["end"].split(',');
      for (let i = 0; i < end.length; i++)
      {
        cardCount++;
        cardsInCombo++;
        const endParts = end[i].split('|');
        const currentId = "_card" + String(cardCount);
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("YYY", currentId).replace("XXX", endParts[0] + "-cropped"));
        const subArea = document.getElementById(currentId).getElementsByClassName("sub-card-area")[0];
        for (let j = 1; j < endParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "sub-card " + endParts[j] + "-sub");
          subArea.appendChild(miniImage);
        }
      }

      
      // bonuses
      if (combo["banishes"] > 0 || combo["cipher"])
      {
        var className = "hundred-";
        className += String(combo["banishes"]);
        if (combo["cipher"])
        {
          className += "-ex";
        }
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", "card-img borderless " + className));
      }
      else
      {
        cardArea.insertAdjacentHTML("afterbegin", cardTemplate.replace("XXX", "card-img borderless blank-quarter"));
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", "card-img borderless blank-quarter"));
      }

      // path
      comboDiv.insertAdjacentHTML("beforeend", pathTemplate);
      const ol = comboDiv.getElementsByTagName("ol")[0];
      const splitPath = combo["path"].split(".");
      for (let i = 0; i < splitPath.length - 1; i++)
      {
        ol.insertAdjacentHTML("beforeend", "<li class='mono-text'>" + splitPath[i] + ".</li>");
      }

      // extra padding
      const diff = minUnits - cardsInCombo;
      for (let i = 0; i < diff; i++)
      {
        cardArea.insertAdjacentHTML("afterbegin", cardTemplate.replace("XXX", "card-img borderless blank-half"));
        cardArea.insertAdjacentHTML("beforeend", cardTemplate.replace("XXX", "card-img borderless blank-half"));
      }

    }
  }).catch(console.error);
}

// ------------------------------------------------------ //
function ButtonFunc(number)
{
  const num = String(number);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("tab", num);

  const localUrl = window.location.href.split("?")[0];
  if (localUrl.includes("combos"))
  {
    window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);
    for (const child of document.getElementById("center-column").getElementsByClassName("combo-area")) {
      if (child.getAttribute("id").endsWith(num))
      {
        child.removeAttribute("hidden");
        document.getElementById("title").innerHTML = child.getAttribute("title");
      }
      else
      {
        child.setAttribute("hidden", true);
      }
    }
  }
  else
  {
    LoadUrl("combos.html?tab=" + num);
  }

}

// ------------------------------------------------------ //
function InitializeCombos()
{
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  
  var tab = 2;
  if (params["tab"] != null)
  {
    tab = params["tab"];
  }

  ButtonFunc(tab);

  cardCount = 0;
  PopulateCombos(document.getElementById("card-combos-1"), "1-card-combos", 5);
  PopulateCombos(document.getElementById("card-combos-2"), "1.5-card-combos", 5);
  PopulateCombos(document.getElementById("card-combos-3"), "2-card-combos", 5);
  PopulateCombos(document.getElementById("card-combos-4"), "3-card-combos", 5);
  PopulateCombos(document.getElementById("card-combos-5"), "jank-combos", 5);
}

// ------------------------------------------------------ //
function ToggleButton(self)
{
  var content = self.nextElementSibling;
  if (content.style.display === "block")
  {
   self.innerHTML =self.innerHTML.replace("▲", "▼");
    content.style.display = "none";
  }
  else
  {
    self.innerHTML =self.innerHTML.replace("▼", "▲");
    content.style.display = "block";
  }
}

function DropdownButton(self)
{
  CloseAllDropdowns();
  var content = self.nextElementSibling;
  if (content != null)
  {
    if (content.style.display === "block")
    {
      content.style.display = "none";
    }
    else
    {
      content.style.display = "block";
    }
  }
}

function CloseAllDropdowns()
{
  var dropdowns = document.getElementsByClassName("inner-nav-dropdown");
  for (let i = 0; i < dropdowns.length; i++)
  {
    dropdowns[i].style.display = "none";
  }
}

function LoadUrl(url)
{
  window.location.assign(url);
}

// ------------------------------------------------------ //

window.onclick = function(event) {
  if (!event.target.matches('.nav-dropdown-button')) {
    CloseAllDropdowns();
  }
}