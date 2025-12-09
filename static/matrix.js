
const matricesContainer = document.getElementById("matricesContainer");
const resultsContainer = document.getElementById("resultsContainer");
const addBtn = document.getElementById("addMatrix");
const calculateBtn = document.getElementById("calculate");
const operationSelect = document.getElementById("operation");
const scalarInput = document.getElementById("scalarInput");
const selectA = document.getElementById("selectA");
const selectB = document.getElementById("selectB");
const labelSelectB = document.getElementById("labelSelectB");

let nextId = 0;
let savedList = [];

function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const k in attrs) {
        if (k === "class") e.className = attrs[k];
        else if (k === "text") e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
    }
    children.forEach(ch => e.appendChild(ch));
    return e;
}

function addMatrixCard() {
    nextId++;
    const id = nextId;
    const card = el("div", { class: "matrix card", id: `matrix-${id}` });
    const header = el("div", { class: "matrix-header" }, [el("h3", { text: `Matrix ${id}` })]);

    const controls = el("div", { class: "matrix-controls" }, [
        el("label", { text: "Rows: " }),
        el("input", { type: "number", id: `rows-${id}`, value: 2, min: 1, max: 20 }),
        el("label", { text: "Cols: " }),
        el("input", { type: "number", id: `cols-${id}`, value: 2, min: 1, max: 20 }),
        el("button", { class: "generate-btn", "data-id": id, text: "Generate Grid" }),
        el("button", { class: "save-btn", "data-id": id, text: "💾 Save" }),
        el("button", { class: "remove-btn", "data-id": id, text: "🗑 Remove" })
    ]);

    const gridWrap = el("div", { id: `matrixContainer-${id}`, class: "matrix-grid" });
    const status = el("p", { id: `save-status-${id}`, class: "save-status", text: "" });

    card.appendChild(header);
    card.appendChild(controls);
    card.appendChild(gridWrap);
    card.appendChild(status);
    matricesContainer.appendChild(card);

    generateMatrixGrid(id);
    refreshSelects();
}


function generateMatrixGrid(id) {
    const rowsInput = document.getElementById(`rows-${id}`);
    const colsInput = document.getElementById(`cols-${id}`);
    const rows = Math.max(1, parseInt(rowsInput.value) || 1);
    const cols = Math.max(1, parseInt(colsInput.value) || 1);
    rowsInput.value = rows;
    colsInput.value = cols;

    const container = document.getElementById(`matrixContainer-${id}`);
    container.innerHTML = "";
    for (let r = 0; r < rows; r++) {
        const rowDiv = el("div", { class: "matrix-row" });
        for (let c = 0; c < cols; c++) {
            const input = el("input", {
                type: "number",
                id: `matrix-${id}-cell-${r}-${c}`,
                value: "0",
                class: "matrix-input"
            });
            rowDiv.appendChild(input);
        }
        container.appendChild(rowDiv);
    }
    document.getElementById(`save-status-${id}`).textContent = "";
}


function collectMatrix(id) {
    const rows = parseInt(document.getElementById(`rows-${id}`).value) || 0;
    const cols = parseInt(document.getElementById(`cols-${id}`).value) || 0;
    const mat = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const v = parseFloat(document.getElementById(`matrix-${id}-cell-${r}-${c}`).value) || 0;
            row.push(v);
        }
        mat.push(row);
    }
    return mat;
}


function refreshSelects() {

    selectA.innerHTML = "";
    selectB.innerHTML = "";

    savedList.forEach((entry, idx) => {
        const optA = el("option", { value: idx, text: `Matrix ${entry.id}` });
        selectA.appendChild(optA);

        const optB = el("option", { value: idx, text: `Matrix ${entry.id}` });
        selectB.appendChild(optB);
    });


    if (savedList.length === 0) {
        selectA.innerHTML = `<option value="0">No matrices</option>`;
        selectB.innerHTML = `<option value="0">No matrices</option>`;
    } else {
        selectA.value = Math.min(selectA.value || 0, savedList.length - 1);
        selectB.value = Math.min(selectB.value || 0, savedList.length - 1);
    }

    updateStatusMessage();
}

