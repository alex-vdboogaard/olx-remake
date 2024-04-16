//count notifications
async function notificationCount(id) {
    fetch(`/api/notificationcount?id=${id}`)
        .then(response => response.json())
        .then(count => {
            if (!isNaN(count) && parseInt(count) > 0) {
                document.getElementById("not-count").classList.toggle("hidden");
                document.getElementById("not-count").textContent = `${count}`;
            };
        })
        .catch(error => console.error("Error fetching count:", error));
}