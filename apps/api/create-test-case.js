const { PrismaClient } = require('@prisma/client');

const client = new PrismaClient();

async function createTestCase() {
  try {
    // Create a test user
    const user = await client.user.findFirst();
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }
    
    console.log(`✅ Found user: ${user.name} (${user.id})`);

    // Create a test case
    const testCase = await client.case.create({
      data: {
        title: 'Test Case for Debugging',
        createdByUserId: user.id,
      },
    });

    console.log(`✅ Created test case: ${testCase.id}`);

    // Create sides for the case
    await client.side.createMany({
      data: [
        {
          caseId: testCase.id,
          userId: user.id,
          role: 'CLAIMANT',
        },
        {
          caseId: testCase.id,
          userId: user.id, // Same user for testing
          role: 'RESPONDENT',
        },
      ],
    });

    console.log(`✅ Created sides for test case`);

    // Create some test turns
    await client.turn.createMany({
      data: [
        {
          caseId: testCase.id,
          sideId: (await client.side.findFirst({ where: { caseId: testCase.id, role: 'CLAIMANT' } })).id,
          message: 'This is the claimant argument.',
          order: 1,
        },
        {
          caseId: testCase.id,
          sideId: (await client.side.findFirst({ where: { caseId: testCase.id, role: 'RESPONDENT' } })).id,
          message: 'This is the respondent response.',
          order: 2,
        },
      ],
    });

    console.log(`✅ Created test turns`);
    console.log(`🎯 Test case URL: http://localhost:3000/cases/${testCase.id}/argue`);

  } catch (error) {
    console.error('❌ Error creating test case:', error);
  } finally {
    await client.$disconnect();
  }
}

createTestCase();
