const fetch = require('node-fetch');

const API_URL = 'https://gartin-wifi-api.onrender.com/api';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const TEST_REVIEW_IDS = [
    '67cefa4bcb752575d3ff09e0', // John G
    '67cef858cb752575d3ff09d8', // Quick Test
    '67cef5b6f7aa3369777013bd', // Test Review
    '67cef46df7aa3369777013b9', // Test User (auto-approval)
    '67cee55d3fd53b8f26bb8708'  // Test User (unapproved)
];

async function deleteReview(reviewId) {
    try {
        const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ADMIN_API_KEY
            },
            body: JSON.stringify({ approved: false })
        });

        if (!response.ok) {
            throw new Error(`Failed to delete review ${reviewId}: ${response.status} ${response.statusText}`);
        }

        console.log(`Successfully removed review ${reviewId}`);
    } catch (error) {
        console.error(`Error removing review ${reviewId}:`, error.message);
    }
}

async function cleanupReviews() {
    console.log('Starting review cleanup...');
    
    for (const reviewId of TEST_REVIEW_IDS) {
        await deleteReview(reviewId);
    }

    console.log('Review cleanup completed');
}

cleanupReviews().catch(console.error);
