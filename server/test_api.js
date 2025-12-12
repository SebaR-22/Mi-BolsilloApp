/**
 * Manual Test File for API Endpoints
 * Use this to manually test the API endpoints with Postman, curl, or similar tools
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

class APITester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.testResults = [];
    }

    async test(name, method, endpoint, data = null, expectedStatus = 200) {
        try {
            console.log(`\n📝 Testing: ${name}`);
            console.log(`   ${method} ${this.baseUrl}${endpoint}`);
            
            const url = `${this.baseUrl}${endpoint}`;
            let response;

            if (method === 'GET') {
                response = await axios.get(url);
            } else if (method === 'POST') {
                response = await axios.post(url, data);
            } else if (method === 'PUT') {
                response = await axios.put(url, data);
            } else if (method === 'DELETE') {
                response = await axios.delete(url);
            }

            if (response.status === expectedStatus) {
                console.log(`✓ PASSED (Status: ${response.status})`);
                console.log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                this.testResults.push({ name, status: 'PASSED' });
            } else {
                console.log(`✗ FAILED (Expected: ${expectedStatus}, Got: ${response.status})`);
                this.testResults.push({ name, status: 'FAILED' });
            }
        } catch (error) {
            const status = error.response?.status || 'ERROR';
            const message = error.response?.data?.message || error.message;
            
            if (error.response?.status === expectedStatus) {
                console.log(`✓ PASSED (Status: ${status})`);
                console.log(`  Error: ${message}`);
                this.testResults.push({ name, status: 'PASSED' });
            } else {
                console.log(`✗ FAILED: ${message}`);
                this.testResults.push({ name, status: 'FAILED' });
            }
        }
    }

    printSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("TEST SUMMARY");
        console.log("=".repeat(60));
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASSED' ? '✓' : '✗';
            console.log(`${icon} ${result.name}: ${result.status}`);
        });
        
        console.log("=".repeat(60));
        console.log(`Total: ${passed} passed, ${failed} failed`);
        console.log("=".repeat(60));
    }
}

async function runTests() {
    console.log("🚀 Starting API Tests...");
    console.log(`Base URL: ${API_BASE_URL}\n`);

    const tester = new APITester(API_BASE_URL);

    // Auth Tests
    await tester.test(
        'Register User',
        'POST',
        '/auth/register',
        {
            username: 'testuser',
            email: `testuser${Date.now()}@test.com`,
            password: 'password123'
        },
        201
    );

    // Chat Tests
    await tester.test(
        'Send Chat Message',
        'POST',
        '/chat',
        { message: 'Hello, how are you?' },
        200
    );

    await tester.test(
        'Send Chat with empty message',
        'POST',
        '/chat',
        { message: '' },
        400
    );

    // Transaction Tests (if implemented)
    await tester.test(
        'Get Transactions',
        'GET',
        '/transactions',
        null,
        200
    );

    tester.printSummary();
}

// Check if server is running
axios.get(`${API_BASE_URL.replace('/api', '')}`)
    .then(() => {
        runTests().catch(error => {
            console.error('Test error:', error.message);
            process.exit(1);
        });
    })
    .catch(() => {
        console.error(`❌ Cannot connect to server at ${API_BASE_URL.replace('/api', '')}`);
        console.error('Make sure the server is running: npm run dev');
        process.exit(1);
    });
