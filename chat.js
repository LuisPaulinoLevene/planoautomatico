import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjR7ByKvIFDoF61CL5u2SmYjZ2SOqGd4I",
    authDomain: "planoautomatico.firebaseapp.com",
    projectId: "planoautomatico",
    storageBucket: "planoautomatico.appspot.com",
    messagingSenderId: "474178177133",
    appId: "1:474178177133:web:452243accf7de0548b9764",
    measurementId: "G-7GZFKCREKH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendIcon = document.getElementById('send-icon');
const responseDiv = document.getElementById('response');

let respondingTo = null;

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        updateMessages();
    }
});

function formatDate(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function getUserName(email) {
    const userRef = doc(db, 'users', email.split('@')[0]); // Usa a parte do email antes do @ como ID
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data().name : email.split('@')[0]; // Retorna o nome ou a parte do email
}

async function updateMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp"));
    onSnapshot(q, async snapshot => {
        messagesDiv.innerHTML = ""; // Limpa mensagens anteriores
        for (const doc of snapshot.docs) {
            const msg = doc.data();
            if (msg.email && msg.text) {
                const userName = await getUserName(msg.email); // Obtém o nome do usuário
                const date = msg.timestamp ? formatDate(msg.timestamp) : '';
                const time = msg.timestamp ? formatTime(msg.timestamp) : '';

                // Cria div para a mensagem original
                const msgDiv = document.createElement('div');
                msgDiv.className = `message ${msg.email === auth.currentUser.email ? 'sent' : 'received'}`;
                msgDiv.innerHTML = `
                    <div class="message-user">${userName}</div>
                    <div>${msg.text}</div>
                    <div class="message-time">${time}</div>
                    <div class="message-date">${date}</div>
                `;
                messagesDiv.appendChild(msgDiv);

                // Se houver uma resposta, cria div para a resposta logo abaixo
                if (msg.responseText) {
                    const responseDiv = document.createElement('div');
                    responseDiv.className = 'message response';
                    responseDiv.innerHTML = `
                        <div class="message-user">${userName}</div>
                        <div>${msg.responseText}</div>
                        <div class="message-time">${time}</div>
                        <div class="message-date">${date}</div>
                    `;
                    messagesDiv.appendChild(responseDiv);
                }

                msgDiv.onclick = () => {
                    respondingTo = msg;
                    responseDiv.textContent = `Respondendo a: ${msg.text}`;
                    messageInput.focus();
                };
            }
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Rola para o final
    });
}

sendIcon.onclick = async () => {
    const message = messageInput.value.trim();
    const user = auth.currentUser;

    if (user && message) {
        const messageData = {
            text: respondingTo ? respondingTo.text : message,
            email: respondingTo ? respondingTo.email : user.email,
            timestamp: serverTimestamp(),
            responseText: respondingTo ? `${user.email.split('@')[0]}: ${message}` : null // Oculta o domínio na resposta
        };

        await addDoc(collection(db, "messages"), messageData);

        messageInput.value = "";
        responseDiv.textContent = "";
        respondingTo = null;
    }
}
