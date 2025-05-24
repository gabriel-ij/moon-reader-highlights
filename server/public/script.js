let allHighlights = [];

async function loadHighlights() {
    const highlightsContainer = document.getElementById('highlights-container');
    
    try {
        const response = await fetch('/api/destaques');
        allHighlights = await response.json();
        
        renderHighlights(allHighlights);
        
    } catch (error) {
        console.error('Erro ao carregar destaques:', error);
        highlightsContainer.innerHTML = '<div class="no-highlights">Erro ao carregar destaques. Por favor, tente novamente mais tarde.</div>';
    }
}

function renderHighlights(highlights) {
    const highlightsContainer = document.getElementById('highlights-container');
    
    if (highlights.length === 0) {
        highlightsContainer.innerHTML = '<div class="no-highlights">Nenhum destaque encontrado. Envie destaques do Moon Reader para começar.</div>';
        return;
    }
    
    // Group highlights by book title and then by chapter
    const groupedHighlights = {};
    
    highlights.forEach(highlight => {
        const bookKey = highlight.title;
        if (!groupedHighlights[bookKey]) {
            groupedHighlights[bookKey] = {
                title: highlight.title,
                author: highlight.author,
                chapters: {}
            };
        }
        
        const chapter = highlight.chapter || 'Sem capítulo';
        if (!groupedHighlights[bookKey].chapters[chapter]) {
            groupedHighlights[bookKey].chapters[chapter] = [];
        }
        
        groupedHighlights[bookKey].chapters[chapter].push(highlight);
    });
    
    // Sort highlights within each chapter by date (newest first)
    Object.values(groupedHighlights).forEach(book => {
        Object.values(book.chapters).forEach(chapterHighlights => {
            chapterHighlights.sort((a, b) => new Date(b.highlightedAt) - new Date(a.highlightedAt));
        });
    });
    
    // Sort books by the date of their most recent highlight
    const sortedBooks = Object.values(groupedHighlights).sort((a, b) => {
        const latestA = Math.max(...Object.values(a.chapters).flat().map(h => new Date(h.highlightedAt)));
        const latestB = Math.max(...Object.values(b.chapters).flat().map(h => new Date(h.highlightedAt)));
        return latestB - latestA;
    });
    
    highlightsContainer.innerHTML = '';
    
    sortedBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-group';
        
        // Calculate date range for the entire book
        const allBookHighlights = Object.values(book.chapters).flat();
        const dates = allBookHighlights.map(h => new Date(h.highlightedAt));
        const latestDate = new Date(Math.max(...dates));
        const earliestDate = new Date(Math.min(...dates));
        
        const formatDate = (date) => date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        const dateRange = dates.length === 1 
            ? formatDate(latestDate)
            : `${formatDate(earliestDate)} - ${formatDate(latestDate)}`;
        
        // Create book header
        const bookHeader = `
            <div class="book-header">
                <div class="book-stats">
                    <div class="highlight-count">${allBookHighlights.length} destaque${allBookHighlights.length > 1 ? 's' : ''}</div>
                    <div class="date-range">${dateRange}</div>
                </div>
                <div class="book-title">${book.title}</div>
                <div class="book-author">— ${book.author}</div>
            </div>
        `;
        
        // Create highlights list grouped by chapters
        const chaptersContent = Object.entries(book.chapters)
            .sort(([_chapterA, highlightsA], [_chapterB, highlightsB]) => {
                // Get the most recent date from each chapter
                const latestA = Math.max(...highlightsA.map(h => new Date(h.highlightedAt)));
                const latestB = Math.max(...highlightsB.map(h => new Date(h.highlightedAt)));
                // Sort by date descending (newest first)
                return latestB - latestA;
            })
            .map(([chapter, chapterHighlights]) => {
                const highlightsList = chapterHighlights.map(highlight => {
                    const date = new Date(highlight.highlightedAt).toLocaleDateString('pt-BR');
                    const time = new Date(highlight.highlightedAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    return `
                        <div class="highlight" data-highlight-id="${highlight.id}" data-date="${date}" data-time="${time}">
                            <div class="highlight-actions">
                                <button class="action-button copy-button" title="Copiar texto" onclick="copyToClipboard('${highlight.text.replace(/'/g, "\\'")}')">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                                <button class="action-button delete-button" title="Excluir destaque" onclick="deleteHighlight(${highlight.id})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                            <div class="highlight-text">${highlight.text}</div>
                            ${highlight.note ? `<div class="highlight-note">Nota: ${highlight.note}</div>` : ''}
                            <div class="date-tooltip">
                                <div class="tooltip-date">${date}</div>
                                <div class="tooltip-time">${time}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="chapter-group">
                        <div class="chapter">${chapter}</div>
                        <div class="highlights-list">${highlightsList}</div>
                    </div>
                `;
            }).join('');
        
        bookElement.innerHTML = bookHeader + chaptersContent;
        highlightsContainer.appendChild(bookElement);
    });
}

// Setup Server-Sent Events connection for real-time updates
function setupSSE() {
    const eventSource = new EventSource('/api/events');
    
    eventSource.onopen = function() {
        console.log('✅ Connected to real-time updates');
        updateConnectionStatus(true);
    };
    
    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'new_highlights') {
                console.log('📖 New highlights received:', data.highlights);
                // Reload highlights to show the new ones
                loadHighlights();
                
                // Show a notification
                showNotification(`Novos destaques adicionados: ${data.highlights.length}`);
            }
        } catch (error) {
            console.error('Error parsing SSE data:', error);
        }
    };
    
    eventSource.onerror = function(event) {
        console.log('❌ SSE connection error, will retry automatically');
        updateConnectionStatus(false);
    };
    
    return eventSource;
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    let statusElement = document.getElementById('connection-status');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'connection-status';
        statusElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusElement);
    }
    
    if (connected) {
        statusElement.textContent = '🟢 online';
        statusElement.style.background = '#d4edda';
        statusElement.style.color = '#155724';
        statusElement.style.border = '1px solid #c3e6cb';
    } else {
        statusElement.textContent = '🔴 offline';
        statusElement.style.background = '#f8d7da';
        statusElement.style.color = '#721c24';
        statusElement.style.border = '1px solid #f5c6cb';
    }
}

