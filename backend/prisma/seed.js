"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Clear existing data
    await prisma.task.deleteMany();
    // Create sample tasks
    const tasks = await prisma.task.createMany({
        data: [
            {
                title: 'Complete project documentation',
                description: 'Write comprehensive README and API documentation',
                completed: false,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
            {
                title: 'Review code quality',
                description: 'Conduct thorough code review and refactoring',
                completed: false,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            },
            {
                title: 'Setup CI/CD pipeline',
                description: 'Configure automated testing and deployment',
                completed: true,
            },
            {
                title: 'Design system implementation',
                description: 'Create reusable UI components and design tokens',
                completed: false,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            },
            {
                title: 'Database optimization',
                description: 'Optimize database queries and add proper indexing',
                completed: true,
            },
            {
                title: 'Security audit',
                description: 'Perform comprehensive security assessment',
                completed: false,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            },
        ],
    });
    console.log(`✅ Seeded ${tasks.count} tasks successfully`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
});
