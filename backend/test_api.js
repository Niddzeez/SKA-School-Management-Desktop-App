const jwt = require('jsonwebtoken');
const token = jwt.sign(
    { userId: 'test-admin', role: 'ADMIN' },
    'ska-jwt-secret-change-in-production-2025',
    { expiresIn: '1h' }
);


const baseURL = 'http://localhost:4000/api';
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

async function runTest() {
    try {
        console.log('1. Get Classes to find a Class ID...');
        let res = await fetch(`${baseURL}/classes`, { headers });
        let data = await res.json();
        const classId = data[0]._id;
        console.log('Class ID:', classId);

        console.log('\n2. Get Academic Years to find an Academic Session ID...');
        res = await fetch(`${baseURL}/academic-years`, { headers });
        data = await res.json();
        const sessionId = data[0].id;
        console.log('Session ID:', sessionId);

        console.log('\n3. Create new Fee Structure...');
        res = await fetch(`${baseURL}/fee-structures`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ classId: classId, academicSessionId: sessionId })
        });
        data = await res.json();
        const structureId = data.id;
        console.log('Created:', data);

        console.log('\n4. Add Component to Fee Structure...');
        res = await fetch(`${baseURL}/fee-structures/${structureId}/components`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'Tuition Fee', amount: 5000, mandatory: true })
        });
        data = await res.json();
        console.log('Updated with component:', JSON.stringify(data, null, 2));

        const componentId = data.components[0].id;

        console.log('\n5. Remove Component from Fee Structure...');
        res = await fetch(`${baseURL}/fee-structures/${structureId}/components/${componentId}`, {
            method: 'DELETE',
            headers
        });
        data = await res.json();
        console.log('Removed component:', JSON.stringify(data, null, 2));

        console.log('\n6. Activate Fee Structure...');
        res = await fetch(`${baseURL}/fee-structures/${structureId}/activate`, {
            method: 'POST',
            headers
        });
        data = await res.json();
        console.log('Activated:', data);

    } catch (e) {
        console.error('Test failed:', e);
    }
}

runTest();