// Fallback polling mechanism
let pollingInterval;
function setupPolling() {
    // Clear any existing polling
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    // Poll every 10 seconds as fallback
    pollingInterval = setInterval(() => {
        console.log('🔄 Polling for new highlights...');
        const currentCount = allHighlights.length;
        
        fetch('/api/destaques')
            .then(response => response.json())
            .then(highlights => {
                if (highlights.length > currentCount) {
                    console.log('📖 New highlights found via polling');
                    allHighlights = highlights;
                    renderHighlights(allHighlights);
                    showNotification(`Novos destaques encontrados: ${highlights.length - currentCount}`);
                }
            })
            .catch(error => {
                console.error('Polling error:', error);
            });
    }, 10000);
}

// Show notification for new highlights
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const highlightsContainer = document.getElementById('highlights-container');
    
    // Function to copy text to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // Could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }

    // Function to delete highlight
    async function deleteHighlight(highlightId) {
        try {
            const response = await fetch(`/api/destaques/${highlightId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                // Remove the highlight element from DOM
                const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`);
                if (highlightElement) {
                    highlightElement.remove();
                }
                // Could add a toast notification here
            }
        } catch (error) {
            console.error('Error deleting highlight:', error);
        }
    }

    try {
        const response = await fetch('/api/destaques');
        const highlights = await response.json();
        
        if (highlights.length === 0) {
            highlightsContainer.innerHTML = '<div class="no-highlights">Nenhum destaque encontrado. Envie destaques do Moon Reader para começar.</div>';
            return;
        }
        
        // Group highlights by book title and then by chapter
        const groupedHighlights = {};
        
        highlights.forEach(highlight => {
            const bookKey = highlight.title;
            if (!groupedHighlights[bookKey]) {
                groupedHighlights[bookKey] = {
                    title: highlight.title,
                    author: highlight.author,
                    chapters: {}
                };
            }
            
            const chapter = highlight.chapter || 'Sem capítulo';
            if (!groupedHighlights[bookKey].chapters[chapter]) {
                groupedHighlights[bookKey].chapters[chapter] = [];
            }
            
            groupedHighlights[bookKey].chapters[chapter].push(highlight);
        });
        
        // Sort highlights within each chapter by date (newest first)
        Object.values(groupedHighlights).forEach(book => {
            Object.values(book.chapters).forEach(chapterHighlights => {
                chapterHighlights.sort((a, b) => new Date(b.highlightedAt) - new Date(a.highlightedAt));
            });
        });
        
        // Sort books by the date of their most recent highlight
        const sortedBooks = Object.values(groupedHighlights).sort((a, b) => {
            const latestA = Math.max(...Object.values(a.chapters).flat().map(h => new Date(h.highlightedAt)));
            const latestB = Math.max(...Object.values(b.chapters).flat().map(h => new Date(h.highlightedAt)));
            return latestB - latestA;
        });
        
        highlightsContainer.innerHTML = '';
        
        sortedBooks.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book-group';
            
            // Calculate date range for the entire book
            const allBookHighlights = Object.values(book.chapters).flat();
            const dates = allBookHighlights.map(h => new Date(h.highlightedAt));
            const latestDate = new Date(Math.max(...dates));
            const earliestDate = new Date(Math.min(...dates));
            
            const formatDate = (date) => date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
            
            const dateRange = dates.length === 1 
                ? formatDate(latestDate)
                : `${formatDate(earliestDate)} - ${formatDate(latestDate)}`;
            
            // Create book header
            const bookHeader = `
                <div class="book-header">
                    <div class="book-stats">
                        <div class="highlight-count">${allBookHighlights.length} destaque${allBookHighlights.length > 1 ? 's' : ''}</div>
                        <div class="date-range">${dateRange}</div>
                    </div>
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">— ${book.author}</div>
                </div>
            `;
            
            // Create highlights list grouped by chapters
            const chaptersContent = Object.entries(book.chapters)
                .sort(([_chapterA, highlightsA], [_chapterB, highlightsB]) => {
                    // Get the most recent date from each chapter
                    const latestA = Math.max(...highlightsA.map(h => new Date(h.highlightedAt)));
                    const latestB = Math.max(...highlightsB.map(h => new Date(h.highlightedAt)));
                    // Sort by date descending (newest first)
                    return latestB - latestA;
                })
                .map(([chapter, chapterHighlights]) => {
                    const highlightsList = chapterHighlights.map(highlight => {
                        const date = new Date(highlight.highlightedAt).toLocaleDateString('pt-BR');
                        const time = new Date(highlight.highlightedAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        
                        return `
                            <div class="highlight" data-highlight-id="${highlight.id}" data-date="${date}" data-time="${time}">
                                <div class="highlight-actions">
                                    <button class="action-button copy-button" title="Copiar texto" onclick="copyToClipboard('${highlight.text.replace(/'/g, "\\'")}')">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                    <button class="action-button delete-button" title="Excluir destaque" onclick="deleteHighlight(${highlight.id})">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="highlight-text">${highlight.text}</div>
                                ${highlight.note ? `<div class="highlight-note">Nota: ${highlight.note}</div>` : ''}
                                <div class="date-tooltip">
                                    <div class="tooltip-date">${date}</div>
                                    <div class="tooltip-time">${time}</div>
                                </div>
                            </div>
                        `;
                    }).join('');

                    return `
                        <div class="chapter-group">
                            <div class="chapter">${chapter}</div>
                            <div class="highlights-list">${highlightsList}</div>
                        </div>
                    `;
                }).join('');
            
            bookElement.innerHTML = bookHeader + chaptersContent;
            highlightsContainer.appendChild(bookElement);
        });

        // Make the functions available globally
        window.copyToClipboard = copyToClipboard;
        window.deleteHighlight = deleteHighlight;

        // Setup real-time updates (SSE with polling fallback)
        try {
            setupSSE();
            // Also setup polling as a fallback in case SSE fails
            setTimeout(() => {
                setupPolling();
            }, 5000); // Start polling after 5 seconds as additional backup
        } catch (error) {
            console.error('Failed to setup SSE, using polling only:', error);
            setupPolling();
            updateConnectionStatus(false);
        }
    } catch (error) {
        console.error('Erro ao carregar destaques:', error);
        highlightsContainer.innerHTML = '<div class="no-highlights">Erro ao carregar destaques. Por favor, tente novamente mais tarde.</div>';
    }
}); 