function updateStatusMessage() {
    const count = savedList.length;
    const msg = count > 0 ? `Saved matrices: ${count}` : "No matrices saved";
    const existing = resultsContainer.querySelector('.status-message');
    if (existing) existing.textContent = msg;
    else resultsContainer.prepend(el("p", { class: "status-message", text: msg }));
}

matricesContainer.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (target.classList.contains("generate-btn")) generateMatrixGrid(id);
    if (target.classList.contains("remove-btn")) {
        const card = document.getElementById(`matrix-${id}`);
        if (card) card.remove();

        const idx = savedList.findIndex(x => x.id === parseInt(id));
        if (idx >= 0) savedList.splice(idx, 1);
        refreshSelects();
    }
    if (target.classList.contains("save-btn")) {
        const mat = collectMatrix(id);
        const idx = savedList.findIndex(x => x.id === parseInt(id));
        if (idx >= 0) savedList[idx].matrix = mat;
        else savedList.push({ id: parseInt(id), matrix: mat });
        document.getElementById(`save-status-${id}`).textContent = `Matrix ${id} saved ✓`;
        refreshSelects();
    }
});


addBtn.addEventListener("click", addMatrixCard);


operationSelect.addEventListener("change", () => {
    const op = operationSelect.value;
    const twoOps = ["add", "subtract", "multiply", "cramer"];
    if (twoOps.includes(op)) {
        labelSelectB.style.display = "inline-block";
        selectB.style.display = "inline-block";
        scalarInput.style.display = "none";
    } else if (op === "scalar_multiply") {
        labelSelectB.style.display = "none";
        selectB.style.display = "none";
        scalarInput.style.display = "inline-block";
    } else {
        labelSelectB.style.display = "none";
        selectB.style.display = "none";
        scalarInput.style.display = "none";
    }
});


function renderResult(container, data) {
    container.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = "Result";
    container.appendChild(h);

    if (data === null || data === undefined) {
        container.appendChild(el("p", { text: "No result" }));
        return;
    }


    if (typeof data === "object" && data.values && data.vectors) {
        container.appendChild(el("h4", { text: "Eigenvalues" }));
        container.appendChild(el("pre", { class: "results-pre", text: JSON.stringify(data.values, null, 2) }));
        container.appendChild(el("h4", { text: "Eigenvectors (columns)" }));
        container.appendChild(el("pre", { class: "results-pre", text: JSON.stringify(data.vectors, null, 2) }));
        return;
    }


    if (Array.isArray(data)) {

        const is2D = data.length > 0 && Array.isArray(data[0]);
        if (is2D) {
            const table = el("table", { class: "result-table" });
            data.forEach(row => {
                const tr = el("tr");
                row.forEach(cell => {
                    tr.appendChild(el("td", { text: String(cell) }));
                });
                table.appendChild(tr);
            });
            container.appendChild(table);
            return;
        } else {

            container.appendChild(el("pre", { class: "results-pre", text: JSON.stringify(data, null, 2) }));
            return;
        }
    }


    container.appendChild(el("pre", { class: "results-pre", text: JSON.stringify(data, null, 2) }));
}


calculateBtn.addEventListener("click", async () => {
    if (savedList.length === 0) {
        resultsContainer.innerHTML = "<p class='error'>Please save at least one matrix!</p>";
        return;
    }

    const primaryIndex = parseInt(selectA.value) || 0;
    const op = operationSelect.value;
    const payload = {
        operation: op,
        saved_matrices: savedList.map(x => x.matrix),
        primary_index: primaryIndex
    };


    const twoOps = ["add", "subtract", "multiply", "cramer"];
    if (twoOps.includes(op)) {
        payload.secondary_index = parseInt(selectB.value) || 0;
    }

    if (op === "scalar_multiply") {
        payload.scalar = parseFloat(scalarInput.value) || 1;
    }

    resultsContainer.innerHTML = `<p class="muted">Calculating...</p>`;

    try {
        const res = await fetch("/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) {
            resultsContainer.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        renderResult(resultsContainer, data.result);
    } catch (err) {
        resultsContainer.innerHTML = `<p class="error">Network Error: ${err.message}</p>`;
    }
});


document.addEventListener("DOMContentLoaded", () => {
    if (matricesContainer.children.length === 0) addMatrixCard();
    refreshSelects();

    operationSelect.dispatchEvent(new Event('change'));
});
