/**
 * Simple test script to check the therapist routes
 */
const fetch = require('node-fetch');

async function testRoutes() {
  try {
    // Test therapist routes
    const response = await fetch('http://localhost:5000/api/therapist/clients');
    const data = await response.json();
    console.log('Response from /api/therapist/clients:', data);
  } catch (error) {
    console.error('Error testing routes:', error.message);
  }
}

testRoutes();