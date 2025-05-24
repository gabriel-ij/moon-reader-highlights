document.addEventListener('DOMContentLoaded', async () => {
    const highlightsContainer = document.getElementById('highlights-container');
    
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
            const allHighlights = Object.values(book.chapters).flat();
            const dates = allHighlights.map(h => new Date(h.highlightedAt));
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
                        <div class="highlight-count">${allHighlights.length} destaque${allHighlights.length > 1 ? 's' : ''}</div>
                        <div class="date-range">${dateRange}</div>
                    </div>
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">— ${book.author}</div>
                </div>
            `;
            
            // Create highlights list grouped by chapters
            const chaptersContent = Object.entries(book.chapters)
                .sort(([chapterA], [chapterB]) => chapterA.localeCompare(chapterB))
                .map(([chapter, chapterHighlights]) => {
                    const highlightsList = chapterHighlights.map(highlight => {
                        const date = new Date(highlight.highlightedAt).toLocaleDateString('pt-BR');
                        
                        return `
                            <div class="highlight">
                                <div class="highlight-header">
                                    <div></div>
                                    <div class="highlight-date">${date}</div>
                                </div>
                                <div class="highlight-text">${highlight.text}</div>
                                ${highlight.note ? `<div class="highlight-note">Nota: ${highlight.note}</div>` : ''}
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
        
    } catch (error) {
        console.error('Erro ao carregar destaques:', error);
        highlightsContainer.innerHTML = '<div class="no-highlights">Erro ao carregar destaques. Por favor, tente novamente mais tarde.</div>';
    }
}); 