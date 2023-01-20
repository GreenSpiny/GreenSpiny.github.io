//python -m http.server
// ------------------------------------------------------ //
const comboAreaTemplate = `
<p class="combo-text-title"></p>
<p class="combo-text-notes"></p>
<p class="combo-text-reqs"></p>
<div class="combo-insertion-area">

</div>
<div class="combo-description">
  <button type="button" class="collapsible">Combo Path ▼</button>
  <div class="combo-description-content">

  </div>
</div>
`;

const comboVisualAreaTemplate = `<div class="image-shell"></div>`;
const comboImageTemplate = `<img class="combo-image Z"><div class="combo-area-sub card-sizer-mini"></div>`;

// ------------------------------------------------------ //
const url = "combos-list.json";
function PopulateCombos(targetDiv, targetComboType)
{
  const request = new Request(url, { cache: "no-cache" });
  const comboArea = targetDiv;
  fetch(request).then((response)=>response.json()).then((data)=> {
    for (let combo of data[targetComboType])
    {
      const newDiv = document.createElement("div");
      newDiv.setAttribute("id", combo["name"]);
      newDiv.setAttribute("class", "combo-entry");
      newDiv.innerHTML = comboAreaTemplate;
      comboArea.appendChild(newDiv);

      // title
      const title = newDiv.getElementsByClassName("combo-text-title")[0];
      title.innerHTML = combo["name"];

      // notes
      const notesArea = newDiv.getElementsByClassName("combo-text-notes")[0];
      const notes = combo["notes"];
      if (notes != null)
      {
        const notesElement = document.createElement("p");
        notesElement.setAttribute("class", "notes-text");
        notesElement.innerHTML = notes;
        notesArea.appendChild(notesElement);
      }
      else
      {
        notesArea.setAttribute("hidden", true);
      }

      // reqs
      const reqsArea = newDiv.getElementsByClassName("combo-text-reqs")[0];
      const reqs = combo["reqs"];
      if (reqs.length > 0)
      {
        const reqsElement = document.createElement("p");
        reqsElement.setAttribute("class", "requirements-text");
        reqsElement.innerHTML = "requirements:";
        reqsArea.appendChild(reqsElement);

        const reqsList = document.createElement("p");
        reqsList.setAttribute("class", "requirements-text-red");
        reqsList.innerHTML = combo["reqs"];
        reqsArea.appendChild(reqsList);
      }

      // start
      const insertionArea = newDiv.getElementsByClassName("combo-insertion-area")[0];
      const start = combo["start"].split(',');
      for (let i = 0; i < start.length; i++)
      {
        const startParts = start[i].split('|');

        const newVisual = document.createElement("div");
        newVisual.setAttribute("class", "combo-container card-sizer");
        newVisual.innerHTML = comboVisualAreaTemplate;
        insertionArea.appendChild(newVisual);

        const shell = newVisual.getElementsByClassName("image-shell")[0];
        const bigImage = comboImageTemplate.replace("Z", startParts[0]);
        shell.innerHTML = bigImage;

        const miniImageShell = shell.getElementsByClassName("combo-area-sub")[0];
        for (let j = 1; j < startParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "combo-image-sub " + startParts[j]);
          miniImageShell.appendChild(miniImage);
        }
      }

      // arrow
      if (combo["end"].length > 0)
      {
        const newArrow = document.createElement("img");
        newArrow.setAttribute("class", "combo-container card-spacer");
        newArrow.setAttribute("src", "combo-arrow.png");
        insertionArea.appendChild(newArrow);
      }

      // end
      const end = combo["end"].split(',');
      for (let i = 0; i < end.length; i++)
      {
        const endParts = end[i].split('|');

        const newVisual = document.createElement("div");
        newVisual.setAttribute("class", "combo-container card-sizer");
        newVisual.innerHTML = comboVisualAreaTemplate;
        insertionArea.appendChild(newVisual);

        const shell = newVisual.getElementsByClassName("image-shell")[0];
        const bigImage = comboImageTemplate.replace("Z", endParts[0]);
        shell.innerHTML = bigImage;

        const miniImageShell = shell.getElementsByClassName("combo-area-sub")[0];
        for (let j = 1; j < endParts.length; j++)
        {
          const miniImage = document.createElement("img");
          miniImage.setAttribute("class", "combo-image-sub " + endParts[j]);
          miniImageShell.appendChild(miniImage);
        }
      }

      // bonuses
      if (combo["banishes"] > 0 || combo["cipher"])
      {
        const newVisual = document.createElement("div");
        newVisual.setAttribute("class", "combo-container card-sizer-half");
        newVisual.innerHTML = comboVisualAreaTemplate;
        insertionArea.appendChild(newVisual);

        const shell = newVisual.getElementsByClassName("image-shell")[0];

        if (combo["banishes"] > 0)
        {
          const halfImage = document.createElement("img");
          halfImage.setAttribute("class", "combo-image hundred");
          shell.appendChild(halfImage);

          const halfSpan = document.createElement("span");
          halfSpan.setAttribute("class", "combo-text-hundred overlay-text");
          halfSpan.innerHTML = "x" + String(combo["banishes"]);
          shell.appendChild(halfSpan);
        }

        if (combo["cipher"])
        {
          const xSpan = document.createElement("span");
          xSpan.setAttribute("class", "combo-text-x overlay-text");
          xSpan.innerHTML = "+EX";
          shell.appendChild(xSpan);
        }
      }

      // path
      var finalPath = "";
      const path = combo["path"].split('.');
      for (let i = 0; i < path.length - 1; i++)
      {
        var spacer = "";
        if (i < 9 && path.length >= 11)
        {
          spacer = " ";
        }
        finalPath += String(i + 1) + ". " + spacer + path[i].trim() + ".";
        if (i != path.length - 1)
        {
          finalPath += "<br>"
        }
      }
      newDiv.getElementsByClassName("combo-description-content")[0].innerHTML = "<p class='mono-text'>" + finalPath + "</p>";
      const button = newDiv.getElementsByClassName("collapsible")[0];
      button.addEventListener("click", function() {
        var content = this.nextElementSibling;
        if (content.style.display === "block")
        {
          button.innerHTML = "Combo Path ▼";
          content.style.display = "none";
        }
        else
        {
          button.innerHTML = "Combo Path ▲";
          content.style.display = "block";
        }

      });

    }
  }).catch(console.error);
}

// ------------------------------------------------------ //
function ButtonFunc(number)
{
  const num = String(number);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("tab", num);
  window.history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);

  for (const child of document.getElementById("nav-button-area").children) {
    if (child.getAttribute("id").endsWith(num))
    {
      child.setAttribute("disabled", true);
    }
    else
    {
      child.removeAttribute("disabled");
    }
  }

  for (const child of document.getElementById("combo-area").children) {
    if (child.getAttribute("id").endsWith(num))
    {
      child.removeAttribute("hidden");
    }
    else
    {
      child.setAttribute("hidden", true);
    }
  }

}

// ------------------------------------------------------ //
function Initialize()
{
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  
  var tab = 1;
  if (params["tab"] != null)
  {
    tab = params["tab"];
  }

  ButtonFunc(tab);
  PopulateCombos(document.getElementById("card-combos-1"), "1-card-combos");
  PopulateCombos(document.getElementById("card-combos-2"), "1.5-card-combos");
  PopulateCombos(document.getElementById("card-combos-3"), "2-card-combos");
  PopulateCombos(document.getElementById("card-combos-4"), "3-card-combos");
  PopulateCombos(document.getElementById("card-combos-5"), "jank-combos");
}