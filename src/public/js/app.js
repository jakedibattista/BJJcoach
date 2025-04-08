// Video URL handling
document.getElementById('video-url').addEventListener('change', function(e) {
    const videoId = extractVideoId(e.target.value);
    if (videoId) {
        const container = document.getElementById('video-container');
        container.innerHTML = `
            <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
    }
});

// Extract YouTube video ID from URL
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Analysis controls
document.querySelector('button.bg-green-500').addEventListener('click', startAnalysis);
document.querySelector('button.bg-red-500').addEventListener('click', stopAnalysis);
document.querySelector('button.bg-blue-500').addEventListener('click', resetAnalysis);
document.querySelector('button.bg-purple-500').addEventListener('click', exportAnalysis);

async function startAnalysis() {
    const videoUrl = document.getElementById('video-url').value;
    if (!videoUrl) {
        alert('Please enter a YouTube URL first');
        return;
    }

    try {
        const response = await fetch('/api/analysis/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ videoUrl })
        });

        if (!response.ok) throw new Error('Analysis failed to start');

        const data = await response.json();
        updateAnalysisResults('Analysis started...');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to start analysis. Please try again.');
    }
}

function stopAnalysis() {
    updateAnalysisResults('Analysis stopped');
}

function resetAnalysis() {
    document.getElementById('video-url').value = '';
    document.getElementById('video-container').innerHTML = `
        <p class="text-center text-gray-600 mt-20">Enter a YouTube URL to begin analysis</p>
    `;
    updateAnalysisResults('Analysis results will appear here...');
}

function exportAnalysis() {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!');
}

function updateAnalysisResults(message) {
    const results = document.getElementById('analysis-results');
    results.innerHTML = `<p class="text-gray-600">${message}</p>`;
}

function getToken() {
    // TODO: Implement proper token management
    return localStorage.getItem('token');
} 