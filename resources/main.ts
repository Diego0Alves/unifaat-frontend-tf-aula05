const API_URL = "http://localhost:8080/api";
let jwt: string | null = null;
let currentOffset = 0;
const limit = 10;

function showLogin() {
    (document.getElementById("login-container") as HTMLElement).style.display = "block";
    (document.getElementById("main-content") as HTMLElement).style.display = "none";
    (document.getElementById("login-error") as HTMLElement).innerText = "";
}

function showMain() {
    (document.getElementById("login-container") as HTMLElement).style.display = "none";
    (document.getElementById("main-content") as HTMLElement).style.display = "block";
    loadUsers();
}

async function loginHandler(e: Event) {
    e.preventDefault();
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error("Login inválido");
        const data = await res.json();
        jwt = data.token;
        showMain();
    } catch (err) {
        (document.getElementById("login-error") as HTMLElement).innerText = "Usuário ou senha inválidos.";
    }
}

async function fetchUsers(offset: number) {
    const res = await fetch(`${API_URL}/users?offset=${offset}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    if (!res.ok) throw new Error("Erro ao buscar usuários");
    return await res.json();
}

async function loadUsers() {
    try {
        const data = await fetchUsers(currentOffset);
        const userList = document.getElementById("user-list")!;
        userList.innerHTML = data.users.map((u: any) =>
            `<div class="user-list-item">${u.username} (${u.email})</div>`
        ).join("");
        document.getElementById("page-info")!.innerText = `Página ${currentOffset / limit + 1}`;
    } catch (err) {
        document.getElementById("user-list")!.innerText = "Erro ao carregar usuários.";
    }
}

async function uploadImage() {
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append("image", file);
    try {
        const res = await fetch(`${API_URL}/users/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${jwt}` },
            body: formData
        });
        const result = await res.json();
        (document.getElementById("upload-result") as HTMLElement).innerText = result.message || "Upload realizado!";
    } catch (err) {
        (document.getElementById("upload-result") as HTMLElement).innerText = "Erro no upload.";
    }
}

function setupEvents() {
    document.getElementById("login-form")!.addEventListener("submit", loginHandler);
    document.getElementById("logout-btn")!.onclick = () => {
        jwt = null;
        currentOffset = 0;
        showLogin();
    };
    document.getElementById("upload-btn")!.onclick = uploadImage;
    document.getElementById("prev-btn")!.onclick = () => {
        if (currentOffset >= limit) {
            currentOffset -= limit;
            loadUsers();
        }
    };
    document.getElementById("next-btn")!.onclick = () => {
        currentOffset += limit;
        loadUsers();
    };
}

window.onload = () => {
    showLogin();
    setupEvents();
};