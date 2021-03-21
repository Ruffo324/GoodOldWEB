const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvasElement.getContext("2d") as CanvasRenderingContext2D;

// Wir machen das Canvas so groß wie die website ja?
var canvasSize: size;
updateCanvasSize();
var cooldownUntilReload: number;

type xy = {
	x: number;
	y: number;
};
type size = {
	width: number;
	height: number;
};

type pType = {
	name: string;
	pos: xy;
	mov: xy;
	s: number;
};

var punkte: pType[] = [];
var framesDrawnSinceInit = 0;
var frameInterval: number;
var reInitializedCount = 0; // Debug counter, wie oft er alles wiederholt.

function getWindowSize(): size {
	return { width: window.innerWidth, height: window.innerHeight };
}
function updateCanvasSize() {
	canvasSize = getWindowSize();
	canvasElement.setAttribute("width", canvasSize.width.toString());
	canvasElement.setAttribute("height", canvasSize.height.toString());
}

function init() {

	punkte.push({ //temporär festgelegte Punkte zum Testen
		name: "A",
		pos: {
			x: 0,// + 100,
			y: canvasSize.height / 2 + 12,
		},
		mov: {
			x: 0.5,
			y: 0,
		},
		s: 10
	});

	punkte.push({
		name: "B", // weil COOL!
		pos: {
			x: canvasSize.width,// + 100,
			y: canvasSize.height / 2 - 12,
		},
		mov: {
			x: -0.5,
			y: 0,
		},
		s: 10
	});

	const redrawFps = 1000 / 30; // -> 30fps - nicht sicher, glaube schon.
	const stepsPerFrame = 1; // 💡 Ich will wissen was in jedem frame abgeht..
	frameInterval = setInterval(renderFrame, redrawFps, stepsPerFrame);
}

function reInit() {
	beep(); // Beep bup.
	const revertRedBgMs = 1000; // 1s
	var currBgColor = document.body.style.backgroundColor; // hintergrund merken.
	document.body.style.backgroundColor = "rgba(255,0,0,0.4)"; // auf rot.

	// Alles auf 0.
	clearInterval(frameInterval); // renderFrame stoppen!
	reInitializedCount++; // Hochzählen.
	punkte = []; // anzahl punkte löschen.

	// Nach bestimmter zeit wieder init aufräumen.
	setTimeout(() => {
		framesDrawnSinceInit = 0;
		document.body.style.backgroundColor = currBgColor;
		init();
	}, revertRedBgMs); // roten bg wieder weg und re-start.
}

function renderFrame(steps: number) {
	framesDrawnSinceInit++;
	context.fillStyle = '#000000aa';


	// Testlinien zur veranschaulichung.
	context.clearRect(0, 0, canvasSize.width, canvasSize.height);
	context.beginPath()
	context.moveTo(0, canvasSize.height / 2);
	context.lineTo(canvasSize.width, canvasSize.height / 2);
	context.moveTo(canvasSize.width / 2, canvasSize.height / 2 - 4);
	context.lineTo(canvasSize.width / 2, canvasSize.height / 2 + 4);
	context.stroke();
	context.beginPath();

	// for (var i = 0; i < punkte.length; i++) { // für jeden Punkt... 
	//💡 RUFFO-TIPP: Dann nenns doch einfach "punkte" und "punkt" :D - guck:
	punkte.forEach((punkt) => {
		context.beginPath();
		context.arc(punkt.pos.x, punkt.pos.y, punkt.s, 0, 360); // Kreis Zeichnen
		context.fill();

		// for (var ii = 0; ii < punkte.length; ii++) { // für jeden Punt außer dem Aktuellen
		//💡 RUFFO-TIPP: mit "array.filter((element,index) => bool)" kannst du arrays und co bequem VORHER filtern. Dadurch entfällt das "if (ii != i) {". - https://www.w3schools.com/jsref/jsref_filter.asp
		punkte
			.filter(p => p != punkt)
			.forEach((andererPunkt) => {
				// Errechnen der Entfernung zum anderen Kreis
				var entfernung = {
					"x": punkt.pos.x - andererPunkt.pos.x,
					"y": punkt.pos.y - andererPunkt.pos.y
				};


				// Berechnen der Gravitaionskraft die Auf den Kreis wirkt aufgrund der Größe und Entfernung zum anderen Kreis.
				var gravity = {
					"x": Math.sign(entfernung.x) * (andererPunkt.s / Math.pow(entfernung.x, 2)),
					"y": Math.sign(entfernung.y) * (andererPunkt.s / Math.pow(entfernung.y, 2)),
				}

				// Addieren der Kraft auf den Kreis
				punkt.mov.x += gravity.x;
				punkt.mov.y -= gravity.y;
			});

		//	elems[i]['x'] += elems[i]['moveX'] * s;
		//	elems[i]['y'] += elems[i]['moveY'] * s;
		// ❓ - was ist "s"? 😭 --> Ich geh mal von "global speed" aus.. oder doch schritte? hmm :(
		punkt.pos.x += punkt.mov.x * steps;
		punkt.pos.y += -punkt.mov.y * steps;
	});

	// Debug stuff!
	writeGlobalDebugInfos();
	punkte.forEach(p => punktDebug(p));

	// ⚠️ - Wenn mindestens ein punkt (punkte.some(...)) nichtmehr zu sehen ist, starten wir von vorne!
	// Kann man später definitiv entfernen.. ist eher aus faulheit, weil neuladen.
	if (punkte.some(p => p.pos.x < 0 || p.pos.x > canvasSize.width || p.pos.y < 0 || p.pos.y > canvasSize.height)) {
		reInit();
		return;
	}
}

