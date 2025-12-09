const odeType = document.getElementById("odeType");
const firstOptions = document.getElementById("firstOrderOptions");
const secondOptions = document.getElementById("secondOrderOptions");
const firstSubtype = document.getElementById("firstSubtype");
const solveBtn = document.getElementById("solveBtn");
const solutionBox = document.getElementById("solutionBox");

function toggleOdeSections() {
    if (odeType.value === "first") {
        firstOptions.style.display = "block";
        secondOptions.style.display = "none";
    } else {
        firstOptions.style.display = "none";
        secondOptions.style.display = "block";
    }
}

function toggleFirstSubtype() {
    document.getElementById("firstLinear").style.display = firstSubtype.value === "linear" ? "block" : "none";
    document.getElementById("firstSeparable").style.display = firstSubtype.value === "linear" ? "none" : "block";
}

solveBtn.addEventListener("click", async () => {
    const payload = { type: odeType.value };
    if (payload.type === "first") {
        payload.subtype = firstSubtype.value;
        if (payload.subtype === "linear") {
            payload.p = document.getElementById("pValue").value || "0";
            payload.q = document.getElementById("qValue").value || "0";
        } else {
            payload.f = document.getElementById("fValue").value || "0";
            payload.g = document.getElementById("gValue").value || "1";
        }
    } else {
        payload.a = document.getElementById("aValue").value || "1";
        payload.b = document.getElementById("bValue").value || "0";
        payload.c = document.getElementById("cValue").value || "0";
        payload.r = document.getElementById("rValue").value || "0";
    }

    solutionBox.textContent = "Solving...";
    try {
        const res = await fetch("/solve_ode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) solutionBox.textContent = "Error: " + data.error;
        else solutionBox.textContent = data.solution || JSON.stringify(data, null, 2);
    } catch (err) {
        solutionBox.textContent = "Network error: " + err.message;
    }
});

odeType.addEventListener("change", toggleOdeSections);
firstSubtype.addEventListener("change", toggleFirstSubtype);
document.addEventListener("DOMContentLoaded", () => { toggleOdeSections(); toggleFirstSubtype(); });
