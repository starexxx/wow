let repoFiles = [];
let username = '';
let repoName = '';

document.getElementById('toggleButton').addEventListener('click', function() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('fetchButton').addEventListener('click', function() {
    const repoUrl = document.getElementById('repoInput').value.trim();
    const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/|$)/;
    const match = repoUrl.match(regex);
    if (match) {
        username = match[1];
        repoName = match[2];
        fetch(`https://api.github.com/repos/${username}/${repoName}/contents`)
            .then(response => response.json())
            .then(data => {
                repoFiles = data;
                let outputText = '';
                data.forEach(file => {
                    outputText += `File: ${file.name}\nURL: ${file.download_url}\n\n`;
                });
                document.getElementById('output').textContent = outputText;
                document.getElementById('viewButton').disabled = false;
                document.getElementById('iframeContainer').style.display = 'none';
                document.getElementById('localHostButton').style.display = 'none';
            })
            .catch(error => {
                document.getElementById('output').textContent = 'Error fetching repository: ' + error.message;
                document.getElementById('viewButton').disabled = true;
                document.getElementById('iframeContainer').style.display = 'none';
                document.getElementById('localHostButton').style.display = 'none';
            });
    } else {
        document.getElementById('output').textContent = 'Invalid GitHub Repository URL';
        document.getElementById('viewButton').disabled = true;
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('localHostButton').style.display = 'none';
    }
});

document.getElementById('viewButton').addEventListener('click', function() {
    if (repoFiles.length === 0) {
        alert('No files fetched. Please fetch the repository first.');
        return;
    }
    const indexFile = repoFiles.find(file => file.name.toLowerCase() === 'index.html');
    if (indexFile) {
        const githubPagesUrl = `https://${username}.github.io/${repoName}/`;
        fetch(githubPagesUrl)
            .then(response => {
                if (response.ok) {
                    document.getElementById('iframeContainer').src = githubPagesUrl;
                    document.getElementById('iframeContainer').style.display = 'block';
                } else {
                    const proxyUrl = `https://cors-anywhere.herokuapp.com/${indexFile.download_url}`;
                    document.getElementById('iframeContainer').src = proxyUrl;
                    document.getElementById('iframeContainer').style.display = 'block';
                }
            });
    } else {
        alert('index.html not found in the repository.');
    }
});

document.getElementById('shareButton').addEventListener('click', function() {
    if (repoFiles.length === 0) {
        alert('No files fetched. Please fetch the repository first.');
        return;
    }
    let rawUrls = '';
    repoFiles.forEach(file => {
        rawUrls += `${file.download_url}\n`;
    });
    navigator.clipboard.writeText(rawUrls).then(() => {
        alert('Raw URLs copied to clipboard!');
    });
});
