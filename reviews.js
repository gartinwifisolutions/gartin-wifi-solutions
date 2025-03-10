document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList');
    const API_URL = 'https://gartin-wifi-api.onrender.com/api';
    const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

    // Calculate and display average rating
    function updateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) {
            const ratingElement = document.getElementById('average-rating');
            if (ratingElement) {
                ratingElement.innerHTML = ''; // Hide rating if no reviews
            }
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + parseInt(review.rating), 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        const ratingElement = document.getElementById('average-rating');
        if (ratingElement) {
            ratingElement.innerHTML = averageRating;
        }
    }

    // Fetch and display reviews
    async function fetchReviews() {
        try {
            console.log('Fetching reviews from:', `${API_URL}/reviews`);
            const response = await fetch(`${API_URL}/reviews`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
            }
            
            const reviews = await response.json();
            console.log('Received reviews:', reviews);
            
            // Filter out test reviews but keep real customer reviews
            const filteredReviews = reviews.filter(review => {
                const name = review.name.toLowerCase();
                const isTest = name.includes('test') || name.includes('quick');
                console.log(`Review from ${review.name}: ${isTest ? 'filtered out (test)' : 'included'}`);
                return review.approved && !isTest;
            });
            
            console.log('Filtered reviews:', filteredReviews);
            
            // Always update the rating in the navigation
            updateAverageRating(filteredReviews);
            
            // Only try to display reviews if we're on the reviews page
            if (reviewsList) {
                displayReviews(filteredReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            updateAverageRating([]); // Clear rating on error
            if (reviewsList) {
                reviewsList.innerHTML = `
                    <div class="error-message">
                        Unable to load reviews. Please try refreshing the page.
                        <br>
                        Error: ${error.message}
                    </div>
                `;
            }
        }
    }

    // Display reviews
    function displayReviews(reviews) {
        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to leave a review!</p>';
            return;
        }

        // Sort reviews by date (newest first)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                    </div>
                    <div class="review-date">
                        ${new Date(review.date).toLocaleDateString()}
                    </div>
                </div>
                <div class="review-name">${review.name}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');
    }

    // Show error message
    function showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), duration);
    }

    // Show success message
    function showSuccess(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), duration);
    }

    // Initial fetch
    fetchReviews();
    
    // Set up periodic refresh
    setInterval(fetchReviews, REFRESH_INTERVAL);

    // Only set up form handling if we're on the reviews page
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(reviewForm);
            const reviewData = {
                name: formData.get('name'),
                rating: parseInt(formData.get('rating')),
                text: formData.get('text')
            };
            
            try {
                const response = await fetch(`${API_URL}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit review');
                }
                
                showSuccess('Review submitted successfully! It will appear after approval.');
                reviewForm.reset();
                
            } catch (error) {
                console.error('Error submitting review:', error);
                showError('Failed to submit review. Please try again.');
            }
        });
    }
});