// A / B bzw. punkt.name auf punkt schreiben, alle daten des punktes anzeigen.
function punktDebug(point: pType) {
	var currFillStyle = context.fillStyle;
	context.fillStyle = "orange";

	// Namen(A/B) ins canvas schreiben.
	context.font = (point.s * window.devicePixelRatio).toString() + "px Arial";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(point.name, point.pos.x, point.pos.y);
	debugStringifyPoint(point);

	// Style wieder herstellen.
	context.fillStyle = currFillStyle;
}

var debugPointUpDownToggle = false;
function debugStringifyPoint(point: pType) {
	const placeholderID = "##DIV-ID##";
	const hackyWidthPx = 100;
	const divDefaultStyle =
		"display: inline-block;" +
		"position: absolute;" +
		" z-index: 999;" +
		" background: transparent;" +
		" overflow: visible;" +
		" width: " + hackyWidthPx.toString() + "px";
	const debugDivTemplate = `<span id="${placeholderID}" style="${divDefaultStyle}"><pre></pre></span>`

	const debugDivId = `debug-point-${point.name.toUpperCase()}`;

	// ein if mit != null würde auch gehen .
	var debugElement: HTMLElement;
	while ((debugElement = document.querySelector(`#${debugDivId} > pre`)) === null) {
		document.getElementById("container").innerHTML += debugDivTemplate.replace(placeholderID, debugDivId);
		console.log("created!");
	}


	let div: HTMLElement = debugElement.parentElement;
	// div.style.left = (point.pos.x - (div.offsetWidth * 0.5)) + "px";
	// div.style.top = (point.pos.y + (div.offsetHeight * 0.5)) + "px";

	var pos = { left: point.pos.x, top: point.pos.y };
	if (debugPointUpDownToggle) {
		div.style.marginLeft = `${-div.clientWidth}px`;
		div.style.marginTop = `${-div.clientHeight}px`;
		// pos.left -= div.clientWidth;
		// pos.top -= div.clientHeight;
	}
	div.style.left = (pos.left) + "px";
	div.style.top = (pos.top) + "px";
	debugElement.innerHTML = JSON.stringify(point, null, 2);
	debugPointUpDownToggle = !debugPointUpDownToggle; // toggle schalter. wert = !(NOT)wert; 
}

// Anzeigen von "Wiederholung Nr X".
function writeGlobalDebugInfos() {
	var lineHeight = canvasSize.height / 100;
	let textPosition = { x: canvasSize.width * 0.5, y: canvasSize.height * 0.1 };
	context.font = "1em Arial";
	context.textAlign = "center";
	context.fillText(`Wiederholung Nr: ${reInitializedCount}`, textPosition.x, textPosition.y + lineHeight * 0.5);
	context.fillText(`Frame Nr.: ${framesDrawnSinceInit}`, textPosition.x, canvasSize.height * 0.05);
}

// 🔊 beep.
function beep() {
	try {
		var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
		snd.play().catch(_ => _);
	} catch (_) {
		// Kann manchmal failen.. ist aver auzcg nicht schlimm.
	}
}

window.addEventListener('resize', () => {
	clearTimeout(cooldownUntilReload);
	cooldownUntilReload = setTimeout(() => {
		beep();
		document.location.reload();
		return;
	}, 1000 * 1); // 1sec 
});