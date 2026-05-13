async function loadStatus() {
  const response = await fetch('/api/status');

  const data = await response.json();

  document.getElementById('email').innerText = data.email;

  document.getElementById('targetLink').innerText = data.target;

  document.getElementById('targetLink').href = data.target;

  if (data.state) {
    document.getElementById('lastUpdated').innerText =
      new Date(data.state.updatedAt).toLocaleString();
  }

  const logsContainer = document.getElementById('logs');

  logsContainer.innerHTML = '';

  data.logs.forEach(log => {
    const item = document.createElement('div');

    item.className = 'log-item';

    item.innerHTML = `
      <div class="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <div class="text-lg font-semibold capitalize">
            ${log.type}
          </div>

          <div class="text-zinc-400 text-sm mt-1">
            ${new Date(log.time).toLocaleString()}
          </div>
        </div>
      </div>

      <p class="text-zinc-300 mb-4">
        ${log.message}
      </p>
    `;

    logsContainer.appendChild(item);
  });
}

loadStatus();

setInterval(loadStatus, 5000);
