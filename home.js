import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjR7ByKvIFDoF61CL5u2SmYjZ2SOqGd4I",
    authDomain: "planoautomatico.firebaseapp.com",
    projectId: "planoautomatico",
    storageBucket: "planoautomatico.appspot.com",
    messagingSenderId: "474178177133",
    appId: "1:474178177133:web:452243accf7de0548b9764",
    measurementId: "G-7GZFKCREKH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log('Firebase inicializado', app);

// Define a persistência da autenticação
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Verificação de autenticação ao carregar a página
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log('Usuário não autenticado, redirecionando para index.html.');
                window.location.href = 'index.html'; // Redireciona para a página de login
            }
        });
    })
    .catch((error) => {
        console.error('Erro ao definir a persistência:', error);
    });

// Função de logout
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('Usuário desconectado');
            window.location.href = 'index.html'; // Redireciona para a página de login após logout
        }).catch((error) => {
            console.error('Erro ao desconectar:', error);
        });
    });
}

// Função para contar acessos
function countAccess() {
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0]; // Data no formato YYYY-MM-DD
    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toISOString().split('T')[0]; // Início da semana
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]; // Início do mês
    const yearStart = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0]; // Início do ano

    // Inicializa contagens se não existirem
    const accessData = JSON.parse(localStorage.getItem('accessData')) || {
        daily: {},
        weekly: {},
        monthly: {},
        yearly: {}
    };

    // Contagem diária
    accessData.daily[today] = (accessData.daily[today] || 0) + 1;

    // Contagem semanal
    accessData.weekly[weekStart] = (accessData.weekly[weekStart] || 0) + 1;

    // Contagem mensal
    accessData.monthly[monthStart] = (accessData.monthly[monthStart] || 0) + 1;

    // Contagem anual
    accessData.yearly[yearStart] = (accessData.yearly[yearStart] || 0) + 1;

    // Atualiza localStorage
    localStorage.setItem('accessData', JSON.stringify(accessData));

    // Exibe a contagem em uma única linha
    document.getElementById('accessCount').innerText = `Dia: ${accessData.daily[today]}  Sem: ${accessData.weekly[weekStart] || 0}  Mês: ${accessData.monthly[monthStart] || 0}  Ano: ${accessData.yearly[yearStart] || 0}`;
}
window.onload = countAccess; // Chama a função ao carregar a página