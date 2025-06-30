      let ideas = []; // This will store all our ideas locally
        let ideaCounter = 0; // To give each idea a unique ID
        
        // JSON Server URL 
        const baseUrl = "https://json-server-deployment-2-ibe3.onrender.com/ideas"
        
        
        window.addEventListener('load', function() {
            loadIdeasFromServer();
        });
        
        // Function to load ideas from JSON Server
        async function loadIdeasFromServer() {
            try {
                // fetch data from API
                const response = await fetch(baseUrl);
                
                if (!response.ok) {
                    throw new Error('Could not connect to JSON Server. Make sure it\'s running on port 3000!');
                }
                
                const serverIdeas = await response.json();
                ideas = serverIdeas;
                
                // 
                if (ideas.length > 0) {
                    ideaCounter = Math.max(...ideas.map(idea => idea.id)) + 1;
                }
                
                displayIdeas();
                hideError();
                
            } catch (error) {
                console.error('Error loading ideas:', error);
                showError('Could not load ideas from server');
                // 
                displayIdeas();
            }
        }
        
        // Function to save idea to JSON Server
        async function saveIdeaToServer(idea) {
            try {
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(idea)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save idea to server');
                }
                
                return await response.json();
                
            } catch (error) {
                console.error('Error saving idea:', error);
                showError('Could not save idea to server. It will be stored locally only.');
                return idea;
            }
        }
        
        // Function to update idea on server
        async function updateIdeaOnServer(idea) {
            try {
                const response = await fetch(`${baseUrl}/${idea.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(idea)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update idea on server');
                }
                
                return await response.json();
                
            } catch (error) {
                console.error('Error updating idea:', error);
                showError('Could not update idea on server.');
                return idea;
            }
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function hideError() {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.style.display = 'none';
        }
        
        async function addIdea() {
            // Get the values from the form
            const platform = document.getElementById('platform').value;
            const contentType = document.getElementById('contentType').value;
            const ideaText = document.getElementById('ideaText').value;
            
            // Check if all fields are filled
            if (!platform || !contentType || !ideaText) {
                alert('Please fill in all fields!');
                return;
            }
            
            // Create a new idea object
            const newIdea = {
                id: ideaCounter++,
                platform: platform,
                contentType: contentType,
                text: ideaText,
                status: 'not-posted', // Default status
                rating: 0,
                comments: ''
            };
            
            // Try to save to server first
            const savedIdea = await saveIdeaToServer(newIdea);
            
            // Add to our local ideas array
            ideas.push(savedIdea);
            
            // Clear the form
            document.getElementById('platform').value = '';
            document.getElementById('contentType').value = '';
            document.getElementById('ideaText').value = '';
            
            // Update the display
            displayIdeas();
        }
        
        // Helper function to create elements more easily
        function createElement(tag, className = '', textContent = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = textContent;
            return element;
        }
        
        // Helper function to create a span with badge styling
        function createBadge(text, className) {
            const badge = createElement('span', className, text);
            return badge;
        }
        
        // Helper function to create status badge
        function createStatusBadge(status) {
            const statusText = status === 'posted' ? 'POSTED' : 'NOT POSTED';
            const statusClass = status === 'posted' ? 'status-badge status-posted' : 'status-badge status-not-posted';
            return createBadge(statusText, statusClass);
        }
        
        // Helper function to create status buttons
        function createStatusButton(ideaId, status, buttonText) {
            const button = createElement('button', 'btn-small', buttonText);
            button.addEventListener('click', () => updateStatus(ideaId, status));
            return button;
        }
        
        // Helper function to create star rating
        function createStarRating(ideaId, currentRating) {
            const starsContainer = createElement('div', 'rating-stars');
            
            for (let i = 1; i <= 5; i++) {
                const star = createElement('span', 'star', '★');
                if (i <= currentRating) {
                    star.classList.add('active');
                }
                star.addEventListener('click', () => setRating(ideaId, i));
                starsContainer.appendChild(star);
            }
            
            return starsContainer;
        }
        
        // Helper function to create performance section
        function createPerformanceSection(idea) {
            const performanceDiv = createElement('div', 'performance-section');
            
            // Rating label
            const ratingLabel = createElement('label', '', 'Rate Performance:');
            performanceDiv.appendChild(ratingLabel);
            
            // Stars
            const stars = createStarRating(idea.id, idea.rating);
            performanceDiv.appendChild(stars);
            
            // Comments label
            const commentsLabel = createElement('label', '', 'Performance Comments:');
            performanceDiv.appendChild(commentsLabel);
            
            // Comments textarea
            const commentsTextarea = createElement('textarea', 'performance-comments');
            commentsTextarea.placeholder = 'How did this post perform?';
            commentsTextarea.value = idea.comments;
            commentsTextarea.addEventListener('change', (e) => updateComments(idea.id, e.target.value));
            performanceDiv.appendChild(commentsTextarea);
            
            return performanceDiv;
        }
        
        // Helper function to create a single idea card
        function createIdeaCard(idea) {
            const card = createElement('div', 'idea-card');
            
            // Header section
            const header = createElement('div', 'idea-header');
            
            const badgesDiv = createElement('div');
            badgesDiv.appendChild(createBadge(idea.platform, 'platform-badge'));
            badgesDiv.appendChild(createBadge(idea.contentType, 'content-type'));
            
            header.appendChild(badgesDiv);
            header.appendChild(createStatusBadge(idea.status));
            
            // Idea text
            const ideaTextDiv = createElement('div', 'idea-text', idea.text);
            
            // Status section
            const statusSection = createElement('div', 'status-section');
            
            // Status controls
            const statusControls = createElement('div', 'status-controls');
            const statusLabel = createElement('label', '', 'Status:');
            statusControls.appendChild(statusLabel);
            statusControls.appendChild(createStatusButton(idea.id, 'not-posted', 'Not Posted'));
            statusControls.appendChild(createStatusButton(idea.id, 'posted', 'Posted'));
            
            statusSection.appendChild(statusControls);
            
            // Performance section (only if posted)
            if (idea.status === 'posted') {
                statusSection.appendChild(createPerformanceSection(idea));
            }
            
            // Assemble the card
            card.appendChild(header);
            card.appendChild(ideaTextDiv);
            card.appendChild(statusSection);
            
            return card;
        }
        
        function displayIdeas() {
            const container = document.getElementById('ideasContainer');
            
            // Clear existing content
            container.textContent = '';
            
            if (ideas.length === 0) {
                const emptyMessage = createElement('div', 'empty-message', 'Add your first idea above');
                container.appendChild(emptyMessage);
                return;
            }
            
            // Create the grid container
            const grid = createElement('div', 'ideas-grid');
            
            // Add each idea card to the grid
            ideas.forEach(idea => {
                const card = createIdeaCard(idea);
                grid.appendChild(card);
            });
            
            container.appendChild(grid);
        }
        
        async function updateStatus(ideaId, newStatus) {
            // Find the idea and update its status
            const idea = ideas.find(idea => idea.id === ideaId);
            if (idea) {
                idea.status = newStatus;
                
                // Try to update on server
                await updateIdeaOnServer(idea);
                
                displayIdeas(); // Refresh the display
            }
        }
        
        async function setRating(ideaId, rating) {
            // Find the idea and update its rating
            const idea = ideas.find(idea => idea.id === ideaId);
            if (idea) {
                idea.rating = rating;
                
                // Try to update on server
                await updateIdeaOnServer(idea);
                
                displayIdeas(); // Refresh the display
            }
        }
        
        async function updateComments(ideaId, comments) {
            // Find the idea and update its comments
            const idea = ideas.find(idea => idea.id === ideaId);
            if (idea) {
                idea.comments = comments;
                
                // Try to update on server
                await updateIdeaOnServer(idea);
            }
        }