let ws;

function connectWebSocket() {
    ws = new WebSocket(`ws://localhost:8000/ws`);

    ws.onopen = () => console.log("Connected to server");

    ws.onmessage = (event) => {
        const li = document.createElement("li");
        li.textContent = event.data;
        document.getElementById("messages").appendChild(li);
    };
}

function send_message() {
    const input = document.getElementById("message");
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(input.value);
        input.value = "";
    } else {
        console.warn("WebSocket not connected yet!");
    }
}


