function showVisa(evt) {
	document.getElementById("visa").classList.add("popup_show");
	evt.preventDefault();
}

function hideVisa() {
	document.getElementById("visa").classList.remove("popup_show");
}

function showMap(evt) {
	document.getElementById("map").classList.add("popup_show");
	evt.preventDefault();
}

function hideMap() {
	document.getElementById("map").classList.remove("popup_show");
}

document.getElementById("showVisa").addEventListener("click", showVisa);
document.getElementById("visa").addEventListener("click", hideVisa);
document.getElementById("showMap").addEventListener("click", showMap);
document.getElementById("map").addEventListener("click", hideMap);