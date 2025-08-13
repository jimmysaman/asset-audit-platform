#!/usr/bin/env node

/**
 * Integration Test Script for Asset Audit Platform
 * 
 * This script tests the basic functionality of the backend API
 * to ensure the system is working correctly.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

let authToken = null;
let testAssetId = null;
let testMovementId = null;

// Test utilities
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testServerHealth() {
  log('Testing server health...', 'info');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, testConfig);
    log('✓ Server is healthy', 'success');
    return true;
  } catch (error) {
    log('✗ Server health check failed', 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

async function testAuthentication() {
  log('Testing authentication...', 'info');
  
  try {
    // Try to login with default admin credentials
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, testConfig);

    if (loginResponse.data.token) {
      authToken = loginResponse.data.token;
      testConfig.headers.Authorization = `Bearer ${authToken}`;
      log('✓ Authentication successful', 'success');
      log(`User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`, 'info');
      return true;
    } else {
      log('✗ No token received', 'error');
      return false;
    }
  } catch (error) {
    log('✗ Authentication failed', 'error');
    log(`Error: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testAssetOperations() {
  log('Testing asset operations...', 'info');
  
  try {
    // Create a test asset
    const createResponse = await axios.post(`${API_BASE_URL}/assets`, {
      name: 'Test Asset',
      assetTag: `TEST-${Date.now()}`,
      category: 'Equipment',
      location: 'Test Location',
      description: 'Test asset for integration testing',
      status: 'Active'
    }, testConfig);

    testAssetId = createResponse.data.id;
    log('✓ Asset created successfully', 'success');
    log(`Asset ID: ${testAssetId}`, 'info');

    // Get the asset
    const getResponse = await axios.get(`${API_BASE_URL}/assets/${testAssetId}`, testConfig);
    if (getResponse.data.name === 'Test Asset') {
      log('✓ Asset retrieved successfully', 'success');
    } else {
      log('✗ Asset data mismatch', 'error');
      return false;
    }

    // Update the asset
    const updateResponse = await axios.put(`${API_BASE_URL}/assets/${testAssetId}`, {
      description: 'Updated test asset description'
    }, testConfig);
    log('✓ Asset updated successfully', 'success');

    // List assets
    const listResponse = await axios.get(`${API_BASE_URL}/assets`, testConfig);
    if (listResponse.data.assets && listResponse.data.assets.length > 0) {
      log('✓ Asset list retrieved successfully', 'success');
      log(`Total assets: ${listResponse.data.total}`, 'info');
    } else {
      log('✗ Asset list is empty', 'warning');
    }

    return true;
  } catch (error) {
    log('✗ Asset operations failed', 'error');
    log(`Error: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testMovementOperations() {
  log('Testing movement operations...', 'info');
  
  if (!testAssetId) {
    log('✗ No test asset available for movement testing', 'error');
    return false;
  }

  try {
    // Create a test movement
    const createResponse = await axios.post(`${API_BASE_URL}/movements`, {
      type: 'Transfer',
      assetId: testAssetId,
      fromLocation: 'Test Location',
      toLocation: 'New Test Location',
      reason: 'Integration testing',
      requestDate: new Date().toISOString()
    }, testConfig);

    testMovementId = createResponse.data.id;
    log('✓ Movement created successfully', 'success');
    log(`Movement ID: ${testMovementId}`, 'info');

    // Get the movement
    const getResponse = await axios.get(`${API_BASE_URL}/movements/${testMovementId}`, testConfig);
    if (getResponse.data.type === 'Transfer') {
      log('✓ Movement retrieved successfully', 'success');
    } else {
      log('✗ Movement data mismatch', 'error');
      return false;
    }

    // List movements
    const listResponse = await axios.get(`${API_BASE_URL}/movements`, testConfig);
    if (listResponse.data.movements && listResponse.data.movements.length > 0) {
      log('✓ Movement list retrieved successfully', 'success');
      log(`Total movements: ${listResponse.data.total}`, 'info');
    } else {
      log('✗ Movement list is empty', 'warning');
    }

    return true;
  } catch (error) {
    log('✗ Movement operations failed', 'error');
    log(`Error: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testUserProfile() {
  log('Testing user profile...', 'info');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, testConfig);
    if (response.data.username) {
      log('✓ User profile retrieved successfully', 'success');
      log(`Username: ${response.data.username}`, 'info');
      log(`Role: ${response.data.role?.name}`, 'info');
      return true;
    } else {
      log('✗ Invalid profile data', 'error');
      return false;
    }
  } catch (error) {
    log('✗ Profile retrieval failed', 'error');
    log(`Error: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function cleanup() {
  log('Cleaning up test data...', 'info');
  
  try {
    // Delete test movement
    if (testMovementId) {
      await axios.delete(`${API_BASE_URL}/movements/${testMovementId}`, testConfig);
      log('✓ Test movement deleted', 'success');
    }

    // Delete test asset
    if (testAssetId) {
      await axios.delete(`${API_BASE_URL}/assets/${testAssetId}`, testConfig);
      log('✓ Test asset deleted', 'success');
    }
  } catch (error) {
    log('⚠ Cleanup failed (this is usually okay)', 'warning');
    log(`Error: ${error.response?.data?.message || error.message}`, 'warning');
  }
}

// Main test runner
async function runIntegrationTests() {
  log('Starting Asset Audit Platform Integration Tests', 'info');
  log('='.repeat(50), 'info');

  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Asset Operations', fn: testAssetOperations },
    { name: 'Movement Operations', fn: testMovementOperations },
    { name: 'User Profile', fn: testUserProfile },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`\nRunning test: ${test.name}`, 'info');
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`✗ Test ${test.name} threw an error: ${error.message}`, 'error');
      failed++;
    }
    
    // Small delay between tests
    await sleep(500);
  }

  // Cleanup
  await cleanup();

  // Results
  log('\n' + '='.repeat(50), 'info');
  log('Integration Test Results:', 'info');
  log(`✓ Passed: ${passed}`, 'success');
  log(`✗ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  log(`Total: ${passed + failed}`, 'info');

  if (failed === 0) {
    log('\n🎉 All integration tests passed!', 'success');
    log('The Asset Audit Platform is working correctly.', 'success');
  } else {
    log('\n❌ Some tests failed.', 'error');
    log('Please check the backend server and database configuration.', 'error');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled rejection: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runIntegrationTests().catch((error) => {
    log(`Test runner error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  testConfig,
  log
};
